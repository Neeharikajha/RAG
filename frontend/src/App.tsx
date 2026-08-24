import { useDocuments } from "./hooks/useDocuments";
import { UploadDropzone } from "./components/UploadDropzone";
import { DocumentList } from "./components/DocumentList";

export default function App() {
  const { documents, isUploading, error, upload } = useDocuments();

  return (
    <div className="page">
      <header className="page__header">
        <h1>Document Intelligence</h1>
        <p>Upload documents to make them searchable and queryable.</p>
      </header>

      <UploadDropzone onUpload={upload} isUploading={isUploading} />
      {error && <p className="error-banner">{error}</p>}

      <section className="library">
        <h2>Document Library</h2>
        <DocumentList documents={documents} />
      </section>
    </div>
  );
}
