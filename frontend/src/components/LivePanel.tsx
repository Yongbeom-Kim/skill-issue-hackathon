import {
  Plane,
  Star,
  ArrowUpRight,
  MessageCircle,
  TrendingUp,
  Clock,
  DollarSign,
} from 'lucide-react'
import type { FlightOption, HotelOption, DiscoveryItem, AgentStatus } from '../types'
import { getSourceIcon } from '../lib/source-icons'
import {
  mockFlights,
  mockHotels,
  mockDiscoveries,
  mockHotelAgents,
  mockLoadingAgents,
} from '../mock/data'

export type DemoView = 'loading' | 'flights' | 'hotels' | 'discovery'

interface LivePanelProps {
  view: DemoView
}

const panelConfig: Record<DemoView, { title: string; subtitle: string }> = {
  loading: {
    title: 'Searching Flights',
    subtitle: 'May 1, 2026 · SIN → SYD · Economy',
  },
  flights: {
    title: 'Flights to Sydney',
    subtitle: 'May 1, 2026 · 1 adult · Economy',
  },
  hotels: {
    title: 'Accommodation',
    subtitle: 'May 1–5 · 4 nights · Mid-range',
  },
  discovery: {
    title: 'Day 1 Activities',
    subtitle: 'Sydney · Arrival day · Near CBD',
  },
}

export function LivePanel({ view }: LivePanelProps) {
  const { title, subtitle } = panelConfig[view]

  return (
    <div className="live">
      <div className="live__header">
        <h2 className="live__title">{title}</h2>
        <p className="live__subtitle">{subtitle}</p>
      </div>

      {/* Agent status rows */}
      {(view === 'loading' || view === 'hotels') && (
        <AgentRows agents={view === 'loading' ? mockLoadingAgents : mockHotelAgents} />
      )}

      {/* Result cards */}
      {view === 'flights' && <FlightCards flights={mockFlights} />}
      {view === 'hotels' && <HotelCards hotels={mockHotels} />}
      {view === 'discovery' && <DiscoveryCards items={mockDiscoveries} />}
    </div>
  )
}

// ── Agent Status Rows ──────────────────────────────────

