# Tool Interface Spec — Orchestrator → Frontend

The orchestrator (LangGraph agent) controls the frontend via **2 tools** + the existing `tinyfish_web_automation` tool. All state changes flow one direction: orchestrator → frontend (via Jotai atoms).

```
User (click / type)
      │
      ▼
  Orchestrator (LangGraph + system prompt)
      │
      ├── tinyfish_web_automation    (existing, internal — fetches data from web)
      │
      ├── update_decision_tree       → writes to tripPlanAtom   → left panel re-renders
      │
      └── update_realtime_view       → writes to liveViewAtom   → right panel re-renders
      │
      └── text response              → writes to chatMessagesAtom → chat re-renders
```

Frontend NEVER modifies atoms directly. It only sends messages to the orchestrator.

---

## Tool 1: `update_decision_tree`

Modifies the left panel — the trip plan tree. Used for:
- Scaffolding the entire trip (after requirements gathered)
- Updating a single node (marking as active, decided, etc.)
- Saving requirements + budget

### Schema

```typescript
const updateDecisionTreeTool = new DynamicStructuredTool({
  name: "update_decision_tree",
  description:
    "Update the trip decision tree shown in the left panel. " +
    "Use `requirements` to save user requirements and budget. " +
    "Use `nodes` to set the entire trip tree (for initial scaffold). " +
    "Use `updateNode` to modify a single node (change status, lock in decision, set cost).",
  schema: z.object({
    requirements: z.object({
      destination: z.string(),
      when: z.string(),
      budget: z.number(),
      budgetRemaining: z.number(),
      preferences: z.object({
        canDrive: z.boolean(),
        hotelClass: z.enum(["budget", "mid", "luxury"]),
        travelStyle: z.enum(["relaxed", "balanced", "packed"]),
      }),
    }).optional().describe("Set user requirements. Pass on first scaffold, or to update budget."),

    nodes: z.array(z.object({
      id: z.string(),
      type: z.enum(["destination", "flight", "hotel", "activity", "transport"]),
      label: z.string(),
      status: z.enum(["pending", "active", "decided"]).default("pending"),
      children: z.array(z.any()).optional(),
    })).optional().describe("Replace the entire node tree. Use for initial scaffold after requirements."),

    updateNode: z.object({
      nodeId: z.string(),
      status: z.enum(["pending", "active", "decided"]).optional(),
      label: z.string().optional(),
      decision: z.any().optional().describe("The chosen option (flight, hotel, etc.) to store"),
      cost: z.number().optional().describe("Cost in SGD, deducted from budgetRemaining"),
    }).optional().describe("Update a single node by ID. Use to mark active, decided, or change label."),
  }),
})
```

### Tool handler (writes to tripPlanAtom)

```typescript
func: async ({ requirements, nodes, updateNode }) => {
  setTripPlan((prev) => {
    let next = { ...prev }

    // Set requirements
    if (requirements) {
      next.requirements = requirements
    }

    // Replace entire tree
    if (nodes) {
      next.nodes = nodes
    }

    // Update single node
    if (updateNode) {
      next.nodes = updateNodeInTree(next.nodes, updateNode.nodeId, {
        ...(updateNode.status && { status: updateNode.status }),
        ...(updateNode.label && { label: updateNode.label }),
        ...(updateNode.decision !== undefined && { decision: updateNode.decision }),
        ...(updateNode.cost !== undefined && { cost: updateNode.cost }),
      })

      // If cost is set and node is decided, update budgetRemaining
      if (updateNode.cost && updateNode.status === "decided" && next.requirements) {
        next.requirements = {
          ...next.requirements,
          budgetRemaining: next.requirements.budgetRemaining - updateNode.cost,
        }
      }
    }

    return next
  })

  if (nodes) return `Trip scaffolded with ${nodes.length} destinations.`
  if (updateNode) return `Node ${updateNode.nodeId} updated.`
  if (requirements) return `Requirements saved. Budget: $${requirements.budget}.`
  return "Decision tree updated."
}
```

### Example calls

**Scaffold entire trip:**
```json
{
  "name": "update_decision_tree",
  "input": {
    "requirements": {
      "destination": "Australia — Sydney + Melbourne",
      "when": "May 1-10, 2026",
      "budget": 3000,
      "budgetRemaining": 3000,
      "preferences": { "canDrive": true, "hotelClass": "mid", "travelStyle": "balanced" }
    },
    "nodes": [
      {
        "id": "sydney", "type": "destination", "label": "Sydney (May 1-5)",
        "children": [
          { "id": "syd-flight", "type": "flight", "label": "Flight SIN → SYD" },
          { "id": "syd-hotel", "type": "hotel", "label": "Hotel in Sydney (4 nights)" },
          { "id": "syd-day1", "type": "activity", "label": "Day 1 — Arrival + Harbour" },
          { "id": "syd-day2", "type": "activity", "label": "Day 2 — Bondi & Eastern Beaches" },
          { "id": "syd-day3", "type": "activity", "label": "Day 3 — Blue Mountains" }
        ]
      },
      {
        "id": "melbourne", "type": "destination", "label": "Melbourne (May 5-9)",
        "children": [
          { "id": "mel-flight", "type": "flight", "label": "Flight SYD → MEL" },
          { "id": "mel-hotel", "type": "hotel", "label": "Hotel in Melbourne (4 nights)" },
          { "id": "mel-day4", "type": "activity", "label": "Day 4 — Laneways & CBD" },
          { "id": "mel-day5", "type": "activity", "label": "Day 5 — Great Ocean Road" },
          { "id": "mel-day6", "type": "activity", "label": "Day 6 — St Kilda & Markets" }
        ]
      },
      {
        "id": "return", "type": "destination", "label": "Return (May 10)",
        "children": [
          { "id": "ret-flight", "type": "flight", "label": "Flight MEL → SIN" }
        ]
      }
    ]
  }
}
```

