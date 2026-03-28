// frontend/src/types/index.ts

// -- Left State ----------------------------------------------------------

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

// -- Right State ---------------------------------------------------------

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

// -- Result Items --------------------------------------------------------

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

// -- Chat ----------------------------------------------------------------

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

// -- Tool Inputs ---------------------------------------------------------
// These define what the orchestrator passes to each tool.
// The orchestrator calls these tools to update the frontend state.

/** Input for update_decision_tree tool — modifies left panel (tripPlanAtom) */
export interface UpdateDecisionTreeInput {
  /** Set/update user requirements. Pass on scaffold, or to update budgetRemaining. */
  requirements?: UserRequirements
  /** Replace entire node tree. Use for initial scaffold after requirements collected. */
  nodes?: TripNode[]
  /** Update a single node by ID. Use to mark active, decided, or change label. */
  updateNode?: {
    nodeId: string
    status?: NodeStatus
    label?: string
    /** The chosen option (FlightOption, HotelOption, etc.) to store on this node */
    decision?: FlightOption | HotelOption | DiscoveryItem | null
    /** Cost in SGD. When status is "decided", this is deducted from budgetRemaining. */
    cost?: number
  }
}

/** Input for update_realtime_view tool — modifies right panel (liveViewAtom) */
export interface UpdateRealtimeViewInput {
  /** Current state of the view panel */
  phase: "empty" | "loading" | "results"
  /** Agents currently working. Show during loading phase. */
  agents?: AgentStatus[]
  /** Results to display as cards. Show during results phase. */
  results?: ViewResult
}
