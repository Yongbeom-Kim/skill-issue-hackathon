# Travel Intelligence Planner — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a three-panel travel planner where a chat orchestrator (LangGraph) dispatches TinyFish agents to scrape real airline/hotel prices and community sentiment, updating left (trip plan tree) and right (live visualization) panels via Jotai atoms.

**Architecture:** All-frontend Vite+React app. LangGraph `createReactAgent` runs in the browser with 6 tools that write to Jotai atoms. TinyFish API calls go directly from browser (local demo, API key in env). No backend.

**Tech Stack:** Vite, React 19, TypeScript, Jotai, LangGraph (@langchain/langgraph), @langchain/openai, TinyFish SSE API, Zod

---

## File Map

```
frontend/src/
  types/
    index.ts                    ← All shared TypeScript interfaces
  atoms/
    tripPlan.ts                 ← TripPlan atom + helper functions
    liveView.ts                 ← LiveView atom + helper functions
    chat.ts                     ← ChatMessages atom
  lib/
    tinyfish.ts                 ← TinyFish SSE client (streams events)
    goals/
      flights.ts                ← Goal templates for airline sites
      hotels.ts                 ← Goal templates for hotel sites
      discovery.ts              ← Goal templates for XHS/Reddit
    tools/
      setRequirements.ts        ← Tool: save user requirements
      updateNode.ts             ← Tool: add/modify trip tree nodes
      dispatchDiscovery.ts      ← Tool: trigger XHS/Reddit scraping
      dispatchLogistics.ts      ← Tool: trigger flight/hotel scraping
      makeDecision.ts           ← Tool: lock in user's choice
      setActiveTopic.ts         ← Tool: switch active topic
    orchestrator.ts             ← LangGraph agent setup + system prompt
  hooks/
    useOrchestrator.ts          ← React hook wiring orchestrator to atoms
  components/
    Layout.tsx                  ← Three-panel CSS grid
    LeftPanel/
      LeftPanel.tsx             ← Trip tree container + budget display
      TripNodeItem.tsx          ← Recursive tree node component
    Chat/
      Chat.tsx                  ← Messages list + input box
      ChatBubble.tsx            ← Individual message bubble
    RightPanel/
      RightPanel.tsx            ← Agent activity + result cards container
      AgentStatusRow.tsx        ← "Checking Scoot..." animated row
      FlightCard.tsx            ← Flight result card
      HotelCard.tsx             ← Hotel result card
      DiscoveryCard.tsx         ← Community recommendation card
  App.tsx                       ← Root: Layout + providers
  main.tsx                      ← Entry point (no changes)
  index.css                     ← Global styles (extend existing)
```

---

## Task 1: Types

**Files:**
- Create: `frontend/src/types/index.ts`

- [ ] **Step 1: Create all shared TypeScript interfaces**

```typescript
// frontend/src/types/index.ts

// ── Left State ──────────────────────────────────────────────

export interface TripPlan {
  id: string
  requirements: UserRequirements | null
  nodes: TripNode[]
}

export interface UserRequirements {
  destination: string
  when: string
  budget: number
  budgetRemaining: number
  preferences: UserPreferences
}

export interface UserPreferences {
  canDrive: boolean
  hotelClass: "budget" | "mid" | "luxury"
  travelStyle: "relaxed" | "balanced" | "packed"
}

export type NodeStatus = "pending" | "active" | "decided"
export type NodeType = "destination" | "flight" | "hotel" | "activity" | "transport"

export interface TripNode {
  id: string
  type: NodeType
  label: string
  status: NodeStatus
  decision?: FlightOption | HotelOption | DiscoveryItem | null
  cost?: number
  children?: TripNode[]
}

// ── Right State ─────────────────────────────────────────────

export interface LiveView {
  topic: string
  phase: "empty" | "loading" | "results"
  agents: AgentStatus[]
  results: ViewResult | null
}

export interface AgentStatus {
  id: string
  name: string
  site: string
  status: "running" | "done" | "failed"
  message: string
}

export type ViewResultType = "flights" | "hotels" | "discovery" | "activities"

export interface ViewResult {
  type: ViewResultType
  items: (FlightOption | HotelOption | DiscoveryItem)[]
}

// ── Result Items ────────────────────────────────────────────

export interface FlightOption {
  id: string
  airline: string
  price: number
  currency: string
  departure: string
  arrival: string
  duration: string
  stops: number
  route: string
  date: string
  source: string
  sourceUrl: string
}

export interface HotelOption {
  id: string
  name: string
  pricePerNight: number
  totalPrice: number
  currency: string
  rating: number
  nights: number
  checkIn: string
  checkOut: string
  source: string
  sourceUrl: string
  available: boolean
}

export interface DiscoveryItem {
  id: string
  place: string
  sentiment: number
  postCount: number
  summary: string
  sources: string[]
  topQuote: string
  category: string
}

// ── Chat ────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/types/index.ts
git commit -m "feat: add shared TypeScript interfaces for trip planner"
```

---

## Task 2: Jotai Atoms

**Files:**
- Create: `frontend/src/atoms/tripPlan.ts`
- Create: `frontend/src/atoms/liveView.ts`
- Create: `frontend/src/atoms/chat.ts`
- Modify: `frontend/src/atoms/index.ts`

- [ ] **Step 1: Create tripPlan atom with helpers**

```typescript
// frontend/src/atoms/tripPlan.ts
import { atom } from "jotai"
import type { TripPlan, TripNode, NodeStatus, UserRequirements } from "../types"

export const tripPlanAtom = atom<TripPlan>({
  id: crypto.randomUUID(),
  requirements: null,
  nodes: [],
})

// Helper: find a node by id (recursive)
export function findNode(nodes: TripNode[], id: string): TripNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

// Helper: update a node by id (returns new tree, immutable)
export function updateNodeInTree(
  nodes: TripNode[],
  id: string,
  updates: Partial<TripNode>
): TripNode[] {
  return nodes.map((node) => {
    if (node.id === id) return { ...node, ...updates }
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, id, updates) }
    }
    return node
  })
}

// Helper: add a child node under a parent
export function addChildNode(
  nodes: TripNode[],
  parentId: string,
  child: TripNode
): TripNode[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: [...(node.children ?? []), child] }
    }
    if (node.children) {
      return { ...node, children: addChildNode(node.children, parentId, child) }
    }
    return node
  })
}

// Helper: set all "active" nodes back to "pending", set one node to "active"
export function setActiveNode(nodes: TripNode[], activeId: string): TripNode[] {
  return nodes.map((node) => {
    const newStatus: NodeStatus =
      node.id === activeId ? "active" : node.status === "active" ? "pending" : node.status
    const newChildren = node.children
      ? setActiveNode(node.children, activeId)
      : node.children
    return { ...node, status: newStatus, children: newChildren }
  })
}

// Helper: calculate total spent from decided nodes
export function calculateSpent(nodes: TripNode[]): number {
  let total = 0
  for (const node of nodes) {
    if (node.status === "decided" && node.cost) total += node.cost
    if (node.children) total += calculateSpent(node.children)
  }
  return total
}
```

