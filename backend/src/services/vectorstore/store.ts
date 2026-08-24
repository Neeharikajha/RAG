import fs from "fs/promises";
import { DATA_FILE } from "../../config/env.js";
import type { Chunk, DocumentRecord } from "../../types/document.js";

interface StoreShape {
  documents: DocumentRecord[];
  chunks: Chunk[];
}

let store: StoreShape = { documents: [], chunks: [] };

export async function loadStore(): Promise<void> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    store = JSON.parse(raw);
  } catch {
    store = { documents: [], chunks: [] };
  }
}

async function persist(): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2));
}

export async function addDocument(doc: DocumentRecord): Promise<void> {
  store.documents.push(doc);
  await persist();
}

export async function updateDocument(
  id: string,
  patch: Partial<DocumentRecord>,
): Promise<void> {
  const doc = store.documents.find((d) => d.id === id);
  if (doc) Object.assign(doc, patch);
  await persist();
}

export async function addChunks(chunks: Chunk[]): Promise<void> {
  store.chunks.push(...chunks);
  await persist();
}

export function getDocuments(): DocumentRecord[] {
  return store.documents;
}

export function getAllChunks(): Chunk[] {
  return store.chunks;
}
