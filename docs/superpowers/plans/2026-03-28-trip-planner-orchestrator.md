# Trip Planner Orchestrator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-agent trip planner where an orchestrator agent dispatches research and logistics sub-agents via tool calls, then synthesizes results into a markdown itinerary.

**Architecture:** Three agents created via `createTinyfishAgent()`. The orchestrator gets two extra `DynamicStructuredTool`s (`call_research_agent`, `call_logistics_agent`) and a `write_markdown_file` tool. Sub-agents have domain-specific system prompts that embed data source knowledge. The orchestrator follows a research-first-then-parallel execution pattern.

**Tech Stack:** TypeScript, LangChain (langgraph ReAct agent), OpenAI GPT-4o, TinyFish API, Zod, Vite, Vitest

**Spec:** `docs/superpowers/specs/2026-03-28-trip-planner-orchestrator-design.md`

---

### Task 1: Research Agent System Prompt

**Files:**
- Create: `frontend/src/lib/agent/prompts/research-agent.ts`

- [ ] **Step 1: Create the research agent prompt file**

```typescript
// frontend/src/lib/agent/prompts/research-agent.ts

export const RESEARCH_PROMPT = `You are a travel research specialist. Your job is to gather detailed, actionable travel information by scraping real websites using the tinyfish_web_automation tool.

## Your Data Sources

Use tinyfish_web_automation to scrape these sites (pick the most relevant for each query):

### General Guides
- WikiVoyage (wikivoyage.org) — Free curated travel guides
- Atlas Obscura (atlasobscura.com) — Hidden gems and unusual places

### Reviews & Tips
- Reddit (reddit.com/r/travel, r/solotravel, r/JapanTravel, etc.) — Raw tips, itineraries, scam warnings
- Google Maps (google.com/maps) — POI details, reviews, hours
- YouTube (youtube.com) — Travel vlogs and comments

### Local-Language Sources (use for Asian destinations)
- Tabelog (tabelog.com) — Japan restaurant reviews (3.5/5 = exceptional)
- Naver Blog (blog.naver.com) — Korean travel reviews
- Xiaohongshu / RED (xiaohongshu.com) — Chinese travel guides

### Crowd & Timing Data
- Google Maps Popular Times — Hourly crowd levels
- Queue-Times (queue-times.com) — Theme park wait times

## How to Work

1. For each query, identify 2-3 most relevant sources
2. Use tinyfish_web_automation to scrape each source with a specific, detailed goal
3. Synthesize findings into a structured summary
4. Always attribute information to its source
5. Flag any conflicting information between sources

## Output Format

Return structured text with clear sections. Include:
- Key findings with source attribution
- Practical tips (timing, pricing, crowd avoidance)
- Warnings or gotchas
- Hidden gems that tourists typically miss`;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/agent/prompts/research-agent.ts
git commit -m "feat: add research agent system prompt"
```

---

### Task 2: Logistics Agent System Prompt

**Files:**
- Create: `frontend/src/lib/agent/prompts/logistics-agent.ts`

- [ ] **Step 1: Create the logistics agent prompt file**

```typescript
// frontend/src/lib/agent/prompts/logistics-agent.ts

export const LOGISTICS_PROMPT = `You are a travel logistics specialist. Your job is to find flights, hotels, transport options, and practical travel information by scraping real websites using the tinyfish_web_automation tool.

## Your Data Sources

Use tinyfish_web_automation to scrape these sites (pick the most relevant for each query):

### Flights
- Google Flights (google.com/travel/flights) — Flight search with prices
- Skyscanner (skyscanner.com) — Budget flight comparison

### Hotels
- Google Hotels (google.com/travel/hotels) — Hotel search with prices from multiple OTAs
- Booking.com (booking.com) — Hotel reviews and pricing
- Rakuten Travel (travel.rakuten.co.jp) — Japan hotels/ryokan

### Transport
- Rome2Rio (rome2rio.com) — Multi-modal transport (flights, trains, buses, ferries)
- Google Maps Directions — Local transit routing

