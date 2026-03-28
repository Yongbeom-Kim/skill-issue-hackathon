# Travel Planner Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Use the **frontend-design** skill when implementing component markup and styles.

**Goal:** Build all UI components for the 3-panel travel planner: left (decision tree), middle (chat/narrative), right (live visualization with 6 states). Driven by Jotai atoms with mock data for standalone demo.

**Architecture:** Three-panel CSS grid layout. Each panel reads from its own Jotai atom (`tripPlanAtom`, `chatMessagesAtom`, `liveViewAtom`). Components are pure presentational — the orchestrator (built separately) writes to atoms via tool handlers. Mock data module provides realistic sample state for all 6 right-panel views.

**Tech Stack:** React 19, TypeScript (strict), Jotai, Vite, plain CSS with custom properties (no Tailwind, no component library)

**Reference files:**
- Types: `frontend/src/types/index.ts`
- Atoms: `frontend/src/atoms/` (tripPlan, liveView, chat)
- Source icons: `frontend/src/lib/source-icons.ts`
- Design spec: `docs/superpowers/specs/2026-03-28-travel-planner-design.md`
- Tool interface spec: `docs/superpowers/specs/2026-03-28-tool-interface-spec.md`
- Mockups: `.superpowers/brainstorm/40797-1774675314/content/` (layout-v5.html, full-mockup.html, right-panel-flights.html, chat-final.html)

**File structure (all files to create):**
```
frontend/src/
  components/
    Layout.tsx          ← 3-panel CSS grid
    Layout.css
    LeftPanel.tsx        ← Trip header + budget + tree
    LeftPanel.css
    TripNodeItem.tsx     ← Recursive tree node
    TripNodeItem.css
    Chat.tsx             ← Narrative view + input bar
    Chat.css
    RightPanel.tsx       ← Phase router (6 states)
    RightPanel.css
    AgentStatusRow.tsx   ← Loading state agent row
    AgentStatusRow.css
    FlightCard.tsx       ← Flight comparison card
    FlightCard.css
    HotelCard.tsx        ← Hotel card with image
    HotelCard.css
    DiscoveryCard.tsx    ← Community card with quotes
    DiscoveryCard.css
  lib/
    mock-data.ts         ← Realistic sample data for all views
```

---

### Task 1: Foundation — CSS Reset, Design Tokens, Layout Grid, Mock Data

**Files:**
- Modify: `frontend/src/index.css` (replace entirely)
- Modify: `frontend/src/App.css` (replace entirely — clear old content)
- Create: `frontend/src/components/Layout.tsx`
- Create: `frontend/src/components/Layout.css`
- Modify: `frontend/src/App.tsx`
- Create: `frontend/src/lib/mock-data.ts`

- [ ] **Step 1: Replace `index.css` with design tokens and reset**

Replace the entire contents of `frontend/src/index.css`:

```css
/* Design tokens extracted from approved mockups */
:root {
  --color-primary: #4361ee;
  --color-primary-light: #f0edff;
  --color-primary-bg: #f8f9ff;
  --color-accent: #7209b7;
  --color-text: #1a1a2e;
  --color-text-secondary: #555;
  --color-text-muted: #888;
  --color-text-light: #aaa;
  --color-success: #22c55e;
  --color-success-light: #dcfce7;
  --color-success-bg: #f0fdf4;
  --color-success-border: #bbf7d0;
  --color-warning: #d97706;
  --color-warning-light: #fef3c7;
  --color-border: #e8e8ec;
  --color-border-light: #f0f0f0;
  --color-bg: #fff;
  --color-bg-secondary: #fafafa;
  --color-bg-tag: #f0f0f5;
  --color-bg-input: #f5f5f7;
  --color-xhs: #e74c3c;
  --color-reddit: #ff6600;
  --color-tripadvisor: #00aa6c;

  --font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, Consolas, monospace;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 12px;
  --radius-full: 9999px;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--color-text);
  background: var(--color-bg-secondary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  height: 100vh;
  overflow: hidden;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

- [ ] **Step 2: Clear `App.css`**

Replace the entire contents of `frontend/src/App.css` with an empty file:

```css
/* App-level styles — currently empty, all styles live in component CSS files */
```

- [ ] **Step 3: Create `Layout.tsx` and `Layout.css`**

Create `frontend/src/components/Layout.tsx`:

```tsx
import type { ReactNode } from "react"
import "./Layout.css"

interface LayoutProps {
  left: ReactNode
  middle: ReactNode
  right: ReactNode
}

export function Layout({ left, middle, right }: LayoutProps) {
  return (
    <div className="layout">
      <div className="layout-left">{left}</div>
      <div className="layout-middle">{middle}</div>
      <div className="layout-right">{right}</div>
    </div>
  )
}
```

Create `frontend/src/components/Layout.css`:

```css
.layout {
  display: flex;
  height: 100vh;
  background: var(--color-bg-secondary);
}

