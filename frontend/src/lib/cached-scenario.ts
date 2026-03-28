/**
 * Cached Bali trip scenario — bypasses LLM entirely.
 * Edit this file to tweak the data the UI renders.
 * Activate with VITE_USE_CACHE=true in .env
 */
import type {
  TripPlan,
  LiveView,
  ChatMessage,
  FlightOption,
  HotelOption,
  DiscoveryItem,
  ItemDetail,
} from "../types"

// ── Flights ──────────────────────────────────────────────

export const baliFlights: FlightOption[] = [
  {
    id: "f-scoot",
    airline: "Scoot",
    flightNumber: "TR 288",
    price: 128,
    currency: "SGD",
    departure: "06:45",
    arrival: "09:30",
    duration: "2h 45m",
    stops: 0,
    route: "SIN → DPS",
    date: "2026-04-04",
    source: "flyscoot.com",
    sourceUrl: "https://flyscoot.com",
    badge: "best-value",
  },
  {
    id: "f-jetstar",
    airline: "Jetstar",
    flightNumber: "3K 587",
    price: 142,
    currency: "SGD",
    departure: "10:20",
    arrival: "13:05",
    duration: "2h 45m",
    stops: 0,
    route: "SIN → DPS",
    date: "2026-04-04",
    source: "jetstar.com",
    sourceUrl: "https://jetstar.com",
  },
  {
    id: "f-sq",
    airline: "Singapore Airlines",
    flightNumber: "SQ 938",
    price: 320,
    currency: "SGD",
    departure: "08:00",
    arrival: "10:45",
    duration: "2h 45m",
    stops: 0,
    route: "SIN → DPS",
    date: "2026-04-04",
    source: "singaporeair.com",
    sourceUrl: "https://singaporeair.com",
    badge: "premium",
  },
  {
    id: "f-airasia",
    airline: "AirAsia",
    flightNumber: "AK 520",
    price: 98,
    currency: "SGD",
    departure: "14:30",
    arrival: "17:15",
    duration: "2h 45m",
    stops: 0,
    route: "SIN → DPS",
    date: "2026-04-04",
    source: "airasia.com",
    sourceUrl: "https://airasia.com",
  },
]

export const baliReturnFlights: FlightOption[] = [
  {
    id: "fr-scoot",
    airline: "Scoot",
    flightNumber: "TR 289",
    price: 135,
    currency: "SGD",
    departure: "10:30",
    arrival: "15:15",
    duration: "2h 45m",
    stops: 0,
    route: "DPS → SIN",
    date: "2026-04-10",
    source: "flyscoot.com",
    sourceUrl: "https://flyscoot.com",
    badge: "best-value",
  },
  {
    id: "fr-sq",
    airline: "Singapore Airlines",
    flightNumber: "SQ 939",
    price: 310,
    currency: "SGD",
    departure: "16:00",
    arrival: "20:45",
    duration: "2h 45m",
    stops: 0,
    route: "DPS → SIN",
    date: "2026-04-10",
    source: "singaporeair.com",
    sourceUrl: "https://singaporeair.com",
    badge: "premium",
  },
]

// ── Hotels ───────────────────────────────────────────────

export const baliHotels: HotelOption[] = [
  {
    id: "h-komune",
    name: "Komune Resort & Beach Club",
    imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=200&fit=crop",
    location: "Keramas Beach",
    pricePerNight: 95,
    totalPrice: 570,
    currency: "SGD",
    rating: 4.4,
    nights: 6,
    checkIn: "2026-04-04",
    checkOut: "2026-04-10",
    source: "booking.com",
    sourceUrl: "https://booking.com",
    available: true,
    badge: "recommended",
  },
  {
    id: "h-uluwatu-surf",
    name: "Uluwatu Surf Villas",
    imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=200&fit=crop",
    location: "Uluwatu",
    pricePerNight: 120,
    totalPrice: 720,
    currency: "SGD",
    rating: 4.7,
    nights: 6,
    checkIn: "2026-04-04",
    checkOut: "2026-04-10",
    source: "agoda.com",
    sourceUrl: "https://agoda.com",
    available: true,
  },
  {
    id: "h-canggu-budget",
    name: "The Chillhouse Canggu",
    imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=200&fit=crop",
    location: "Canggu",
    pricePerNight: 55,
    totalPrice: 330,
    currency: "SGD",
    rating: 4.2,
    nights: 6,
    checkIn: "2026-04-04",
    checkOut: "2026-04-10",
    source: "booking.com",
    sourceUrl: "https://booking.com",
    available: true,
  },
  {
    id: "h-seminyak",
    name: "The Legian Seminyak",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop",
    location: "Seminyak",
    pricePerNight: 180,
    totalPrice: 1080,
    currency: "SGD",
    rating: 4.8,
    nights: 6,
    checkIn: "2026-04-04",
    checkOut: "2026-04-10",
    source: "agoda.com",
    sourceUrl: "https://agoda.com",
    available: true,
  },
]