- [ ] **Step 2: Create liveView atom**

```typescript
// frontend/src/atoms/liveView.ts
import { atom } from "jotai"
import type { LiveView, AgentStatus } from "../types"

export const liveViewAtom = atom<LiveView>({
  topic: "",
  phase: "empty",
  agents: [],
  results: null,
})

// Helper: update a specific agent's status
export function updateAgentInList(
  agents: AgentStatus[],
  agentId: string,
  updates: Partial<AgentStatus>
): AgentStatus[] {
  return agents.map((a) => (a.id === agentId ? { ...a, ...updates } : a))
}
```

- [ ] **Step 3: Create chat atom**

```typescript
// frontend/src/atoms/chat.ts
import { atom } from "jotai"
import type { ChatMessage } from "../types"

export const chatMessagesAtom = atom<ChatMessage[]>([])
```

- [ ] **Step 4: Update atoms index to re-export**

```typescript
// frontend/src/atoms/index.ts
export { tripPlanAtom } from "./tripPlan"
export { liveViewAtom } from "./liveView"
export { chatMessagesAtom } from "./chat"
```

- [ ] **Step 5: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add frontend/src/atoms/
git commit -m "feat: add Jotai atoms for trip plan, live view, and chat"
```

---

## Task 3: TinyFish SSE Client

**Files:**
- Modify: `frontend/src/lib/tinyfish-agent.ts` (rewrite)

This replaces the existing file. The existing code returns only the final result — we need streaming progress events for the right panel.

- [ ] **Step 1: Rewrite tinyfish client with SSE streaming + callbacks**

```typescript
// frontend/src/lib/tinyfish-agent.ts

const TINYFISH_API_KEY = import.meta.env.VITE_TINYFISH_API_KEY ?? ""
const TINYFISH_BASE_URL = "https://agent.tinyfish.ai/v1"

export interface TinyFishRunOptions {
  url: string
  goal: string
  browserProfile?: "lite" | "stealth"
  proxyCountry?: string
  onProgress?: (message: string) => void
  onStreamingUrl?: (url: string) => void
}

export interface TinyFishResult {
  success: boolean
  data: unknown
  error?: string
}

const SYSTEM_EVENTS = new Set([
  "STARTED", "STREAMING_URL", "HEARTBEAT", "PING", "CONNECTED", "INIT",
])

