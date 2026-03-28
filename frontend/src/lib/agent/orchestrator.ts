import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { createTinyfishAgent } from "./agent-factory";
import { createResearchAgent } from "./research-agent";
import { LOGISTICS_PROMPT } from "./prompts/logistics-agent";
import { ORCHESTRATOR_PROMPT } from "./prompts/orchestrator-agent";
import { writeFile, mkdir } from "fs/promises";

export function createTripPlannerOrchestrator() {
  const researchRunner = createResearchAgent();
  const logisticsRunner = createTinyfishAgent({ prompt: LOGISTICS_PROMPT });

  const callResearchAgent = new DynamicStructuredTool({
    name: "call_research_agent",
    description:
      "Dispatch a query to the travel research agent. " +
      "The research agent searches travel websites, booking platforms, review sites, and local-language sources " +
      "(Tabelog, Naver, Xiaohongshu) to gather destination info, dining recommendations, booking options, " +
      "pricing data, tips, crowd data, and hidden gems. " +
      "It knows the best data source for each category (flights, hotels, activities, transport, reviews). " +
      "Send specific, targeted queries for best results.",
    schema: z.object({
      query: z
        .string()
        .describe(
          "The research query to send to the agent. Be specific — e.g. " +
            "'Find top-rated ramen shops in Shinjuku with crowd-avoidance tips from Reddit and Tabelog' or " +
            "'Compare flight prices SFO to NRT in April from Google Flights and Skyscanner'"
        ),
    }),
    func: async ({ query }) => {
      return await researchRunner(query);
    },
  });

  const callLogisticsAgent = new DynamicStructuredTool({
    name: "call_logistics_agent",
    description:
      "Dispatch a query to the travel logistics agent. " +
      "The logistics agent scrapes travel sites (Google Flights, Booking.com, Rome2Rio, etc.) " +
      "to find flights, hotels, transport options, weather, and practical travel info. " +
      "Send specific, targeted queries for best results.",
    schema: z.object({
      query: z
        .string()
        .describe(
          "The logistics query to send to the agent. Be specific — e.g. " +
            "'Find round-trip flights SFO to NRT, April 10-15, budget under $800'"
        ),
    }),
    func: async ({ query }) => {
      return await logisticsRunner(query);
    },
  });

  const writeMarkdownFile = new DynamicStructuredTool({
    name: "write_markdown_file",
    description:
      "Write the final trip plan to a markdown file. " +
      "Use this after synthesizing all research and logistics results into a complete itinerary.",
    schema: z.object({
      filename: z
        .string()
        .describe(
          "The filename for the trip plan, e.g. 'tokyo-april-2026-trip-plan.md'"
        ),
      content: z
        .string()
        .describe("The full markdown content of the trip plan"),
    }),
    func: async ({ filename, content }) => {
      const outputDir = "trip-plans";
      await mkdir(outputDir, { recursive: true });
      const filepath = `${outputDir}/${filename}`;
      await writeFile(filepath, content, "utf-8");
      return `Trip plan written to ${filepath}`;
    },
  });

  return createTinyfishAgent({
    prompt: ORCHESTRATOR_PROMPT,
    tools: [callResearchAgent, callLogisticsAgent, writeMarkdownFile],
  });
}
