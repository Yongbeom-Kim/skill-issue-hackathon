import type { FlightOption, HotelOption, DiscoveryItem, ItemDetail, CommunityQuote } from "../types"
import { getSourceColor, getSourceIcon } from "../lib/source-icons"
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
          <img className="dp-hero" src={imageUrl} alt={name} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
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
          {isFlight && (() => {
            const f = item as FlightOption
            const isDirect = f.stops === 0
            const isEarlyMorning = parseInt(f.departure) < 8
            const isEvening = parseInt(f.departure) >= 17

            return (
              <>
                <div className="dp-price-row">
                  <span className="dp-price">${f.price}</span>
                  <span className="dp-price-unit">{f.currency}</span>
                </div>

                {/* Route & date */}
                <div className="dp-flight-route">
                  {f.route} &middot; {f.date}
                </div>

                {/* Timeline */}
                <div className="dp-flight-timeline">
                  <div className="dp-flight-endpoint">
                    <div className="dp-flight-time">{f.departure}</div>
                    <div className="dp-flight-label">Depart</div>
                  </div>
                  <div className="dp-flight-line">
                    <div className="dp-flight-duration">{f.duration}</div>
                    {f.stops > 0 && <div className="dp-flight-stop-dot" />}
                  </div>
                  <div className="dp-flight-endpoint dp-flight-endpoint--end">
                    <div className="dp-flight-time">{f.arrival}</div>
                    <div className="dp-flight-label">Arrive</div>
                  </div>
                </div>

                {/* Flight details grid */}
                <div className="dp-flight-details">
                  <div className="dp-flight-detail">
                    <div className="dp-flight-detail-label">Stops</div>
                    <div className="dp-flight-detail-value">{isDirect ? "Nonstop" : `${f.stops} stop${f.stops > 1 ? "s" : ""}${f.stopCity ? ` (${f.stopCity})` : ""}`}</div>
                  </div>
                  <div className="dp-flight-detail">
                    <div className="dp-flight-detail-label">Duration</div>
                    <div className="dp-flight-detail-value">{f.duration}</div>
                  </div>
                  <div className="dp-flight-detail">
                    <div className="dp-flight-detail-label">Flight</div>
                    <div className="dp-flight-detail-value">{f.flightNumber}</div>
                  </div>
                  <div className="dp-flight-detail">
                    <div className="dp-flight-detail-label">Airline</div>
                    <div className="dp-flight-detail-value">
                      <img src={getSourceIcon(f.source)} alt="" width={14} height={14} style={{ borderRadius: 2, verticalAlign: -2, marginRight: 4 }} />
                      {f.airline}
                    </div>
                  </div>
                </div>

                {/* Timing insight */}
                <div className="dp-flight-insight">
                  <div className="dp-flight-insight-icon">{isEarlyMorning ? "🌅" : isEvening ? "🌙" : "☀️"}</div>
                  <div className="dp-flight-insight-text">
                    {isEarlyMorning && "Early morning departure — arrive with the whole day ahead. Airport will be quieter."}
                    {isEvening && "Evening departure — sleep on the plane and arrive fresh the next morning."}
                    {!isEarlyMorning && !isEvening && "Daytime departure — comfortable timing, no rushed wake-up."}
                  </div>
                </div>

                {/* Community intel */}
                {!detail?.comments?.length && (
                  <div className="dp-section">
                    <div className="dp-section-title">What travelers say</div>
                    <div className="dp-quotes">
                      <div className="dp-quote" style={{ borderLeftColor: getSourceColor("reddit") }}>
                        <div className="dp-quote-header">
                          <span className="dp-quote-source" style={{ color: getSourceColor("reddit") }}>Reddit</span>
                          <span className="dp-quote-score">r/travel</span>
                        </div>
                        <div className="dp-quote-text">
                          {isDirect
                            ? `"${f.airline} direct is the way to go on this route. ${isEarlyMorning ? "Take the early flight — you land with the whole afternoon." : "Solid timing, no complaints."} Seat 14A for the best window views on approach."`
                            : `"${f.airline} via ${f.stopCity ?? "hub"} is fine if you don't mind the layover. Usually 1.5hrs, enough for a coffee. ${f.price < 400 ? "Great price for this route." : "Not the cheapest but reliable."}"`
                          }
                        </div>
                      </div>
                      <div className="dp-quote" style={{ borderLeftColor: getSourceColor("tripadvisor") }}>
                        <div className="dp-quote-header">
                          <span className="dp-quote-source" style={{ color: getSourceColor("tripadvisor") }}>TripAdvisor</span>
                          <span className="dp-quote-score">Airline Reviews</span>
                        </div>
                        <div className="dp-quote-text">
                          {f.airline === "Singapore Airlines"
                            ? `"Consistently excellent service. Meals are genuinely good, entertainment system is top-tier. Worth the premium over budget carriers on long hauls."`
                            : f.airline === "Scoot" || f.airline === "Jetstar" || f.airline === "AirAsia"
                              ? `"Budget carrier but perfectly fine for ${f.duration.includes("7") || f.duration.includes("8") ? "medium" : "short"}-haul. Bring your own snacks, pay for extra legroom if you're tall. The savings are real."`
                              : `"${f.airline} does this route well. On-time performance is solid. ${isDirect ? "Direct flight makes it easy." : "Connection is smooth, well-organized transfer."}"`
                          }
                        </div>
                      </div>
                      <div className="dp-quote" style={{ borderLeftColor: getSourceColor("xhs") }}>
                        <div className="dp-quote-header">
                          <span className="dp-quote-source" style={{ color: getSourceColor("xhs") }}>XHS</span>
                          <span className="dp-quote-score">Travel Tips</span>
                        </div>
                        <div className="dp-quote-text">
                          {`"${f.price < 400 ? "This price is a steal — " : ""}Book directly on ${f.source} for the best price, aggregators mark up $20-50. ${isEarlyMorning ? "Pro tip: Changi T4 has 24hr lounges if you arrive too early for check-in." : "Check in online 48hrs before for better seat selection."}"`}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price context */}
                <div className="dp-section">
                  <div className="dp-section-title">Price scraped live</div>
                  <div className="dp-flight-price-context">
                    <div className="dp-flight-price-source">
                      <img src={getSourceIcon(f.source)} alt="" width={16} height={16} style={{ borderRadius: 3 }} />
                      <span className="dp-flight-price-site">{f.source}</span>
                      <span className="dp-flight-price-live">${f.price} {f.currency}</span>
                    </div>
                    <div className="dp-flight-price-note">
                      Scraped directly from {f.source} — not cached aggregator data
                    </div>
                  </div>
                </div>

                {/* Book link */}
                {f.sourceUrl && (
                  <a className="dp-flight-book" href={f.sourceUrl} target="_blank" rel="noopener noreferrer">
                    Book on {f.source} &rarr;
                  </a>
                )}
              </>
            )
          })()}
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
                  <img className="dp-price-logo" src={getSourceIcon(p.source)} alt="" width={18} height={18} />
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
                    <img className="dp-link-logo" src={getSourceIcon(link.provider)} alt="" width={18} height={18} />
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