// ── Surf Discoveries ─────────────────────────────────────

export const baliSurfSpots: DiscoveryItem[] = [
  {
    id: "d-uluwatu",
    place: "Uluwatu (Padang Padang & Suluban)",
    imageUrl: "https://images.unsplash.com/photo-1502680390548-bdbac40b3714?w=400&h=200&fit=crop",
    sentiment: 0.94,
    postCount: 312,
    summary: "World-class reef break. Left-hander, best at 4-8ft. Intermediate to advanced. The cliff-side cafes are legendary.",
    category: "beach",
    priceLevel: "Free",
    duration: "Half day",
    quotes: [
      { source: "reddit", text: "Padang Padang at dawn with only 3 other surfers is a life-changing experience. Go early or don't bother.", score: 487 },
      { source: "xhs", text: "Uluwatu sunset + surf = best combo in Bali. The stairs down are steep but worth it.", originalText: "乌鲁瓦图日落+冲浪=巴厘岛最佳组合。下去的台阶很陡但值得", score: 1203 },
      { source: "tripadvisor", text: "4.7/5 from 2,156 reviews. #1 Surf Spot in Bali." },
    ],
    tags: ["intermediate+", "reef-break", "sunrise-session", "iconic"],
  },
  {
    id: "d-canggu",
    place: "Canggu (Batu Bolong & Echo Beach)",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=200&fit=crop",
    sentiment: 0.88,
    postCount: 245,
    summary: "Best for beginners to intermediate. Beach break with consistent waves. Surf schools everywhere. Great cafe scene.",
    category: "beach",
    priceLevel: "$",
    duration: "Full day",
    quotes: [
      { source: "reddit", text: "Batu Bolong is perfect for learning — soft sand bottom, mellow waves. Board rental is like $5/day. Echo Beach for when you level up.", score: 234 },
      { source: "xhs", text: "Canggu is THE place for surf beginners in Bali. So many surf schools, lessons about 300k IDR/hour.", originalText: "苍谷是巴厘岛冲浪初学者的最佳选择。很多冲浪学校，课程约300k印尼盾/小时", score: 892 },
    ],
    tags: ["beginner-friendly", "beach-break", "surf-schools", "cafe-scene"],
  },
  {
    id: "d-keramas",
    place: "Keramas Beach",
    imageUrl: "https://images.unsplash.com/photo-1455729552457-5c322b382949?w=400&h=200&fit=crop",
    sentiment: 0.91,
    postCount: 89,
    summary: "Fast right-hander over black sand. Home of the Komune resort night surfing. Less crowded than Canggu.",
    category: "beach",
    priceLevel: "Free",
    duration: "Half day",
    quotes: [
      { source: "reddit", text: "Night surfing at Komune is insane — they light up the wave with floodlights. Totally unique experience.", score: 178 },
    ],
    tags: ["intermediate", "night-surfing", "less-crowded", "black-sand"],
  },
  {
    id: "d-medewi",
    place: "Medewi Beach",
    imageUrl: "https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?w=400&h=200&fit=crop",
    sentiment: 0.85,
    postCount: 56,
    summary: "Longest left point break in Bali. Mellow, uncrowded, authentic Bali vibes. 2hr drive from Canggu but worth it.",
    category: "beach",
    priceLevel: "Free",
    duration: "Day trip",
    quotes: [
      { source: "reddit", text: "If you want Bali 20 years ago, go to Medewi. Barely any tourists. The wave peels for 300m+ on a good day.", score: 145 },
    ],
    tags: ["point-break", "off-beaten-path", "day-trip", "mellow"],
  },
  {
    id: "d-bingin",
    place: "Bingin Beach",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=200&fit=crop",
    sentiment: 0.90,
    postCount: 134,
    summary: "Short but powerful left tube over reef. The cliffside bars and warungs are unbeatable. Couples favourite.",
    category: "beach",
    priceLevel: "$",
    duration: "Half day",
    quotes: [
      { source: "xhs", text: "Bingin is SO romantic. Tiny beach, cliffside restaurants, insane sunset. Boyfriend surfed while I read a book in the warung.", originalText: "宾金海滩超级浪漫。小海滩，悬崖餐厅，绝美日落。男朋友冲浪的时候我在小餐馆看书", score: 2100 },
      { source: "reddit", text: "Bingin is tube city when it's on. Even if you don't surf, the beach is stunning and way less touristy than Kuta.", score: 89 },
    ],
    tags: ["couples", "tube-riding", "cliffside-bars", "photogenic"],
  },
]

