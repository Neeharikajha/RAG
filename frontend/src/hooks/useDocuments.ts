import { useEffect, useState, useCallback } from "react";
import type { DocumentRecord } from "../types/document";
import { listDocuments, uploadDocuments } from "../lib/api";

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
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
    try {
      const uploaded = await uploadDocuments(files);
      setDocuments((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  }, []);
  return { documents, isUploading, error, upload };
}
