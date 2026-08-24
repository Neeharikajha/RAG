import { useContradictions } from "../hooks/useContradictions";
import { ContradictionCard } from "./ContradictionCard";

export function ContradictionDashboard() {
  const { contradictions, isScanning, error, runScan, setStatus } =
    useContradictions();

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <p className="dashboard__summary">
          {contradictions.length === 0
            ? "No contradictions detected yet."
            : `Found ${contradictions.length} contradiction(s) across your documents.`}
        </p>
        <button onClick={runScan} disabled={isScanning}>
          {isScanning ? "Scanning…" : "Scan for contradictions"}
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      <div className="dashboard__list">
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