**Set node active (user clicks "Flight SIN → SYD"):**
```json
{
  "name": "update_decision_tree",
  "input": {
    "updateNode": { "nodeId": "syd-flight", "status": "active" }
  }
}
```

**Lock in decision (user picks Scoot $380):**
```json
{
  "name": "update_decision_tree",
  "input": {
    "updateNode": {
      "nodeId": "syd-flight",
      "status": "decided",
      "decision": { "airline": "Scoot", "price": 380, "departure": "06:15", "arrival": "13:40" },
      "cost": 380
    },
    "requirements": {
      "destination": "Australia — Sydney + Melbourne",
      "when": "May 1-10, 2026",
      "budget": 3000,
      "budgetRemaining": 2620,
      "preferences": { "canDrive": true, "hotelClass": "mid", "travelStyle": "balanced" }
    }
  }
}
```

---

## Tool 2: `update_realtime_view`

Modifies the right panel — what the user is currently looking at. Used for:
- Showing loading state with agent names
- Showing result cards (flights, hotels, discovery)
- Clearing the panel

### Schema

```typescript
const updateRealtimeViewTool = new DynamicStructuredTool({
  name: "update_realtime_view",
  description:
    "Update the real-time visualization panel on the right. " +
    "Set phase to 'loading' with agents list before searching. " +
    "Set phase to 'results' with results after data is retrieved. " +
    "Set phase to 'empty' to clear the panel.",
  schema: z.object({
    phase: z.enum(["empty", "loading", "results"]).describe("Current state of the view"),

    agents: z.array(z.object({
      id: z.string(),
      name: z.string().describe("Display name, e.g. 'Scoot Flights'"),
      site: z.string().describe("Website being scraped, e.g. 'scoot.com'"),
      status: z.enum(["running", "done", "failed"]),
      message: z.string().describe("Progress message, e.g. 'Searching SIN→SYD...'"),
    })).optional().describe("List of agents currently working. Show during loading phase."),

    results: z.object({
      type: z.enum(["flights", "hotels", "discovery", "activities"]),
      items: z.array(z.any()).describe("Array of FlightOption, HotelOption, or DiscoveryItem"),
    }).optional().describe("Results to display as cards. Show during results phase."),
  }),
})
```

### Tool handler (writes to liveViewAtom)

```typescript
func: async ({ phase, agents, results }) => {
  setLiveView(() => ({
    topic: "",
    phase,
    agents: agents ?? [],
    results: results ?? null,
  }))

  if (phase === "loading") return `Showing ${agents?.length ?? 0} agents working.`
  if (phase === "results") return `Showing ${results?.items?.length ?? 0} results.`
  return "View cleared."
}
```

### Example calls

**Show loading state before TinyFish calls:**
```json
{
  "name": "update_realtime_view",
  "input": {
    "phase": "loading",
    "agents": [
      { "id": "a1", "name": "Singapore Airlines", "site": "singaporeair.com", "status": "running", "message": "Searching SIN→SYD May 1..." },
      { "id": "a2", "name": "Scoot", "site": "flyscoot.com", "status": "running", "message": "Searching SIN→SYD May 1..." },
      { "id": "a3", "name": "Jetstar", "site": "jetstar.com", "status": "running", "message": "Searching SIN→SYD May 1..." }
    ]
  }
}
```

**Show flight results:**
```json
{
  "name": "update_realtime_view",
  "input": {
    "phase": "results",
    "results": {
      "type": "flights",
      "items": [
        { "id": "f1", "airline": "Scoot", "price": 380, "currency": "SGD", "departure": "06:15", "arrival": "13:40", "duration": "7h25m", "stops": 0, "route": "SIN → SYD", "date": "2026-05-01", "source": "flyscoot.com", "sourceUrl": "https://flyscoot.com" },
        { "id": "f2", "airline": "Singapore Airlines", "price": 620, "currency": "SGD", "departure": "08:30", "arrival": "16:10", "duration": "7h40m", "stops": 0, "route": "SIN → SYD", "date": "2026-05-01", "source": "singaporeair.com", "sourceUrl": "https://singaporeair.com" },
        { "id": "f3", "airline": "Jetstar", "price": 410, "currency": "SGD", "departure": "11:00", "arrival": "19:30", "duration": "8h30m", "stops": 1, "route": "SIN → SYD", "date": "2026-05-01", "source": "jetstar.com", "sourceUrl": "https://jetstar.com" }
      ]
    }
  }
}
```

