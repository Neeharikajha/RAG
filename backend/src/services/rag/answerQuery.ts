import type { Response } from "express";
import { embedText } from "../embeddings/embed.js";
import { searchSimilar } from "../vectorstore/store.js";
import { generateAnswer, generateAnswerStream } from "../llm/groq.js";
import { TOP_K } from "../../config/env.js";
import type {
  ChatMessage,
  ChatResponse,
  SourceCitation,
} from "../../types/chat.js";
import type { Chunk } from "../../types/document.js";


function buildContextBlock(chunks: Chunk[]): string {
  return chunks
    .map(
      (c, i) =>
        `[${i + 1}] (Source: ${c.fileName}, Page ${c.pageNumber ?? c.chunkIndex + 1})\n${c.parentText || c.text}`,
    )
    .join("\n\n");
}


const SYSTEM_PROMPT = `You are a helpful document intelligence assistant.
Answer the user's question clearly, accurately, and directly based on the provided context below.
- Recognize semantic equivalents and synonyms (for example: "holiday" = "leave / paid time off / PTO", "cost" = "price / fee", "salary" = "compensation").
- Reason over the facts in the context to provide a full, helpful answer.
- Always cite your sources inline using [1], [2], matching the numbered context blocks.
- Only say you don't know if the topic is completely absent from the context.`;

import { getCachedValue, setCachedValue } from "../cache/redis.js";

export async function answerQuery(
  query: string,
  history: ChatMessage[] = [],
): Promise<ChatResponse> {
  const cacheKey = `rag:answer:${query.toLowerCase().trim()}`;
  const cached = await getCachedValue<ChatResponse>(cacheKey);
  if (cached) return cached;

  // Step 1: embed the query
  const queryEmbedding = await embedText(query);

  // Step 2: retrieve relevant chunks
  const retrievedChunks = await searchSimilar(queryEmbedding, TOP_K);
  if (!retrievedChunks.length) {
    const fallbackResult = {
      answer: "I couldn't find any relevant information in the uploaded documents.",
      sources: [],
    };
    await setCachedValue(cacheKey, fallbackResult, 1800);
    return fallbackResult;
  }

  // Step 3: build the grounded prompt
  const contextBlock = buildContextBlock(retrievedChunks);
  const messages: ChatMessage[] = [
    { role: "user", content: `${SYSTEM_PROMPT}\n\nContext:\n${contextBlock}` },
    {
      role: "assistant",
      content:
        "Understood. I'll answer using the context provided and cite sources inline.",
    },
    ...history.slice(-4),
    { role: "user", content: query },
  ];

  // Step 4: generate the answer
  const answer = await generateAnswer(messages);
  const sources: SourceCitation[] = retrievedChunks.map((c) => ({
    documentId: c.documentId,
    fileName: c.fileName,
    chunkIndex: c.chunkIndex,
    pageNumber: c.pageNumber ?? c.chunkIndex + 1,
    text: c.text,
  }));

  const responsePayload = { answer, sources };
  await setCachedValue(cacheKey, responsePayload, 3600);
  return responsePayload;
}

export async function streamQuery(
  query: string,
  history: ChatMessage[] = [],
  res: Response,
): Promise<void> {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const cacheKey = `rag:answer:${query.toLowerCase().trim()}`;
  const cached = await getCachedValue<ChatResponse>(cacheKey);
  if (cached) {
    res.write(`data: ${JSON.stringify({ sources: cached.sources })}\n\n`);
    res.write(`data: ${JSON.stringify({ answer: cached.answer })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
    return;
  }

  const queryEmbedding = await embedText(query);
  const retrievedChunks = await searchSimilar(queryEmbedding, TOP_K);

  if (!retrievedChunks.length) {
    const fallback = {
      answer: "I couldn't find any relevant information in the uploaded documents.",
      sources: [],
    };
    res.write(`data: ${JSON.stringify(fallback)}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
    await setCachedValue(cacheKey, fallback, 1800);
    return;
  }

  const sources: SourceCitation[] = retrievedChunks.map((c) => ({
    documentId: c.documentId,
    fileName: c.fileName,
    chunkIndex: c.chunkIndex,
    pageNumber: c.pageNumber ?? c.chunkIndex + 1,
    text: c.text,
  }));

  res.write(`data: ${JSON.stringify({ sources })}\n\n`);

  const contextBlock = buildContextBlock(retrievedChunks);
  const messages: ChatMessage[] = [
    { role: "user", content: `${SYSTEM_PROMPT}\n\nContext:\n${contextBlock}` },
    {
      role: "assistant",
      content:
        "Understood. I'll answer using the context provided and cite sources inline.",
    },
    ...history.slice(-4),
    { role: "user", content: query },
  ];

  const fullAnswer = await generateAnswerStream(messages, (delta) => {
    res.write(`data: ${JSON.stringify({ delta })}\n\n`);
  });

  res.write("data: [DONE]\n\n");
  res.end();

  if (fullAnswer) {
    await setCachedValue(cacheKey, { answer: fullAnswer, sources }, 3600);
  }
}


