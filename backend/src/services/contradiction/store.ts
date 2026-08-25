import fs from "fs/promises";
import type {
  Contradiction,
  ContradictionStatus,
} from "../../types/contradiction.js";

const FILE = "data/contradictions.json";
let contradictions: Contradiction[] = [];

function getDedupeKey(c: Contradiction): string {
  const textA = c.statementA.text.trim();
  const textB = c.statementB.text.trim();
  return [textA, textB].sort().join("||");
}

export async function loadContradictions(): Promise<void> {
  try {
    const raw: Contradiction[] = JSON.parse(await fs.readFile(FILE, "utf-8"));
    const seen = new Set<string>();
    contradictions = [];
    for (const item of raw) {
      const key = getDedupeKey(item);
      if (!seen.has(key)) {
        seen.add(key);
        contradictions.push(item);
      }
    }
  } catch {
    contradictions = [];
  }
}

async function persist(): Promise<void> {
  await fs.writeFile(FILE, JSON.stringify(contradictions, null, 2));
}

export async function upsertContradictions(
  newOnes: Contradiction[],
): Promise<void> {
  const existingKeys = new Set(contradictions.map((c) => getDedupeKey(c)));
  const toAdd: Contradiction[] = [];
  for (const c of newOnes) {
    const key = getDedupeKey(c);
    if (!existingKeys.has(key)) {
      existingKeys.add(key);
      toAdd.push(c);
    }
  }
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

export async function clearAllContradictions(): Promise<void> {
  contradictions = [];
  await persist();
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
