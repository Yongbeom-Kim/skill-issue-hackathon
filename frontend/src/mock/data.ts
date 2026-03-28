import type {
  TripPlan,
  FlightOption,
  HotelOption,
  DiscoveryItem,
  AgentStatus,
  ChatMessage,
} from '../types'

// ── Trip Plan (Left Panel) ─────────────────────────────

export const mockTripPlan: TripPlan = {
  id: 'trip-1',
  requirements: {
    destination: 'Sydney, Australia',
    when: 'May 1–5, 2026',
    budget: 3000,
    budgetRemaining: 2711,
    preferences: {
      canDrive: false,
      hotelClass: 'mid',
      travelStyle: 'balanced',
    },
  },
  nodes: [
    {
      id: 'dest-1',
      type: 'destination',
      label: 'Sydney, Australia',
      status: 'decided',
      cost: 0,
      children: [
        {
          id: 'flight-1',
          type: 'flight',
          label: 'SIN → SYD',
          status: 'decided',
          decision: {
            id: 'f1',
            airline: 'Scoot',
            flightNumber: 'TR 12',
            price: 289,
            currency: 'USD',
            departure: '06:15',
            arrival: '16:40',
            duration: '7h 25m',
            stops: 0,
            route: 'SIN → SYD',
            date: '2026-05-01',
            source: 'flyscoot.com',
            sourceUrl: 'https://flyscoot.com',
            badge: 'best-value',
          } as FlightOption,
          cost: 289,
        },
        {
          id: 'hotel-1',
          type: 'hotel',
          label: 'Accommodation',
          status: 'active',
        },
        {
          id: 'activity-1',
          type: 'activity',
          label: 'Day 1 · Arrival',
          status: 'pending',
        },
        {
          id: 'activity-2',
          type: 'activity',
          label: 'Day 2 · Explore',
          status: 'pending',
        },
        {
          id: 'activity-3',
          type: 'activity',
          label: 'Day 3 · Adventure',
          status: 'pending',
        },
        {
          id: 'transport-1',
          type: 'transport',
          label: 'SYD → SIN Return',
          status: 'pending',
        },
      ],
    },
  ],
}

// ── Agent Statuses ─────────────────────────────────────

export const mockLoadingAgents: AgentStatus[] = [
  { id: 'la1', name: 'Amadeus', site: 'amadeus.com', status: 'done', message: 'Found 24 flights', resultCount: 24 },
  { id: 'la2', name: 'Skyscanner', site: 'skyscanner.com', status: 'running', message: 'Checking budget carriers...' },
  { id: 'la3', name: 'Google Flights', site: 'google.com', status: 'running', message: 'Scanning departure dates...' },
  { id: 'la4', name: 'Singapore Airlines', site: 'singaporeair.com', status: 'queued', message: 'Waiting...' },
  { id: 'la5', name: 'Scoot', site: 'flyscoot.com', status: 'queued', message: 'Waiting...' },
  { id: 'la6', name: 'Jetstar', site: 'jetstar.com', status: 'queued', message: 'Waiting...' },
]

export const mockHotelAgents: AgentStatus[] = [
  { id: 'ha1', name: 'Booking.com', site: 'booking.com', status: 'done', message: 'Found 12 properties', resultCount: 12 },
  { id: 'ha2', name: 'Agoda', site: 'agoda.com', status: 'done', message: 'Found 8 properties', resultCount: 8 },
  { id: 'ha3', name: 'Hotels.com', site: 'hotels.com', status: 'running', message: 'Scanning Darling Harbour area...' },
  { id: 'ha4', name: 'Airbnb', site: 'airbnb.com', status: 'queued', message: 'Waiting...' },
]

// ── Flight Options ─────────────────────────────────────

export const mockFlights: FlightOption[] = [
  {
    id: 'f1',
    airline: 'Scoot',
    flightNumber: 'TR 12',
    price: 289,
    currency: 'USD',
    departure: '06:15',
    arrival: '16:40',
    duration: '7h 25m',
    stops: 0,
    route: 'SIN → SYD',
    date: '2026-05-01',
    source: 'flyscoot.com',
    sourceUrl: 'https://flyscoot.com',
    badge: 'best-value',
  },
  {
    id: 'f2',
    airline: 'Singapore Airlines',
    flightNumber: 'SQ 231',
    price: 612,
    currency: 'USD',
    departure: '09:30',
    arrival: '19:55',
    duration: '7h 25m',
    stops: 0,
    route: 'SIN → SYD',
    date: '2026-05-01',
    source: 'singaporeair.com',
    sourceUrl: 'https://singaporeair.com',
    badge: 'recommended',
  },
  {
    id: 'f3',
    airline: 'Jetstar',
    flightNumber: 'JQ 8',
    price: 315,
    currency: 'USD',
    departure: '14:20',
    arrival: '00:45',
    duration: '7h 25m',
    stops: 0,
    route: 'SIN → SYD',
    date: '2026-05-01',
    source: 'jetstar.com',
    sourceUrl: 'https://jetstar.com',
  },
  {
    id: 'f4',
    airline: 'AirAsia X',
    flightNumber: 'D7 212',
    price: 247,
    currency: 'USD',
    departure: '23:15',
    arrival: '13:40',
    duration: '11h 25m',
    stops: 1,
    stopCity: 'KUL',
    route: 'SIN → SYD',
    date: '2026-05-01',
    source: 'airasia.com',
    sourceUrl: 'https://airasia.com',
    badge: 'cheapest',
  },
]

