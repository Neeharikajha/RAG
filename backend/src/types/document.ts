export interface DocumentRecord{
    id:string;
    fileName:string;
    fileType: "pdf" | "docx" | "md" | "txt";
    uploadedAt : string;
    chunkCount : number;
    status : "processing" | "ready" | "failed";
    error?: string;
}

export interface Chunk {
    id: string;
    documentId: string;
    fileName: string;
    text: string;
    rawText?: string;
    parentText?: string;
    chunkIndex : number;
    pageNumber?: number;
    embedding : number[];  //vector representation, fill after embedding step
}
