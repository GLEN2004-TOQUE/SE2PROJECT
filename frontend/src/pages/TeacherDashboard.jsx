import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/api";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const apiFetch = async (path) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
};

/* ─── Styles ────────────────────────────────────────────────────────────── */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }

    @keyframes fadeUp {
      from { opacity:0; transform:translateY(16px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes slideDown {
      from { opacity:0; transform:translateY(-10px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes spin { to { transform:rotate(360deg); } }
    @keyframes shimmer {
      0%   { background-position:-400px 0; }
      100% { background-position: 400px 0; }
    }

    .td-root {
      min-height: 100vh;
      background: #080b10;
      background-image:
        radial-gradient(ellipse 65% 45% at 5% 0%,  rgba(30,58,138,.25) 0%, transparent 70%),
        radial-gradient(ellipse 50% 40% at 95% 100%, rgba(6,78,59,.2) 0%, transparent 65%);
      font-family: 'Syne', sans-serif;
      color: #e2e8f0;
    }

    /* topbar */
    .td-topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 2.5rem; height: 62px;
      background: rgba(8,11,16,.9);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid rgba(255,255,255,.07);
      animation: slideDown .4s ease both;
      position: sticky; top:0; z-index:30;
    }
    .td-logo {
      display: flex; align-items: center; gap: .65rem;
      font-size: 1rem; font-weight: 800; color: #fff;
    }
    .td-logo-icon {
      width: 30px; height: 30px; border-radius: 8px;
      background: linear-gradient(135deg, #1e40af, #065f46);
      display: flex; align-items: center; justify-content: center;
    }
    .td-logo-icon svg { width:16px; height:16px; color:#fff; }
    .td-topbar-right { display:flex; align-items:center; gap:.9rem; }
    .td-chip {
      font-family:'DM Mono',monospace; font-size:.67rem;
      padding: .2rem .65rem; border-radius:999px;
      background: rgba(30,58,138,.2); border: 1px solid rgba(30,58,138,.4);
      color:#93c5fd; letter-spacing:.06em;
    }
    .td-logout {
      padding:.36rem .85rem; border-radius:8px;
      border:1px solid rgba(255,255,255,.1);
      background:rgba(255,255,255,.05);
      color:rgba(255,255,255,.45); font-family:'Syne',sans-serif;
      font-size:.78rem; cursor:pointer; transition:all .15s;
    }
    .td-logout:hover { background:rgba(255,255,255,.1); color:#fff; }

    /* body */
    .td-body { max-width: 1100px; margin: 0 auto; padding: 2.5rem 2rem; }

    /* welcome */
    .td-welcome {
      margin-bottom: 2.5rem;
      animation: fadeUp .5s ease both;
    }
    .td-welcome-tag {
      display:inline-flex; align-items:center; gap:.4rem;
      font-size:.72rem; letter-spacing:.1em; text-transform:uppercase;
      color:rgba(147,197,253,.6); margin-bottom:.6rem;
    }
    .td-welcome-tag span {
      display:inline-block; width:6px; height:6px; border-radius:50%;
      background:#3b82f6;
    }
    .td-name { font-size:2rem; font-weight:800; color:#fff; letter-spacing:-.03em; }
    .td-sub  { font-size:.88rem; color:rgba(255,255,255,.35); margin-top:.35rem; }

    /* stats */
    .td-stats {
      display:grid; grid-template-columns: repeat(3,1fr); gap:1rem;
      margin-bottom:2.5rem;
      animation: fadeUp .5s .1s ease both;
    }
    .td-stat {
      background:rgba(255,255,255,.04);
      border:1px solid rgba(255,255,255,.07);
      border-radius:14px; padding:1.2rem 1.4rem;
    }
    .td-stat-label {
      font-size:.7rem; letter-spacing:.1em; text-transform:uppercase;
      color:rgba(255,255,255,.28); margin-bottom:.5rem;
    }
    .td-stat-value { font-size:1.9rem; font-weight:800; color:#fff; }
    .td-stat-hint  { font-size:.72rem; color:rgba(255,255,255,.22); margin-top:.35rem; }

    /* action grid */
    .td-actions {
      display:grid; grid-template-columns:1fr 1fr; gap:1rem;
      margin-bottom:2.5rem;
      animation: fadeUp .5s .15s ease both;
    }
    .td-action-card {
      background:rgba(255,255,255,.04);
      border:1px solid rgba(255,255,255,.07);
      border-radius:16px; padding:1.5rem;
      cursor:pointer; transition:all .2s;
    }
    .td-action-card:hover {
      background:rgba(255,255,255,.07);
      border-color:rgba(255,255,255,.15);
      transform:translateY(-2px);
    }
    .td-action-icon {
      width:42px; height:42px; border-radius:11px;
      display:flex; align-items:center; justify-content:center;
      margin-bottom:1rem;
    }
    .td-action-icon svg { width:20px; height:20px; }
    .td-action-title { font-size:.92rem; font-weight:700; color:#fff; margin-bottom:.35rem; }
    .td-action-desc  { font-size:.78rem; color:rgba(255,255,255,.35); }

    /* students section */
    .td-section { animation: fadeUp .5s .2s ease both; }
    .td-section-header {
      display:flex; align-items:center; justify-content:space-between;
      margin-bottom:1rem;
    }
    .td-section-title { font-size:1rem; font-weight:800; color:#fff; }
    .td-section-count {
      font-family:'DM Mono',monospace; font-size:.72rem;
      color:rgba(255,255,255,.3); padding:.18rem .55rem;
      background:rgba(255,255,255,.06); border-radius:6px;
    }

    .td-students-grid {
      display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
      gap:.9rem;
    }
    .td-student-card {
      background:rgba(255,255,255,.035);
      border:1px solid rgba(255,255,255,.07);
      border-radius:14px; padding:1.1rem 1.25rem;
      transition:all .15s;
    }
    .td-student-card:hover {
      background:rgba(255,255,255,.06);
      border-color:rgba(255,255,255,.12);
    }
    .td-student-top { display:flex; align-items:center; gap:.75rem; margin-bottom:.8rem; }
    .td-avatar {
      width:38px; height:38px; border-radius:11px;
      background:rgba(16,185,129,.15);
      display:flex; align-items:center; justify-content:center;
      font-size:.8rem; font-weight:800; color:#34d399; flex-shrink:0;
    }
    .td-student-name  { font-weight:700; color:#fff; font-size:.85rem; }
    .td-student-email { font-size:.7rem; color:rgba(255,255,255,.3); font-family:'DM Mono',monospace; }
    .td-student-stats { display:flex; gap:.6rem; flex-wrap:wrap; }
    .td-pill {
      display:inline-flex; align-items:center; gap:.3rem;
      padding:.15rem .55rem; border-radius:6px;
      font-size:.7rem; font-weight:600;
    }
    .td-pill-pts { background:rgba(251,191,36,.1); color:#fbbf24; }
    .td-pill-tier { background:rgba(139,92,246,.1); color:#a78bfa; }
    .td-pill-streak { background:rgba(239,68,68,.08); color:#f87171; }

    /* empty */
    .td-empty {
      padding:3rem 1.5rem; text-align:center;
      color:rgba(255,255,255,.2); font-size:.85rem;
      border:1px dashed rgba(255,255,255,.08); border-radius:14px;
    }
    .td-empty svg { width:36px; height:36px; margin:0 auto .8rem; opacity:.3; display:block; }

    /* skeleton */
    .skeleton {
      height:14px; border-radius:5px;
      background:linear-gradient(90deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 100%);
      background-size:800px 100%;
      animation:shimmer 1.4s infinite;
    }

    @media(max-width:700px){
      .td-stats  { grid-template-columns:1fr 1fr; }
      .td-actions{ grid-template-columns:1fr; }
      .td-body   { padding:1.5rem 1rem; }
    }
  `}</style>
);

const initials = (name = "") =>
  name.split(" ").slice(0,2).map(n => n[0]).join("").toUpperCase() || "?";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacherName, setTeacherName] = useState("");
  const [myStudents, setMyStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUser();
    if (!user) { navigate("/"); return; }
    if (user.role !== "teacher") { navigate("/student"); return; }
    setTeacherName(user.full_name || user.name || "Teacher");

    apiFetch("/api/admin/my-students")
      .then(setMyStudents)
      .catch(() => setMyStudents([]))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <>
      <Styles />
      <div className="td-root">
        {/* Topbar */}
        <header className="td-topbar">
          <div className="td-logo">
            <div className="td-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16v10H4z"/><path d="M2 20l10-6 10 6"/>
              </svg>
            </div>
            QuizSystem
          </div>
          <div className="td-topbar-right">
            <span className="td-chip">TEACHER</span>
            <button className="td-logout" onClick={handleLogout}>Sign out</button>
          </div>
        </header>

        <div className="td-body">
          {/* Welcome */}
          <div className="td-welcome">
            <div className="td-welcome-tag">
              <span /> Teacher Dashboard
            </div>
            <h1 className="td-name">Welcome back{teacherName ? `, ${teacherName.split(" ")[0]}` : ""}! 👋</h1>
            <p className="td-sub">Manage your students and create learning materials</p>
          </div>

          {/* Stats */}
          <div className="td-stats">
            <div className="td-stat">
              <p className="td-stat-label">My Students</p>
              <p className="td-stat-value">{loading ? "—" : myStudents.length}</p>
              <p className="td-stat-hint">assigned to you</p>
            </div>
            <div className="td-stat">
              <p className="td-stat-label">Avg. Points</p>
              <p className="td-stat-value">
                {loading || !myStudents.length ? "—"
                  : Math.round(myStudents.reduce((s,u) => s + (u.points||0), 0) / myStudents.length)}
              </p>
              <p className="td-stat-hint">across all students</p>
            </div>
            <div className="td-stat">
              <p className="td-stat-label">Active Students</p>
              <p className="td-stat-value">
                {loading ? "—" : myStudents.filter(s => s.status !== false).length}
              </p>
              <p className="td-stat-hint">with active accounts</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="td-actions">
            <div className="td-action-card" onClick={() => navigate("/upload-lecture")}>
              <div className="td-action-icon" style={{ background:"rgba(30,58,138,.2)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <h3 className="td-action-title">Upload Lecture</h3>
              <p className="td-action-desc">Share PDF, DOCX, or PPTX materials with your students</p>
            </div>
            <div className="td-action-card" onClick={() => navigate("/generate-quiz")}>
              <div className="td-action-icon" style={{ background:"rgba(6,78,59,.25)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 className="td-action-title">Generate Quiz</h3>
              <p className="td-action-desc">Use AI to create quizzes from your uploaded lectures</p>
            </div>
          </div>

          {/* My Students */}
          <div className="td-section">
            <div className="td-section-header">
              <h2 className="td-section-title">My Students</h2>
              <span className="td-section-count">{myStudents.length}</span>
            </div>

            {loading ? (
              <div className="td-students-grid">
                {[1,2,3].map(i => (
                  <div key={i} className="td-student-card">
                    <div style={{display:"flex",gap:".75rem",marginBottom:".8rem"}}>
                      <div style={{width:38,height:38,borderRadius:11,background:"rgba(255,255,255,.05)"}} />
                      <div style={{flex:1}}>
                        <div className="skeleton" style={{width:"70%",marginBottom:".4rem"}} />
                        <div className="skeleton" style={{width:"90%"}} />
                      </div>
                    </div>
                    <div className="skeleton" style={{width:"60%"}} />
                  </div>
                ))}
              </div>
            ) : myStudents.length === 0 ? (
              <div className="td-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                No students assigned yet. Contact your admin to get students assigned to you.
              </div>
            ) : (
              <div className="td-students-grid">
                {myStudents.map(s => (
                  <div key={s.id} className="td-student-card">
                    <div className="td-student-top">
                      <div className="td-avatar">{initials(s.full_name)}</div>
                      <div style={{minWidth:0}}>
                        <div className="td-student-name">{s.full_name}</div>
                        <div className="td-student-email">{s.email}</div>
                      </div>
                    </div>
                    <div className="td-student-stats">
                      <span className="td-pill td-pill-pts">⭐ {s.points ?? 0} pts</span>
                      <span className="td-pill td-pill-tier">{s.tier || "Beginner"}</span>
                      {s.streak > 0 && (
                        <span className="td-pill td-pill-streak">🔥 {s.streak}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}