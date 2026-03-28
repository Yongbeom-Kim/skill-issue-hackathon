import type {
  TripPlan,
  LiveView,
  ChatMessage,
  FlightOption,
  HotelOption,
  DiscoveryItem,
  AgentStatus,
} from "../types"

// ── Trip Plan (Left Panel) ────────────────────────────────

export const mockTripPlan: TripPlan = {
  id: "trip-australia-2026",
  requirements: {
    destination: "Australia — Sydney + Melbourne",
    when: "May 1–10, 2026",
    budget: 3000,
    budgetRemaining: 1880,
    preferences: {
      canDrive: true,
      hotelClass: "mid",
      travelStyle: "balanced",
    },
  },
  nodes: [
    {
      id: "sydney",
      type: "destination",
      label: "Sydney (May 1–5)",
      status: "active",
      children: [
        {
          id: "syd-flight",
          type: "flight",
          label: "Flight SIN → SYD",
          status: "decided",
          cost: 380,
          decision: {
            id: "f1",
            airline: "Scoot",
            flightNumber: "TR 12",
            price: 380,
            currency: "SGD",
            departure: "06:15",
            arrival: "13:40",
            duration: "7h 25m",
            stops: 0,
            route: "SIN → SYD",
            date: "2026-05-01",
            source: "flyscoot.com",
            sourceUrl: "https://flyscoot.com",
            badge: "best-value",
          } satisfies FlightOption,
        },
        {
          id: "syd-hotel",
          type: "hotel",
          label: "Holiday Inn CQ",
          status: "decided",
          cost: 740,
          decision: {
            id: "h2",
            name: "Holiday Inn Circular Quay",
            location: "Circular Quay",
            pricePerNight: 185,
            totalPrice: 740,
            currency: "SGD",
            rating: 4.5,
            nights: 4,
            checkIn: "2026-05-01",
            checkOut: "2026-05-05",
            source: "booking.com",
            sourceUrl: "https://booking.com",
            available: true,
            badge: "recommended",
          } satisfies HotelOption,
        },
        {
          id: "syd-day1",
          type: "activity",
          label: "Day 1 — Harbour",
          status: "active",
        },
        {
          id: "syd-day2",
          type: "activity",
          label: "Day 2 — Bondi",
          status: "pending",
        },
        {
          id: "syd-day3",
          type: "activity",
          label: "Day 3 — Blue Mtns",
          status: "pending",
        },
      ],
    },
    {
      id: "melbourne",
      type: "destination",
      label: "Melbourne (May 5–9)",
      status: "pending",
      children: [
        {
          id: "mel-flight",
          type: "flight",
          label: "Flight SYD → MEL",
          status: "pending",
        },
        {
          id: "mel-hotel",
          type: "hotel",
          label: "Hotel",
          status: "pending",
        },
        {
          id: "mel-day4",
          type: "activity",
          label: "Day 4 — Laneways",
          status: "pending",
        },
        {
          id: "mel-day5",
          type: "activity",
          label: "Day 5 — Great Ocean Rd",
          status: "pending",
        },
        {
          id: "mel-day6",
          type: "activity",
          label: "Day 6 — St Kilda",
          status: "pending",
        },
      ],
    },
    {
      id: "return",
      type: "destination",
      label: "Return (May 10)",
      status: "pending",
      children: [
        {
          id: "ret-flight",
          type: "flight",
          label: "Flight MEL → SIN",
          status: "pending",
        },
      ],
    },
  ],
}

// ── Chat Messages (Middle Panel) ──────────────────────────

export const mockChatMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    content: `<h2>Day 1 — Arrival & First Taste</h2>
<p class="chat-subtitle">Welcome to Sydney. Settle in and soak up the harbour.</p>

<p><strong>Morning:</strong> Arrive in <strong>Sydney</strong>. Take a taxi or airport train (~$17) to <strong>Holiday Inn Circular Quay</strong>. Check in and freshen up.</p>

<p><strong>Afternoon:</strong> Walk to <strong>Royal Botanic Garden</strong> — it's 10 minutes from your hotel. Follow the harbour path for Opera House views. Continue to <strong>Opera Bar</strong> for a light lunch with waterfront vibes.</p>

<p><strong>Evening:</strong> Dinner at <strong>Restaurant Hubert</strong> — underground French bistro with live jazz. Book ahead — it's always full.</p>

<div class="chat-insight">
  <div class="chat-insight-title">Why this itinerary?</div>
  <div>Based on 47 community posts across XHS and Reddit. 73% recommend starting with the Botanic Gardens on arrival day — "not too tiring after a 7-hour flight, and the harbour views are the best welcome to Sydney."</div>
</div>`,
    timestamp: Date.now() - 60000,
  },
  {
    id: "m2",
    role: "assistant",
    content: `<h2>Day 2 — Bondi & Eastern Beaches</h2>
<p class="chat-subtitle">Sydney's most famous coastal walk and beach culture.</p>

<p><strong>Morning:</strong> Early start. Take Bus 333 from Circular Quay to <strong>Bondi Beach</strong>. Start the famous <strong>Bondi to Coogee Coastal Walk</strong> — 6km along dramatic cliffs. Go before 9am to beat the crowds.</p>

<p><strong>Afternoon:</strong> Lunch at <strong>Icebergs Dining Room</strong> — perched above Bondi's ocean pool. Then relax on the beach or explore Bondi's cafes.</p>`,
    timestamp: Date.now() - 30000,
  },
]

