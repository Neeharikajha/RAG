import type {
  Contradiction,
  ContradictionStatus,
} from "../types/contradiction";

interface Props {
  contradiction: Contradiction;
  onSetStatus: (id: string, status: ContradictionStatus) => void;
}

export function ContradictionCard({ contradiction: c, onSetStatus }: Props) {
  return (
    <div className={`contra-card contra-card--${c.status}`}>
      <div className="contra-card__header">
        <span className={`badge badge--${c.severity}`}>{c.severity}</span>
        <span className="badge badge--type">{c.type}</span>
        <span className="contra-card__score">
          similarity {(c.similarityScore * 100).toFixed(0)}%
        </span>
      </div>

      <div className="contra-card__statements">
        <div className="statement">
          <span className="statement__source">
            {c.statementA.fileName} — chunk {c.statementA.chunkIndex}
          </span>
          <p>{c.statementA.text}</p>
        </div>
        <div className="statement">
          <span className="statement__source">
            {c.statementB.fileName} — chunk {c.statementB.chunkIndex}
          </span>
          <p>{c.statementB.text}</p>
        </div>
      </div>

      <p className="contra-card__explanation">{c.explanation}</p>

      <div className="contra-card__actions">
        {c.status !== "resolved" && (
          <button onClick={() => onSetStatus(c.id, "resolved")}>
            Mark resolved
          </button>
        )}
        {c.status !== "false_positive" && (
          <button onClick={() => onSetStatus(c.id, "false_positive")}>
            False positive
          </button>
        )}
        {c.status !== "unresolved" && (
          <button onClick={() => onSetStatus(c.id, "unresolved")}>
            Reopen
          </button>
        )}
      </div>
    </div>
  );
}