**Show discovery results:**
```json
{
  "name": "update_realtime_view",
  "input": {
    "phase": "results",
    "results": {
      "type": "discovery",
      "items": [
        { "id": "d1", "place": "Sydney Opera House & Harbour Walk", "sentiment": 0.95, "postCount": 120, "summary": "Must-visit on Day 1. Walk from Circular Quay around the harbour.", "sources": ["xhs", "reddit"], "topQuote": "The harbour at sunset is unreal", "category": "attraction" },
        { "id": "d2", "place": "Bondi to Coogee Coastal Walk", "sentiment": 0.91, "postCount": 85, "summary": "Best morning walk in Sydney. 6km along the coast.", "sources": ["xhs", "reddit"], "topQuote": "Go early before 9am", "category": "experience" }
      ]
    }
  }
}
```

**Clear panel:**
```json
{
  "name": "update_realtime_view",
  "input": { "phase": "empty" }
}
```

---

## Orchestrator Flow

The orchestrator has 3 tools available:
1. `tinyfish_web_automation` (existing) — fetches data from websites
2. `update_decision_tree` — updates left panel
3. `update_realtime_view` — updates right panel

### Typical sequence for "find flights":

```
1. User clicks node "syd-flight" → frontend sends: "[NODE_CLICK:syd-flight] Looking at Flight SIN → SYD"

2. Orchestrator calls update_decision_tree:
   { updateNode: { nodeId: "syd-flight", status: "active" } }

3. Orchestrator calls update_realtime_view:
   { phase: "loading", agents: [{ name: "Scoot", ... }, { name: "SIA", ... }] }

4. Orchestrator calls tinyfish_web_automation for each airline:
   { url: "https://flyscoot.com", goal: "Search flights SIN to SYD on 2026-05-01..." }
   (repeats for each airline)

5. Orchestrator calls update_realtime_view:
   { phase: "results", results: { type: "flights", items: [...all flights...] } }

6. Orchestrator responds with text:
   "Found 8 flights. Cheapest is Scoot at $380 (direct, 7h25m). Want to go with that?"

7. User says "yes" → orchestrator calls update_decision_tree:
   { updateNode: { nodeId: "syd-flight", status: "decided", decision: {...}, cost: 380 } }
```

### Typical sequence for scaffold:

```
1. User: "Australia, Sydney + Melbourne, 10 days May, $3000 budget, can drive, mid hotels, balanced pace"

2. Orchestrator calls update_decision_tree with requirements + full node tree

3. Orchestrator calls update_realtime_view with discovery results (if it ran discovery)
   OR just responds with text: "Trip scaffolded! Click any item to explore options."
```

---

## Frontend Responsibilities

The frontend only does these things:
1. Renders `tripPlanAtom` as a tree in the left panel
2. Renders `liveViewAtom` as agent activity / result cards in the right panel
3. Renders `chatMessagesAtom` as chat bubbles in the middle panel
4. On user chat input → sends message to orchestrator
5. On node click → sends `[NODE_CLICK:{nodeId}] {node.label}` to orchestrator
6. On result card click → sends `I'll go with {description of selected item}` to orchestrator

Frontend NEVER calls TinyFish directly. Frontend NEVER modifies atoms directly.

---

## System Prompt for Orchestrator

```
You are a travel planning assistant. You help users plan trips step by step.

You have 3 tools:
- update_decision_tree: Update the trip plan tree in the left panel (scaffold, set node status, lock decisions)
- update_realtime_view: Update the visualization in the right panel (loading state, result cards)
- tinyfish_web_automation: Scrape a website for data (flights, hotels, community posts)

## Flow

1. Collect requirements: where, when, budget, preferences (can drive?, hotel class, travel style)
2. Scaffold the full trip using update_decision_tree — create the entire tree with all destinations, flights, hotels, and daily activities
3. When user clicks a node (message starts with [NODE_CLICK:nodeId]):
   a. Set that node to "active" via update_decision_tree
   b. Show loading state via update_realtime_view
   c. Use tinyfish_web_automation to fetch relevant data
   d. Show results via update_realtime_view
   e. Summarize options and ask user to choose
4. When user picks an option, lock it via update_decision_tree (set status "decided", store decision, deduct cost)
5. Suggest the next undecided node to explore

## Rules
- Always call update_realtime_view with phase "loading" BEFORE calling tinyfish
- Always call update_realtime_view with phase "results" AFTER tinyfish returns
- For flights: search actual airline sites (SIA, Scoot, Jetstar, AirAsia, Qantas) using stealth mode
- For hotels: search Booking.com and Agoda using stealth mode
- For activities: search XHS (Xiaohongshu) and Reddit for community recommendations using stealth mode
- Track remaining budget and warn if a choice would exceed it
- When scaffolding, create descriptive labels for each day (e.g. "Day 3 — Blue Mountains" not just "Day 3")
```