// ── Mock Flights (Right Panel) ────────────────────────────

export const mockFlights: FlightOption[] = [
  {
    id: "f1",
    airline: "Scoot",
    flightNumber: "TR 12",
    price: 380,
    currency: "SGD",
    departure: "06:15",
    arrival: "13:40",
    duration: "7h 25m",
    stops: 0,
    route: "SIN → SYD",
    date: "2026-05-01",
    source: "flyscoot.com",
    sourceUrl: "https://flyscoot.com",
    badge: "best-value",
  },
  {
    id: "f2",
    airline: "AirAsia",
    flightNumber: "AK 384",
    price: 345,
    currency: "SGD",
    departure: "14:20",
    arrival: "23:30",
    duration: "9h 10m",
    stops: 1,
    stopCity: "KUL",
    route: "SIN → SYD",
    date: "2026-05-01",
    source: "airasia.com",
    sourceUrl: "https://airasia.com",
  },
  {
    id: "f3",
    airline: "Jetstar",
    flightNumber: "3K 521",
    price: 410,
    currency: "SGD",
    departure: "11:00",
    arrival: "19:30",
    duration: "8h 30m",
    stops: 1,
    stopCity: "KUL",
    route: "SIN → SYD",
    date: "2026-05-01",
    source: "jetstar.com",
    sourceUrl: "https://jetstar.com",
  },
  {
    id: "f4",
    airline: "Singapore Airlines",
    flightNumber: "SQ 231",
    price: 620,
    currency: "SGD",
    departure: "08:30",
    arrival: "16:10",
    duration: "7h 40m",
    stops: 0,
    route: "SIN → SYD",
    date: "2026-05-01",
    source: "singaporeair.com",
    sourceUrl: "https://singaporeair.com",
    badge: "premium",
  },
]

// ── Mock Hotels (Right Panel) ─────────────────────────────

export const mockHotels: HotelOption[] = [
  {
    id: "h1",
    name: "Ibis Darling Harbour",
    location: "Darling Harbour",
    pricePerNight: 120,
    totalPrice: 480,
    currency: "SGD",
    rating: 4.2,
    nights: 4,
    checkIn: "2026-05-01",
    checkOut: "2026-05-05",
    source: "booking.com",
    sourceUrl: "https://booking.com",
    available: true,
  },
  {
    id: "h2",
    name: "Holiday Inn Circular Quay",
    location: "Circular Quay",
    pricePerNight: 185,
    totalPrice: 740,
    currency: "SGD",
    rating: 4.5,
    nights: 4,
    checkIn: "2026-05-01",
    checkOut: "2026-05-05",
    source: "booking.com",
    sourceUrl: "https://booking.com",
    available: true,
    badge: "recommended",
  },
  {
    id: "h3",
    name: "Hyatt Regency Sydney",
    location: "Darling Harbour",
    pricePerNight: 280,
    totalPrice: 1120,
    currency: "SGD",
    rating: 4.7,
    nights: 4,
    checkIn: "2026-05-01",
    checkOut: "2026-05-05",
    source: "agoda.com",
    sourceUrl: "https://agoda.com",
    available: true,
  },
]

// ── Mock Discovery (Right Panel) ──────────────────────────

