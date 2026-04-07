import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/api";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000" || "https://backend-7lik.onrender.com";

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

  let data;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    throw new Error(`Server returned ${res.status}: ${text.substring(0, 100)}`);
  }

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
      background:#090708;
      background-image:
        radial-gradient(ellipse 65% 45% at 5% 0%, rgba(128,22,39,.28) 0%,transparent 70%),
        radial-gradient(ellipse 50% 40% at 95% 100%, rgba(251,191,36,.1) 0%,transparent 65%);
      font-family:'Syne',sans-serif; color:#e2e8f0;
    }

    /* ── Topbar ── */
    .td-topbar {
      display:flex; align-items:center; justify-content:space-between;
      padding:0 2.5rem; height:62px;
      background:rgba(18,10,12,.72); backdrop-filter:blur(14px);
      border-bottom:1px solid rgba(255,255,255,.07);
      animation:slideDown .4s ease both; position:sticky; top:0; z-index:30;
    }
    .td-logo { display:flex; align-items:center; gap:.65rem; font-size:1rem; font-weight:800; color:#fff; }
    .td-logo-icon {
      width:30px; height:30px; border-radius:8px;
      background:linear-gradient(135deg,#7f1d2d,#fbbf24);
      display:flex; align-items:center; justify-content:center;
    }
    .td-logo-icon svg { width:16px; height:16px; color:#fff; }
    .td-topbar-right { display:flex; align-items:center; gap:.9rem; }
    .td-chip { font-family:'DM Mono',monospace; font-size:.67rem; padding:.2rem .65rem; border-radius:999px; background:rgba(251,191,36,.12); border:1px solid rgba(251,191,36,.3); color:#fde68a; letter-spacing:.06em; }
    .td-logout { padding:.36rem .85rem; border-radius:8px; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.05); color:rgba(255,255,255,.45); font-family:'Syne',sans-serif; font-size:.78rem; cursor:pointer; transition:all .15s; }
    .td-logout:hover { background:rgba(255,255,255,.1); color:#fff; }

    /* ── Body ── */
    .td-layout { display:grid; grid-template-columns:220px 1fr; gap:1rem; max-width:1280px; margin:0 auto; padding:1.2rem; }
    .td-side {
      background:linear-gradient(140deg, rgba(255,255,255,.09), rgba(255,255,255,.02));
      border:1px solid rgba(255,255,255,.12);
      backdrop-filter:blur(16px);
      border-radius:14px;
      padding:1rem;
      height:fit-content;
      position:sticky; top:76px;
    }
    .td-side-item {
      display:flex; align-items:center; gap:.55rem;
      padding:.6rem .7rem; border-radius:9px;
      color:rgba(255,255,255,.74); font-size:.82rem; cursor:pointer;
      border:1px solid transparent;
    }
    .td-side-item svg { width:14px; height:14px; }
    .td-side-item.active {
      background:rgba(251,191,36,.15);
      color:#fde68a;
      border-color:rgba(251,191,36,.35);
    }
    .td-body { max-width:none; margin:0; padding:1.2rem 1.2rem 2rem; }

    /* ── Welcome ── */
    .td-welcome { margin-bottom:2.5rem; animation:fadeUp .5s ease both; }
    .td-welcome-tag { display:inline-flex; align-items:center; gap:.4rem; font-size:.72rem; letter-spacing:.1em; text-transform:uppercase; color:rgba(147,197,253,.6); margin-bottom:.6rem; }
    .td-welcome-tag span { display:inline-block; width:6px; height:6px; border-radius:50%; background:#3b82f6; }
    .td-name { font-size:2rem; font-weight:800; color:#fff; letter-spacing:-.03em; }
    .td-sub  { font-size:.88rem; color:rgba(255,255,255,.35); margin-top:.35rem; }

    /* ── Stats ── */
    .td-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:2.5rem; animation:fadeUp .5s .1s ease both; }
    .td-stat { background:linear-gradient(140deg, rgba(255,255,255,.1), rgba(255,255,255,.02)); border:1px solid rgba(255,255,255,.13); backdrop-filter:blur(16px); border-radius:14px; padding:1.2rem 1.4rem; }
    .td-stat-label { font-size:.7rem; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.28); margin-bottom:.5rem; }
    .td-stat-value { font-size:1.9rem; font-weight:800; color:#fff; }
    .td-stat-hint  { font-size:.72rem; color:rgba(255,255,255,.22); margin-top:.35rem; }

    /* ── Quick actions ── */
    .td-actions { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:2.5rem; animation:fadeUp .5s .15s ease both; }
    .td-settings-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem; }
    .td-action-card { background:linear-gradient(140deg, rgba(255,255,255,.1), rgba(255,255,255,.015)); border:1px solid rgba(255,255,255,.11); backdrop-filter:blur(16px); border-radius:16px; padding:1.5rem; cursor:pointer; transition:all .2s; }
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
      background:linear-gradient(140deg, rgba(255,255,255,.08), rgba(255,255,255,.02));
      border:1px solid rgba(255,255,255,.11);
      backdrop-filter:blur(16px);
      border-radius:14px; padding:1.1rem 1.4rem;
      display:flex; align-items:center; gap:1rem;
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
    
    .td-quiz-actions { display:flex; align-items:center; gap:0.5rem; flex-shrink:0; }
    .td-quiz-send-btn {
      padding:.25rem .62rem; border-radius:8px;
      border:1px solid rgba(251,191,36,.38);
      background:rgba(251,191,36,.12);
      color:#fde68a; font-family:'Syne',sans-serif;
      font-size:.7rem; font-weight:700; cursor:pointer;
      transition:all .15s; white-space:nowrap;
    }
    .td-quiz-send-btn:hover { background:rgba(251,191,36,.2); border-color:rgba(251,191,36,.58); }
    .td-quiz-send-btn:disabled { opacity:.45; cursor:not-allowed; }
    
    .td-quiz-delete-btn {
      padding:.38rem .7rem; border-radius:9px;
      border:1px solid rgba(239,68,68,.35);
      background:rgba(239,68,68,.1);
      color:#f87171; font-family:'Syne',sans-serif;
      font-size:.76rem; font-weight:700; cursor:pointer;
      transition:all .15s; white-space:nowrap;
      display:inline-flex; align-items:center; gap:4px;
    }
    .td-quiz-delete-btn:hover { background:rgba(239,68,68,.2); border-color:rgba(239,68,68,.6); }
    .td-quiz-delete-btn:disabled { opacity:.55; cursor:not-allowed; }

    /* ── Students grid ── */
    .td-students-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:.9rem; }
    .td-student-card { background:linear-gradient(140deg, rgba(255,255,255,.08), rgba(255,255,255,.015)); border:1px solid rgba(255,255,255,.11); backdrop-filter:blur(14px); border-radius:14px; padding:1.1rem 1.25rem; transition:all .15s; }
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
      width:100%; max-width:520px;
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
    
    .td-student-select-list {
      max-height: 220px;
      overflow-y: auto;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px;
      margin-bottom: 1.2rem;
      padding: 0.5rem;
    }
    .td-student-checkbox-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0.5rem;
      border-radius: 10px;
      transition: background 0.1s;
      cursor: pointer;
    }
    .td-student-checkbox-item:hover { background: rgba(255,255,255,.04); }
    .td-student-checkbox-item input {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #6366f1;
    }
    .td-student-checkbox-info {
      flex: 1;
      font-size: 0.85rem;
    }
    .td-student-checkbox-name { font-weight: 600; color: #fff; }
    .td-student-checkbox-email { font-size: 0.7rem; color: rgba(255,255,255,.4); }
    .td-select-all-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-bottom: 1px solid rgba(255,255,255,.08);
      margin-bottom: 0.5rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: rgba(255,255,255,.7);
    }
    .td-select-all-row input {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #6366f1;
    }

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
      .td-layout { grid-template-columns:1fr; padding:.8rem; }
      .td-side { position:static; }
      .td-stats  { grid-template-columns:1fr 1fr; }
      .td-actions{ grid-template-columns:1fr; }
      .td-body   { padding:1.5rem 1rem; }
      .td-settings-grid { grid-template-columns:1fr; }
    }
      .td-pw-modal-overlay {
  position:fixed; inset:0; z-index:60;
  background:rgba(0,0,0,.7); backdrop-filter:blur(8px);
  display:flex; align-items:center; justify-content:center; padding:1.5rem;
  animation:fadeIn .2s ease both;
}
.td-pw-modal {
  background:#0e1118; border:1px solid rgba(255,255,255,.1);
  border-radius:22px; padding:2rem 2.2rem;
  width:100%; max-width:400px;
  animation:modalIn .28s cubic-bezier(.34,1.56,.64,1) both;
  box-shadow:0 40px 80px rgba(0,0,0,.7);
}
.td-pw-input {
  width:100%; padding:.65rem .9rem;
  background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
  border-radius:10px; color:#fff;
  font-family:'Syne',sans-serif; font-size:.85rem;
  outline:none; margin-bottom:.9rem; transition:border-color .2s;
}
.td-pw-input:focus { border-color:rgba(99,102,241,.5); }
.td-pw-label {
  display:block; font-size:.68rem; letter-spacing:.09em;
  text-transform:uppercase; color:rgba(165,180,252,.5);
  margin-bottom:.4rem; font-weight:600;
}
.td-pw-error {
  padding:.55rem .75rem; border-radius:8px;
  background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.25);
  color:#f87171; font-size:.78rem; margin-bottom:.8rem;
}
.td-pw-success {
  text-align:center; padding:1.5rem 0;
}
.td-pw-success-ring {
  width:64px; height:64px; border-radius:50%;
  background:rgba(16,185,129,.12); border:2px solid rgba(16,185,129,.4);
  display:flex; align-items:center; justify-content:center;
  margin:0 auto .9rem; animation:successRing .5s ease both;
}
.td-pw-success-ring svg { width:30px; height:30px; color:#34d399; }
.td-change-pw-btn {
  padding:.36rem .85rem; border-radius:8px;
  border:1px solid rgba(251,191,36,.35);
  background:rgba(251,191,36,.12); color:#fde68a;
  font-family:'Syne',sans-serif; font-size:.78rem; font-weight:600;
  display:inline-flex; align-items:center; gap:.35rem;
  cursor:pointer; transition:all .15s;
}
.td-change-pw-btn svg { width:14px; height:14px; }
.td-change-pw-btn:hover { background:rgba(251,191,36,.2); border-color:rgba(251,191,36,.6); }
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
  Settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1v.17a2 2 0 1 1-4 0V21a1.65 1.65 0 0 0-.33-1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1-.33H2.83a2 2 0 1 1 0-4H3a1.65 1.65 0 0 0 1-.33 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .33-1V2.83a2 2 0 1 1 4 0V3a1.65 1.65 0 0 0 .33 1 1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.28.3.48.67.6 1 .08.34.08.7 0 1-.12.37-.32.74-.6 1z"/></svg>,
  Check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>,
  Send:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>,
  Quiz:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  Teach: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v10H4z"/><path d="M2 20l10-6 10 6"/></svg>,
  Upload:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  File:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
  Trash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M10 11v5M14 11v5"/></svg>,
};

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("overview");
  const [teacherName, setTeacherName] = useState("");
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ fullName: "", subject: "", photoUrl: "" });
  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubjectDraft, setNewSubjectDraft] = useState("");
  const [myStudents, setMyStudents] = useState([]);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [certRequests, setCertRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const [certLoading, setCertLoading] = useState(true);
  const [attendanceTimeline, setAttendanceTimeline] = useState([]);
  const [deletingQuizId, setDeletingQuizId] = useState(null);
  const [requestingCertId, setRequestingCertId] = useState(null);
  const [assigningSubjectStudentId, setAssigningSubjectStudentId] = useState(null);
  const [selectedStudentSubject, setSelectedStudentSubject] = useState({});

  // Send modal state
  const [sendModal, setSendModal] = useState(null); // { quiz }
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(null); // { message }
  const [toast, setToast] = useState(null);

  const [pwForm, setPwForm]     = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError]   = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

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
    // Reset selected students to empty array (teacher must choose)
    setSelectedStudentIds([]);
    setSendModal({ quiz });
  };

  const handleSelectAllStudents = (e) => {
    if (e.target.checked) {
      setSelectedStudentIds(myStudents.map(s => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleToggleStudent = (studentId) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleChangePassword = async (e) => {
  e.preventDefault();
  setPwError("");
  if (pwForm.next.length < 6) {
    setPwError("New password must be at least 6 characters.");
    return;
  }
  if (pwForm.next !== pwForm.confirm) {
    setPwError("New passwords do not match.");
    return;
  }
  if (pwForm.current === pwForm.next) {
    setPwError("New password must be different from the current one.");
    return;
  }
  setPwLoading(true);
  try {
    
    await apiFetch("/api/admin/change-password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
    });
    setPwSuccess(true);
    setPwForm({ current: "", next: "", confirm: "" });
  } catch (err) {
    setPwError(err.message);
  } finally {
    setPwLoading(false);
  }
};

  const handleSend = async () => {
    if (!startTime || !endTime) { showToast("Please set both times", "error"); return; }
    if (new Date(endTime) <= new Date(startTime)) { showToast("End time must be after start time", "error"); return; }
    if (selectedStudentIds.length === 0) { showToast("Please select at least one student", "error"); return; }
    
    setSending(true);
    try {
      const result = await apiFetch("/api/quiz/schedule", {
        method: "POST",
        body: JSON.stringify({ 
          quizId: sendModal.quiz.id, 
          startTime, 
          endTime,
          studentIds: selectedStudentIds   // send selected student IDs to backend
        }),
      });
      setSendModal(null);
      setSendSuccess({ message: result.message || `Quiz sent to ${selectedStudentIds.length} student(s)!` });
      // refresh quizzes
      loadQuizzes();
      setTimeout(() => setSendSuccess(null), 2800);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSending(false);
    }
  };

  const deleteQuiz = async (quizId, quizTitle) => {
    if (!window.confirm(`Delete quiz "${quizTitle}"? This action cannot be undone.`)) return;
    setDeletingQuizId(quizId);
    try {
      await apiFetch(`/api/quiz/${quizId}`, { method: "DELETE" });
      showToast(`Quiz "${quizTitle}" deleted`, "success");
      loadQuizzes(); // refresh list
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDeletingQuizId(null);
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

  const loadCertRequests = useCallback(async () => {
    setCertLoading(true);
    try {
      const data = await apiFetch("/api/admin/my-certificate-requests");
      setCertRequests(data || []);
    } catch {
      setCertRequests([]);
    } finally {
      setCertLoading(false);
    }
  }, []);

  const loadAttendanceTimeline = useCallback(async () => {
    try {
      const data = await apiFetch("/api/quiz/attendance/teacher/timeline");
      setAttendanceTimeline(Array.isArray(data) ? data : []);
    } catch {
      setAttendanceTimeline([]);
    }
  }, []);

  const requestCertificate = async (studentId) => {
    setRequestingCertId(studentId);
    try {
      await apiFetch("/api/admin/certificate-requests", {
        method: "POST",
        body: JSON.stringify({ studentId }),
      });
      showToast("Certificate request submitted", "success");
      loadCertRequests();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setRequestingCertId(null);
    }
  };

  const refreshDashboard = async () => {
    setLoading(true);
    setQuizzesLoading(true);
    await Promise.all([
      loadProfile(),
      apiFetch("/api/admin/my-students").then(setMyStudents).catch(() => setMyStudents([])),
      loadQuizzes(),
      loadCertRequests(),
      loadAttendanceTimeline(),
    ]);
    setLoading(false);
    setQuizzesLoading(false);
    showToast("Dashboard refreshed", "success");
  };

  const resetStudentPoints = async () => {
    if (!window.confirm("Reset points for all your assigned students?")) return;
    try {
      const r = await apiFetch("/api/admin/my-students/reset-points", { method: "PATCH" });
      showToast(r.message || "Points reset", "success");
      await refreshDashboard();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const resetSingleStudentPoints = async (student) => {
    if (!window.confirm(`Reset points for ${student.full_name}?`)) return;
    try {
      const r = await apiFetch(`/api/admin/my-students/${student.id}/reset-points`, { method: "PATCH" });
      showToast(r.message || "Student points reset", "success");
      setMyStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, points: 0, streak: 0, tier: "Beginner" } : s))
      );
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const printApprovedCertificate = (req) => {
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    w.document.write(`
      <html><head><title>Certificate</title></head>
      <body style="font-family:Georgia,serif;padding:40px;">
        <h1>Certificate of Achievement</h1>
        <p>This certifies that <strong>${req.student?.full_name || "Student"}</strong> has received recognition.</p>
        <p>Teacher: ${teacherName || "-"}</p>
        <p>Approved: ${req.approved_at ? new Date(req.approved_at).toLocaleString() : "-"}</p>
      </body></html>
    `);
    w.document.close();
    w.focus();
    w.print();
  };

  const teacherSubjectOptions = (profileForm.subject || "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  const assignStudentSubject = async (studentId, subject, append = false) => {
    if (!subject) return;
    setAssigningSubjectStudentId(studentId);
    try {
      const student = myStudents.find((s) => s.id === studentId);
      const currentCourse = (student?.course || "").trim();
      let nextSubject = subject;
      if (append) {
        const list = currentCourse.split("|").map((x) => x.trim()).filter(Boolean);
        if (!list.some((x) => x.toLowerCase() === subject.toLowerCase())) {
          list.push(subject);
        }
        nextSubject = list.join(" | ");
      }
      await apiFetch(`/api/admin/my-students/${studentId}/subject`, {
        method: "PATCH",
        body: JSON.stringify({ subject: nextSubject }),
      });
      setMyStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, course: nextSubject } : s)));
      setSelectedStudentSubject((prev) => ({ ...prev, [studentId]: "" }));
      showToast(append ? "Additional subject added to student" : "Subject assigned to student", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setAssigningSubjectStudentId(null);
    }
  };

  const loadProfile = useCallback(async () => {
    try {
      const profile = await apiFetch("/api/admin/me");
      setTeacherProfile(profile);
      setTeacherName(profile.full_name || "Teacher");
      setProfileForm({
        fullName: profile.full_name || "",
        subject: profile.subject || "",
        photoUrl: localStorage.getItem(`teacher_photo_${profile.id}`) || "",
      });
    } catch {
      const user = getUser();
      setTeacherName(user?.full_name || user?.name || "Teacher");
    }
  }, []);

  const updateProfile = async (payload, successMsg) => {
    try {
      const result = await apiFetch("/api/admin/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setTeacherProfile(result.user);
      setTeacherName(result.user.full_name);
      if (result.user?.id) {
        localStorage.setItem(`teacher_photo_${result.user.id}`, profileForm.photoUrl || "");
      }
      showToast(successMsg, "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };
  const saveFullName = async (e) => {
    e.preventDefault();
    await updateProfile({ fullName: profileForm.fullName }, "Full name updated");
  };
  const saveSubject = async (e) => {
    e.preventDefault();
    const currentSubject = (profileForm.subject || "").trim();
    const draftSubject = (newSubjectDraft || "").trim();
    const nextSubject = addingSubject ? draftSubject : currentSubject;
    if (!nextSubject) {
      showToast("Please enter a subject", "error");
      return;
    }

    // In "Add New Subject" mode, append instead of replacing.
    let subjectToSave = nextSubject;
    if (addingSubject) {
      const existing = currentSubject
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!existing.some((s) => s.toLowerCase() === draftSubject.toLowerCase())) {
        existing.push(draftSubject);
      }
      subjectToSave = existing.join(" | ");
    }

    setProfileForm((p) => ({ ...p, subject: subjectToSave }));
    await updateProfile({ subject: subjectToSave }, addingSubject ? "New subject added" : "Subject updated");
    setAddingSubject(false);
    setNewSubjectDraft("");
  };
  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfileForm((p) => ({ ...p, photoUrl: String(reader.result || "") }));
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const user = getUser();
    if (!user) { navigate("/"); return; }
    if (user.role !== "teacher") { navigate("/student"); return; }
    // Prefer Supabase profile values for full_name/subject
    loadProfile();

    apiFetch("/api/admin/my-students")
      .then(setMyStudents)
      .catch(() => setMyStudents([]))
      .finally(() => setLoading(false));

    loadQuizzes();
    loadCertRequests();
    loadAttendanceTimeline();
  }, [navigate, loadQuizzes, loadProfile, loadCertRequests, loadAttendanceTimeline]);

  const sectionSummary = myStudents.reduce((acc, s) => {
    const key = s.section || "Unspecified";
    if (!acc[key]) acc[key] = { total: 0, count: 0 };
    const pct = Math.max(0, Math.min(100, Number(s.points || 0)));
    acc[key].total += pct;
    acc[key].count += 1;
    return acc;
  }, {});
  const sectionEntries = Object.entries(sectionSummary).map(([section, v]) => ({
    section,
    avg: v.count ? +(v.total / v.count).toFixed(1) : 0,
    count: v.count,
  }));
  const topSection = sectionEntries.sort((a, b) => b.avg - a.avg)[0] || { section: "—", avg: 0, count: 0 };
  const quizSpark = myQuizzes.slice(0, 7).reverse().map((q, i) => i + 1);
  const pointsLeaderboard = [...myStudents].sort((a, b) => (b.points || 0) - (a.points || 0));
  const topPointStudents = pointsLeaderboard.slice(0, 8);
  const topPointLabels = topPointStudents.map((s) => s.full_name?.split(" ")[0] || "Student");
  const topPointValues = topPointStudents.map((s) => s.points || 0);
  const attendanceDates = attendanceTimeline.map((d) =>
    new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );
  const presentSeries = attendanceTimeline.map((d) => d.present || 0);
  const absentSeries = attendanceTimeline.map((d) => d.absent || 0);

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

      {/* Send modal with student selection */}
      {sendModal && (
        <div className="td-modal-overlay" onClick={() => !sending && setSendModal(null)}>
          <div className="td-modal" onClick={e => e.stopPropagation()}>
            <div className="td-modal-icon">{Ico.Send}</div>
            <h2 className="td-modal-title">Send Quiz to Students</h2>
            <p className="td-modal-sub">
              Scheduling <strong>"{sendModal.quiz.title}"</strong> – choose which students will receive it.
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

            <p className="td-modal-label">Select Students ({myStudents.length} available)</p>
            <div className="td-student-select-list">
              <div className="td-select-all-row">
                <input
                  type="checkbox"
                  checked={selectedStudentIds.length === myStudents.length && myStudents.length > 0}
                  onChange={handleSelectAllStudents}
                />
                <span>Select All</span>
              </div>
              {myStudents.map(student => (
                <label key={student.id} className="td-student-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(student.id)}
                    onChange={() => handleToggleStudent(student.id)}
                  />
                  <div className="td-student-checkbox-info">
                    <div className="td-student-checkbox-name">{student.full_name}</div>
                    <div className="td-student-checkbox-email">{student.email}</div>
                  </div>
                </label>
              ))}
              {myStudents.length === 0 && (
                <div style={{ padding: "1rem", textAlign: "center", color: "rgba(255,255,255,.3)" }}>
                  No students assigned yet.
                </div>
              )}
            </div>

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
                {sending ? <span className="td-spinner" /> : `✦ Send to ${selectedStudentIds.length} student(s)`}
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
            <span className="td-chip">{teacherProfile?.subject || "TEACHER"}</span>
            <button className="td-change-pw-btn" onClick={refreshDashboard}>Refresh</button>
            <button className="td-change-pw-btn" onClick={resetStudentPoints}>Reset Points</button>
            <button className="td-logout" onClick={() => { logout(); navigate("/"); }}>Sign out</button>
          </div>
        </header>

        <div className="td-layout">
          <aside className="td-side">
            <div
              className={`td-side-item ${activeView === "overview" ? "active" : ""}`}
              onClick={() => setActiveView("overview")}
            >
              {Ico.Quiz} Overview
            </div>
            <div
              className={`td-side-item ${activeView === "settings" ? "active" : ""}`}
              onClick={() => { setActiveView("settings"); setPwError(""); setPwSuccess(false); }}
            >
              {Ico.Settings} Settings
            </div>
          </aside>

          <div className="td-body">
          {activeView === "overview" && (
          <>
          {/* Welcome */}
          <div className="td-welcome">
            {profileForm.photoUrl ? (
              <img
                src={profileForm.photoUrl}
                alt="Teacher profile"
                style={{ width: 56, height: 56, borderRadius: 14, objectFit: "cover", border: "1px solid rgba(255,255,255,.2)", marginBottom: ".75rem" }}
              />
            ) : null}
            <div className="td-welcome-tag"><span /> Teacher Dashboard</div>
            <h1 className="td-name">Welcome back{teacherName ? `, ${teacherName.split(" ")[0]}` : ""}! 👋</h1>
            <p className="td-sub">
              Manage your students, lectures, and quizzes from here
              {teacherProfile?.subject ? ` · Subject: ${teacherProfile.subject}` : " · Subject not assigned yet"}
            </p>
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
              <div style={{ marginTop: ".55rem" }}>
                <SparkLineChart data={quizSpark.length ? quizSpark : [0]} height={48} color="#fbbf24" />
                <div style={{ fontSize: ".64rem", color: "rgba(255,255,255,.45)", marginTop: ".25rem" }}>
                  {myQuizzes[0]?.created_at ? `Latest: ${new Date(myQuizzes[0].created_at).toLocaleString()}` : "No quiz date yet"}
                </div>
              </div>
            </div>
            <div className="td-stat">
              <p className="td-stat-label">Top Section Avg. %</p>
              <p className="td-stat-value">
                {loading || !myStudents.length ? "—" : `${topSection.avg}%`}
              </p>
              <p className="td-stat-hint">{topSection.section} · {topSection.count} student(s)</p>
            </div>
          </div>

          <div className="td-section" style={{ marginBottom: "1.6rem" }}>
            <div className="td-section-header">
              <h2 className="td-section-title">Attendance by Date</h2>
            </div>
            <div className="td-stat">
              <LineChart
                xAxis={[{ scaleType: "point", data: attendanceDates.length ? attendanceDates : ["No data"] }]}
                series={[
                  { data: presentSeries.length ? presentSeries : [0], curve: "linear", label: "Present", color: "#34d399" },
                  { data: absentSeries.length ? absentSeries : [0], curve: "linear", label: "Absent", color: "#f87171" },
                ]}
                height={220}
              />
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

                    {/* Actions: Send & Delete buttons */}
                    <div className="td-quiz-actions">
                      {quiz.status !== "ended" && (
                        <button
                          className="td-quiz-send-btn"
                          disabled={deletingQuizId === quiz.id}
                          onClick={e => { e.stopPropagation(); openSendModal(quiz); }}
                        >
                          {Ico.Send}&nbsp;&nbsp;{quiz.status === "draft" ? "Send" : "Reschedule"}
                        </button>
                      )}
                      <button
                        className="td-quiz-delete-btn"
                        disabled={deletingQuizId === quiz.id}
                        onClick={e => { e.stopPropagation(); deleteQuiz(quiz.id, quiz.title); }}
                        title="Delete Quiz"
                      >
                        {deletingQuizId === quiz.id ? <span className="td-spinner" /> : Ico.Trash}
                      </button>
                    </div>
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
                    <div style={{ marginTop: ".55rem" }}>
                      <button
                        type="button"
                        className="td-quiz-delete-btn"
                        onClick={() => resetSingleStudentPoints(s)}
                        title="Reset this student's points"
                      >
                        {Ico.Trash} Reset Points
                      </button>
                    </div>
                    <div style={{ marginTop: ".7rem" }}>
                      <select
                        className="td-modal-input"
                        value={selectedStudentSubject[s.id] || ""}
                        onChange={(e) => setSelectedStudentSubject((prev) => ({ ...prev, [s.id]: e.target.value }))}
                        disabled={assigningSubjectStudentId === s.id || teacherSubjectOptions.length === 0}
                        style={{ marginBottom: 0, padding: ".45rem .65rem", fontSize: ".76rem" }}
                      >
                        <option value="">Select subject…</option>
                        {teacherSubjectOptions.map((subj) => (
                          <option key={subj} value={subj}>{subj}</option>
                        ))}
                      </select>
                      <div style={{ display: "flex", gap: ".45rem", marginTop: ".45rem" }}>
                        <button
                          className="td-quiz-send-btn"
                          type="button"
                          disabled={assigningSubjectStudentId === s.id || !(selectedStudentSubject[s.id] || "").trim()}
                          onClick={() => assignStudentSubject(s.id, selectedStudentSubject[s.id], false)}
                        >
                          Set Subject
                        </button>
                        <button
                          className="td-btn-cancel"
                          type="button"
                          style={{ padding: ".28rem .55rem", fontSize: ".7rem" }}
                          disabled={assigningSubjectStudentId === s.id || !(selectedStudentSubject[s.id] || "").trim()}
                          onClick={() => assignStudentSubject(s.id, selectedStudentSubject[s.id], true)}
                        >
                          Add Subject
                        </button>
                      </div>
                      <p className="td-stat-hint" style={{ marginTop: ".35rem", color: "#fde68a" }}>
                        Assigned: {s.course && s.course.trim() ? s.course : "None yet"}
                      </p>
                      <p className="td-stat-hint" style={{ marginTop: ".3rem" }}>
                        {teacherSubjectOptions.length === 0 ? "Add subjects in Settings first." : "Subjects handled by teacher"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
              <div className="td-stat">
                <p className="td-stat-label">Simple Bar Chart - Highest Points</p>
                <BarChart
                  xAxis={[{ scaleType: "band", data: topPointLabels.length ? topPointLabels : ["No data"] }]}
                  series={[{ data: topPointValues.length ? topPointValues : [0], color: "#fbbf24" }]}
                  height={220}
                />
              </div>
              <div className="td-stat">
                <p className="td-stat-label">Stacked Area Chart - Top Scoring Trends</p>
                <LineChart
                  xAxis={[{ scaleType: "point", data: topPointLabels.length ? topPointLabels : ["No data"] }]}
                  series={[
                    { data: topPointValues.length ? topPointValues : [0], area: true, stack: "total", color: "#7f1d2d", label: "Points" },
                    { data: topPointValues.length ? topPointValues.map((v) => Math.round(v * 0.25)) : [0], area: true, stack: "total", color: "#fbbf24", label: "Momentum" },
                  ]}
                  height={220}
                />
              </div>
            </div>
          </div>

          <div className="td-section">
            <div className="td-section-header">
              <h2 className="td-section-title">Leaderboard (Ahead / Behind)</h2>
              <span className="td-section-count">{pointsLeaderboard.length}</span>
            </div>
            <div className="td-quiz-list">
              {pointsLeaderboard.map((s, i) => {
                const top = pointsLeaderboard[0]?.points || 0;
                const gap = top - (s.points || 0);
                return (
                  <div key={s.id} className="td-quiz-card">
                    <div className="td-avatar" style={{ width: 34, height: 34 }}>{i + 1}</div>
                    <div className="td-quiz-info">
                      <div className="td-quiz-title">{s.full_name}</div>
                      <div className="td-quiz-source">
                        {gap === 0 ? "Ahead (Top)" : `${gap} pts behind top`}
                      </div>
                    </div>
                    <div className="td-quiz-meta">
                      <span className="td-quiz-q-count">{s.points || 0} pts</span>
                    </div>
                    <div className="td-quiz-actions">
                      <button
                        className="td-quiz-send-btn"
                        disabled={requestingCertId === s.id}
                        onClick={() => requestCertificate(s.id)}
                        title="Create certificate request"
                      >
                        {requestingCertId === s.id ? <span className="td-spinner" /> : "Create Certificate"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="td-section">
            <div className="td-section-header">
              <h2 className="td-section-title">Pending Certificate Requests</h2>
              <span className="td-section-count">{certLoading ? "…" : certRequests.length}</span>
            </div>
            {certLoading ? (
              <div className="td-empty">Loading requests…</div>
            ) : certRequests.length === 0 ? (
              <div className="td-empty">No certificate requests yet.</div>
            ) : (
              <div className="td-quiz-list">
                {certRequests.map((r) => (
                  <div key={r.id} className="td-quiz-card">
                    <div className="td-quiz-info">
                      <div className="td-quiz-title">{r.student?.full_name}</div>
                      <div className="td-quiz-source">
                        Status: <strong style={{ color: "#fde68a", marginLeft: 4 }}>{r.status}</strong>
                      </div>
                    </div>
                    <div className="td-quiz-meta">
                      <span className="td-quiz-q-count">{r.student?.points || 0} pts</span>
                    </div>
                    <div className="td-quiz-actions">
                      {r.status === "approved" ? (
                        <button className="td-quiz-send-btn" onClick={() => printApprovedCertificate(r)}>Print</button>
                      ) : (
                        <span className="td-quiz-q-count">Waiting for admin</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </>
          )}

          {activeView === "settings" && (
            <div className="td-section">
              <div className="td-section-header">
                <h2 className="td-section-title">Settings</h2>
              </div>
              <div className="td-settings-grid">
                <div className="td-stat">
                  <p className="td-stat-label">Profile Photo</p>
                  {profileForm.photoUrl ? (
                    <img src={profileForm.photoUrl} alt="Teacher profile" style={{ width: 70, height: 70, borderRadius: 14, objectFit: "cover", border: "1px solid rgba(255,255,255,.2)", marginBottom: ".7rem" }} />
                  ) : <p className="td-stat-hint">No photo selected</p>}
                  <input type="file" accept="image/*" onChange={handlePhotoFileChange} className="td-modal-input" />
                  <p className="td-stat-hint">Choose from your folders and save locally for this browser.</p>
                </div>

                <form className="td-stat" onSubmit={saveFullName}>
                  <p className="td-stat-label">Full Name</p>
                  <input
                    className="td-modal-input"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                    placeholder="Your full name"
                    required
                  />
                  <button className="td-btn-send" type="submit">Save Full Name</button>
                </form>

                <form className="td-stat" onSubmit={saveSubject}>
                  <p className="td-stat-label">Subject</p>
                  <input
                    className="td-modal-input"
                    value={profileForm.subject}
                    onChange={(e) => setProfileForm((p) => ({ ...p, subject: e.target.value }))}
                    placeholder="Current subject"
                  />
                  <button
                    className="td-btn-cancel"
                    type="button"
                    onClick={() => setAddingSubject((v) => !v)}
                    style={{ marginBottom: ".7rem" }}
                  >
                    {addingSubject ? "Cancel New Subject" : "Add New Subject"}
                  </button>
                  {addingSubject && (
                    <input
                      className="td-modal-input"
                      value={newSubjectDraft}
                      onChange={(e) => setNewSubjectDraft(e.target.value)}
                      placeholder="Enter new subject"
                      required
                    />
                  )}
                  <button className="td-btn-send" type="submit">Save Subject</button>
                </form>

                <form className="td-stat" onSubmit={handleChangePassword}>
                  <p className="td-stat-label">Change Password</p>
                  {pwError && <div className="td-pw-error">{pwError}</div>}
                  {pwSuccess && <p className="td-stat-hint" style={{ color: "#34d399", marginBottom: ".5rem" }}>Password updated successfully.</p>}
                  <input className="td-pw-input" type="password" placeholder="Current password" required value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} />
                  <input className="td-pw-input" type="password" placeholder="New password" required value={pwForm.next} onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} />
                  <input className="td-pw-input" type="password" placeholder="Confirm new password" required value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} />
                  <button className="td-btn-send" type="submit" disabled={pwLoading}>{pwLoading ? <span className="td-spinner" /> : "Update Password"}</button>
                </form>
              </div>
            </div>
          )}

        </div>
        </div>
      </div>
    </>
  );
}