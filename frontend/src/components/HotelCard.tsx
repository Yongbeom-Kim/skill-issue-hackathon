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