export const mockDiscoveries: DiscoveryItem[] = [
  {
    id: "d1",
    place: "Royal Botanic Garden",
    imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=140&fit=crop",
    sentiment: 0.95,
    postCount: 120,
    summary: "Must-visit on Day 1. Walk from Circular Quay around the harbour for the best Opera House views.",
    category: "park",
    priceLevel: "Free",
    duration: "2-3 hrs",
    quotes: [
      {
        source: "xhs",
        text: "Must visit on day 1. Best Opera House view angle.",
        originalText: "到悉尼第一天一定要来植物园！从花园看歌剧院的角度是最美的",
        score: 892,
      },
      {
        source: "reddit",
        text: "Go in the afternoon when the light hits the Opera House. Bring a picnic.",
        score: 234,
      },
    ],
    tags: ["arrival-friendly", "free", "harbour-views"],
  },
  {
    id: "d2",
    place: "Opera Bar",
    sentiment: 0.91,
    postCount: 85,
    summary: "Waterfront bar with iconic harbour views. Much better value at lunch than dinner.",
    category: "restaurant",
    priceLevel: "$$$",
    duration: "1-2 hrs",
    quotes: [
      {
        source: "xhs",
        text: "Lunch is much cheaper than dinner, same view! Try fish tacos.",
        originalText: "中午来比晚上划算很多，view一样好！推荐fish tacos",
        score: 445,
      },
      {
        source: "reddit",
        text: "Skip dinner here — $40 cocktails. Lunch is $15 beers with the same view.",
        score: 189,
      },
    ],
    tags: ["waterfront", "lunch-recommended", "iconic"],
  },
  {
    id: "d3",
    place: "Restaurant Hubert",
    sentiment: 0.88,
    postCount: 67,
    summary: "Underground French bistro with live jazz. One of Sydney's best dining experiences.",
    category: "restaurant",
    priceLevel: "$$$$",
    duration: "2 hrs",
    quotes: [
      {
        source: "reddit",
        text: "Best dinner in Sydney. Underground speakeasy vibe. MUST book 2 weeks ahead.",
        score: 312,
      },
      {
        source: "tripadvisor",
        text: "4.7/5 from 2,841 reviews. #3 Fine Dining in Sydney.",
      },
    ],
    tags: ["fine-dining", "book-ahead", "jazz"],
  },
  {
    id: "d4",
    place: "Barangaroo Reserve",
    sentiment: 0.72,
    postCount: 31,
    summary: "Smaller harbour park. Nice if heading to Darling Harbour anyway.",
    category: "park",
    priceLevel: "Free",
    duration: "1 hr",
    quotes: [
      {
        source: "reddit",
        text: "Nice but much shorter than Botanic Gardens. Good if heading to Darling Harbour anyway.",
        score: 45,
      },
    ],
    tags: ["quick-visit", "free"],
  },
]

// ── Mock Agents (Loading State) ───────────────────────────

export const mockAgents: AgentStatus[] = [
  { id: "a1", name: "Singapore Airlines", site: "singaporeair.com", status: "running", message: "Navigating booking engine..." },
  { id: "a2", name: "Scoot", site: "flyscoot.com", status: "running", message: "Searching SIN→SYD May 1..." },
  { id: "a3", name: "Jetstar", site: "jetstar.com", status: "done", message: "Found 2 flights", resultCount: 2 },
  { id: "a4", name: "AirAsia", site: "airasia.com", status: "running", message: "Bypassing bot detection..." },
  { id: "a5", name: "Qantas", site: "qantas.com", status: "queued", message: "Waiting..." },
]

// ── Pre-built LiveView states for demo ────────────────────

export const mockLiveViewEmpty: LiveView = {
  nodeId: "",
  phase: "empty",
  agents: [],
  flights: [],
  hotels: [],
  discoveries: [],
  decidedItem: null,
  title: "Explore",
  subtitle: "",
}

export const mockLiveViewLoading: LiveView = {
  nodeId: "syd-flight",
  phase: "loading",
  agents: mockAgents,
  flights: [],
  hotels: [],
  discoveries: [],
  decidedItem: null,
  title: "Searching...",
  subtitle: "Finding the best flights for you",
}

export const mockLiveViewFlights: LiveView = {
  nodeId: "syd-flight",
  phase: "flights",
  agents: [],
  flights: mockFlights,
  hotels: [],
  discoveries: [],
  decidedItem: null,
  title: "Flights SIN → SYD",
  subtitle: "May 1, 2026 · 1 adult · Economy",
}

export const mockLiveViewHotels: LiveView = {
  nodeId: "syd-hotel",
  phase: "hotels",
  agents: [],
  flights: [],
  hotels: mockHotels,
  discoveries: [],
  decidedItem: null,
  title: "Hotels in Sydney",
  subtitle: "May 1–5 · 4 nights · 2 adults",
}

export const mockLiveViewDiscovery: LiveView = {
  nodeId: "syd-day1",
  phase: "discovery",
  agents: [],
  flights: [],
  hotels: [],
  discoveries: mockDiscoveries,
  decidedItem: null,
  title: "Day 1 Activities",
  subtitle: "Community picks from XHS & Reddit",
}

export const mockLiveViewDecided: LiveView = {
  nodeId: "syd-flight",
  phase: "decided",
  agents: [],
  flights: [],
  hotels: [],
  discoveries: [],
  decidedItem: mockFlights[0],
  title: "Flight SIN → SYD",
  subtitle: "Decided",
}
