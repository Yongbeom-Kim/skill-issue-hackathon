# Travel Intelligence Planner — Design Spec

## One-liner

A conversational trip planner that uses TinyFish agents to get real prices from actual airline/hotel booking engines and community intelligence from gated sources (XHS, Reddit) that no other planner can access.

## Why This Wins

- **Real prices from actual booking engines** — not stale API/aggregator data. Google Flights can be $670 off.
- **XHS (Xiaohongshu) integration** — zero English-language travel planners do this. 300M+ MAU, #1 travel resource for Asian travelers.
- **Live agent visualization** — judges watch 10+ TinyFish agents working simultaneously in real-time.
- **Structured planning session** — not a one-shot chatbot. Users build up a trip step-by-step with decisions locked in progressively.

---

## Architecture

### Three-Panel Layout

| Left Panel | Middle Panel | Right Panel |
|---|---|---|
| Trip Plan Tree | Chat | Live Visualization |
| Persistent, cumulative | Conversational interface | Ephemeral, replaced per step |
| Shows all decisions | User talks to orchestrator | Agent activity + result cards |
| Click to navigate back | | |

### Two Core Modules (Sub-agents)

**Discovery Agent** — "Where should I go and what should I do?"
- Scrapes XHS, Reddit, travel forums for community sentiment
- Suggests destinations, routing, attractions, hidden gems
- Does NOT factor budget — pure recommendation quality

**Logistics Agent** — "How do I get there and how much?"
- Scrapes actual airline booking engines (SIA, Scoot, Jetstar, AirAsia, Qantas)
- Scrapes hotel sites (Booking.com, Agoda) for real availability + prices
- DOES factor budget and preferences

**Orchestrator** — The chat (LangGraph agent)
- Manages conversation flow and user intent
- Dispatches to Discovery or Logistics agents via tool calls
- Holds memory of all requirements and decisions
- Updates frontend state (left + right panels) via Jotai atoms

### All-Frontend Architecture

No separate backend. Everything runs in the browser via:
- **LangGraph** `createReactAgent` for orchestration
- **TinyFish API** called directly (SSE streaming)
- **Jotai atoms** for state management
- API keys handled via environment variables (local demo only)

---

## User Flow

1. **Collect requirements** — where, when, budget, preferences (driving, hotel class, travel style)
2. **Discovery** — agent scrapes XHS + Reddit, synthesizes community consensus on routing/itinerary
3. **User approves routing** — locked in left panel
4. **Logistics per leg** — agent scrapes airlines for real prices, user picks flight
5. **Hotels per leg** — agent scrapes Booking.com/Agoda, user picks hotel
6. **Activities per leg** — agent suggests from community data, verifies opening hours
7. **Repeat for each destination**
8. **Final plan** — complete trip with real prices, community-backed routing

---

## API Contract

### Types