// ── Activities / Food ────────────────────────────────────

export const baliActivities: DiscoveryItem[] = [
  {
    id: "d-tegallalang",
    place: "Tegallalang Rice Terraces",
    imageUrl: "https://images.unsplash.com/photo-1531592937781-2a5805d8ae3d?w=400&h=200&fit=crop",
    sentiment: 0.82,
    postCount: 456,
    summary: "Iconic terraced landscape. Beautiful but crowded 10am-3pm. Go at 7am or skip for Jatiluwih (less touristy).",
    category: "nature",
    priceLevel: "$",
    duration: "2 hrs",
    quotes: [
      { source: "reddit", text: "Go at 7am. By 10am it's a zoo. Also Jatiluwih is 10x better if you have a scooter — UNESCO site, almost empty.", score: 312 },
      { source: "xhs", text: "Tegallalang looks amazing in photos but it's very commercial now. Still worth 1 hour early morning.", originalText: "德格拉朗拍照很美但现在很商业化了。早上去1小时还是值得的", score: 654 },
    ],
    tags: ["instagram-spot", "go-early", "nature"],
  },
  {
    id: "d-nusapenida",
    place: "Nusa Penida Day Trip",
    imageUrl: "https://images.unsplash.com/photo-1570789210967-2cac24ba04c0?w=400&h=200&fit=crop",
    sentiment: 0.93,
    postCount: 289,
    summary: "Dramatic cliffs, Kelingking Beach, Crystal Bay snorkeling, manta rays. Book a fast boat from Sanur (30 min).",
    category: "nature",
    priceLevel: "$$",
    duration: "Full day",
    quotes: [
      { source: "reddit", text: "Kelingking viewpoint is jaw-dropping. Don't bother hiking down unless you're very fit — the view from top is the money shot.", score: 567 },
      { source: "tripadvisor", text: "4.8/5 from 3,241 reviews. Must-visit island near Bali." },
    ],
    tags: ["day-trip", "snorkeling", "must-visit", "book-ahead"],
  },
  {
    id: "d-warungsol",
    place: "Warung Sol (Canggu)",
    sentiment: 0.89,
    postCount: 78,
    summary: "Best fish tacos in Canggu. Surfer hangout with ice-cold Bintang. $4-6 per meal. Always packed after 6pm.",
    category: "restaurant",
    priceLevel: "$",
    duration: "1 hr",
    quotes: [
      { source: "reddit", text: "Warung Sol fish tacos are the best post-surf meal in all of Canggu. Get there before 6 or you're waiting 30 min.", score: 156 },
    ],
    tags: ["surf-fuel", "budget-eat", "fish-tacos"],
  },
  {
    id: "d-singletfin",
    place: "Single Fin (Uluwatu)",
    imageUrl: "https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=400&h=200&fit=crop",
    sentiment: 0.91,
    postCount: 201,
    summary: "Iconic cliff-top bar overlooking the surf break. Sunday sessions are legendary. Watch surfers while drinking sunset cocktails.",
    category: "nightlife",
    priceLevel: "$$",
    duration: "2-3 hrs",
    quotes: [
      { source: "xhs", text: "Single Fin Sunday sunset session is the BEST Bali experience. Live music, cocktails, watching surfers below the cliff.", originalText: "Single Fin周日日落派对是巴厘岛最棒的体验。现场音乐、鸡尾酒、看悬崖下的冲浪者", score: 3400 },
      { source: "reddit", text: "Sunday at Single Fin is a must. Get there by 4pm for a good seat. Cocktails are pricey ($8-12) but the view is priceless.", score: 234 },
    ],
    tags: ["sunset", "nightlife", "couples", "sunday-session"],
  },
]

// ── Trip Plan (Left Panel) ───────────────────────────────

export const cachedTripPlan: TripPlan = {
  id: "trip-bali-2026",
  requirements: {
    destination: "Bali — Surf Trip",
    when: "Apr 4–10, 2026",
    budget: 3000,
    budgetRemaining: 3000,
    preferences: {
      canDrive: false,
      hotelClass: "mid",
      travelStyle: "balanced",
    },
  },
  nodes: [
    {
      id: "bali",
      type: "destination",
      label: "Bali (Apr 4–10)",
      status: "active",
      children: [
        { id: "flight-out", type: "flight", label: "Flight SIN → DPS", status: "pending" },
        { id: "hotel", type: "hotel", label: "Hotel (6 nights)", status: "pending" },
        { id: "day1", type: "activity", label: "Day 1 — Arrive + Canggu", status: "pending" },
        { id: "day2", type: "activity", label: "Day 2 — Uluwatu Surf", status: "pending" },
        { id: "day3", type: "activity", label: "Day 3 — Keramas + Nusa Penida", status: "pending" },
        { id: "day4", type: "activity", label: "Day 4 — Bingin + Chill", status: "pending" },
        { id: "day5", type: "activity", label: "Day 5 — Rice Terraces", status: "pending" },
        { id: "day6", type: "activity", label: "Day 6 — Medewi Day Trip", status: "pending" },
        { id: "flight-ret", type: "flight", label: "Flight DPS → SIN", status: "pending" },
      ],
    },
  ],
}

