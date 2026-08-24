import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { getFileType, parseFile } from "../services/ingestion/parseFile.js";
import { chunkText } from "../services/ingestion/chunker.js";
import { embedChunks } from "../services/embeddings/embed.js";
import {
  addDocument,
  updateDocument,
  addChunks,
  getDocuments,
} from "../services/vectorstore/store.js";
import type { DocumentRecord, Chunk } from "../types/document.js";

export async function uploadDocuments(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) throw new Error("No files uploaded");

    const results: DocumentRecord[] = []; //readonly

    for (const file of files) {
      const doc: DocumentRecord = {
        id: randomUUID(),
        fileName: file.originalname,
        fileType: "txt", // overwritten below once we know it's valid
        uploadedAt: new Date().toISOString(),
        chunkCount: 0,
        status: "processing",
      };
      try {
        const fileType = getFileType(file.originalname);
        doc.fileType = fileType;
        await addDocument(doc);

        const text = await parseFile(file.path, fileType);
        const textChunks = chunkText(text);
        const embeddings = await embedChunks(textChunks);

        const chunks: Chunk[] = textChunks.map((text, i) => ({
          id: `${doc.id}-${i}`,
          documentId: doc.id,
          fileName: doc.fileName,
          text,
          chunkIndex: i,
          embedding: embeddings[i],
        }));

        await addChunks(chunks);
        await updateDocument(doc.id, {
          status: "ready",
          chunkCount: chunks.length,
        });
        doc.status = "ready";
        doc.chunkCount = chunks.length;
      } catch (err) {
        await updateDocument(doc.id, {
          status: "failed",
          error: (err as Error).message,
        });
        doc.status = "failed";
        doc.error = (err as Error).message;
      }
    }
  } catch (err) {
    next(err);
  }
}

export function listDocuments(_req: Request, res: Response) {
  res.json({ documents: getDocuments() });
}
