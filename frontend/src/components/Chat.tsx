import { useRef, useEffect, useState } from "react"
import { useAtomValue } from "jotai"
import { chatMessagesAtom } from "../atoms/chat"
import "./Chat.css"

interface ChatProps {
  onSendMessage: (text: string) => void
}

const quickActions = [
  { label: "Adjust itinerary", icon: "pencil" },
  { label: "Cheaper options", icon: "money" },
  { label: "More food spots", icon: "food" },
  { label: "Free activities", icon: "target" },
]

export function Chat({ onSendMessage }: ChatProps) {
  const messages = useAtomValue(chatMessagesAtom)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

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
          messages
            .filter((m) => m.role === "assistant")
            .map((m) => (
              <div
                key={m.id}
                className="chat-narrative"
                dangerouslySetInnerHTML={{ __html: m.content }}
              />
            ))
        )}
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        <div className="chat-chips">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="chat-chip"
              onClick={() => onSendMessage(action.label)}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
        <form className="chat-input-bar" onSubmit={handleSubmit}>
          <input
            className="chat-input"
            placeholder="Ask anything about your trip..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="chat-send" type="submit" aria-label="Send">
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
