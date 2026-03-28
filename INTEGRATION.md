# FE ↔ LangChain Integration Contract

The orchestrator runs **in-browser**. The UI and LangChain communicate through a single hook and Jotai atoms. The UI never writes to atoms directly — it calls `run(action)`, the orchestrator does its work, and pushes updates into the atoms via LangChain tool calls.

## FE → Orchestrator (User Actions)

The UI sends actions via the `useOrchestrator` hook:

```typescript
import { useOrchestrator } from "../hooks/useOrchestrator";

const { run, isRunning } = useOrchestrator();
```

### Available actions (`UserAction` type in `types/index.ts`):

| Action | When to use | Example |
|--------|-------------|---------|
| `{ type: "chat", message: string }` | User sends a chat message | `run({ type: "chat", message: "Plan a trip to Tokyo" })` |
| `{ type: "select_node", nodeId: string }` | User clicks a node in the decision tree | `run({ type: "select_node", nodeId: "flights-1" })` |
| `{ type: "decide", nodeId: string, optionId: string }` | User picks a flight/hotel/activity | `run({ type: "decide", nodeId: "flights-1", optionId: "fl-3" })` |
| `{ type: "revise", nodeId: string, feedback: string }` | User wants different options | `run({ type: "revise", nodeId: "flights-1", feedback: "Direct flights only" })` |

`isRunning` is `true` while the orchestrator is processing.

## Orchestrator → FE (UI Updates)

The orchestrator updates the UI by calling two LangChain tools. These tools push data into Jotai atoms, which React components read reactively.

### Tool: `update_decision_tree` → writes to `tripPlanAtom` (left panel)

The orchestrator calls this to:
- Set user requirements (destination, dates, budget, preferences)
- Scaffold the initial node tree
- Update a single node's status, label, decision, or cost

Input shape (`UpdateDecisionTreeInput` in `types/index.ts`):
```typescript
{
  requirements?: UserRequirements        // set/update requirements
  nodes?: TripNode[]                     // replace entire tree (initial scaffold)
  updateNode?: {                         // update one node
    nodeId: string
    status?: "pending" | "active" | "decided"
    label?: string
    decision?: FlightOption | HotelOption | DiscoveryItem | null
    cost?: number
  }
}
```

### Tool: `update_realtime_view` → writes to `liveViewAtom` (right panel)

The orchestrator calls this to:
- Show loading state with agent progress when research starts
- Show flight/hotel/discovery results when agents finish
- Show the decided item when the user makes a choice

Input shape (`UpdateRealtimeViewInput` in `types/index.ts`):
```typescript
{
  nodeId: string                                    // which tree node this is for
  phase: "empty" | "loading" | "flights" | "hotels" | "discovery" | "decided"
  title: string                                     // panel header
  subtitle?: string
  agents?: AgentStatus[]                            // loading phase — progress rows
  flights?: FlightOption[]                          // flights phase — comparison cards
  hotels?: HotelOption[]                            // hotels phase
  discoveries?: DiscoveryItem[]                     // discovery phase
  decidedItem?: FlightOption | HotelOption | DiscoveryItem  // decided phase
}
```

## Reading State in React

```typescript
import { useAtomValue } from "jotai";
import { tripPlanAtom } from "../atoms/tripPlan";
import { liveViewAtom } from "../atoms/liveView";
import { chatMessagesAtom } from "../atoms/chat";

const tripPlan = useAtomValue(tripPlanAtom);     // left panel — decision tree + requirements
const liveView = useAtomValue(liveViewAtom);     // right panel — results/loading/decided
const messages = useAtomValue(chatMessagesAtom); // chat message history
```

## Typical Flow

```
User types "Plan a trip to Tokyo, May, $3000"
  → UI calls run({ type: "chat", message: "..." })
    → orchestrator extracts requirements
    → orchestrator calls update_decision_tree({ requirements, nodes: [...] })
      → tripPlanAtom updates → left panel renders tree
    → orchestrator calls update_realtime_view({ phase: "loading", agents: [...] })
      → liveViewAtom updates → right panel shows agent progress
    → orchestrator calls call_logistics_agent("find flights...")
    → orchestrator calls update_realtime_view({ phase: "flights", flights: [...] })
      → liveViewAtom updates → right panel shows flight cards

User clicks "Book this flight"
  → UI calls run({ type: "decide", nodeId: "flights-1", optionId: "fl-3" })
    → orchestrator calls update_decision_tree({ updateNode: { nodeId, status: "decided", ... } })
    → orchestrator calls update_realtime_view({ phase: "decided", decidedItem: ... })
```

## Key Files

| File | What it does |
|------|-------------|
| `frontend/src/types/index.ts` | All TypeScript interfaces — the shared contract |
| `frontend/src/hooks/useOrchestrator.ts` | The bridge hook — `run(action)` + `isRunning` |
| `frontend/src/lib/agent/orchestrator.ts` | Orchestrator factory with UI tools + sub-agent tools |
| `frontend/src/atoms/tripPlan.ts` | Left panel state + immutable tree helpers |
| `frontend/src/atoms/liveView.ts` | Right panel state |
| `frontend/src/atoms/chat.ts` | Chat message history |
