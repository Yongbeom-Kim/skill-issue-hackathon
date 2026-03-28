import type { FlightOption, HotelOption, DiscoveryItem, ItemDetail, CommunityQuote } from "../types"
import { getSourceColor } from "../lib/source-icons"
import "./DetailPanel.css"

type AnyItem = FlightOption | HotelOption | DiscoveryItem

interface DetailPanelProps {
  item: AnyItem
  detail: ItemDetail | null
  onSelect: () => void
  onBack: () => void
}

function QuoteRow({ quote }: { quote: CommunityQuote }) {
  const color = getSourceColor(quote.source)
  const sourceName = quote.source.toUpperCase() === "XHS" ? "XHS" :
    quote.source.charAt(0).toUpperCase() + quote.source.slice(1)

  return (
    <div className="dp-quote" style={{ borderLeftColor: color }}>
      <div className="dp-quote-header">
        <span className="dp-quote-source" style={{ color }}>{sourceName}</span>
        {quote.score != null && (
          <span className="dp-quote-score">
            {quote.source === "reddit" ? `+${quote.score}` : `${quote.score}`}
          </span>
        )}
      </div>
      <div className="dp-quote-text">
        &ldquo;{quote.text}&rdquo;
      </div>
      {quote.originalText && quote.originalText !== quote.text && (
        <div className="dp-quote-original">{quote.originalText}</div>
      )}
    </div>
  )
}

export function DetailPanel({ item, detail, onSelect, onBack }: DetailPanelProps) {
  const isHotel = "pricePerNight" in item
  const isDiscovery = "place" in item && "sentiment" in item
  const isFlight = "airline" in item

  const name = isFlight
    ? `${(item as FlightOption).airline} ${(item as FlightOption).flightNumber}`
    : isHotel
      ? (item as HotelOption).name
      : (item as DiscoveryItem).place

  const imageUrl = isHotel
    ? (item as HotelOption).imageUrl
    : isDiscovery
      ? (item as DiscoveryItem).imageUrl
      : undefined

  return (
    <div className="dp">
      {/* Back button */}
      <button className="dp-back" onClick={onBack} type="button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to list
      </button>

      {/* Scrollable content */}
      <div className="dp-scroll">
        {/* Hero image */}
        {imageUrl && (
          <img className="dp-hero" src={imageUrl} alt={name} />
        )}

        {/* Title + price */}
        <div className="dp-header">
          <div className="dp-name">{name}</div>
          {isHotel && (
            <div className="dp-price-row">
              <span className="dp-price">${(item as HotelOption).pricePerNight}</span>
              <span className="dp-price-unit">/night</span>
              <span className="dp-price-total">${(item as HotelOption).totalPrice} total</span>
            </div>
          )}
          {isFlight && (
            <div className="dp-price-row">
              <span className="dp-price">${(item as FlightOption).price}</span>
              <span className="dp-price-unit">{(item as FlightOption).currency}</span>
            </div>
          )}
          {isDiscovery && (
            <div className="dp-meta-row">
              {(item as DiscoveryItem).category && <span className="dp-meta-chip">{(item as DiscoveryItem).category}</span>}
              {(item as DiscoveryItem).priceLevel && <span className="dp-meta-chip">{(item as DiscoveryItem).priceLevel}</span>}
              {(item as DiscoveryItem).duration && <span className="dp-meta-chip">{(item as DiscoveryItem).duration}</span>}
              <span className="dp-sentiment">{Math.round((item as DiscoveryItem).sentiment * 100)}% positive</span>
            </div>
          )}
        </div>

        {/* Description */}
        {detail?.description && (
          <div className="dp-section">
            <p className="dp-description">{detail.description}</p>
          </div>
        )}

        {/* Highlights */}
        {detail?.highlights && detail.highlights.length > 0 && (
          <div className="dp-section">
            <div className="dp-section-title">Highlights</div>
            <div className="dp-highlights">
              {detail.highlights.map((h) => (
                <span key={h} className="dp-highlight-chip">{h}</span>
              ))}
            </div>
          </div>
        )}

        {/* Price comparisons */}
        {detail?.priceComparisons && detail.priceComparisons.length > 0 && (
          <div className="dp-section">
            <div className="dp-section-title">Price Comparison</div>
            <div className="dp-prices">
              {detail.priceComparisons.map((p) => (
                <a key={p.source} href={p.url} target="_blank" rel="noopener noreferrer" className="dp-price-card">
                  <span className="dp-price-source">{p.source}</span>
                  <span className="dp-price-amount">${p.price} {p.currency}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Booking links */}
        {detail?.bookingLinks && detail.bookingLinks.length > 0 && (
          <div className="dp-section">
            <div className="dp-section-title">Book / Visit</div>
            <div className="dp-links">
              {detail.bookingLinks.map((link) => (
                <a key={link.provider} href={link.url} target="_blank" rel="noopener noreferrer" className="dp-link-card">
                  <div className="dp-link-top">
                    <span className="dp-link-provider">{link.provider}</span>
                    {link.price && <span className="dp-link-price">${link.price} {link.currency}</span>}
                  </div>
                  {link.note && <div className="dp-link-note">{link.note}</div>}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Community comments */}
        {detail?.comments && detail.comments.length > 0 && (
          <div className="dp-section">
            <div className="dp-section-title">What people say ({detail.comments.length})</div>
            <div className="dp-quotes">
              {detail.comments.map((q, i) => (
                <QuoteRow key={i} quote={q} />
              ))}
            </div>
          </div>
        )}

        {/* Fallback: show item's own quotes if no detail */}
        {!detail && isDiscovery && (item as DiscoveryItem).quotes.length > 0 && (
          <div className="dp-section">
            <div className="dp-section-title">What travelers say</div>
            <div className="dp-quotes">
              {(item as DiscoveryItem).quotes.map((q, i) => (
                <QuoteRow key={i} quote={q} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="dp-actions">
        <button className="dp-btn-select" onClick={onSelect} type="button">
          Select this
        </button>
      </div>
    </div>
  )
}
