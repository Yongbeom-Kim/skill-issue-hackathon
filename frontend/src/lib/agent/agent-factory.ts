import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { DynamicStructuredTool } from "@langchain/core/tools";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { z } from "zod";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const TINYFISH_API_KEY = import.meta.env.VITE_TINYFISH_API_KEY;
const TINYFISH_BASE_URL = "https://agent.tinyfish.ai/v1";

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

const tinyfishRunTool = new DynamicStructuredTool({
  name: "tinyfish_web_automation",
  description:
    "Run a browser automation task using TinyFish. Send a URL and a natural-language goal, " +
    "and get back structured JSON extracted from the page. Handles real browser navigation, " +
    "form filling, dynamic content, and anti-bot detection.",
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
        "Browser mode. Use 'stealth' for sites with bot detection (Cloudflare, DataDome). Default: 'lite'"
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
    tools: [webSearchTool, tinyfishRunTool, ...tools],
    ...(prompt ? { prompt } : {}),
  });

  return async (userMessage: string) => {
    const result = await agent.invoke({
      messages: [{ role: "user", content: userMessage }],
    });

    const lastMessage = result.messages[result.messages.length - 1];
    return typeof lastMessage.content === "string"
      ? lastMessage.content
      : JSON.stringify(lastMessage.content);
  };
}

// Default agent for backwards compatibility
export const runTinyfishAgent = createTinyfishAgent();
