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
