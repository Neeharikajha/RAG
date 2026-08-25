import { CHUNK_SIZE, CHUNK_OVERLAP } from "../../config/env.js";

export interface PageChunk {
  text: string;
  rawText: string;
  parentText: string;
  pageNumber: number;
}

export function chunkText(text: string): string[] {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if (current.length + para.length <= CHUNK_SIZE) {
      current += (current ? "\n\n" : "") + para;
    } else {
      if (current) chunks.push(current);
      const overlap = current.slice(-CHUNK_OVERLAP);
      current = overlap ? overlap + "\n\n" + para : para;
    }
  }
  if (current) chunks.push(current);

  return chunks;
}

export function chunkPages(
  pages: { pageNumber: number; text: string }[],
  fileName: string,
): PageChunk[] {
  const result: PageChunk[] = [];
  for (const page of pages) {
    const textChunks = chunkText(page.text);
    for (const rawText of textChunks) {
      const enrichedText = `[Document: ${fileName} | Page ${page.pageNumber}]\n${rawText}`;
      result.push({
        text: enrichedText,
        rawText,
        parentText: page.text,
        pageNumber: page.pageNumber,
      });
    }
  }
  return result;
}
