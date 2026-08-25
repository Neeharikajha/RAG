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
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 backdrop-blur-md shadow-xs ${
        isDragging
          ? "border-blue-500 bg-blue-50/60 shadow-lg shadow-blue-500/10"
          : "border-blue-400/50 bg-white/40 hover:bg-white/60 hover:border-blue-500"
      }`}
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

      <div className="flex justify-center mb-3">
        <div className="w-12 h-12 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-600">
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
      </div>

      <p className="text-base font-bold text-slate-800 mb-1">
        {isUploading ? "Uploading..." : "Drop documents here or click to browse"}
      </p>
      <p className="text-xs font-mono font-medium text-slate-500">PDF, DOCX, MD, TXT</p>
      {uploadingFiles && uploadingFiles.length > 0 && (
        <div className="mt-4 flex flex-col gap-2.5 text-left" onClick={(e) => e.stopPropagation()}>
          {uploadingFiles.map((file, idx) => (
            <div key={idx} className="bg-white/80 border border-white/90 rounded-xl p-3.5 shadow-xs">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="font-semibold text-slate-800 truncate max-w-[80%]">{file.name}</span>
                <span className="font-mono text-xs font-bold text-blue-600">{file.progress}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-200"
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
