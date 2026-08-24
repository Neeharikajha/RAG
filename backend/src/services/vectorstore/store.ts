import fs from "fs/promises";
import { ChromaClient } from "chromadb";
import { DATA_FILE, CHROMA_URL } from "../../config/env.js";
import { removeContradictionsForDoc } from "../contradiction/store.js";
import type { Chunk, DocumentRecord } from "../../types/document.js";

interface StoreShape {
  documents: DocumentRecord[];
  chunks: Chunk[];
}

let store: StoreShape = { documents: [], chunks: [] };
const chromaUrlObj = new URL(CHROMA_URL.startsWith("http") ? CHROMA_URL : `http://${CHROMA_URL}`);
const chromaClient = new ChromaClient({
  ssl: chromaUrlObj.protocol === "https:",
  host: chromaUrlObj.hostname,
  port: Number(chromaUrlObj.port) || 8000,
});
let chromaCollection: any = null;

async function getChromaCollection() {
  if (chromaCollection) return chromaCollection;
  try {
    chromaCollection = await chromaClient.getOrCreateCollection({
      name: "document_sys",
      embeddingFunction: { generate: async () => [] },
    });
  } catch {
    chromaCollection = null;
  }
  return chromaCollection;
}


export async function loadStore(): Promise<void> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    store = JSON.parse(raw);
  } catch {
    store = { documents: [], chunks: [] };
  }
  await getChromaCollection();
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

export async function deleteDocument(id: string): Promise<void> {
  store.documents = store.documents.filter((d) => d.id !== id);
  store.chunks = store.chunks.filter((c) => c.documentId !== id);
  await persist();
  await removeContradictionsForDoc(id);

  const collection = await getChromaCollection();
  if (collection) {
    try {
      await collection.delete({ where: { documentId: id } });
    } catch {}
  }
}


export async function addChunks(chunks: Chunk[]): Promise<void> {
  store.chunks.push(...chunks);
  await persist();

  const collection = await getChromaCollection();
  if (collection && chunks.length > 0) {
    try {
      await collection.add({
        ids: chunks.map((c) => c.id),
        embeddings: chunks.map((c) => c.embedding),
        documents: chunks.map((c) => c.text),
        metadatas: chunks.map((c) => ({
          documentId: c.documentId,
          fileName: c.fileName,
          chunkIndex: c.chunkIndex,
        })),
      });
    } catch {}
  }
}

export function getDocuments(): DocumentRecord[] {
  return store.documents;
}

export function getAllChunks(): Chunk[] {
  return store.chunks;
}

//arrows pointing in same direction = high similarity ~ 1
//right angle -> not similar at all
//opposite direction -> less similarity ~ -1
//directional similarity. 
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export async function searchSimilar(queryEmbedding: number[], topK: number): Promise<Chunk[]> {
  const collection = await getChromaCollection();
  if (collection) {
    try {
      const res = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK,
      });
      if (res.ids?.[0]?.length) {
        return res.ids[0].map((id: string, i: number) => ({
          id,
          documentId: (res.metadatas?.[0]?.[i]?.documentId as string) || "",
          fileName: (res.metadatas?.[0]?.[i]?.fileName as string) || "",
          chunkIndex: (res.metadatas?.[0]?.[i]?.chunkIndex as number) || 0,
          text: (res.documents?.[0]?.[i] as string) || "",
          embedding: [],
        }));
      }
    } catch {}
  }
  return [...store.chunks]
    .map((chunk) => ({ chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((result) => result.chunk);
}

export async function getVectorDbStatus() {
  const collection = await getChromaCollection();
  if (collection) {
    try {
      const count = await collection.count();
      return { active: true, engine: "ChromaDB", collection: "document_sys", totalVectors: count };
    } catch {}
  }
  return { active: false, engine: "In-Memory Vector Store", totalVectors: store.chunks.length };
}


