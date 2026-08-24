import { GROQ_API_KEY, GROQ_MODEL } from "../../config/env.js";
import type { ChatMessage } from "../../types/chat.js";

export async function generateAnswer(messages: ChatMessage[]): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is not set. Get a free key at console.groq.com",
    );
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.2, // low temperature: we want grounded, factual answers, not creativity
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq API error (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