### Weather & Practical
- Open-Meteo (open-meteo.com) — Weather forecasts (free API, but you can also scrape the site)
- REST Countries (restcountries.com) — Country metadata (currency, language, timezone)
- Passport Index (passportindex.org) — Visa requirements
- Nager.Date (date.nager.at) — Public holidays by country

## How to Work

1. For each query, identify the best source(s) for the specific logistics need
2. Use tinyfish_web_automation to scrape with specific extraction goals
3. Always include prices, durations, and practical details
4. Compare options when possible (cheapest vs. best value vs. most convenient)
5. Note booking links or reference info so the user can act on recommendations

## Output Format

Return structured data with:
- Options ranked by value (price vs. convenience)
- Prices in the user's currency when possible
- Duration and distance for transport
- Check-in/check-out times for hotels
- Any restrictions or requirements (visa, vaccination, etc.)`;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/agent/prompts/logistics-agent.ts
git commit -m "feat: add logistics agent system prompt"
```

---

### Task 3: Orchestrator Agent System Prompt

**Files:**
- Create: `frontend/src/lib/agent/prompts/orchestrator-agent.ts`

- [ ] **Step 1: Create the orchestrator prompt file**

```typescript
// frontend/src/lib/agent/prompts/orchestrator-agent.ts

export const ORCHESTRATOR_PROMPT = `You are a trip planning orchestrator. You coordinate a research agent and a logistics agent to build comprehensive travel itineraries.

## Your Tools

- call_research_agent(query) — Dispatches a query to the research specialist who scrapes travel sites for destination info, dining, tips, crowd data, hidden gems
- call_logistics_agent(query) — Dispatches a query to the logistics specialist who scrapes sites for flights, hotels, transport, weather, and practical info
- write_markdown_file(filename, content) — Writes the final itinerary to a markdown file

## Your Process

### Step 1: Understand Requirements
Extract from the user's message:
- Destination(s)
- Travel dates or month/season
- Budget (total or per-category)
- Interests and priorities
- Group size and composition
- Origin city (for flights)
- Any constraints (dietary, mobility, etc.)

If critical info is missing (destination, dates), ask the user. Otherwise, make reasonable assumptions and note them.

### Step 2: Research Overview (Phase 1)
Call call_research_agent with a broad overview query for the destination. Include the travel dates/season and interests. This gives you context for all subsequent queries.

### Step 3: Detailed Research & Logistics (Phase 2)
Based on the overview, make multiple targeted calls to both agents. Break the work into specific queries:

Research agent queries (examples):
- "Top [interest] experiences in [destination] with crowd-avoidance tips"
- "Best restaurants in [neighborhood] with local reviews"
- "Hidden gems and off-the-beaten-path spots in [destination]"

Logistics agent queries (examples):
- "Round-trip flights from [origin] to [destination] around [dates], budget [amount]"
- "Hotels in [neighborhood] for [nights] nights, budget [amount]/night"
- "Local transport options: rail passes, airport transfers, day trip logistics"

Make these calls in parallel when possible (multiple tool calls in one turn).

### Step 4: Synthesize & Write (Phase 3)
Combine all results into a day-by-day itinerary. Use write_markdown_file to save it.

The markdown file MUST follow this structure:

# [Destination] Trip Plan — [Dates]

## Overview
Brief destination summary, weather expectations, key cultural notes

## Day 1: [Theme]
### Morning
### Afternoon
### Evening
### Logistics (transport between locations, check-in times)

[Repeat for each day]

## Flights
## Accommodation
## Transport
## Budget Breakdown
## Local Tips & Warnings
## Weather & Packing

## Important Rules
- Always use both agents — research informs logistics decisions
- Break queries into specific, targeted asks — don't send one giant query
- Include practical details: addresses, hours, prices, transit directions
- Note the source of recommendations when relevant
- Stay within the user's budget — flag if it's unrealistic`;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/agent/prompts/orchestrator-agent.ts
git commit -m "feat: add orchestrator agent system prompt"
```

---

### Task 4: Orchestrator Module

