import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout, getLeaderboard } from "../services/api";

/* ─── Inline styles ─── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(0.92); opacity: .5; }
      50%  { transform: scale(1.03); opacity: .12; }
      100% { transform: scale(0.92); opacity: .5; }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes ticker {
      0%   { opacity: 0; transform: translateY(6px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    .sd-root {
      min-height: 100vh;
      background-color: #12080a;
      background-image:
        radial-gradient(ellipse 70% 50% at 5%  0%,   rgba(110,15,15,.6)  0%, transparent 65%),
        radial-gradient(ellipse 55% 40% at 95% 95%,  rgba(160,120,15,.2) 0%, transparent 60%),
        radial-gradient(ellipse 40% 35% at 50% 50%,  rgba(70,8,8,.45)    0%, transparent 75%);
      font-family: 'DM Sans', sans-serif;
      color: #f0e2c0;
      position: relative;
    }

    /* grain */
    .sd-root::before {
      content: '';
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E");
      opacity: .4;
    }

    .deco-ring {
      position: fixed; border-radius: 50%; pointer-events: none;
      border: 1px solid rgba(200,160,40,.1);
      animation: pulse-ring 8s ease-in-out infinite;
      width: 700px; height: 700px; top: -250px; right: -250px;
    }
    .deco-ring-2 {
      width: 400px; height: 400px; bottom: -140px; left: -140px; top: auto; right: auto;
      animation-delay: -4s;
    }

    /* ── Navbar ── */
    .sd-nav {
      position: sticky; top: 0; z-index: 30;
      background: rgba(18,8,10,.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(200,160,50,.1);
      display: flex; align-items: center; justify-content: space-between;
      padding: .8rem 2rem;
    }
    .sd-nav-brand {
      display: flex; align-items: center; gap: .75rem;
    }
    .sd-nav-icon {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #7a1515 0%, #4a0c0c 100%);
      box-shadow: 0 0 0 3px rgba(190,140,30,.18);
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
    }
    .sd-nav-icon img { width: 24px; height: 24px; object-fit: contain; }
    .sd-nav-title {
      font-family: 'Playfair Display', serif;
      font-size: .95rem; font-weight: 700;
      color: #f0e2c0; letter-spacing: .02em;
    }
    .sd-nav-right {
      display: flex; align-items: center; gap: 1rem;
    }
    .sd-nav-user {
      font-size: .78rem; color: rgba(200,170,100,.6);
      letter-spacing: .06em; text-transform: uppercase;
    }
    .sd-nav-user span { color: #c9a227; font-weight: 500; }
    .sd-nav-logout {
      padding: .4rem .9rem;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(200,160,50,.2);
      border-radius: 8px;
      color: rgba(200,170,100,.7);
      font-family: 'DM Sans', sans-serif;
      font-size: .75rem; letter-spacing: .06em; text-transform: uppercase;
      cursor: pointer;
      transition: background .2s, border-color .2s, color .2s;
    }
    .sd-nav-logout:hover {
      background: rgba(200,160,50,.1);
      border-color: rgba(200,160,50,.4);
      color: #c9a227;
    }

    /* ── Layout ── */
    .sd-body {
      position: relative; z-index: 1;
      max-width: 1100px; margin: 0 auto;
      padding: 2.5rem 1.5rem 4rem;
    }

    /* ── Welcome ── */
    .sd-welcome {
      margin-bottom: 2.2rem;
      animation: fadeUp .5s cubic-bezier(.22,1,.36,1) both;
    }
    .sd-welcome h1 {
      font-family: 'Playfair Display', serif;
      font-size: 2rem; font-weight: 700;
      color: #f5e6c8; line-height: 1.2;
      margin-bottom: .35rem;
    }
    .sd-welcome p {
      font-size: .85rem; font-weight: 300;
      color: rgba(200,170,100,.55);
      letter-spacing: .03em;
    }

    /* ── Stat bar ── */
    .sd-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
      animation: fadeUp .55s .08s cubic-bezier(.22,1,.36,1) both;
    }
    .sd-stat {
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(200,160,50,.12);
      border-radius: 14px;
      padding: 1.1rem 1.2rem;
      position: relative; overflow: hidden;
      transition: border-color .2s, background .2s;
    }
    .sd-stat:hover {
      border-color: rgba(200,160,50,.28);
      background: rgba(255,255,255,.065);
    }
    .sd-stat::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(200,160,50,.3), transparent);
    }
    .sd-stat-label {
      font-size: .65rem; letter-spacing: .12em; text-transform: uppercase;
      color: rgba(200,170,100,.45); margin-bottom: .5rem;
    }
    .sd-stat-value {
      font-size: 1.6rem; font-weight: 500; color: #f0e2c0;
      line-height: 1;
    }
    .sd-stat-sub {
      font-size: .72rem; color: rgba(200,170,100,.4);
      margin-top: .3rem;
    }
    .sd-stat-icon {
      position: absolute; right: 1rem; top: 50%;
      transform: translateY(-50%);
      font-size: 1.6rem; opacity: .12;
    }
    .sd-tier-badge {
      display: inline-flex; align-items: center; gap: .35rem;
      font-size: .72rem; letter-spacing: .06em; text-transform: uppercase;
      padding: .25rem .65rem; border-radius: 20px; margin-top: .4rem;
    }
    .sd-tier-badge.beginner  { background: rgba(100,100,120,.2);  color: rgba(180,180,210,.7); border: 1px solid rgba(100,100,120,.3); }
    .sd-tier-badge.intermediate { background: rgba(60,130,80,.15); color: rgba(100,210,130,.8); border: 1px solid rgba(60,130,80,.25); }
    .sd-tier-badge.advanced  { background: rgba(60,100,200,.15); color: rgba(100,160,255,.8); border: 1px solid rgba(60,100,200,.25); }
    .sd-tier-badge.master    { background: rgba(190,140,20,.15);  color: #c9a227;             border: 1px solid rgba(190,140,20,.3); }

    /* ── Two-col grid ── */
    .sd-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.2rem;
      margin-bottom: 1.2rem;
      animation: fadeUp .6s .15s cubic-bezier(.22,1,.36,1) both;
    }
    @media (max-width: 700px) {
      .sd-grid { grid-template-columns: 1fr; }
    }

    /* ── Card ── */
    .sd-card {
      background: rgba(255,255,255,.035);
      border: 1px solid rgba(200,160,50,.1);
      border-radius: 18px;
      padding: 1.4rem 1.5rem;
      position: relative; overflow: hidden;
    }
    .sd-card::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(200,160,50,.25), transparent);
    }
    .sd-card-header {
      display: flex; align-items: center; gap: .7rem;
      margin-bottom: 1.1rem;
    }
    .sd-card-icon {
      width: 32px; height: 32px; border-radius: 10px;
      background: linear-gradient(135deg, #7a1515, #4a0c0c);
      box-shadow: 0 0 0 3px rgba(190,140,30,.15);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .sd-card-icon svg { width: 15px; height: 15px; color: #c9a227; }
    .sd-card-title {
      font-size: .95rem; font-weight: 500; color: #f0e2c0;
    }
    .sd-card-sub {
      font-size: .72rem; color: rgba(200,170,100,.45);
      margin-top: .15rem;
    }

    /* ── Quiz input ── */
    .sd-quiz-input {
      width: 100%;
      padding: .7rem .95rem;
      background: rgba(255,255,255,.055);
      border: 1px solid rgba(200,160,50,.2);
      border-radius: 10px;
      color: #f5e6c8;
      font-family: 'DM Sans', sans-serif;
      font-size: .9rem; font-weight: 300;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
      margin-bottom: .75rem;
    }
    .sd-quiz-input::placeholder { color: rgba(200,170,100,.28); }
    .sd-quiz-input:focus {
      border-color: rgba(200,160,50,.5);
      box-shadow: 0 0 0 3px rgba(190,140,30,.12);
    }
    .sd-quiz-err {
      font-size: .75rem; color: #e07070;
      margin-bottom: .6rem; margin-top: -.3rem;
    }
    .sd-btn-primary {
      width: 100%;
      padding: .7rem 1rem;
      background: linear-gradient(135deg, #8b1a1a 0%, #6b1010 50%, #8b1a1a 100%);
      background-size: 200% auto;
      border: none; border-radius: 10px;
      color: #fff8e8;
      font-family: 'DM Sans', sans-serif;
      font-size: .85rem; font-weight: 500; letter-spacing: .04em;
      cursor: pointer;
      box-shadow: 0 4px 18px rgba(120,20,20,.5), 0 1px 0 rgba(255,200,80,.12) inset;
      transition: transform .15s, box-shadow .2s, opacity .2s;
    }
    .sd-btn-primary:hover {
      animation: shimmer .9s linear infinite;
      transform: translateY(-1px);
    }
    .sd-btn-primary:active { transform: translateY(0); }
    .sd-btn-primary:disabled { opacity: .5; cursor: not-allowed; }

    /* ── Leaderboard tabs ── */
    .sd-lb-tabs {
      display: flex; gap: .4rem; margin-bottom: .85rem;
    }
    .sd-lb-tab {
      padding: .3rem .75rem;
      border-radius: 7px;
      font-size: .72rem; letter-spacing: .06em; text-transform: uppercase;
      cursor: pointer;
      background: transparent;
      border: 1px solid rgba(200,160,50,.15);
      color: rgba(200,170,100,.45);
      font-family: 'DM Sans', sans-serif;
      transition: background .15s, color .15s, border-color .15s;
    }
    .sd-lb-tab:hover {
      border-color: rgba(200,160,50,.3);
      color: rgba(200,170,100,.7);
    }
    .sd-lb-tab.active {
      background: #c9a227;
      border-color: #c9a227;
      color: #1a0505;
    }
    .sd-lb-list { display: flex; flex-direction: column; gap: .45rem; }
    .sd-lb-row {
      display: flex; align-items: center; gap: .75rem;
      padding: .55rem .7rem;
      background: rgba(255,255,255,.03);
      border: 1px solid rgba(255,255,255,.06);
      border-radius: 10px;
      animation: ticker .3s ease both;
    }
    .sd-lb-rank {
      width: 22px; text-align: center;
      font-size: .75rem; font-weight: 600;
      color: rgba(200,170,100,.4);
      flex-shrink: 0;
    }
    .sd-lb-rank.top { color: #c9a227; }
    .sd-lb-name {
      flex: 1; font-size: .82rem; color: #f0e2c0;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .sd-lb-pts {
      font-size: .78rem; font-weight: 500; color: #c9a227;
      white-space: nowrap;
    }
    .sd-lb-tier {
      font-size: .62rem; letter-spacing: .06em; text-transform: uppercase;
      padding: .18rem .5rem; border-radius: 5px;
      background: rgba(200,160,40,.1); color: rgba(200,160,60,.6);
      border: 1px solid rgba(200,160,40,.15);
      flex-shrink: 0;
    }
    .sd-lb-empty, .sd-empty {
      text-align: center;
      padding: 2rem 1rem;
      font-size: .8rem; color: rgba(200,170,100,.3);
      letter-spacing: .04em;
    }
    .sd-lb-loading {
      display: flex; align-items: center; justify-content: center;
      padding: 1.5rem;
      gap: .6rem;
      font-size: .8rem; color: rgba(200,170,100,.35);
    }
    .sd-lb-spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(200,160,40,.2);
      border-top-color: rgba(200,160,40,.6);
      border-radius: 50%;
      animation: spin .7s linear infinite;
      flex-shrink: 0;
    }

    /* ── Full-width card ── */
    .sd-card-full {
      animation: fadeUp .65s .22s cubic-bezier(.22,1,.36,1) both;
    }

    /* ── Badges ── */
    .sd-badge-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: .75rem;
    }
    .sd-badge-item {
      display: flex; flex-direction: column; align-items: center;
      gap: .45rem; padding: .85rem .5rem;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(200,160,50,.12);
      border-radius: 12px;
      text-align: center;
      transition: border-color .2s, background .2s;
    }
    .sd-badge-item:hover {
      border-color: rgba(200,160,50,.28);
      background: rgba(255,255,255,.065);
    }
    .sd-badge-icon {
      width: 40px; height: 40px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem;
      background: linear-gradient(135deg, rgba(120,25,25,.6), rgba(70,10,10,.6));
      border: 1px solid rgba(200,160,50,.2);
    }
    .sd-badge-name {
      font-size: .65rem; color: rgba(200,170,100,.55);
      letter-spacing: .04em; line-height: 1.3;
    }

    /* ── Recent history ── */
    .sd-history-list { display: flex; flex-direction: column; gap: .5rem; }
    .sd-history-row {
      display: flex; align-items: center;
      padding: .6rem .8rem;
      background: rgba(255,255,255,.03);
      border: 1px solid rgba(255,255,255,.06);
      border-radius: 10px;
      gap: .8rem;
    }
    .sd-history-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #c9a227; flex-shrink: 0;
      box-shadow: 0 0 6px rgba(200,160,40,.5);
    }
    .sd-history-title { flex: 1; font-size: .82rem; color: #f0e2c0; }
    .sd-history-score {
      font-size: .78rem; color: #c9a227; font-weight: 500; white-space: nowrap;
    }
    .sd-history-date {
      font-size: .7rem; color: rgba(200,170,100,.3); white-space: nowrap;
    }

    /* ── Section label ── */
    .sd-section-label {
      font-size: .65rem; letter-spacing: .14em; text-transform: uppercase;
      color: rgba(200,160,50,.4); margin-bottom: .7rem;
      display: flex; align-items: center; gap: .5rem;
    }
    .sd-section-label::after {
      content: ''; flex: 1; height: 1px;
      background: rgba(200,160,50,.1);
    }

    /* streak flame */
    .sd-streak-flame {
      display: inline-flex; align-items: center; gap: .3rem;
    }
  `}</style>
);

/* ─── Icons ─── */
const IconPlay = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path d="M6.3 4.5l9 5.5-9 5.5V4.5z"/>
  </svg>
);
const IconStar = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2l2.4 4.9 5.4.8-3.9 3.8.9 5.3L10 14.3l-4.8 2.5.9-5.3L2.2 7.7l5.4-.8L10 2z"/>
  </svg>
);
const IconMedal = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <circle cx="10" cy="12" r="6"/>
    <path d="M7 6L5 2h10l-2 4"/>
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="10" cy="10" r="7"/>
    <path d="M10 6v4l2.5 2.5"/>
  </svg>
);

/* ─── Helpers ─── */
const tierClass = (tier = "") => {
  const t = tier.toLowerCase();
  if (t === "master")       return "master";
  if (t === "advanced")     return "advanced";
  if (t === "intermediate") return "intermediate";
  return "beginner";
};

const medalEmoji = (i) => {
  if (i === 0) return "🥇";
  if (i === 1) return "🥈";
  if (i === 2) return "🥉";
  return null;
};

/* ─── Main component ─── */
export default function StudentDashboard() {
  const navigate = useNavigate();

  // User state
  const [userData, setUserData]     = useState(null);

  // Leaderboard state
  const [lbType, setLbType]         = useState("overall");
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading]   = useState(false);

  // Take quiz state
  const [quizId, setQuizId]         = useState("");
  const [quizError, setQuizError]   = useState("");

  // Badges state — empty until backend route exposes them
  const [badges, setBadges]         = useState([]);

  // Recent results — empty until backend exposes student history
  const [results, setResults]       = useState([]);

  /* ── Auth check ── */
  useEffect(() => {
    const u = getUser();
    if (!u) { navigate("/"); return; }
    if (u.role !== "student") { navigate("/teacher"); return; }
    setUserData(u);
  }, [navigate]);

  /* ── Leaderboard fetch ── */
  const fetchLeaderboard = useCallback((type) => {
    setLbLoading(true);
    getLeaderboard(type)
      .then((data) => setLeaderboard(Array.isArray(data) ? data : []))
      .catch(() => setLeaderboard([]))
      .finally(() => setLbLoading(false));
  }, []);

  useEffect(() => {
    fetchLeaderboard(lbType);
  }, [lbType, fetchLeaderboard]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleStartQuiz = () => {
    const id = quizId.trim();
    if (!id) { setQuizError("Please enter a Quiz ID"); return; }
    setQuizError("");
    navigate(`/quiz/${id}`);
  };

  /* ── Loading screen ── */
  if (!userData) {
    return (
      <div style={{
        minHeight: "100vh", background: "#12080a",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 36, height: 36, border: "2px solid rgba(200,160,40,.2)",
            borderTopColor: "rgba(200,160,40,.7)", borderRadius: "50%",
            animation: "spin .7s linear infinite", margin: "0 auto 12px"
          }} />
          <p style={{ color: "rgba(200,170,100,.4)", fontSize: ".8rem", letterSpacing: ".06em" }}>
            LOADING DASHBOARD…
          </p>
        </div>
      </div>
    );
  }

  const points = userData.points ?? 0;
  const streak = userData.streak ?? 0;
  const tier   = userData.tier   ?? "Beginner";

  return (
    <>
      <GlobalStyles />
      <div className="sd-root">
        <div className="deco-ring" />
        <div className="deco-ring deco-ring-2" />

        {/* ── Navbar ── */}
        <nav className="sd-nav">
          <div className="sd-nav-brand">
            <div className="sd-nav-icon">
              <img src="/image/logo.png" alt="logo" onError={(e) => { e.target.style.display = "none"; }} />
            </div>
            <span className="sd-nav-title">QuizSystem</span>
          </div>
          <div className="sd-nav-right">
            <span className="sd-nav-user">
              <span>{userData.full_name || "Student"}</span>
            </span>
            <button className="sd-nav-logout" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </nav>

        {/* ── Body ── */}
        <div className="sd-body">

          {/* ── Welcome ── */}
          <div className="sd-welcome">
            <h1>Welcome back, {(userData.full_name || "Student").split(" ")[0]} 👋</h1>
            <p>Ready to challenge yourself today?</p>
          </div>

          {/* ── Stat bar ── */}
          <div className="sd-stats">
            {/* Points */}
            <div className="sd-stat">
              <div className="sd-stat-label">Total Points</div>
              <div className="sd-stat-value">{points.toLocaleString()}</div>
              <div className="sd-stat-sub">XP earned overall</div>
              <div className="sd-stat-icon">⭐</div>
            </div>

            {/* Streak */}
            <div className="sd-stat">
              <div className="sd-stat-label">Current Streak</div>
              <div className="sd-stat-value sd-streak-flame">
                {streak > 0 ? "🔥" : "❄️"} {streak}
              </div>
              <div className="sd-stat-sub">
                {streak === 0 ? "Take a quiz to start" :
                 streak === 1 ? "Keep it going!" :
                 `${streak} days in a row`}
              </div>
              <div className="sd-stat-icon">🔥</div>
            </div>

            {/* Tier */}
            <div className="sd-stat">
              <div className="sd-stat-label">Current Tier</div>
              <div className="sd-stat-value" style={{ fontSize: "1.1rem", paddingTop: ".2rem" }}>
                <span className={`sd-tier-badge ${tierClass(tier)}`}>
                  {tier === "Master"       ? "👑" :
                   tier === "Advanced"     ? "💎" :
                   tier === "Intermediate" ? "🎯" : "🌱"} {tier}
                </span>
              </div>
              <div className="sd-stat-sub">
                {tier === "Master"       ? "Top performer" :
                 tier === "Advanced"     ? "500 pts to Master" :
                 tier === "Intermediate" ? "200 pts to Advanced" :
                 "Keep earning points!"}
              </div>
            </div>
          </div>

          {/* ── Two-col grid: Take a Quiz + Leaderboard ── */}
          <div className="sd-grid">

            {/* Take a Quiz */}
            <div className="sd-card">
              <div className="sd-card-header">
                <div className="sd-card-icon">
                  <IconPlay />
                </div>
                <div>
                  <div className="sd-card-title">Take a Quiz</div>
                  <div className="sd-card-sub">Enter your quiz ID to begin</div>
                </div>
              </div>
              <input
                className="sd-quiz-input"
                type="text"
                placeholder="Paste Quiz ID here…"
                value={quizId}
                onChange={(e) => { setQuizId(e.target.value); setQuizError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleStartQuiz()}
              />
              {quizError && <p className="sd-quiz-err">{quizError}</p>}
              <button className="sd-btn-primary" onClick={handleStartQuiz}>
                Start Quiz
              </button>
            </div>

            {/* Leaderboard */}
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
                        {u.id === userData.id && (
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
          </div>

          {/* ── Badges (empty until backend route is wired) ── */}
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

          {/* ── Recent Quiz Results (empty until student history endpoint is exposed) ── */}
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

        </div>{/* end sd-body */}
      </div>
    </>
  );
}