export async function runTinyFish(options: TinyFishRunOptions): Promise<TinyFishResult> {
  const body: Record<string, unknown> = {
    url: options.url,
    goal: options.goal,
    browser_profile: options.browserProfile ?? "lite",
  }

  if (options.proxyCountry) {
    body.proxy_config = { enabled: true, country_code: options.proxyCountry }
  }

  const response = await fetch(`${TINYFISH_BASE_URL}/automation/run-sse`, {
    method: "POST",
    headers: {
      "X-API-Key": TINYFISH_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    return { success: false, data: null, error: `HTTP ${response.status}` }
  }

  const reader = response.body?.getReader()
  if (!reader) {
    return { success: false, data: null, error: "No response body" }
  }

  const decoder = new TextDecoder()
  let resultData: unknown = null

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    for (const line of chunk.split("\n")) {
      if (!line.startsWith("data: ")) continue
      try {
        const event = JSON.parse(line.slice(6))

        // Streaming URL
        const streamUrl = event.streamingUrl ?? event.liveUrl ?? event.previewUrl
        if (streamUrl && options.onStreamingUrl) {
          options.onStreamingUrl(streamUrl)
        }

        // Progress (skip system events)
        if (event.type === "STEP" && !SYSTEM_EVENTS.has(event.purpose)) {
          const msg = event.purpose ?? event.action ?? event.message ?? "Processing..."
          options.onProgress?.(msg)
        }

        // Complete
        if (event.type === "COMPLETE" && event.status === "COMPLETED") {
          resultData = event.resultJson
        }

        // Error
        if (event.type === "ERROR" || event.status === "FAILED") {
          return { success: false, data: null, error: event.message ?? "Run failed" }
        }
      } catch {
        // skip malformed lines
      }
    }
  }

  if (resultData !== null) {
    return { success: true, data: resultData }
  }
  return { success: false, data: null, error: "No result received" }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/tinyfish-agent.ts
git commit -m "feat: rewrite TinyFish client with SSE streaming callbacks"
```

---

## Task 4: TinyFish Goal Templates

**Files:**
- Create: `frontend/src/lib/goals/flights.ts`
- Create: `frontend/src/lib/goals/hotels.ts`
- Create: `frontend/src/lib/goals/discovery.ts`

- [ ] **Step 1: Create flight goal templates**

```typescript
// frontend/src/lib/goals/flights.ts

export interface FlightSearchParams {
  from: string   // "SIN"
  to: string     // "SYD"
  date: string   // "2026-05-01"
}

// Each entry: [site name, url, needs stealth]
const AIRLINE_SITES: [string, (p: FlightSearchParams) => string, boolean][] = [
  [
    "Singapore Airlines",
    (p) => `https://www.singaporeair.com/en_UK/plan-and-book/search-flights/?from=${p.from}&to=${p.to}&departDate=${p.date}&cabinClass=economy&adult=1`,
    true,
  ],
  [
    "Scoot",
    (p) => `https://www.flyscoot.com/en`,
    true,
  ],
  [
    "Jetstar",
    (p) => `https://www.jetstar.com/sg/en/home`,
    true,
  ],
  [
    "AirAsia",
    (p) => `https://www.airasia.com/flights/search`,
    true,
  ],
  [
    "Qantas",
    (p) => `https://www.qantas.com/au/en.html`,
    true,
  ],
]

export function getFlightGoal(p: FlightSearchParams): string {
  return (
    `Search for one-way flights from ${p.from} to ${p.to} on ${p.date} for 1 adult economy. ` +
    `Extract all available flights as JSON array: ` +
    `[{"airline": string, "price": number, "currency": "SGD", "departure": "HH:MM", ` +
    `"arrival": "HH:MM", "duration": string, "stops": number}]. ` +
    `If prices are in another currency, convert to SGD.`
  )
}

export function getFlightSites(p: FlightSearchParams) {
  return AIRLINE_SITES.map(([name, urlFn, stealth]) => ({
    name,
    url: urlFn(p),
    browserProfile: stealth ? "stealth" as const : "lite" as const,
    goal: getFlightGoal(p),
  }))
}
```

- [ ] **Step 2: Create hotel goal templates**

```typescript
// frontend/src/lib/goals/hotels.ts

export interface HotelSearchParams {
  city: string       // "Sydney"
  checkIn: string    // "2026-05-01"
  checkOut: string   // "2026-05-05"
}

const HOTEL_SITES: [string, (p: HotelSearchParams) => string][] = [
  [
    "Booking.com",
    (p) => `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(p.city)}&checkin=${p.checkIn}&checkout=${p.checkOut}&group_adults=2`,
  ],
  [
    "Agoda",
    (p) => `https://www.agoda.com/search?city=${encodeURIComponent(p.city)}&checkIn=${p.checkIn}&checkOut=${p.checkOut}&adults=2`,
  ],
]

export function getHotelGoal(p: HotelSearchParams): string {
  return (
    `Search for hotels in ${p.city} from ${p.checkIn} to ${p.checkOut} for 2 adults. ` +
    `Extract top 10 results as JSON array: ` +
    `[{"name": string, "pricePerNight": number, "totalPrice": number, "currency": "SGD", ` +
    `"rating": number, "available": boolean}]. ` +
    `If prices are in another currency, convert to SGD.`
  )
}

export function getHotelSites(p: HotelSearchParams) {
  return HOTEL_SITES.map(([name, urlFn]) => ({
    name,
    url: urlFn(p),
    browserProfile: "stealth" as const,
    goal: getHotelGoal(p),
  }))
}
```

- [ ] **Step 3: Create discovery goal templates**

```typescript
// frontend/src/lib/goals/discovery.ts

export interface DiscoverySearchParams {
  destination: string  // "Melbourne"
  days?: number        // 10
  query?: string       // optional override
}

interface DiscoverySite {
  name: string
  url: string
  browserProfile: "lite" | "stealth"
  goal: string
}

export function getDiscoverySites(p: DiscoverySearchParams): DiscoverySite[] {
  const sites: DiscoverySite[] = []
  const q = p.query ?? `${p.destination} ${p.days ?? ""}day itinerary`

  // XHS (Xiaohongshu)
  const xhsQuery = encodeURIComponent(`${p.destination} ${p.days ?? ""}天攻略`)
  sites.push({
    name: "Xiaohongshu (XHS)",
    url: `https://www.xiaohongshu.com/search_result?keyword=${xhsQuery}`,
    browserProfile: "stealth",
    goal:
      `Search for "${p.destination} ${p.days ?? ""}天攻略" travel guides. ` +
      `Extract top 10 posts as JSON array: ` +
      `[{"title": string, "summary": string (2-3 sentence summary of the itinerary/recommendations), ` +
      `"places": string[] (key places mentioned), "sentiment": "positive" | "mixed" | "negative", ` +
      `"likes": number}]. Translate Chinese content to English in the summary.`,
  })

  // Reddit r/travel
  const redditQuery = encodeURIComponent(q)
  sites.push({
    name: "Reddit r/travel",
    url: `https://www.reddit.com/r/travel/search/?q=${redditQuery}&sort=relevance`,
    browserProfile: "stealth",
    goal:
      `Search for "${q}" travel recommendations. ` +
      `Extract top 10 relevant posts as JSON array: ` +
      `[{"title": string, "summary": string (2-3 sentence summary of recommendations), ` +
      `"places": string[] (key places mentioned), "upvotes": number, ` +
      `"topAdvice": string (most useful tip from the post)}].`,
  })

  // Reddit r/solotravel
  sites.push({
    name: "Reddit r/solotravel",
    url: `https://www.reddit.com/r/solotravel/search/?q=${redditQuery}&sort=relevance`,
    browserProfile: "stealth",
    goal:
      `Search for "${q}" solo travel recommendations. ` +
      `Extract top 5 relevant posts as JSON array: ` +
      `[{"title": string, "summary": string, "places": string[], "upvotes": number, ` +
      `"topAdvice": string}].`,
  })

  return sites
}
```

- [ ] **Step 4: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/goals/
git commit -m "feat: add TinyFish goal templates for flights, hotels, and discovery"
```

---

## Task 5: LangGraph Tool Handlers

**Files:**
- Create: `frontend/src/lib/tools/setRequirements.ts`
- Create: `frontend/src/lib/tools/updateNode.ts`
- Create: `frontend/src/lib/tools/dispatchDiscovery.ts`
- Create: `frontend/src/lib/tools/dispatchLogistics.ts`
- Create: `frontend/src/lib/tools/makeDecision.ts`
- Create: `frontend/src/lib/tools/setActiveTopic.ts`

Each tool is a factory function that takes Jotai setters and returns a LangGraph `DynamicStructuredTool`.

- [ ] **Step 1: Create setRequirements tool**

```typescript
// frontend/src/lib/tools/setRequirements.ts
import { DynamicStructuredTool } from "@langchain/core/tools"
import { z } from "zod"
import type { WritableAtom } from "jotai"
import type { TripPlan, UserRequirements, UserPreferences } from "../../types"

type SetTripPlan = (fn: (prev: TripPlan) => TripPlan) => void

export function makeSetRequirementsTool(setTripPlan: SetTripPlan) {
  return new DynamicStructuredTool({
    name: "set_requirements",
    description:
      "Save the user's trip requirements. Call this once the user has told you where they want to go, when, their budget, and preferences.",
    schema: z.object({
      destination: z.string().describe("Where the user wants to go, e.g. 'Australia — Sydney + Melbourne'"),
      when: z.string().describe("Travel dates, e.g. 'May 1-10, 2026'"),
      budget: z.number().describe("Total trip budget in SGD"),
      canDrive: z.boolean().describe("Whether the user has a driving license"),
      hotelClass: z.enum(["budget", "mid", "luxury"]).describe("Preferred hotel class"),
      travelStyle: z.enum(["relaxed", "balanced", "packed"]).describe("How packed the itinerary should be"),
    }),
    func: async ({ destination, when, budget, canDrive, hotelClass, travelStyle }) => {
      const requirements: UserRequirements = {
        destination,
        when,
        budget,
        budgetRemaining: budget,
        preferences: { canDrive, hotelClass, travelStyle } as UserPreferences,
      }
      setTripPlan((prev) => ({ ...prev, requirements }))
      return `Requirements saved: ${destination}, ${when}, $${budget} budget.`
    },
  })
}
```

- [ ] **Step 2: Create updateNode tool**

```typescript
// frontend/src/lib/tools/updateNode.ts
import { DynamicStructuredTool } from "@langchain/core/tools"
import { z } from "zod"
import type { TripPlan, TripNode, NodeType, NodeStatus } from "../../types"
import { addChildNode, updateNodeInTree } from "../../atoms/tripPlan"

type SetTripPlan = (fn: (prev: TripPlan) => TripPlan) => void

export function makeUpdateNodeTool(setTripPlan: SetTripPlan) {
  return new DynamicStructuredTool({
    name: "update_node",
    description:
      "Add or modify a node in the trip plan tree. Use parentId to create a child node. " +
      "Omit parentId to create a root node or update an existing node by nodeId.",
    schema: z.object({
      nodeId: z.string().describe("Unique id for this node"),
      parentId: z.string().optional().describe("Parent node id. If set, creates a child node."),
      type: z.enum(["destination", "flight", "hotel", "activity", "transport"]).optional(),
      label: z.string().optional().describe("Display label, e.g. 'Flight SIN → SYD'"),
      status: z.enum(["pending", "active", "decided"]).optional(),
    }),
    func: async ({ nodeId, parentId, type, label, status }) => {
      setTripPlan((prev) => {
        // Check if node already exists
        const exists = findNodeFlat(prev.nodes, nodeId)
        if (exists) {
          // Update existing node
          const updates: Partial<TripNode> = {}
          if (type) updates.type = type as NodeType
          if (label) updates.label = label
          if (status) updates.status = status as NodeStatus
          return { ...prev, nodes: updateNodeInTree(prev.nodes, nodeId, updates) }
        }
        // Create new node
        const newNode: TripNode = {
          id: nodeId,
          type: (type ?? "destination") as NodeType,
          label: label ?? nodeId,
          status: (status ?? "pending") as NodeStatus,
          children: [],
        }
        if (parentId) {
          return { ...prev, nodes: addChildNode(prev.nodes, parentId, newNode) }
        }
        return { ...prev, nodes: [...prev.nodes, newNode] }
      })
      return `Node "${label ?? nodeId}" updated.`
    },
  })
}

function findNodeFlat(nodes: TripNode[], id: string): boolean {
  for (const n of nodes) {
    if (n.id === id) return true
    if (n.children && findNodeFlat(n.children, id)) return true
  }
  return false
}
```

- [ ] **Step 3: Create dispatchDiscovery tool**

```typescript
// frontend/src/lib/tools/dispatchDiscovery.ts
import { DynamicStructuredTool } from "@langchain/core/tools"
import { z } from "zod"
import type { LiveView, AgentStatus, DiscoveryItem } from "../../types"
import { getDiscoverySites } from "../goals/discovery"
import { runTinyFish } from "../tinyfish-agent"

type SetLiveView = (fn: (prev: LiveView) => LiveView) => void

export function makeDispatchDiscoveryTool(setLiveView: SetLiveView) {
  return new DynamicStructuredTool({
    name: "dispatch_discovery",
    description:
      "Search community sources (XHS/Xiaohongshu, Reddit) for travel recommendations and itinerary ideas for a destination.",
    schema: z.object({
      destination: z.string().describe("Destination to search for, e.g. 'Melbourne'"),
      days: z.number().optional().describe("Trip length in days"),
      query: z.string().optional().describe("Custom search query override"),
    }),
    func: async ({ destination, days, query }) => {
      const sites = getDiscoverySites({ destination, days, query })

      // Initialize agents as loading
      const agents: AgentStatus[] = sites.map((s) => ({
        id: crypto.randomUUID(),
        name: s.name,
        site: new URL(s.url).hostname,
        status: "running" as const,
        message: `Searching ${s.name}...`,
      }))
      setLiveView(() => ({ topic: "", phase: "loading", agents, results: null }))

      // Run all agents in parallel
      const allItems: DiscoveryItem[] = []
      await Promise.all(
        sites.map(async (site, i) => {
          const agentId = agents[i].id
          try {
            const result = await runTinyFish({
              url: site.url,
              goal: site.goal,
              browserProfile: site.browserProfile,
              onProgress: (msg) => {
                setLiveView((prev) => ({
                  ...prev,
                  agents: prev.agents.map((a) =>
                    a.id === agentId ? { ...a, message: msg } : a
                  ),
                }))
              },
            })
            setLiveView((prev) => ({
              ...prev,
              agents: prev.agents.map((a) =>
                a.id === agentId ? { ...a, status: "done", message: "Complete" } : a
              ),
            }))
            if (result.success && Array.isArray(result.data)) {
              const items = (result.data as Record<string, unknown>[]).map((raw) => ({
                id: crypto.randomUUID(),
                place: String(raw.title ?? raw.place ?? ""),
                sentiment: raw.sentiment === "positive" ? 0.9 : raw.sentiment === "mixed" ? 0.5 : 0.3,
                postCount: Number(raw.likes ?? raw.upvotes ?? 0),
                summary: String(raw.summary ?? ""),
                sources: [site.name.toLowerCase()],
                topQuote: String(raw.topAdvice ?? raw.summary ?? ""),
                category: "attraction",
              })) as DiscoveryItem[]
              allItems.push(...items)
            }
          } catch {
            setLiveView((prev) => ({
              ...prev,
              agents: prev.agents.map((a) =>
                a.id === agentId ? { ...a, status: "failed", message: "Failed" } : a
              ),
            }))
          }
        })
      )

      // Set results
      setLiveView((prev) => ({
        ...prev,
        phase: "results",
        results: { type: "discovery", items: allItems },
      }))

      return allItems.length > 0
        ? `Found ${allItems.length} recommendations from ${sites.length} sources. Top places: ${allItems.slice(0, 5).map((d) => d.place).join(", ")}`
        : "No community recommendations found. Try broadening the search."
    },
  })
}
```

- [ ] **Step 4: Create dispatchLogistics tool**

```typescript
// frontend/src/lib/tools/dispatchLogistics.ts
import { DynamicStructuredTool } from "@langchain/core/tools"
import { z } from "zod"
import type { LiveView, AgentStatus, FlightOption, HotelOption } from "../../types"
import { getFlightSites, type FlightSearchParams } from "../goals/flights"
import { getHotelSites, type HotelSearchParams } from "../goals/hotels"
import { runTinyFish } from "../tinyfish-agent"

type SetLiveView = (fn: (prev: LiveView) => LiveView) => void

export function makeDispatchLogisticsTool(setLiveView: SetLiveView) {
  return new DynamicStructuredTool({
    name: "dispatch_logistics",
    description:
      "Search for real-time flight or hotel prices by scraping actual booking sites. " +
      "For flights, provide from/to airport codes and date. For hotels, provide city and check-in/check-out dates.",
    schema: z.object({
      type: z.enum(["flight", "hotel"]).describe("What to search for"),
      from: z.string().optional().describe("Origin airport code for flights, e.g. 'SIN'"),
      to: z.string().describe("Destination airport code (flights) or city name (hotels)"),
      date: z.string().describe("Departure date (flights) or check-in date (hotels), YYYY-MM-DD"),
      returnDate: z.string().optional().describe("Check-out date for hotels, YYYY-MM-DD"),
      nights: z.number().optional().describe("Number of nights for hotels"),
      maxBudget: z.number().optional().describe("Max budget in SGD to filter results"),
    }),
    func: async ({ type, from, to, date, returnDate, nights }) => {
      const sites =
        type === "flight"
          ? getFlightSites({ from: from ?? "SIN", to, date } as FlightSearchParams)
          : getHotelSites({
              city: to,
              checkIn: date,
              checkOut: returnDate ?? addDays(date, nights ?? 3),
            } as HotelSearchParams)

      // Initialize agents as loading
      const agents: AgentStatus[] = sites.map((s) => ({
        id: crypto.randomUUID(),
        name: s.name,
        site: new URL(s.url).hostname,
        status: "running" as const,
        message: `Checking ${s.name}...`,
      }))
      setLiveView(() => ({ topic: "", phase: "loading", agents, results: null }))

      // Run all agents in parallel
      const allItems: (FlightOption | HotelOption)[] = []
      await Promise.all(
        sites.map(async (site, i) => {
          const agentId = agents[i].id
          try {
            const result = await runTinyFish({
              url: site.url,
              goal: site.goal,
              browserProfile: site.browserProfile,
              onProgress: (msg) => {
                setLiveView((prev) => ({
                  ...prev,
                  agents: prev.agents.map((a) =>
                    a.id === agentId ? { ...a, message: msg } : a
                  ),
                }))
              },
            })
            setLiveView((prev) => ({
              ...prev,
              agents: prev.agents.map((a) =>
                a.id === agentId ? { ...a, status: "done", message: "Complete" } : a
              ),
            }))
            if (result.success && Array.isArray(result.data)) {
              if (type === "flight") {
                const items = (result.data as Record<string, unknown>[]).map((raw) => ({
                  id: crypto.randomUUID(),
                  airline: String(raw.airline ?? site.name),
                  price: Number(raw.price ?? 0),
                  currency: String(raw.currency ?? "SGD"),
                  departure: String(raw.departure ?? ""),
                  arrival: String(raw.arrival ?? ""),
                  duration: String(raw.duration ?? ""),
                  stops: Number(raw.stops ?? 0),
                  route: `${from ?? "SIN"} → ${to}`,
                  date,
                  source: site.name,
                  sourceUrl: site.url,
                })) as FlightOption[]
                allItems.push(...items)
              } else {
                const items = (result.data as Record<string, unknown>[]).map((raw) => ({
                  id: crypto.randomUUID(),
                  name: String(raw.name ?? ""),
                  pricePerNight: Number(raw.pricePerNight ?? 0),
                  totalPrice: Number(raw.totalPrice ?? 0),
                  currency: String(raw.currency ?? "SGD"),
                  rating: Number(raw.rating ?? 0),
                  nights: nights ?? 3,
                  checkIn: date,
                  checkOut: returnDate ?? addDays(date, nights ?? 3),
                  source: site.name,
                  sourceUrl: site.url,
                  available: Boolean(raw.available ?? true),
                })) as HotelOption[]
                allItems.push(...items)
              }
            }
          } catch {
            setLiveView((prev) => ({
              ...prev,
              agents: prev.agents.map((a) =>
                a.id === agentId ? { ...a, status: "failed", message: "Failed" } : a
              ),
            }))
          }
        })
      )

      // Sort by price
      allItems.sort((a, b) => {
        const priceA = "price" in a ? a.price : a.totalPrice
        const priceB = "price" in b ? b.price : b.totalPrice
        return priceA - priceB
      })

      setLiveView((prev) => ({
        ...prev,
        phase: "results",
        results: { type: type === "flight" ? "flights" : "hotels", items: allItems },
      }))

      if (allItems.length === 0) return "No results found. The sites may be blocking or slow."
      if (type === "flight") {
        const cheapest = allItems[0] as FlightOption
        return `Found ${allItems.length} flights. Cheapest: ${cheapest.airline} at $${cheapest.price} SGD.`
      }
      const cheapest = allItems[0] as HotelOption
      return `Found ${allItems.length} hotels. Cheapest: ${cheapest.name} at $${cheapest.pricePerNight}/night.`
    },
  })
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}
```

- [ ] **Step 5: Create makeDecision tool**

```typescript
// frontend/src/lib/tools/makeDecision.ts
import { DynamicStructuredTool } from "@langchain/core/tools"
import { z } from "zod"
import type { TripPlan } from "../../types"
import { updateNodeInTree } from "../../atoms/tripPlan"

type SetTripPlan = (fn: (prev: TripPlan) => TripPlan) => void

export function makeMakeDecisionTool(
  setTripPlan: SetTripPlan,
  getResults: () => (Record<string, unknown> & { id: string })[]
) {
  return new DynamicStructuredTool({
    name: "make_decision",
    description:
      "Lock in the user's choice for a trip item (flight, hotel, etc). " +
      "This marks the node as decided and deducts the cost from the remaining budget.",
    schema: z.object({
      nodeId: z.string().describe("The trip tree node id to mark as decided"),
      choiceId: z.string().describe("The id of the chosen option from the results"),
      cost: z.number().describe("The cost of the choice in SGD"),
    }),
    func: async ({ nodeId, choiceId, cost }) => {
      const results = getResults()
      const choice = results.find((r) => r.id === choiceId) ?? null

      setTripPlan((prev) => {
        const updatedNodes = updateNodeInTree(prev.nodes, nodeId, {
          status: "decided",
          decision: choice as TripPlan["nodes"][0]["decision"],
          cost,
        })
        const newRemaining = (prev.requirements?.budgetRemaining ?? 0) - cost
        return {
          ...prev,
          nodes: updatedNodes,
          requirements: prev.requirements
            ? { ...prev.requirements, budgetRemaining: newRemaining }
            : prev.requirements,
        }
      })

      return `Decision locked. $${cost} SGD deducted. Budget updated.`
    },
  })
}
```

- [ ] **Step 6: Create setActiveTopic tool**

```typescript
// frontend/src/lib/tools/setActiveTopic.ts
import { DynamicStructuredTool } from "@langchain/core/tools"
import { z } from "zod"
import type { TripPlan, LiveView } from "../../types"
import { setActiveNode } from "../../atoms/tripPlan"

type SetTripPlan = (fn: (prev: TripPlan) => TripPlan) => void
type SetLiveView = (fn: (prev: LiveView) => LiveView) => void

export function makeSetActiveTopicTool(setTripPlan: SetTripPlan, setLiveView: SetLiveView) {
  return new DynamicStructuredTool({
    name: "set_active_topic",
    description:
      "Switch the active topic in the trip plan. " +
      "This bolds the node in the left panel and clears the right panel for new results.",
    schema: z.object({
      nodeId: z.string().describe("The node id to make active"),
    }),
    func: async ({ nodeId }) => {
      setTripPlan((prev) => ({
        ...prev,
        nodes: setActiveNode(prev.nodes, nodeId),
      }))
      setLiveView(() => ({
        topic: nodeId,
        phase: "empty",
        agents: [],
        results: null,
      }))
      return `Active topic set to ${nodeId}. Right panel cleared.`
    },
  })
}
```

- [ ] **Step 7: Verify all tools compile**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add frontend/src/lib/tools/
git commit -m "feat: add all 6 LangGraph tool handlers"
```

---

## Task 6: Orchestrator (LangGraph Agent)

**Files:**
- Create: `frontend/src/lib/orchestrator.ts`
- Create: `frontend/src/hooks/useOrchestrator.ts`

- [ ] **Step 1: Create orchestrator with system prompt**

```typescript
// frontend/src/lib/orchestrator.ts
import { ChatOpenAI } from "@langchain/openai"
import { createReactAgent } from "@langchain/langgraph/prebuilt"
import type { DynamicStructuredTool } from "@langchain/core/tools"

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY ?? ""

const SYSTEM_PROMPT = `You are a travel planning assistant that helps users plan trips step by step.

You have access to tools that control a trip planning UI with three panels:
- LEFT: Trip plan tree showing structure and decisions
- MIDDLE: This chat
- RIGHT: Live visualization of agent results

## Flow
1. Greet the user and ask where they want to go.
2. Collect requirements: destination, dates (when), budget, preferences (can they drive, hotel class: budget/mid/luxury, travel style: relaxed/balanced/packed).
3. Once you have requirements, call set_requirements to save them.
4. Call update_node to build the trip tree structure (destinations, then flights/hotels/activities under each).
5. For each destination, call dispatch_discovery to get community recommendations from XHS and Reddit.
6. Summarize the community consensus and ask the user to approve the routing.
7. Call dispatch_logistics for flights, present options, ask user to choose.
8. When user chooses, call make_decision to lock it in.
9. Move to hotels, then activities, for each leg.
10. Use set_active_topic when moving between topics.

## Rules
- Always tell the user what you're about to search BEFORE dispatching agents.
- After results come in, summarize the top 3-5 options and ask the user to choose.
- Track remaining budget. Warn if a choice would exceed it.
- Be conversational and helpful. Suggest options but let the user decide.
- When calling dispatch_logistics for flights, use 3-letter airport codes (SIN, SYD, MEL, etc).
- When calling dispatch_discovery, include the number of days if known.
- Create node IDs that are short and descriptive, like "sydney", "syd-flight", "syd-hotel", "mel-day1".`

export function createOrchestrator(tools: DynamicStructuredTool[]) {
  const llm = new ChatOpenAI({
    model: "gpt-4o",
    apiKey: OPENAI_API_KEY,
  })

  return createReactAgent({
    llm,
    tools,
    messageModifier: SYSTEM_PROMPT,
  })
}
```

- [ ] **Step 2: Create useOrchestrator React hook**

```typescript
// frontend/src/hooks/useOrchestrator.ts
import { useCallback, useMemo, useRef } from "react"
import { useAtom } from "jotai"
import { tripPlanAtom } from "../atoms/tripPlan"
import { liveViewAtom } from "../atoms/liveView"
import { chatMessagesAtom } from "../atoms/chat"
import { createOrchestrator } from "../lib/orchestrator"
import { makeSetRequirementsTool } from "../lib/tools/setRequirements"
import { makeUpdateNodeTool } from "../lib/tools/updateNode"
import { makeDispatchDiscoveryTool } from "../lib/tools/dispatchDiscovery"
import { makeDispatchLogisticsTool } from "../lib/tools/dispatchLogistics"
import { makeMakeDecisionTool } from "../lib/tools/makeDecision"
import { makeSetActiveTopicTool } from "../lib/tools/setActiveTopic"
import type { ChatMessage } from "../types"
import type { BaseMessage } from "@langchain/core/messages"

export function useOrchestrator() {
  const [, setTripPlan] = useAtom(tripPlanAtom)
  const [liveView] = useAtom(liveViewAtom)
  const [, setLiveView] = useAtom(liveViewAtom)
  const [chatMessages, setChatMessages] = useAtom(chatMessagesAtom)

  // Keep a ref to the current results for makeDecision
  const liveViewRef = useRef(liveView)
  liveViewRef.current = liveView

  const getResults = useCallback(
    () => (liveViewRef.current.results?.items ?? []) as (Record<string, unknown> & { id: string })[],
    []
  )

  const agent = useMemo(() => {
    const tools = [
      makeSetRequirementsTool(setTripPlan),
      makeUpdateNodeTool(setTripPlan),
      makeDispatchDiscoveryTool(setLiveView),
      makeDispatchLogisticsTool(setLiveView),
      makeMakeDecisionTool(setTripPlan, getResults),
      makeSetActiveTopicTool(setTripPlan, setLiveView),
    ]
    return createOrchestrator(tools)
  }, [setTripPlan, setLiveView, getResults])

  // Convert our ChatMessage[] to LangGraph BaseMessage format
  const messagesRef = useRef<BaseMessage[]>([])

  const sendMessage = useCallback(
    async (text: string) => {
      // Add user message to chat
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      }
      setChatMessages((prev) => [...prev, userMsg])

      // Invoke agent
      const result = await agent.invoke({
        messages: [...messagesRef.current, { role: "user", content: text }],
      })

      // Store full message history for context
      messagesRef.current = result.messages

      // Extract assistant's final text response
      const lastMessage = result.messages[result.messages.length - 1]
      const content =
        typeof lastMessage.content === "string"
          ? lastMessage.content
          : JSON.stringify(lastMessage.content)

      // Add assistant message to chat
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content,
        timestamp: Date.now(),
      }
      setChatMessages((prev) => [...prev, assistantMsg])

      return content
    },
    [agent, setChatMessages]
  )

  return { sendMessage, chatMessages }
}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/orchestrator.ts frontend/src/hooks/useOrchestrator.ts
git commit -m "feat: add LangGraph orchestrator and useOrchestrator hook"
```

---

## Task 7: Frontend Components

**Files:**
- Create: `frontend/src/components/Layout.tsx`
- Create: `frontend/src/components/LeftPanel/LeftPanel.tsx`
- Create: `frontend/src/components/LeftPanel/TripNodeItem.tsx`
- Create: `frontend/src/components/Chat/Chat.tsx`
- Create: `frontend/src/components/Chat/ChatBubble.tsx`
- Create: `frontend/src/components/RightPanel/RightPanel.tsx`
- Create: `frontend/src/components/RightPanel/AgentStatusRow.tsx`
- Create: `frontend/src/components/RightPanel/FlightCard.tsx`
- Create: `frontend/src/components/RightPanel/HotelCard.tsx`
- Create: `frontend/src/components/RightPanel/DiscoveryCard.tsx`
- Modify: `frontend/src/App.tsx`

**Note for Person 1 (frontend):** This task is YOUR primary task. The code below is a working skeleton — style and polish it using the frontend-design skill. Build it first with mock data by hardcoding atoms, then wire to the real orchestrator.

- [ ] **Step 1: Create Layout**

```tsx
// frontend/src/components/Layout.tsx
import type { ReactNode } from "react"

