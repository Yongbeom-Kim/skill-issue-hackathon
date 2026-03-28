# Dual Web Search in Agent Factory — Design Spec

## Summary

Add OpenAI's built-in `web_search_preview` tool alongside the existing TinyFish tool in `agent-factory.ts`. Prepend a routing prompt to all agents so the LLM intelligently chooses which tool to use per request — defaulting to the fast/cheap web search and escalating to TinyFish when real browser automation or anti-bot bypassing is needed.

## Motivation

TinyFish is rate-limited. Many web lookups (Wikipedia, Reddit, news sites, blogs, government sites) don't need full browser automation — OpenAI's built-in web search handles them fine. Reserving TinyFish for sites that actually require it (bot-protected, form-heavy, dynamic) reduces rate limit pressure and speeds up responses.

## Approach

Use LangChain's native support for OpenAI's Responses API. `ChatOpenAI` from `@langchain/openai` supports `web_search_preview` as a built-in tool via `.bindTools([{ type: "web_search_preview" }])`. This automatically switches to the Responses API under the hood.

## Changes

### Single file: `frontend/src/lib/agent/agent-factory.ts`

#### 1. Bind `web_search_preview` to the LLM

```typescript
const llm = new ChatOpenAI({
  model: "gpt-4o",
  apiKey: OPENAI_API_KEY,
}).bindTools([{ type: "web_search_preview" }]);
```

#### 2. Add routing prompt prefix

```typescript
const WEB_TOOL_ROUTING_PROMPT = `You have two web tools available:

1. **web_search_preview** — Use for general web searches, public information lookups, and sites that are easy to access (Wikipedia, Reddit, news sites, blogs, weather sites, government sites). This is fast and cheap.

2. **tinyfish_web_automation** — Use for sites with anti-bot protection (Cloudflare, DataDome), sites requiring browser interaction (form filling, clicking, scrolling), booking/travel sites (Google Flights, Booking.com, Skyscanner), and any site where web_search_preview returns insufficient results. This is more powerful but slower and rate-limited.

Default to web_search_preview. Escalate to tinyfish_web_automation when you need real browser automation or anti-bot bypassing.`;
```

#### 3. Prepend routing prompt in `createTinyfishAgent()`

Prepend `WEB_TOOL_ROUTING_PROMPT` before the user-provided `prompt` (if any). If no prompt is provided, use the routing prompt alone.

```typescript
const fullPrompt = prompt
  ? `${WEB_TOOL_ROUTING_PROMPT}\n\n${prompt}`
  : WEB_TOOL_ROUTING_PROMPT;
```

## What stays the same

- `tinyfishRunTool` definition — unchanged
- `CreateAgentOptions` interface — unchanged
- `createTinyfishAgent()` function signature — unchanged
- Research and logistics agent prompts — unchanged
- Existing test — unchanged

## Constraints

- Only `agent-factory.ts` changes
- No new dependencies (LangChain already supports `web_search_preview`)
- No new API keys (uses existing OpenAI key)
- All agents automatically get both tools
