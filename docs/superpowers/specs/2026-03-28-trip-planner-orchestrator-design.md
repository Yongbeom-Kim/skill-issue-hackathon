# Trip Planner Orchestrator — Design Spec

## Summary

A multi-agent trip planning system with three agents built on `createTinyfishAgent()`:

1. **Research Agent** — Scrapes travel data sources via TinyFish to gather destination info, dining, tips, crowd data, hidden gems
2. **Logistics Agent** — Scrapes flight, hotel, transport, and weather sources via TinyFish to handle bookings and practical logistics
3. **Orchestrator Agent** — Collects user requirements conversationally, dispatches sub-agents in a research-first-then-parallel pattern, synthesizes results into a markdown itinerary

## Architecture

### Execution Phases

```
Phase 1 (serial):    Orchestrator → Research Agent (destination overview)
Phase 2 (parallel):  Orchestrator → Research Agent (detailed queries) + Logistics Agent (informed by Phase 1)
Phase 3 (serial):    Orchestrator synthesizes all results → writes trip-plan.md
```

### Component Details

#### Research Agent

- Created via `createTinyfishAgent({ prompt: RESEARCH_PROMPT })`
- System prompt embeds knowledge of data sources: WikiVoyage, Reddit, Google Maps, Tabelog, Naver Blog, Xiaohongshu, Atlas Obscura, YouTube travel vlogs, Google Popular Times, etc.
- Receives targeted queries from the orchestrator (e.g. "Find top-rated restaurants in Shibuya with local tips from Tabelog and Reddit")
- Returns structured text summaries with source attribution

#### Logistics Agent

- Created via `createTinyfishAgent({ prompt: LOGISTICS_PROMPT })`
- System prompt embeds knowledge of: Google Flights, Rome2Rio, hotel booking sites, Amadeus, Open-Meteo, REST Countries, ExchangeRate-API, Nager.Date, Passport Index
- Receives queries informed by research results (e.g. "Find hotels in Shinjuku area" after research identified Shinjuku as the best base)
- Returns structured logistics data

#### Orchestrator Agent

- Created via `createTinyfishAgent({ prompt: ORCHESTRATOR_PROMPT, tools: [callResearchAgent, callLogisticsAgent, writeMarkdownFile] })`
- Has two `DynamicStructuredTool`s that wrap the sub-agents:
  - `call_research_agent(query: string) → string` — invokes the research agent
  - `call_logistics_agent(query: string) → string` — invokes the logistics agent
- Has a `write_markdown_file(filename: string, content: string)` tool to write the final output
- System prompt instructs the 3-phase execution pattern
- Exposes the same `async (userMessage: string) => string` interface

### Data Flow

```
User: "Plan a 5-day Tokyo trip in April, $3000 budget, love food and temples"

Orchestrator extracts requirements:
  { destination: "Tokyo", days: 5, month: "April", budget: "$3000", interests: ["food", "temples"] }

Phase 1 — Research overview:
  research_agent("Overview of Tokyo for 5-day April trip: neighborhoods, temple areas, food districts, cherry blossom timing, crowd patterns")
  → neighborhood guide, timing tips, seasonal notes

Phase 2 — Detailed queries (parallel):
  research_agent("Top temple experiences in Tokyo with crowd-avoidance tips")
  research_agent("Best food in Tokyo: ramen, sushi, izakaya — local tips from Tabelog/Reddit")
  research_agent("Hidden gems and local tips for Tokyo in April")
  logistics_agent("Round-trip flights to Tokyo in April, budget ~$1200")
  logistics_agent("Hotels in Shinjuku/Shibuya, 5 nights April, ~$150/night")
  logistics_agent("Tokyo transport: rail pass options, airport transfer")

Phase 3 — Synthesis:
  Orchestrator merges all results → writes trip-plan.md
```

## Output Format

The final output is a markdown file (`trip-plan.md`) with this structure:

```markdown
# [Destination] Trip Plan — [Dates]

## Overview
Brief destination summary, weather expectations, key cultural notes

## Day 1: [Theme]
### Morning
### Afternoon
### Evening
### Logistics

## Day 2: [Theme]
...

## Flights
Options with prices, airlines, duration

## Accommodation
Hotel recommendations with prices, location rationale

## Transport
Rail passes, airport transfers, local transport tips

## Budget Breakdown
Itemized estimate vs. user budget

## Local Tips & Warnings
Crowd avoidance, scam warnings, cultural etiquette, hidden gems

## Weather & Packing
Forecast-based recommendations
```

## File Structure

```
frontend/src/lib/agent/
  ├── agent-factory.ts          (existing — unchanged)
  ├── prompts/
  │   ├── research-agent.ts     (system prompt for research agent)
  │   ├── logistics-agent.ts    (system prompt for logistics agent)
  │   └── orchestrator-agent.ts (system prompt for orchestrator)
  ├── orchestrator.ts           (orchestrator setup: creates sub-agents, tools, exports runner)
  └── orchestrator.test.ts      (integration test)
```

## Interface

```typescript
// orchestrator.ts
export function createTripPlannerOrchestrator(): (userMessage: string) => Promise<string>;
```

The orchestrator returns the same `async (msg) => string` shape as any agent from the factory. Callers don't need to know about the sub-agents.

## Constraints

- All agents use GPT-4o via the existing `createTinyfishAgent()` factory
- All web data gathering goes through the TinyFish tool (already in agent-factory.ts)
- Sub-agent tools are `DynamicStructuredTool` instances passed via the `tools` parameter
- Phase 2 parallelism: the orchestrator's ReAct loop can make multiple tool calls; alternatively, the tool implementations can use `Promise.all` internally
- Output is a single `.md` file written to disk