interface LayoutProps {
  left: ReactNode
  middle: ReactNode
  right: ReactNode
}

export function Layout({ left, middle, right }: LayoutProps) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "280px 1fr 380px",
      height: "100vh",
      overflow: "hidden",
    }}>
      <div style={{ borderRight: "1px solid var(--border)", overflow: "auto", padding: "16px" }}>
        {left}
      </div>
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {middle}
      </div>
      <div style={{ borderLeft: "1px solid var(--border)", overflow: "auto", padding: "16px" }}>
        {right}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create LeftPanel + TripNodeItem**

```tsx
// frontend/src/components/LeftPanel/TripNodeItem.tsx
import type { TripNode } from "../../types"

interface Props {
  node: TripNode
  depth: number
  onNodeClick: (nodeId: string) => void
}

export function TripNodeItem({ node, depth, onNodeClick }: Props) {
  const icon = node.status === "decided" ? "\u2705" : node.status === "active" ? "\u25B6" : "\u25CB"
  const weight = node.status === "active" ? "bold" : "normal"

  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <div
        onClick={() => onNodeClick(node.id)}
        style={{ cursor: "pointer", fontWeight: weight, padding: "4px 0", display: "flex", gap: 8 }}
      >
        <span>{icon}</span>
        <span>{node.label}</span>
        {node.cost != null && node.status === "decided" && (
          <span style={{ color: "var(--text)", fontSize: 14 }}>${node.cost}</span>
        )}
      </div>
      {node.children?.map((child) => (
        <TripNodeItem key={child.id} node={child} depth={depth + 1} onNodeClick={onNodeClick} />
      ))}
    </div>
  )
}
```

