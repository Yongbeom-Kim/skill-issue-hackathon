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
