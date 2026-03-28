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

      {/* Source bar for flights */}
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

      {/* Source bar for hotels */}
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
            const sources = new Set<string>()
            for (const item of view.discoveries) {
              for (const q of item.quotes) {
                sources.add(q.source)
              }
            }
            return Array.from(sources).map((source) => {
              const count = view.discoveries.filter((d) => d.quotes.some((q) => q.source === source)).length
              const color = source === "xhs" ? "var(--color-xhs)" : source === "reddit" ? "var(--color-reddit)" : "var(--color-tripadvisor)"
              return (
                <span key={source} className="rp-disc-pill" style={{ color }}>
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
                <div className="rp-decided-timeline">
                  <span className="rp-decided-time">{view.decidedItem.departure}</span>
                  <span className="rp-decided-line">
                    <span className="rp-decided-duration">{view.decidedItem.duration}</span>
                  </span>
                  <span className="rp-decided-time">{view.decidedItem.arrival}</span>
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
