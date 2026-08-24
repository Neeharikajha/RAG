import { getAllChunks, cosineSimilarity } from "../vectorstore/store.js";
import {
  SIMILARITY_THRESHOLD,
  NEAR_DUPLICATE_CEILING,
  CANDIDATE_TOP_K,
} from "../../config/env.js";
import type { Chunk } from "../../types/document.js";

export interface CandidatePair {
  chunkA: Chunk;
  chunkB: Chunk;
  similarityScore: number;
}

export function findCandidatePairs(): CandidatePair[] {
  const chunks = getAllChunks();
  const candidates: CandidatePair[] = [];
  const seenPairs = new Set<string>(); // avoids adding both (A,B) and (B,A)

  for (const chunkA of chunks) {
    const matches = chunks
      .filter((c) => c.documentId !== chunkA.documentId)
      .map((c) => ({
        chunk: c,
        score: cosineSimilarity(chunkA.embedding, c.embedding),
      }))
      .filter(
        (m) =>
          m.score >= SIMILARITY_THRESHOLD && m.score < NEAR_DUPLICATE_CEILING,
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, CANDIDATE_TOP_K);

    for (const match of matches) {
      const pairKey = [chunkA.id, match.chunk.id].sort().join("::");
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);
      candidates.push({
        chunkA,
        chunkB: match.chunk,
        similarityScore: match.score,
      });
    }
  }

  return candidates;
}
