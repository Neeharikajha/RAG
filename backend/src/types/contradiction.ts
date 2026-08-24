export type ContradictionType =
  | "factual"
  | "logical"
  | "temporal"
  | "numerical";
export type Severity = "critical" | "warning" | "info";
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
  type: ContradictionType;
  severity: Severity;
  explanation: string;
  status: ContradictionStatus;
  detectedAt: string;
}