// ── Hotel Options ──────────────────────────────────────

export const mockHotels: HotelOption[] = [
  {
    id: 'h1',
    name: 'Ovolo Woolloomooloo',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=260&fit=crop',
    location: 'Woolloomooloo Wharf',
    pricePerNight: 185,
    totalPrice: 740,
    currency: 'USD',
    rating: 4.6,
    nights: 4,
    checkIn: '2026-05-01',
    checkOut: '2026-05-05',
    source: 'booking.com',
    sourceUrl: 'https://booking.com',
    available: true,
    badge: 'recommended',
  },
  {
    id: 'h2',
    name: 'QT Sydney',
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=260&fit=crop',
    location: 'CBD · Market Street',
    pricePerNight: 210,
    totalPrice: 840,
    currency: 'USD',
    rating: 4.4,
    nights: 4,
    checkIn: '2026-05-01',
    checkOut: '2026-05-05',
    source: 'agoda.com',
    sourceUrl: 'https://agoda.com',
    available: true,
  },
  {
    id: 'h3',
    name: 'The Ultimo',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=260&fit=crop',
    location: 'Darling Harbour',
    pricePerNight: 142,
    totalPrice: 568,
    currency: 'USD',
    rating: 4.2,
    nights: 4,
    checkIn: '2026-05-01',
    checkOut: '2026-05-05',
    source: 'booking.com',
    sourceUrl: 'https://booking.com',
    available: true,
  },
  {
    id: 'h4',
    name: 'Park Hyatt Sydney',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=260&fit=crop',
    location: 'The Rocks',
    pricePerNight: 520,
    totalPrice: 2080,
    currency: 'USD',
    rating: 4.9,
    nights: 4,
    checkIn: '2026-05-01',
    checkOut: '2026-05-05',
    source: 'agoda.com',
    sourceUrl: 'https://agoda.com',
    available: true,
  },
]

// ── Discovery Items ────────────────────────────────────

export const mockDiscoveries: DiscoveryItem[] = [
  {
    id: 'd1',
    place: 'Bondi to Coogee Coastal Walk',
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&h=300&fit=crop',
    sentiment: 0.94,
    postCount: 2847,
    summary: 'Iconic 6km clifftop walk with ocean views, rock pools, and beach stops. Best started early morning.',
    category: 'experience',
    priceLevel: 'Free',
    duration: '2–3 hrs',
    quotes: [
      {
        source: 'reddit',
        text: 'Go at sunrise. By 10am it\'s wall-to-wall tourists and you can\'t get a photo without 50 people in it.',
        score: 342,
      },
      {
        source: 'xhs',
        text: 'The secret is to start from Coogee instead — everyone starts at Bondi so you walk against the crowd!',
        originalText: '秘诀是从Coogee出发——大家都从Bondi开始，这样你就逆着人流走！',
        score: 1205,
      },
    ],
    tags: ['arrival-friendly', 'free', 'morning-best'],
  },
  {
    id: 'd2',
    place: 'Sydney Fish Market',
    imageUrl: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&h=300&fit=crop',
    sentiment: 0.87,
    postCount: 1523,
    summary: 'Massive seafood market with new building opened 2025. Get there before 8am for the best selection.',
    category: 'restaurant',
    priceLevel: '$$',
    duration: '1–2 hrs',
    quotes: [
      {
        source: 'reddit',
        text: 'Skip the sit-down restaurants. The takeaway counters at the back have the same fish for half the price.',
        score: 891,
      },
      {
        source: 'tripadvisor',
        text: 'The new building is stunning but I miss the chaotic charm of the old market. Still a must-visit though.',
        score: 45,
      },
    ],
    tags: ['budget-hack', 'morning-best', 'book-ahead'],
  },
  {
    id: 'd3',
    place: 'The Rocks Friday Night Market',
    imageUrl: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=600&h=300&fit=crop',
    sentiment: 0.79,
    postCount: 892,
    summary: 'Friday night market under the Harbour Bridge with local food, art, and live music.',
    category: 'experience',
    priceLevel: '$',
    duration: '2–3 hrs',
    quotes: [
      {
        source: 'xhs',
        text: 'The paella stall near the bridge is incredible. Also the handmade jewelry is unique — can\'t find these online.',
        originalText: '桥附近的海鲜饭摊太好了。手工珠宝也很独特——网上找不到。',
        score: 567,
      },
    ],
    tags: ['evening', 'local-favorite', 'friday-only'],
  },
]

// ── Chat Messages ──────────────────────────────────────

export const mockChat: ChatMessage[] = [
  {
    id: 'c1',
    role: 'user',
    content: 'Plan a trip from Singapore to Sydney, May 1–5, budget $3000. Mid-range hotels, balanced pace.',
    timestamp: Date.now() - 180000,
  },
  {
    id: 'c2',
    role: 'assistant',
    content: 'I\'ll plan your Singapore → Sydney trip! Searching 6 airlines for the best outbound flights...',
    timestamp: Date.now() - 170000,
  },
  {
    id: 'c3',
    role: 'assistant',
    content: 'Great pick! Scoot TR 12 at $289 saves budget for better hotels. Now scanning 4 booking sites for accommodation near the CBD...',
    timestamp: Date.now() - 30000,
  },
]
