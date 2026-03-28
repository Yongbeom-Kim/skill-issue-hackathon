# TinyFish API Reference

Complete documentation for building on top of TinyFish -- covering every endpoint, parameter, event type, integration pattern, best practice, and known edge case. Derived from 25+ production cookbook recipes.

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [POST /v1/automation/run-sse](#post-v1automationrun-sse)
  - [POST /v1/automation/run-async](#post-v1automationrun-async)
  - [GET /v1/runs/{runId}](#get-v1runsrunid)
  - [POST /v1/runs/{runId}/cancel](#post-v1runsrunidcancel)
- [Request Parameters](#request-parameters)
- [SSE Event Reference](#sse-event-reference)
- [CLI Reference](#cli-reference)
- [Goal Engineering](#goal-engineering)
- [Integration Patterns](#integration-patterns)
  - [SSE Client (TypeScript)](#sse-client-typescript)
  - [SSE Client (Python)](#sse-client-python)
  - [Parallel Execution](#parallel-execution)
  - [Server-Side Proxy (Next.js)](#server-side-proxy-nextjs)
  - [Supabase Edge Functions](#supabase-edge-functions)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling)
- [Corner Cases and Gotchas](#corner-cases-and-gotchas)
- [MCP and n8n Integration](#mcp-and-n8n-integration)
- [Use Cases](#use-cases)

---

## Overview

TinyFish is a SOTA web automation API. Send a URL and a natural-language goal, get back structured JSON. It handles real browser navigation, form filling, dynamic content, anti-bot detection, and rotating proxies behind a single HTTP call.

**Base URL:** `https://agent.tinyfish.ai/v1`

**Benchmark:** 90% on Mind2Web (Gemini: 69%, OpenAI: 61%, Anthropic: 56%).

---

## Authentication

All requests require an API key in the `X-API-Key` header.

**Get a key:** <https://agent.tinyfish.ai/api-keys>

```
X-API-Key: your-api-key-here
```

### CLI Authentication

```bash
# Interactive login
tinyfish auth login

# Or environment variable
export TINYFISH_API_KEY="your-key-here"

# Check status
tinyfish auth status
```

### Claude Code Settings

Add to `~/.claude/settings.local.json`:

```json
{
  "env": {
    "TINYFISH_API_KEY": "your-key-here"
  }
}
```

---

## API Endpoints

### POST /v1/automation/run-sse

**The primary endpoint.** Runs a browser automation and streams progress via Server-Sent Events.

```bash
curl -N -X POST https://agent.tinyfish.ai/v1/automation/run-sse \
  -H "X-API-Key: $TINYFISH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/pricing",
    "goal": "Extract all pricing tiers as JSON: [{\"name\": str, \"price\": str}]"
  }'
```

**Response:** `Content-Type: text/event-stream`

Each event is a `data: {...}\n\n` line. See [SSE Event Reference](#sse-event-reference) for all event types.

---

### POST /v1/automation/run-async

Fire-and-forget. Returns a `run_id` immediately for polling.

```bash
curl -X POST https://agent.tinyfish.ai/v1/automation/run-async \
  -H "X-API-Key: $TINYFISH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "goal": "Extract data..."}'
```

**Response:**

```json
{
  "run_id": "run_abc123xyz"
}
```

---

### GET /v1/runs/{runId}

Poll status of an async run.

```bash
curl https://agent.tinyfish.ai/v1/runs/run_abc123xyz \
  -H "X-API-Key: $TINYFISH_API_KEY"
```

**Response:**

```json
{
  "run_id": "run_abc123xyz",
  "status": "COMPLETED",
  "started_at": "2025-01-15T10:00:00Z",
  "finished_at": "2025-01-15T10:01:23Z",
  "num_of_steps": 8,
  "result": { "tiers": [{"name": "Pro", "price": "$29"}] },
  "error": null
}
```

**Status values:**

| Status | Terminal? | Description |
|--------|-----------|-------------|
| `QUEUED` | No | Waiting to start |
| `RUNNING` | No | In progress |
| `COMPLETED` | Yes | Succeeded -- check `result` |
| `FAILED` | Yes | Failed -- check `error` |
| `CANCELLED` | Yes | User cancelled |

**Polling strategy:** Poll every 3 seconds. Retry on 500+ errors up to 3 times with linear backoff (1s, 2s, 3s). Stop on terminal status.

---

### POST /v1/runs/{runId}/cancel

Cancel an in-progress run.

```bash
curl -X POST https://agent.tinyfish.ai/v1/runs/run_abc123xyz/cancel \
  -H "X-API-Key: $TINYFISH_API_KEY"
```

**Response:**

```json
{
  "run_id": "run_abc123xyz",
  "status": "CANCELLED"
}
```

---

## Request Parameters

All endpoints accept the same request body:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | `string` | Yes | -- | Starting URL for the browser agent |
| `goal` | `string` | Yes | -- | Natural language instruction. See [Goal Engineering](#goal-engineering) |
| `browser_profile` | `"lite" \| "stealth"` | No | `"lite"` | Browser mode. `stealth` adds anti-detection and rotating proxies |
| `proxy_config` | `object` | No | disabled | Proxy configuration (see below) |
| `timeout` | `number` | No | ~300000 | Timeout in milliseconds |

### proxy_config

```json
{
  "enabled": true,
  "country_code": "US"
}
```

| Country Code | Region |
|-------------|--------|
| `US` | United States |
| `GB` | United Kingdom |
| `CA` | Canada |
| `DE` | Germany |
| `FR` | France |
| `JP` | Japan |
| `AU` | Australia |

### When to use `stealth` mode

Use `browser_profile: "stealth"` for sites with:
- Bot detection (Cloudflare, DataDome, PerimeterX)
- Rate limiting by IP
- Login walls or session-based blocking

Sites known to need stealth (from cookbook): Google Scholar, IEEE Xplore, Reddit.

Use `lite` (default) for everything else -- it's faster and uses fewer resources.

### When to use proxy geo-targeting

Use `proxy_config` when:
- Site restricts content by region (Amazon, DoorDash, regional pricing pages)
- Site blocks requests from non-local IPs
- You need location-specific results (local search, regional pricing)

Proxy adds ~2-3s latency per request. Don't use it unless needed.

---

## SSE Event Reference

Events are streamed as `data: {JSON}\n\n` lines.

### TypeScript Interface

```typescript
interface TinyFishSSEEvent {
  // Event classification
  type?: string;           // "STEP" | "COMPLETE" | "ERROR"
  status?: string;         // "COMPLETED" | "FAILED"

  // Progress
  message?: string;        // Human-readable progress text
  purpose?: string;        // What the agent is trying to do
  action?: string;         // Specific action being taken
  step?: number;           // Step number
  totalSteps?: number;     // Total steps estimated

  // Results
  resultJson?: unknown;    // Final extracted data (COMPLETE events only)

  // Observability
  streamingUrl?: string;   // Live browser preview URL (ephemeral)
}
```

### Event Types

#### Streaming URL (fires early, once)

```json
{ "streamingUrl": "https://stream.tinyfish.ai/abc123" }
```

An ephemeral URL showing a live browser preview. Expires when the run completes. Embed in an iframe for real-time observability.

#### STEP (progress updates)

```json
{
  "type": "STEP",
  "purpose": "Navigating to pricing page",
  "action": "click",
  "message": "Clicking on Pricing link in navigation"
}
```

Filter out system events (`STARTED`, `STREAMING_URL`, `HEARTBEAT`, `PING`, `CONNECTED`, `INIT`) to avoid noise in UIs.

#### COMPLETE (success)

```json
{
  "type": "COMPLETE",
  "status": "COMPLETED",
  "resultJson": { "tiers": [{"name": "Pro", "price": "$29"}] },
  "streamingUrl": "https://stream.tinyfish.ai/abc123"
}
```

The `resultJson` field contains your extracted data.

#### ERROR (failure)

```json
{
  "type": "ERROR",
  "status": "FAILED",
  "message": "Failed to navigate to URL: Connection timeout"
}
```

### Detecting Completion

```typescript
function isComplete(event: TinyFishSSEEvent): boolean {
  return event.type === "COMPLETE" && event.status === "COMPLETED";
}

function isError(event: TinyFishSSEEvent): boolean {
  return event.type === "ERROR" || event.status === "FAILED";
}
```

### Field Name Variations

The API may return step information under different field names. Check them in priority order:

```typescript
const stepMessage =
  event.purpose || event.action || event.message ||
  event.step || event.description || event.text || "Processing...";
```

Similarly for streaming URL:

```typescript
const url = event.streamingUrl || event.liveUrl || event.previewUrl || event.browser_url;
```

---

## CLI Reference

### Installation

```bash
npm install -g @tiny-fish/cli
```

### Core Command

```bash
tinyfish agent run --url <url> "<goal>"
```

### Flags

| Flag | Purpose |
|------|---------|
| `--url <url>` | Target website URL (required) |
| `--sync` | Block until full result (no streaming) |
| `--async` | Return `run_id` immediately |
| `--pretty` | Human-readable formatted output |

Default: streams SSE events as JSON to stdout.

### Run Management

```bash
tinyfish agent run list              # List recent runs
tinyfish agent run get <run_id>      # Get specific run result
tinyfish agent run cancel <run_id>   # Cancel in-progress run
```

### Examples

```bash
# Basic extraction
tinyfish agent run --url "https://example.com" \
  "Extract product info as JSON: {\"name\": str, \"price\": str}"

# Sync mode (wait for result)
tinyfish agent run --sync --url "https://example.com" \
  "Extract the page title as JSON: {\"title\": str}"

# Multi-step automation
tinyfish agent run --url "https://example.com/search" \
  "Search for 'headphones', filter by price under $50, extract top 5 as JSON"
```

---

## Goal Engineering

Goals are the most important part of using TinyFish effectively. A well-written goal is the difference between getting clean structured data and getting garbage.

### Anatomy of a Good Goal

```
[Context] + [Action Steps] + [Output Schema] + [Constraints]
```

**Example:**

```
Extract all pricing tiers from this page.

For each tier, extract:
1. Plan name
2. Monthly price (number or null if "Contact us")
3. Features included

Return JSON:
{
  "tiers": [
    {"name": str, "monthlyPrice": number | null, "features": [str]}
  ]
}

IMPORTANT: Only extract visible pricing. Do not navigate to other pages.
```

### Goal Writing Rules

| Rule | Why |
|------|-----|
| Always specify exact JSON output schema | Agent returns whatever shape you describe |
| Use MUST/SHOULD for critical fields | Prevents the agent from skipping fields |
| Include step-by-step for multi-page flows | Reduces ambiguity on navigation order |
| Add "If not found..." fallback instructions | Prevents errors on missing data |
| Show calculation formulas if needed | Agent will do math and show work |
| State "Return valid JSON only" | Prevents markdown wrapping of output |
| Keep to 100-300 words for complex tasks | Longer goals with more detail get better results |

### Goal Examples by Complexity

#### Simple: Single-page extraction

```
Extract all product names and prices. Return JSON array:
[{"name": str, "price": str}]
```

#### Medium: Multi-step with filtering

```
Search for "wireless headphones", apply filter for price $50-100,
sort by rating, extract top 5 results as JSON:
[{"name": str, "price": str, "rating": str, "url": str}]
```

#### Complex: Multi-field with calculations

```
Extract ALL pricing tiers with comprehensive detail.

For EACH tier, extract:
1. TIER NAME: Exact plan name
2. MONTHLY PRICE: Price if billed monthly (null if "Contact us")
3. ANNUAL PRICE: Price if billed annually
4. UNITS INCLUDED: Usage allocation (e.g., "100 runs", "10,900 credits")
5. ESTIMATED TASKS: Calculate based on typical task = 100-400 credits
6. PRICE PER TASK: monthlyPrice / estimatedTasks

Return JSON:
{
  "company": "Company Name",
  "tiers": [
    {
      "name": str,
      "monthlyPrice": number | null,
      "annualPrice": number | null,
      "units": str,
      "estTasks": str,
      "pricePerTask": str,
      "sourceNotes": "Show calculation work here"
    }
  ]
}

IMPORTANT: Show math in sourceNotes. If conflicting info found, include ALL versions.
```

#### Source-specific: Platform-aware extraction

```
You are on a DoorDash search page. Extract restaurants that serve wings.

ONLY include restaurants in Los Angeles, CA. Ignore results from other cities.

For each restaurant extract:
- name, rating, delivery_fee, delivery_time, store_url

Return JSON: {"restaurants": [{...}]}
```

### Goal Anti-Patterns

| Don't | Do |
|-------|-----|
| "Get everything from the page" | "Extract product names and prices as JSON: [...]" |
| "Navigate to multiple sites" | Use separate parallel calls per site |
| "Download all PDFs" | Goals are for data extraction, not file downloads |
| Omit output format | Always specify JSON schema |
| Write 1000+ word goals | Keep to 300 words max; be precise, not verbose |

---

## Integration Patterns

### SSE Client (TypeScript)

The canonical pattern for consuming TinyFish SSE streams:

```typescript
interface TinyFishCallbacks {
  onStep?: (message: string) => void;
  onStreamingUrl?: (url: string) => void;
  onComplete?: (result: unknown) => void;
  onError?: (error: string) => void;
}

async function runTinyFish(
  config: { url: string; goal: string; browser_profile?: "lite" | "stealth" },
  apiKey: string,
  callbacks?: TinyFishCallbacks
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const response = await fetch("https://agent.tinyfish.ai/v1/automation/run-sse", {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let streamingUrl: string | undefined;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // Keep incomplete line in buffer

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;

      let event;
      try {
        event = JSON.parse(line.slice(6));
      } catch {
        continue; // Skip malformed lines
      }

      // Capture streaming URL (fires once, early)
      if (event.streamingUrl && !streamingUrl) {
        streamingUrl = event.streamingUrl;
        callbacks?.onStreamingUrl?.(event.streamingUrl);
      }

      // Forward progress steps (filter system noise)
      if (event.type === "STEP") {
        const msg = event.purpose || event.action || event.message || "Processing...";
        callbacks?.onStep?.(msg);
      }

      // Completion
      if (event.type === "COMPLETE" && event.status === "COMPLETED") {
        callbacks?.onComplete?.(event.resultJson);
        return { success: true, result: event.resultJson };
      }

      // Error
      if (event.type === "ERROR" || event.status === "FAILED") {
        const errMsg = event.message || "Automation failed";
        callbacks?.onError?.(errMsg);
        return { success: false, error: errMsg };
      }
    }
  }

  return { success: false, error: "Stream ended without completion event" };
}
```

### SSE Client (Python)

```python
import json
import os
import requests

def run_tinyfish(url: str, goal: str, browser_profile: str = "lite") -> dict:
    response = requests.post(
        "https://agent.tinyfish.ai/v1/automation/run-sse",
        headers={
            "X-API-Key": os.getenv("TINYFISH_API_KEY"),
            "Content-Type": "application/json",
        },
        json={"url": url, "goal": goal, "browser_profile": browser_profile},
        stream=True,
    )
    response.raise_for_status()

    for line in response.iter_lines():
        if not line:
            continue
        decoded = line.decode("utf-8")
        if not decoded.startswith("data: "):
            continue

        try:
            event = json.loads(decoded[6:])
        except json.JSONDecodeError:
            continue

        if event.get("type") == "COMPLETE" and event.get("status") == "COMPLETED":
            return {"success": True, "result": event.get("resultJson")}

        if event.get("type") == "ERROR" or event.get("status") == "FAILED":
            return {"success": False, "error": event.get("message", "Failed")}

    return {"success": False, "error": "Stream ended without completion"}
```

### Parallel Execution

The most common pattern in the cookbook. Use `Promise.allSettled` so one failure doesn't block others.

```typescript
const sites = [
  { url: "https://competitor-a.com/pricing", name: "Competitor A" },
  { url: "https://competitor-b.com/pricing", name: "Competitor B" },
  { url: "https://competitor-c.com/pricing", name: "Competitor C" },
];

const results = await Promise.allSettled(
  sites.map((site) =>
    runTinyFish(
      { url: site.url, goal: "Extract pricing tiers as JSON: [...]" },
      apiKey
    )
  )
);

// Collect successes and failures separately
const successes = [];
const failures = [];

results.forEach((result, i) => {
  if (result.status === "fulfilled" && result.value.success) {
    successes.push({ name: sites[i].name, data: result.value.result });
  } else {
    failures.push(sites[i].name);
  }
});
```

#### Concurrency Control (Batch Pattern)

For large numbers of sites, limit concurrency:

```typescript
async function runInBatches<T>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<unknown>
) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

// Run 3 at a time
await runInBatches(allSites, 3, (site) =>
  runTinyFish({ url: site.url, goal: "..." }, apiKey)
);
```

#### Timeout with Fallback

Prevent one slow source from blocking the group:

```typescript
async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

// 120s timeout per source, return empty array on timeout
const result = await withTimeout(
  runTinyFish({ url, goal }, apiKey),
  120_000,
  { success: false, error: "Timeout" }
);
```

### Server-Side Proxy (Next.js)

Standard pattern for Next.js API routes that proxy TinyFish SSE to the client:

```typescript
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  let isClosed = false;

  const sendEvent = async (data: object) => {
    if (isClosed) return;
    try {
      await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch {
      isClosed = true;
    }
  };

  const closeWriter = async () => {
    if (isClosed) return;
    isClosed = true;
    try { await writer.close(); } catch { /* already closed */ }
  };

  // Process in background IIFE
  (async () => {
    try {
      const body = await request.json();
      // ... validate inputs ...
      // ... call TinyFish API ...
      // ... forward events via sendEvent() ...
    } catch (error) {
      await sendEvent({ type: "error", error: String(error) });
    } finally {
      await closeWriter();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
```

### Supabase Edge Functions

Simplest approach -- pass through the TinyFish SSE response directly:

```typescript
Deno.serve(async (req) => {
  const { url, goal } = await req.json();
  const apiKey = Deno.env.get("TINYFISH_API_KEY");

  const response = await fetch("https://agent.tinyfish.ai/v1/automation/run-sse", {
    method: "POST",
    headers: {
      "X-API-Key": apiKey!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, goal, browser_profile: "lite" }),
  });

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
});
```

---

## Best Practices

### 1. One site per call

Never ask TinyFish to visit multiple domains in one goal. Use parallel calls instead.

```
BAD:  "Go to Amazon and eBay and compare prices"
GOOD: Two parallel calls, one per site, then compare results yourself
```

### 2. Always specify JSON output schema

The agent returns whatever shape you describe. Be explicit.

```
BAD:  "Get the pricing info"
GOOD: "Extract pricing as JSON: [{\"tier\": str, \"price\": number}]"
```

### 3. Use `Promise.allSettled`, not `Promise.all`

One failed scrape shouldn't crash the whole batch.

### 4. Set per-source timeouts

Different sites have different response times. Don't let one slow site block the rest.

| Use case | Recommended timeout |
|----------|-------------------|
| Simple page extraction | 45-60s |
| Multi-step form fill | 120s |
| Complex navigation | 180-300s |
| Search + filter + extract | 120-180s |

### 5. Check `isClosed` before writing to streams

Clients can disconnect at any time. Always guard SSE writes.

### 6. Parse results defensively

The `resultJson` field can be a string, object, or array. Handle all cases:

```typescript
function parseResult(raw: unknown): object[] {
  if (Array.isArray(raw)) return raw;

  if (typeof raw === "string") {
    // Sometimes wrapped in markdown code blocks
    const cleaned = raw.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleaned);
  }

  if (typeof raw === "object" && raw !== null) {
    // Try common wrapper keys
    for (const key of ["results", "data", "items", "tiers", "papers"]) {
      if (Array.isArray((raw as Record<string, unknown>)[key])) {
        return (raw as Record<string, unknown>)[key] as object[];
      }
    }
  }

  return [raw as object];
}
```

### 7. Deduplicate across sources

When scraping the same entity from multiple sites, normalize before deduplication:

```typescript
function dedupeKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 80);
}
```

### 8. Validate results post-scrape

Don't trust extracted data blindly. Common validations:
- Check geographic relevance (is this restaurant actually in the right city?)
- Verify URL structure matches expected domain
- Coerce types: `Number(price) || null`, `String(name || "Unknown")`
- Reject empty or clearly wrong results

### 9. Use `lite` by default

Only switch to `stealth` for sites that actively block bots. It's slower.

### 10. Cache when appropriate

If the same query is likely to be repeated within minutes, cache results:

```typescript
const cache = new Map<string, { expires: number; data: unknown }>();
const TTL = 300_000; // 5 minutes

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) return entry.data;
  cache.delete(key);
  return null;
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| `200` | OK, stream established | Process events |
| `400` | Bad request (missing `url` or `goal`) | Fix request body |
| `401` | Invalid or missing API key | Check `X-API-Key` header |
| `429` | Rate limited | Retry with backoff |
| `500` | Server error | Retry up to 3 times |
| `502/503` | Upstream/availability error | Retry with backoff |

### Rate Limits

Observed limit: **25 requests per 60 seconds**.

Implement client-side rate limiting for batch operations:

```typescript
async function rateLimitedBatch(items: string[], rps: number, fn: (item: string) => Promise<void>) {
  const delay = 1000 / rps;
  for (const item of items) {
    await fn(item);
    await new Promise((r) => setTimeout(r, delay));
  }
}
```

### Retry Pattern

```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (response.ok) return response;

    if (response.status >= 500 && attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, attempt * 1000));
      continue;
    }

    if (response.status === 429 && attempt < maxRetries) {
      const retryAfter = parseInt(response.headers.get("retry-after") || "5") * 1000;
      await new Promise((r) => setTimeout(r, retryAfter));
      continue;
    }

    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
}
```

### AbortController for Cancellation

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 120_000);

try {
  const response = await fetch(API_URL, {
    signal: controller.signal,
    // ...
  });
  // ... process stream ...
} catch (error) {
  if (error.name === "AbortError") {
    // Timeout or manual cancellation -- NOT a crash
  } else {
    throw error;
  }
} finally {
  clearTimeout(timeoutId);
}
```

---

## Corner Cases and Gotchas

### 1. Stream ends without COMPLETE or ERROR

The SSE stream can close gracefully without ever sending a terminal event. This happens when the agent times out internally or the connection drops.

**Fix:** Always handle the "stream ended" case as a failure:

```typescript
// After the while(true) read loop
return { success: false, error: "Stream ended without completion event" };
```

### 2. Incomplete JSON lines in SSE buffer

SSE data arrives in chunks that don't respect JSON boundaries. A single event can be split across multiple `reader.read()` calls.

**Fix:** Always buffer incomplete lines:

```typescript
const lines = buffer.split("\n");
buffer = lines.pop() ?? ""; // Last element may be incomplete -- keep it
```

### 3. `resultJson` shape is unpredictable

The agent returns what it can extract. The shape may not exactly match your goal schema. It can be:
- A JSON object matching your schema
- A JSON string (that needs parsing)
- Wrapped in markdown code blocks (`` ```json ... ``` ``)
- A nested structure with different key names

**Fix:** Use defensive parsing (see [Best Practices #6](#6-parse-results-defensively)).

### 4. Field name variations across events

The API uses inconsistent field names for similar data:

| Data | Possible field names |
|------|---------------------|
| Step text | `purpose`, `action`, `message`, `step`, `description`, `text` |
| Streaming URL | `streamingUrl`, `liveUrl`, `previewUrl`, `browser_url` |
| Result data | `resultJson`, `result`, `output`, `response`, `data` |

**Fix:** Check multiple field names in priority order.

### 5. Double-callback on timeout + completion race

If you use AbortController for timeout and the agent completes at the same moment, both the timeout handler and the completion handler may fire.

**Fix:** Use a `completed` flag:

```typescript
let completed = false;

// In completion handler:
if (completed) return;
completed = true;
callbacks?.onComplete?.(event.resultJson);

// In timeout handler:
if (completed) return;
completed = true;
callbacks?.onError?.("Timeout");
```

### 6. Platform-specific date formats

Different booking/travel sites expect different URL parameter formats:

| Platform | Date param names | Format |
|----------|-----------------|--------|
| Booking.com | `checkin` / `checkout` | YYYY-MM-DD |
| Expedia | `startDate` / `endDate` | YYYY-MM-DD |
| Hotels.com | `checkIn` / `checkOut` | YYYY-MM-DD |
| Agoda | `checkIn` / `checkOut` | YYYY-MM-DD |

Build platform-specific URL construction logic.

### 7. Geo-validation of scraped results

Food delivery and local search sites may return results from wrong cities. DoorDash URLs contain city slugs (e.g., `/store/name-los-angeles/`).

**Fix:** Validate geographic relevance post-scrape by checking address fields and URL structure. Reject out-of-area results.

### 8. JSON wrapped in markdown code blocks

Some responses come back as:

````
```json
[{"name": "Product", "price": "$29"}]
```
````

**Fix:**

```typescript
const cleaned = raw.replace(/```json\n?|```/g, "").trim();
const parsed = JSON.parse(cleaned);
```

### 9. Streaming URL is ephemeral

The `streamingUrl` expires when the automation run completes. Don't store it for later use. Display it in real-time during the run only.

### 10. SSE parse errors should be silent

Individual malformed SSE lines are normal. Don't terminate the stream on a parse error:

```typescript
try {
  event = JSON.parse(line.slice(6));
} catch {
  continue; // Skip malformed line, keep reading
}
```

### 11. Serverless timeout constraints

- Vercel Pro: 300s max function duration
- Vercel Hobby: 10s max
- Supabase: varies by plan

Ensure your per-source timeout fits within `maxDuration`. Example: if `maxDuration = 60s`, set source timeout to 45s to leave room for response handling.

### 12. System events pollute step handlers

Events with types like `STARTED`, `STREAMING_URL`, `HEARTBEAT`, `PING`, `CONNECTED`, `INIT` are internal. Filter them out of user-facing progress displays:

```typescript
const SYSTEM_TYPES = ["STARTED", "STREAMING_URL", "HEARTBEAT", "PING", "CONNECTED", "INIT"];

function isSystemEvent(event: TinyFishSSEEvent): boolean {
  const msg = (event.purpose || event.message || event.type || "").toUpperCase();
  return SYSTEM_TYPES.some((t) => msg.includes(t));
}
```

### 13. No pre-validation of URLs

TinyFish accepts any URL string. If the URL is unreachable, you'll get a timeout or ERROR event. There's no 400 for bad URLs.

---

## MCP and n8n Integration

### MCP Server (Claude/Cursor)

TinyFish provides an MCP server for direct integration with AI coding assistants.

Example `.mcp.json`:

```json
{
  "mcpServers": {
    "tinyfish": {
      "type": "http",
      "url": "https://mcp.tinyfish.ai/mcp"
    }
  }
}
```

### n8n Workflows

Pre-built workflows available in `/N8N_WorkFlows/`:

1. **Competitor Scout** -- OpenAI plans research goals, TinyFish collects evidence, aggregates comparison report
2. **Web Research Agent** -- Chat interface that scrapes websites and saves reports to Notion
3. **Daily Product Hunt Tracker** -- Scheduled daily, delivers top 5 trending products to Telegram

#### n8n Community Node Installation

```bash
npm install n8n-nodes-tinyfish --ignore-scripts
```

For Alpine Linux (Docker):

```bash
docker run --rm -v ~/.n8n/nodes:/out node:24-alpine sh -c "
  apk add python3 make g++ &&
  cd /out && npm init -y &&
  npm install n8n-nodes-tinyfish --ignore-scripts &&
  rm -rf node_modules/isolated-vm
"
```

#### n8n Polling Pattern

n8n uses async runs with status polling:
1. `POST /v1/automation/run-async` -- get `run_id`
2. Loop: `GET /v1/runs/{run_id}` -- check status every 3s
3. Exit loop on terminal status (`COMPLETED`, `FAILED`, `CANCELLED`)

---

## Use Cases

Production recipes from the cookbook, organized by category:

### Competitive Intelligence

| Recipe | What it does | Key pattern |
|--------|-------------|-------------|
| `competitor-analysis` | Live pricing dashboard across competitors | Parallel SSE + 3-tier goal detail levels |
| `competitor-scout-cli` | CLI for researching competitor features | AI-planned goals + async polling |

### E-Commerce and Price Comparison

| Recipe | What it does | Key pattern |
|--------|-------------|-------------|
| `game-buying-guide` | Compare game prices across 10 platforms | Parallel SSE, platform-specific goals |
| `lego-hunter` | Search 15+ retailers for rare Lego sets | Parallel execution with availability checks |
| `openbox-deals` | Aggregate open-box deals across 8 retailers | Python SSE + rate limiting |
| `waifu-deal-sniper` | Discord bot for discounted anime figures | 3-platform parallel + Discord integration |

### Travel and Local

| Recipe | What it does | Key pattern |
|--------|-------------|-------------|
| `stay-scout-hub` | Hotel search across booking platforms | Platform-specific URL construction + timeouts |
| `viet-bike-scout` | Motorbike rental comparison (Vietnam) | Geo-targeted proxy + parallel |
| `wing-command` | Find best chicken wings near you | 4-platform parallel + geo-validation + dedup |
| `restaurant-comparison-tool` | Pre-visit restaurant safety analysis | Google Maps + menu extraction |

### Research and Discovery

| Recipe | What it does | Key pattern |
|--------|-------------|-------------|
| `research-sentry` | Academic paper search (ArXiv, PubMed, etc.) | 5-source parallel + dedup by title |
| `concept-discovery-system` | Project idea validator | 10 parallel agents across GitHub/Dev.to/SO |
| `code-reference-finder` | Find real-world code usage examples | AI-generated goals + relevance scoring |
| `scholarship-finder` | Discover scholarships from official websites | Multi-source parallel |
| `summer-school-finder` | Compare university summer programs | SSE passthrough via Supabase |

### Testing and QA

| Recipe | What it does | Key pattern |
|--------|-------------|-------------|
| `fast-qa` | No-code QA with parallel test execution | Batch execution with configurable parallelism (1-10) |

### Supply Chain and Logistics

| Recipe | What it does | Key pattern |
|--------|-------------|-------------|
| `silicon-signal` | Semiconductor availability tracking | Per-source timeout budget + caching |
| `logistics-sentry` | Port congestion and carrier risk | Multi-portal parallel |
| `tenders-finder` | Singapore government tender discovery | Supabase edge functions + JSON code block parsing |

---

## Quick Reference

```
Base URL:        https://agent.tinyfish.ai/v1
Auth Header:     X-API-Key: <key>
SSE Endpoint:    POST /automation/run-sse
Async Endpoint:  POST /automation/run-async
Poll Status:     GET  /runs/{runId}
Cancel Run:      POST /runs/{runId}/cancel
CLI Install:     npm install -g @tiny-fish/cli
CLI Run:         tinyfish agent run --url <url> "<goal>"
```
