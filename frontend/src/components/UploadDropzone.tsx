import { useState, useRef } from "react";

interface Props {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
}

const ACCEPTED = ".pdf,.docx,.md,.txt";

export function UploadDropzone({ onUpload, isUploading }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (fileList?.length) onUpload(Array.from(fileList));
  };

  return (
    <div
      className={`dropzone ${isDragging ? "dropzone--active" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="dropzone__title">
        {isUploading ? "Ingesting…" : "Drop documents here or click to browse"}
      </p>
      <p className="dropzone__hint">PDF, DOCX, MD, TXT</p>
    </div>
  );
}
