import { useState, useRef } from "react";

interface UploadingFile {
  name: string;
  progress: number;
}

interface Props {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
  uploadingFiles?: UploadingFile[];
}

const ACCEPTED = ".pdf,.docx,.md,.txt";

export function UploadDropzone({ onUpload, isUploading, uploadingFiles }: Props) {
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
        {isUploading ? "Uploading..." : "Drop documents here or click to browse"}
      </p>
      <p className="dropzone__hint">PDF, DOCX, MD, TXT</p>
      {uploadingFiles && uploadingFiles.length > 0 && (
        <div className="upload-progress-list" onClick={(e) => e.stopPropagation()}>
          {uploadingFiles.map((file, idx) => (
            <div key={idx} className="upload-progress-item">
              <div className="upload-progress-info">
                <span className="upload-progress-name">{file.name}</span>
                <span className="upload-progress-pct">{file.progress}%</span>
              </div>
              <div className="upload-progress-bar">
                <div
                  className="upload-progress-fill"
                  style={{ width: `${file.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

