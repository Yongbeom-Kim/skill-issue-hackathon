import type { AgentStatus } from "../types"
import { getSourceIcon } from "../lib/source-icons"
import "./AgentStatusRow.css"

interface AgentStatusRowProps {
  agent: AgentStatus
}

export function AgentStatusRow({ agent }: AgentStatusRowProps) {
  return (
    <div className={`agent-row agent-row--${agent.status}`}>
      {agent.status === "running" && <div className="agent-spinner" />}
      {agent.status === "queued" && <div className="agent-queued-dot" />}
      {agent.status === "done" && <span className="agent-done">&#x2713;</span>}
      {agent.status === "failed" && <span className="agent-failed">&#x2717;</span>}

      <img
        className="agent-logo"
        src={getSourceIcon(agent.site)}
        alt={agent.name}
        width={20}
        height={20}
      />

      <div className="agent-info">
        <div className="agent-name">{agent.name}</div>
        <div className={`agent-message agent-message--${agent.status}`}>
          {agent.message}
          {agent.status === "done" && agent.resultCount != null && (
            <> &middot; {agent.resultCount} results</>
          )}
        </div>
      </div>
    </div>
  )
}