// ── Right Panel Views (per node) ─────────────────────────

export const cachedNodeViews: Record<string, LiveView> = {
  "flight-out": {
    nodeId: "flight-out",
    phase: "flights",
    title: "Flights SIN → DPS",
    subtitle: "Apr 4, 2026 · 2 adults · Economy",
    agents: [],
    flights: baliFlights,
    hotels: [],
    discoveries: [],
    decidedItem: null,
  },
  "flight-ret": {
    nodeId: "flight-ret",
    phase: "flights",
    title: "Flights DPS → SIN",
    subtitle: "Apr 10, 2026 · 2 adults · Economy",
    agents: [],
    flights: baliReturnFlights,
    hotels: [],
    discoveries: [],
    decidedItem: null,
  },
  hotel: {
    nodeId: "hotel",
    phase: "hotels",
    title: "Hotels in Bali",
    subtitle: "Apr 4–10 · 6 nights · 2 guests",
    agents: [],
    flights: [],
    hotels: baliHotels,
    discoveries: [],
    decidedItem: null,
  },
  day1: {
    nodeId: "day1",
    phase: "discovery",
    title: "Day 1 — Arrive + Canggu Surf",
    subtitle: "Community picks from Reddit & XHS",
    agents: [],
    flights: [],
    hotels: [],
    discoveries: [baliSurfSpots[1], baliActivities[2]], // Canggu + Warung Sol
    decidedItem: null,
  },
  day2: {
    nodeId: "day2",
    phase: "discovery",
    title: "Day 2 — Uluwatu Surf Session",
    subtitle: "Community picks from Reddit & XHS",
    agents: [],
    flights: [],
    hotels: [],
    discoveries: [baliSurfSpots[0], baliSurfSpots[4], baliActivities[3]], // Uluwatu + Bingin + Single Fin
    decidedItem: null,
  },
  day3: {
    nodeId: "day3",
    phase: "discovery",
    title: "Day 3 — Keramas + Nusa Penida",
    subtitle: "Community picks from Reddit & XHS",
    agents: [],
    flights: [],
    hotels: [],
    discoveries: [baliSurfSpots[2], baliActivities[1]], // Keramas + Nusa Penida
    decidedItem: null,
  },
  day4: {
    nodeId: "day4",
    phase: "discovery",
    title: "Day 4 — Bingin Beach & Chill",
    subtitle: "Community picks from Reddit & XHS",
    agents: [],
    flights: [],
    hotels: [],
    discoveries: [baliSurfSpots[4], baliActivities[3]], // Bingin + Single Fin
    decidedItem: null,
  },
  day5: {
    nodeId: "day5",
    phase: "discovery",
    title: "Day 5 — Rice Terraces & Culture",
    subtitle: "Community picks from Reddit & XHS",
    agents: [],
    flights: [],
    hotels: [],
    discoveries: [baliActivities[0]], // Tegallalang
    decidedItem: null,
  },
  day6: {
    nodeId: "day6",
    phase: "discovery",
    title: "Day 6 — Medewi Day Trip",
    subtitle: "Community picks from Reddit & XHS",
    agents: [],
    flights: [],
    hotels: [],
    discoveries: [baliSurfSpots[3]], // Medewi
    decidedItem: null,
  },
}

// ── Item Details (extended info for detail view) ─────────

