import { useRef, useEffect, useState, useMemo } from "react"
import { useAtomValue } from "jotai"
import { marked } from "marked"
import { chatMessagesAtom } from "../atoms/chat"
import { agentActivityAtom } from "../atoms/agentActivity"
import "./Chat.css"

interface ChatProps {
  onSendMessage: (text: string) => void
  isRunning?: boolean
}

const SOURCE_LABELS: Record<string, string> = {
  orchestrator: "Planner",
  research: "Research",
  logistics: "Logistics",
  tool: "Tool",
}

const TYPE_ICONS: Record<string, string> = {
  thinking: "...",
  tool_call: "->",
  tool_result: "<-",
  agent_dispatch: ">>",
  error: "!!",
}

export function Chat({ onSendMessage, isRunning }: ChatProps) {
  const messages = useAtomValue(chatMessagesAtom)
  const activity = useAtomValue(agentActivityAtom)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")

  // Parse markdown to HTML for assistant messages
  const parsedMessages = useMemo(
    () =>
      messages.map((m) => ({
        ...m,
        html: m.role === "assistant" ? marked.parse(m.content, { async: false }) as string : m.content,
      })),
    [messages]
  )

  // Auto-scroll to bottom on new messages or activity
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, activity])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    onSendMessage(trimmed)
    setInput("")
  }

  return (
    <>
      {/* Scrollable content area */}
      <div className="chat-scroll" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">&#x2708;&#xFE0F;</div>
            <div className="chat-empty-title">Where to next?</div>
            <div className="chat-empty-text">Tell me your destination, dates, and budget to get started.</div>
          </div>
        ) : (
          parsedMessages.map((m) =>
            m.role === "assistant" ? (
              <div
                key={m.id}
                className="chat-narrative"
                dangerouslySetInnerHTML={{ __html: m.html }}
              />
            ) : (
              <div key={m.id} className="chat-user-bubble">
                {m.content}
              </div>
            )
          )
        )}
        {isRunning && (
          <div className="chat-activity-log">
            {activity.map((evt) => (
              <div key={evt.id} className={`chat-activity-row chat-activity-${evt.type}`}>
                <span className="chat-activity-icon">{TYPE_ICONS[evt.type] ?? "*"}</span>
                <span className="chat-activity-source">{SOURCE_LABELS[evt.source] ?? evt.source}</span>
                <span className="chat-activity-msg">{evt.message}</span>
              </div>
            ))}
            <div className="chat-thinking">
              <div className="chat-thinking-dot" />
              <div className="chat-thinking-dot" />
              <div className="chat-thinking-dot" />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        <form className="chat-input-bar" onSubmit={handleSubmit}>
          <input
            className="chat-input"
            placeholder={isRunning ? "Thinking..." : "Ask anything about your trip..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isRunning}
          />
          <button className="chat-send" type="submit" aria-label="Send" disabled={isRunning}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </form>
      </div>
    </>
  )
}
