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
    chunkIndex : number;
    embedding : number[];  //vector represntation, fill after embedding step
}