function AgentRows({ agents }: { agents: AgentStatus[] }) {
  return (
    <div className="agents">
      {agents.map((agent, i) => (
        <div
          key={agent.id}
          className={`agent agent--${agent.status}`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <img
            className="agent__favicon"
            src={getSourceIcon(agent.site, 20)}
            alt=""
            width={20}
            height={20}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="agent__info">
            <span className="agent__name">{agent.name}</span>
            <span className="agent__msg">{agent.message}</span>
          </div>
          <div className="agent__trail">
            {agent.status === 'done' && agent.resultCount != null && (
              <span className="agent__count">{agent.resultCount}</span>
            )}
            {agent.status === 'running' && <span className="agent__spinner" />}
            {agent.status === 'queued' && <span className="agent__dot-queued" />}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Flight Cards ───────────────────────────────────────

function FlightCards({ flights }: { flights: FlightOption[] }) {
  return (
    <div className="cards cards--flights">
      {flights.map((f, i) => (
        <div
          key={f.id}
          className="fcard"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {f.badge && (
            <span className={`fcard__badge fcard__badge--${f.badge}`}>
              {f.badge.replace('-', ' ')}
            </span>
          )}

          <div className="fcard__top">
            <div className="fcard__airline">
              <img
                src={getSourceIcon(f.source, 24)}
                alt=""
                width={24}
                height={24}
                className="fcard__airline-logo"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <div>
                <div className="fcard__airline-name">{f.airline}</div>
                <div className="fcard__flight-num">{f.flightNumber}</div>
              </div>
            </div>
          </div>

          <div className="fcard__route">
            <div className="fcard__endpoint">
              <span className="fcard__time">{f.departure}</span>
              <span className="fcard__code">{f.route.split(' → ')[0]}</span>
            </div>
            <div className="fcard__line">
              <div className="fcard__line-dash" />
              <Plane size={14} className="fcard__plane-icon" />
              <div className="fcard__line-dash" />
            </div>
            <div className="fcard__endpoint fcard__endpoint--end">
              <span className="fcard__time">{f.arrival}</span>
              <span className="fcard__code">{f.route.split(' → ')[1]}</span>
            </div>
          </div>

          <div className="fcard__meta">
            <span>{f.duration}</span>
            <span className="fcard__dot">·</span>
            <span>{f.stops === 0 ? 'Direct' : `${f.stops} stop${f.stops > 1 ? 's' : ''} via ${f.stopCity}`}</span>
          </div>

          <div className="fcard__divider" />

          <div className="fcard__bottom">
            <span className="fcard__price">${f.price}</span>
            <span className="fcard__source">
              via {f.source}
              <ArrowUpRight size={12} />
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Hotel Cards ────────────────────────────────────────

function HotelCards({ hotels }: { hotels: HotelOption[] }) {
  return (
    <div className="cards cards--hotels">
      {hotels.map((h, i) => (
        <div
          key={h.id}
          className="hcard"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {h.badge && (
            <span className="hcard__badge">{h.badge}</span>
          )}

          <div className="hcard__image-wrap">
            {h.imageUrl && (
              <img
                src={h.imageUrl}
                alt={h.name}
                className="hcard__image"
                loading="lazy"
              />
            )}
          </div>

          <div className="hcard__body">
            <h3 className="hcard__name">{h.name}</h3>
            <div className="hcard__location">{h.location}</div>
            <div className="hcard__rating">
              <Star size={12} fill="var(--gold)" stroke="var(--gold)" />
              <span>{h.rating.toFixed(1)}</span>
            </div>
            <div className="hcard__stay">
              <Clock size={11} strokeWidth={1.5} />
              {h.nights} nights · May 1–5
            </div>
          </div>

          <div className="hcard__divider" />

          <div className="hcard__bottom">
            <div className="hcard__pricing">
              <span className="hcard__per-night">${h.pricePerNight}<small>/night</small></span>
              <span className="hcard__total">${h.totalPrice} total</span>
            </div>
            <span className="hcard__source">
              via {h.source}
              <ArrowUpRight size={11} />
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Discovery Cards ────────────────────────────────────

function getSourceLabel(source: string): string {
  switch (source.toLowerCase()) {
    case 'reddit': return 'Reddit'
    case 'xhs': return '小红书'
    case 'xiaohongshu': return '小红书'
    case 'tripadvisor': return 'TripAdvisor'
    default: return source
  }
}

function getSourceBorderColor(source: string): string {
  switch (source.toLowerCase()) {
    case 'reddit': return 'var(--reddit)'
    case 'xhs': case 'xiaohongshu': return 'var(--xhs)'
    case 'tripadvisor': return 'var(--tripadvisor)'
    default: return 'var(--border-light)'
  }
}

function DiscoveryCards({ items }: { items: DiscoveryItem[] }) {
  return (
    <div className="cards cards--discovery">
      {items.map((d, i) => (
        <div
          key={d.id}
          className="dcard"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          {d.imageUrl && (
            <div className="dcard__image-wrap">
              <img
                src={d.imageUrl}
                alt={d.place}
                className="dcard__image"
                loading="lazy"
              />
            </div>
          )}

          <div className="dcard__body">
            <h3 className="dcard__name">{d.place}</h3>
            <p className="dcard__summary">{d.summary}</p>

            {/* Sentiment bar */}
            <div className="dcard__sentiment">
              <div className="dcard__sentiment-bar">
                <div
                  className="dcard__sentiment-fill"
                  style={{ width: `${d.sentiment * 100}%` }}
                />
              </div>
              <div className="dcard__sentiment-meta">
                <span className="dcard__sentiment-pct">
                  <TrendingUp size={12} />
                  {Math.round(d.sentiment * 100)}% positive
                </span>
                <span className="dcard__post-count">
                  <MessageCircle size={12} />
                  {d.postCount.toLocaleString()} mentions
                </span>
              </div>
            </div>

            {/* Price & duration */}
            <div className="dcard__info-row">
              {d.priceLevel && (
                <span className="dcard__info-chip">
                  <DollarSign size={11} />
                  {d.priceLevel}
                </span>
              )}
              {d.duration && (
                <span className="dcard__info-chip">
                  <Clock size={11} />
                  {d.duration}
                </span>
              )}
            </div>

            {/* Community quotes */}
            <div className="dcard__quotes">
              {d.quotes.map((q, qi) => (
                <div
                  key={qi}
                  className="dcard__quote"
                  style={{ borderLeftColor: getSourceBorderColor(q.source) }}
                >
                  <div className="dcard__quote-source">{getSourceLabel(q.source)}</div>
                  <p className="dcard__quote-text">"{q.text}"</p>
                  {q.score != null && (
                    <span className="dcard__quote-score">
                      {q.source === 'reddit' ? '▲' : '♥'} {q.score.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="dcard__tags">
              {d.tags.map((tag) => (
                <span key={tag} className="dcard__tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