```tsx
// frontend/src/components/LeftPanel/LeftPanel.tsx
import { useAtom } from "jotai"
import { tripPlanAtom } from "../../atoms/tripPlan"
import { TripNodeItem } from "./TripNodeItem"

interface Props {
  onNodeClick: (nodeId: string) => void
}

export function LeftPanel({ onNodeClick }: Props) {
  const [tripPlan] = useAtom(tripPlanAtom)
  const req = tripPlan.requirements

  return (
    <div>
      <h2 style={{ fontSize: 18, margin: "0 0 12px" }}>Trip Plan</h2>
      {req && (
        <div style={{ fontSize: 14, marginBottom: 16, padding: "8px", background: "var(--accent-bg)", borderRadius: 8 }}>
          <div><strong>{req.destination}</strong></div>
          <div>{req.when}</div>
          <div>Budget: ${req.budgetRemaining} / ${req.budget} SGD</div>
        </div>
      )}
      {tripPlan.nodes.length === 0 && (
        <p style={{ fontSize: 14, color: "var(--text)" }}>Start chatting to build your trip plan.</p>
      )}
      {tripPlan.nodes.map((node) => (
        <TripNodeItem key={node.id} node={node} depth={0} onNodeClick={onNodeClick} />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create Chat + ChatBubble**

```tsx
// frontend/src/components/Chat/ChatBubble.tsx
import type { ChatMessage } from "../../types"

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      padding: "4px 16px",
    }}>
      <div style={{
        maxWidth: "80%",
        padding: "10px 14px",
        borderRadius: 12,
        background: isUser ? "var(--accent)" : "var(--code-bg)",
        color: isUser ? "#fff" : "var(--text-h)",
        fontSize: 15,
        lineHeight: 1.5,
        whiteSpace: "pre-wrap",
      }}>
        {message.content}
      </div>
    </div>
  )
}
```

```tsx
// frontend/src/components/Chat/Chat.tsx
import { useState, useRef, useEffect } from "react"
import type { ChatMessage } from "../../types"
import { ChatBubble } from "./ChatBubble"

