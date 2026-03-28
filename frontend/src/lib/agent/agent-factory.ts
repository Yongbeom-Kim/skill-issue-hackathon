import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { DynamicStructuredTool } from "@langchain/core/tools";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { z } from "zod";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const TINYFISH_API_KEY = import.meta.env.VITE_TINYFISH_API_KEY;
const TINYFISH_BASE_URL = "https://agent.tinyfish.ai/v1";
const WEB_SEARCH_ONLY = import.meta.env.VITE_WEB_SEARCH_ONLY === "true";

/**
 * Domains that require stealth browser_profile due to anti-bot protection,
 * heavy JS rendering, or login walls. Single source of truth.
 */
export const STEALTH_DOMAINS = [
  // Social media (heavy JS, anti-bot, login walls)
  "reddit.com",
  "tiktok.com",
  "xiaohongshu.com",
  "instagram.com",
  // Flights (Cloudflare, DataDome, bot detection)
  "google.com/travel/flights",
  "kayak.com",
  "delta.com",
  "united.com",
  "southwest.com",
  "ryanair.com",
  "aa.com",
  // Accommodation (React SPAs, anti-bot)
  "airbnb.com",
  "booking.com",
  "rakuten.co.jp",
  "jalan.net",
  // Local/regional (login-gated, geo-restricted)
  "tabelog.com",
  "blog.naver.com",
  "map.naver.com",
] as const;

const webSearchTool = new DynamicStructuredTool({
  name: "web_search",
  description:
    "Fast web search using OpenAI. Use this for general information gathering — " +
    "travel tips, reviews, recommendations, opening hours, prices. " +
    "Much faster than tinyfish_web_automation. Use tinyfish only when you need to " +
    "interact with a specific page (login, fill forms, navigate dynamic sites, scrape structured data from a specific URL).",
  schema: z.object({
    query: z.string().describe("The search query"),
  }),
  func: async ({ query }) => {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        tools: [{ type: "web_search_preview" }],
        input: query,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return JSON.stringify({ error: `OpenAI search error: ${response.status}`, details: text });
    }

    const data = await response.json();
    // Extract the text output from the response
    const outputItems = data.output || [];
    const textContent = outputItems
      .filter((item: Record<string, string>) => item.type === "message")
      .map((item: Record<string, unknown>) =>
        ((item.content as Array<Record<string, string>>) || [])
          .filter((c) => c.type === "output_text")
          .map((c) => c.text)
          .join("\n")
      )
      .join("\n");

    return textContent || JSON.stringify(data);
  },
});

// --- Structured output schema ---
const RatingSchema = z.object({
  score: z.number().nullable().describe("Rating score e.g. 4.5 out of 5, or null if not found"),
  review_count: z.number().nullable().describe("Number of reviews, or null if not found"),
  url: z.string().nullable().describe("Actual URL to the rating page, or null"),
});

const SocialCommentSchema = z.object({
  text: z.string().describe("Exact verbatim quote from a real person"),
  source: z.string().describe("Where you found it, e.g. Reddit r/travel, TripAdvisor, TikTok"),
  author: z.string().describe("Real username e.g. u/username, @handle"),
  upvotes: z.number().optional().describe("Upvote count if available"),
  date: z.string().optional().describe("Date if available, e.g. 2025-12"),
});

const LocationImageSchema = z.object({
  url: z.string().describe("Real image URL found in search results"),
  source: z.string().describe("Where you found the image"),
});

const LocationSchema = z.object({
  name: z.string().describe("Location name"),
  category: z.enum(["surf", "food", "temple", "beach", "nightlife", "nature", "shopping"]).describe("Location category"),
  summary: z.string().describe("One line — why go or why skip"),
  ratings: z.object({
    google: RatingSchema,
    tripadvisor: RatingSchema,
  }),
  social_comments: z.array(SocialCommentSchema).describe("Real comments from real people. Never fabricate."),
  images: z.array(LocationImageSchema).default([]).describe("Leave empty — images are added separately."),
  best_time: z.string().describe("When to visit"),
  warnings: z.array(z.string()).describe("Real warnings: construction, scams, crowds, closures"),
  opening_hours: z.string().nullable().describe("Opening hours or null"),
  entry_price: z.string().nullable().describe("Entry price or null"),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  source_count: z.number().describe("Total number of reviews/comments analyzed for this location"),
});

const DiscoveryResultSchema = z.object({
  locations: z.array(LocationSchema).min(5).describe("Minimum 5 locations covering all user interests"),
});

const submitDiscoveryResultTool = new DynamicStructuredTool({
  name: "submit_discovery_result",
  description:
    "Submit the final discovery results. You MUST call this tool as your final action " +
    "with all the locations you found. This ensures the output is properly structured.",
  schema: DiscoveryResultSchema,
  func: async (input) => {
    return JSON.stringify(input.locations);
  },
});

