import { useState } from "react";
import { useChat } from "../hooks/useChat";
import { ChatBubble } from "./ChatBubble";

export function ChatWindow() {
  const { messages, isSending, error, sendMessage } = useChat();
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="chat">
      <div className="chat__messages">
        {messages.length === 0 && (
          <p className="empty-state">
            Ask a question about your uploaded documents.
          </p>
        )}
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}
        {isSending && <p className="chat__typing">Thinking…</p>}
      </div>

      {error && <p className="error-banner">{error}</p>}

      <form className="chat__input-row" onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          disabled={isSending}
        />
        <button type="submit" disabled={isSending || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
