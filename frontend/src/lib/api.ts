import type { DocumentRecord } from "../types/document";
import type { ChatMessage } from "../types/chat";
import type {
  Contradiction,
  ContradictionStatus,
} from "../types/contradiction";

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

// Triggers a new contradiction scan across all uploaded documents.
export async function scanContradictions(): Promise<Contradiction[]> {
  const res = await fetch("/api/contradictions/scan", { method: "POST" });
  if (!res.ok) throw new Error((await res.json()).error ?? "Scan failed");
  return (await res.json()).contradictions;
}

// Loads whatever's already been detected (no new scan).
export async function listContradictions(): Promise<Contradiction[]> {
  const res = await fetch("/api/contradictions");
  if (!res.ok) throw new Error("Failed to load contradictions");
  return (await res.json()).contradictions;
}

// Marks a contradiction as resolved / false_positive / unresolved.
export async function updateContradictionStatus(
  id: string,
  status: ContradictionStatus,
) {
  const res = await fetch(`/api/contradictions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? "Update failed");
  return (await res.json()).contradiction as Contradiction;
}
