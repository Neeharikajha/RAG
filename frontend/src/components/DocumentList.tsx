import type { DocumentRecord } from "../types/document";

const STATUS_LABEL: Record<DocumentRecord["status"], string> = {
  processing: "Processing…",
  ready: "Ready",
  failed: "Failed",
};

export function DocumentList({ documents }: { documents: DocumentRecord[] }) {
  if (!documents.length) {
    return <p className="empty-state">No documents yet — upload something to get started.</p>;
  }

  return (
    <ul className="doc-list">
      {documents.map((doc) => (
        <li key={doc.id} className="doc-row">
          <div className="doc-row__main">
            <span className="doc-row__name">{doc.fileName}</span>
            <span className={`doc-row__status doc-row__status--${doc.status}`}>
              {STATUS_LABEL[doc.status]}
            </span>
          </div>
          <div className="doc-row__meta">
            {doc.status === "ready" && <span>{doc.chunkCount} chunks</span>}
            {doc.status === "failed" && <span className="doc-row__error">{doc.error}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}
