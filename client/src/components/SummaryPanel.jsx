export default function SummaryPanel({ subject, score, total, bestStreak, missedQuestions, onRestart }) {
  return (
    <div className="panel">
      <h2>Session complete</h2>
      <div className="big-score">
        {score}
        <span> / {total} — {subject}</span>
      </div>

      {bestStreak > 1 && (
        <div className="best-streak">
          Best streak: {bestStreak} in a row
        </div>
      )}

      <div className="weak">
        {missedQuestions.length === 0 ? (
          "Perfect score — no weak areas this round."
        ) : (
          <>
            Review these:
            <br />
            {missedQuestions.map((q, i) => (
              <span key={i}>
                • {q}
                <br />
              </span>
            ))}
          </>
        )}
      </div>

      <div className="row-actions">
        <button className="btn" onClick={onRestart}>
          Try another subject
        </button>
      </div>
    </div>
  );
}
