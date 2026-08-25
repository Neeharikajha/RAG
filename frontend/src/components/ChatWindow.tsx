import { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { ChatBubble } from "./ChatBubble";

export function ChatWindow() {
  const { messages, isSending, error, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 min-h-[300px] max-h-[540px] overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-slate-600 italic text-sm py-8 text-center bg-white/40 border border-white/70 rounded-2xl backdrop-blur-md font-medium">
            Ask a question about your uploaded documents.
          </p>
        )}
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}
        {isSending && <p className="text-blue-600 font-semibold text-sm animate-pulse">Thinking…</p>}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <p className="p-3.5 rounded-xl bg-red-500/15 border border-red-200 text-red-700 text-sm font-medium backdrop-blur-md">
          {error}
        </p>
      )}

      <form className="flex gap-3 mt-2" onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          disabled={isSending}
          className="flex-1 bg-white/60 backdrop-blur-md border border-white/80 focus:border-blue-500 focus:bg-white/80 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 text-sm outline-none transition-all shadow-xs"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Send
        </button>
      </form>
    </div>
  );
}
