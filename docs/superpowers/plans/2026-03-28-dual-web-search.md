# Dual Web Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add OpenAI's `web_search_preview` alongside TinyFish in the agent factory with prompt-based routing so agents default to cheap web search and escalate to TinyFish for bot-protected sites.

**Architecture:** Bind `web_search_preview` as an OpenAI built-in tool on the `ChatOpenAI` instance. Add a routing prompt constant that gets prepended to all agent prompts. Single file change.

**Tech Stack:** `@langchain/openai` (ChatOpenAI with Responses API), `@langchain/langgraph` (createReactAgent)

---

## File Structure

- Modify: `frontend/src/lib/agent/agent-factory.ts` — add web search binding and routing prompt
- Existing test: `frontend/src/lib/agent/agent-factory.test.ts` — verify existing test still passes

---

### Task 1: Add routing prompt constant and bind web_search_preview

**Files:**
- Modify: `frontend/src/lib/agent/agent-factory.ts`

- [ ] **Step 1: Add the routing prompt constant**

Add after the `TINYFISH_BASE_URL` constant (line 9), before the `tinyfishRunTool` definition:

```typescript
const WEB_TOOL_ROUTING_PROMPT = `You have two web tools available:

1. **web_search_preview** — Use for general web searches, public information lookups, and sites that are easy to access (Wikipedia, Reddit, news sites, blogs, weather sites, government sites). This is fast and cheap.

2. **tinyfish_web_automation** — Use for sites with anti-bot protection (Cloudflare, DataDome), sites requiring browser interaction (form filling, clicking, scrolling), booking/travel sites (Google Flights, Booking.com, Skyscanner), and any site where web_search_preview returns insufficient results. This is more powerful but slower and rate-limited.

Default to web_search_preview. Escalate to tinyfish_web_automation when you need real browser automation or anti-bot bypassing.`;
```

- [ ] **Step 2: Bind `web_search_preview` to the ChatOpenAI instance**

In the `createTinyfishAgent` function, change the LLM instantiation from:

```typescript
const llm = new ChatOpenAI({
  model: "gpt-4o",
  apiKey: OPENAI_API_KEY,
});
```

To:

```typescript
const llm = new ChatOpenAI({
  model: "gpt-4o",
  apiKey: OPENAI_API_KEY,
}).bindTools([{ type: "web_search_preview" }]);
```

- [ ] **Step 3: Prepend routing prompt to all agents**

In the `createTinyfishAgent` function, replace the agent creation block:

```typescript
const agent = createReactAgent({
  llm,
  tools: [tinyfishRunTool, ...tools],
  ...(prompt ? { prompt } : {}),
});
```

With:

```typescript
const fullPrompt = prompt
  ? `${WEB_TOOL_ROUTING_PROMPT}\n\n${prompt}`
  : WEB_TOOL_ROUTING_PROMPT;

const agent = createReactAgent({
  llm,
  tools: [tinyfishRunTool, ...tools],
  prompt: fullPrompt,
});
```

- [ ] **Step 4: Verify the existing test still passes**

Run: `cd frontend && npx vitest run src/lib/agent/agent-factory.test.ts`

Expected: PASS — the test sends a query to Hacker News which is an easy site, so the agent may use either tool and still return results.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/agent/agent-factory.ts
git commit -m "feat: add OpenAI web_search_preview alongside TinyFish with prompt-based routing"
```
