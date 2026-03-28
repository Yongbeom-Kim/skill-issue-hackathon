// frontend/src/atoms/agentActivity.ts
import { atom } from "jotai"

export interface AgentActivityEvent {
  id: string
  timestamp: number
  /** Which agent or tool produced this */
  source: "orchestrator" | "research" | "logistics" | "tool"
  /** What happened */
  type: "thinking" | "tool_call" | "tool_result" | "agent_dispatch" | "error"
  /** Short human-readable message */
  message: string
}

export const agentActivityAtom = atom<AgentActivityEvent[]>([])