.layout-left {
  width: 260px;
  min-width: 260px;
  background: var(--color-bg);
  border-right: 2px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-middle {
  flex: 1;
  background: var(--color-bg);
  border-right: 2px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-right {
  width: 380px;
  min-width: 380px;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

- [ ] **Step 4: Update `App.tsx` with Layout and placeholder panels**

Replace the entire contents of `frontend/src/App.tsx`:

```tsx
import "./App.css"
import { Layout } from "./components/Layout"

function App() {
  return (
    <Layout
      left={<div style={{ padding: 18 }}>Left Panel</div>}
      middle={<div style={{ padding: 28 }}>Chat Panel</div>}
      right={<div style={{ padding: 18 }}>Right Panel</div>}
    />
  )
}

export default App
```

- [ ] **Step 5: Create mock data module**

Create `frontend/src/lib/mock-data.ts`:

```ts
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
```

- [ ] **Step 6: Verify layout renders**

Run: `cd frontend && npm run dev`

Expected: Browser shows a 3-panel layout — left (260px), middle (flex), right (380px) — each with placeholder text. No visual styling errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/index.css frontend/src/App.css frontend/src/App.tsx frontend/src/components/Layout.tsx frontend/src/components/Layout.css frontend/src/lib/mock-data.ts
git commit -m "feat: add design tokens, layout grid, and mock data for travel planner UI"
```

---

### Task 2: Left Panel — Trip Tree + Budget Bar

**Files:**
- Create: `frontend/src/components/LeftPanel.tsx`
- Create: `frontend/src/components/LeftPanel.css`
- Create: `frontend/src/components/TripNodeItem.tsx`
- Create: `frontend/src/components/TripNodeItem.css`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Create `TripNodeItem.tsx` and `TripNodeItem.css`**

This component renders a single tree node and recurses for children. Three visual states: pending (gray circle), active (blue highlight bar), decided (green checkmark + cost).

Create `frontend/src/components/TripNodeItem.tsx`:

```tsx
import type { TripNode } from "../types"
import "./TripNodeItem.css"

interface TripNodeItemProps {
  node: TripNode
  depth: number
  onNodeClick: (nodeId: string, label: string) => void
}

export function TripNodeItem({ node, depth, onNodeClick }: TripNodeItemProps) {
  const isDestination = node.type === "destination"
  const isLeaf = !node.children || node.children.length === 0

  return (
    <>
      {isDestination && depth > 0 && <div className="node-divider" />}

      <button
        className={`trip-node trip-node--${node.status}${isDestination ? " trip-node--destination" : ""}`}
        style={{ paddingLeft: isDestination ? 18 : 18 + depth * 18 }}
        onClick={() => onNodeClick(node.id, node.label)}
        type="button"
      >
        {isDestination ? (
          <>
            <span className="node-caret">&#x25BC;</span>
            <span className="node-label">{node.label}</span>
          </>
        ) : (
          <>
            <span className="node-icon">
              {node.status === "decided" && <span className="node-check">&#x2713;</span>}
              {node.status === "active" && <span className="node-active-dot">&#x25B6;</span>}
              {node.status === "pending" && <span className="node-pending-dot">&#x25CB;</span>}
            </span>
            <span className="node-label">{node.label}</span>
            {node.status === "decided" && node.cost != null && (
              <span className="node-cost">${node.cost}</span>
            )}
          </>
        )}
      </button>

      {isDestination && node.children && !isLeaf && (
        <div className="node-children">
          {node.children.map((child) => (
            <TripNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </>
  )
}
```

Create `frontend/src/components/TripNodeItem.css`:

```css
.trip-node {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 5px 18px;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 12px;
  color: var(--color-text-light);
  cursor: pointer;
  text-align: left;
  line-height: 1.4;
  transition: background 0.1s;
}

.trip-node:hover {
  background: var(--color-bg-input);
}

.trip-node--destination {
  padding-top: 6px;
  padding-bottom: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
}

.trip-node--active:not(.trip-node--destination) {
  background: linear-gradient(90deg, var(--color-primary-light), transparent);
  border-left: 3px solid var(--color-primary);
  margin-left: 15px;
  font-weight: 600;
  color: var(--color-primary);
}

.trip-node--decided:not(.trip-node--destination) {
  color: var(--color-text-secondary);
}

.node-caret {
  font-size: 10px;
  color: var(--color-text);
}

.node-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.node-check {
  color: var(--color-success);
  font-size: 13px;
}

.node-active-dot {
  color: var(--color-primary);
  font-size: 10px;
}

.node-pending-dot {
  color: var(--color-text-light);
  font-size: 12px;
}

.node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-cost {
  margin-left: auto;
  font-size: 11px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.node-divider {
  border-bottom: 1px solid var(--color-border);
  margin: 8px 18px;
}

.node-children {
  /* Children container — no extra styles needed */
}
```

- [ ] **Step 2: Create `LeftPanel.tsx` and `LeftPanel.css`**

The left panel contains: trip header (title + dates), budget progress bar, and the node tree. It reads from `tripPlanAtom`.

Create `frontend/src/components/LeftPanel.tsx`:

```tsx
import { useAtomValue } from "jotai"
import { tripPlanAtom, calculateSpent } from "../atoms/tripPlan"
import { TripNodeItem } from "./TripNodeItem"
import "./LeftPanel.css"

interface LeftPanelProps {
  onNodeClick: (nodeId: string, label: string) => void
}

export function LeftPanel({ onNodeClick }: LeftPanelProps) {
  const tripPlan = useAtomValue(tripPlanAtom)
  const req = tripPlan.requirements
  const spent = calculateSpent(tripPlan.nodes)
  const budget = req?.budget ?? 0
  const remaining = req?.budgetRemaining ?? budget
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0

  return (
    <>
      {/* Header */}
      <div className="lp-header">
        <div className="lp-label">Trip Plan</div>
        {req ? (
          <>
            <div className="lp-title">{req.destination.split("—")[0]?.trim() ?? req.destination}</div>
            <div className="lp-subtitle">{req.when}</div>
          </>
        ) : (
          <div className="lp-title">No trip yet</div>
        )}
      </div>

      {/* Budget bar */}
      {req && (
        <div className="lp-budget">
          <div className="lp-budget-row">
            <span>Budget</span>
            <span className="lp-budget-amount">${budget.toLocaleString()} SGD</span>
          </div>
          <div className="lp-budget-track">
            <div className="lp-budget-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="lp-budget-row lp-budget-detail">
            <span>${spent.toLocaleString()} spent</span>
            <span className="lp-budget-remaining">${remaining.toLocaleString()} remaining</span>
          </div>
        </div>
      )}

      {/* Tree */}
      <div className="lp-tree">
        {tripPlan.nodes.map((node) => (
          <TripNodeItem
            key={node.id}
            node={node}
            depth={0}
            onNodeClick={onNodeClick}
          />
        ))}
      </div>
    </>
  )
}
```

Create `frontend/src/components/LeftPanel.css`:

```css
.lp-header {
  padding: 16px 18px;
  border-bottom: 1px solid var(--color-border);
}

.lp-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--color-text-muted);
  font-weight: 600;
}

.lp-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  margin-top: 4px;
}

.lp-subtitle {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

/* Budget section */
.lp-budget {
  padding: 12px 18px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-primary-bg);
}

.lp-budget-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.lp-budget-amount {
  font-weight: 700;
  color: var(--color-text);
}

.lp-budget-track {
  background: var(--color-border);
  height: 6px;
  border-radius: 3px;
  margin-top: 6px;
  overflow: hidden;
}

.lp-budget-fill {
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  height: 6px;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.lp-budget-detail {
  font-size: 10px;
  color: var(--color-text-muted);
  margin-top: 3px;
}

.lp-budget-remaining {
  color: var(--color-primary);
  font-weight: 600;
}

/* Tree container */
.lp-tree {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}
```

- [ ] **Step 3: Wire LeftPanel into App.tsx**

Replace `frontend/src/App.tsx`:

```tsx
import { useEffect } from "react"
import { useSetAtom } from "jotai"
import "./App.css"
import { Layout } from "./components/Layout"
import { LeftPanel } from "./components/LeftPanel"
import { tripPlanAtom } from "./atoms/tripPlan"
import { mockTripPlan } from "./lib/mock-data"

function App() {
  const setTripPlan = useSetAtom(tripPlanAtom)

  // Load mock data on mount
  useEffect(() => {
    setTripPlan(mockTripPlan)
  }, [setTripPlan])

  const handleNodeClick = (nodeId: string, label: string) => {
    console.log(`[NODE_CLICK:${nodeId}] ${label}`)
  }

  return (
    <Layout
      left={<LeftPanel onNodeClick={handleNodeClick} />}
      middle={<div style={{ padding: 28 }}>Chat Panel</div>}
      right={<div style={{ padding: 18 }}>Right Panel</div>}
    />
  )
}

export default App
```

- [ ] **Step 4: Verify left panel renders**

Run: `cd frontend && npm run dev`

Expected: Left panel shows "Trip Plan" header with "Australia", budget bar at ~37% filled (blue→purple gradient), and the full tree with Sydney nodes (flight decided with green check + $380, hotel decided + $740, Day 1 active with blue highlight, Days 2-3 pending gray). Melbourne and Return sections below with dividers. Clicking a node logs to console.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/LeftPanel.tsx frontend/src/components/LeftPanel.css frontend/src/components/TripNodeItem.tsx frontend/src/components/TripNodeItem.css frontend/src/App.tsx
git commit -m "feat: add left panel with trip tree, budget bar, and node states"
```

---

### Task 3: Chat Panel — Narrative View + Input Bar

**Files:**
- Create: `frontend/src/components/Chat.tsx`
- Create: `frontend/src/components/Chat.css`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Create `Chat.tsx` and `Chat.css`**

The middle panel shows assistant messages as flowing rich narrative (HTML content) and has a quick-action chip bar + input at the bottom. It reads from `chatMessagesAtom`.

Create `frontend/src/components/Chat.tsx`:

```tsx
import { useRef, useEffect, useState } from "react"
import { useAtomValue } from "jotai"
import { chatMessagesAtom } from "../atoms/chat"
import "./Chat.css"

interface ChatProps {
  onSendMessage: (text: string) => void
}

const quickActions = [
  { label: "Adjust itinerary", icon: "pencil" },
  { label: "Cheaper options", icon: "money" },
  { label: "More food spots", icon: "food" },
  { label: "Free activities", icon: "target" },
]

export function Chat({ onSendMessage }: ChatProps) {
  const messages = useAtomValue(chatMessagesAtom)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    onSendMessage(trimmed)
    setInput("")
  }

  return (
    <>
      {/* Scrollable content area */}
      <div className="chat-scroll" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">&#x2708;&#xFE0F;</div>
            <div className="chat-empty-title">Where to next?</div>
            <div className="chat-empty-text">Tell me your destination, dates, and budget to get started.</div>
          </div>
        ) : (
          messages
            .filter((m) => m.role === "assistant")
            .map((m) => (
              <div
                key={m.id}
                className="chat-narrative"
                dangerouslySetInnerHTML={{ __html: m.content }}
              />
            ))
        )}
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        <div className="chat-chips">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="chat-chip"
              onClick={() => onSendMessage(action.label)}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
        <form className="chat-input-bar" onSubmit={handleSubmit}>
          <input
            className="chat-input"
            placeholder="Ask anything about your trip..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="chat-send" type="submit" aria-label="Send">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </form>
      </div>
    </>
  )
}
```

Create `frontend/src/components/Chat.css`:

```css
/* Scrollable content */
.chat-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 28px 32px;
}

/* Empty state */
.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: var(--color-text-light);
}

.chat-empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.chat-empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.chat-empty-text {
  font-size: 13px;
  margin-top: 6px;
  line-height: 1.6;
}

/* Narrative blocks */
.chat-narrative {
  margin-bottom: 28px;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--color-border);
}

.chat-narrative:last-child {
  border-bottom: none;
}

.chat-narrative h2 {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 4px;
  line-height: 1.3;
}

.chat-narrative .chat-subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
  font-style: italic;
  margin-bottom: 24px;
}

.chat-narrative p {
  font-size: 15px;
  line-height: 2;
  color: #333;
  margin-bottom: 20px;
}

.chat-narrative strong {
  color: var(--color-text);
}

/* Community insight box */
.chat-narrative .chat-insight {
  background: var(--color-primary-bg);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
  margin-bottom: 24px;
  border-left: 3px solid var(--color-primary);
  font-size: 13px;
  line-height: 1.7;
  color: var(--color-text-secondary);
}

.chat-narrative .chat-insight-title {
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 6px;
}

/* Input area */
.chat-input-area {
  padding: 12px 24px 16px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
}

.chat-chips {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.chat-chip {
  font-family: inherit;
  font-size: 12px;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  background: var(--color-bg-input);
  font-weight: 500;
  border: none;
  transition: background 0.15s, color 0.15s;
}

.chat-chip:hover {
  background: var(--color-border);
  color: #333;
}

.chat-input-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-bg-input);
  border-radius: 14px;
  padding: 5px 5px 5px 18px;
}

.chat-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  padding: 8px 0;
  color: #333;
}

.chat-input::placeholder {
  color: var(--color-text-light);
}

.chat-send {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-lg);
  border: none;
  background: var(--color-text);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.15s;
}

.chat-send:hover {
  opacity: 0.8;
}
```

- [ ] **Step 2: Wire Chat into App.tsx**

Replace `frontend/src/App.tsx`:

```tsx
import { useEffect } from "react"
import { useSetAtom } from "jotai"
import "./App.css"
import { Layout } from "./components/Layout"
import { LeftPanel } from "./components/LeftPanel"
import { Chat } from "./components/Chat"
import { tripPlanAtom } from "./atoms/tripPlan"
import { chatMessagesAtom } from "./atoms/chat"
import { mockTripPlan, mockChatMessages } from "./lib/mock-data"

function App() {
  const setTripPlan = useSetAtom(tripPlanAtom)
  const setChatMessages = useSetAtom(chatMessagesAtom)

  useEffect(() => {
    setTripPlan(mockTripPlan)
    setChatMessages(mockChatMessages)
  }, [setTripPlan, setChatMessages])

  const handleNodeClick = (nodeId: string, label: string) => {
    console.log(`[NODE_CLICK:${nodeId}] ${label}`)
  }

  const handleSendMessage = (text: string) => {
    console.log(`[SEND] ${text}`)
  }

  return (
    <Layout
      left={<LeftPanel onNodeClick={handleNodeClick} />}
      middle={<Chat onSendMessage={handleSendMessage} />}
      right={<div style={{ padding: 18 }}>Right Panel</div>}
    />
  )
}

export default App
```

- [ ] **Step 3: Verify chat panel renders**

Run: `cd frontend && npm run dev`

Expected: Middle panel shows rich narrative with "Day 1 — Arrival & First Taste" heading, formatted paragraphs with bold venue names, a blue community insight box, and "Day 2 — Bondi & Eastern Beaches" section below. Bottom has quick action chips ("Adjust itinerary", "Cheaper options", etc.) and input bar with dark send button. Input bar is functional.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Chat.tsx frontend/src/components/Chat.css frontend/src/App.tsx
git commit -m "feat: add chat panel with rich narrative display and input bar"
```

---

### Task 4: Right Panel — Shell + Empty + Loading States

**Files:**
- Create: `frontend/src/components/RightPanel.tsx`
- Create: `frontend/src/components/RightPanel.css`
- Create: `frontend/src/components/AgentStatusRow.tsx`
- Create: `frontend/src/components/AgentStatusRow.css`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Create `AgentStatusRow.tsx` and `AgentStatusRow.css`**

Each row shows an agent's progress: spinning indicator when running, green check when done, red X when failed, gray dot when queued.

Create `frontend/src/components/AgentStatusRow.tsx`:

```tsx
import type { AgentStatus } from "../types"
import { getSourceIcon } from "../lib/source-icons"
import "./AgentStatusRow.css"

interface AgentStatusRowProps {
  agent: AgentStatus
}

export function AgentStatusRow({ agent }: AgentStatusRowProps) {
  return (
    <div className={`agent-row agent-row--${agent.status}`}>
      {agent.status === "running" && <div className="agent-spinner" />}
      {agent.status === "queued" && <div className="agent-queued-dot" />}
      {agent.status === "done" && <span className="agent-done">&#x2713;</span>}
      {agent.status === "failed" && <span className="agent-failed">&#x2717;</span>}

      <img
        className="agent-logo"
        src={getSourceIcon(agent.site)}
        alt={agent.name}
        width={20}
        height={20}
      />

      <div className="agent-info">
        <div className="agent-name">{agent.name}</div>
        <div className={`agent-message agent-message--${agent.status}`}>
          {agent.message}
          {agent.status === "done" && agent.resultCount != null && (
            <> &middot; {agent.resultCount} results</>
          )}
        </div>
      </div>
    </div>
  )
}
```

Create `frontend/src/components/AgentStatusRow.css`:

```css
.agent-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: var(--radius-lg);
  background: var(--color-primary-bg);
}

.agent-row--done {
  background: var(--color-success-bg);
  border: 1px solid var(--color-success-border);
}

.agent-row--failed {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.agent-row--queued {
  background: var(--color-bg-input);
}

.agent-spinner {
  width: 16px;
  height: 16px;
  border: 2.5px solid var(--color-primary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
}

.agent-queued-dot {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.agent-queued-dot::after {
  content: "";
  width: 8px;
  height: 8px;
  background: var(--color-text-light);
  border-radius: 50%;
}

.agent-done {
  font-size: 14px;
  color: var(--color-success);
  flex-shrink: 0;
  width: 16px;
  text-align: center;
}

.agent-failed {
  font-size: 14px;
  color: #ef4444;
  flex-shrink: 0;
  width: 16px;
  text-align: center;
}

.agent-logo {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}

.agent-info {
  min-width: 0;
}

.agent-name {
  font-weight: 600;
  color: var(--color-text);
  font-size: 13px;
}

.agent-message {
  font-size: 11px;
  margin-top: 1px;
  color: var(--color-primary);
}

.agent-message--done {
  color: var(--color-success);
}

.agent-message--failed {
  color: #ef4444;
}

.agent-message--queued {
  color: var(--color-text-muted);
}
```

- [ ] **Step 2: Create `RightPanel.tsx` and `RightPanel.css`**

The right panel reads `liveViewAtom` and routes to the correct view based on `phase`. This step implements the shell + empty + loading states. The result card views (flights, hotels, discovery, decided) will render placeholder text until Task 5 and Task 6.

Create `frontend/src/components/RightPanel.tsx`:

```tsx
import { useAtomValue } from "jotai"
import { liveViewAtom } from "../atoms/liveView"
import { AgentStatusRow } from "./AgentStatusRow"
import "./RightPanel.css"

interface RightPanelProps {
  onSelectFlight: (flightId: string) => void
  onSelectHotel: (hotelId: string) => void
  onSelectDiscovery: (discoveryId: string) => void
}

export function RightPanel({ onSelectFlight, onSelectHotel, onSelectDiscovery }: RightPanelProps) {
  const view = useAtomValue(liveViewAtom)

  return (
    <>
      {/* Header */}
      <div className="rp-header">
        <div className="rp-title">
          {view.phase === "flights" && <span>&#x2708;&#xFE0F; </span>}
          {view.phase === "hotels" && <span>&#x1F3E8; </span>}
          {view.phase === "discovery" && <span>&#x1F3AF; </span>}
          {view.phase === "decided" && <span>&#x2705; </span>}
          {view.phase === "loading" && <span>&#x1F50D; </span>}
          {view.title}
        </div>
        {view.subtitle && <div className="rp-subtitle">{view.subtitle}</div>}
      </div>

      {/* Body — phase router */}
      {view.phase === "empty" && (
        <div className="rp-empty">
          <div className="rp-empty-icon">&#x1F30F;</div>
          <div className="rp-empty-title">Select an item to explore</div>
          <div className="rp-empty-text">
            Click any item in your trip plan to see live prices, community recommendations, and options.
          </div>
        </div>
      )}

      {view.phase === "loading" && (
        <div className="rp-loading">
          <div className="rp-agent-list">
            {view.agents.map((agent) => (
              <AgentStatusRow key={agent.id} agent={agent} />
            ))}
          </div>
          <div className="rp-loading-footer">
            Scraping live prices from actual websites...<br />
            This takes 15–30 seconds per site.
          </div>
        </div>
      )}

      {view.phase === "flights" && (
        <div className="rp-cards">
          {view.flights.map((flight) => (
            <div key={flight.id} className="rp-placeholder-card" onClick={() => onSelectFlight(flight.id)}>
              {flight.airline} — ${flight.price}
            </div>
          ))}
        </div>
      )}

      {view.phase === "hotels" && (
        <div className="rp-cards">
          {view.hotels.map((hotel) => (
            <div key={hotel.id} className="rp-placeholder-card" onClick={() => onSelectHotel(hotel.id)}>
              {hotel.name} — ${hotel.pricePerNight}/night
            </div>
          ))}
        </div>
      )}

      {view.phase === "discovery" && (
        <div className="rp-cards">
          {view.discoveries.map((item) => (
            <div key={item.id} className="rp-placeholder-card" onClick={() => onSelectDiscovery(item.id)}>
              {item.place} — {Math.round(item.sentiment * 100)}%
            </div>
          ))}
        </div>
      )}

      {view.phase === "decided" && view.decidedItem && (
        <div className="rp-cards">
          <div className="rp-placeholder-card">
            Decided: {"airline" in view.decidedItem ? view.decidedItem.airline : "name" in view.decidedItem ? view.decidedItem.name : "place" in view.decidedItem ? view.decidedItem.place : "Unknown"}
          </div>
        </div>
      )}
    </>
  )
}
```

Create `frontend/src/components/RightPanel.css`:

```css
.rp-header {
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
}

.rp-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}

.rp-subtitle {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

/* Empty state */
.rp-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: var(--color-text-light);
}

.rp-empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.rp-empty-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.rp-empty-text {
  font-size: 12px;
  margin-top: 6px;
  line-height: 1.6;
}

/* Loading state */
.rp-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 18px;
}

.rp-agent-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rp-loading-footer {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 11px;
  margin-top: auto;
  padding: 12px;
  line-height: 1.6;
}

/* Cards container */
.rp-cards {
  flex: 1;
  overflow-y: auto;
  padding: 12px 18px;
}

/* Placeholder card — replaced in Tasks 5-6 */
.rp-placeholder-card {
  padding: 16px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-bottom: 10px;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.rp-placeholder-card:hover {
  border-color: var(--color-primary);
}
```

- [ ] **Step 3: Wire RightPanel into App.tsx with demo state switcher**

Replace `frontend/src/App.tsx`:

```tsx
import { useEffect, useState } from "react"
import { useSetAtom } from "jotai"
import "./App.css"
import { Layout } from "./components/Layout"
import { LeftPanel } from "./components/LeftPanel"
import { Chat } from "./components/Chat"
import { RightPanel } from "./components/RightPanel"
import { tripPlanAtom } from "./atoms/tripPlan"
import { chatMessagesAtom } from "./atoms/chat"
import { liveViewAtom } from "./atoms/liveView"
import type { ViewPhase } from "./types"
import {
  mockTripPlan,
  mockChatMessages,
  mockLiveViewEmpty,
  mockLiveViewLoading,
  mockLiveViewFlights,
  mockLiveViewHotels,
  mockLiveViewDiscovery,
  mockLiveViewDecided,
} from "./lib/mock-data"

const demoStates: { label: string; phase: ViewPhase }[] = [
  { label: "Empty", phase: "empty" },
  { label: "Loading", phase: "loading" },
  { label: "Flights", phase: "flights" },
  { label: "Hotels", phase: "hotels" },
  { label: "Discovery", phase: "discovery" },
  { label: "Decided", phase: "decided" },
]

const viewMap: Record<ViewPhase, typeof mockLiveViewEmpty> = {
  empty: mockLiveViewEmpty,
  loading: mockLiveViewLoading,
  flights: mockLiveViewFlights,
  hotels: mockLiveViewHotels,
  discovery: mockLiveViewDiscovery,
  decided: mockLiveViewDecided,
}

function App() {
  const setTripPlan = useSetAtom(tripPlanAtom)
  const setChatMessages = useSetAtom(chatMessagesAtom)
  const setLiveView = useSetAtom(liveViewAtom)
  const [activePhase, setActivePhase] = useState<ViewPhase>("discovery")

  useEffect(() => {
    setTripPlan(mockTripPlan)
    setChatMessages(mockChatMessages)
    setLiveView(viewMap[activePhase])
  }, [setTripPlan, setChatMessages, setLiveView, activePhase])

  const handleNodeClick = (nodeId: string, label: string) => {
    console.log(`[NODE_CLICK:${nodeId}] ${label}`)
  }

  const handleSendMessage = (text: string) => {
    console.log(`[SEND] ${text}`)
  }

  const handleSelectFlight = (id: string) => console.log(`[SELECT_FLIGHT] ${id}`)
  const handleSelectHotel = (id: string) => console.log(`[SELECT_HOTEL] ${id}`)
  const handleSelectDiscovery = (id: string) => console.log(`[SELECT_DISCOVERY] ${id}`)

  return (
    <>
      {/* Demo state switcher — remove when wiring to orchestrator */}
      <div style={{
        position: "fixed", top: 8, left: "50%", transform: "translateX(-50%)",
        zIndex: 100, display: "flex", gap: 4, background: "#1a1a2e", padding: "4px 8px",
        borderRadius: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
      }}>
        {demoStates.map((s) => (
          <button
            key={s.phase}
            onClick={() => setActivePhase(s.phase)}
            type="button"
            style={{
              padding: "4px 10px", border: "none", borderRadius: 6, cursor: "pointer",
              fontSize: 11, fontWeight: 600, fontFamily: "inherit",
              background: activePhase === s.phase ? "#4361ee" : "transparent",
              color: activePhase === s.phase ? "#fff" : "#888",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <Layout
        left={<LeftPanel onNodeClick={handleNodeClick} />}
        middle={<Chat onSendMessage={handleSendMessage} />}
        right={
          <RightPanel
            onSelectFlight={handleSelectFlight}
            onSelectHotel={handleSelectHotel}
            onSelectDiscovery={handleSelectDiscovery}
          />
        }
      />
    </>
  )
}

export default App
```

- [ ] **Step 4: Verify right panel states**

Run: `cd frontend && npm run dev`

Expected: A dark pill-shaped toolbar appears at top-center with 6 buttons (Empty, Loading, Flights, Hotels, Discovery, Decided). Clicking each switches the right panel:
- **Empty**: Globe icon + "Select an item to explore"
- **Loading**: 5 agent rows — Jetstar has green checkmark + "Found 2 flights", SIA/Scoot/AirAsia have spinning indicators, Qantas shows gray queued dot. Footer text at bottom.
- **Flights/Hotels/Discovery/Decided**: Placeholder cards with basic text (to be replaced in Tasks 5-6)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/RightPanel.tsx frontend/src/components/RightPanel.css frontend/src/components/AgentStatusRow.tsx frontend/src/components/AgentStatusRow.css frontend/src/App.tsx
git commit -m "feat: add right panel shell with empty and loading states"
```

---

### Task 5: Right Panel — Flight, Hotel, Discovery Cards

**Files:**
- Create: `frontend/src/components/FlightCard.tsx`
- Create: `frontend/src/components/FlightCard.css`
- Create: `frontend/src/components/HotelCard.tsx`
- Create: `frontend/src/components/HotelCard.css`
- Create: `frontend/src/components/DiscoveryCard.tsx`
- Create: `frontend/src/components/DiscoveryCard.css`
- Modify: `frontend/src/components/RightPanel.tsx`

- [ ] **Step 1: Create `FlightCard.tsx` and `FlightCard.css`**

Each flight card shows: airline logo, name, flight number, stops, price (large), time bar (departure → duration → arrival), and source attribution. Cards with a `badge` get a colored badge pill and highlighted border.

Create `frontend/src/components/FlightCard.tsx`:

```tsx
import type { FlightOption } from "../types"
import { getSourceIcon } from "../lib/source-icons"
import "./FlightCard.css"

interface FlightCardProps {
  flight: FlightOption
  onSelect: (id: string) => void
}

export function FlightCard({ flight, onSelect }: FlightCardProps) {
  const hasBadge = !!flight.badge

  return (
    <div
      className={`flight-card${hasBadge ? " flight-card--badge" : ""}`}
      onClick={() => onSelect(flight.id)}
    >
      {flight.badge && (
        <div className={`flight-badge flight-badge--${flight.badge}`}>
          {flight.badge === "best-value" ? "Best value" : flight.badge === "premium" ? "Premium" : flight.badge}
        </div>
      )}

      <div className="flight-top">
        <img
          className="flight-logo"
          src={getSourceIcon(flight.source)}
          alt={flight.airline}
          width={36}
          height={36}
        />
        <div className="flight-info">
          <div className="flight-airline">{flight.airline}</div>
          <div className="flight-meta">
            {flight.flightNumber} &middot; {flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""} (${flight.stopCity ?? ""})`}
          </div>
        </div>
        <div className="flight-price-block">
          <div className={`flight-price${hasBadge ? " flight-price--highlight" : ""}`}>
            ${flight.price}
          </div>
          <div className="flight-currency">{flight.currency}</div>
        </div>
      </div>

      <div className="flight-timeline">
        <span className="flight-time">{flight.departure}</span>
        <span className="flight-line">
          <span className="flight-duration">
            {flight.duration}{flight.stops === 0 ? " nonstop" : ` · ${flight.stops} stop`}
          </span>
        </span>
        <span className="flight-time">{flight.arrival}</span>
      </div>

      <div className="flight-source">
        Live price from {flight.source}
      </div>
    </div>
  )
}
```

Create `frontend/src/components/FlightCard.css`:

```css
.flight-card {
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  position: relative;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.flight-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(67, 97, 238, 0.1);
}

.flight-card--badge {
  border: 2px solid var(--color-primary);
  background: var(--color-primary-bg);
}

.flight-badge {
  position: absolute;
  top: -7px;
  right: 10px;
  color: #fff;
  font-size: 9px;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 600;
}

.flight-badge--best-value {
  background: var(--color-primary);
}

.flight-badge--premium {
  background: var(--color-text);
}

.flight-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.flight-logo {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
  object-fit: contain;
}

.flight-info {
  flex: 1;
  min-width: 0;
}

.flight-airline {
  font-weight: 700;
  font-size: 13px;
  color: var(--color-text);
}

.flight-meta {
  color: var(--color-text-muted);
  font-size: 11px;
  margin-top: 1px;
}

.flight-price-block {
  text-align: right;
  flex-shrink: 0;
}

.flight-price {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text);
}

.flight-price--highlight {
  color: var(--color-primary);
}

.flight-currency {
  font-size: 10px;
  color: var(--color-text-muted);
}

/* Timeline bar */
.flight-timeline {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border-light);
  font-size: 12px;
}

.flight-card--badge .flight-timeline {
  border-top-color: #e0e0ff;
}

.flight-time {
  font-weight: 600;
  color: var(--color-text);
}

.flight-line {
  flex: 1;
  height: 1px;
  background: #ddd;
  position: relative;
}

.flight-card--badge .flight-line {
  background: #c7d2fe;
}

.flight-duration {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  color: var(--color-text-muted);
  background: var(--color-bg);
  padding: 0 6px;
  white-space: nowrap;
}

.flight-card--badge .flight-duration {
  background: var(--color-primary-bg);
}

.flight-source {
  font-size: 10px;
  color: var(--color-text-muted);
  margin-top: 6px;
  text-align: right;
}

.flight-card--badge .flight-source {
  color: var(--color-primary);
}
```

- [ ] **Step 2: Create `HotelCard.tsx` and `HotelCard.css`**

Hotel cards show: optional hero image, hotel name, location, rating stars, per-night price (large), total price, and source. Cards with `badge: "recommended"` get highlighted border + badge pill.

Create `frontend/src/components/HotelCard.tsx`:

```tsx
import type { HotelOption } from "../types"
import { getSourceIcon } from "../lib/source-icons"
import "./HotelCard.css"

interface HotelCardProps {
  hotel: HotelOption
  onSelect: (id: string) => void
}

export function HotelCard({ hotel, onSelect }: HotelCardProps) {
  const hasBadge = !!hotel.badge

  return (
    <div
      className={`hotel-card${hasBadge ? " hotel-card--badge" : ""}`}
      onClick={() => onSelect(hotel.id)}
    >
      {hotel.badge && (
        <div className="hotel-badge">{hotel.badge === "recommended" ? "Recommended" : hotel.badge}</div>
      )}

      {hotel.imageUrl && (
        <img className="hotel-image" src={hotel.imageUrl} alt={hotel.name} />
      )}

      <div className="hotel-body">
        <div className="hotel-top">
          <div className="hotel-name">{hotel.name}</div>
          <div className="hotel-price">${hotel.pricePerNight}</div>
        </div>
        <div className="hotel-detail">
          <span className="hotel-rating">{hotel.rating} &#x2B50;</span>
          <span>&middot;</span>
          <span>{hotel.location}</span>
          <span>&middot;</span>
          <span>/night</span>
          <span>&middot;</span>
          <span>${hotel.totalPrice.toLocaleString()} total</span>
        </div>
        <div className="hotel-source">
          <img
            src={getSourceIcon(hotel.source)}
            alt={hotel.source}
            width={14}
            height={14}
            className="hotel-source-logo"
          />
          {hotel.source}
        </div>
      </div>
    </div>
  )
}
```

Create `frontend/src/components/HotelCard.css`:

```css
.hotel-card {
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  margin-bottom: 12px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  position: relative;
}

.hotel-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 12px rgba(67, 97, 238, 0.12);
}

.hotel-card--badge {
  border: 2px solid var(--color-primary);
}

.hotel-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--color-primary);
  color: #fff;
  font-size: 9px;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 600;
  z-index: 1;
}

.hotel-image {
  width: 100%;
  height: 90px;
  object-fit: cover;
  display: block;
}

.hotel-body {
  padding: 10px 12px;
}

.hotel-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hotel-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
}

.hotel-price {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-primary);
  flex-shrink: 0;
}

.hotel-detail {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
}

.hotel-rating {
  font-weight: 600;
}

.hotel-source {
  font-size: 10px;
  color: var(--color-text-muted);
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.hotel-source-logo {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}
```

- [ ] **Step 3: Create `DiscoveryCard.tsx` and `DiscoveryCard.css`**

Discovery cards show: optional hero image, place name, sentiment percentage badge (green if >= 80%, yellow otherwise), category + price + duration, community quotes with source-colored left borders, and tags. Quotes show original Chinese text for XHS sources.

Create `frontend/src/components/DiscoveryCard.tsx`:

```tsx
import type { DiscoveryItem, CommunityQuote } from "../types"
import { getSourceColor } from "../lib/source-icons"
import "./DiscoveryCard.css"

interface DiscoveryCardProps {
  item: DiscoveryItem
  onSelect: (id: string) => void
}

function QuoteRow({ quote }: { quote: CommunityQuote }) {
  const color = getSourceColor(quote.source)
  const sourceName = quote.source.toUpperCase() === "XHS" ? "XHS" :
    quote.source.charAt(0).toUpperCase() + quote.source.slice(1)

  return (
    <div className="disc-quote" style={{ borderLeftColor: color }}>
      <span className="disc-quote-source" style={{ color }}>{sourceName}</span>
      {" "}&ldquo;{quote.text}&rdquo;
      {quote.originalText && (
        <span className="disc-quote-original"> — translated</span>
      )}
      {quote.score != null && (
        <span className="disc-quote-score">
          {quote.source === "reddit" ? ` ↑ ${quote.score}` : ` ♡ ${quote.score}`}
        </span>
      )}
    </div>
  )
}

export function DiscoveryCard({ item, onSelect }: DiscoveryCardProps) {
  const sentimentPct = Math.round(item.sentiment * 100)
  const isHigh = sentimentPct >= 80

  return (
    <div className="disc-card" onClick={() => onSelect(item.id)}>
      {item.imageUrl && (
        <img className="disc-image" src={item.imageUrl} alt={item.place} />
      )}

      <div className="disc-body">
        <div className="disc-top">
          <div className="disc-name">{item.place}</div>
          <div className={`disc-sentiment${isHigh ? " disc-sentiment--high" : " disc-sentiment--mid"}`}>
            {sentimentPct}%
          </div>
        </div>

        <div className="disc-meta">
          {item.category && <span>{item.category}</span>}
          {item.priceLevel && <><span>&middot;</span><span>{item.priceLevel}</span></>}
          {item.duration && <><span>&middot;</span><span>{item.duration}</span></>}
        </div>

        {/* Community quotes */}
        {item.quotes.length > 0 && (
          <div className="disc-quotes">
            <div className="disc-quotes-title">What travelers say:</div>
            {item.quotes.map((q, i) => (
              <QuoteRow key={i} quote={q} />
            ))}
          </div>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="disc-tags">
            {item.tags.map((tag) => (
              <span key={tag} className="disc-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

Create `frontend/src/components/DiscoveryCard.css`:

```css
.disc-card {
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  margin-bottom: 14px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.disc-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 12px rgba(67, 97, 238, 0.15);
}

.disc-image {
  width: 100%;
  height: 110px;
  object-fit: cover;
  display: block;
}

.disc-body {
  padding: 12px 14px;
}

.disc-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.disc-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}

.disc-sentiment {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.disc-sentiment--high {
  background: var(--color-success-light);
  color: #16a34a;
}

.disc-sentiment--mid {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.disc-meta {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 4px;
  display: flex;
  gap: 4px;
}

/* Quotes section */
.disc-quotes {
  margin-top: 10px;
  border-top: 1px solid var(--color-border-light);
  padding-top: 10px;
}

.disc-quotes-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}

.disc-quote {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 6px;
  padding-left: 8px;
  border-left: 2px solid;
}

.disc-quote:last-child {
  margin-bottom: 0;
}

.disc-quote-source {
  font-size: 10px;
  font-weight: 600;
}

.disc-quote-original {
  color: var(--color-text-muted);
  font-size: 10px;
}

.disc-quote-score {
  color: var(--color-text-muted);
  font-size: 10px;
}

/* Tags */
.disc-tags {
  margin-top: 8px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.disc-tag {
  background: var(--color-bg-tag);
  border-radius: var(--radius-sm);
  padding: 2px 6px;
  font-size: 10px;
  color: #666;
}
```

- [ ] **Step 4: Wire cards into `RightPanel.tsx`**

Replace the placeholder card sections in `frontend/src/components/RightPanel.tsx`. Replace the entire file:

```tsx
import { useAtomValue } from "jotai"
import { liveViewAtom } from "../atoms/liveView"
import { AgentStatusRow } from "./AgentStatusRow"
import { FlightCard } from "./FlightCard"
import { HotelCard } from "./HotelCard"
import { DiscoveryCard } from "./DiscoveryCard"
import { getSourceIcon } from "../lib/source-icons"
import "./RightPanel.css"

interface RightPanelProps {
  onSelectFlight: (flightId: string) => void
  onSelectHotel: (hotelId: string) => void
  onSelectDiscovery: (discoveryId: string) => void
}

export function RightPanel({ onSelectFlight, onSelectHotel, onSelectDiscovery }: RightPanelProps) {
  const view = useAtomValue(liveViewAtom)

  return (
    <>
      {/* Header */}
      <div className="rp-header">
        <div className="rp-title">
          {view.phase === "flights" && <span>&#x2708;&#xFE0F; </span>}
          {view.phase === "hotels" && <span>&#x1F3E8; </span>}
          {view.phase === "discovery" && <span>&#x1F3AF; </span>}
          {view.phase === "decided" && <span>&#x2705; </span>}
          {view.phase === "loading" && <span>&#x1F50D; </span>}
          {view.title}
        </div>
        {view.subtitle && <div className="rp-subtitle">{view.subtitle}</div>}
      </div>

      {/* Source bar for flights/hotels */}
      {view.phase === "flights" && (
        <div className="rp-source-bar">
          {Array.from(new Set(view.flights.map((f) => f.source))).map((source) => (
            <span key={source} className="rp-source-item">
              <img src={getSourceIcon(source)} alt={source} width={14} height={14} className="rp-source-logo" />
              <span className="rp-source-check">&#x2713;</span>
            </span>
          ))}
          <span className="rp-source-count">{view.flights.length} flights found</span>
        </div>
      )}

      {view.phase === "hotels" && (
        <div className="rp-source-bar">
          {Array.from(new Set(view.hotels.map((h) => h.source))).map((source) => (
            <span key={source} className="rp-source-item">
              <img src={getSourceIcon(source)} alt={source} width={14} height={14} className="rp-source-logo" />
              <span className="rp-source-check">&#x2713;</span>
              <span className="rp-source-label">{view.hotels.filter((h) => h.source === source).length}</span>
            </span>
          ))}
          <span className="rp-source-count">{view.hotels.length} hotels</span>
        </div>
      )}

      {/* Discovery source pills */}
      {view.phase === "discovery" && (
        <div className="rp-source-bar">
          {(() => {
            const sources = new Map<string, number>()
            for (const item of view.discoveries) {
              for (const q of item.quotes) {
                sources.set(q.source, (sources.get(q.source) ?? 0) + (q.score ?? 1))
              }
            }
            return Array.from(sources.keys()).map((source) => {
              const count = view.discoveries.filter((d) => d.quotes.some((q) => q.source === source)).length
              return (
                <span key={source} className="rp-disc-pill" style={{ color: source === "xhs" ? "var(--color-xhs)" : source === "reddit" ? "var(--color-reddit)" : "var(--color-tripadvisor)" }}>
                  {source.toUpperCase() === "XHS" ? "XHS" : source.charAt(0).toUpperCase() + source.slice(1)} &middot; {count} items
                </span>
              )
            })
          })()}
        </div>
      )}

      {/* Body — phase router */}
      {view.phase === "empty" && (
        <div className="rp-empty">
          <div className="rp-empty-icon">&#x1F30F;</div>
          <div className="rp-empty-title">Select an item to explore</div>
          <div className="rp-empty-text">
            Click any item in your trip plan to see live prices, community recommendations, and options.
          </div>
        </div>
      )}

      {view.phase === "loading" && (
        <div className="rp-loading">
          <div className="rp-agent-list">
            {view.agents.map((agent) => (
              <AgentStatusRow key={agent.id} agent={agent} />
            ))}
          </div>
          <div className="rp-loading-footer">
            Scraping live prices from actual websites...<br />
            This takes 15–30 seconds per site.
          </div>
        </div>
      )}

      {view.phase === "flights" && (
        <div className="rp-cards">
          {view.flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} onSelect={onSelectFlight} />
          ))}
        </div>
      )}

      {view.phase === "hotels" && (
        <div className="rp-cards">
          {view.hotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} onSelect={onSelectHotel} />
          ))}
        </div>
      )}

      {view.phase === "discovery" && (
        <div className="rp-cards">
          {view.discoveries.map((item) => (
            <DiscoveryCard key={item.id} item={item} onSelect={onSelectDiscovery} />
          ))}
        </div>
      )}

      {view.phase === "decided" && view.decidedItem && (
        <div className="rp-cards">
          <div className="rp-decided-card">
            {"airline" in view.decidedItem && (
              <>
                <div className="rp-decided-top">
                  <div>
                    <div className="rp-decided-name">{view.decidedItem.airline}</div>
                    <div className="rp-decided-meta">{view.decidedItem.flightNumber} &middot; {view.decidedItem.stops === 0 ? "Direct" : `${view.decidedItem.stops} stop`} &middot; {view.decidedItem.date}</div>
                  </div>
                  <div className="rp-decided-price-block">
                    <div className="rp-decided-price">${view.decidedItem.price}</div>
                    <div className="rp-decided-currency">{view.decidedItem.currency}</div>
                  </div>
                </div>
                <div className="flight-timeline">
                  <span className="flight-time">{view.decidedItem.departure}</span>
                  <span className="flight-line">
                    <span className="flight-duration" style={{ background: "var(--color-success-bg)" }}>
                      {view.decidedItem.duration}
                    </span>
                  </span>
                  <span className="flight-time">{view.decidedItem.arrival}</span>
                </div>
              </>
            )}
            {"pricePerNight" in view.decidedItem && (
              <div className="rp-decided-top">
                <div>
                  <div className="rp-decided-name">{view.decidedItem.name}</div>
                  <div className="rp-decided-meta">{view.decidedItem.location} &middot; {view.decidedItem.nights} nights</div>
                </div>
                <div className="rp-decided-price-block">
                  <div className="rp-decided-price">${view.decidedItem.totalPrice}</div>
                  <div className="rp-decided-currency">{view.decidedItem.currency}</div>
                </div>
              </div>
            )}
            {"place" in view.decidedItem && (
              <div className="rp-decided-top">
                <div>
                  <div className="rp-decided-name">{view.decidedItem.place}</div>
                  <div className="rp-decided-meta">{view.decidedItem.category} &middot; {Math.round(view.decidedItem.sentiment * 100)}% sentiment</div>
                </div>
              </div>
            )}
          </div>
          <div className="rp-decided-action">&#x21BB; Change this decision</div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 5: Add source bar and decided card styles to `RightPanel.css`**

Append to the end of `frontend/src/components/RightPanel.css`:

```css
/* Source bar */
.rp-source-bar {
  padding: 8px 18px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-primary-bg);
  font-size: 11px;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.rp-source-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.rp-source-logo {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

.rp-source-check {
  color: var(--color-success);
  font-size: 11px;
}

.rp-source-label {
  color: var(--color-text-muted);
}

.rp-source-count {
  color: var(--color-text-muted);
  margin-left: auto;
}

.rp-disc-pill {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
}

/* Decided card */
.rp-decided-card {
  border: 2px solid var(--color-success);
  border-radius: var(--radius-lg);
  padding: 16px;
  background: var(--color-success-bg);
}

.rp-decided-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rp-decided-name {
  font-weight: 700;
  font-size: 15px;
  color: var(--color-text);
}

.rp-decided-meta {
  color: var(--color-text-muted);
  margin-top: 2px;
  font-size: 12px;
}

.rp-decided-price-block {
  text-align: right;
}

.rp-decided-price {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-success);
}

.rp-decided-currency {
  font-size: 10px;
  color: var(--color-text-muted);
}

.rp-decided-action {
  text-align: center;
  margin-top: 16px;
  font-size: 12px;
  color: var(--color-primary);
  cursor: pointer;
  font-weight: 500;
}

.rp-decided-action:hover {
  text-decoration: underline;
}
```

- [ ] **Step 6: Verify all right panel card views**

Run: `cd frontend && npm run dev`

Expected — use the demo switcher at top to cycle through all states:

- **Flights**: Source bar with airline logos + green checks. 4 flight cards — Scoot ($380) has blue "Best value" badge and highlighted border. SIA ($620) has dark "Premium" badge. Each card shows airline logo, flight number, time bar (departure → duration → arrival), and "Live price from..." attribution.
- **Hotels**: Source bar with booking.com + agoda logos. 3 hotel cards — Holiday Inn has blue "Recommended" badge + highlighted border. Each shows price large on right, rating + location + total price below.
- **Discovery**: Source pills (XHS red, Reddit orange). 4 cards — Royal Botanic Garden has hero image + 95% green sentiment badge. Each card has community quotes with colored left borders (red=XHS, orange=Reddit, green=TripAdvisor), and gray tags at bottom. Barangaroo (72%) has yellow badge and no image.
- **Decided**: Green-bordered card showing Scoot $380 with green price, timeline bar, and "Change this decision" link below.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/FlightCard.tsx frontend/src/components/FlightCard.css frontend/src/components/HotelCard.tsx frontend/src/components/HotelCard.css frontend/src/components/DiscoveryCard.tsx frontend/src/components/DiscoveryCard.css frontend/src/components/RightPanel.tsx frontend/src/components/RightPanel.css
git commit -m "feat: add flight, hotel, and discovery cards with source bars and decided view"
```

---

### Task 6: TypeScript Verification + Final Polish

**Files:**
- Possibly modify: any files with type errors

- [ ] **Step 1: Run TypeScript type check**

Run: `cd frontend && npx tsc --noEmit`

Expected: No errors. If there are errors, fix them — common issues:
- Unused imports (remove them)
- Missing properties on types (check `types/index.ts` for the exact shape)
- `dangerouslySetInnerHTML` type issues (should work with `{ __html: string }`)

- [ ] **Step 2: Run the dev build**

Run: `cd frontend && npm run build`

Expected: Build completes successfully with no errors. Check for any unused variable warnings in the output.

- [ ] **Step 3: Final visual verification**

Run: `cd frontend && npm run dev`

Check all 6 right panel states one more time. Verify:
1. Left panel tree nodes are clickable and show the 3 states correctly
2. Budget bar shows correct percentage
3. Chat panel narrative renders with proper formatting (headings, bold, insight boxes)
4. Chat input works (typing + enter submits, chips are clickable)
5. All 6 right panel states render correctly
6. Hover effects work on all cards (border color change + shadow)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: complete travel planner frontend with all panel components and mock data"
```

---

## Summary

| Task | Components | What it produces |
|------|-----------|-----------------|
| 1 | Layout, CSS tokens, mock data | 3-panel grid with design system + realistic sample data |
| 2 | LeftPanel, TripNodeItem | Trip tree with budget bar, 3 node states, click handling |
| 3 | Chat | Rich narrative display, quick action chips, input bar |
| 4 | RightPanel, AgentStatusRow | Phase router shell, empty state, loading with agent rows |
| 5 | FlightCard, HotelCard, DiscoveryCard | All data card views + source bars + decided view |
| 6 | — | TypeScript check, build verification, final polish |
