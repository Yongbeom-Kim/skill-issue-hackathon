import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { DynamicStructuredTool } from "@langchain/core/tools";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { z } from "zod";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const TINYFISH_API_KEY = import.meta.env.VITE_TINYFISH_API_KEY;
const TINYFISH_BASE_URL = "https://agent.tinyfish.ai/v1";

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
  images: z.array(LocationImageSchema).describe("Real image URLs. Never use example.com or fake URLs."),
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

const tinyfishRunTool = new DynamicStructuredTool({
  name: "tinyfish_web_automation",
  description:
    "Run a browser automation task using TinyFish. Send a URL and a natural-language goal, " +
    "and get back structured JSON extracted from the page. Handles real browser navigation, " +
    "form filling, dynamic content, and anti-bot detection. " +
    "IMPORTANT: Use browser_profile='stealth' for these domains (they have anti-bot/JS walls): " +
    "reddit.com, tiktok.com, xiaohongshu.com, instagram.com, google.com/travel/flights, " +
    "kayak.com, airbnb.com, booking.com, airline sites (delta.com, united.com, southwest.com, " +
    "ryanair.com, aa.com), rakuten.co.jp, jalan.net, tabelog.com, blog.naver.com, map.naver.com.",
  schema: z.object({
    url: z.string().describe("The starting URL for the browser agent"),
    goal: z
      .string()
      .describe(
        "Natural language instruction describing what to extract or do on the page. " +
          "Include an output schema for best results, e.g. 'Extract pricing as JSON: [{\"name\": str, \"price\": str}]'"
      ),
    browser_profile: z
      .enum(["lite", "stealth"])
      .optional()
      .default("lite")
      .describe(
        "Browser mode. MUST use 'stealth' for anti-bot sites: reddit.com, tiktok.com, " +
          "xiaohongshu.com, instagram.com, google.com/travel/flights, kayak.com, airbnb.com, " +
          "booking.com, airline sites, tabelog.com, naver, rakuten.co.jp, jalan.net. Default: 'lite'"
      ),
  }),
  func: async ({ url, goal, browser_profile }) => {
    const response = await fetch(`${TINYFISH_BASE_URL}/automation/run-sse`, {
      method: "POST",
      headers: {
        "X-API-Key": TINYFISH_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, goal, browser_profile }),
    });

    if (!response.ok) {
      return JSON.stringify({
        error: `TinyFish API error: ${response.status} ${response.statusText}`,
      });
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return JSON.stringify({ error: "No response body" });
    }

    const decoder = new TextDecoder();
    let resultJson: unknown = null;
    let lastMessage = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const event = JSON.parse(line.slice(6));

          if (event.type === "COMPLETE" && event.status === "COMPLETED") {
            resultJson = event.resultJson;
          }
          if (event.type === "ERROR" || event.status === "FAILED") {
            return JSON.stringify({
              error: event.message || "TinyFish run failed",
            });
          }
          if (event.message) {
            lastMessage = event.message;
          }
        } catch {
          // skip malformed lines
        }
      }
    }

    if (resultJson !== null) {
      return JSON.stringify(resultJson);
    }
    return JSON.stringify({
      error: "No result received",
      lastMessage,
    });
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
    tools: [webSearchTool, tinyfishRunTool, submitDiscoveryResultTool, ...tools],
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