interface Props {
  messages: ChatMessage[]
  onSend: (text: string) => void
  isLoading: boolean
}

export function Chat({ messages, onSend, isLoading }: Props) {
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    onSend(input.trim())
    setInput("")
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflow: "auto", padding: "16px 0" }}>
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
        {isLoading && (
          <div style={{ padding: "4px 16px", color: "var(--text)", fontSize: 14 }}>
            Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} style={{
        display: "flex",
        gap: 8,
        padding: 16,
        borderTop: "1px solid var(--border)",
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Plan your trip..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--bg)",
            color: "var(--text-h)",
            fontSize: 15,
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          Send
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Create RightPanel + result cards**

```tsx
// frontend/src/components/RightPanel/AgentStatusRow.tsx
import type { AgentStatus } from "../../types"

export function AgentStatusRow({ agent }: { agent: AgentStatus }) {
  const color = agent.status === "running" ? "var(--accent)" : agent.status === "done" ? "green" : "red"
  const icon = agent.status === "running" ? "\u23F3" : agent.status === "done" ? "\u2705" : "\u274C"
  return (
    <div style={{ display: "flex", gap: 8, padding: "6px 0", fontSize: 14, alignItems: "center" }}>
      <span>{icon}</span>
      <span style={{ fontWeight: 600, minWidth: 120 }}>{agent.name}</span>
      <span style={{ color }}>{agent.message}</span>
    </div>
  )
}
```

```tsx
// frontend/src/components/RightPanel/FlightCard.tsx
import type { FlightOption } from "../../types"

export function FlightCard({ flight, onSelect }: { flight: FlightOption; onSelect: () => void }) {
  return (
    <div onClick={onSelect} style={{
      border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 10,
      cursor: "pointer", transition: "border-color 0.2s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>{flight.airline}</strong>
        <span style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>${flight.price}</span>
      </div>
      <div style={{ fontSize: 14, color: "var(--text)", marginTop: 4 }}>
        {flight.departure} → {flight.arrival} | {flight.duration} | {flight.stops === 0 ? "Direct" : `${flight.stops} stop(s)`}
      </div>
      <div style={{ fontSize: 12, color: "var(--text)", marginTop: 4 }}>
        {flight.route} | {flight.date} | via {flight.source}
      </div>
    </div>
  )
}
```

```tsx
// frontend/src/components/RightPanel/HotelCard.tsx
import type { HotelOption } from "../../types"

export function HotelCard({ hotel, onSelect }: { hotel: HotelOption; onSelect: () => void }) {
  return (
    <div onClick={onSelect} style={{
      border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 10,
      cursor: "pointer",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>{hotel.name}</strong>
        <span style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>${hotel.pricePerNight}/nt</span>
      </div>
      <div style={{ fontSize: 14, color: "var(--text)", marginTop: 4 }}>
        Rating: {hotel.rating}/5 | {hotel.nights} nights = ${hotel.totalPrice} total
      </div>
      <div style={{ fontSize: 12, color: "var(--text)", marginTop: 4 }}>
        {hotel.checkIn} → {hotel.checkOut} | via {hotel.source}
      </div>
    </div>
  )
}
```

```tsx
// frontend/src/components/RightPanel/DiscoveryCard.tsx
import type { DiscoveryItem } from "../../types"

export function DiscoveryCard({ item }: { item: DiscoveryItem }) {
  const sentimentPct = Math.round(item.sentiment * 100)
  return (
    <div style={{
      border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>{item.place}</strong>
        <span style={{ fontSize: 14, color: "green" }}>{sentimentPct}% positive</span>
      </div>
      <div style={{ fontSize: 14, color: "var(--text-h)", marginTop: 6 }}>{item.summary}</div>
      {item.topQuote && (
        <div style={{ fontSize: 13, color: "var(--text)", marginTop: 6, fontStyle: "italic" }}>
          "{item.topQuote}"
        </div>
      )}
      <div style={{ fontSize: 12, color: "var(--text)", marginTop: 6 }}>
        {item.postCount} mentions | Sources: {item.sources.join(", ")}
      </div>
    </div>
  )
}
```

```tsx
// frontend/src/components/RightPanel/RightPanel.tsx
import { useAtom } from "jotai"
import { liveViewAtom } from "../../atoms/liveView"
import { AgentStatusRow } from "./AgentStatusRow"
import { FlightCard } from "./FlightCard"
import { HotelCard } from "./HotelCard"
import { DiscoveryCard } from "./DiscoveryCard"
import type { FlightOption, HotelOption, DiscoveryItem } from "../../types"

interface Props {
  onSelectFlight: (flight: FlightOption) => void
  onSelectHotel: (hotel: HotelOption) => void
}

export function RightPanel({ onSelectFlight, onSelectHotel }: Props) {
  const [liveView] = useAtom(liveViewAtom)

  return (
    <div>
      <h2 style={{ fontSize: 18, margin: "0 0 12px" }}>Live Results</h2>

      {liveView.phase === "empty" && (
        <p style={{ fontSize: 14, color: "var(--text)" }}>Results will appear here as agents search.</p>
      )}

      {/* Agent activity */}
      {liveView.agents.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {liveView.agents.map((a) => (
            <AgentStatusRow key={a.id} agent={a} />
          ))}
        </div>
      )}

      {/* Result cards */}
      {liveView.results?.type === "flights" &&
        (liveView.results.items as FlightOption[]).map((f) => (
          <FlightCard key={f.id} flight={f} onSelect={() => onSelectFlight(f)} />
        ))}

      {liveView.results?.type === "hotels" &&
        (liveView.results.items as HotelOption[]).map((h) => (
          <HotelCard key={h.id} hotel={h} onSelect={() => onSelectHotel(h)} />
        ))}

      {liveView.results?.type === "discovery" &&
        (liveView.results.items as DiscoveryItem[]).map((d) => (
          <DiscoveryCard key={d.id} item={d} />
        ))}
    </div>
  )
}
```

- [ ] **Step 5: Update App.tsx to wire everything together**

```tsx
// frontend/src/App.tsx
import { useState } from "react"
import { Layout } from "./components/Layout"
import { LeftPanel } from "./components/LeftPanel/LeftPanel"
import { Chat } from "./components/Chat/Chat"
import { RightPanel } from "./components/RightPanel/RightPanel"
import { useOrchestrator } from "./hooks/useOrchestrator"
import type { FlightOption, HotelOption } from "./types"

function App() {
  const { sendMessage, chatMessages } = useOrchestrator()
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async (text: string) => {
    setIsLoading(true)
    try {
      await sendMessage(text)
    } catch (err) {
      console.error("Orchestrator error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNodeClick = (nodeId: string) => {
    handleSend(`Let's go back to ${nodeId}`)
  }

  const handleSelectFlight = (flight: FlightOption) => {
    handleSend(`I'll go with the ${flight.airline} flight for $${flight.price}`)
  }

  const handleSelectHotel = (hotel: HotelOption) => {
    handleSend(`I'll take ${hotel.name} for $${hotel.pricePerNight}/night`)
  }

  return (
    <Layout
      left={<LeftPanel onNodeClick={handleNodeClick} />}
      middle={<Chat messages={chatMessages} onSend={handleSend} isLoading={isLoading} />}
      right={<RightPanel onSelectFlight={handleSelectFlight} onSelectHotel={handleSelectHotel} />}
    />
  )
}

