export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SourceCitation {
  documentId: string;
  fileName: string;
  chunkIndex: number;
  pageNumber?: number;
  text: string; //for ui preview
}


export interface ChatRequest {
  query: string;
  history?: ChatMessage[]; 
}

export interface ChatResponse {
  answer: string;
  sources: SourceCitation[];
}
