import { useState, useCallback } from "react";
import type { ChatMessage } from "../types/chat";
import { sendChatMessage } from "../lib/api";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (query: string) => {
      const userMessage: ChatMessage = { role: "user", content: query };
      setMessages((prev) => [...prev, userMessage]);
      setIsSending(true);
      setError(null);

      try {
        const { answer, sources } = await sendChatMessage(query, messages);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: answer, sources },
        ]);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsSending(false);
      }
    },
    [messages],
  );

  return { messages, isSending, error, sendMessage };
}