// --- Shared TinyFish async+poll helper ---
async function runTinyfish(url: string, goal: string, browser_profile = "lite"): Promise<string> {
  const startRes = await fetch(`${TINYFISH_BASE_URL}/automation/run-async`, {
    method: "POST",
    headers: {
      "X-API-Key": TINYFISH_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, goal, browser_profile }),
  });

  if (!startRes.ok) {
    return JSON.stringify({ error: `TinyFish API error: ${startRes.status}` });
  }

  const startBody = await startRes.json();
  const runId = startBody.run_id;
  if (!runId) {
    return JSON.stringify({ error: "No run_id returned", details: startBody });
  }

  const maxAttempts = 24;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 5_000));
    const pollRes = await fetch(`${TINYFISH_BASE_URL}/runs/${runId}`, {
      headers: { "X-API-Key": TINYFISH_API_KEY },
    });
    if (!pollRes.ok) continue;
    const pollBody = await pollRes.json();
    if (pollBody.status === "COMPLETED") {
      return JSON.stringify(pollBody.resultJson ?? pollBody.result ?? pollBody);
    }
    if (pollBody.status === "FAILED") {
      return JSON.stringify({ error: pollBody.message || "TinyFish run failed" });
    }
  }
  return JSON.stringify({ error: "TinyFish run timed out after 2 minutes" });
}

// --- Single TinyFish call tool ---
const tinyfishRunTool = new DynamicStructuredTool({
  name: "tinyfish_web_automation",
  description:
    "Run a SINGLE browser automation task using TinyFish. " +
    "For scraping multiple platforms at once, use scrape_multiple_platforms instead.",
  schema: z.object({
    url: z.string().describe("The starting URL for the browser agent"),
    goal: z.string().describe("Natural language instruction for the page"),
    browser_profile: z.enum(["lite", "stealth"]).optional().default("lite"),
  }),
  func: async ({ url, goal, browser_profile }) => runTinyfish(url, goal, browser_profile),
});

// --- Parallel multi-platform scrape tool ---
const scrapeMultiplePlatformsTool = new DynamicStructuredTool({
  name: "scrape_multiple_platforms",
  description:
    "Scrape MULTIPLE websites IN PARALLEL using TinyFish. Much faster than calling tinyfish_web_automation multiple times. " +
    "Use this to scrape TripAdvisor, Google Maps, Reddit, Xiaohongshu, etc. all at once. " +
    "Each task runs as a separate browser agent simultaneously.",
  schema: z.object({
    tasks: z.array(z.object({
      url: z.string().describe("The starting URL"),
      goal: z.string().describe("What to extract from this site"),
      browser_profile: z.enum(["lite", "stealth"]).optional().default("lite"),
      label: z.string().describe("A label for this task, e.g. 'tripadvisor', 'reddit', 'google_maps'"),
    })).describe("Array of scraping tasks to run in parallel"),
  }),
  func: async ({ tasks }) => {
    const results = await Promise.all(
      tasks.map(async (task) => {
        const result = await runTinyfish(task.url, task.goal, task.browser_profile);
        return { label: task.label, result: JSON.parse(result) };
      })
    );
    return JSON.stringify(results);
  },
});

interface CreateAgentOptions {
  prompt?: string;
  tools?: StructuredToolInterface[];
}

export function createTinyfishAgent(options: CreateAgentOptions = {}) {
  const { prompt, tools = [] } = options;

  const llm = new ChatOpenAI({
    model: "gpt-4o",
    apiKey: OPENAI_API_KEY,
  });

  const agent = createReactAgent({
    llm,
    tools: [
      webSearchTool,
      ...(WEB_SEARCH_ONLY ? [webSearchTool, scrapeMultiplePlatformsTool] : [tinyfishRunTool, scrapeMultiplePlatformsTool]),
      submitDiscoveryResultTool,
      ...tools,
    ],
    ...(prompt ? { prompt } : {}),
  });

  return async (userMessage: string) => {
    const result = await agent.invoke({
      messages: [{ role: "user", content: userMessage }],
    });

    // Look for submit_discovery_result tool output in messages (walk backwards)
    for (let i = result.messages.length - 1; i >= 0; i--) {
      const msg = result.messages[i];
      if (msg.name === "submit_discovery_result" && msg.content) {
        return typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content);
      }
    }

    // Fallback to last message if no structured result found
    const lastMessage = result.messages[result.messages.length - 1];
    return typeof lastMessage.content === "string"
      ? lastMessage.content
      : JSON.stringify(lastMessage.content);
  };
}

// Default agent for backwards compatibility
export const runTinyfishAgent = createTinyfishAgent();
