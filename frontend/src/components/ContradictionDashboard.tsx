import { useContradictions } from "../hooks/useContradictions";
import { ContradictionCard } from "./ContradictionCard";

export function ContradictionDashboard() {
  const { contradictions, isScanning, error, runScan, setStatus } =
    useContradictions();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 border border-white/70 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
        <div>
          <h3 className="text-base font-bold text-slate-900">Cross-Document Contradiction Analysis</h3>
          <p className="text-slate-600 text-xs sm:text-sm font-medium mt-0.5">
            {contradictions.length === 0
              ? "No contradictions detected across uploaded documents."
              : `Found ${contradictions.length} potential conflict(s) across your documents.`}
          </p>
        </div>
        <button
          onClick={runScan}
          disabled={isScanning}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isScanning && (
            <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          <span>{isScanning ? "Scanning Chunks…" : "Scan for Contradictions"}</span>
        </button>
      </div>

      {isScanning && (
        <div className="p-8 rounded-2xl bg-white/50 border border-white/80 backdrop-blur-md text-center space-y-3 animate-pulse">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-800">
            Analyzing cross-document vector pairs and generating LLM judgments...
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-200 text-red-700 text-sm font-medium backdrop-blur-md flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {!isScanning && (
        <div className="flex flex-col gap-4">
          {contradictions.map((c) => (
            <ContradictionCard
              key={c.id}
              contradiction={c}
              onSetStatus={setStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
