import { useState, useCallback } from "react";
import type { ChatMessage } from "../types/chat";
import { sendChatMessageStream } from "../lib/api";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (query: string) => {
      const userMessage: ChatMessage = { role: "user", content: query };

      setMessages((prev) => [
        ...prev,
        userMessage,
        { role: "assistant", content: "", sources: [] },
      ]);
      setIsSending(true);
      setError(null);

      try {
        await sendChatMessageStream(query, messages, (chunk) => {
          setMessages((prev) => {
            const next = [...prev];
            const lastIndex = next.length - 1;
            if (lastIndex >= 0 && next[lastIndex].role === "assistant") {
              const last = { ...next[lastIndex] };
              if (chunk.sources) last.sources = chunk.sources;
              if (chunk.delta) last.content = (last.content || "") + chunk.delta;
              if (chunk.answer) last.content = chunk.answer;
              next[lastIndex] = last;
            }
            return next;
          });
        });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsSending(false);
        // Ensure no empty assistant bubble remains
        setMessages((prev) => {
          const next = [...prev];
          const lastIndex = next.length - 1;
          if (
            lastIndex >= 0 &&
            next[lastIndex].role === "assistant" &&
            !next[lastIndex].content.trim()
          ) {
            next[lastIndex] = {
              ...next[lastIndex],
              content: "I couldn't find any relevant information in the uploaded documents.",
              sources: [],
            };
          }
          return next;
        });
      }
    },
    [messages],
  );

  return { messages, isSending, error, sendMessage };
}
