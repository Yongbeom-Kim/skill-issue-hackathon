import { useAtomValue } from "jotai"
import { tripPlanAtom, calculateSpent } from "../atoms/tripPlan"
import { TripNodeItem } from "./TripNodeItem"
import { Logo } from "./Logo"
import "./LeftPanel.css"

interface LeftPanelProps {
  onNodeClick: (nodeId: string, label: string) => void
}

export function LeftPanel({ onNodeClick }: LeftPanelProps) {
  const tripPlan = useAtomValue(tripPlanAtom)
  const req = tripPlan.requirements
  const spent = calculateSpent(tripPlan.nodes)
  const budget = req?.budget ?? 0
  const remaining = req?.budgetRemaining ?? budget
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0

  return (
    <>
      {/* Logo */}
      <div className="lp-logo">
        <Logo />
      </div>

      {req ? (
        <>
          {/* Header */}
          <div className="lp-header">
            <div className="lp-title">{req.destination.split("—")[0]?.trim() ?? req.destination}</div>
            <div className="lp-subtitle">{req.when}</div>
          </div>

          {/* Budget bar */}
          <div className="lp-budget">
            <div className="lp-budget-row">
              <span>Budget</span>
              <span className="lp-budget-amount">${budget.toLocaleString()} SGD</span>
            </div>
            <div className="lp-budget-track">
              <div className="lp-budget-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="lp-budget-row lp-budget-detail">
              <span>${spent.toLocaleString()} spent</span>
              <span className="lp-budget-remaining">${remaining.toLocaleString()} remaining</span>
            </div>
          </div>

          {/* Tree */}
          <div className="lp-tree">
            {tripPlan.nodes.map((node) => (
              <TripNodeItem
                key={node.id}
                node={node}
                depth={0}
                onNodeClick={onNodeClick}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="lp-empty">
          <div className="lp-empty-icon">&#x1F5FA;&#xFE0F;</div>
          <div className="lp-empty-title">No trip planned</div>
          <div className="lp-empty-text">Start a conversation to build your itinerary. Your destinations, flights, hotels, and activities will appear here.</div>
          <div className="lp-empty-steps">
            <div className="lp-empty-step">
              <span className="lp-empty-step-num">1</span>
              <span>Tell us where &amp; when</span>
            </div>
            <div className="lp-empty-step">
              <span className="lp-empty-step-num">2</span>
              <span>We search real prices</span>
            </div>
            <div className="lp-empty-step">
              <span className="lp-empty-step-num">3</span>
              <span>Pick &amp; lock in choices</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