```typescript
// ============================================================
// LEFT STATE — Trip Plan (persistent, cumulative)
// ============================================================

interface TripPlan {
  id: string
  requirements: UserRequirements | null
  nodes: TripNode[]
}

interface UserRequirements {
  destination: string          // "Australia — Sydney + Melbourne"
  when: string                 // "May 1-10, 2026"
  budget: number               // 3000
  budgetRemaining: number      // auto-calculated from decisions
  preferences: UserPreferences
}

interface UserPreferences {
  canDrive: boolean
  hotelClass: "budget" | "mid" | "luxury"
  travelStyle: "relaxed" | "balanced" | "packed"
}

type NodeStatus = "pending" | "active" | "decided"
type NodeType = "destination" | "flight" | "hotel" | "activity" | "transport"

interface TripNode {
  id: string
  type: NodeType
  label: string                // "Flight SIN → SYD"
  status: NodeStatus
  decision?: FlightOption | HotelOption | DiscoveryItem | null
  cost?: number                // deducted from budget when decided
  children?: TripNode[]
}


// ============================================================
// RIGHT STATE — Live View (ephemeral, replaced per step)
// ============================================================

interface LiveView {
  topic: string                // which TripNode.id is currently active
  phase: "empty" | "loading" | "results"
  agents: AgentStatus[]
  results: ViewResult | null
}

interface AgentStatus {
  id: string
  name: string                 // "Scoot Flights"
  site: string                 // "scoot.com"
  status: "running" | "done" | "failed"
  message: string              // "Searching SIN→SYD May 1..."
}

type ViewResultType = "flights" | "hotels" | "discovery" | "activities"

interface ViewResult {
  type: ViewResultType
  items: (FlightOption | HotelOption | DiscoveryItem)[]
}


// ============================================================
// RESULT ITEM SHAPES
// ============================================================

interface FlightOption {
  id: string
  airline: string              // "Scoot"
  price: number                // 380
  currency: string             // "SGD"
  departure: string            // "06:15"
  arrival: string              // "13:40"
  duration: string             // "7h25m"
  stops: number                // 0
  route: string                // "SIN → SYD"
  date: string                 // "2026-05-01"
  source: string               // "scoot.com"
  sourceUrl: string            // URL for user to book
}

interface HotelOption {
  id: string
  name: string                 // "Ibis Sydney Darling Harbour"
  pricePerNight: number        // 120
  totalPrice: number           // 480
  currency: string             // "SGD"
  rating: number               // 4.2
  nights: number               // 4
  checkIn: string              // "2026-05-01"
  checkOut: string             // "2026-05-05"
  source: string               // "booking.com"
  sourceUrl: string
  available: boolean
}

interface DiscoveryItem {
  id: string
  place: string                // "Great Ocean Road"
  sentiment: number            // 0.92 (0-1 scale)
  postCount: number            // 47
  summary: string              // "Must-do day trip from Melbourne..."
  sources: string[]            // ["xhs", "reddit"]
  topQuote: string             // "Best drive of my life"
  category: string             // "day-trip" | "attraction" | "food" | "experience"
}


// ============================================================
// CHAT MESSAGES
// ============================================================

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}


// ============================================================
// JOTAI ATOMS
// ============================================================

// atoms/tripPlan.ts
// export const tripPlanAtom = atom<TripPlan>({ id: '', requirements: null, nodes: [] })

// atoms/liveView.ts
// export const liveViewAtom = atom<LiveView>({ topic: '', phase: 'empty', agents: [], results: null })

// atoms/chat.ts
// export const chatMessagesAtom = atom<ChatMessage[]>([])


// ============================================================
// LANGGRAPH TOOL SCHEMAS
// ============================================================

// Tool: set_requirements
// Called when user provides trip requirements
// Updates: tripPlanAtom.requirements
{
  name: "set_requirements",
  input: {
    destination: string,
    when: string,
    budget: number,
    canDrive: boolean,
    hotelClass: "budget" | "mid" | "luxury",
    travelStyle: "relaxed" | "balanced" | "packed"
  }
}

// Tool: update_node
// Called to add/modify nodes in the trip tree
// Updates: tripPlanAtom.nodes
{
  name: "update_node",
  input: {
    nodeId: string,
    parentId?: string,           // if creating a new child node
    type?: NodeType,
    label?: string,
    status?: NodeStatus
  }
}

// Tool: dispatch_discovery
// Called to search community sources for destination advice
// Updates: liveViewAtom (loading → agents streaming → results)
{
  name: "dispatch_discovery",
  input: {
    query: string,               // "Melbourne 10 days itinerary"
    sources: ("xhs" | "reddit" | "tripadvisor")[],
    language?: string            // "zh" for XHS, "en" for Reddit
  }
}

// Tool: dispatch_logistics
// Called to search for real prices
// Updates: liveViewAtom (loading → agents streaming → results)
{
  name: "dispatch_logistics",
  input: {
    type: "flight" | "hotel",
    from?: string,               // "SIN" (for flights)
    to: string,                  // "SYD"
    date: string,                // "2026-05-01"
    returnDate?: string,         // for round trips
    nights?: number,             // for hotels
    maxBudget?: number           // from remaining budget
  }
}

// Tool: make_decision
// Called when user confirms a choice
// Updates: tripPlanAtom (node status → decided, budget recalculated)
{
  name: "make_decision",
  input: {
    nodeId: string,
    choiceId: string,            // id of the selected FlightOption/HotelOption
    cost: number
  }
}

// Tool: set_active_topic
// Called when user clicks a node in left panel or conversation moves to next topic
// Updates: liveViewAtom.topic, may trigger new agent calls
{
  name: "set_active_topic",
  input: {
    nodeId: string
  }
}
```

### TinyFish Agent Goals (for Person 3)

