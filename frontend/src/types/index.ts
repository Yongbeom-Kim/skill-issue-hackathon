// frontend/src/types/index.ts

// ── Left State (Decision Tree) ─────────────────────────────

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

// ── Right State (Realtime View) ────────────────────────────
// 6 possible states:
//   "empty"    — no node selected, show placeholder
//   "loading"  — agents working, show spinner rows
//   "flights"  — flight comparison cards
//   "hotels"   — hotel cards with images
//   "discovery" — community activity cards with sentiment
//   "decided"  — viewing a locked-in decision

export type ViewPhase = "empty" | "loading" | "flights" | "hotels" | "discovery" | "decided"

export interface LiveView {
  /** Which TripNode.id is currently being viewed */
  nodeId: string
  /** What the right panel is showing */
  phase: ViewPhase
  /** Agents currently working (loading phase) */
  agents: AgentStatus[]
  /** Flight results (flights phase) */
  flights: FlightOption[]
  /** Hotel results (hotels phase) */
  hotels: HotelOption[]
  /** Discovery results (discovery phase) */
  discoveries: DiscoveryItem[]
  /** The decided item (decided phase) */
  decidedItem: (FlightOption | HotelOption | DiscoveryItem) | null
  /** Label for the panel header */
  title: string
  /** Subtitle for the panel header */
  subtitle: string
}

export interface AgentStatus {
  id: string
  /** Display name, e.g. "Singapore Airlines" */
  name: string
  /** Website being scraped, e.g. "singaporeair.com" */
  site: string
  status: "queued" | "running" | "done" | "failed"
  /** Progress message, e.g. "Navigating booking engine..." */
  message: string
  /** Number of results found (when done) */
  resultCount?: number
}

// ── Result Items ───────────────────────────────────────────

export interface FlightOption {
  id: string
  airline: string
  /** Flight number, e.g. "TR 12" */
  flightNumber: string
  price: number
  currency: string
  /** "06:15" */
  departure: string
  /** "13:40" */
  arrival: string
  /** "7h 25m" */
  duration: string
  stops: number
  /** Stop city if not direct, e.g. "KUL" */
  stopCity?: string
  /** "SIN → SYD" */
  route: string
  /** "2026-05-01" */
  date: string
  /** "flyscoot.com" */
  source: string
  sourceUrl: string
  /** "best-value" | "recommended" | "fastest" — shown as badge */
  badge?: string
}

export interface HotelOption {
  id: string
  name: string
  /** URL to hotel photo */
  imageUrl?: string
  /** e.g. "Darling Harbour" */
  location: string
  pricePerNight: number
  totalPrice: number
  currency: string
  /** 0-5 scale */
  rating: number
  nights: number
  /** "2026-05-01" */
  checkIn: string
  /** "2026-05-05" */
  checkOut: string
  /** "booking.com" */
  source: string
  sourceUrl: string
  available: boolean
  /** "recommended" — shown as badge */
  badge?: string
}

export interface DiscoveryItem {
  id: string
  /** Venue/place name */
  place: string
  /** URL to venue photo */
  imageUrl?: string
  /** 0–1 scale, displayed as percentage */
  sentiment: number
  /** Total mentions across all sources */
  postCount: number
  /** Short description */
  summary: string
  /** Category icon hint: "park", "restaurant", "museum", "beach", "experience" */
  category: string
  /** "$" to "$$$$" */
  priceLevel?: string
  /** "2-3 hrs" */
  duration?: string
  /** Community quotes with source attribution */
  quotes: CommunityQuote[]
  /** Auto-generated tags: "arrival-friendly", "free", "book-ahead" */
  tags: string[]
}

export interface CommunityQuote {
  /** "xhs" | "reddit" | "tripadvisor" */
  source: string
  /** The quote text (translated to English if from XHS) */
  text: string
  /** Original text if translated */
  originalText?: string
  /** Upvotes (Reddit) or likes (XHS) */
  score?: number
}

// ── Detail View ──────────────────────────────────────────

export interface BookingLink {
  provider: string
  url: string
  price?: number
  currency?: string
  note?: string
}

export interface ItemDetail {
  /** ID matching the item (FlightOption.id, HotelOption.id, DiscoveryItem.id) */
  itemId: string
  /** Extended community comments with full context */
  comments: CommunityQuote[]
  /** Booking / reference links */
  bookingLinks: BookingLink[]
  /** Price comparisons across sources */
  priceComparisons?: { source: string; price: number; currency: string; url: string }[]
  /** Longer description */
  description?: string
  /** Highlights / amenities / features */
  highlights?: string[]
}

// ── Chat ───────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

// ── User Actions (FE → LangChain) ─────────────────────────
// Actions the frontend can send to the orchestrator.

export type UserAction =
  | { type: "chat"; message: string }
  | { type: "select_node"; nodeId: string }
  | { type: "decide"; nodeId: string; optionId: string }
  | { type: "revise"; nodeId: string; feedback: string }

// ── Orchestrator Callbacks (LangChain → FE) ───────────────
// Callbacks the frontend passes into the orchestrator so it can update UI.

export interface OrchestratorCallbacks {
  onUpdateDecisionTree: (input: UpdateDecisionTreeInput) => void
  onUpdateRealtimeView: (input: UpdateRealtimeViewInput) => void
}

// ── Tool Inputs ────────────────────────────────────────────
// The orchestrator calls these 2 tools to update the frontend.

/** Input for update_decision_tree — modifies left panel (tripPlanAtom) */
export interface UpdateDecisionTreeInput {
  /** Set/update user requirements. Pass on scaffold, or to update budgetRemaining. */
  requirements?: UserRequirements
  /** Replace entire node tree. Use for initial scaffold. */
  nodes?: TripNode[]
  /** Update a single node by ID. */
  updateNode?: {
    nodeId: string
    status?: NodeStatus
    label?: string
    decision?: FlightOption | HotelOption | DiscoveryItem | null
    cost?: number
  }
}

/** Input for update_realtime_view — modifies right panel (liveViewAtom) */
export interface UpdateRealtimeViewInput {
  /** Which node this view is for */
  nodeId: string
  /** What to show */
  phase: ViewPhase
  /** Panel header title, e.g. "Flights SIN → SYD" */
  title: string
  /** Panel header subtitle, e.g. "May 1, 2026 · 1 adult · Economy" */
  subtitle?: string
  /** Agent progress rows (for "loading" phase) */
  agents?: AgentStatus[]
  /** Flight cards (for "flights" phase) */
  flights?: FlightOption[]
  /** Hotel cards (for "hotels" phase) */
  hotels?: HotelOption[]
  /** Discovery cards (for "discovery" phase) */
  discoveries?: DiscoveryItem[]
  /** The locked-in item (for "decided" phase) */
  decidedItem?: FlightOption | HotelOption | DiscoveryItem
}