export const cachedItemDetails: Record<string, ItemDetail> = {
  // Hotels
  "h-komune": {
    itemId: "h-komune",
    description: "Beachfront surf resort on Keramas Beach with its own wave-lit night surfing. Pool, spa, and surf school on-site. 35 min from airport, 45 min from Canggu.",
    comments: [
      { source: "reddit", text: "Komune is THE surf resort in Bali. The night surfing alone is worth it — they light up the wave with stadium lights. Pool is gorgeous too.", score: 312 },
      { source: "reddit", text: "Stayed 5 nights, board rental included. Staff helped me find the best tide windows. Breakfast buffet is solid.", score: 145 },
      { source: "xhs", text: "Komune的夜冲太震撼了！灯光打在浪上超级美。泳池无边际，面朝大海。早餐自助很丰盛。", originalText: "Komune的夜冲太震撼了！灯光打在浪上超级美。泳池无边际，面朝大海。早餐自助很丰盛。", score: 2340 },
      { source: "tripadvisor", text: "4.4/5 from 1,892 reviews. Great for couples who surf. Night surfing is unique to this resort." },
      { source: "xhs", text: "性价比超高的冲浪度假村，一晚才600多人民币，含早餐和泳池。黑沙滩很特别。", originalText: "性价比超高的冲浪度假村，一晚才600多人民币，含早餐和泳池。黑沙滩很特别。", score: 1560 },
    ],
    bookingLinks: [
      { provider: "Booking.com", url: "https://booking.com/hotel/id/komune-resort.html", price: 95, currency: "SGD", note: "Free cancellation until Apr 1" },
      { provider: "Agoda", url: "https://agoda.com/komune-resort", price: 89, currency: "SGD", note: "Member price" },
      { provider: "Official Site", url: "https://komuneresorts.com", price: 105, currency: "SGD", note: "Includes breakfast + surf lesson" },
    ],
    priceComparisons: [
      { source: "Booking.com", price: 95, currency: "SGD", url: "https://booking.com/hotel/id/komune-resort.html" },
      { source: "Agoda", price: 89, currency: "SGD", url: "https://agoda.com/komune-resort" },
      { source: "Expedia", price: 98, currency: "SGD", url: "https://expedia.com/komune-resort" },
    ],
    highlights: ["Night surfing with floodlights", "Beachfront infinity pool", "On-site surf school", "Free breakfast buffet", "35 min from airport"],
  },
  "h-uluwatu-surf": {
    itemId: "h-uluwatu-surf",
    description: "Boutique surf villas perched on the Uluwatu clifftop. Steps from Padang Padang and Suluban. Each villa has a private plunge pool. Popular with couples.",
    comments: [
      { source: "reddit", text: "The villas are insane — private pool, ocean view, 5 min walk to Padang Padang. Expensive for Bali but worth every cent for a surf trip.", score: 267 },
      { source: "xhs", text: "乌鲁瓦图冲浪别墅太美了，私人泳池对着大海，走路5分钟到Padang Padang海滩。情侣必住！", originalText: "乌鲁瓦图冲浪别墅太美了，私人泳池对着大海，走路5分钟到Padang Padang海滩。情侣必住！", score: 3200 },
      { source: "tripadvisor", text: "4.7/5 from 945 reviews. #2 Surf Accommodation in Uluwatu." },
    ],
    bookingLinks: [
      { provider: "Agoda", url: "https://agoda.com/uluwatu-surf-villas", price: 120, currency: "SGD" },
      { provider: "Booking.com", url: "https://booking.com/hotel/id/uluwatu-surf-villas.html", price: 125, currency: "SGD" },
    ],
    priceComparisons: [
      { source: "Agoda", price: 120, currency: "SGD", url: "https://agoda.com/uluwatu-surf-villas" },
      { source: "Booking.com", price: 125, currency: "SGD", url: "https://booking.com/hotel/id/uluwatu-surf-villas.html" },
    ],
    highlights: ["Private plunge pool per villa", "5 min walk to Padang Padang", "Cliff-top ocean views", "Couples paradise", "Surf board storage"],
  },
  "h-canggu-budget": {
    itemId: "h-canggu-budget",
    description: "Surf-and-yoga hostel in the heart of Canggu. Dorm and private rooms, co-working space, pool, daily yoga classes. 10 min walk to Batu Bolong.",
    comments: [
      { source: "reddit", text: "Chillhouse is the best value in Canggu. Private room was $55/night, pool is great, and you meet cool surfers. Daily yoga included.", score: 189 },
      { source: "reddit", text: "If you're on a budget, this is the move. Clean, social, great location near Batu Bolong. The co-working space is a nice bonus.", score: 98 },
      { source: "xhs", text: "苍谷最有氛围的青旅，泳池很出片，每天有免费瑜伽课。离Batu Bolong冲浪点走路10分钟。", originalText: "苍谷最有氛围的青旅，泳池很出片，每天有免费瑜伽课。离Batu Bolong冲浪点走路10分钟。", score: 980 },
    ],
    bookingLinks: [
      { provider: "Booking.com", url: "https://booking.com/hotel/id/the-chillhouse-canggu.html", price: 55, currency: "SGD" },
      { provider: "Hostelworld", url: "https://hostelworld.com/chillhouse-canggu", price: 52, currency: "SGD", note: "10% off for 5+ nights" },
    ],
    highlights: ["Daily yoga classes included", "Pool + co-working", "10 min to Batu Bolong", "Board rental available", "Social atmosphere"],
  },
  "h-seminyak": {
    itemId: "h-seminyak",
    description: "5-star luxury beachfront resort in Seminyak. Iconic Balinese design, award-winning spa, butler service. The pool suites are spectacular.",
    comments: [
      { source: "tripadvisor", text: "4.8/5 from 2,341 reviews. #1 Luxury Hotel in Seminyak. Exceptional service." },
      { source: "xhs", text: "五星级体验，管家服务太贴心了。泳池套房直通无边际泳池，spa是巴厘岛最好的之一。", originalText: "五星级体验，管家服务太贴心了。泳池套房直通无边际泳池，spa是巴厘岛最好的之一。", score: 4500 },
      { source: "reddit", text: "If you're splashing out, The Legian is peak Bali luxury. Sunset from the pool bar is next level. But it's 30+ min drive to any decent surf.", score: 156 },
    ],
    bookingLinks: [
      { provider: "Agoda", url: "https://agoda.com/the-legian-seminyak", price: 180, currency: "SGD" },
      { provider: "Official Site", url: "https://lhm-hotels.com/legian-seminyak", price: 195, currency: "SGD", note: "Includes airport transfer + spa credit" },
    ],
    highlights: ["Butler service", "Beachfront infinity pool", "Award-winning spa", "Sunset cocktails", "30 min from surf spots"],
  },

  // Surf spots / discoveries
  "d-uluwatu": {
    itemId: "d-uluwatu",
    description: "Uluwatu is Bali's most famous surf zone, with multiple breaks along the limestone cliffs. Padang Padang is the headline act — a heavy left barrel over shallow reef. Suluban (Blue Point) is more accessible for intermediate surfers.",
    comments: [
      { source: "reddit", text: "Padang Padang at dawn with only 3 other surfers is a life-changing experience. Go early or don't bother.", score: 487 },
      { source: "reddit", text: "Suluban is more forgiving than Padang. Still reef, but the inside section is doable for strong intermediates. Rent a board at the cave entrance.", score: 234 },
      { source: "reddit", text: "WARNING: the reef is sharp and shallow at low tide. Wear reef booties. I saw two guys get stitches at the Bingin clinic.", score: 189 },
      { source: "xhs", text: "乌鲁瓦图日落+冲浪=巴厘岛最佳组合。台阶很陡但值得。推荐住附近的Bingin area。", originalText: "乌鲁瓦图日落+冲浪=巴厘岛最佳组合。台阶很陡但值得。推荐住附近的Bingin area。", score: 1203 },
      { source: "xhs", text: "Padang Padang很适合拍照但浪比较大，初学者不推荐。旁边的Suluban好一些。悬崖咖啡厅必去！", originalText: "Padang Padang很适合拍照但浪比较大，初学者不推荐。旁边的Suluban好一些。悬崖咖啡厅必去！", score: 890 },
      { source: "tripadvisor", text: "4.7/5 from 2,156 reviews. #1 Surf Spot in Bali. Magical at sunrise." },
    ],
    bookingLinks: [
      { provider: "GetYourGuide", url: "https://getyourguide.com/uluwatu-surf-lesson", price: 45, currency: "SGD", note: "2hr guided surf lesson" },
      { provider: "Klook", url: "https://klook.com/bali-uluwatu-surf", price: 38, currency: "SGD", note: "Board rental + transport" },
    ],
    highlights: ["World-class left barrel", "Multiple breaks for all levels", "Cliff-side cafes", "Best at sunrise", "Reef booties recommended"],
  },
  "d-canggu": {
    itemId: "d-canggu",
    description: "Canggu is Bali's surf and cafe capital. Batu Bolong is the go-to for beginners — soft sand bottom, mellow whitewater. Echo Beach is a step up with more power. Old Man's bar is the after-surf institution.",
    comments: [
      { source: "reddit", text: "Batu Bolong is perfect for learning — soft sand bottom, mellow waves. Board rental is like $5/day. Echo Beach for when you level up.", score: 234 },
      { source: "reddit", text: "Old Man's after sunset session is the vibe. $3 Bintang, live music, every surfer in Canggu ends up there.", score: 312 },
      { source: "xhs", text: "苍谷是巴厘岛冲浪初学者的最佳选择。很多冲浪学校，课程约300k印尼盾/小时。", originalText: "苍谷是巴厘岛冲浪初学者的最佳选择。很多冲浪学校，课程约300k印尼盾/小时。", score: 892 },
      { source: "xhs", text: "Echo Beach的浪比Batu Bolong大很多，适合进阶选手。旁边的The Lawn很适合看日落。", originalText: "Echo Beach的浪比Batu Bolong大很多，适合进阶选手。旁边的The Lawn很适合看日落。", score: 670 },
    ],
    bookingLinks: [
      { provider: "Klook", url: "https://klook.com/canggu-surf-school", price: 25, currency: "SGD", note: "2hr group lesson + board" },
      { provider: "GetYourGuide", url: "https://getyourguide.com/canggu-surf", price: 30, currency: "SGD", note: "Private lesson" },
    ],
    highlights: ["Beginner-friendly beach break", "Board rental $5/day", "Cafe culture capital", "Old Man's bar after-surf", "Surf schools everywhere"],
  },
  "d-keramas": {
    itemId: "d-keramas",
    description: "Fast right-hander breaking over black volcanic sand. Home of the WSL championship tour stop. Komune resort runs the only night surfing setup in Bali with floodlights.",
    comments: [
      { source: "reddit", text: "Night surfing at Komune is insane — they light up the wave with floodlights. Totally unique experience. Even if you don't surf, watching is wild.", score: 178 },
      { source: "reddit", text: "Keramas is powerful and fast. Not for beginners. But the black sand beach is beautiful and way less crowded than south Bali.", score: 89 },
    ],
    bookingLinks: [
      { provider: "Komune Resort", url: "https://komuneresorts.com/night-surf", price: 35, currency: "SGD", note: "Night surf session + board" },
    ],
    highlights: ["Night surfing with floodlights", "WSL championship venue", "Black volcanic sand", "Less crowded", "Powerful right-hander"],
  },
  "d-bingin": {
    itemId: "d-bingin",
    description: "A hidden gem tucked below dramatic limestone cliffs. Short, hollow left tubes over reef — thrilling when it's on. The cliffside warungs serve cold Bintang with million-dollar views.",
    comments: [
      { source: "xhs", text: "宾金海滩超级浪漫。小海滩，悬崖餐厅，绝美日落。男朋友冲浪的时候我在小餐馆看书。", originalText: "宾金海滩超级浪漫。小海滩，悬崖餐厅，绝美日落。男朋友冲浪的时候我在小餐馆看书。", score: 2100 },
      { source: "reddit", text: "Bingin is tube city when it's on. Even if you don't surf, the beach is stunning and way less touristy than Kuta.", score: 89 },
      { source: "reddit", text: "The stairs down are sketchy but worth it. Grab a Nasi Goreng at the warung right at the bottom — best $2 meal with the best view.", score: 145 },
      { source: "xhs", text: "从悬崖上的小路走下去，突然看到这片绿松石色的海水和白沙滩，太惊艳了。", originalText: "从悬崖上的小路走下去，突然看到这片绿松石色的海水和白沙滩，太惊艳了。", score: 1800 },
    ],
    bookingLinks: [],
    highlights: ["Hollow left tubes", "Cliffside warungs", "Romantic sunset spot", "Less touristy", "Steep stairs access"],
  },
  "d-medewi": {
    itemId: "d-medewi",
    description: "Bali's longest left point break — waves peel for 300m+ on a good day. Two hours from Canggu in west Bali. Feels like Bali 20 years ago. Almost no tourists.",
    comments: [
      { source: "reddit", text: "If you want Bali 20 years ago, go to Medewi. Barely any tourists. The wave peels for 300m+ on a good day. Bring your own board.", score: 145 },
      { source: "reddit", text: "The drive is long but the wave is so worth it. We rented a scooter from Canggu — stunning rice paddy views the whole way.", score: 78 },
    ],
    bookingLinks: [],
    highlights: ["Longest left in Bali (300m+)", "Zero crowds", "Authentic local vibe", "2hr drive from Canggu", "Scooter rental recommended"],
  },
  "d-tegallalang": {
    itemId: "d-tegallalang",
    description: "Bali's most photographed rice terraces — a UNESCO-adjacent subak irrigation system carved into a steep valley. Beautiful but very touristy. Best at dawn.",
    comments: [
      { source: "reddit", text: "Go at 7am. By 10am it's a zoo. Also Jatiluwih is 10x better if you have a scooter — UNESCO site, almost empty.", score: 312 },
      { source: "xhs", text: "德格拉朗拍照很美但现在很商业化了。早上去1小时还是值得的。", originalText: "德格拉朗拍照很美但现在很商业化了。早上去1小时还是值得的。", score: 654 },
    ],
    bookingLinks: [
      { provider: "Klook", url: "https://klook.com/tegallalang-rice-terrace-tour", price: 22, currency: "SGD", note: "Guided tour + lunch" },
    ],
    highlights: ["Iconic photo spot", "Go before 8am", "Subak irrigation system", "Jatiluwih is better alternative", "Entrance fee ~20k IDR"],
  },
  "d-nusapenida": {
    itemId: "d-nusapenida",
    description: "Dramatic island 30 min by fast boat from Sanur. Kelingking T-Rex cliff, Crystal Bay snorkeling, manta ray encounters. Book a day tour or rent a scooter on the island.",
    comments: [
      { source: "reddit", text: "Kelingking viewpoint is jaw-dropping. Don't bother hiking down unless you're very fit — the view from top is the money shot.", score: 567 },
      { source: "tripadvisor", text: "4.8/5 from 3,241 reviews. Must-visit island near Bali." },
      { source: "xhs", text: "努沙佩尼达一日游绝对值得！快船30分钟就到。Kelingking太壮观了，Crystal Bay浮潜看到了海龟。", originalText: "努沙佩尼达一日游绝对值得！快船30分钟就到。Kelingking太壮观了，Crystal Bay浮潜看到了海龟。", score: 2800 },
    ],
    bookingLinks: [
      { provider: "Klook", url: "https://klook.com/nusa-penida-day-tour", price: 55, currency: "SGD", note: "Fast boat + tour + lunch" },
      { provider: "GetYourGuide", url: "https://getyourguide.com/nusa-penida-snorkel", price: 62, currency: "SGD", note: "Snorkel tour + manta rays" },
    ],
    highlights: ["Kelingking T-Rex cliff", "Crystal Bay snorkeling", "Manta ray encounters", "Fast boat from Sanur", "Book 1 day ahead"],
  },
  "d-warungsol": {
    itemId: "d-warungsol",
    description: "Legendary surfer hangout in Canggu. The fish tacos are the best post-surf meal in town. Ice-cold Bintang, chill vibes, always packed after 6pm.",
    comments: [
      { source: "reddit", text: "Warung Sol fish tacos are the best post-surf meal in all of Canggu. Get there before 6 or you're waiting 30 min.", score: 156 },
      { source: "reddit", text: "The burritos are massive too. Like $4 for a meal that fills you up. Best value in Canggu.", score: 89 },
    ],
    bookingLinks: [
      { provider: "Google Maps", url: "https://maps.google.com/warung-sol-canggu" },
    ],
    highlights: ["Famous fish tacos", "$4-6 per meal", "Post-surf institution", "Arrive before 6pm", "Cash only"],
  },
  "d-singletfin": {
    itemId: "d-singletfin",
    description: "Iconic cliff-top bar perched above Uluwatu's surf break. Watch surfers rip while sipping cocktails. Sunday sessions with live music are legendary — THE Bali sunset experience.",
    comments: [
      { source: "xhs", text: "Single Fin周日日落派对是巴厘岛最棒的体验。现场音乐、鸡尾酒、看悬崖下的冲浪者。", originalText: "Single Fin周日日落派对是巴厘岛最棒的体验。现场音乐、鸡尾酒、看悬崖下的冲浪者。", score: 3400 },
      { source: "reddit", text: "Sunday at Single Fin is a must. Get there by 4pm for a good seat. Cocktails are pricey ($8-12) but the view is priceless.", score: 234 },
      { source: "reddit", text: "Even on non-Sunday, watching the sunset over the surf from the cliff is special. Try the nachos — surprisingly good.", score: 112 },
      { source: "xhs", text: "鸡尾酒80-120k印尼盾，不算便宜但景色无价。推荐坐最外面的位置看冲浪者。", originalText: "鸡尾酒80-120k印尼盾，不算便宜但景色无价。推荐坐最外面的位置看冲浪者。", score: 1900 },
    ],
    bookingLinks: [
      { provider: "Google Maps", url: "https://maps.google.com/single-fin-uluwatu" },
    ],
    highlights: ["Cliff-top sunset views", "Sunday live music sessions", "Watch surfers below", "Arrive by 4pm Sunday", "Cocktails $8-12"],
  },
}

// ── Chat Messages ────────────────────────────────────────

export const cachedChatMessages: ChatMessage[] = [
  {
    id: "c1",
    role: "assistant",
    content: `<h2>Bali Surf Trip — Apr 4–10</h2>
<p class="chat-subtitle">6 nights, SGD 3,000 budget, from Singapore</p>

<p>I've put together a <strong>surf-focused itinerary</strong> hitting Bali's best breaks — from the beginner-friendly beach breaks of <strong>Canggu</strong> to the world-class reef at <strong>Uluwatu</strong>.</p>

<p>Click any item in the trip plan to see <strong>live prices and community recommendations</strong> from Reddit, XHS, and TripAdvisor.</p>

<div class="chat-insight">
  <div class="chat-insight-title">Budget check</div>
  <div>SGD 3,000 for 2 people, 6 nights in Bali is very comfortable. Budget flights (~$130 each way) + mid-range surf hotel (~$95/night) leaves plenty for activities, food, and board rentals.</div>
</div>`,
    timestamp: Date.now(),
  },
]
