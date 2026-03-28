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
