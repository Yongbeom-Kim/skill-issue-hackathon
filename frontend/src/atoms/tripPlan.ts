// frontend/src/atoms/tripPlan.ts
import { atom } from "jotai"
import type { TripPlan, TripNode, NodeStatus } from "../types"

export const tripPlanAtom = atom<TripPlan>({
  id: crypto.randomUUID(),
  requirements: null,
  nodes: [],
})

// Helper: find a node by id (recursive)
export function findNode(nodes: TripNode[], id: string): TripNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

// Helper: update a node by id (returns new tree, immutable)
export function updateNodeInTree(
  nodes: TripNode[],
  id: string,
  updates: Partial<TripNode>
): TripNode[] {
  return nodes.map((node) => {
    if (node.id === id) return { ...node, ...updates }
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, id, updates) }
    }
    return node
  })
}

// Helper: add a child node under a parent
export function addChildNode(
  nodes: TripNode[],
  parentId: string,
  child: TripNode
): TripNode[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: [...(node.children ?? []), child] }
    }
    if (node.children) {
      return { ...node, children: addChildNode(node.children, parentId, child) }
    }
    return node
  })
}

// Helper: set all "active" nodes back to "pending", set one node to "active"
export function setActiveNode(nodes: TripNode[], activeId: string): TripNode[] {
  return nodes.map((node) => {
    const newStatus: NodeStatus =
      node.id === activeId ? "active" : node.status === "active" ? "pending" : node.status
    const newChildren = node.children
      ? setActiveNode(node.children, activeId)
      : node.children
    return { ...node, status: newStatus, children: newChildren }
  })
}

// Helper: calculate total spent from decided nodes
export function calculateSpent(nodes: TripNode[]): number {
  let total = 0
  for (const node of nodes) {
    if (node.status === "decided" && node.cost) total += node.cost
    if (node.children) total += calculateSpent(node.children)
  }
  return total
}
