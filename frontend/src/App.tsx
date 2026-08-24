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
    <div className="page">
      <header className="page__header">
        <h1>Document Intelligence</h1>
        <nav className="tabs">
          <button
            className={tab === "upload" ? "tab tab--active" : "tab"}
            onClick={() => setTab("upload")}
          >
            Upload
          </button>
          <button
            className={tab === "chat" ? "tab tab--active" : "tab"}
            onClick={() => setTab("chat")}
          >
            Chat
          </button>
          <button
            className={tab === "contradictions" ? "tab tab--active" : "tab"}
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
        {error && <p className="error-banner">{error}</p>}
        <section className="library">
          <h2>Document Library</h2>
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