**Files:**
- Create: `frontend/src/lib/agent/orchestrator.ts`
- Read: `frontend/src/lib/agent/agent-factory.ts` (for `createTinyfishAgent` signature)

- [ ] **Step 1: Write the failing test**

Create `frontend/src/lib/agent/orchestrator.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { createTripPlannerOrchestrator } from "./orchestrator";

describe("trip planner orchestrator", () => {
  it("exports a function that returns an async runner", () => {
    const runner = createTripPlannerOrchestrator();
    expect(typeof runner).toBe("function");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/lib/agent/orchestrator.test.ts --reporter=verbose`
Expected: FAIL — cannot find module `./orchestrator`

- [ ] **Step 3: Write the orchestrator module**

Create `frontend/src/lib/agent/orchestrator.ts`:

```typescript
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { createTinyfishAgent } from "./agent-factory";
import { RESEARCH_PROMPT } from "./prompts/research-agent";
import { LOGISTICS_PROMPT } from "./prompts/logistics-agent";
import { ORCHESTRATOR_PROMPT } from "./prompts/orchestrator-agent";
import { writeFile, mkdir } from "fs/promises";
import { dirname } from "path";

export function createTripPlannerOrchestrator() {
  const researchRunner = createTinyfishAgent({ prompt: RESEARCH_PROMPT });
  const logisticsRunner = createTinyfishAgent({ prompt: LOGISTICS_PROMPT });

  const callResearchAgent = new DynamicStructuredTool({
    name: "call_research_agent",
    description:
      "Dispatch a query to the travel research agent. " +
      "The research agent scrapes travel websites (WikiVoyage, Reddit, Google Maps, Tabelog, etc.) " +
      "to gather destination info, dining recommendations, tips, crowd data, and hidden gems. " +
      "Send specific, targeted queries for best results.",
    schema: z.object({
      query: z
        .string()
        .describe(
          "The research query to send to the agent. Be specific — e.g. " +
            "'Find top-rated ramen shops in Shinjuku with crowd-avoidance tips from Reddit and Tabelog'"
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/lib/agent/orchestrator.test.ts --reporter=verbose`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/agent/orchestrator.ts frontend/src/lib/agent/orchestrator.test.ts
git commit -m "feat: add trip planner orchestrator with sub-agent tools"
```

---

### Task 5: Integration Test

**Files:**
- Modify: `frontend/src/lib/agent/orchestrator.test.ts`

- [ ] **Step 1: Add integration test**

Append to `frontend/src/lib/agent/orchestrator.test.ts`:

```typescript
describe("trip planner orchestrator integration", () => {
  it(
    "generates a trip plan from a user request",
    { timeout: 300_000 },
    async () => {
      const runner = createTripPlannerOrchestrator();
      const result = await runner(
        "Plan a 2-day trip to Tokyo in April. Budget $500. I love ramen and temples. Flying from San Francisco."
      );

      console.log("Orchestrator response:", result);

      // Orchestrator should return a non-empty response
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(50);
    }
  );
});
```

- [ ] **Step 2: Run integration test**

Run: `cd frontend && npx vitest run src/lib/agent/orchestrator.test.ts --reporter=verbose`
Expected: PASS (may take 2-5 minutes due to multiple TinyFish + LLM calls)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/agent/orchestrator.test.ts
git commit -m "test: add integration test for trip planner orchestrator"
```

---

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/lib/agent/prompts/research-agent.ts` | Create | System prompt with data source knowledge for research agent |
| `frontend/src/lib/agent/prompts/logistics-agent.ts` | Create | System prompt with data source knowledge for logistics agent |
| `frontend/src/lib/agent/prompts/orchestrator-agent.ts` | Create | System prompt with 3-phase execution pattern for orchestrator |
| `frontend/src/lib/agent/orchestrator.ts` | Create | Orchestrator factory: creates sub-agents, wraps them as tools, returns runner |
| `frontend/src/lib/agent/orchestrator.test.ts` | Create | Unit + integration tests |
| `frontend/src/lib/agent/agent-factory.ts` | Unchanged | Existing factory used by all three agents |
