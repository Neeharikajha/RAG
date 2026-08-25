import type { DocumentRecord } from "../types/document";
import type { ChatMessage } from "../types/chat";
import type {
  Contradiction,
  ContradictionStatus,
} from "../types/contradiction";

export async function uploadDocuments(
  files: File[],
  onProgress?: (percent: number) => void,
): Promise<DocumentRecord[]> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText).documents);
        } catch {
          reject(new Error("Invalid server response"));
        }
      } else {
        try {
          reject(new Error(JSON.parse(xhr.responseText).error ?? "Upload failed"));
        } catch {
          reject(new Error("Upload failed"));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.open("POST", "/api/documents");
    xhr.send(formData);
  });
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete document");
}

export async function listDocuments(): Promise<DocumentRecord[]> {
  const res = await fetch("/api/documents");
  if (!res.ok) throw new Error("Failed to load documents");
  const data = await res.json();
  return data.documents;
}


import type { SourceCitation } from "../types/chat";

export async function sendChatMessageStream(
  query: string,
  history: ChatMessage[],
  onChunk: (data: { delta?: string; sources?: SourceCitation[]; answer?: string }) => void,
): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      history: history.map(({ role, content }) => ({ role, content })),
    }),
  });

  if (!res.ok) {
    try {
      throw new Error((await res.json()).error ?? "Chat request failed");
    } catch {
      throw new Error("Chat request failed");
    }
  }

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();

  if (reader) {
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const dataStr = trimmed.slice(6);
          if (dataStr === "[DONE]") break;
          try {
            onChunk(JSON.parse(dataStr));
          } catch {}
        }
      }
    }
  }
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
