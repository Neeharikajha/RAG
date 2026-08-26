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

const ALLOWED_EXTENSIONS = ["pdf", "docx", "md", "txt"];
const ACCEPTED_STRING = ".pdf,.docx,.md,.txt";
const MAX_FILE_SIZE_MB = 20;

export function UploadDropzone({ onUpload, isUploading, uploadingFiles }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndUpload = (fileList: FileList | null) => {
    setValidationError(null);
    if (!fileList?.length) return;

    const files = Array.from(fileList);
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        errors.push(`"${file.name}" has an unsupported format (.${ext || "unknown"}). Allowed: PDF, DOCX, MD, TXT.`);
      } else if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        errors.push(`"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setValidationError(errors.join(" "));
    }

    if (validFiles.length > 0) {
      onUpload(validFiles);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 backdrop-blur-md shadow-xs ${
          isUploading ? "pointer-events-none opacity-90" : ""
        } ${
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
          validateAndUpload(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_STRING}
          hidden
          onChange={(e) => validateAndUpload(e.target.files)}
        />

        <div className="flex justify-center mb-3">
          {isUploading ? (
            <div className="w-12 h-12 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-600 animate-spin">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : (
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
          )}
        </div>

        <p className="text-base font-bold text-slate-800 mb-1">
          {isUploading ? "Processing & Embedding Documents..." : "Drop documents here or click to browse"}
        </p>
        <p className="text-xs font-mono font-medium text-slate-500">
          Supported: PDF, DOCX, MD, TXT (Max {MAX_FILE_SIZE_MB}MB)
        </p>

        {uploadingFiles && uploadingFiles.length > 0 && (
          <div className="mt-5 flex flex-col gap-2.5 text-left" onClick={(e) => e.stopPropagation()}>
            {uploadingFiles.map((file, idx) => (
              <div key={idx} className="bg-white/90 border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-semibold text-slate-800 truncate max-w-[75%]">{file.name}</span>
                  <span className="font-mono text-xs font-bold text-blue-600">{file.progress}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {validationError && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/15 border border-amber-300 text-amber-900 text-sm font-medium backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>{validationError}</span>
          </div>
          <button
            onClick={() => setValidationError(null)}
            className="text-amber-700 hover:text-amber-900 font-bold ml-3 text-lg"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
