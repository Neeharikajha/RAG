export type ContradictionStatus = "unresolved" | "resolved" | "false_positive";

export interface ContradictionStatement {
  documentId: string;
  fileName: string;
  chunkIndex: number;
  text: string;
}

export interface Contradiction {
  id: string;
  statementA: ContradictionStatement;
  statementB: ContradictionStatement;
  similarityScore: number;
  type: "factual" | "logical" | "temporal" | "numerical";
  severity: "critical" | "warning" | "info";
  explanation: string;
  status: ContradictionStatus;
  detectedAt: string;
}
