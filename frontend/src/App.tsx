import { useDocuments } from "./hooks/useDocuments";
import { UploadDropzone } from "./components/UploadDropzone";
import { DocumentList } from "./components/DocumentList";
import { useState } from "react";
import { ChatWindow } from "./components/ChatWindow";

export default function App() {
  const [tab, setTab] = useState<"upload" | "chat">("upload");
  const { documents, isUploading, error, upload } = useDocuments();

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
        </nav>
      </header>

      {tab === "upload" && (
        <>
          <UploadDropzone onUpload={upload} isUploading={isUploading} />
          {error && <p className="error-banner">{error}</p>}
          <section className="library">
            <h2>Document Library</h2>
            <DocumentList documents={documents} />
          </section>
        </>
      )}

      {tab === "chat" && <ChatWindow />}
    </div>
  );
}
