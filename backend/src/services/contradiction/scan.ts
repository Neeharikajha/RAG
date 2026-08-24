import { findCandidatePairs } from "./findCandidates";
import { judgeContradiction } from "./judgeContradiction";
import { upsertContradictions, getAll } from "./store";
import type { Contradiction } from "../../types/contradiction";

export async function scanForContradictions(): Promise<Contradiction[]> {
  const candidates = findCandidatePairs();
  const found: Contradiction[] = [];

  for (const pair of candidates) {
    const judgment = await judgeContradiction(pair);
    if (!judgment.isContradiction || !judgment.type || !judgment.severity)
      continue;

    found.push({
      id: [pair.chunkA.id, pair.chunkB.id].sort().join("::"),
      statementA: {
        documentId: pair.chunkA.documentId,
        fileName: pair.chunkA.fileName,
        chunkIndex: pair.chunkA.chunkIndex,
        text: pair.chunkA.text,
      },
      statementB: {
        documentId: pair.chunkB.documentId,
        fileName: pair.chunkB.fileName,
        chunkIndex: pair.chunkB.chunkIndex,
        text: pair.chunkB.text,
      },
      similarityScore: pair.similarityScore,
      type: judgment.type,
      severity: judgment.severity,
      explanation: judgment.explanation,
      status: "unresolved",
      detectedAt: new Date().toISOString(),
    });
  }

  await upsertContradictions(found);
  return getAll();
}
