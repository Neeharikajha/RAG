export interface SourceCitation {
  documentId: string;
  fileName: string;
  chunkIndex: number;
  text: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: SourceCitation[]; // only for assisted messages. 
}
