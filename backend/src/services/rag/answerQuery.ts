import { embedText } from "../embeddings/embed.js";
import { searchSimilar } from "../vectorstore/store.js";
import { generateAnswer } from "../llm/groq.js";
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
        `[${i + 1}] (Source: ${c.fileName}, chunk ${c.chunkIndex})\n${c.text}`,
    )
    .join("\n\n");
}

const SYSTEM_PROMPT = `You are a document assistant. Answer the user's question using ONLY the
numbered context provided below. If the answer isn't in the context, say
you don't know — do not make anything up. When you use information from
the context, cite it inline like [1], [2], matching the source numbers.`;

export async function answerQuery(
  query: string,
  history: ChatMessage[] = [],
): Promise<ChatResponse> {
  // Step 1: embed the query
  const queryEmbedding = await embedText(query);

  // Step 2: retrieve relevant chunks
  const retrievedChunks = await searchSimilar(queryEmbedding, TOP_K);


  // Step 3: build the grounded prompt
  const contextBlock = buildContextBlock(retrievedChunks);
  const messages: ChatMessage[] = [
    { role: "user", content: `${SYSTEM_PROMPT}\n\nContext:\n${contextBlock}` },
    {
      role: "assistant",
      content:
        "Understood. I'll answer using only that context and cite sources.",
    },
    ...history,
    { role: "user", content: query },
  ];

  // Step 4: generate the answer
  const answer = await generateAnswer(messages);

  const sources: SourceCitation[] = retrievedChunks.map((c) => ({
    documentId: c.documentId,
    fileName: c.fileName,
    chunkIndex: c.chunkIndex,
    text: c.text,
  }));

  return { answer, sources };
}
