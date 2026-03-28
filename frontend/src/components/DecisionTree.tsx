import {
  MapPin,
  Plane,
  Building2,
  Sparkles,
  ArrowLeftRight,
  Check,
  Loader2,
} from 'lucide-react'
import type { TripPlan, TripNode, FlightOption } from '../types'

interface DecisionTreeProps {
  plan: TripPlan
  activeNodeId: string
}

function getNodeIcon(type: string) {
  const size = 14
  const strokeWidth = 1.8
  switch (type) {
    case 'destination': return <MapPin size={size} strokeWidth={strokeWidth} />
    case 'flight': return <Plane size={size} strokeWidth={strokeWidth} />
    case 'hotel': return <Building2 size={size} strokeWidth={strokeWidth} />
    case 'activity': return <Sparkles size={size} strokeWidth={strokeWidth} />
    case 'transport': return <ArrowLeftRight size={size} strokeWidth={strokeWidth} />
    default: return <Sparkles size={size} strokeWidth={strokeWidth} />
  }
}

function getDecisionSummary(node: TripNode): string | null {
  if (!node.decision) return null
  if ('airline' in node.decision) {
    const f = node.decision as FlightOption
    return `${f.airline} ${f.flightNumber} · ${f.departure} · ${f.stops === 0 ? 'Direct' : `${f.stops} stop`}`
  }
  return null
}

export function DecisionTree({ plan, activeNodeId }: DecisionTreeProps) {
  const rootNode = plan.nodes[0]
  const childNodes = rootNode?.children ?? []

  return (
    <div className="tree">
      {/* Section label */}
      <div className="tree__section-label">Trip Plan</div>

      {/* Root destination */}
      {rootNode && (
        <div className={`tree__root tree__root--${rootNode.status}`}>
          <div className="tree__root-dot">
            {rootNode.status === 'decided' ? (
              <Check size={10} strokeWidth={3} />
            ) : (
              getNodeIcon(rootNode.type)
            )}
          </div>
          <div className="tree__root-body">
            <span className="tree__root-label">{rootNode.label}</span>
          </div>
        </div>
      )}

      {/* Child nodes */}
      <div className="tree__children">
        {childNodes.map((node, i) => {
          const isLast = i === childNodes.length - 1
          const isSelected = node.id === activeNodeId
          return (
            <div
              key={node.id}
              className={[
                'tree__node',
                `tree__node--${node.status}`,
                isSelected && 'tree__node--selected',
                isLast && 'tree__node--last',
              ].filter(Boolean).join(' ')}
            >
              {/* Vertical connector line */}
              <div className="tree__connector">
                <div className="tree__connector-vert" />
                <div className="tree__connector-horiz" />
              </div>

              {/* Status dot */}
              <div className="tree__dot">
                {node.status === 'decided' && <Check size={8} strokeWidth={3} />}
                {node.status === 'active' && <Loader2 size={8} strokeWidth={3} className="tree__dot-spin" />}
              </div>

              {/* Content */}
              <div className="tree__node-body">
                <div className="tree__node-header">
                  <span className="tree__node-icon">{getNodeIcon(node.type)}</span>
                  <span className="tree__node-label">{node.label}</span>
                  {node.status === 'decided' && node.cost != null && (
                    <span className="tree__node-cost">${node.cost}</span>
                  )}
                </div>
                {node.status === 'decided' && (
                  <div className="tree__node-detail">{getDecisionSummary(node)}</div>
                )}
                {node.status === 'active' && (
                  <div className="tree__node-detail tree__node-detail--active">Searching options...</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Budget summary */}
      {plan.requirements && (
        <div className="tree__budget">
          <div className="tree__section-label">Budget Breakdown</div>
          <div className="tree__budget-items">
            <div className="tree__budget-row">
              <span className="tree__budget-label">
                <Plane size={12} strokeWidth={1.5} />
                Flights
              </span>
              <span className="tree__budget-value tree__budget-value--set">$289</span>
            </div>
            <div className="tree__budget-row">
              <span className="tree__budget-label">
                <Building2 size={12} strokeWidth={1.5} />
                Hotels
              </span>
              <span className="tree__budget-value tree__budget-value--pending">pending</span>
            </div>
            <div className="tree__budget-row">
              <span className="tree__budget-label">
                <Sparkles size={12} strokeWidth={1.5} />
                Activities
              </span>
              <span className="tree__budget-value tree__budget-value--pending">pending</span>
            </div>
            <div className="tree__budget-row">
              <span className="tree__budget-label">
                <ArrowLeftRight size={12} strokeWidth={1.5} />
                Return flight
              </span>
              <span className="tree__budget-value tree__budget-value--pending">pending</span>
            </div>
          </div>
          <div className="tree__budget-divider" />
          <div className="tree__budget-row tree__budget-row--total">
            <span className="tree__budget-label">Remaining</span>
            <span className="tree__budget-value">${plan.requirements.budgetRemaining.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Preferences */}
      {plan.requirements && (
        <div className="tree__prefs">
          <div className="tree__pref-chip">{plan.requirements.preferences.hotelClass}</div>
          <div className="tree__pref-chip">{plan.requirements.preferences.travelStyle}</div>
          {!plan.requirements.preferences.canDrive && <div className="tree__pref-chip">no car</div>}
        </div>
      )}
    </div>
  )
}
