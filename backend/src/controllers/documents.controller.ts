import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { getFileType, parseFile } from "../services/ingestion/parseFile.js";
import { chunkPages } from "../services/ingestion/chunker.js";
import { embedChunks } from "../services/embeddings/embed.js";
import {
  addDocument,
  updateDocument,
  addChunks,
  getDocuments,
  deleteDocument as removeDoc,
  getVectorDbStatus,
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

    const results: DocumentRecord[] = [];

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

        const parsed = await parseFile(file.path, fileType);
        const pageChunks = chunkPages(parsed.pages);
        const embeddings = await embedChunks(pageChunks.map((c) => c.text));


        const chunks: Chunk[] = pageChunks.map((pc, i) => ({
          id: `${doc.id}-${i}`,
          documentId: doc.id,
          fileName: doc.fileName,
          text: pc.text,
          chunkIndex: i,
          pageNumber: pc.pageNumber,
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
      results.push(doc);
    }
    res.json({ documents: results });
  } catch (err) {
    next(err);
  }
}

export function listDocuments(_req: Request, res: Response) {
  res.json({ documents: getDocuments() });
}

export async function deleteDocument(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id as string;
    await removeDoc(id);
    res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
}

export async function getVectorStatus(_req: Request, res: Response, next: NextFunction) {
  try {
    const status = await getVectorDbStatus();
    res.json(status);
  } catch (err) {
    next(err);
  }
}



