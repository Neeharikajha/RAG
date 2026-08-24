import fs from "fs/promises";
import type {
  Contradiction,
  ContradictionStatus,
} from "../../types/contradiction.js";

const FILE = "data/contradictions.json";
let contradictions: Contradiction[] = [];

export async function loadContradictions(): Promise<void> {
  try {
    contradictions = JSON.parse(await fs.readFile(FILE, "utf-8"));
  } catch {
    contradictions = [];
  }
}

async function persist(): Promise<void> {
  await fs.writeFile(FILE, JSON.stringify(contradictions, null, 2));
}

// Adds newly-detected contradictions, skipping any whose id already
// exists (same chunk pair) so a manually-set status isn't reset.
export async function upsertContradictions(
  newOnes: Contradiction[],
): Promise<void> {
  const existingIds = new Set(contradictions.map((c) => c.id));
  const toAdd = newOnes.filter((c) => !existingIds.has(c.id));
  contradictions.push(...toAdd);
  await persist();
}

export async function removeContradictionsForDoc(documentId: string): Promise<void> {
  contradictions = contradictions.filter(
    (c) => c.statementA.documentId !== documentId && c.statementB.documentId !== documentId,
  );
  await persist();
}

export function getAll(): Contradiction[] {
  return contradictions;
}


export async function updateStatus(
  id: string,
  status: ContradictionStatus,
): Promise<Contradiction | null> {
  const found = contradictions.find((c) => c.id === id);
  if (!found) return null;
  found.status = status;
  await persist();
  return found;
}
