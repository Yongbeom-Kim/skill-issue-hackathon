import { useEffect, useState, useCallback } from "react"
import { useSetAtom, useAtomValue } from "jotai"
import "./App.css"
import { Layout } from "./components/Layout"
import { LeftPanel } from "./components/LeftPanel"
import { Chat } from "./components/Chat"
import { RightPanel } from "./components/RightPanel"
import { useOrchestrator } from "./hooks/useOrchestrator"
import { useCachedOrchestrator } from "./hooks/useCachedOrchestrator"

const USE_CACHE = import.meta.env.VITE_USE_CACHE === "true"
import { tripPlanAtom } from "./atoms/tripPlan"
import { chatMessagesAtom } from "./atoms/chat"
import { liveViewAtom, nodeResultCacheAtom } from "./atoms/liveView"
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

// Demo state config
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
  const [demoMode, setDemoMode] = useState(false)
  const [activePhase, setActivePhase] = useState<ViewPhase>("discovery")

  const setTripPlan = useSetAtom(tripPlanAtom)
  const setChatMessages = useSetAtom(chatMessagesAtom)
  const setLiveView = useSetAtom(liveViewAtom)
  const setNodeCache = useSetAtom(nodeResultCacheAtom)
  const liveView = useAtomValue(liveViewAtom)

  const liveOrchestrator = useOrchestrator()
  const cachedOrchestrator = useCachedOrchestrator()
  const { run, isRunning } = USE_CACHE ? cachedOrchestrator : liveOrchestrator

  // Load mock data in demo mode
  useEffect(() => {
    if (demoMode) {
      setTripPlan(mockTripPlan)
      setChatMessages(mockChatMessages)
      setLiveView(viewMap[activePhase])
    }
  }, [demoMode, activePhase, setTripPlan, setChatMessages, setLiveView])

  const clearState = useCallback(() => {
    setTripPlan({ id: crypto.randomUUID(), requirements: null, nodes: [] })
    setChatMessages([])
    setLiveView({ nodeId: "", phase: "empty", agents: [], flights: [], hotels: [], discoveries: [], decidedItem: null, title: "Explore", subtitle: "" })
    setNodeCache({})
  }, [setTripPlan, setChatMessages, setLiveView, setNodeCache])

  // ── Event handlers ──────────────────────────────────────

  const handleNodeClick = useCallback(
    (nodeId: string, _label: string) => {
      if (demoMode) return
      run({ type: "select_node", nodeId })
    },
    [demoMode, run]
  )

  const handleSendMessage = useCallback(
    (text: string) => {
      if (demoMode) return
      run({ type: "chat", message: text })
    },
    [demoMode, run]
  )

  const handleSelectFlight = useCallback(
    (flightId: string) => {
      if (demoMode) return
      run({ type: "decide", nodeId: liveView.nodeId, optionId: flightId })
    },
    [demoMode, run, liveView.nodeId]
  )

  const handleSelectHotel = useCallback(
    (hotelId: string) => {
      if (demoMode) return
      run({ type: "decide", nodeId: liveView.nodeId, optionId: hotelId })
    },
    [demoMode, run, liveView.nodeId]
  )

  const handleSelectDiscovery = useCallback(
    (discoveryId: string) => {
      if (demoMode) return
      run({ type: "decide", nodeId: liveView.nodeId, optionId: discoveryId })
    },
    [demoMode, run, liveView.nodeId]
  )

  return (
    <>
      {/* Mode switcher toolbar */}
      <div style={{
        position: "fixed", top: 8, left: "50%", transform: "translateX(-50%)",
        zIndex: 100, display: "flex", gap: 4, background: "#1a1a2e", padding: "4px 8px",
        borderRadius: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.2)", alignItems: "center",
      }}>
        <button
          onClick={() => setDemoMode(!demoMode)}
          type="button"
          style={{
            padding: "4px 10px", border: "none", borderRadius: 6, cursor: "pointer",
            fontSize: 11, fontWeight: 600, fontFamily: "inherit",
            background: demoMode ? "#d97706" : "#22c55e",
            color: "#fff", marginRight: 4,
          }}
        >
          {demoMode ? "Demo" : "Live"}
        </button>

        {demoMode && demoStates.map((s) => (
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

        <button
          onClick={() => { clearState(); setDemoMode(false) }}
          type="button"
          style={{
            padding: "4px 10px", border: "none", borderRadius: 6, cursor: "pointer",
            fontSize: 11, fontWeight: 600, fontFamily: "inherit",
            background: "#444", color: "#ccc",
          }}
        >
          Clear
        </button>

        {!demoMode && isRunning && (
          <span style={{ fontSize: 11, color: "#10a37f", fontWeight: 600, marginLeft: 4 }}>
            Thinking...
          </span>
        )}
      </div>

      <Layout
        left={<LeftPanel onNodeClick={handleNodeClick} />}
        middle={<Chat onSendMessage={handleSendMessage} isRunning={isRunning} />}
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
