function IconClock() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="10" cy="10" r="7"/>
      <path d="M10 6v4l2.5 2.5"/>
    </svg>
  );
}

export default function RecentResultsCard({ results }) {
  return (
    <div className="sd-card sd-card-full">
      <div className="sd-card-header">
        <div className="sd-card-icon">
          <IconClock />
        </div>
        <div>
          <div className="sd-card-title">Recent Results</div>
          <div className="sd-card-sub">Your latest quiz submissions</div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="sd-empty">
          📋 No quiz results yet — start a quiz to see your history here
        </div>
      ) : (
        <div className="sd-history-list">
          {results.map((r, i) => (
            <div key={r.id || i} className="sd-history-row">
              <div className="sd-history-dot" />
              <div className="sd-history-title">{r.quiz_title || `Quiz #${r.quiz_id}`}</div>
              <div className="sd-history-score">
                {r.score}/{r.total} ({Math.round((r.score / r.total) * 100)}%)
              </div>
              <div className="sd-history-date">
                {r.submitted_at
                  ? new Date(r.submitted_at).toLocaleDateString()
                  : "—"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}