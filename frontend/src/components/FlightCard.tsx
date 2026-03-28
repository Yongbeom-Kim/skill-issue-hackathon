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

      {/* Route & date */}
      <div className="flight-route">
        <span>{flight.route}</span>
        <span>&middot;</span>
        <span>{flight.date}</span>
      </div>

      <div className="flight-timeline">
        <div className="flight-time-block">
          <span className="flight-time">{flight.departure}</span>
          <span className="flight-time-label">Depart</span>
        </div>
        <span className="flight-line">
          <span className="flight-duration">
            {flight.duration}
          </span>
          {flight.stops > 0 && (
            <span className="flight-stop-dot" />
          )}
        </span>
        <div className="flight-time-block flight-time-block--end">
          <span className="flight-time">{flight.arrival}</span>
          <span className="flight-time-label">Arrive</span>
        </div>
      </div>

      {/* Stops detail */}
      {flight.stops > 0 && flight.stopCity && (
        <div className="flight-stops-detail">
          {flight.stops} stop in {flight.stopCity}
        </div>
      )}

      <div className="flight-footer">
        <div className="flight-source">
          Live price from {flight.source}
        </div>
        {flight.sourceUrl && (
          <a
            className="flight-book"
            href={flight.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Book &rarr;
          </a>
        )}
      </div>
    </div>
  )
}
