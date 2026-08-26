import { useDocuments } from "./hooks/useDocuments";
import { UploadDropzone } from "./components/UploadDropzone";
import { DocumentList } from "./components/DocumentList";
import { useState } from "react";
import { ChatWindow } from "./components/ChatWindow";
import { ContradictionDashboard } from "./components/ContradictionDashboard";

export default function App() {
  const [tab, setTab] = useState<"upload" | "chat" | "contradictions">("upload");
  const { documents, isUploading, uploadingFiles, error, upload, remove } = useDocuments();

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10 px-4 sm:px-6 min-h-screen space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Document Intelligence System
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              RAG Semantic Search, Contextual Chunking & Contradiction Detection
            </p>
          </div>
          <span className="self-start sm:self-auto bg-blue-600/10 border border-blue-500/20 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full shadow-2xs">
            Groq Llama 3.1 + ChromaDB + Redis
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 border-b border-slate-200/60 pb-3">
          <button
            className={
              tab === "upload"
                ? "flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 bg-blue-600 text-white cursor-pointer"
                : "flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all bg-white/40 hover:bg-white/70 text-slate-700 backdrop-blur-md border border-white/60 shadow-xs cursor-pointer"
            }
            onClick={() => setTab("upload")}
          >
            📂 Upload & Documents ({documents.length})
          </button>
          <button
            className={
              tab === "chat"
                ? "flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 bg-blue-600 text-white cursor-pointer"
                : "flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all bg-white/40 hover:bg-white/70 text-slate-700 backdrop-blur-md border border-white/60 shadow-xs cursor-pointer"
            }
            onClick={() => setTab("chat")}
          >
            💬 RAG Chat System
          </button>
          <button
            className={
              tab === "contradictions"
                ? "flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 bg-blue-600 text-white cursor-pointer"
                : "flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all bg-white/40 hover:bg-white/70 text-slate-700 backdrop-blur-md border border-white/60 shadow-xs cursor-pointer"
            }
            onClick={() => setTab("contradictions")}
          >
            ⚠️ Contradiction Dashboard
          </button>
        </nav>
      </header>

      {/* Main Tab Panels */}
      <main>
        <div style={{ display: tab === "upload" ? "block" : "none" }}>
          <UploadDropzone
            onUpload={upload}
            isUploading={isUploading}
            uploadingFiles={uploadingFiles}
          />
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/15 border border-red-200 text-red-700 text-sm font-medium backdrop-blur-md flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
          <section className="mt-8 sm:mt-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-4">
              Uploaded Document Library ({documents.length})
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
      </main>
    </div>
  );
}
