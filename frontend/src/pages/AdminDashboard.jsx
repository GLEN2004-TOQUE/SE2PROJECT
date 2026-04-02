import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/api";

/* ─────────────────────────────────────────────
   Styles
───────────────────────────────────────────── */
const S = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
    @keyframes spin     { to { transform: rotate(360deg); } }
    @keyframes pulse-bg { 0%,100% { opacity:.55; } 50% { opacity:.3; } }
    @keyframes shimmer  { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
    @keyframes countUp  { from { opacity:0; transform:scale(.85); } to { opacity:1; transform:scale(1); } }

    .adm-root {
      min-height: 100vh;
      background-color: #100808;
      background-image:
        radial-gradient(ellipse 70% 50% at 15% 0%,   rgba(110,18,18,.6) 0%, transparent 65%),
        radial-gradient(ellipse 50% 40% at 85% 100%,  rgba(160,120,20,.22) 0%, transparent 60%),
        radial-gradient(ellipse 35% 35% at 50% 50%,   rgba(60,8,8,.5)  0%, transparent 75%);
      font-family: 'DM Sans', sans-serif;
      color: #f0e6d3;
    }

    /* grain */
    .adm-root::before {
      content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.055'/%3E%3C/svg%3E");
      opacity:.5;
    }

    /* ── Sidebar ── */
    .adm-sidebar {
      position: fixed; top:0; left:0; bottom:0; width:220px;
      background: rgba(20,6,6,.85);
      backdrop-filter: blur(20px);
      border-right: 1px solid rgba(200,160,50,.1);
      display: flex; flex-direction: column;
      z-index: 50;
      padding: 1.5rem 0;
    }
    .adm-logo {
      display: flex; align-items: center; gap: .7rem;
      padding: 0 1.4rem 1.8rem;
      border-bottom: 1px solid rgba(200,160,50,.1);
      margin-bottom: 1.2rem;
    }
    .adm-logo-icon {
      width:38px; height:38px; border-radius:10px;
      background: linear-gradient(135deg,#8b1a1a,#5a0c0c);
      display:flex; align-items:center; justify-content:center;
      font-size:1.1rem;
      box-shadow: 0 4px 12px rgba(0,0,0,.4);
    }
    .adm-logo-text { font-family:'Playfair Display',serif; font-size:1rem; color:#e8c060; font-weight:700; }
    .adm-logo-sub  { font-size:.65rem; color:rgba(200,160,60,.45); letter-spacing:.08em; text-transform:uppercase; }

    .adm-nav-label {
      font-size:.62rem; letter-spacing:.12em; text-transform:uppercase;
      color:rgba(200,160,60,.35); padding:.3rem 1.4rem .6rem; font-weight:600;
    }
    .adm-nav-btn {
      display:flex; align-items:center; gap:.75rem;
      padding:.65rem 1.4rem; margin:0 .6rem .15rem;
      border-radius:10px; cursor:pointer; border:none;
      background:transparent; color:rgba(240,220,180,.5);
      font-family:'DM Sans',sans-serif; font-size:.85rem; font-weight:500;
      transition: all .18s; text-align:left; width:calc(100% - 1.2rem);
    }
    .adm-nav-btn:hover  { background:rgba(200,160,50,.1); color:rgba(240,220,180,.9); }
    .adm-nav-btn.active { background:rgba(200,160,50,.18); color:#e8c060; border:1px solid rgba(200,160,50,.25); }
    .adm-nav-btn .icon  { font-size:1rem; width:20px; text-align:center; }

    .adm-sidebar-footer {
      margin-top:auto; padding: 1rem 1rem 0;
      border-top:1px solid rgba(200,160,50,.1);
    }
    .adm-signout {
      display:flex; align-items:center; gap:.6rem;
      width:100%; padding:.6rem 1rem; border-radius:8px; border:none;
      background:rgba(220,60,60,.1); color:rgba(220,120,120,.7);
      font-family:'DM Sans',sans-serif; font-size:.82rem; cursor:pointer;
      transition:all .18s;
    }
    .adm-signout:hover { background:rgba(220,60,60,.2); color:#e87070; }

    /* ── Main ── */
    .adm-main {
      margin-left: 220px;
      min-height: 100vh;
      padding: 2rem 2.2rem;
      position: relative; z-index: 1;
    }

    /* ── Top bar ── */
    .adm-topbar {
      display:flex; align-items:center; justify-content:space-between;
      margin-bottom: 2rem;
      animation: fadeUp .5s ease both;
    }
    .adm-page-title {
      font-family:'Playfair Display',serif;
      font-size:1.6rem; font-weight:700; color:#f0e6d3;
    }
    .adm-page-sub { font-size:.8rem; color:rgba(200,170,100,.5); margin-top:.2rem; }
    .adm-time {
      font-family:'JetBrains Mono',monospace; font-size:.75rem;
      color:rgba(200,160,50,.45); letter-spacing:.06em;
    }

    /* ── Stat cards ── */
    .adm-stats {
      display:grid; grid-template-columns:repeat(4,1fr); gap:1rem;
      margin-bottom:2rem;
      animation: fadeUp .5s .1s ease both;
    }
    .adm-stat {
      background:rgba(255,255,255,.04);
      border:1px solid rgba(200,160,50,.12);
      border-radius:16px; padding:1.2rem 1.4rem;
      position:relative; overflow:hidden;
      transition:border-color .2s, transform .2s;
    }
    .adm-stat:hover { border-color:rgba(200,160,50,.3); transform:translateY(-2px); }
    .adm-stat::before {
      content:''; position:absolute; inset:0;
      background:linear-gradient(135deg,rgba(200,160,50,.05) 0%,transparent 60%);
      pointer-events:none;
    }
    .adm-stat-label { font-size:.7rem; letter-spacing:.1em; text-transform:uppercase; color:rgba(200,170,100,.45); margin-bottom:.6rem; }
    .adm-stat-value { font-family:'Playfair Display',serif; font-size:2rem; font-weight:700; color:#f0e6d3; animation:countUp .5s ease both; }
    .adm-stat-icon  { position:absolute; right:1.2rem; top:1.2rem; font-size:1.4rem; opacity:.25; }
    .adm-stat-delta { font-size:.72rem; color:rgba(120,200,120,.7); margin-top:.3rem; }

    /* ── Tab bar ── */
    .adm-tabs {
      display:flex; gap:.5rem; margin-bottom:1.5rem;
      animation: fadeUp .5s .15s ease both;
    }
    .adm-tab {
      padding:.5rem 1.2rem; border-radius:8px; border:1px solid transparent;
      background:transparent; color:rgba(200,170,100,.45);
      font-family:'DM Sans',sans-serif; font-size:.82rem; font-weight:500;
      cursor:pointer; transition:all .18s; letter-spacing:.02em;
    }
    .adm-tab:hover  { background:rgba(200,160,50,.1); color:rgba(200,170,100,.75); }
    .adm-tab.active { background:rgba(200,160,50,.18); color:#e8c060; border-color:rgba(200,160,50,.3); }

    /* ── Panel ── */
    .adm-panel {
      background:rgba(255,255,255,.03);
      border:1px solid rgba(200,160,50,.1);
      border-radius:18px; overflow:hidden;
      animation: fadeUp .5s .2s ease both;
    }
    .adm-panel-header {
      display:flex; align-items:center; justify-content:space-between;
      padding:1.1rem 1.5rem;
      border-bottom:1px solid rgba(200,160,50,.1);
      background:rgba(255,255,255,.025);
    }
    .adm-panel-title { font-size:.85rem; font-weight:600; color:rgba(220,190,120,.8); letter-spacing:.04em; text-transform:uppercase; }
    .adm-panel-count { font-size:.75rem; color:rgba(200,160,60,.4); font-family:'JetBrains Mono',monospace; }

    /* search */
    .adm-search {
      padding:.48rem .9rem .48rem 2.2rem; background:rgba(255,255,255,.07);
      border:1px solid rgba(200,160,50,.2); border-radius:8px;
      color:#f0e6d3; font-family:'DM Sans',sans-serif; font-size:.8rem; outline:none;
      transition:border-color .2s;
    }
    .adm-search::placeholder { color:rgba(200,160,60,.3); }
    .adm-search:focus { border-color:rgba(200,160,50,.45); }
    .adm-search-wrap { position:relative; }
    .adm-search-icon { position:absolute; left:.65rem; top:50%; transform:translateY(-50%); color:rgba(200,160,60,.35); font-size:.75rem; pointer-events:none; }

    /* ── Table ── */
    .adm-table { width:100%; border-collapse:collapse; }
    .adm-table th {
      padding:.7rem 1.5rem; text-align:left;
      font-size:.65rem; letter-spacing:.1em; text-transform:uppercase;
      color:rgba(200,160,60,.4); font-weight:600;
      border-bottom:1px solid rgba(200,160,50,.08);
    }
    .adm-table td {
      padding:.85rem 1.5rem;
      border-bottom:1px solid rgba(255,255,255,.04);
      font-size:.82rem; color:rgba(220,200,170,.75);
      vertical-align:middle;
    }
    .adm-table tr:last-child td { border-bottom:none; }
    .adm-table tr:hover td { background:rgba(200,160,50,.04); }

    /* avatar */
    .adm-avatar {
      width:34px; height:34px; border-radius:50%;
      display:inline-flex; align-items:center; justify-content:center;
      font-size:.8rem; font-weight:600; flex-shrink:0;
    }

    /* tier badge */
    .tier-pill {
      display:inline-flex; align-items:center; gap:.35rem;
      padding:.25rem .65rem; border-radius:6px; font-size:.68rem; font-weight:600;
      letter-spacing:.04em; text-transform:uppercase;
    }
    .tier-Master       { background:rgba(180,140,255,.15); color:#c8a8ff; border:1px solid rgba(180,140,255,.25); }
    .tier-Advanced     { background:rgba(200,160,50,.15);  color:#e8c060; border:1px solid rgba(200,160,50,.25); }
    .tier-Intermediate { background:rgba(100,180,220,.15); color:#80c8e8; border:1px solid rgba(100,180,220,.25); }
    .tier-Beginner     { background:rgba(200,200,200,.1);  color:#aaa;    border:1px solid rgba(200,200,200,.15); }

    /* status */
    .status-dot {
      display:inline-flex; align-items:center; gap:.4rem; font-size:.75rem;
    }
    .status-dot::before {
      content:''; width:7px; height:7px; border-radius:50%;
    }
    .status-active::before   { background:#4ade80; box-shadow:0 0 6px rgba(74,222,128,.5); }
    .status-inactive::before { background:#555; }

    /* toggle button */
    .adm-toggle {
      padding:.3rem .75rem; border-radius:6px; border:1px solid; cursor:pointer;
      font-family:'DM Sans',sans-serif; font-size:.7rem; font-weight:500;
      transition:all .18s; letter-spacing:.03em;
    }
    .adm-toggle-deactivate { border-color:rgba(220,80,80,.3); color:rgba(220,80,80,.7); background:rgba(220,80,80,.08); }
    .adm-toggle-deactivate:hover { background:rgba(220,80,80,.18); color:#e87070; }
    .adm-toggle-activate   { border-color:rgba(80,200,120,.3); color:rgba(80,200,120,.7); background:rgba(80,200,120,.08); }
    .adm-toggle-activate:hover { background:rgba(80,200,120,.18); color:#60d890; }

    /* badges row */
    .badge-chip {
      display:inline-flex; align-items:center; gap:.3rem;
      padding:.2rem .55rem; border-radius:5px; font-size:.65rem;
      background:rgba(200,160,50,.12); border:1px solid rgba(200,160,50,.2);
      color:rgba(220,185,80,.8); white-space:nowrap;
    }

    /* ── Leaderboard ── */
    .lb-row {
      display:grid; align-items:center;
      grid-template-columns: 48px 1fr 120px 120px 120px auto;
      gap:.5rem; padding:.85rem 1.5rem;
      border-bottom:1px solid rgba(255,255,255,.04);
      transition:background .15s;
    }
    .lb-row:last-child { border-bottom:none; }
    .lb-row:hover { background:rgba(200,160,50,.04); }
    .lb-rank { font-family:'JetBrains Mono',monospace; font-size:.85rem; font-weight:500; text-align:center; }
    .rank-1 { color:#FFD700; font-size:1.1rem; }
    .rank-2 { color:#C0C0C0; }
    .rank-3 { color:#CD7F32; }
    .rank-n { color:rgba(200,170,100,.35); }

    .lb-header {
      display:grid; align-items:center;
      grid-template-columns: 48px 1fr 120px 120px 120px auto;
      gap:.5rem; padding:.65rem 1.5rem;
      border-bottom:1px solid rgba(200,160,50,.1);
      font-size:.65rem; letter-spacing:.1em; text-transform:uppercase;
      color:rgba(200,160,60,.4); font-weight:600;
      background:rgba(255,255,255,.025);
    }

    .points-bar-wrap { width:100%; background:rgba(255,255,255,.06); border-radius:4px; height:5px; overflow:hidden; }
    .points-bar      { height:100%; border-radius:4px; background:linear-gradient(90deg,#8b1a1a,#c8a040); transition:width .8s ease; }

    /* ── Empty / loading states ── */
    .adm-empty {
      padding: 3rem 1.5rem; text-align:center;
      color:rgba(200,170,100,.3); font-size:.85rem;
    }
    .adm-spinner {
      width:24px; height:24px; border:2px solid rgba(200,160,50,.2);
      border-top-color:#c8a040; border-radius:50%;
      animation:spin .7s linear infinite; margin:0 auto 1rem;
    }

    /* ── Responsive ── */
    @media (max-width:1100px) {
      .adm-stats { grid-template-columns:repeat(2,1fr); }
    }
    @media (max-width:768px) {
      .adm-sidebar { display:none; }
      .adm-main    { margin-left:0; padding:1.2rem; }
      .adm-stats   { grid-template-columns:repeat(2,1fr); }
      .lb-row, .lb-header { grid-template-columns: 40px 1fr 80px 80px; }
      .lb-row > *:nth-child(5), .lb-row > *:nth-child(6),
      .lb-header > *:nth-child(5), .lb-header > *:nth-child(6) { display:none; }
    }
  `}</style>
);

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const apiFetch = async (path) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || "Request failed");
  return res.json();
};

const apiPatch = async (path, body) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Request failed");
  return res.json();
};

const initials = (name = "") =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";

const avatarColor = (name = "") => {
  const colors = ["#7a1515,#4a0c0c", "#1a5a7a,#0c2a4a", "#1a7a3a,#0c4a1a",
    "#7a5a1a,#4a3a0c", "#5a1a7a,#2a0c4a", "#7a3a1a,#4a1a0c"];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

const tierLabel = (tier) => {
  const map = { Master: "🏆 Master", Advanced: "⭐ Advanced", Intermediate: "📘 Intermediate", Beginner: "🌱 Beginner" };
  return map[tier] || tier;
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function StatCard({ label, value, icon, delta }) {
  return (
    <div className="adm-stat">
      <div className="adm-stat-icon">{icon}</div>
      <div className="adm-stat-label">{label}</div>
      <div className="adm-stat-value">{value ?? "—"}</div>
      {delta && <div className="adm-stat-delta">{delta}</div>}
    </div>
  );
}

function Avatar({ name, size = 34 }) {
  const grad = avatarColor(name);
  return (
    <div
      className="adm-avatar"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg,#${grad.split(",")[0].slice(1)},#${grad.split(",")[1].slice(1)})`,
        fontSize: size * 0.3,
      }}
    >
      {initials(name)}
    </div>
  );
}

function TierPill({ tier }) {
  return <span className={`tier-pill tier-${tier}`}>{tierLabel(tier)}</span>;
}

function BadgeChips({ badges = [] }) {
  if (!badges.length) return <span style={{ color: "rgba(200,170,100,.25)", fontSize: ".72rem" }}>None yet</span>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: ".35rem" }}>
      {badges.slice(0, 3).map((b, i) => (
        <span className="badge-chip" key={i}>
          {b?.icon_url ? <img src={b.icon_url} alt="" style={{ width: 12, height: 12 }} /> : "🎖"}
          {b?.name}
        </span>
      ))}
      {badges.length > 3 && (
        <span className="badge-chip" style={{ opacity: .6 }}>+{badges.length - 3}</span>
      )}
    </div>
  );
}

/* ── Users Table ── */
function UsersTable({ users, loading, onToggleStatus }) {
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="adm-panel">
      <div className="adm-panel-header">
        <span className="adm-panel-title">
          {users[0]?.role === "teacher" ? "Teachers" : "Students"}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: ".8rem" }}>
          <span className="adm-panel-count">{filtered.length} records</span>
          <div className="adm-search-wrap">
            <span className="adm-search-icon">🔍</span>
            <input
              className="adm-search"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="adm-empty"><div className="adm-spinner" /><p>Loading…</p></div>
      ) : filtered.length === 0 ? (
        <div className="adm-empty">No records found.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Tier</th>
                <th>Points</th>
                <th>Streak</th>
                <th>Badges</th>
                <th>Joined</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                      <Avatar name={u.full_name} />
                      <div>
                        <div style={{ color: "#f0e6d3", fontWeight: 500, fontSize: ".85rem" }}>{u.full_name}</div>
                        <div style={{ color: "rgba(200,170,100,.4)", fontSize: ".72rem" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><TierPill tier={u.tier || "Beginner"} /></td>
                  <td>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "#e8c060", fontWeight: 500 }}>
                      {(u.points ?? 0).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: u.streak > 0 ? "#fb923c" : "rgba(200,170,100,.3)" }}>
                      {u.streak > 0 ? `🔥 ${u.streak}d` : "—"}
                    </span>
                  </td>
                  <td><BadgeChips badges={u.badges || []} /></td>
                  <td style={{ color: "rgba(200,170,100,.4)", fontSize: ".75rem" }}>{fmtDate(u.created_at)}</td>
                  <td>
                    <span className={`status-dot ${u.status ? "status-active" : "status-inactive"}`}>
                      {u.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`adm-toggle ${u.status ? "adm-toggle-deactivate" : "adm-toggle-activate"}`}
                      onClick={() => onToggleStatus(u.id, !u.status)}
                    >
                      {u.status ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Leaderboard Panel ── */
function LeaderboardPanel({ data, loading }) {
  const maxPts = data[0]?.points || 1;
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="adm-panel">
      <div className="adm-panel-header">
        <span className="adm-panel-title">Leaderboard — All Time</span>
        <span className="adm-panel-count">{data.length} students ranked</span>
      </div>

      {loading ? (
        <div className="adm-empty"><div className="adm-spinner" /><p>Loading…</p></div>
      ) : data.length === 0 ? (
        <div className="adm-empty">No data yet.</div>
      ) : (
        <>
          <div className="lb-header">
            <div>#</div>
            <div>Student</div>
            <div>Points</div>
            <div>Progress</div>
            <div>Tier</div>
            <div>Badges</div>
          </div>
          {data.map((u, i) => (
            <div className="lb-row" key={u.id}>
              {/* Rank */}
              <div className={`lb-rank ${i < 3 ? `rank-${i + 1}` : "rank-n"}`}>
                {i < 3 ? medals[i] : `#${i + 1}`}
              </div>

              {/* User */}
              <div style={{ display: "flex", alignItems: "center", gap: ".65rem" }}>
                <Avatar name={u.full_name} size={32} />
                <div>
                  <div style={{ color: "#f0e6d3", fontWeight: 500, fontSize: ".83rem" }}>{u.full_name}</div>
                  <div style={{ color: "rgba(200,170,100,.35)", fontSize: ".68rem" }}>
                    {u.streak > 0 ? `🔥 ${u.streak}-day streak` : "No streak"}
                  </div>
                </div>
              </div>

              {/* Points */}
              <div style={{ fontFamily: "'JetBrains Mono',monospace", color: "#e8c060", fontWeight: 600, fontSize: ".9rem" }}>
                {(u.points ?? 0).toLocaleString()}
                <span style={{ color: "rgba(200,160,50,.35)", fontSize: ".65rem", fontWeight: 400 }}> pts</span>
              </div>

              {/* Progress bar */}
              <div style={{ paddingRight: ".5rem" }}>
                <div className="points-bar-wrap">
                  <div className="points-bar" style={{ width: `${Math.round((u.points / maxPts) * 100)}%` }} />
                </div>
                <div style={{ fontSize: ".62rem", color: "rgba(200,160,50,.35)", marginTop: ".25rem" }}>
                  {Math.round((u.points / maxPts) * 100)}% of top
                </div>
              </div>

              {/* Tier */}
              <div><TierPill tier={u.tier || "Beginner"} /></div>

              {/* Badges */}
              <div><BadgeChips badges={u.badges || []} /></div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Dashboard
───────────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("students");
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingLb, setLoadingLb] = useState(true);
  const [now, setNow] = useState(new Date());

  // Auth guard
  useEffect(() => {
    const u = getUser();
    if (!u) { navigate("/"); return; }
    if (u.role !== "admin") {
      navigate(u.role === "teacher" ? "/teacher" : "/student");
    }
  }, [navigate]);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch stats
  useEffect(() => {
    apiFetch("/api/admin/stats")
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, []);

  // Fetch students
  const fetchStudents = useCallback(() => {
    setLoadingStudents(true);
    apiFetch("/api/admin/users?role=student")
      .then(setStudents)
      .catch(console.error)
      .finally(() => setLoadingStudents(false));
  }, []);

  // Fetch teachers
  const fetchTeachers = useCallback(() => {
    setLoadingTeachers(true);
    apiFetch("/api/admin/users?role=teacher")
      .then(setTeachers)
      .catch(console.error)
      .finally(() => setLoadingTeachers(false));
  }, []);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(() => {
    setLoadingLb(true);
    apiFetch("/api/admin/leaderboard")
      .then(setLeaderboard)
      .catch(console.error)
      .finally(() => setLoadingLb(false));
  }, []);

  useEffect(() => { fetchStudents(); fetchTeachers(); fetchLeaderboard(); }, [fetchStudents, fetchTeachers, fetchLeaderboard]);

  // Toggle user status
  const handleToggleStatus = async (id, newStatus) => {
    try {
      await apiPatch(`/api/admin/users/${id}/status`, { status: newStatus });
      setStudents((prev) => prev.map((u) => u.id === id ? { ...u, status: newStatus } : u));
      setTeachers((prev) => prev.map((u) => u.id === id ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const tabs = [
    { id: "students",    label: "Students",    icon: "🎓" },
    { id: "teachers",    label: "Teachers",    icon: "📚" },
    { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
  ];

  return (
    <>
      <S />
      <div className="adm-root">
        {/* ── Sidebar ── */}
        <aside className="adm-sidebar">
          <div className="adm-logo">
            <div className="adm-logo-icon">🎓</div>
            <div>
              <div className="adm-logo-text">SchoolQuiz</div>
              <div className="adm-logo-sub">Admin Panel</div>
            </div>
          </div>

          <div className="adm-nav-label">Navigation</div>
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`adm-nav-btn ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span className="icon">{t.icon}</span>
              {t.label}
            </button>
          ))}

          <div className="adm-sidebar-footer">
            <button className="adm-signout" onClick={() => { logout(); navigate("/"); }}>
              <span>🚪</span> Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="adm-main">
          {/* Top bar */}
          <div className="adm-topbar">
            <div>
              <div className="adm-page-title">Admin Dashboard</div>
              <div className="adm-page-sub">Manage students, teachers & performance</div>
            </div>
            <div className="adm-time">
              {now.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
          </div>

          {/* Stat Cards */}
          <div className="adm-stats">
            <StatCard label="Total Students"     icon="🎓" value={loadingStats ? "…" : stats?.totalStudents ?? 0}      delta="Enrolled learners" />
            <StatCard label="Total Teachers"     icon="📚" value={loadingStats ? "…" : stats?.totalTeachers ?? 0}      delta="Active educators" />
            <StatCard label="Total Quizzes"      icon="📝" value={loadingStats ? "…" : stats?.totalQuizzes ?? 0}       delta="Published assessments" />
            <StatCard label="Badges Awarded"     icon="🏅" value={loadingStats ? "…" : stats?.totalBadgesAwarded ?? 0} delta="Achievements earned" />
          </div>

          {/* Tab bar */}
          <div className="adm-tabs">
            {tabs.map((t) => (
              <button key={t.id} className={`adm-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Panels */}
          {tab === "students" && (
            <UsersTable users={students} loading={loadingStudents} onToggleStatus={handleToggleStatus} />
          )}
          {tab === "teachers" && (
            <UsersTable users={teachers} loading={loadingTeachers} onToggleStatus={handleToggleStatus} />
          )}
          {tab === "leaderboard" && (
            <LeaderboardPanel data={leaderboard} loading={loadingLb} />
          )}
        </main>
      </div>
    </>
  );
}