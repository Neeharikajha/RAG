import type { DocumentRecord } from "../types/document";

const STATUS_LABEL: Record<DocumentRecord["status"], string> = {
  processing: "Processing…",
  ready: "Ready",
  failed: "Failed",
};

interface Props {
  documents: DocumentRecord[];
  onDelete?: (id: string) => void;
}

export function DocumentList({ documents, onDelete }: Props) {
  if (!documents.length) {
    return <p className="empty-state">No documents yet — upload something to get started.</p>;
  }

  return (
    <ul className="doc-list">
      {documents.map((doc) => (
        <li key={doc.id} className="doc-row">
          <div className="doc-row__main">
            <span className="doc-row__name">{doc.fileName}</span>
            <div className="doc-row__actions">
              <span className={`doc-row__status doc-row__status--${doc.status}`}>
                {STATUS_LABEL[doc.status]}
              </span>
              {onDelete && (
                <button
                  className="doc-row__delete-btn"
                  onClick={() => onDelete(doc.id)}
                  title="Delete document"
                >
                  Delete
                </button>
              )}
            </div>
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

