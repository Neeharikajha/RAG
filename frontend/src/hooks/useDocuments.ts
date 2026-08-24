import { useEffect, useState, useCallback } from "react";
import type { DocumentRecord } from "../types/document";
import { listDocuments, uploadDocuments, deleteDocument } from "../lib/api";

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; progress: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setDocuments(await listDocuments());
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upload = useCallback(async (files: File[]) => {
    setIsUploading(true);
    setError(null);
    setUploadingFiles(files.map((f) => ({ name: f.name, progress: 0 })));
    try {
      const uploaded = await uploadDocuments(files, (percent) => {
        setUploadingFiles(files.map((f) => ({ name: f.name, progress: percent })));
      });
      setDocuments((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsUploading(false);
      setUploadingFiles([]);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  return { documents, isUploading, uploadingFiles, error, upload, remove };
}

