export interface DocumentRecord {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  chunkCount: number;
  status: "processing" | "ready" | "failed";
  error?: string;
}

//same as backend document.ts - ui also needs only these types.
