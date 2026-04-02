function IconStar() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2l2.4 4.9 5.4.8-3.9 3.8.9 5.3L10 14.3l-4.8 2.5.9-5.3L2.2 7.7l5.4-.8L10 2z"/>
    </svg>
  );
}

const medalEmoji = (i) => {
  if (i === 0) return "🥇";
  if (i === 1) return "🥈";
  if (i === 2) return "🥉";
  return null;
};

export default function LeaderboardCard({ lbType, setLbType, leaderboard, lbLoading, currentUserId }) {
  return (
    <div className="sd-card">
      <div className="sd-card-header" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
          <div className="sd-card-icon">
            <IconStar />
          </div>
          <div>
            <div className="sd-card-title">Leaderboard</div>
            <div className="sd-card-sub">Top performers</div>
          </div>
        </div>
        <div className="sd-lb-tabs">
          {["daily", "weekly", "overall"].map((t) => (
            <button
              key={t}
              className={`sd-lb-tab ${lbType === t ? "active" : ""}`}
              onClick={() => setLbType(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {lbLoading ? (
        <div className="sd-lb-loading">
          <div className="sd-lb-spinner" />
          Loading…
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="sd-lb-empty">No data available</div>
      ) : (
        <div className="sd-lb-list">
          {leaderboard.slice(0, 7).map((u, i) => (
            <div key={u.id || i} className="sd-lb-row">
              <div className={`sd-lb-rank ${i < 3 ? "top" : ""}`}>
                {medalEmoji(i) ?? `#${i + 1}`}
              </div>
              <div className="sd-lb-name">
                {u.full_name || `User ${i + 1}`}
                {u.id === currentUserId && (
                  <span style={{ fontSize: ".65rem", color: "#c9a227", marginLeft: ".4rem" }}>
                    (you)
                  </span>
                )}
              </div>
              <div className="sd-lb-tier">{u.tier || "—"}</div>
              <div className="sd-lb-pts">{(u.points ?? 0).toLocaleString()} pts</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}