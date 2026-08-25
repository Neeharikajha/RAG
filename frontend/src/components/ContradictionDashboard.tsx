import { useContradictions } from "../hooks/useContradictions";
import { ContradictionCard } from "./ContradictionCard";

export function ContradictionDashboard() {
  const { contradictions, isScanning, error, runScan, setStatus } =
    useContradictions();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-700 text-sm font-medium">
          {contradictions.length === 0
            ? "No contradictions detected yet."
            : `Found ${contradictions.length} contradiction(s) across your documents.`}
        </p>
        <button
          onClick={runScan}
          disabled={isScanning}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 transition-all"
        >
          {isScanning ? "Scanning…" : "Scan for contradictions"}
        </button>
      </div>

      {error && (
        <p className="p-3.5 rounded-xl bg-red-500/15 border border-red-200 text-red-700 text-sm font-medium backdrop-blur-md">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-4.5">
        {contradictions.map((c) => (
          <ContradictionCard
            key={c.id}
            contradiction={c}
            onSetStatus={setStatus}
          />
        ))}
      </div>
    </div>
  );
}