```typescript
// Flight search goal template
const flightGoal = (from: string, to: string, date: string) =>
  `Search for flights from ${from} to ${to} on ${date}. ` +
  `Extract all available flights as JSON: ` +
  `[{"airline": str, "price": number, "currency": "SGD", "departure": str, "arrival": str, ` +
  `"duration": str, "stops": number}]`

// Hotel search goal template
const hotelGoal = (city: string, checkIn: string, checkOut: string) =>
  `Search for hotels in ${city} from ${checkIn} to ${checkOut}. ` +
  `Extract top 10 results as JSON: ` +
  `[{"name": str, "pricePerNight": number, "currency": "SGD", "rating": number, ` +
  `"available": boolean}]`

// XHS discovery goal template
const xhsGoal = (destination: string, days: number) =>
  `Search for "${destination} ${days}天攻略" (${destination} ${days}-day guide). ` +
  `Extract top 10 posts with: title, summary of itinerary recommended, ` +
  `key places mentioned, overall sentiment. Return as JSON.`

// Reddit discovery goal template
const redditGoal = (destination: string, subreddit: string) =>
  `Search r/${subreddit} for "${destination} itinerary". ` +
  `Extract top 10 relevant posts with: title, key recommendations, ` +
  `warnings/tips, upvote count. Return as JSON.`
```

### Sites to Scrape

| Category | Sites | TinyFish Profile |
|---|---|---|
| Flights | singaporeair.com, flyscoot.com, jetstar.com, airasia.com, qantas.com | stealth |
| Hotels | booking.com, agoda.com | stealth |
| Discovery | xiaohongshu.com, reddit.com/r/travel, reddit.com/r/solotravel | stealth (XHS), lite (Reddit) |
| Verification | Individual attraction websites for opening hours | lite |

---

## File Structure

```
frontend/src/
  atoms/
    tripPlan.ts              ← TripPlan atom + helpers
    liveView.ts              ← LiveView atom + helpers
    chat.ts                  ← ChatMessages atom
  components/
    LeftPanel/
      LeftPanel.tsx           ← Trip tree view
      TripNodeItem.tsx        ← Individual node (recursive)
    RightPanel/
      RightPanel.tsx          ← Agent activity + result cards
      AgentStatusRow.tsx      ← "Checking Scoot..." row
      FlightCard.tsx
      HotelCard.tsx
      DiscoveryCard.tsx
    Chat/
      Chat.tsx                ← Chat messages + input
      ChatMessage.tsx         ← Individual message bubble
    Layout.tsx               ← Three-panel grid
  lib/
    orchestrator.ts          ← LangGraph agent setup + tools
    tinyfish.ts              ← TinyFish API calls with SSE streaming
    tools/
      setRequirements.ts     ← Tool: set_requirements
      updateNode.ts          ← Tool: update_node
      dispatchDiscovery.ts   ← Tool: dispatch_discovery (calls tinyfish.ts)
      dispatchLogistics.ts   ← Tool: dispatch_logistics (calls tinyfish.ts)
      makeDecision.ts        ← Tool: make_decision
      setActiveTopic.ts      ← Tool: set_active_topic
    goals/
      flights.ts             ← TinyFish goal templates for airlines
      hotels.ts              ← TinyFish goal templates for hotels
      discovery.ts           ← TinyFish goal templates for XHS/Reddit
  types/
    index.ts                 ← All TypeScript interfaces from above
  App.tsx
  main.tsx
```

---

## Team Split

### Person 1 (Frontend — you)
- `components/` — all UI components
- `atoms/` — Jotai atom definitions
- `types/index.ts` — shared types
- Build with mock data first, wire to real orchestrator later

### Person 2 (Orchestrator)
- `lib/orchestrator.ts` — LangGraph agent with system prompt
- `lib/tools/*.ts` — all 6 tool handlers
- Wires tools to Jotai atom setters
- LLM prompt engineering (system prompt that guides the conversation flow)

### Person 3 (TinyFish Agents)
- `lib/tinyfish.ts` — TinyFish API client with SSE streaming
- `lib/goals/*.ts` — goal templates per site
- Test each goal independently, normalize results to match types
- Focus: get Scoot + SIA + Booking.com + XHS working reliably

---

## Orchestrator System Prompt (for Person 2)

```
You are a travel planning assistant. You help users plan trips step by step.

You have access to these tools:
- set_requirements: Save the user's trip requirements (destination, dates, budget, preferences)
- update_node: Add or modify items in the trip plan tree
- dispatch_discovery: Search XHS and Reddit for destination recommendations
- dispatch_logistics: Search airline and hotel sites for real prices
- make_decision: Lock in a user's choice and update the budget
- set_active_topic: Switch the current active topic in the plan

Follow this flow:
1. First, collect requirements: where, when, budget, preferences (driving, hotel class, style)
2. Build the trip tree structure with destination nodes
3. For each destination, run discovery to get community recommendations
4. Then logistics for flights, hotels per leg
5. Let the user decide at each step before moving on

Always tell the user what you're about to search for before dispatching agents.
When presenting results, summarize the top options and ask the user to choose.
Track remaining budget and warn if choices exceed it.
```
