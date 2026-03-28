import type { TripNode } from "../types"
import "./TripNodeItem.css"

interface TripNodeItemProps {
  node: TripNode
  depth: number
  onNodeClick: (nodeId: string, label: string) => void
}

export function TripNodeItem({ node, depth, onNodeClick }: TripNodeItemProps) {
  const isDestination = node.type === "destination"
  const isLeaf = !node.children || node.children.length === 0

  return (
    <>
      {isDestination && depth > 0 && <div className="node-divider" />}

      <button
        className={`trip-node trip-node--${node.status}${isDestination ? " trip-node--destination" : ""}`}
        style={{ paddingLeft: isDestination ? 18 : 18 + depth * 18 }}
        onClick={() => onNodeClick(node.id, node.label)}
        type="button"
      >
        {isDestination ? (
          <>
            <span className="node-caret">&#x25BC;</span>
            <span className="node-label">{node.label}</span>
          </>
        ) : (
          <>
            <span className="node-icon">
              {node.status === "decided" && <span className="node-check">&#x2713;</span>}
              {node.status === "active" && <span className="node-active-dot">&#x25B6;</span>}
              {node.status === "pending" && <span className="node-pending-dot">&#x25CB;</span>}
            </span>
            <span className="node-label">{node.label}</span>
            {node.status === "decided" && node.cost != null && (
              <span className="node-cost">${node.cost}</span>
            )}
          </>
        )}
      </button>

      {isDestination && node.children && !isLeaf && (
        <div className="node-children">
          {node.children.map((child) => (
            <TripNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </>
  )
}
