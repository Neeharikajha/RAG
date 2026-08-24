import type { Request, Response, NextFunction } from "express";
import { answerQuery } from "../services/rag/answerQuery.js";
import type { ChatRequest } from "../types/chat.js";

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const { query, history }: ChatRequest = req.body;
    if (!query?.trim()) throw new Error("Query is required");

    const result = await answerQuery(query, history);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
