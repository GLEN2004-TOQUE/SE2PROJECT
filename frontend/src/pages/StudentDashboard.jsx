import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { getUser, logout, getLeaderboard } from "../services/api";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const apiFetch = async (path) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Backend error:", data);
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
};

/* ─── Styles (unchanged) ─────────────────────────────────────────────────── */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

    @keyframes fadeUp {
      from { opacity:0; transform:translateY(16px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes slideDown {
      from { opacity:0; transform:translateY(-10px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes shimmer {
      0%   { background-position:-400px 0; }
      100% { background-position: 400px 0; }
    }
    @keyframes badge-pop {
      0%   { transform:scale(.7); opacity:0; }
      70%  { transform:scale(1.08); }
      100% { transform:scale(1); opacity:1; }
    }
    @keyframes glow-pulse {
      0%,100% { box-shadow:0 0 0 0 rgba(16,185,129,.2); }
      50%      { box-shadow:0 0 0 8px rgba(16,185,129,.0); }
    }

    .sd-root {
      min-height:100vh;
      background:#080c12;
      background-image:
        radial-gradient(ellipse 60% 45% at 90% 10%, rgba(16,185,129,.1) 0%, transparent 65%),
        radial-gradient(ellipse 50% 40% at 10% 90%, rgba(139,92,246,.08) 0%, transparent 65%);
      font-family:'Syne', sans-serif;
      color:#e2e8f0;
    }

    .sd-topbar {
      display:flex; align-items:center; justify-content:space-between;
      padding:0 2.5rem; height:62px;
      background:rgba(8,12,18,.9); backdrop-filter:blur(14px);
      border-bottom:1px solid rgba(255,255,255,.07);
      position:sticky; top:0; z-index:30;
      animation:slideDown .4s ease both;
    }
    .sd-logo {
      display:flex; align-items:center; gap:.65rem;
      font-size:1rem; font-weight:800; color:#fff;
    }
    .sd-logo-icon {
      width:30px; height:30px; border-radius:8px;
      background:linear-gradient(135deg,#065f46,#6d28d9);
      display:flex; align-items:center; justify-content:center;
    }
    .sd-logo-icon svg { width:16px; height:16px; color:#fff; }
    .sd-topbar-right { display:flex; align-items:center; gap:.9rem; }
    .sd-chip {
      font-family:'DM Mono',monospace; font-size:.67rem;
      padding:.2rem .65rem; border-radius:999px;
      background:rgba(16,185,129,.12); border:1px solid rgba(16,185,129,.3);
      color:#34d399; letter-spacing:.06em;
    }
    .sd-logout {
      padding:.36rem .85rem; border-radius:8px;
      border:1px solid rgba(255,255,255,.1);
      background:rgba(255,255,255,.05);
      color:rgba(255,255,255,.45); font-family:'Syne',sans-serif;
      font-size:.78rem; cursor:pointer; transition:all .15s;
    }
    .sd-logout:hover { background:rgba(255,255,255,.1); color:#fff; }

    .sd-body { max-width:1080px; margin:0 auto; padding:2.5rem 2rem; }

    .sd-welcome { margin-bottom:2.5rem; animation:fadeUp .5s ease both; }
    .sd-welcome-tag {
      display:inline-flex; align-items:center; gap:.4rem;
      font-size:.72rem; letter-spacing:.1em; text-transform:uppercase;
      color:rgba(52,211,153,.6); margin-bottom:.6rem;
    }
    .sd-welcome-tag span { display:inline-block; width:6px; height:6px; border-radius:50%; background:#10b981; }
    .sd-name { font-size:2rem; font-weight:800; color:#fff; letter-spacing:-.03em; }
    .sd-sub  { font-size:.88rem; color:rgba(255,255,255,.35); margin-top:.35rem; }

    .sd-teacher-card {
      position:relative; overflow:hidden;
      background:linear-gradient(135deg, rgba(16,185,129,.1) 0%, rgba(6,78,59,.15) 100%);
      border:1px solid rgba(16,185,129,.2);
      border-radius:18px; padding:1.5rem 1.75rem;
      margin-bottom:2rem;
      animation:fadeUp .5s .05s ease both;
    }
    .sd-teacher-card::before {
      content:'';
      position:absolute; inset:0;
      background:radial-gradient(ellipse 60% 80% at 0% 50%, rgba(16,185,129,.08) 0%, transparent 70%);
      pointer-events:none;
    }
    .sd-teacher-label {
      font-size:.7rem; letter-spacing:.12em; text-transform:uppercase;
      color:rgba(52,211,153,.6); margin-bottom:.9rem;
      display:flex; align-items:center; gap:.45rem;
    }
    .sd-teacher-label-dot { width:6px; height:6px; border-radius:50%; background:#10b981; animation:glow-pulse 2s infinite; }
    .sd-teacher-inner { display:flex; align-items:center; gap:1rem; }
    .sd-teacher-avatar {
      width:52px; height:52px; border-radius:14px;
      background:rgba(30,58,138,.3); border:1px solid rgba(147,197,253,.15);
      display:flex; align-items:center; justify-content:center;
      font-size:1rem; font-weight:800; color:#93c5fd; flex-shrink:0;
      animation:badge-pop .5s .2s ease both;
    }
    .sd-teacher-name  { font-size:1.1rem; font-weight:800; color:#fff; }
    .sd-teacher-email { font-size:.75rem; color:rgba(255,255,255,.35); font-family:'DM Mono',monospace; margin-top:.15rem; }
    .sd-teacher-tier  {
      margin-left:auto;
      font-size:.75rem; font-weight:700; padding:.25rem .7rem;
      border-radius:8px; background:rgba(139,92,246,.12); color:#a78bfa;
      border:1px solid rgba(139,92,246,.2);
    }
    .sd-no-teacher {
      display:flex; align-items:center; gap:.85rem;
      padding:1.5rem 1.75rem;
      background:rgba(255,255,255,.03);
      border:1px dashed rgba(255,255,255,.1);
      border-radius:18px; margin-bottom:2rem;
      animation:fadeUp .5s .05s ease both;
    }
    .sd-no-teacher-icon {
      width:42px; height:42px; border-radius:12px;
      background:rgba(255,255,255,.06);
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
    }
    .sd-no-teacher-icon svg { width:20px; height:20px; color:rgba(255,255,255,.25); }
    .sd-no-teacher-text { font-size:.84rem; color:rgba(255,255,255,.3); }

    .sd-stats {
      display:grid; grid-template-columns:repeat(3,1fr); gap:1rem;
      margin-bottom:2rem; animation:fadeUp .5s .1s ease both;
    }
    .sd-stat {
      background:rgba(255,255,255,.04);
      border:1px solid rgba(255,255,255,.07);
      border-radius:14px; padding:1.2rem 1.4rem;
    }
    .sd-stat-label { font-size:.7rem; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.28); margin-bottom:.45rem; }
    .sd-stat-value { font-size:1.9rem; font-weight:800; color:#fff; }
    .sd-stat-hint  { font-size:.72rem; color:rgba(255,255,255,.22); margin-top:.3rem; }

    .sd-quiz-entry {
      background:rgba(255,255,255,.04);
      border:1px solid rgba(255,255,255,.08);
      border-radius:16px; padding:1.4rem 1.6rem;
      margin-bottom:2rem;
      animation:fadeUp .5s .15s ease both;
    }
    .sd-quiz-entry h3 { font-size:.88rem; font-weight:700; color:#fff; margin-bottom:.9rem; }
    .sd-quiz-row { display:flex; gap:.75rem; }
    .sd-quiz-input {
      flex:1; padding:.65rem 1rem;
      background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12);
      border-radius:10px; color:#fff;
      font-family:'Syne',sans-serif; font-size:.84rem;
      outline:none; transition:border-color .2s;
    }
    .sd-quiz-input:focus { border-color:rgba(16,185,129,.4); }
    .sd-quiz-input::placeholder { color:rgba(255,255,255,.25); }
    .sd-quiz-btn {
      padding:.65rem 1.4rem; border-radius:10px; border:none;
      background:linear-gradient(135deg,#10b981,#065f46);
      color:#fff; font-family:'Syne',sans-serif; font-size:.84rem; font-weight:700;
      cursor:pointer; transition:opacity .15s; white-space:nowrap;
    }
    .sd-quiz-btn:hover { opacity:.85; }
    .sd-quiz-error { font-size:.76rem; color:#f87171; margin-top:.5rem; }

    .sd-lb { animation:fadeUp .5s .2s ease both; }
    .sd-lb-header {
      display:flex; align-items:center; justify-content:space-between;
      margin-bottom:1rem;
    }
    .sd-lb-title { font-size:1rem; font-weight:800; color:#fff; }
    .sd-lb-tabs { display:flex; gap:.35rem; }
    .sd-lb-tab {
      padding:.25rem .65rem; border-radius:7px; cursor:pointer;
      font-size:.74rem; font-weight:600;
      border:1px solid rgba(255,255,255,.08);
      background:rgba(255,255,255,.04);
      color:rgba(255,255,255,.3); transition:all .15s;
    }
    .sd-lb-tab.active { background:rgba(16,185,129,.15); border-color:rgba(16,185,129,.3); color:#34d399; }
    .sd-lb-list {
      background:rgba(255,255,255,.03);
      border:1px solid rgba(255,255,255,.07);
      border-radius:14px; overflow:hidden;
    }
    .sd-lb-row {
      display:flex; align-items:center; gap:.9rem;
      padding:.85rem 1.25rem;
      border-bottom:1px solid rgba(255,255,255,.04);
      transition:background .12s;
    }
    .sd-lb-row:last-child { border-bottom:none; }
    .sd-lb-row:hover { background:rgba(255,255,255,.025); }
    .sd-lb-rank {
      font-family:'DM Mono',monospace; font-size:.82rem;
      font-weight:700; color:rgba(255,255,255,.25);
      width:28px; text-align:center; flex-shrink:0;
    }
    .sd-lb-rank.top1 { color:#fbbf24; }
    .sd-lb-rank.top2 { color:#9ca3af; }
    .sd-lb-rank.top3 { color:#b45309; }
    .sd-lb-avatar {
      width:32px; height:32px; border-radius:9px;
      background:rgba(16,185,129,.15);
      display:flex; align-items:center; justify-content:center;
      font-size:.72rem; font-weight:800; color:#34d399; flex-shrink:0;
    }
    .sd-lb-name  { flex:1; font-size:.83rem; font-weight:600; color:rgba(255,255,255,.75); }
    .sd-lb-pts   { font-family:'DM Mono',monospace; font-size:.8rem; font-weight:700; color:#fff; }
    .sd-lb-tier  { font-size:.7rem; color:rgba(255,255,255,.25); margin-left:.35rem; }

    .sd-lb-empty { padding:2.5rem; text-align:center; font-size:.82rem; color:rgba(255,255,255,.2); }

    .skeleton {
      height:14px; border-radius:5px;
      background:linear-gradient(90deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 100%);
      background-size:800px 100%; animation:shimmer 1.4s infinite;
    }

    @media(max-width:700px){
      .sd-stats { grid-template-columns:1fr 1fr; }
      .sd-body  { padding:1.5rem 1rem; }
    }
  `}</style>
);

const initials = (name = "") =>
  name.split(" ").slice(0,2).map(n=>n[0]).join("").toUpperCase() || "?";

const rankClass = (i) => i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : "";
const rankEmoji = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1;

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [myTeacher, setMyTeacher] = useState(undefined); 
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbType, setLbType] = useState("overall");
  const [lbLoading, setLbLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [teacherQuizzes, setTeacherQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [quizError, setQuizError] = useState("");

  // Load assigned quizzes
  const loadQuizzes = async () => {
    setLoadingQuizzes(true);
    setQuizError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/api/quiz/my-quizzes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to load quizzes: ${res.status} ${errorText}`);
      }
      const data = await res.json();
      // Backend returns an array directly (see getQuizzesForStudent)
      if (Array.isArray(data)) {
        setTeacherQuizzes(data);
      } else {
        console.warn("Unexpected quizzes response:", data);
        setTeacherQuizzes([]);
      }
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
      setQuizError(err.message);
      setTeacherQuizzes([]);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    const user = getUser();
    if (!user) { navigate("/"); return; }
    if (user.role !== "student") { navigate("/teacher"); return; }
    setUserData(user);

    // Fetch teacher assignment
    apiFetch("/api/admin/my-teacher")
      .then(setMyTeacher)
      .catch(() => setMyTeacher(null))
      .finally(() => setPageLoading(false));

    // Fetch quizzes
    loadQuizzes();
  }, [navigate]);

  useEffect(() => {
    setLbLoading(true);
    getLeaderboard(lbType)
      .then(data => setLeaderboard(Array.isArray(data) ? data : []))
      .catch(() => setLeaderboard([]))
      .finally(() => setLbLoading(false));
  }, [lbType]);

  const displayName = userData?.full_name || userData?.name || "Student";

  return (
    <>
      <Styles />
      <div className="sd-root">
        <header className="sd-topbar">
          <div className="sd-logo">
            <div className="sd-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.07 5.82 22 7 14.14 2 9.27l6.91-1.01z"/>
              </svg>
            </div>
            QuizSystem
          </div>
          <div className="sd-topbar-right">
            <span className="sd-chip">STUDENT</span>
            <button className="sd-logout" onClick={() => { logout(); navigate("/"); }}>Sign out</button>
          </div>
        </header>

        <div className="sd-body">
          {/* Welcome */}
          <div className="sd-welcome">
            <div className="sd-welcome-tag"><span /> Student Dashboard</div>
            <h1 className="sd-name">Hello, {displayName.split(" ")[0]}! 👋</h1>
            <p className="sd-sub">Track your progress and take quizzes assigned by your teacher</p>
          </div>

          {/* My Teacher */}
          {pageLoading ? (
            <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:18, padding:"1.5rem 1.75rem", marginBottom:"2rem" }}>
              <div className="skeleton" style={{width:100,marginBottom:".9rem"}} />
              <div style={{display:"flex",gap:"1rem",alignItems:"center"}}>
                <div style={{width:52,height:52,borderRadius:14,background:"rgba(255,255,255,.05)"}} />
                <div style={{flex:1}}>
                  <div className="skeleton" style={{width:"45%",marginBottom:".4rem"}} />
                  <div className="skeleton" style={{width:"65%"}} />
                </div>
              </div>
            </div>
          ) : myTeacher ? (
            <div className="sd-teacher-card">
              <div className="sd-teacher-label">
                <span className="sd-teacher-label-dot" />
                Your Assigned Teacher
              </div>
              <div className="sd-teacher-inner">
                <div className="sd-teacher-avatar">{initials(myTeacher.full_name)}</div>
                <div>
                  <div className="sd-teacher-name">{myTeacher.full_name}</div>
                  <div className="sd-teacher-email">{myTeacher.email}</div>
                </div>
                {myTeacher.tier && <div className="sd-teacher-tier">{myTeacher.tier}</div>}
              </div>
            </div>
          ) : (
            <div className="sd-no-teacher">
              <div className="sd-no-teacher-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
              <p className="sd-no-teacher-text">No teacher assigned yet. Your admin will assign a teacher to you soon.</p>
            </div>
          )}

          {/* Stats */}
          <div className="sd-stats">
            <div className="sd-stat">
              <p className="sd-stat-label">Your Points</p>
              <p className="sd-stat-value">{userData?.points ?? 0}</p>
              <p className="sd-stat-hint">{userData?.tier || "Beginner"}</p>
            </div>
            <div className="sd-stat">
              <p className="sd-stat-label">Streak</p>
              <p className="sd-stat-value">🔥 {userData?.streak ?? 0}</p>
              <p className="sd-stat-hint">consecutive days</p>
            </div>
            <div className="sd-stat">
              <p className="sd-stat-label">Status</p>
              <p className="sd-stat-value" style={{fontSize:"1.3rem",paddingTop:".3rem"}}>
                {myTeacher ? "✅ Enrolled" : "⏳ Pending"}
              </p>
              <p className="sd-stat-hint">{myTeacher ? "assigned to teacher" : "awaiting assignment"}</p>
            </div>
          </div>

          {/* Quizzes from Teacher */}
          <div className="sd-quiz-entry">
            <h3>Quizzes from Your Teacher</h3>
            {loadingQuizzes ? (
              <div style={{ textAlign: "center", padding: "1rem", color: "rgba(255,255,255,.4)" }}>
                Loading quizzes...
              </div>
            ) : quizError ? (
              <div style={{ color: "#f87171", textAlign: "center", padding: "1rem" }}>
                Error: {quizError}
              </div>
            ) : teacherQuizzes.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,.4)" }}>
                No quizzes available yet. Your teacher will assign quizzes here.
              </p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" }}>
                {teacherQuizzes.map(quiz => (
                  <div 
                    key={quiz.id} 
                    style={{
                      background: "rgba(255,255,255,.05)",
                      border: "1px solid rgba(255,255,255,.1)",
                      borderRadius: "12px",
                      padding: "1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: "600", marginBottom: "0.25rem" }}>{quiz.title}</p>
                      <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,.4)" }}>
                        {quiz.status === "active" ? "🟢 Available now" : 
                         quiz.status === "upcoming" ? "⏳ Upcoming" : "🔒 Ended"}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/quiz/${quiz.id}`)}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#C9A227",
                        border: "none",
                        borderRadius: "8px",
                        color: "#000",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      Take Quiz
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="sd-lb">
            <div className="sd-lb-header">
              <h2 className="sd-lb-title">Leaderboard</h2>
              <div className="sd-lb-tabs">
                {["overall","daily","weekly"].map(t => (
                  <button
                    key={t}
                    className={`sd-lb-tab ${lbType===t?"active":""}`}
                    onClick={() => setLbType(t)}
                  >
                    {t.charAt(0).toUpperCase()+t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="sd-lb-list">
              {lbLoading ? (
                [1,2,3,4,5].map(i => (
                  <div key={i} className="sd-lb-row">
                    <div className="skeleton" style={{width:24}} />
                    <div style={{width:32,height:32,borderRadius:9,background:"rgba(255,255,255,.05)"}} />
                    <div style={{flex:1}}><div className="skeleton" style={{width:"55%"}} /></div>
                    <div className="skeleton" style={{width:50}} />
                  </div>
                ))
              ) : leaderboard.length === 0 ? (
                <div className="sd-lb-empty">No data for this period</div>
              ) : (
                leaderboard.slice(0,10).map((u,i) => (
                  <div key={u.id || i} className="sd-lb-row">
                    <span className={`sd-lb-rank ${rankClass(i)}`}>{rankEmoji(i)}</span>
                    <div className="sd-lb-avatar">{initials(u.full_name || u.id)}</div>
                    <span className="sd-lb-name">{u.full_name || u.id}</span>
                    <span className="sd-lb-pts">{u.points ?? 0}</span>
                    <span className="sd-lb-tier">{u.tier}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}