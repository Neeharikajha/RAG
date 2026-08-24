import type { DocumentRecord } from "../types/document";
import type { ChatMessage } from "../types/chat";

export async function uploadDocuments(
  files: File[],
): Promise<DocumentRecord[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const res = await fetch("/api/documents", { method: "POST", body: formData });
  if (!res.ok) throw new Error((await res.json()).error ?? "Upload failed");
  const data = await res.json();
  return data.documents;
}

export async function listDocuments(): Promise<DocumentRecord[]> {
  const res = await fetch("/api/documents");
  if (!res.ok) throw new Error("Failed to load documents");
  const data = await res.json();
  return data.documents;
}

export async function sendChatMessage(query: string, history: ChatMessage[]) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      history: history.map(({ role, content }) => ({ role, content })),
    }),
  });
  if (!res.ok)
    throw new Error((await res.json()).error ?? "Chat request failed");
  return res.json() as Promise<{
    answer: string;
    sources: ChatMessage["sources"];
  }>;
}
