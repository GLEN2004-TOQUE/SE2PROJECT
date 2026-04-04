import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/api";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const apiFetch = async (path, opts = {}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
};

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }

    @keyframes fadeUp   { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
    @keyframes slideDown{ from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);} }
    @keyframes fadeIn   { from{opacity:0;}to{opacity:1;} }
    @keyframes spin     { to{transform:rotate(360deg);} }
    @keyframes shimmer  { 0%{background-position:-400px 0;}100%{background-position:400px 0;} }
    @keyframes modalIn  { from{opacity:0;transform:scale(.94) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);} }
    @keyframes checkPop { 0%{transform:scale(0) rotate(-20deg);opacity:0;}60%{transform:scale(1.2) rotate(5deg);opacity:1;}100%{transform:scale(1) rotate(0);opacity:1;} }
    @keyframes successRing { 0%{transform:scale(.7);opacity:0;}50%{transform:scale(1.12);}100%{transform:scale(1);opacity:1;} }
    @keyframes toastSlide { 0%{opacity:0;transform:translateX(60px);}10%{opacity:1;transform:translateX(0);}85%{opacity:1;}100%{opacity:0;transform:translateX(60px);} }
    @keyframes float { 0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);} }
    @keyframes confPop { to{transform:translateY(50px) rotate(720deg);opacity:0;} }

    .td-root {
      min-height:100vh;
      background:#080b10;
      background-image:
        radial-gradient(ellipse 65% 45% at 5% 0%, rgba(30,58,138,.22) 0%,transparent 70%),
        radial-gradient(ellipse 50% 40% at 95% 100%, rgba(6,78,59,.18) 0%,transparent 65%);
      font-family:'Syne',sans-serif; color:#e2e8f0;
    }

    /* ── Topbar ── */
    .td-topbar {
      display:flex; align-items:center; justify-content:space-between;
      padding:0 2.5rem; height:62px;
      background:rgba(8,11,16,.9); backdrop-filter:blur(14px);
      border-bottom:1px solid rgba(255,255,255,.07);
      animation:slideDown .4s ease both; position:sticky; top:0; z-index:30;
    }
    .td-logo { display:flex; align-items:center; gap:.65rem; font-size:1rem; font-weight:800; color:#fff; }
    .td-logo-icon {
      width:30px; height:30px; border-radius:8px;
      background:linear-gradient(135deg,#1e40af,#065f46);
      display:flex; align-items:center; justify-content:center;
    }
    .td-logo-icon svg { width:16px; height:16px; color:#fff; }
    .td-topbar-right { display:flex; align-items:center; gap:.9rem; }
    .td-chip { font-family:'DM Mono',monospace; font-size:.67rem; padding:.2rem .65rem; border-radius:999px; background:rgba(30,58,138,.2); border:1px solid rgba(30,58,138,.4); color:#93c5fd; letter-spacing:.06em; }
    .td-logout { padding:.36rem .85rem; border-radius:8px; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.05); color:rgba(255,255,255,.45); font-family:'Syne',sans-serif; font-size:.78rem; cursor:pointer; transition:all .15s; }
    .td-logout:hover { background:rgba(255,255,255,.1); color:#fff; }

    /* ── Body ── */
    .td-body { max-width:1100px; margin:0 auto; padding:2.5rem 2rem; }

    /* ── Welcome ── */
    .td-welcome { margin-bottom:2.5rem; animation:fadeUp .5s ease both; }
    .td-welcome-tag { display:inline-flex; align-items:center; gap:.4rem; font-size:.72rem; letter-spacing:.1em; text-transform:uppercase; color:rgba(147,197,253,.6); margin-bottom:.6rem; }
    .td-welcome-tag span { display:inline-block; width:6px; height:6px; border-radius:50%; background:#3b82f6; }
    .td-name { font-size:2rem; font-weight:800; color:#fff; letter-spacing:-.03em; }
    .td-sub  { font-size:.88rem; color:rgba(255,255,255,.35); margin-top:.35rem; }

    /* ── Stats ── */
    .td-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:2.5rem; animation:fadeUp .5s .1s ease both; }
    .td-stat { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:1.2rem 1.4rem; }
    .td-stat-label { font-size:.7rem; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.28); margin-bottom:.5rem; }
    .td-stat-value { font-size:1.9rem; font-weight:800; color:#fff; }
    .td-stat-hint  { font-size:.72rem; color:rgba(255,255,255,.22); margin-top:.35rem; }

    /* ── Quick actions ── */
    .td-actions { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:2.5rem; animation:fadeUp .5s .15s ease both; }
    .td-action-card { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); border-radius:16px; padding:1.5rem; cursor:pointer; transition:all .2s; }
    .td-action-card:hover { background:rgba(255,255,255,.07); border-color:rgba(255,255,255,.15); transform:translateY(-2px); }
    .td-action-icon { width:42px; height:42px; border-radius:11px; display:flex; align-items:center; justify-content:center; margin-bottom:1rem; }
    .td-action-icon svg { width:20px; height:20px; }
    .td-action-title { font-size:.92rem; font-weight:700; color:#fff; margin-bottom:.35rem; }
    .td-action-desc  { font-size:.78rem; color:rgba(255,255,255,.35); }

    /* ── Section header ── */
    .td-section { margin-bottom:2.5rem; animation:fadeUp .5s .2s ease both; }
    .td-section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.1rem; }
    .td-section-title { font-size:1rem; font-weight:800; color:#fff; }
    .td-section-count { font-family:'DM Mono',monospace; font-size:.72rem; color:rgba(255,255,255,.3); padding:.18rem .55rem; background:rgba(255,255,255,.06); border-radius:6px; }

    /* ── Quiz list ── */
    .td-quiz-list { display:flex; flex-direction:column; gap:.75rem; }
    .td-quiz-card {
      background:rgba(255,255,255,.035);
      border:1px solid rgba(255,255,255,.07);
      border-radius:14px; padding:1.1rem 1.4rem;
      display:flex; align-items:center; gap:1rem;
      cursor:pointer; transition:all .2s;
      position:relative; overflow:hidden;
    }
    .td-quiz-card::before {
      content:''; position:absolute; left:0; top:0; bottom:0; width:3px;
      border-radius:2px;
    }
    .td-quiz-card.status-draft    { } 
    .td-quiz-card.status-scheduled::before { background:#f59e0b; }
    .td-quiz-card.status-active   ::before { background:#10b981; }
    .td-quiz-card.status-ended    { opacity:.6; }
    .td-quiz-card:hover { background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.14); transform:translateX(2px); }

    .td-quiz-file-icon {
      width:44px; height:44px; border-radius:12px; flex-shrink:0;
      display:flex; align-items:center; justify-content:center; font-size:1.2rem;
    }
    .td-quiz-info { flex:1; min-width:0; }
    .td-quiz-title { font-weight:700; color:#fff; font-size:.88rem; margin-bottom:.2rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .td-quiz-source { font-size:.72rem; color:rgba(255,255,255,.35); display:flex; align-items:center; gap:.4rem; }
    .td-quiz-source svg { width:12px; height:12px; }
    .td-quiz-meta { display:flex; align-items:center; gap:.6rem; flex-shrink:0; }
    .td-quiz-q-count { font-family:'DM Mono',monospace; font-size:.72rem; color:rgba(255,255,255,.3); }
    .td-quiz-status-badge {
      padding:.2rem .6rem; border-radius:6px; font-size:.68rem; font-weight:700; letter-spacing:.05em;
    }
    .td-quiz-status-badge.draft     { background:rgba(255,255,255,.08); color:rgba(255,255,255,.35); }
    .td-quiz-status-badge.scheduled { background:rgba(245,158,11,.12); color:#fbbf24; border:1px solid rgba(245,158,11,.2); }
    .td-quiz-status-badge.active    { background:rgba(16,185,129,.12); color:#34d399; border:1px solid rgba(16,185,129,.2); }
    .td-quiz-status-badge.ended     { background:rgba(255,255,255,.05); color:rgba(255,255,255,.25); }
    .td-quiz-send-btn {
      padding:.38rem .9rem; border-radius:9px;
      border:1px solid rgba(99,102,241,.35);
      background:rgba(99,102,241,.1);
      color:#a5b4fc; font-family:'Syne',sans-serif;
      font-size:.76rem; font-weight:700; cursor:pointer;
      transition:all .15s; flex-shrink:0; white-space:nowrap;
    }
    .td-quiz-send-btn:hover { background:rgba(99,102,241,.22); border-color:rgba(99,102,241,.6); }

    /* ── Students grid ── */
    .td-students-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:.9rem; }
    .td-student-card { background:rgba(255,255,255,.035); border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:1.1rem 1.25rem; transition:all .15s; }
    .td-student-card:hover { background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.12); }
    .td-student-top { display:flex; align-items:center; gap:.75rem; margin-bottom:.8rem; }
    .td-avatar { width:38px; height:38px; border-radius:11px; background:rgba(16,185,129,.15); display:flex; align-items:center; justify-content:center; font-size:.8rem; font-weight:800; color:#34d399; flex-shrink:0; }
    .td-student-name  { font-weight:700; color:#fff; font-size:.85rem; }
    .td-student-email { font-size:.7rem; color:rgba(255,255,255,.3); font-family:'DM Mono',monospace; }
    .td-student-stats { display:flex; gap:.6rem; flex-wrap:wrap; }
    .td-pill { display:inline-flex; align-items:center; gap:.3rem; padding:.15rem .55rem; border-radius:6px; font-size:.7rem; font-weight:600; }
    .td-pill-pts    { background:rgba(251,191,36,.1); color:#fbbf24; }
    .td-pill-tier   { background:rgba(139,92,246,.1); color:#a78bfa; }
    .td-pill-streak { background:rgba(239,68,68,.08); color:#f87171; }

    /* ── Empty ── */
    .td-empty { padding:2.5rem 1.5rem; text-align:center; color:rgba(255,255,255,.2); font-size:.85rem; border:1px dashed rgba(255,255,255,.08); border-radius:14px; }
    .td-empty svg { width:36px; height:36px; margin:0 auto .8rem; opacity:.3; display:block; }

    /* ── Skeleton ── */
    .skeleton { height:14px; border-radius:5px; background:linear-gradient(90deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 100%); background-size:800px 100%; animation:shimmer 1.4s infinite; }

    /* ── Modal overlay ── */
    .td-modal-overlay {
      position:fixed; inset:0; z-index:60;
      background:rgba(0,0,0,.7); backdrop-filter:blur(8px);
      display:flex; align-items:center; justify-content:center; padding:1.5rem;
      animation:fadeIn .2s ease both;
    }
    .td-modal {
      background:#0e1118;
      border:1px solid rgba(255,255,255,.1);
      border-radius:22px; padding:2rem 2.2rem;
      width:100%; max-width:480px;
      animation:modalIn .28s cubic-bezier(.34,1.56,.64,1) both;
      box-shadow:0 40px 80px rgba(0,0,0,.7);
    }
    .td-modal-icon {
      width:52px; height:52px; border-radius:15px;
      background:linear-gradient(135deg,rgba(99,102,241,.25),rgba(139,92,246,.2));
      border:1px solid rgba(99,102,241,.3);
      display:flex; align-items:center; justify-content:center;
      margin-bottom:1.3rem;
    }
    .td-modal-icon svg { width:24px; height:24px; color:#a5b4fc; }
    .td-modal-title { font-size:1.15rem; font-weight:800; color:#fff; letter-spacing:-.02em; margin-bottom:.4rem; }
    .td-modal-sub   { font-size:.82rem; color:rgba(255,255,255,.35); line-height:1.6; margin-bottom:1.5rem; }
    .td-modal-sub strong { color:rgba(255,255,255,.7); }

    .td-modal-label { font-size:.72rem; letter-spacing:.1em; text-transform:uppercase; color:rgba(165,180,252,.5); margin-bottom:.5rem; font-weight:600; }
    .td-modal-input {
      width:100%; padding:.65rem .9rem;
      background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
      border-radius:10px; color:#fff;
      font-family:'Syne',sans-serif; font-size:.85rem;
      outline:none; margin-bottom:1.1rem; transition:border-color .2s;
    }
    .td-modal-input:focus { border-color:rgba(99,102,241,.5); }

    .td-modal-actions { display:flex; gap:.75rem; margin-top:.5rem; }
    .td-btn-cancel {
      flex:1; padding:.72rem;
      border-radius:10px; border:1px solid rgba(255,255,255,.1);
      background:rgba(255,255,255,.05); color:rgba(255,255,255,.45);
      font-family:'Syne',sans-serif; font-size:.84rem; font-weight:600; cursor:pointer; transition:all .15s;
    }
    .td-btn-cancel:hover { background:rgba(255,255,255,.1); color:#fff; }
    .td-btn-send {
      flex:2; padding:.72rem;
      border-radius:10px; border:none;
      background:linear-gradient(135deg,#6366f1,#8b5cf6);
      color:#fff; font-family:'Syne',sans-serif; font-size:.88rem; font-weight:700;
      cursor:pointer; transition:opacity .15s;
      box-shadow:0 4px 16px rgba(99,102,241,.4);
    }
    .td-btn-send:hover { opacity:.88; }
    .td-btn-send:disabled { opacity:.4; cursor:not-allowed; }

    /* ── Success send overlay ── */
    .td-send-success {
      position:fixed; inset:0; z-index:70;
      display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.4rem;
      background:rgba(8,11,16,.96); backdrop-filter:blur(20px);
      animation:fadeIn .3s ease both;
    }
    .td-send-success-ring {
      width:90px; height:90px; border-radius:50%;
      background:linear-gradient(135deg,rgba(99,102,241,.25),rgba(139,92,246,.2));
      border:2px solid rgba(99,102,241,.6);
      display:flex; align-items:center; justify-content:center;
      animation:successRing .6s cubic-bezier(.34,1.56,.64,1) both;
      box-shadow:0 0 40px rgba(99,102,241,.35);
    }
    .td-send-success-ring svg { width:40px; height:40px; color:#a5b4fc; animation:checkPop .5s .3s both; }
    .td-send-success-text { text-align:center; }
    .td-send-success-title { font-size:1.4rem; font-weight:800; color:#fff; letter-spacing:-.02em; margin-bottom:.4rem; }
    .td-send-success-sub   { font-size:.84rem; color:rgba(255,255,255,.35); }
    .td-conf-row { display:flex; gap:.5rem; animation:float 2.5s ease-in-out infinite; }
    .td-conf     { width:8px; height:8px; border-radius:2px; }

    /* ── Toast ── */
    .td-toast {
      position:fixed; bottom:2rem; right:2rem; z-index:80;
      display:flex; align-items:center; gap:.75rem;
      padding:.85rem 1.2rem; border-radius:12px;
      background:#0e1118; border:1px solid rgba(255,255,255,.1);
      box-shadow:0 20px 40px rgba(0,0,0,.5);
      font-size:.84rem; font-weight:600;
      animation:toastSlide 3.5s ease forwards;
    }
    .td-toast.success { border-color:rgba(16,185,129,.35); color:#34d399; }
    .td-toast.error   { border-color:rgba(239,68,68,.35);  color:#f87171; }
    .td-toast svg { width:18px; height:18px; flex-shrink:0; }

    /* ── spinner ── */
    .td-spinner { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,.2); border-top-color:#fff; border-radius:50%; animation:spin .6s linear infinite; }

    @media(max-width:700px){
      .td-stats  { grid-template-columns:1fr 1fr; }
      .td-actions{ grid-template-columns:1fr; }
      .td-body   { padding:1.5rem 1rem; }
    }
  `}</style>
);

const initials = (name = "") => name.split(" ").slice(0,2).map(n=>n[0]).join("").toUpperCase() || "?";

const fileTypeEmoji = (fileType) => {
  if (!fileType) return "📄";
  if (fileType.includes("pdf")) return "📕";
  if (fileType.includes("word") || fileType.includes("docx")) return "📘";
  if (fileType.includes("presentation") || fileType.includes("pptx")) return "📊";
  return "📄";
};

const fileTypeBg = (fileType) => {
  if (!fileType) return "rgba(255,255,255,.06)";
  if (fileType.includes("pdf")) return "rgba(239,68,68,.12)";
  if (fileType.includes("word") || fileType.includes("docx")) return "rgba(59,130,246,.12)";
  if (fileType.includes("presentation") || fileType.includes("pptx")) return "rgba(245,158,11,.12)";
  return "rgba(255,255,255,.06)";
};

const statusLabel = (s) => {
  if (s === "scheduled") return "Scheduled";
  if (s === "active")    return "Live Now";
  if (s === "ended")     return "Ended";
  return "Draft";
};

/* ── Icons ── */
const Ico = {
  Check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>,
  Send:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>,
  Quiz:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  Teach: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v10H4z"/><path d="M2 20l10-6 10 6"/></svg>,
  Upload:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  File:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
};

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacherName, setTeacherName] = useState("");
  const [myStudents, setMyStudents] = useState([]);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizzesLoading, setQuizzesLoading] = useState(true);

  // Send modal state
  const [sendModal, setSendModal] = useState(null); // { quiz }
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(null); // { message }
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3600);
  };

  // Pre-fill sensible defaults when opening modal
  const openSendModal = (quiz) => {
    const now = new Date();
    const startDefault = new Date(now.getTime() + 5 * 60000); // 5 min from now
    const endDefault   = new Date(now.getTime() + 65 * 60000); // +60 min after start
    const fmt = (d) => d.toISOString().slice(0, 16);
    setStartTime(fmt(startDefault));
    setEndTime(fmt(endDefault));
    setSendModal({ quiz });
  };

  const handleSend = async () => {
    if (!startTime || !endTime) { showToast("Please set both times", "error"); return; }
    if (new Date(endTime) <= new Date(startTime)) { showToast("End time must be after start time", "error"); return; }
    setSending(true);
    try {
      const result = await apiFetch("/api/quiz/schedule", {
        method: "POST",
        body: JSON.stringify({ quizId: sendModal.quiz.id, startTime, endTime }),
      });
      setSendModal(null);
      setSendSuccess({ message: result.message || "Quiz sent to students!" });
      // refresh quizzes
      loadQuizzes();
      setTimeout(() => setSendSuccess(null), 2800);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSending(false);
    }
  };

  const loadQuizzes = useCallback(async () => {
    setQuizzesLoading(true);
    try {
      const data = await apiFetch("/api/quiz/my-quizzes-teacher");
      setMyQuizzes(data.quizzes || []);
    } catch {
      setMyQuizzes([]);
    } finally {
      setQuizzesLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = getUser();
    if (!user) { navigate("/"); return; }
    if (user.role !== "teacher") { navigate("/student"); return; }
    setTeacherName(user.full_name || user.name || "Teacher");

    apiFetch("/api/admin/my-students")
      .then(setMyStudents)
      .catch(() => setMyStudents([]))
      .finally(() => setLoading(false));

    loadQuizzes();
  }, [navigate, loadQuizzes]);

  return (
    <>
      <Styles />

      {/* Toast */}
      {toast && (
        <div className={`td-toast ${toast.type}`}>
          {toast.type === "success" ? Ico.Check : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
          {toast.msg}
        </div>
      )}

      {/* Send modal */}
      {sendModal && (
        <div className="td-modal-overlay" onClick={() => !sending && setSendModal(null)}>
          <div className="td-modal" onClick={e => e.stopPropagation()}>
            <div className="td-modal-icon">{Ico.Send}</div>
            <h2 className="td-modal-title">Send Quiz to Students</h2>
            <p className="td-modal-sub">
              Scheduling <strong>"{sendModal.quiz.title}"</strong> will make it
              available to all <strong>{myStudents.length} student(s)</strong> assigned to you.
            </p>

            {sendModal.quiz.lecture && (
              <div style={{
                display:"flex", alignItems:"center", gap:".65rem",
                padding:".65rem .9rem", borderRadius:10,
                background:"rgba(255,255,255,.04)",
                border:"1px solid rgba(255,255,255,.08)",
                marginBottom:"1.2rem",
              }}>
                <span style={{fontSize:"1.1rem"}}>{fileTypeEmoji(sendModal.quiz.lecture.file_type)}</span>
                <div>
                  <div style={{fontSize:".8rem",fontWeight:700,color:"rgba(255,255,255,.8)"}}>
                    {sendModal.quiz.lecture.title}
                  </div>
                  <div style={{fontSize:".7rem",color:"rgba(255,255,255,.3)"}}>Source lecture</div>
                </div>
              </div>
            )}

            <p className="td-modal-label">Start Time</p>
            <input
              className="td-modal-input"
              type="datetime-local"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
            />

            <p className="td-modal-label">End Time</p>
            <input
              className="td-modal-input"
              type="datetime-local"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
            />

            <div className="td-modal-actions">
              <button className="td-btn-cancel" onClick={() => setSendModal(null)} disabled={sending}>Cancel</button>
              <button className="td-btn-send" onClick={handleSend} disabled={sending}>
                {sending ? <span className="td-spinner" /> : "✦ Send to Students"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send success overlay */}
      {sendSuccess && (
        <div className="td-send-success">
          <div className="td-conf-row">
            {["#6366f1","#10b981","#f59e0b","#ec4899"].map((c,i) => (
              <div key={i} className="td-conf" style={{background:c}} />
            ))}
          </div>
          <div className="td-send-success-ring">{Ico.Check}</div>
          <div className="td-send-success-text">
            <div className="td-send-success-title">Quiz Sent! 🚀</div>
            <div className="td-send-success-sub">{sendSuccess.message}</div>
          </div>
        </div>
      )}

      <div className="td-root">
        {/* Topbar */}
        <header className="td-topbar">
          <div className="td-logo">
            <div className="td-logo-icon">{Ico.Teach}</div>
            QuizSystem
          </div>
          <div className="td-topbar-right">
            <span className="td-chip">TEACHER</span>
            <button className="td-logout" onClick={() => { logout(); navigate("/"); }}>Sign out</button>
          </div>
        </header>

        <div className="td-body">
          {/* Welcome */}
          <div className="td-welcome">
            <div className="td-welcome-tag"><span /> Teacher Dashboard</div>
            <h1 className="td-name">Welcome back{teacherName ? `, ${teacherName.split(" ")[0]}` : ""}! 👋</h1>
            <p className="td-sub">Manage your students, lectures, and quizzes from here</p>
          </div>

          {/* Stats */}
          <div className="td-stats">
            <div className="td-stat">
              <p className="td-stat-label">My Students</p>
              <p className="td-stat-value">{loading ? "—" : myStudents.length}</p>
              <p className="td-stat-hint">assigned to you</p>
            </div>
            <div className="td-stat">
              <p className="td-stat-label">Quizzes Created</p>
              <p className="td-stat-value">{quizzesLoading ? "—" : myQuizzes.length}</p>
              <p className="td-stat-hint">{myQuizzes.filter(q=>q.status==="active").length} live now</p>
            </div>
            <div className="td-stat">
              <p className="td-stat-label">Avg. Student Points</p>
              <p className="td-stat-value">
                {loading || !myStudents.length ? "—"
                  : Math.round(myStudents.reduce((s,u) => s + (u.points||0), 0) / myStudents.length)}
              </p>
              <p className="td-stat-hint">across all students</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="td-actions">
            <div className="td-action-card" onClick={() => navigate("/upload-lecture")}>
              <div className="td-action-icon" style={{background:"rgba(30,58,138,.2)"}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <h3 className="td-action-title">Upload Lecture</h3>
              <p className="td-action-desc">Share PDF, DOCX, or PPTX materials</p>
            </div>
            <div className="td-action-card" onClick={() => navigate("/generate-quiz")}>
              <div className="td-action-icon" style={{background:"rgba(6,78,59,.25)"}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 className="td-action-title">Generate Quiz</h3>
              <p className="td-action-desc">Use AI to create quizzes from lectures</p>
            </div>
          </div>

          {/* ── My Quizzes section ── */}
          <div className="td-section">
            <div className="td-section-header">
              <h2 className="td-section-title">My Quizzes</h2>
              <span className="td-section-count">{myQuizzes.length}</span>
            </div>

            {quizzesLoading ? (
              <div className="td-quiz-list">
                {[1,2,3].map(i => (
                  <div key={i} style={{background:"rgba(255,255,255,.035)",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,padding:"1.1rem 1.4rem",display:"flex",alignItems:"center",gap:"1rem"}}>
                    <div style={{width:44,height:44,borderRadius:12,background:"rgba(255,255,255,.05)"}} />
                    <div style={{flex:1}}>
                      <div className="skeleton" style={{width:"45%",marginBottom:".4rem"}} />
                      <div className="skeleton" style={{width:"65%"}} />
                    </div>
                    <div className="skeleton" style={{width:70}} />
                  </div>
                ))}
              </div>
            ) : myQuizzes.length === 0 ? (
              <div className="td-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
                No quizzes yet — generate one from your lectures above.
              </div>
            ) : (
              <div className="td-quiz-list">
                {myQuizzes.map(quiz => (
                  <div key={quiz.id} className={`td-quiz-card status-${quiz.status}`}>
                    {/* File icon */}
                    <div className="td-quiz-file-icon"
                      style={{background: fileTypeBg(quiz.lecture?.file_type)}}>
                      {fileTypeEmoji(quiz.lecture?.file_type)}
                    </div>

                    {/* Info */}
                    <div className="td-quiz-info">
                      <div className="td-quiz-title">{quiz.title}</div>
                      <div className="td-quiz-source">
                        {Ico.File}
                        {quiz.lecture?.title
                          ? <span>From: <strong style={{color:"rgba(255,255,255,.55)"}}>{quiz.lecture.title}</strong></span>
                          : <span style={{color:"rgba(255,255,255,.2)"}}>No lecture linked</span>
                        }
                      </div>
                      {quiz.start_time && (
                        <div style={{fontSize:".7rem",color:"rgba(255,255,255,.25)",marginTop:".2rem",display:"flex",alignItems:"center",gap:".3rem"}}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          {new Date(quiz.start_time).toLocaleString()} → {new Date(quiz.end_time).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="td-quiz-meta">
                      <span className="td-quiz-q-count">{quiz.question_count}Q</span>
                      <span className={`td-quiz-status-badge ${quiz.status}`}>
                        {statusLabel(quiz.status)}
                      </span>
                    </div>

                    {/* Send button */}
                    {quiz.status !== "ended" && (
                      <button
                        className="td-quiz-send-btn"
                        onClick={e => { e.stopPropagation(); openSendModal(quiz); }}
                      >
                        {Ico.Send}&nbsp;&nbsp;{quiz.status === "draft" ? "Send" : "Reschedule"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── My Students section ── */}
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
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
                No students assigned yet. Contact your admin.
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
                      {s.streak > 0 && <span className="td-pill td-pill-streak">🔥 {s.streak}</span>}
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