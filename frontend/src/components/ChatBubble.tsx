import type { ChatMessage } from "../types/chat";

export function ChatBubble({ message }: { message: ChatMessage }) {
  return (
    <div className={`bubble bubble--${message.role}`}>
      <p className="bubble__content">{message.content}</p>

      {message.sources && message.sources.length > 0 && (
        <div className="bubble__sources">
          <span className="bubble__sources-label">Sources</span>
          <ul>
            {message.sources.map((s, i) => (
              <li key={i}>
                {s.fileName} — chunk {s.chunkIndex}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
