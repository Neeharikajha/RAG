import type { DocumentRecord } from "../types/document";

const STATUS_LABEL: Record<DocumentRecord["status"], string> = {
  processing: "Processing…",
  ready: "Ready",
  failed: "Failed",
};

const STATUS_CLASS: Record<DocumentRecord["status"], string> = {
  ready: "text-xs font-semibold px-3 py-1 rounded-xl text-emerald-700 bg-emerald-100/90 border border-emerald-200",
  processing: "text-xs font-semibold px-3 py-1 rounded-xl text-blue-700 bg-blue-100/90 border border-blue-200",
  failed: "text-xs font-semibold px-3 py-1 rounded-xl text-red-700 bg-red-100/90 border border-red-200",
};

interface Props {
  documents: DocumentRecord[];
  onDelete?: (id: string) => void;
}

export function DocumentList({ documents, onDelete }: Props) {
  if (!documents.length) {
    return <p className="text-slate-600 text-sm italic font-medium">No documents yet — upload something to get started.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-white/50 backdrop-blur-md border border-white/80 shadow-xs rounded-2xl p-4 sm:px-5 sm:py-4 transition-all hover:bg-white/65"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm sm:text-base block">{doc.fileName}</span>
                <span className="text-xs text-slate-500 font-medium">
                  {doc.status === "ready" && `${doc.chunkCount} chunks`}
                  {doc.status === "failed" && <span className="text-red-500">{doc.error}</span>}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={STATUS_CLASS[doc.status]}>
                {STATUS_LABEL[doc.status]}
              </span>
              {onDelete && (
                <button
                  className="bg-red-100/80 hover:bg-red-200 text-red-600 px-3 py-1 rounded-xl text-xs font-semibold transition-all border border-red-200"
                  onClick={() => onDelete(doc.id)}
                  title="Delete document"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
