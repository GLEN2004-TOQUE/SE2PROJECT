import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { getUser, logout, getMyProfile, getFriendlyApiErrorMessage } from "../services/api";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";

const BASE = process.env.REACT_APP_API_URL || "https://backend-7lik.onrender.com";

const apiFetch = async (path) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) {
    throw new Error(getFriendlyApiErrorMessage(res.status, data.message || data.error));
  }
  return data;
};

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@300;400&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

    @keyframes floatUp   { from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);} }
    @keyframes slideDown { from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);} }
    @keyframes fadeIn    { from{opacity:0;}to{opacity:1;} }
    @keyframes shimmer   { 0%{background-position:-200% center;}100%{background-position:200% center;} }
    @keyframes spin      { to{transform:rotate(360deg);} }
    @keyframes pulse-ring{ 0%,100%{transform:scale(.92);opacity:.6;}50%{transform:scale(1.04);opacity:.15;} }
    @keyframes glow-dot  { 0%,100%{box-shadow:0 0 0 0 rgba(200,160,40,.3);}50%{box-shadow:0 0 0 6px rgba(200,160,40,0);} }
    @keyframes badge-pop { 0%{transform:scale(.7);opacity:0;}70%{transform:scale(1.06);}100%{transform:scale(1);opacity:1;} }
    @keyframes skeleton-wave { 0%{background-position:-400px 0;}100%{background-position:400px 0;} }

    /* ── Root ── */
    .sd-root {
      min-height: 100vh;
      background-color: #1a0a0a;
      background-image:
        radial-gradient(ellipse 80% 60% at 10% 10%,  rgba(120,20,20,.55) 0%, transparent 70%),
        radial-gradient(ellipse 60% 50% at 90% 90%,  rgba(180,130,20,.25) 0%, transparent 65%),
        radial-gradient(ellipse 40% 40% at 50% 50%,  rgba(80,10,10,.4)   0%, transparent 80%);
      font-family: 'DM Sans', sans-serif;
      color: #f5e6c8;
      position: relative;
      overflow-x: hidden;
    }
    .sd-root::before {
      content: '';
      position: fixed; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.06'/%3E%3C/svg%3E");
      pointer-events: none; z-index: 0; opacity: .45;
    }
    .deco-ring {
      position: fixed; width:600px; height:600px;
      border-radius:50%; border:1px solid rgba(200,160,40,.12);
      top:-200px; right:-200px; pointer-events:none;
      animation:pulse-ring 6s ease-in-out infinite; z-index:0;
    }
    .deco-ring-2 {
      width:360px; height:360px;
      bottom:-120px; left:-120px; top:auto; right:auto;
      animation-delay:-3s;
    }

    /* ── Topbar ── */
    .sd-topbar {
      position: sticky; top:0; z-index:30;
      display:flex; align-items:center; justify-content:space-between;
      padding: 0 2rem; height:62px;
      background: rgba(26,10,10,.82);
      backdrop-filter: blur(18px) saturate(1.4);
      border-bottom: 1px solid rgba(200,160,50,.12);
      box-shadow: 0 1px 0 rgba(200,160,50,.06) inset, 0 4px 20px rgba(0,0,0,.4);
      animation: slideDown .4s ease both;
    }
    .sd-logo {
      display:flex; align-items:center; gap:.65rem;
      font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:700;
      color:#f5e6c8; letter-spacing:.01em;
    }
    .sd-logo-icon {
      width:34px; height:34px; border-radius:50%;
      background: linear-gradient(135deg,#7a1515,#4a0c0c);
      box-shadow: 0 0 0 4px rgba(190,140,30,.18), 0 4px 12px rgba(0,0,0,.5);
      display:flex; align-items:center; justify-content:center;
    }
    .sd-logo-icon svg { width:16px; height:16px; color:#f5e6c8; }
    .sd-topbar-right { display:flex; align-items:center; gap:.85rem; }
    .sd-user-chip {
      display:flex; align-items:center; gap:.5rem;
      padding:.28rem .9rem .28rem .45rem; border-radius:999px;
      background: rgba(200,160,50,.1);
      border: 1px solid rgba(200,160,50,.22);
      color: #e8c878; font-size:.8rem; font-weight:500;
    }
    .sd-user-chip-avatar {
      width:26px; height:26px; border-radius:50%;
      background: linear-gradient(135deg,#7a1515,#4a0c0c);
      display:flex; align-items:center; justify-content:center;
      font-size:.62rem; font-weight:700; color:#f5e6c8;
      flex-shrink:0; overflow:hidden;
    }
    .sd-logout {
      padding:.36rem .9rem; border-radius:8px; cursor:pointer;
      font-family:'DM Sans',sans-serif; font-size:.78rem; font-weight:500;
      border: 1px solid rgba(200,160,50,.2);
      background: rgba(200,160,50,.06);
      color: rgba(200,160,80,.6);
      transition: all .15s;
    }
    .sd-logout:hover { background:rgba(200,160,50,.14); color:#e8c878; }

    /* ── Layout ── */
    .sd-layout {
      position:relative; z-index:1;
      display:grid; grid-template-columns:210px 1fr;
      gap:1.2rem; max-width:1280px; margin:0 auto; padding:1.4rem;
    }

    /* ── Sidebar ── */
    .sd-side {
      background: rgba(255,255,255,.04);
      backdrop-filter: blur(18px) saturate(1.4);
      border: 1px solid rgba(200,160,50,.12);
      border-radius: 16px;
      padding: 1rem .75rem;
      height: fit-content;
      position: sticky; top:76px;
      box-shadow: 0 8px 32px rgba(0,0,0,.3);
    }
    .sd-side-label {
      font-size:.62rem; letter-spacing:.14em; text-transform:uppercase;
      color:rgba(200,160,60,.35); padding:.3rem .6rem .8rem; font-weight:500;
    }
    .sd-side-item {
      display:flex; align-items:center; gap:.55rem;
      padding:.6rem .75rem; border-radius:9px;
      color:rgba(200,170,100,.55); font-size:.83rem; font-weight:400;
      cursor:pointer; border:1px solid transparent; transition:all .15s;
    }
    .sd-side-item:hover { color:rgba(232,200,120,.8); background:rgba(200,160,50,.06); }
    .sd-side-item.active {
      background: rgba(200,160,50,.12);
      border-color: rgba(200,160,50,.25);
      color: #e8c878; font-weight:500;
    }
    .sd-side-item svg { width:15px; height:15px; opacity:.7; }

    /* ── Body ── */
    .sd-body { padding:.4rem .4rem 3rem; }

    /* ── Glass card (reusable) ── */
    .glass-card {
      background: rgba(255,255,255,.045);
      backdrop-filter: blur(18px) saturate(1.4);
      border: 1px solid rgba(200,160,50,.13);
      border-radius: 16px;
      box-shadow: 0 2px 0 rgba(255,220,100,.04) inset, 0 16px 48px rgba(0,0,0,.35);
    }

    /* ── Welcome ── */
    .sd-welcome { margin-bottom:2rem; animation:floatUp .5s ease both; }
    .sd-welcome-tag {
      display:inline-flex; align-items:center; gap:.4rem;
      font-size:.68rem; letter-spacing:.14em; text-transform:uppercase;
      color:rgba(200,160,60,.6); margin-bottom:.6rem; font-weight:500;
    }
    .sd-welcome-tag-dot {
      width:6px; height:6px; border-radius:50%;
      background:#c8a040; animation:glow-dot 2.5s infinite;
    }
    .sd-name {
      font-family:'Playfair Display',serif;
      font-size:2.1rem; font-weight:700; color:#f5e6c8;
      letter-spacing:-.01em; line-height:1.2;
    }
    .sd-sub { font-size:.86rem; color:rgba(200,170,100,.45); margin-top:.35rem; font-weight:300; }
    .sd-badge-row { display:flex; gap:.55rem; margin-top:.75rem; flex-wrap:wrap; }
    .sd-badge {
      display:inline-flex; align-items:center; gap:.3rem;
      padding:.22rem .75rem; border-radius:7px; font-size:.7rem; font-weight:500;
    }
    .sd-badge-course  { background:rgba(147,130,200,.1); color:#c4b5fd; border:1px solid rgba(147,130,200,.2); }
    .sd-badge-section { background:rgba(200,160,40,.1); color:#e8c878; border:1px solid rgba(200,160,40,.22); }

    /* ── Teacher card ── */
    .sd-teacher-card {
      padding:1.4rem 1.6rem; margin-bottom:1.75rem;
      animation:floatUp .5s .06s ease both;
    }
    .sd-teacher-label {
      display:flex; align-items:center; gap:.4rem;
      font-size:.65rem; letter-spacing:.12em; text-transform:uppercase;
      color:rgba(200,160,60,.55); margin-bottom:.9rem; font-weight:500;
    }
    .sd-teacher-label-dot {
      width:6px; height:6px; border-radius:50%; background:#c8a040;
      animation:glow-dot 2.5s infinite;
    }
    .sd-teacher-inner { display:flex; align-items:center; gap:1rem; }
    .sd-teacher-avatar {
      width:52px; height:52px; border-radius:14px;
      background: rgba(120,20,20,.3); border:1px solid rgba(200,160,50,.18);
      display:flex; align-items:center; justify-content:center;
      font-size:1rem; font-weight:700; color:#e8c878;
      flex-shrink:0; overflow:hidden; animation:badge-pop .5s .2s ease both;
    }
    .sd-teacher-name  { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:600; color:#f5e6c8; }
    .sd-teacher-email { font-size:.74rem; color:rgba(200,170,100,.4); font-family:'DM Mono',monospace; margin-top:.12rem; }
    .sd-teacher-tier  {
      margin-left:auto; font-size:.72rem; font-weight:500;
      padding:.22rem .7rem; border-radius:8px;
      background:rgba(147,130,200,.1); color:#c4b5fd; border:1px solid rgba(147,130,200,.2);
    }
    .sd-no-teacher {
      display:flex; align-items:center; gap:.85rem;
      padding:1.4rem 1.6rem; margin-bottom:1.75rem;
      border:1px dashed rgba(200,160,50,.15); border-radius:16px;
    }
    .sd-no-teacher-icon {
      width:44px; height:44px; border-radius:12px;
      background:rgba(255,255,255,.04);
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
    }
    .sd-no-teacher-icon svg { width:20px; height:20px; color:rgba(200,160,60,.3); }
    .sd-no-teacher-text { font-size:.83rem; color:rgba(200,170,100,.35); font-weight:300; }

    /* ── Stats grid ── */
    .sd-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.5rem; animation:floatUp .5s .1s ease both; }
    .sd-analytics-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.75rem; animation:floatUp .5s .13s ease both; }
    .sd-stat { padding:1.25rem 1.4rem; }
    .sd-stat-label {
      font-size:.64rem; letter-spacing:.12em; text-transform:uppercase;
      color:rgba(200,160,60,.5); margin-bottom:.45rem; font-weight:500;
    }
    .sd-stat-value {
      font-family:'Playfair Display',serif;
      font-size:1.9rem; font-weight:700; color:#f5e6c8;
    }
    .sd-stat-hint { font-size:.71rem; color:rgba(200,170,100,.35); margin-top:.3rem; font-weight:300; }

    /* ── Divider ── */
    .sd-divider {
      height:1px; background:rgba(200,160,50,.1);
      margin: 1.75rem 0; border:none;
    }

    /* ── Section heading ── */
    .sd-section-heading {
      display:flex; align-items:center; justify-content:space-between;
      margin-bottom:1rem;
    }
    .sd-section-title {
      font-family:'Playfair Display',serif;
      font-size:1.05rem; font-weight:600; color:#f5e6c8;
    }
    .sd-count-chip {
      font-family:'DM Mono',monospace; font-size:.7rem;
      color:rgba(200,160,60,.5); padding:.18rem .55rem;
      background:rgba(200,160,50,.07); border-radius:6px;
      border:1px solid rgba(200,160,50,.12);
    }

    /* ── Quiz cards ── */
    .sd-quiz-list { display:flex; flex-direction:column; gap:.75rem; }
    .sd-quiz-card {
      padding:1.1rem 1.4rem;
      display:flex; align-items:center; gap:1rem;
      position:relative; overflow:hidden; transition:all .15s;
    }
    .sd-quiz-card.active  { border-color:rgba(200,160,50,.3) !important; }
    .sd-quiz-card.active::before  { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:#c8a040; border-radius:2px; }
    .sd-quiz-card.upcoming { border-color:rgba(180,100,20,.25) !important; }
    .sd-quiz-card.upcoming::before{ content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:#a06020; border-radius:2px; }
    .sd-quiz-card.ended   { opacity:.5; }
    .sd-quiz-card:hover:not(.ended) { background:rgba(200,160,50,.04) !important; }
    .sd-quiz-card-icon {
      width:44px; height:44px; border-radius:12px;
      display:flex; align-items:center; justify-content:center;
      font-size:1.25rem; flex-shrink:0;
    }
    .sd-quiz-info { flex:1; min-width:0; }
    .sd-quiz-title { font-weight:500; color:#f5e6c8; font-size:.87rem; margin-bottom:.25rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .sd-quiz-meta { display:flex; align-items:center; gap:.5rem; flex-wrap:wrap; }
    .sd-status-badge { padding:.16rem .55rem; border-radius:6px; font-size:.66rem; font-weight:500; letter-spacing:.04em; }
    .sd-status-badge.active   { background:rgba(200,160,40,.12); color:#e8c878; border:1px solid rgba(200,160,40,.22); }
    .sd-status-badge.upcoming { background:rgba(180,100,20,.1); color:#d4a060; border:1px solid rgba(180,100,20,.2); }
    .sd-status-badge.ended    { background:rgba(255,255,255,.05); color:rgba(200,170,100,.28); border:1px solid rgba(255,255,255,.07); }
    .sd-quiz-time { font-size:.69rem; color:rgba(200,170,100,.3); font-family:'DM Mono',monospace; }
    .sd-score-chip {
      display:inline-flex; align-items:center; gap:.3rem; padding:.2rem .6rem;
      border-radius:6px; font-size:.7rem; font-weight:500;
      background:rgba(200,160,40,.09); color:#e8c878; border:1px solid rgba(200,160,40,.18);
    }
    .sd-quiz-btn {
      padding:.5rem 1.2rem; border-radius:9px; border:none;
      font-family:'DM Sans',sans-serif; font-size:.81rem; font-weight:500;
      cursor:pointer; transition:all .15s; white-space:nowrap; flex-shrink:0; letter-spacing:.03em;
    }
    .sd-quiz-btn.take {
      color:#fff8e8;
      background: linear-gradient(135deg,#8b1a1a 0%,#6b1010 50%,#8b1a1a 100%);
      background-size:200% auto;
      box-shadow: 0 4px 16px rgba(120,20,20,.45), 0 1px 0 rgba(255,200,80,.12) inset;
    }
    .sd-quiz-btn.take:hover {
      animation:shimmer .9s linear infinite;
      transform:translateY(-1px);
      box-shadow:0 6px 22px rgba(140,30,30,.55), 0 1px 0 rgba(255,200,80,.18) inset;
    }
    .sd-quiz-btn.disabled { background:rgba(255,255,255,.05); color:rgba(200,170,100,.3); border:1px solid rgba(200,160,50,.1); cursor:not-allowed; }
    .sd-empty-quiz {
      padding:2.2rem 1.5rem; text-align:center;
      border:1px dashed rgba(200,160,50,.12); border-radius:14px;
      color:rgba(200,170,100,.3); font-size:.83rem; font-weight:300;
    }

    /* ── Refresh button ── */
    .sd-refresh-btn {
      background:rgba(200,160,50,.07); border:1px solid rgba(200,160,50,.16);
      border-radius:8px; color:rgba(200,160,60,.5);
      padding:.24rem .65rem; font-size:.73rem; cursor:pointer;
      font-family:'DM Sans',sans-serif; transition:all .15s;
    }
    .sd-refresh-btn:hover { background:rgba(200,160,50,.13); color:#e8c878; }

    /* ── Leaderboard ── */
    .sd-lb { animation:floatUp .5s .18s ease both; margin-bottom:2rem; }
    .sd-lb-tabs { display:flex; gap:.35rem; }
    .sd-lb-tab {
      padding:.24rem .65rem; border-radius:7px; cursor:pointer;
      font-size:.73rem; font-weight:400;
      border:1px solid rgba(200,160,50,.1); background:rgba(200,160,50,.04);
      color:rgba(200,160,60,.4); transition:all .15s; font-family:'DM Sans',sans-serif;
    }
    .sd-lb-tab.active { background:rgba(200,160,50,.12); border-color:rgba(200,160,50,.25); color:#e8c878; font-weight:500; }
    .sd-lb-section-chip {
      font-size:.68rem; font-weight:500; padding:.18rem .6rem; border-radius:6px;
      background:rgba(200,160,40,.09); color:#e8c878; border:1px solid rgba(200,160,40,.18);
    }
    .sd-lb-row {
      display:flex; align-items:center; gap:.85rem;
      padding:.85rem 1.25rem; border-bottom:1px solid rgba(200,160,50,.06);
      transition:background .12s;
    }
    .sd-lb-row:last-child { border-bottom:none; }
    .sd-lb-row:hover { background:rgba(200,160,50,.03); }
    .sd-lb-row.is-me { background:rgba(200,160,40,.07); border-left:3px solid #c8a040; }
    .sd-lb-rank { font-family:'DM Mono',monospace; font-size:.8rem; font-weight:700; color:rgba(200,170,100,.28); width:28px; text-align:center; flex-shrink:0; }
    .sd-lb-rank.top1 { color:#e8c878; }
    .sd-lb-rank.top2 { color:#9ca3af; }
    .sd-lb-rank.top3 { color:#b45309; }
    .sd-lb-avatar {
      width:34px; height:34px; border-radius:9px;
      background:rgba(120,20,20,.25); border:1px solid rgba(200,160,50,.15);
      display:flex; align-items:center; justify-content:center;
      font-size:.68rem; font-weight:700; color:#e8c878; flex-shrink:0;
    }
    .sd-lb-name { font-size:.82rem; font-weight:500; color:rgba(245,230,200,.8); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .sd-lb-streak { font-size:.68rem; color:rgba(255,120,100,.6); margin-top:.1rem; }
    .sd-lb-pts { font-family:'DM Mono',monospace; font-size:.8rem; font-weight:700; color:#f5e6c8; }
    .sd-lb-tier { font-size:.62rem; color:rgba(200,170,100,.3); }
    .sd-lb-empty { padding:2.5rem; text-align:center; font-size:.82rem; color:rgba(200,170,100,.25); font-weight:300; }

    /* ── Settings ── */
    .sd-settings-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; padding:1.5rem; }
    .sd-field-label {
      display:block; font-size:.66rem; letter-spacing:.12em; text-transform:uppercase;
      color:rgba(200,160,60,.65); margin-bottom:.5rem; font-weight:500;
    }
    .sd-input {
      width:100%; padding:.7rem .95rem; border-radius:9px;
      background:rgba(255,255,255,.055); border:1px solid rgba(200,160,50,.2);
      color:#f5e6c8; font-family:'DM Sans',sans-serif; font-size:.87rem; font-weight:300;
      outline:none; transition:all .2s; margin-bottom:.6rem;
    }
    .sd-input::placeholder { color:rgba(200,170,100,.25); }
    .sd-input:focus { border-color:rgba(200,160,50,.5); background:rgba(255,255,255,.08); box-shadow:0 0 0 3px rgba(190,140,30,.12); }
    .sd-submit-btn {
      width:100%; padding:.75rem 1rem; border:none; border-radius:9px;
      cursor:pointer; font-family:'DM Sans',sans-serif; font-size:.87rem; font-weight:500;
      letter-spacing:.04em; color:#fff8e8; transition:all .15s;
      background:linear-gradient(135deg,#8b1a1a 0%,#6b1010 50%,#8b1a1a 100%);
      background-size:200% auto;
      box-shadow:0 4px 16px rgba(120,20,20,.45), 0 1px 0 rgba(255,200,80,.12) inset;
    }
    .sd-submit-btn:hover { animation:shimmer .9s linear infinite; transform:translateY(-1px); }
    .sd-submit-btn:disabled { opacity:.5; cursor:not-allowed; }

    /* ── Skeleton ── */
    .skeleton {
      height:13px; border-radius:5px;
      background:linear-gradient(90deg,rgba(200,160,50,.04) 0%,rgba(200,160,50,.1) 50%,rgba(200,160,50,.04) 100%);
      background-size:800px 100%; animation:skeleton-wave 1.4s infinite;
    }

    /* ── Spinner ── */
    .sd-spinner {
      display:inline-block; width:14px; height:14px;
      border:2px solid rgba(200,160,50,.2); border-top-color:#c8a040;
      border-radius:50%; animation:spin .7s linear infinite;
    }

    /* ── Error alert ── */
    .sd-error {
      display:flex; align-items:center; gap:.55rem; padding:.65rem .9rem;
      background:rgba(239,68,68,.07); border:1px solid rgba(239,68,68,.2);
      border-radius:9px; font-size:.79rem; color:#fca5a5;
    }

    /* ── Responsive ── */
    @media(max-width:760px){
      .sd-layout { grid-template-columns:1fr; padding:.85rem; }
      .sd-side { position:static; }
      .sd-stats { grid-template-columns:1fr 1fr; }
      .sd-analytics-grid { grid-template-columns:1fr; }
      .sd-settings-grid { grid-template-columns:1fr; }
      .sd-topbar { padding:0 1rem; }
      .sd-name { font-size:1.65rem; }
    }
  `}</style>
);

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";
const rankClass = (i) => i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : "";
const rankEmoji = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
const STUDENT_VIEW_STORAGE_KEY = "student_dashboard_view";

const readStoredStudentView = () => {
  const v = localStorage.getItem(STUDENT_VIEW_STORAGE_KEY);
  return v === "settings" || v === "overview" ? v : "overview";
};

const PH_TIMEZONE = "Asia/Manila";
const formatTime = (iso) => {
  if (!iso) return "";
  return `${new Date(iso).toLocaleString("en-PH", {
    timeZone: PH_TIMEZONE,
    month:"short",
    day:"numeric",
    year:"numeric",
    hour:"2-digit",
    minute:"2-digit",
  })} PH`;
};

/** Subject shown for a quiz: lecture-based label from API, else teacher subject field (pipe-separated). */
const quizSubjectDisplay = (quiz) => {
  if (quiz?.subject_label && String(quiz.subject_label).trim()) return String(quiz.subject_label).trim();
  const raw = quiz?.teacher_subjects;
  if (raw == null || !String(raw).trim()) return "";
  return String(raw).split("|").map((x) => x.trim()).filter(Boolean).join(" · ");
};

/* ── Icons ── */
const IconGrid = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="2" y="2" width="7" height="7" rx="1.5"/><rect x="11" y="2" width="7" height="7" rx="1.5"/>
    <rect x="2" y="11" width="7" height="7" rx="1.5"/><rect x="11" y="11" width="7" height="7" rx="1.5"/>
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="10" cy="10" r="2.5"/>
    <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"/>
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState(readStoredStudentView);
  const [profile, setProfile]           = useState(null);
  const [myTeachers, setMyTeachers]     = useState([]);
  const [leaderboard, setLeaderboard]   = useState([]);
  const [lbType, setLbType]             = useState("overall");
  const [lbLoading, setLbLoading]       = useState(false);
  const [pageLoading, setPageLoading]   = useState(true);
  const [quizzes, setQuizzes]           = useState([]);
  const [quizResults, setQuizResults]   = useState({});
  const [attendanceMap, setAttendanceMap] = useState({});
  /** Start true so overview does not flash "No teacher" while quizzes may still supply teacher fallback. */
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [quizError, setQuizError]       = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [pwForm, setPwForm] = useState({ current:"", next:"", confirm:"" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  const tokenUser = getUser();

  const loadLeaderboard = useCallback(async (type) => {
    setLbLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/api/game/leaderboard/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch { setLeaderboard([]); }
    finally { setLbLoading(false); }
  }, []);

  const loadQuizzes = useCallback(async () => {
    setLoadingQuizzes(true); setQuizError("");
    try {
      const data = await apiFetch("/api/quiz/my-quizzes");
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) { setQuizError(err.message); setQuizzes([]); }
    finally { setLoadingQuizzes(false); }
  }, []);

  const loadResults = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/api/quiz/my-results`, { headers:{ Authorization:`Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        const map = {};
        (Array.isArray(data) ? data : []).forEach(r => { map[r.quiz_id] = r; });
        setQuizResults(map);
      }
    } catch {}
  }, []);

  const loadAttendance = useCallback(async () => {
    try {
      const data = await apiFetch("/api/quiz/my-attendance");
      const map = {};
      (Array.isArray(data) ? data : []).forEach(a => { map[a.quiz_id] = a; });
      setAttendanceMap(map);
    } catch { setAttendanceMap({}); }
  }, []);

  useEffect(() => {
    localStorage.setItem(STUDENT_VIEW_STORAGE_KEY, activeView);
  }, [activeView]);

  useEffect(() => {
    if (!tokenUser) { navigate("/"); return; }
    if (tokenUser.role !== "student") { navigate("/teacher"); return; }
    getMyProfile().then(setProfile).catch(() => {});
    apiFetch("/api/admin/my-teacher")
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.teachers)
            ? data.teachers
            : [];
        setMyTeachers(list);
      })
      .catch(() => setMyTeachers([]))
      .finally(() => setPageLoading(false));
    if (tokenUser?.id) setProfilePhoto(localStorage.getItem(`student_photo_${tokenUser.id}`) || "");
  }, [navigate, tokenUser]);

  useEffect(() => { loadLeaderboard(lbType); }, [lbType, loadLeaderboard]);

  const studentId = tokenUser?.id;
  const isStudent = tokenUser?.role === "student";
  useEffect(() => {
    if (!studentId || !isStudent) {
      setLoadingQuizzes(false);
      return;
    }
    loadQuizzes();
    loadResults();
    loadAttendance();
  }, [studentId, isStudent, loadQuizzes, loadResults, loadAttendance]);

  /** Prefer /api/admin/my-teacher; if empty (e.g. id type mismatch), derive teachers from assigned quizzes. */
  const teachersForOverview = useMemo(() => {
    if (Array.isArray(myTeachers) && myTeachers.length > 0) return myTeachers;

    const byKey = new Map();
    for (const q of quizzes) {
      const name = (q.teacher_name && String(q.teacher_name).trim()) || "";
      const email = (q.teacher_email && String(q.teacher_email).trim()) || "";
      if (!name && !email) continue;
      const key = (email || name).toLowerCase();
      if (byKey.has(key)) continue;
      const rawSubj = q.teacher_subjects != null && String(q.teacher_subjects).trim();
      byKey.set(key, {
        id: `quiz-teacher-${key.replace(/[^a-z0-9@._-]+/gi, "-").slice(0, 80)}`,
        full_name: name || email,
        email,
        subject: rawSubj || null,
        tier: null,
        assigned_at: null,
      });
    }
    return [...byKey.values()];
  }, [myTeachers, quizzes]);

  /** Wait for quiz list when we still need it to infer teachers (avoids false "no teacher" before my-quizzes returns). */
  const teacherOverviewLoading =
    pageLoading || (myTeachers.length === 0 && loadingQuizzes);

  const handleRefreshQuizzes = async () => { await loadQuizzes(); await loadResults(); await loadAttendance(); };
  const handlePhotoPick = (e) => {
    const file = e.target.files?.[0];
    if (!file || !tokenUser?.id) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || "");
      setProfilePhoto(src);
      localStorage.setItem(`student_photo_${tokenUser.id}`, src);
    };
    reader.readAsDataURL(file);
  };
  const handleChangePassword = async (e) => {
    e.preventDefault(); setPwMsg("");
    if (pwForm.next.length < 6) return setPwMsg("New password must be at least 6 characters.");
    if (pwForm.next !== pwForm.confirm) return setPwMsg("Passwords do not match.");
    setPwLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/change-password`, {
        method:"PATCH",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ currentPassword:pwForm.current, newPassword:pwForm.next }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) {
        throw new Error(getFriendlyApiErrorMessage(res.status, data.error || data.message));
      }
      setPwMsg("Password updated successfully."); setPwForm({ current:"", next:"", confirm:"" });
    } catch (err) { setPwMsg(err.message); }
    finally { setPwLoading(false); }
  };

  const displayName   = profile?.full_name || "Student";
  const firstName     = displayName.split(" ")[0];
  const avatarText    = initials(displayName);
  const currentUserId = tokenUser?.id;
  const mySection     = profile?.section || "";
  const myCourse      = profile?.course  || "";
  const completedQuizzes = quizzes.filter(q => !!quizResults[q.id]);
  const completionRate = quizzes.length ? Math.round((completedQuizzes.length / quizzes.length) * 100) : 0;
  const scores = completedQuizzes.map(q => {
    const r = quizResults[q.id];
    return r?.total ? Math.round((r.score / r.total) * 100) : 0;
  });
  const avgScore = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
  const quizStatusCount = [
    quizzes.filter(q=>q.status==="active").length,
    quizzes.filter(q=>q.status==="upcoming").length,
    quizzes.filter(q=>q.status==="ended").length,
  ];
  const scoreTrend = scores.length ? scores.slice(-6) : [0];

  const chartAxisStyle = { tickLabelStyle:{ fill:"#ffffff", fontSize:11, fontFamily:"DM Mono" } };
  const chartSx = { "& .MuiChartsAxis-line":{ stroke:"rgba(200,160,50,.15)" }, "& .MuiChartsAxis-tick":{ stroke:"rgba(200,160,50,.15)" }, "& .MuiChartsLegend-label":{ fill:"#ffffff !important", fontSize:"11px !important" } };

  return (
    <>
      <Styles />
      <div className="sd-root">
        <div className="deco-ring" />
        <div className="deco-ring deco-ring-2" />

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
              <div className="sd-user-chip-avatar">
                {profilePhoto
                  ? <img src={profilePhoto} alt="You" style={{width:"100%",height:"100%",objectFit:"cover"}} />
                  : avatarText}
              </div>
              {displayName}
            </div>
            <button className="sd-logout" onClick={() => { logout(); navigate("/"); }}>Sign out</button>
          </div>
        </header>

        <div className="sd-layout">
          {/* ── Sidebar ── */}
          <aside className="sd-side">
            <div className="sd-side-label">Navigation</div>
            <div className={`sd-side-item ${activeView==="overview"?"active":""}`} onClick={()=>setActiveView("overview")}>
              <IconGrid /> Overview
            </div>
            <div className={`sd-side-item ${activeView==="settings"?"active":""}`} onClick={()=>setActiveView("settings")}>
              <IconSettings /> Settings
            </div>
          </aside>

          {/* ── Main ── */}
          <div className="sd-body">

            {/* ══ OVERVIEW ══ */}
            {activeView === "overview" && (
              <>
                {/* Welcome */}
                <div className="sd-welcome">
                  <div className="sd-welcome-tag">
                    <span className="sd-welcome-tag-dot" /> Student Dashboard
                  </div>
                  <h1 className="sd-name">Hello, {firstName}! 👋</h1>
                  <p className="sd-sub">Track your progress and compete with your classmates</p>
                  {(myCourse || mySection) && (
                    <div className="sd-badge-row">
                      {myCourse  && <span className="sd-badge sd-badge-course">📚 {myCourse}</span>}
                      {mySection && <span className="sd-badge sd-badge-section">🏫 {mySection}</span>}
                    </div>
                  )}
                </div>

                {/* Teacher */}
                {teacherOverviewLoading ? (
                  <div className="glass-card" style={{padding:"1.4rem 1.6rem",marginBottom:"1.75rem"}}>
                    <div className="skeleton" style={{width:110,marginBottom:".9rem"}} />
                    <div style={{display:"flex",gap:"1rem",alignItems:"center"}}>
                      <div style={{width:52,height:52,borderRadius:14,background:"rgba(200,160,50,.05)"}} />
                      <div style={{flex:1}}>
                        <div className="skeleton" style={{width:"45%",marginBottom:".4rem"}} />
                        <div className="skeleton" style={{width:"65%"}} />
                      </div>
                    </div>
                  </div>
                ) : teachersForOverview.length > 0 ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:"1rem", marginBottom:"1.75rem" }}>
                    <div className="sd-teacher-label" style={{ marginBottom:0 }}>
                      <span className="sd-teacher-label-dot" /> Your Teachers &amp; subjects
                    </div>
                    {teachersForOverview.map((t) => {
                      const fromTeacher = (t.subject && String(t.subject).trim())
                        ? String(t.subject).split("|").map((x) => x.trim()).filter(Boolean)
                        : [];
                      const courseStr = profile?.course && String(profile.course).trim();
                      const subjectParts = [...fromTeacher];
                      if (courseStr && !subjectParts.some((p) => p.toLowerCase() === courseStr.toLowerCase())) {
                        subjectParts.push(courseStr);
                      }
                      return (
                      <div key={t.id} className="glass-card sd-teacher-card" style={{ marginBottom:0 }}>
                        <div className="sd-teacher-inner">
                          <div className="sd-teacher-avatar">
                            <img
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(t.full_name||"Teacher")}`}
                              alt={t.full_name}
                              style={{width:"100%",height:"100%",objectFit:"cover"}}
                            />
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div className="sd-teacher-name">{t.full_name}</div>
                            <div className="sd-teacher-email">{t.email}</div>
                            {subjectParts.length > 0 && (
                              <div style={{ marginTop:".45rem", fontSize:".78rem", color:"rgba(196,181,253,.95)", fontWeight:500 }}>
                                Subjects: {subjectParts.join(" · ")}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );})}
                  </div>
                ) : (
                  <div className="sd-no-teacher">
                    <div className="sd-no-teacher-icon"><IconUser /></div>
                    <p className="sd-no-teacher-text">No teacher assigned yet. Your admin will assign one soon.</p>
                  </div>
                )}

                {/* Stats */}
                <div className="sd-stats">
                  {[
                    { label:"Your Points", value: profile ? (profile.points??0).toLocaleString() : "—", hint: profile?.tier||"Beginner" },
                    { label:"Streak", value: `🔥 ${profile?(profile.streak??0):"—"}`, hint:"consecutive days" },
                    { label:"Quizzes Assigned", value: quizzes.length, hint:`${quizzes.filter(q=>q.status==="active").length} active now` },
                  ].map((s,i)=>(
                    <div key={i} className="glass-card sd-stat" style={{animationDelay:`${.1+i*.04}s`,animation:"floatUp .5s ease both"}}>
                      <p className="sd-stat-label">{s.label}</p>
                      <p className="sd-stat-value">{s.value}</p>
                      <p className="sd-stat-hint">{s.hint}</p>
                    </div>
                  ))}
                </div>

                {/* Analytics */}
                <div className="sd-analytics-grid">
                  <div className="glass-card sd-stat">
                    <p className="sd-stat-label">Completion Analytics</p>
                    <p className="sd-stat-hint" style={{marginBottom:".4rem"}}>{completionRate}% completion</p>
                    <BarChart
                      xAxis={[{ scaleType:"band", data:["Completed","Pending"], ...chartAxisStyle }]}
                      series={[{ data:[completedQuizzes.length, Math.max(quizzes.length-completedQuizzes.length,0)], color:"#c8a040" }]}
                      height={180}
                      sx={chartSx}
                    />
                  </div>
                  <div className="glass-card sd-stat">
                    <p className="sd-stat-label">Score Trend</p>
                    <p className="sd-stat-hint" style={{marginBottom:".4rem"}}>Average score: {avgScore}%</p>
                    <LineChart
                      xAxis={[{ scaleType:"point", data:scoreTrend.map((_,i)=>`Q${i+1}`), ...chartAxisStyle }]}
                      series={[{ data:scoreTrend, curve:"linear", color:"#c8a040" }]}
                      height={180}
                      sx={chartSx}
                    />
                  </div>
                  <div className="glass-card sd-stat">
                    <p className="sd-stat-label">Quiz Load</p>
                    <LineChart
                      xAxis={[{ scaleType:"point", data:["Now"], ...chartAxisStyle }]}
                      series={[
                        { data:[quizStatusCount[0]], area:true, stack:"total", label:"Active",   color:"#c8a040" },
                        { data:[quizStatusCount[1]], area:true, stack:"total", label:"Upcoming", color:"#c8a040" },
                        { data:[quizStatusCount[2]], area:true, stack:"total", label:"Ended",    color:"#c8a040" },
                      ]}
                      height={180}
                      sx={chartSx}
                    />
                  </div>
                  <div className="glass-card sd-stat">
                    <p className="sd-stat-label">Performance Share</p>
                    <PieChart
                      series={[{ startAngle:0, endAngle:360, innerRadius:24, outerRadius:70, cornerRadius:0, data:[
                        { id:1, value:completionRate, label:"Completed %", color:"#c8a040" },
                        { id:2, value:Math.max(100-completionRate,0), label:"Remaining %", color:"rgba(120,20,20,.6)" },
                      ]}]}
                      height={180}
                    />
                    <p className="sd-stat-hint" style={{marginTop:".5rem"}}>{completionRate}% of assigned quizzes completed</p>
                  </div>
                </div>

                <hr className="sd-divider" />

                {/* Quizzes */}
                <div style={{marginBottom:"1.75rem",animation:"floatUp .5s .15s ease both"}}>
                  <div className="sd-section-heading">
                    <h2 className="sd-section-title">My Quizzes</h2>
                    <div style={{display:"flex",alignItems:"center",gap:".65rem"}}>
                      <span className="sd-count-chip">{quizzes.length}</span>
                      <button className="sd-refresh-btn" onClick={handleRefreshQuizzes}>↻ Refresh</button>
                    </div>
                  </div>

                  {loadingQuizzes ? (
                    <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem",gap:".65rem",color:"rgba(200,170,100,.3)",fontSize:".82rem"}}>
                      <span className="sd-spinner" /> Loading quizzes…
                    </div>
                  ) : quizError ? (
                    <div className="sd-error">⚠ {quizError}</div>
                  ) : quizzes.length === 0 ? (
                    <div className="sd-empty-quiz">📋 No quizzes assigned yet. Your teacher will send quizzes here.</div>
                  ) : (
                    <div className="sd-quiz-list">
                      {quizzes.map(quiz => {
                        const result   = quizResults[quiz.id];
                        const isActive = quiz.status === "active";
                        const isDone   = !!result;
                        return (
                          <div key={quiz.id} className={`glass-card sd-quiz-card ${quiz.status}`}>
                            <div className="sd-quiz-card-icon" style={{
                              background: isActive ? "rgba(200,160,40,.1)" : quiz.status==="upcoming" ? "rgba(160,100,20,.1)" : "rgba(255,255,255,.04)"
                            }}>
                              {isActive ? "📝" : quiz.status==="upcoming" ? "⏳" : "🔒"}
                            </div>
                            <div className="sd-quiz-info">
                              <div className="sd-quiz-title">{quiz.title}</div>
                              <div className="sd-quiz-context" style={{ fontSize:".72rem", color:"rgba(200,170,100,.5)", marginBottom:".35rem", marginTop:".08rem", lineHeight:1.45 }}>
                                <div>
                                  <span style={{ color:"rgba(200,160,60,.45)" }}>Teacher </span>
                                  <strong style={{ color:"rgba(232,200,120,.85)", fontWeight:500 }}>
                                    {(quiz.teacher_name && String(quiz.teacher_name).trim())
                                      || (quiz.teacher_email && String(quiz.teacher_email).trim())
                                      || "Unknown"}
                                  </strong>
                                </div>
                                <div style={{ marginTop:".12rem" }}>
                                  <span style={{ color:"rgba(200,160,60,.45)" }}>Subject </span>
                                  <strong style={{ color:"rgba(196,181,253,.9)", fontWeight:500 }}>
                                    {quizSubjectDisplay(quiz) || "Not specified"}
                                  </strong>
                                </div>
                              </div>
                              <div className="sd-quiz-meta">
                                <span className={`sd-status-badge ${quiz.status}`}>
                                  {isActive ? "● Live Now" : quiz.status==="upcoming" ? "⏰ Upcoming" : "Ended"}
                                </span>
                                {quiz.start_time && (
                                  <span className="sd-quiz-time">
                                    {isActive ? `Ends ${formatTime(quiz.end_time)}`
                                      : quiz.status==="upcoming" ? `Starts ${formatTime(quiz.start_time)}`
                                      : `Ended ${formatTime(quiz.end_time)}`}
                                  </span>
                                )}
                                {isDone && (
                                  <span className="sd-score-chip">
                                    ✓ {result.score}/{result.total} ({Math.round((result.score/result.total)*100)}%)
                                  </span>
                                )}
                                {attendanceMap[quiz.id] && (
                                  <span className="sd-score-chip" style={{background:"rgba(120,20,20,.1)",color:"#e8c878",borderColor:"rgba(200,160,40,.2)"}}>
                                    {attendanceMap[quiz.id].status==="present"?"Present":"Absent"} · {formatTime(attendanceMap[quiz.id].timestamp)}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isDone ? (
                              <div style={{textAlign:"center",flexShrink:0}}>
                                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.1rem",fontWeight:700,color:"#c8a040"}}>
                                  {Math.round((result.score/result.total)*100)}%
                                </div>
                                <div style={{fontSize:".63rem",color:"rgba(200,170,100,.3)",marginTop:".1rem"}}>Score</div>
                              </div>
                            ) : (
                              <button
                                className={`sd-quiz-btn ${isActive?"take":"disabled"}`}
                                onClick={() => isActive && navigate(`/quiz/${quiz.id}`)}
                                disabled={!isActive}
                              >
                                {isActive ? "Take Quiz →" : quiz.status==="upcoming" ? "Not Yet Open" : "Closed"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <hr className="sd-divider" />

                {/* Leaderboard */}
                <div className="sd-lb">
                  <div className="sd-section-heading">
                    <div style={{display:"flex",alignItems:"center",gap:".65rem"}}>
                      <h2 className="sd-section-title">Section Leaderboard</h2>
                      {mySection && <span className="sd-lb-section-chip">🏫 {mySection}</span>}
                    </div>
                    <div className="sd-lb-tabs">
                      {["overall","daily","weekly"].map(t => (
                        <button key={t} className={`sd-lb-tab ${lbType===t?"active":""}`} onClick={()=>setLbType(t)}>
                          {t.charAt(0).toUpperCase()+t.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card" style={{overflow:"hidden"}}>
                    {lbLoading ? (
                      [1,2,3,4,5].map(i => (
                        <div key={i} className="sd-lb-row">
                          <div className="skeleton" style={{width:24}} />
                          <div style={{width:34,height:34,borderRadius:9,background:"rgba(200,160,50,.05)"}} />
                          <div style={{flex:1}}>
                            <div className="skeleton" style={{width:"48%",marginBottom:".35rem"}} />
                            <div className="skeleton" style={{width:"28%"}} />
                          </div>
                          <div className="skeleton" style={{width:55}} />
                        </div>
                      ))
                    ) : leaderboard.length === 0 ? (
                      <div className="sd-lb-empty">
                        {mySection ? `No students in ${mySection} have points yet. Be the first! 🚀` : "No data available for this period."}
                      </div>
                    ) : (
                      leaderboard.map((u, i) => (
                        <div key={u.id||i} className={`sd-lb-row ${u.id===currentUserId?"is-me":""}`}>
                          <span className={`sd-lb-rank ${rankClass(i)}`}>{rankEmoji(i)}</span>
                          <div className="sd-lb-avatar">{initials(u.full_name||"?")}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div className="sd-lb-name">
                              {u.full_name||"Unknown"}
                              {u.id===currentUserId && <span style={{fontSize:".6rem",color:"#c8a040",marginLeft:".4rem"}}>← you</span>}
                            </div>
                            {(u.streak??0)>0 && <div className="sd-lb-streak">🔥 {u.streak} day streak</div>}
                          </div>
                          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:".15rem",flexShrink:0}}>
                            <span className="sd-lb-pts">{(u.points??0).toLocaleString()} pts</span>
                            <span className="sd-lb-tier">{u.tier||"Beginner"}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ══ SETTINGS ══ */}
            {activeView === "settings" && (
              <div style={{animation:"floatUp .4s ease both"}}>
                <div className="sd-welcome">
                  <div className="sd-welcome-tag"><span className="sd-welcome-tag-dot" /> Account</div>
                  <h1 className="sd-name" style={{fontSize:"1.7rem"}}>Settings</h1>
                  <p className="sd-sub">Manage your profile and security preferences</p>
                </div>
                <div className="glass-card">
                  <div style={{padding:"1.5rem"}}>
                    {/* Password */}
                    <form onSubmit={handleChangePassword}>
                      <label className="sd-field-label">Change Password</label>
                      <input className="sd-input" type="password" placeholder="Current password"
                        value={pwForm.current} onChange={e=>setPwForm(p=>({...p,current:e.target.value}))} />
                      <input className="sd-input" type="password" placeholder="New password (min 6 chars)"
                        value={pwForm.next} onChange={e=>setPwForm(p=>({...p,next:e.target.value}))} />
                      <input className="sd-input" type="password" placeholder="Confirm new password"
                        value={pwForm.confirm} onChange={e=>setPwForm(p=>({...p,confirm:e.target.value}))} />
                      <button className="sd-submit-btn" type="submit" disabled={pwLoading}>
                        {pwLoading ? "Updating…" : "Update Password"}
                      </button>
                      {pwMsg && (
                        <p style={{marginTop:".5rem",fontSize:".78rem",color: pwMsg.includes("success")?"#c8a040":"#fca5a5"}}>
                          {pwMsg}
                        </p>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}