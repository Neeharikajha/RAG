import type {
  Contradiction,
  ContradictionStatus,
} from "../types/contradiction";

interface Props {
  contradiction: Contradiction;
  onSetStatus: (id: string, status: ContradictionStatus) => void;
}

const SEVERITY_CLASS: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border border-red-200",
  warning: "bg-amber-100 text-amber-800 border border-amber-200",
  info: "bg-blue-100 text-blue-700 border border-blue-200",
};

export function ContradictionCard({ contradiction: c, onSetStatus }: Props) {
  const isResolved = c.status === "resolved";
  const isFalsePositive = c.status === "false_positive";

  return (
    <div
      className={`bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-5 shadow-xs transition-all ${
        isResolved
          ? "opacity-50"
          : isFalsePositive
          ? "opacity-40 border-dashed"
          : ""
      }`}
    >
      <div className="flex items-center gap-2.5 mb-3.5">
        <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${SEVERITY_CLASS[c.severity] || SEVERITY_CLASS.info}`}>
          {c.severity}
        </span>
        <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {c.type}
        </span>
        <span className="ml-auto text-xs font-mono font-semibold text-slate-500">
          similarity {(c.similarityScore * 100).toFixed(0)}%
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
        <div className="bg-white/80 border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <span className="block text-xs font-bold text-blue-700 mb-1.5">
            {c.statementA.fileName} — chunk {c.statementA.chunkIndex}
          </span>
          <p className="text-sm text-slate-800 m-0 leading-relaxed font-medium">{c.statementA.text}</p>
        </div>
        <div className="bg-white/80 border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <span className="block text-xs font-bold text-blue-700 mb-1.5">
            {c.statementB.fileName} — chunk {c.statementB.chunkIndex}
          </span>
          <p className="text-sm text-slate-800 m-0 leading-relaxed font-medium">{c.statementB.text}</p>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-3.5 font-medium">{c.explanation}</p>

      <div className="flex gap-2.5">
        {c.status !== "resolved" && (
          <button
            onClick={() => onSetStatus(c.id, "resolved")}
            className="px-3.5 py-1.5 bg-white/80 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-400 text-xs font-semibold text-slate-700 rounded-xl transition-all shadow-2xs"
          >
            Mark resolved
          </button>
        )}
        {c.status !== "false_positive" && (
          <button
            onClick={() => onSetStatus(c.id, "false_positive")}
            className="px-3.5 py-1.5 bg-white/80 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-400 text-xs font-semibold text-slate-700 rounded-xl transition-all shadow-2xs"
          >
            False positive
          </button>
        )}
        {c.status !== "unresolved" && (
          <button
            onClick={() => onSetStatus(c.id, "unresolved")}
            className="px-3.5 py-1.5 bg-white/80 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-400 text-xs font-semibold text-slate-700 rounded-xl transition-all shadow-2xs"
          >
            Reopen
          </button>
        )}
      </div>
    </div>
  );
}
