import { useEffect, useState, useCallback } from "react";
import type {
  Contradiction,
  ContradictionStatus,
} from "../types/contradiction";
import {
  listContradictions,
  scanContradictions,
  updateContradictionStatus,
} from "../lib/api";

export function useContradictions() {
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listContradictions()
      .then(setContradictions)
      .catch((err) => setError(err.message));
  }, []);

  const runScan = useCallback(async () => {
    setIsScanning(true);
    setError(null);
    try {
      setContradictions(await scanContradictions());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const setStatus = useCallback(
    async (id: string, status: ContradictionStatus) => {
      // optimistic update — flip the UI immediately, roll back on failure
      setContradictions((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c)),
      );
      try {
        await updateContradictionStatus(id, status);
      } catch (err) {
        setError((err as Error).message);
        listContradictions().then(setContradictions); // resync with server truth
      }
    },
    [],
  );

  return { contradictions, isScanning, error, runScan, setStatus };
}
