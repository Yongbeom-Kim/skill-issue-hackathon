// frontend/src/atoms/liveView.ts
import { atom } from "jotai"
import type { LiveView, AgentStatus } from "../types"

export const liveViewAtom = atom<LiveView>({
  topic: "",
  phase: "empty",
  agents: [],
  results: null,
})

// Helper: update a specific agent's status
export function updateAgentInList(
  agents: AgentStatus[],
  agentId: string,
  updates: Partial<AgentStatus>
): AgentStatus[] {
  return agents.map((a) => (a.id === agentId ? { ...a, ...updates } : a))
}
