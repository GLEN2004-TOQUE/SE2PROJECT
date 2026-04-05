import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { getUser, logout, getMyProfile } from "../services/api";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000" || "https://backend-7lik.onrender.com";

const apiFetch = async (path) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Request failed");
  return data;
};

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

    @keyframes fadeUp   { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
    @keyframes slideDown{ from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);} }
    @keyframes shimmer  { 0%{background-position:-400px 0;}100%{background-position:400px 0;} }
    @keyframes badge-pop{ 0%{transform:scale(.7);opacity:0;}70%{transform:scale(1.08);}100%{transform:scale(1);opacity:1;} }
    @keyframes glow-pulse{ 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.2);}50%{box-shadow:0 0 0 8px rgba(16,185,129,0);} }
    @keyframes spin     { to{transform:rotate(360deg);} }

    .sd-root {
      min-height:100vh;
      background:#080c12;
      background-image:
        radial-gradient(ellipse 60% 45% at 90% 10%, rgba(16,185,129,.1) 0%, transparent 65%),
        radial-gradient(ellipse 50% 40% at 10% 90%, rgba(139,92,246,.08) 0%, transparent 65%);
      font-family:'Syne', sans-serif; color:#e2e8f0;
    }

    .sd-topbar {
      display:flex; align-items:center; justify-content:space-between;
      padding:0 2.5rem; height:62px;
      background:rgba(8,12,18,.9); backdrop-filter:blur(14px);
      border-bottom:1px solid rgba(255,255,255,.07);
      position:sticky; top:0; z-index:30;
      animation:slideDown .4s ease both;
    }
    .sd-logo { display:flex; align-items:center; gap:.65rem; font-size:1rem; font-weight:800; color:#fff; }
    .sd-logo-icon { width:30px; height:30px; border-radius:8px; background:linear-gradient(135deg,#065f46,#6d28d9); display:flex; align-items:center; justify-content:center; }
    .sd-logo-icon svg { width:16px; height:16px; color:#fff; }
    .sd-topbar-right { display:flex; align-items:center; gap:.9rem; }
    .sd-user-chip {
      display:flex; align-items:center; gap:.55rem;
      font-size:.8rem; font-weight:700;
      padding:.28rem .85rem .28rem .5rem; border-radius:999px;
      background:rgba(16,185,129,.12); border:1px solid rgba(16,185,129,.3); color:#34d399;
    }
    .sd-user-chip-avatar {
      width:24px; height:24px; border-radius:50%;
      background:linear-gradient(135deg,#10b981,#065f46);
      display:flex; align-items:center; justify-content:center;
      font-size:.65rem; font-weight:800; color:#fff; flex-shrink:0;
    }
    .sd-logout { padding:.36rem .85rem; border-radius:8px; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.05); color:rgba(255,255,255,.45); font-family:'Syne',sans-serif; font-size:.78rem; cursor:pointer; transition:all .15s; }
    .sd-logout:hover { background:rgba(255,255,255,.1); color:#fff; }

    .sd-body { max-width:1080px; margin:0 auto; padding:2.5rem 2rem; }

    .sd-welcome { margin-bottom:2rem; animation:fadeUp .5s ease both; }
    .sd-welcome-tag { display:inline-flex; align-items:center; gap:.4rem; font-size:.72rem; letter-spacing:.1em; text-transform:uppercase; color:rgba(52,211,153,.6); margin-bottom:.6rem; }
    .sd-welcome-tag span { display:inline-block; width:6px; height:6px; border-radius:50%; background:#10b981; }
    .sd-name { font-size:2rem; font-weight:800; color:#fff; letter-spacing:-.03em; }
    .sd-sub  { font-size:.88rem; color:rgba(255,255,255,.35); margin-top:.35rem; }

    /* Section + Course badge */
    .sd-section-row {
      display:flex; align-items:center; gap:.55rem;
      margin-top:.6rem; flex-wrap:wrap;
    }
    .sd-badge {
      display:inline-flex; align-items:center; gap:.3rem;
      padding:.22rem .7rem; border-radius:7px;
      font-size:.72rem; font-weight:700;
    }
    .sd-badge-course  { background:rgba(99,102,241,.12); color:#a5b4fc; border:1px solid rgba(99,102,241,.2); }
    .sd-badge-section { background:rgba(16,185,129,.1); color:#34d399; border:1px solid rgba(16,185,129,.2); }

    /* Teacher card */
    .sd-teacher-card {
      position:relative; overflow:hidden;
      background:linear-gradient(135deg, rgba(16,185,129,.1) 0%, rgba(6,78,59,.15) 100%);
      border:1px solid rgba(16,185,129,.2); border-radius:18px;
      padding:1.5rem 1.75rem; margin-bottom:2rem;
      animation:fadeUp .5s .05s ease both;
    }
    .sd-teacher-label { font-size:.7rem; letter-spacing:.12em; text-transform:uppercase; color:rgba(52,211,153,.6); margin-bottom:.9rem; display:flex; align-items:center; gap:.45rem; }
    .sd-teacher-label-dot { width:6px; height:6px; border-radius:50%; background:#10b981; animation:glow-pulse 2s infinite; }
    .sd-teacher-inner { display:flex; align-items:center; gap:1rem; }
    .sd-teacher-avatar { width:52px; height:52px; border-radius:14px; background:rgba(30,58,138,.3); border:1px solid rgba(147,197,253,.15); display:flex; align-items:center; justify-content:center; font-size:1rem; font-weight:800; color:#93c5fd; flex-shrink:0; animation:badge-pop .5s .2s ease both; }
    .sd-teacher-name  { font-size:1.1rem; font-weight:800; color:#fff; }
    .sd-teacher-email { font-size:.75rem; color:rgba(255,255,255,.35); font-family:'DM Mono',monospace; margin-top:.15rem; }
    .sd-teacher-tier  { margin-left:auto; font-size:.75rem; font-weight:700; padding:.25rem .7rem; border-radius:8px; background:rgba(139,92,246,.12); color:#a78bfa; border:1px solid rgba(139,92,246,.2); }
    .sd-no-teacher { display:flex; align-items:center; gap:.85rem; padding:1.5rem 1.75rem; background:rgba(255,255,255,.03); border:1px dashed rgba(255,255,255,.1); border-radius:18px; margin-bottom:2rem; }
    .sd-no-teacher-icon { width:42px; height:42px; border-radius:12px; background:rgba(255,255,255,.06); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .sd-no-teacher-icon svg { width:20px; height:20px; color:rgba(255,255,255,.25); }
    .sd-no-teacher-text { font-size:.84rem; color:rgba(255,255,255,.3); }

    /* Stats */
    .sd-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:2rem; animation:fadeUp .5s .1s ease both; }
    .sd-stat { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:1.2rem 1.4rem; }
    .sd-stat-label { font-size:.7rem; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.28); margin-bottom:.45rem; }
    .sd-stat-value { font-size:1.9rem; font-weight:800; color:#fff; }
    .sd-stat-hint  { font-size:.72rem; color:rgba(255,255,255,.22); margin-top:.3rem; }

    /* Quiz section */
    .sd-quiz-section { animation:fadeUp .5s .15s ease both; margin-bottom:2rem; }
    .sd-quiz-section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; }
    .sd-quiz-section-title { font-size:1rem; font-weight:800; color:#fff; }
    .sd-quiz-count { font-family:'DM Mono',monospace; font-size:.72rem; color:rgba(255,255,255,.3); padding:.18rem .55rem; background:rgba(255,255,255,.06); border-radius:6px; }
    .sd-quiz-list { display:flex; flex-direction:column; gap:.75rem; }
    .sd-quiz-card {
      background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
      border-radius:14px; padding:1.1rem 1.4rem;
      display:flex; align-items:center; gap:1rem;
      position:relative; overflow:hidden; transition:all .15s;
    }
    .sd-quiz-card.active  { border-color:rgba(16,185,129,.3); }
    .sd-quiz-card.active::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:#10b981; border-radius:2px; }
    .sd-quiz-card.upcoming { border-color:rgba(245,158,11,.2); }
    .sd-quiz-card.upcoming::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:#f59e0b; border-radius:2px; }
    .sd-quiz-card.ended   { opacity:.55; }
    .sd-quiz-card:hover:not(.ended) { background:rgba(255,255,255,.07); }
    .sd-quiz-card-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0; }
    .sd-quiz-info { flex:1; min-width:0; }
    .sd-quiz-title { font-weight:700; color:#fff; font-size:.88rem; margin-bottom:.25rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .sd-quiz-meta { display:flex; align-items:center; gap:.5rem; flex-wrap:wrap; }
    .sd-quiz-status-badge { padding:.18rem .55rem; border-radius:6px; font-size:.68rem; font-weight:700; letter-spacing:.04em; }
    .sd-quiz-status-badge.active   { background:rgba(16,185,129,.15); color:#34d399; border:1px solid rgba(16,185,129,.25); }
    .sd-quiz-status-badge.upcoming { background:rgba(245,158,11,.12); color:#fbbf24; border:1px solid rgba(245,158,11,.2); }
    .sd-quiz-status-badge.ended    { background:rgba(255,255,255,.06); color:rgba(255,255,255,.3); }
    .sd-quiz-time { font-size:.7rem; color:rgba(255,255,255,.3); font-family:'DM Mono',monospace; }
    .sd-quiz-btn { padding:.5rem 1.2rem; border-radius:10px; border:none; font-family:'Syne',sans-serif; font-size:.82rem; font-weight:700; cursor:pointer; transition:all .15s; white-space:nowrap; flex-shrink:0; }
    .sd-quiz-btn.take { background:linear-gradient(135deg,#10b981,#065f46); color:#fff; box-shadow:0 4px 12px rgba(16,185,129,.3); }
    .sd-quiz-btn.take:hover { opacity:.88; transform:translateY(-1px); }
    .sd-quiz-btn.disabled { background:rgba(255,255,255,.07); color:rgba(255,255,255,.3); cursor:not-allowed; }
    .sd-quiz-score-chip { display:inline-flex; align-items:center; gap:.3rem; padding:.22rem .65rem; border-radius:6px; font-size:.72rem; font-weight:700; background:rgba(251,191,36,.1); color:#fbbf24; border:1px solid rgba(251,191,36,.2); }
    .sd-empty-quiz { padding:2rem 1.5rem; text-align:center; border:1px dashed rgba(255,255,255,.08); border-radius:14px; color:rgba(255,255,255,.25); font-size:.84rem; }

    /* Leaderboard */
    .sd-lb { animation:fadeUp .5s .2s ease both; }
    .sd-lb-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; flex-wrap:wrap; gap:.6rem; }
    .sd-lb-title-wrap { display:flex; align-items:center; gap:.75rem; }
    .sd-lb-title { font-size:1rem; font-weight:800; color:#fff; }
    .sd-lb-section-chip {
      font-size:.7rem; font-weight:700; padding:.2rem .65rem; border-radius:7px;
      background:rgba(16,185,129,.1); color:#34d399;
      border:1px solid rgba(16,185,129,.2);
    }
    .sd-lb-tabs { display:flex; gap:.35rem; }
    .sd-lb-tab { padding:.25rem .65rem; border-radius:7px; cursor:pointer; font-size:.74rem; font-weight:600; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.04); color:rgba(255,255,255,.3); transition:all .15s; font-family:'Syne',sans-serif; }
    .sd-lb-tab.active { background:rgba(16,185,129,.15); border-color:rgba(16,185,129,.3); color:#34d399; }
    .sd-lb-list { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:14px; overflow:hidden; }
    .sd-lb-row { display:flex; align-items:center; gap:.9rem; padding:.85rem 1.25rem; border-bottom:1px solid rgba(255,255,255,.04); transition:background .12s; }
    .sd-lb-row:last-child { border-bottom:none; }
    .sd-lb-row:hover { background:rgba(255,255,255,.025); }
    .sd-lb-row.is-me { background:rgba(16,185,129,.07); border-left:3px solid #10b981; }
    .sd-lb-rank { font-family:'DM Mono',monospace; font-size:.82rem; font-weight:700; color:rgba(255,255,255,.25); width:28px; text-align:center; flex-shrink:0; }
    .sd-lb-rank.top1 { color:#fbbf24; }
    .sd-lb-rank.top2 { color:#9ca3af; }
    .sd-lb-rank.top3 { color:#b45309; }
    .sd-lb-avatar { width:34px; height:34px; border-radius:9px; background:rgba(16,185,129,.15); display:flex; align-items:center; justify-content:center; font-size:.72rem; font-weight:800; color:#34d399; flex-shrink:0; }
    .sd-lb-info { flex:1; min-width:0; }
    .sd-lb-name { font-size:.83rem; font-weight:700; color:rgba(255,255,255,.85); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .sd-lb-streak { font-size:.7rem; color:rgba(255,100,100,.7); margin-top:.1rem; }
    .sd-lb-right { display:flex; flex-direction:column; align-items:flex-end; gap:.15rem; flex-shrink:0; }
    .sd-lb-pts  { font-family:'DM Mono',monospace; font-size:.82rem; font-weight:700; color:#fff; }
    .sd-lb-tier { font-size:.64rem; color:rgba(255,255,255,.25); }
    .sd-lb-empty { padding:2.5rem; text-align:center; font-size:.82rem; color:rgba(255,255,255,.2); }

    .skeleton { height:14px; border-radius:5px; background:linear-gradient(90deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 100%); background-size:800px 100%; animation:shimmer 1.4s infinite; }
    .sd-spinner { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,.15); border-top-color:#10b981; border-radius:50%; animation:spin .7s linear infinite; }

    @media(max-width:700px){
      .sd-stats { grid-template-columns:1fr 1fr; }
      .sd-body  { padding:1.5rem 1rem; }
      .sd-topbar { padding:0 1rem; }
    }
  `}</style>
);

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";

const rankClass = (i) => i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : "";
const rankEmoji = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;

const formatTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleString([], {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
};

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile]           = useState(null);
  const [myTeacher, setMyTeacher]       = useState(undefined);
  const [leaderboard, setLeaderboard]   = useState([]);
  const [lbType, setLbType]             = useState("overall");
  const [lbLoading, setLbLoading]       = useState(false);
  const [pageLoading, setPageLoading]   = useState(true);
  const [quizzes, setQuizzes]           = useState([]);
  const [quizResults, setQuizResults]   = useState({});
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [quizError, setQuizError]       = useState("");

  const tokenUser = getUser();

  const loadLeaderboard = useCallback(async (type) => {
    setLbLoading(true);
    try {
      // Pass token so backend can read the user's section
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/api/game/leaderboard/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch {
      setLeaderboard([]);
    } finally {
      setLbLoading(false);
    }
  }, []);

  const loadQuizzes = useCallback(async () => {
    setLoadingQuizzes(true);
    setQuizError("");
    try {
      const data = await apiFetch("/api/quiz/my-quizzes");
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      setQuizError(err.message);
      setQuizzes([]);
    } finally {
      setLoadingQuizzes(false);
    }
  }, []);

  const loadResults = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/api/quiz/my-results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const map = {};
        (Array.isArray(data) ? data : []).forEach(r => { map[r.quiz_id] = r; });
        setQuizResults(map);
      }
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => {
    if (!tokenUser) { navigate("/"); return; }
    if (tokenUser.role !== "student") { navigate("/teacher"); return; }

    getMyProfile()
      .then(setProfile)
      .catch(() => {});

    apiFetch("/api/admin/my-teacher")
      .then(setMyTeacher)
      .catch(() => setMyTeacher(null))
      .finally(() => setPageLoading(false));

    loadQuizzes();
    loadResults();
  }, [navigate, loadQuizzes, loadResults]);

  useEffect(() => {
    loadLeaderboard(lbType);
  }, [lbType, loadLeaderboard]);

  const handleTakeQuiz = (quiz) => {
    if (quiz.status !== "active") return;
    navigate(`/quiz/${quiz.id}`);
  };

  const displayName   = profile?.full_name || "Student";
  const firstName     = displayName.split(" ")[0];
  const avatarText    = initials(displayName);
  const currentUserId = tokenUser?.id;
  const mySection     = profile?.section || "";
  const myCourse      = profile?.course  || "";

  return (
    <>
      <Styles />
      <div className="sd-root">
        {/* ── Topbar ── */}
        <header className="sd-topbar">
          <div className="sd-logo">
            <div className="sd-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.87L12 18.07 5.82 22 7 14.14 2 9.27l6.91-1.01z"/>
              </svg>
            </div>
            QuizSystem
          </div>
          <div className="sd-topbar-right">
            <div className="sd-user-chip">
              <div className="sd-user-chip-avatar">{avatarText}</div>
              {displayName}
            </div>
            <button className="sd-logout"
              onClick={() => { logout(); navigate("/"); }}>
              Sign out
            </button>
          </div>
        </header>

        <div className="sd-body">
          {/* ── Welcome ── */}
          <div className="sd-welcome">
            <div className="sd-welcome-tag"><span /> Student Dashboard</div>
            <h1 className="sd-name">Hello, {firstName}! 👋</h1>
            <p className="sd-sub">
              Track your progress and compete with your classmates
            </p>
            {/* Course + Section badges */}
            {(myCourse || mySection) && (
              <div className="sd-section-row">
                {myCourse  && <span className="sd-badge sd-badge-course">📚 {myCourse}</span>}
                {mySection && <span className="sd-badge sd-badge-section">🏫 {mySection}</span>}
              </div>
            )}
          </div>

          {/* ── My Teacher ── */}
          {pageLoading ? (
            <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:18,padding:"1.5rem 1.75rem",marginBottom:"2rem"}}>
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
                {myTeacher.tier && (
                  <div className="sd-teacher-tier">{myTeacher.tier}</div>
                )}
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
              <p className="sd-no-teacher-text">
                No teacher assigned yet. Your admin will assign one soon.
              </p>
            </div>
          )}

          {/* ── Stats ── */}
          <div className="sd-stats">
            <div className="sd-stat">
              <p className="sd-stat-label">Your Points</p>
              <p className="sd-stat-value">
                {profile ? (profile.points ?? 0).toLocaleString() : "—"}
              </p>
              <p className="sd-stat-hint">{profile?.tier || "Beginner"}</p>
            </div>
            <div className="sd-stat">
              <p className="sd-stat-label">Streak</p>
              <p className="sd-stat-value">🔥 {profile ? (profile.streak ?? 0) : "—"}</p>
              <p className="sd-stat-hint">consecutive days</p>
            </div>
            <div className="sd-stat">
              <p className="sd-stat-label">Quizzes Assigned</p>
              <p className="sd-stat-value">{quizzes.length}</p>
              <p className="sd-stat-hint">
                {quizzes.filter(q => q.status === "active").length} active now
              </p>
            </div>
          </div>

          {/* ── My Quizzes ── */}
          <div className="sd-quiz-section">
            <div className="sd-quiz-section-header">
              <h2 className="sd-quiz-section-title">My Quizzes</h2>
              <div style={{display:"flex",alignItems:"center",gap:".75rem"}}>
                <span className="sd-quiz-count">{quizzes.length}</span>
                <button onClick={loadQuizzes} style={{
                  background:"rgba(255,255,255,.06)",
                  border:"1px solid rgba(255,255,255,.1)",
                  borderRadius:8, color:"rgba(255,255,255,.5)",
                  padding:".25rem .65rem", fontSize:".74rem",
                  cursor:"pointer", fontFamily:"'Syne',sans-serif"
                }}>↻ Refresh</button>
              </div>
            </div>

            {loadingQuizzes ? (
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem",gap:".65rem",color:"rgba(255,255,255,.3)",fontSize:".82rem"}}>
                <span className="sd-spinner" /> Loading quizzes…
              </div>
            ) : quizError ? (
              <div style={{padding:"1rem",background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",borderRadius:12,color:"#f87171",fontSize:".82rem"}}>
                ⚠ {quizError}
              </div>
            ) : quizzes.length === 0 ? (
              <div className="sd-empty-quiz">
                📋 No quizzes assigned yet. Your teacher will send quizzes here.
              </div>
            ) : (
              <div className="sd-quiz-list">
                {quizzes.map(quiz => {
                  const result   = quizResults[quiz.id];
                  const isActive = quiz.status === "active";
                  const isDone   = !!result;

                  return (
                    <div key={quiz.id} className={`sd-quiz-card ${quiz.status}`}>
                      <div className="sd-quiz-card-icon" style={{
                        background: isActive
                          ? "rgba(16,185,129,.12)"
                          : quiz.status === "upcoming"
                          ? "rgba(245,158,11,.1)"
                          : "rgba(255,255,255,.05)"
                      }}>
                        {isActive ? "📝" : quiz.status === "upcoming" ? "⏳" : "🔒"}
                      </div>

                      <div className="sd-quiz-info">
                        <div className="sd-quiz-title">{quiz.title}</div>
                        <div className="sd-quiz-meta">
                          <span className={`sd-quiz-status-badge ${quiz.status}`}>
                            {isActive ? "● Live Now"
                              : quiz.status === "upcoming" ? "⏰ Upcoming"
                              : "Ended"}
                          </span>
                          {quiz.start_time && (
                            <span className="sd-quiz-time">
                              {isActive
                                ? `Ends ${formatTime(quiz.end_time)}`
                                : quiz.status === "upcoming"
                                ? `Starts ${formatTime(quiz.start_time)}`
                                : `Ended ${formatTime(quiz.end_time)}`}
                            </span>
                          )}
                          {isDone && (
                            <span className="sd-quiz-score-chip">
                              ✓ {result.score}/{result.total} ({Math.round((result.score / result.total) * 100)}%)
                            </span>
                          )}
                        </div>
                      </div>

                      {isDone ? (
                        <div style={{textAlign:"center",flexShrink:0}}>
                          <div style={{fontSize:"1.1rem",fontWeight:800,color:"#34d399"}}>
                            {Math.round((result.score / result.total) * 100)}%
                          </div>
                          <div style={{fontSize:".65rem",color:"rgba(255,255,255,.3)",marginTop:".15rem"}}>Score</div>
                        </div>
                      ) : (
                        <button
                          className={`sd-quiz-btn ${isActive ? "take" : "disabled"}`}
                          onClick={() => handleTakeQuiz(quiz)}
                          disabled={!isActive}
                        >
                          {isActive ? "Take Quiz →"
                            : quiz.status === "upcoming" ? "Not Yet Open"
                            : "Closed"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Section Leaderboard ── */}
          <div className="sd-lb">
            <div className="sd-lb-header">
              <div className="sd-lb-title-wrap">
                <h2 className="sd-lb-title">Section Leaderboard</h2>
                {mySection && (
                  <span className="sd-lb-section-chip">🏫 {mySection}</span>
                )}
              </div>
              <div className="sd-lb-tabs">
                {["overall","daily","weekly"].map(t => (
                  <button key={t}
                    className={`sd-lb-tab ${lbType === t ? "active" : ""}`}
                    onClick={() => setLbType(t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="sd-lb-list">
              {lbLoading ? (
                [1,2,3,4,5].map(i => (
                  <div key={i} className="sd-lb-row">
                    <div className="skeleton" style={{width:24}} />
                    <div style={{width:34,height:34,borderRadius:9,background:"rgba(255,255,255,.05)"}} />
                    <div style={{flex:1}}>
                      <div className="skeleton" style={{width:"50%",marginBottom:".35rem"}} />
                      <div className="skeleton" style={{width:"30%"}} />
                    </div>
                    <div className="skeleton" style={{width:55}} />
                  </div>
                ))
              ) : leaderboard.length === 0 ? (
                <div className="sd-lb-empty">
                  {mySection
                    ? `No students in ${mySection} have points yet. Be the first! 🚀`
                    : "No data available for this period."}
                </div>
              ) : (
                leaderboard.map((u, i) => (
                  <div key={u.id || i}
                    className={`sd-lb-row ${u.id === currentUserId ? "is-me" : ""}`}>

                    <span className={`sd-lb-rank ${rankClass(i)}`}>
                      {rankEmoji(i)}
                    </span>

                    <div className="sd-lb-avatar">{initials(u.full_name || "?")}</div>

                    <div className="sd-lb-info">
                      <div className="sd-lb-name">
                        {u.full_name || "Unknown"}
                        {u.id === currentUserId && (
                          <span style={{fontSize:".62rem",color:"#10b981",marginLeft:".4rem"}}>
                            ← you
                          </span>
                        )}
                      </div>
                      {/* Show streak */}
                      {(u.streak ?? 0) > 0 && (
                        <div className="sd-lb-streak">
                          🔥 {u.streak} day streak
                        </div>
                      )}
                    </div>

                    <div className="sd-lb-right">
                      <span className="sd-lb-pts">
                        {(u.points ?? 0).toLocaleString()} pts
                      </span>
                      <span className="sd-lb-tier">{u.tier || "Beginner"}</span>
                    </div>
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