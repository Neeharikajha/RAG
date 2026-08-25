import { useDocuments } from "./hooks/useDocuments";
import { UploadDropzone } from "./components/UploadDropzone";
import { DocumentList } from "./components/DocumentList";
import { useState } from "react";
import { ChatWindow } from "./components/ChatWindow";
import { ContradictionDashboard } from "./components/ContradictionDashboard";

export default function App() {
  const [tab, setTab] = useState<"upload" | "chat" | "contradictions">(
    "upload",
  );
  const { documents, isUploading, uploadingFiles, error, upload, remove } = useDocuments();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-6">
          Document Intelligence
        </h1>
        <nav className="flex gap-3">
          <button
            className={
              tab === "upload"
                ? "px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-500/20 bg-blue-600 text-white"
                : "px-6 py-2.5 rounded-xl font-medium text-sm transition-all bg-white/40 hover:bg-white/70 text-slate-700 backdrop-blur-md border border-white/60 shadow-xs"
            }
            onClick={() => setTab("upload")}
          >
            Upload
          </button>
          <button
            className={
              tab === "chat"
                ? "px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-500/20 bg-blue-600 text-white"
                : "px-6 py-2.5 rounded-xl font-medium text-sm transition-all bg-white/40 hover:bg-white/70 text-slate-700 backdrop-blur-md border border-white/60 shadow-xs"
            }
            onClick={() => setTab("chat")}
          >
            Chat
          </button>
          <button
            className={
              tab === "contradictions"
                ? "px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-500/20 bg-blue-600 text-white"
                : "px-6 py-2.5 rounded-xl font-medium text-sm transition-all bg-white/40 hover:bg-white/70 text-slate-700 backdrop-blur-md border border-white/60 shadow-xs"
            }
            onClick={() => setTab("contradictions")}
          >
            Contradictions
          </button>
        </nav>
      </header>

      <div style={{ display: tab === "upload" ? "block" : "none" }}>
        <UploadDropzone
          onUpload={upload}
          isUploading={isUploading}
          uploadingFiles={uploadingFiles}
        />
        {error && (
          <p className="mt-4 p-4 rounded-xl bg-red-500/15 border border-red-200 text-red-700 text-sm font-medium backdrop-blur-md">
            {error}
          </p>
        )}
        <section className="mt-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-4">
            Document Library
          </h2>
          <DocumentList documents={documents} onDelete={remove} />
        </section>
      </div>

      <div style={{ display: tab === "chat" ? "block" : "none" }}>
        <ChatWindow />
      </div>

      <div style={{ display: tab === "contradictions" ? "block" : "none" }}>
        <ContradictionDashboard />
      </div>
    </div>
  );
}
