import { useAtomValue } from "jotai"
import { tripPlanAtom, calculateSpent } from "../atoms/tripPlan"
import { TripNodeItem } from "./TripNodeItem"
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
      {/* Header */}
      <div className="lp-header">
        <div className="lp-label">Trip Plan</div>
        {req ? (
          <>
            <div className="lp-title">{req.destination.split("—")[0]?.trim() ?? req.destination}</div>
            <div className="lp-subtitle">{req.when}</div>
          </>
        ) : (
          <div className="lp-title">No trip yet</div>
        )}
      </div>

      {/* Budget bar */}
      {req && (
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
      )}

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
  )
}
