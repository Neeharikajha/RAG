import { generateAnswer } from "../llm/groq.js";
import type { CandidatePair } from "./findCandidates.js";
import type { ContradictionType, Severity } from "../../types/contradiction.js";


const JUDGE_PROMPT = `You compare two statements from different documents and decide if they
genuinely contradict each other.

Types: "factual" (different facts about the same thing), "logical"
(mutually exclusive rules/policies), "temporal" (conflicting dates or
version info), "numerical" (different numbers/stats for the same
measurement).

Do NOT flag a contradiction if: the statements are about different
things, one is simply more detailed than the other, or one is clearly a
later revision that supersedes the other rather than conflicting with it.

Respond with ONLY valid JSON, no other text, no markdown fences:
{"isContradiction": boolean, "type": "factual"|"logical"|"temporal"|"numerical"|null, "severity": "critical"|"warning"|"info"|null, "explanation": string}`;

export interface Judgment {
  isContradiction: boolean;
  type: ContradictionType | null;
  severity: Severity | null;
  explanation: string;
}

export async function judgeContradiction(
  pair: CandidatePair,
): Promise<Judgment> {
  const prompt = `${JUDGE_PROMPT}

Statement A (from ${pair.chunkA.fileName}): "${pair.chunkA.text}"

Statement B (from ${pair.chunkB.fileName}): "${pair.chunkB.text}"`;

  const raw = await generateAnswer([{ role: "user", content: prompt }]);

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    // If the model didn't return valid JSON, treat it as "not a
    // contradiction" rather than crashing the whole scan over one bad reply.
    return {
      isContradiction: false,
      type: null,
      severity: null,
      explanation: "",
    };
  }
}
