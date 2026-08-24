import type { Request, Response, NextFunction } from "express";
import { scanForContradictions } from "../services/contradiction/scan.js";
import { getAll, updateStatus } from "../services/contradiction/store.js";
import type { ContradictionStatus } from "../types/contradiction.js";

const VALID_STATUSES: ContradictionStatus[] = [
  "unresolved",
  "resolved",
  "false_positive",
];

// POST /api/contradictions/scan — runs detection across all documents
export async function scan(_req: Request, res: Response, next: NextFunction) {
  try {
    const contradictions = await scanForContradictions();
    res.json({ contradictions });
  } catch (err) {
    next(err);
  }
}

// GET /api/contradictions — returns whatever's already been detected
export function list(_req: Request, res: Response) {
  res.json({ contradictions: getAll() });
}

// PATCH /api/contradictions/:id — mark resolved / false_positive / unresolved
export async function updateContradictionStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { status } = req.body as { status: ContradictionStatus };
    if (!VALID_STATUSES.includes(status)) {
      throw new Error(
        `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      );
    }
    const updated = await updateStatus(String(req.params.id), status);
    if (!updated) throw new Error("Contradiction not found");
    res.json({ contradiction: updated });
  } catch (err) {
    next(err);
  }
}