export default App
```

- [ ] **Step 6: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/ frontend/src/App.tsx
git commit -m "feat: add three-panel layout with all UI components"
```

---

## Task 8: Environment Setup + Run

**Files:**
- Create: `frontend/.env.local`

- [ ] **Step 1: Create env file**

```bash
# frontend/.env.local
VITE_OPENAI_API_KEY=sk-your-key-here
VITE_TINYFISH_API_KEY=your-tinyfish-key-here
```

- [ ] **Step 2: Install dependencies and run**

Run: `cd frontend && npm install && npm run dev`
Expected: App opens at http://localhost:5173 with three-panel layout

- [ ] **Step 3: Smoke test — type a message in chat**

Type: "I want to go to Melbourne for 5 days in May, budget $2000"
Expected: Orchestrator responds, left panel populates with requirements and tree nodes

- [ ] **Step 4: Commit (do NOT commit .env.local)**

```bash
echo ".env.local" >> frontend/.gitignore
git add frontend/.gitignore
git commit -m "chore: add .env.local to gitignore"
```

---

## Task 9: Polish + Demo Prep

This is for after integration works end-to-end.

- [ ] **Step 1: Add loading animation to AgentStatusRow**

Add a CSS pulse animation to the running agents so they visually pulse while searching. This is the "wow" moment for judges.

- [ ] **Step 2: Test the full demo flow**

Run through the complete sequence:
1. "I want to go to Australia, Sydney and Melbourne, 10 days in May, $3000 budget from Singapore"
2. Watch discovery agents search XHS + Reddit
3. Approve routing
4. Watch flight agents search 5 airlines in parallel
5. Pick a flight
6. Watch hotel agents search Booking.com + Agoda
7. Pick a hotel
8. Verify budget updates correctly in left panel

- [ ] **Step 3: Commit final polish**

```bash
git add -A
git commit -m "feat: polish UI and complete demo flow"
```
