import { Send } from 'lucide-react'
import { mockChat } from '../mock/data'

export function ChatBar() {
  const lastMsg = mockChat[mockChat.length - 1]

  return (
    <div className="chat">
      {lastMsg && (
        <div className="chat__last">
          <span className="chat__last-role">
            {lastMsg.role === 'assistant' ? 'TIP' : 'You'}
          </span>
          <span className="chat__last-text">{lastMsg.content}</span>
        </div>
      )}
      <div className="chat__input-wrap">
        <input
          className="chat__input"
          type="text"
          placeholder="Ask about your trip..."
          readOnly
        />
        <button className="chat__send" aria-label="Send">
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
