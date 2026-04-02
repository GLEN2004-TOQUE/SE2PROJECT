function IconMedal() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <circle cx="10" cy="12" r="6"/>
      <path d="M7 6L5 2h10l-2 4"/>
    </svg>
  );
}

export default function BadgeCard({ badges }) {
  return (
    <div className="sd-card sd-card-full" style={{ marginBottom: "1.2rem" }}>
      <div className="sd-card-header">
        <div className="sd-card-icon">
          <IconMedal />
        </div>
        <div>
          <div className="sd-card-title">My Badges</div>
          <div className="sd-card-sub">Earned by reaching point milestones</div>
        </div>
      </div>

      {badges.length === 0 ? (
        <div className="sd-empty">
          🏅 No badges earned yet — complete quizzes to unlock them
        </div>
      ) : (
        <div className="sd-badge-grid">
          {badges.map((b, i) => (
            <div key={b.id || i} className="sd-badge-item">
              <div className="sd-badge-icon">
                {b.icon_url ? (
                  <img src={b.icon_url} alt={b.name} style={{ width: 24, height: 24 }} />
                ) : "🏅"}
              </div>
              <div className="sd-badge-name">{b.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}