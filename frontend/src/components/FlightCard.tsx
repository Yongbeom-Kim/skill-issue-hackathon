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
