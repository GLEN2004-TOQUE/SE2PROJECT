import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/api";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";

const BASE = process.env.REACT_APP_API_URL || "https://backend-7lik.onrender.com";

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
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@300;400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes floatUp    { from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);} }
    @keyframes slideDown  { from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);} }
    @keyframes fadeIn     { from{opacity:0;}to{opacity:1;} }
    @keyframes shimmer    { 0%{background-position:-200% center;}100%{background-position:200% center;} }
    @keyframes spin       { to{transform:rotate(360deg);} }
    @keyframes pulse-ring { 0%,100%{transform:scale(.92);opacity:.6;}50%{transform:scale(1.04);opacity:.15;} }
    @keyframes glow-dot   { 0%,100%{box-shadow:0 0 0 0 rgba(200,160,40,.3);}50%{box-shadow:0 0 0 6px rgba(200,160,40,0);} }
    @keyframes badge-pop  { 0%{transform:scale(.7);opacity:0;}70%{transform:scale(1.06);}100%{transform:scale(1);opacity:1;} }
    @keyframes skeleton-wave { 0%{background-position:-400px 0;}100%{background-position:400px 0;} }
    @keyframes modalIn    { from{opacity:0;transform:scale(.94) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);} }
    @keyframes checkPop   { 0%{transform:scale(0) rotate(-20deg);opacity:0;}60%{transform:scale(1.2) rotate(5deg);opacity:1;}100%{transform:scale(1) rotate(0);opacity:1;} }
    @keyframes successRing{ 0%{transform:scale(.7);opacity:0;}50%{transform:scale(1.12);}100%{transform:scale(1);opacity:1;} }
    @keyframes toastSlide { 0%{opacity:0;transform:translateX(60px);}10%{opacity:1;transform:translateX(0);}85%{opacity:1;}100%{opacity:0;transform:translateX(60px);} }
    @keyframes confPop    { to{transform:translateY(50px) rotate(720deg);opacity:0;} }
    @keyframes float      { 0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);} }

    /* ── Root ── */
    .td-root {
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
    .td-root::before {
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
    .td-topbar {
      position: sticky; top:0; z-index:30;
      display:flex; align-items:center; justify-content:space-between;
      padding: 0 2rem; height:62px;
      background: rgba(26,10,10,.82);
      backdrop-filter: blur(18px) saturate(1.4);
      border-bottom: 1px solid rgba(200,160,50,.12);
      box-shadow: 0 1px 0 rgba(200,160,50,.06) inset, 0 4px 20px rgba(0,0,0,.4);
      animation: slideDown .4s ease both;
    }
    .td-logo {
      display:flex; align-items:center; gap:.65rem;
      font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:700;
      color:#f5e6c8; letter-spacing:.01em;
    }
    .td-logo-icon {
      width:34px; height:34px; border-radius:50%;
      background: linear-gradient(135deg,#7a1515,#4a0c0c);
      box-shadow: 0 0 0 4px rgba(190,140,30,.18), 0 4px 12px rgba(0,0,0,.5);
      display:flex; align-items:center; justify-content:center;
    }
    .td-logo-icon svg { width:16px; height:16px; color:#f5e6c8; }
    .td-topbar-right { display:flex; align-items:center; gap:.85rem; }
    .td-user-chip {
      display:flex; align-items:center; gap:.5rem;
      padding:.28rem .9rem .28rem .45rem; border-radius:999px;
      background: rgba(200,160,50,.1);
      border: 1px solid rgba(200,160,50,.22);
      color: #e8c878; font-size:.8rem; font-weight:500;
    }
    .td-user-chip-avatar {
      width:26px; height:26px; border-radius:50%;
      background: linear-gradient(135deg,#7a1515,#4a0c0c);
      display:flex; align-items:center; justify-content:center;
      font-size:.62rem; font-weight:700; color:#f5e6c8; flex-shrink:0;
    }
    .td-chip-small {
      font-family:'DM Mono',monospace; font-size:.65rem; padding:.18rem .65rem;
      border-radius:999px; background:rgba(200,160,50,.1);
      border:1px solid rgba(200,160,50,.22); color:#e8c878; letter-spacing:.06em;
    }
    .td-topbar-btn {
      padding:.36rem .9rem; border-radius:8px; cursor:pointer;
      font-family:'DM Sans',sans-serif; font-size:.78rem; font-weight:500;
      border: 1px solid rgba(200,160,50,.2);
      background: rgba(200,160,50,.06);
      color: rgba(200,160,80,.6);
      transition: all .15s;
    }
    .td-topbar-btn:hover { background:rgba(200,160,50,.14); color:#e8c878; }

    /* ── Layout ── */
    .td-layout {
      position:relative; z-index:1;
      display:grid; grid-template-columns:210px 1fr;
      gap:1.2rem; max-width:1280px; margin:0 auto; padding:1.4rem;
    }

    /* ── Sidebar ── */
    .td-side {
      background: rgba(255,255,255,.04);
      backdrop-filter: blur(18px) saturate(1.4);
      border: 1px solid rgba(200,160,50,.12);
      border-radius: 16px;
      padding: 1rem .75rem;
      height: fit-content;
      position: sticky; top:76px;
      box-shadow: 0 8px 32px rgba(0,0,0,.3);
    }
    .td-side-label {
      font-size:.62rem; letter-spacing:.14em; text-transform:uppercase;
      color:rgba(200,160,60,.35); padding:.3rem .6rem .8rem; font-weight:500;
    }
    .td-side-item {
      display:flex; align-items:center; gap:.55rem;
      padding:.6rem .75rem; border-radius:9px;
      color:rgba(200,170,100,.55); font-size:.83rem; font-weight:400;
      cursor:pointer; border:1px solid transparent; transition:all .15s;
    }
    .td-side-item:hover { color:rgba(232,200,120,.8); background:rgba(200,160,50,.06); }
    .td-side-item.active {
      background: rgba(200,160,50,.12);
      border-color: rgba(200,160,50,.25);
      color: #e8c878; font-weight:500;
    }
    .td-side-item svg { width:15px; height:15px; opacity:.7; }

    /* ── Body ── */
    .td-body { padding:.4rem .4rem 3rem; }

    /* ── Glass card ── */
    .glass-card {
      background: rgba(255,255,255,.045);
      backdrop-filter: blur(18px) saturate(1.4);
      border: 1px solid rgba(200,160,50,.13);
      border-radius: 16px;
      box-shadow: 0 2px 0 rgba(255,220,100,.04) inset, 0 16px 48px rgba(0,0,0,.35);
    }

    /* ── Welcome ── */
    .td-welcome { margin-bottom:2rem; animation:floatUp .5s ease both; }
    .td-welcome-tag {
      display:inline-flex; align-items:center; gap:.4rem;
      font-size:.68rem; letter-spacing:.14em; text-transform:uppercase;
      color:rgba(200,160,60,.6); margin-bottom:.6rem; font-weight:500;
    }
    .td-welcome-tag-dot {
      width:6px; height:6px; border-radius:50%;
      background:#c8a040; animation:glow-dot 2.5s infinite;
    }
    .td-name {
      font-family:'Playfair Display',serif;
      font-size:2.1rem; font-weight:700; color:#f5e6c8;
      letter-spacing:-.01em; line-height:1.2;
    }
    .td-sub { font-size:.86rem; color:rgba(200,170,100,.45); margin-top:.35rem; font-weight:300; }
    .td-badge-row { display:flex; gap:.55rem; margin-top:.75rem; flex-wrap:wrap; }
    .td-badge {
      display:inline-flex; align-items:center; gap:.3rem;
      padding:.22rem .75rem; border-radius:7px; font-size:.7rem; font-weight:500;
    }
    .td-badge-subject { background:rgba(147,130,200,.1); color:#c4b5fd; border:1px solid rgba(147,130,200,.2); }

    /* ── Stats ── */
    .td-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.5rem; animation:floatUp .5s .1s ease both; }
    .td-stat { padding:1.25rem 1.4rem; }
    .td-stat-label {
      font-size:.64rem; letter-spacing:.12em; text-transform:uppercase;
      color:rgba(200,160,60,.5); margin-bottom:.45rem; font-weight:500;
    }
    .td-stat-value {
      font-family:'Playfair Display',serif;
      font-size:1.9rem; font-weight:700; color:#f5e6c8;
    }
    .td-stat-hint { font-size:.71rem; color:rgba(200,170,100,.35); margin-top:.3rem; font-weight:300; }

    /* ── Quick actions grid ── */
    .td-actions { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.75rem; animation:floatUp .5s .15s ease both; }
    .td-action-card {
      padding:1.5rem; cursor:pointer; transition:all .2s;
    }
    .td-action-card:hover { background:rgba(200,160,50,.06) !important; transform:translateY(-2px); }
    .td-action-icon {
      width:42px; height:42px; border-radius:11px;
      display:flex; align-items:center; justify-content:center; margin-bottom:1rem;
    }
    .td-action-icon svg { width:20px; height:20px; }
    .td-action-title { font-family:'Playfair Display',serif; font-size:.95rem; font-weight:600; color:#f5e6c8; margin-bottom:.35rem; }
    .td-action-desc  { font-size:.78rem; color:rgba(200,170,100,.4); font-weight:300; }

    /* ── Section header ── */
    .td-section { margin-bottom:2rem; animation:floatUp .5s .2s ease both; }
    .td-section-heading { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; }
    .td-section-title { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:600; color:#f5e6c8; }
    .td-count-chip {
      font-family:'DM Mono',monospace; font-size:.7rem;
      color:rgba(200,160,60,.5); padding:.18rem .55rem;
      background:rgba(200,160,50,.07); border-radius:6px;
      border:1px solid rgba(200,160,50,.12);
    }

    /* ── Divider ── */
    .td-divider { height:1px; background:rgba(200,160,50,.1); margin:1.75rem 0; border:none; }

    /* ── Quiz list ── */
    .td-quiz-list { display:flex; flex-direction:column; gap:.75rem; }
    .td-quiz-card {
      padding:1.1rem 1.4rem;
      display:flex; align-items:center; gap:1rem;
      position:relative; overflow:hidden; transition:all .15s;
    }
    .td-quiz-card.status-active::before  { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:#c8a040; border-radius:2px; }
    .td-quiz-card.status-scheduled::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:#a06020; border-radius:2px; }
    .td-quiz-card.status-ended { opacity:.5; }
    .td-quiz-card:hover:not(.status-ended) { background:rgba(200,160,50,.04) !important; }

    .td-quiz-file-icon {
      width:44px; height:44px; border-radius:12px;
      display:flex; align-items:center; justify-content:center;
      font-size:1.2rem; flex-shrink:0;
    }
    .td-quiz-info { flex:1; min-width:0; }
    .td-quiz-title { font-weight:500; color:#f5e6c8; font-size:.87rem; margin-bottom:.2rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .td-quiz-source { font-size:.72rem; color:rgba(200,170,100,.4); display:flex; align-items:center; gap:.4rem; font-weight:300; }
    .td-quiz-source svg { width:12px; height:12px; }
    .td-quiz-time { font-size:.69rem; color:rgba(200,170,100,.3); font-family:'DM Mono',monospace; margin-top:.2rem; display:flex; align-items:center; gap:.3rem; }
    .td-quiz-meta { display:flex; align-items:center; gap:.6rem; flex-shrink:0; }
    .td-quiz-q-count { font-family:'DM Mono',monospace; font-size:.72rem; color:rgba(200,170,100,.3); }

    .td-status-badge { padding:.16rem .55rem; border-radius:6px; font-size:.66rem; font-weight:500; letter-spacing:.04em; }
    .td-status-badge.draft     { background:rgba(255,255,255,.05); color:rgba(200,170,100,.28); border:1px solid rgba(255,255,255,.07); }
    .td-status-badge.scheduled { background:rgba(180,100,20,.1); color:#d4a060; border:1px solid rgba(180,100,20,.2); }
    .td-status-badge.active    { background:rgba(200,160,40,.12); color:#e8c878; border:1px solid rgba(200,160,40,.22); }
    .td-status-badge.ended     { background:rgba(255,255,255,.04); color:rgba(200,170,100,.25); border:1px solid rgba(255,255,255,.06); }

    .td-quiz-actions { display:flex; align-items:center; gap:.5rem; flex-shrink:0; }
    .td-quiz-send-btn {
      padding:.44rem 1rem; border-radius:9px; border:none;
      font-family:'DM Sans',sans-serif; font-size:.78rem; font-weight:500;
      cursor:pointer; transition:all .15s; white-space:nowrap;
      color:#fff8e8;
      background: linear-gradient(135deg,#8b1a1a 0%,#6b1010 50%,#8b1a1a 100%);
      background-size:200% auto;
      box-shadow: 0 4px 16px rgba(120,20,20,.45), 0 1px 0 rgba(255,200,80,.12) inset;
      display:inline-flex; align-items:center; gap:.35rem;
    }
    .td-quiz-send-btn:hover { animation:shimmer .9s linear infinite; transform:translateY(-1px); }
    .td-quiz-send-btn:disabled { opacity:.4; cursor:not-allowed; animation:none; transform:none; }

    .td-quiz-delete-btn {
      padding:.44rem .8rem; border-radius:9px;
      border:1px solid rgba(239,68,68,.25);
      background:rgba(239,68,68,.07);
      color:rgba(252,165,165,.7); font-family:'DM Sans',sans-serif;
      font-size:.78rem; font-weight:500; cursor:pointer;
      transition:all .15s; white-space:nowrap;
      display:inline-flex; align-items:center; gap:4px;
    }
    .td-quiz-delete-btn:hover { background:rgba(239,68,68,.14); border-color:rgba(239,68,68,.45); color:#fca5a5; }
    .td-quiz-delete-btn:disabled { opacity:.45; cursor:not-allowed; }

    /* ── Students grid ── */
    .td-students-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:.9rem; }
    .td-student-card { padding:1.25rem; transition:all .15s; }
    .td-student-card:hover { background:rgba(200,160,50,.04) !important; }
    .td-student-top { display:flex; align-items:center; gap:.75rem; margin-bottom:.85rem; }
    .td-avatar {
      width:40px; height:40px; border-radius:11px;
      background:rgba(120,20,20,.25); border:1px solid rgba(200,160,50,.15);
      display:flex; align-items:center; justify-content:center;
      font-size:.8rem; font-weight:700; color:#e8c878; flex-shrink:0;
    }
    .td-student-name  { font-weight:500; color:#f5e6c8; font-size:.87rem; }
    .td-student-email { font-size:.7rem; color:rgba(200,170,100,.35); font-family:'DM Mono',monospace; margin-top:.1rem; }
    .td-student-stats { display:flex; gap:.55rem; flex-wrap:wrap; margin-bottom:.75rem; }
    .td-pill { display:inline-flex; align-items:center; gap:.3rem; padding:.16rem .55rem; border-radius:6px; font-size:.7rem; font-weight:500; }
    .td-pill-pts    { background:rgba(200,160,40,.09); color:#e8c878; border:1px solid rgba(200,160,40,.18); }
    .td-pill-tier   { background:rgba(147,130,200,.1); color:#c4b5fd; border:1px solid rgba(147,130,200,.2); }
    .td-pill-streak { background:rgba(239,68,68,.08); color:rgba(252,165,165,.7); border:1px solid rgba(239,68,68,.15); }

    /* ── Leaderboard ── */
    .td-lb-row {
      display:flex; align-items:center; gap:.85rem;
      padding:.85rem 1.25rem; border-bottom:1px solid rgba(200,160,50,.06);
      transition:background .12s;
    }
    .td-lb-row:last-child { border-bottom:none; }
    .td-lb-row:hover { background:rgba(200,160,50,.03); }
    .td-lb-rank { font-family:'DM Mono',monospace; font-size:.8rem; font-weight:700; color:rgba(200,170,100,.28); width:28px; text-align:center; flex-shrink:0; }
    .td-lb-rank.top1 { color:#e8c878; }
    .td-lb-rank.top2 { color:#9ca3af; }
    .td-lb-rank.top3 { color:#b45309; }
    .td-lb-name { font-size:.82rem; font-weight:500; color:rgba(245,230,200,.8); }
    .td-lb-behind { font-size:.68rem; color:rgba(200,170,100,.3); margin-top:.1rem; font-weight:300; }
    .td-lb-pts { font-family:'DM Mono',monospace; font-size:.8rem; font-weight:700; color:#f5e6c8; }

    /* ── Empty state ── */
    .td-empty {
      padding:2.2rem 1.5rem; text-align:center;
      border:1px dashed rgba(200,160,50,.12); border-radius:14px;
      color:rgba(200,170,100,.3); font-size:.83rem; font-weight:300;
    }
    .td-empty svg { width:34px; height:34px; margin:0 auto .8rem; opacity:.25; display:block; }

    /* ── Skeleton ── */
    .skeleton {
      height:13px; border-radius:5px;
      background:linear-gradient(90deg,rgba(200,160,50,.04) 0%,rgba(200,160,50,.1) 50%,rgba(200,160,50,.04) 100%);
      background-size:800px 100%; animation:skeleton-wave 1.4s infinite;
    }

    /* ── Spinner ── */
    .td-spinner {
      display:inline-block; width:14px; height:14px;
      border:2px solid rgba(200,160,50,.2); border-top-color:#c8a040;
      border-radius:50%; animation:spin .7s linear infinite;
    }

    /* ── Settings ── */
    .td-settings-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; padding:1.5rem; }
    .td-field-label {
      display:block; font-size:.66rem; letter-spacing:.12em; text-transform:uppercase;
      color:rgba(200,160,60,.65); margin-bottom:.5rem; font-weight:500;
    }
    .td-input {
      width:100%; padding:.7rem .95rem; border-radius:9px;
      background:rgba(255,255,255,.055); border:1px solid rgba(200,160,50,.2);
      color:#f5e6c8; font-family:'DM Sans',sans-serif; font-size:.87rem; font-weight:300;
      outline:none; transition:all .2s; margin-bottom:.6rem;
    }
    .td-input::placeholder { color:rgba(200,170,100,.25); }
    .td-input:focus { border-color:rgba(200,160,50,.5); background:rgba(255,255,255,.08); box-shadow:0 0 0 3px rgba(190,140,30,.12); }
    .td-submit-btn {
      width:100%; padding:.75rem 1rem; border:none; border-radius:9px;
      cursor:pointer; font-family:'DM Sans',sans-serif; font-size:.87rem; font-weight:500;
      letter-spacing:.04em; color:#fff8e8; transition:all .15s;
      background:linear-gradient(135deg,#8b1a1a 0%,#6b1010 50%,#8b1a1a 100%);
      background-size:200% auto;
      box-shadow:0 4px 16px rgba(120,20,20,.45), 0 1px 0 rgba(255,200,80,.12) inset;
      margin-bottom:.5rem;
    }
    .td-submit-btn:hover { animation:shimmer .9s linear infinite; transform:translateY(-1px); }
    .td-submit-btn:disabled { opacity:.5; cursor:not-allowed; animation:none; transform:none; }
    .td-outline-btn {
      width:100%; padding:.65rem 1rem; border-radius:9px; cursor:pointer;
      font-family:'DM Sans',sans-serif; font-size:.82rem; font-weight:500;
      border: 1px solid rgba(200,160,50,.22);
      background: rgba(200,160,50,.06); color:rgba(200,160,80,.7);
      transition:all .15s; margin-bottom:.5rem;
    }
    .td-outline-btn:hover { background:rgba(200,160,50,.14); color:#e8c878; }
    .td-error-box {
      display:flex; align-items:center; gap:.55rem; padding:.65rem .9rem;
      background:rgba(239,68,68,.07); border:1px solid rgba(239,68,68,.2);
      border-radius:9px; font-size:.79rem; color:#fca5a5; margin-bottom:.65rem;
    }
    .td-success-hint { margin-top:.4rem; font-size:.78rem; color:#c8a040; font-weight:300; }

    /* ── Modal overlay ── */
    .td-modal-overlay {
      position:fixed; inset:0; z-index:60;
      background:rgba(0,0,0,.75); backdrop-filter:blur(10px);
      display:flex; align-items:center; justify-content:center; padding:1.5rem;
      animation:fadeIn .2s ease both;
    }
    .td-modal {
      background:#160808;
      border:1px solid rgba(200,160,50,.15);
      border-radius:20px; padding:2rem 2.2rem;
      width:100%; max-width:520px;
      animation:modalIn .28s cubic-bezier(.34,1.56,.64,1) both;
      box-shadow:0 40px 80px rgba(0,0,0,.8);
    }
    .td-modal-icon {
      width:50px; height:50px; border-radius:14px;
      background:rgba(120,20,20,.25); border:1px solid rgba(200,160,50,.2);
      display:flex; align-items:center; justify-content:center; margin-bottom:1.2rem;
    }
    .td-modal-icon svg { width:22px; height:22px; color:#e8c878; }
    .td-modal-title { font-family:'Playfair Display',serif; font-size:1.15rem; font-weight:700; color:#f5e6c8; margin-bottom:.4rem; }
    .td-modal-sub   { font-size:.82rem; color:rgba(200,170,100,.4); line-height:1.6; margin-bottom:1.5rem; font-weight:300; }
    .td-modal-sub strong { color:rgba(245,230,200,.8); font-weight:500; }
    .td-modal-label {
      font-size:.65rem; letter-spacing:.12em; text-transform:uppercase;
      color:rgba(200,160,60,.6); margin-bottom:.45rem; font-weight:500; display:block;
    }
    .td-modal-input {
      width:100%; padding:.65rem .9rem;
      background:rgba(255,255,255,.055); border:1px solid rgba(200,160,50,.18);
      border-radius:9px; color:#f5e6c8;
      font-family:'DM Sans',sans-serif; font-size:.85rem; font-weight:300;
      outline:none; margin-bottom:1rem; transition:border-color .2s;
    }
    .td-modal-input:focus { border-color:rgba(200,160,50,.5); }

    .td-student-select-list {
      max-height:220px; overflow-y:auto;
      border:1px solid rgba(200,160,50,.12); border-radius:10px;
      margin-bottom:1.1rem; padding:.4rem;
    }
    .td-student-checkbox-item {
      display:flex; align-items:center; gap:.75rem;
      padding:.55rem .5rem; border-radius:8px; cursor:pointer; transition:background .1s;
    }
    .td-student-checkbox-item:hover { background:rgba(200,160,50,.05); }
    .td-student-checkbox-item input { width:16px; height:16px; cursor:pointer; accent-color:#c8a040; }
    .td-student-checkbox-name { font-size:.83rem; font-weight:500; color:#f5e6c8; }
    .td-student-checkbox-email { font-size:.69rem; color:rgba(200,170,100,.35); font-family:'DM Mono',monospace; }
    .td-select-all-row {
      display:flex; align-items:center; gap:.75rem; padding:.4rem .5rem;
      border-bottom:1px solid rgba(200,160,50,.08); margin-bottom:.4rem;
      font-size:.78rem; font-weight:500; color:rgba(200,170,100,.6);
    }
    .td-select-all-row input { width:16px; height:16px; cursor:pointer; accent-color:#c8a040; }

    .td-modal-actions { display:flex; gap:.75rem; margin-top:.5rem; }
    .td-btn-cancel {
      flex:1; padding:.72rem; border-radius:9px;
      border:1px solid rgba(200,160,50,.18); background:rgba(200,160,50,.05);
      color:rgba(200,160,80,.5); font-family:'DM Sans',sans-serif;
      font-size:.84rem; font-weight:500; cursor:pointer; transition:all .15s;
    }
    .td-btn-cancel:hover { background:rgba(200,160,50,.12); color:#e8c878; }
    .td-btn-send {
      flex:2; padding:.72rem; border-radius:9px; border:none;
      color:#fff8e8; font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:500;
      cursor:pointer; transition:all .15s; letter-spacing:.03em;
      background:linear-gradient(135deg,#8b1a1a 0%,#6b1010 50%,#8b1a1a 100%);
      background-size:200% auto;
      box-shadow:0 4px 16px rgba(120,20,20,.45);
    }
    .td-btn-send:hover { animation:shimmer .9s linear infinite; }
    .td-btn-send:disabled { opacity:.4; cursor:not-allowed; animation:none; }

    /* ── Confirm modal danger button ── */
    .td-btn-danger {
      flex:2; padding:.72rem; border-radius:9px; border:none;
      color:#fff8e8; font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:500;
      cursor:pointer; transition:all .15s; letter-spacing:.03em;
      background:linear-gradient(135deg,#7a1010 0%,#5a0808 50%,#7a1010 100%);
      background-size:200% auto;
      box-shadow:0 4px 16px rgba(100,10,10,.55);
    }
    .td-btn-danger:hover { animation:shimmer .9s linear infinite; }

    /* ── Send success overlay ── */
    .td-send-success {
      position:fixed; inset:0; z-index:70;
      display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.4rem;
      background:rgba(22,8,8,.96); backdrop-filter:blur(20px);
      animation:fadeIn .3s ease both;
    }
    .td-send-success-ring {
      width:90px; height:90px; border-radius:50%;
      background:rgba(120,20,20,.25); border:2px solid rgba(200,160,50,.4);
      display:flex; align-items:center; justify-content:center;
      animation:successRing .6s cubic-bezier(.34,1.56,.64,1) both;
      box-shadow:0 0 40px rgba(200,160,40,.2);
    }
    .td-send-success-ring svg { width:38px; height:38px; color:#e8c878; animation:checkPop .5s .3s both; }
    .td-send-success-title { font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:700; color:#f5e6c8; margin-bottom:.4rem; letter-spacing:-.01em; }
    .td-send-success-sub   { font-size:.84rem; color:rgba(200,170,100,.4); font-weight:300; }

    /* ── Toast ── */
    .td-toast {
      position:fixed; bottom:2rem; right:2rem; z-index:80;
      display:flex; align-items:center; gap:.75rem;
      padding:.85rem 1.2rem; border-radius:12px;
      background:#160808; border:1px solid rgba(200,160,50,.15);
      box-shadow:0 20px 40px rgba(0,0,0,.6);
      font-size:.84rem; font-weight:500;
      animation:toastSlide 3.5s ease forwards;
    }
    .td-toast.success { border-color:rgba(200,160,40,.3); color:#e8c878; }
    .td-toast.error   { border-color:rgba(239,68,68,.3);  color:#fca5a5; }
    .td-toast svg { width:16px; height:16px; flex-shrink:0; }

    /* ── Chart styling ── */
    .td-chart-wrap .MuiChartsAxis-line  { stroke:rgba(200,160,50,.15) !important; }
    .td-chart-wrap .MuiChartsAxis-tick  { stroke:rgba(200,160,50,.15) !important; }

    /* ── Attendance chart wrapper ── */
    .td-analytics-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.75rem; animation:floatUp .5s .13s ease both; }

    @media(max-width:760px){
      .td-layout { grid-template-columns:1fr; padding:.85rem; }
      .td-side { position:static; }
      .td-stats { grid-template-columns:1fr 1fr; }
      .td-analytics-grid { grid-template-columns:1fr; }
      .td-settings-grid { grid-template-columns:1fr; }
      .td-topbar { padding:0 1rem; }
      .td-name { font-size:1.65rem; }
      .td-actions { grid-template-columns:1fr; }
    }
  `}</style>
);

/* ── Helpers ── */
const initials = (name = "") =>
  name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";

const fileTypeEmoji = (fileType) => {
  if (!fileType) return "📄";
  if (fileType.includes("pdf")) return "📕";
  if (fileType.includes("word") || fileType.includes("docx")) return "📘";
  if (fileType.includes("presentation") || fileType.includes("pptx")) return "📊";
  return "📄";
};

const fileTypeBg = (fileType) => {
  if (!fileType) return "rgba(255,255,255,.04)";
  if (fileType.includes("pdf")) return "rgba(200,60,40,.1)";
  if (fileType.includes("word") || fileType.includes("docx")) return "rgba(40,80,200,.1)";
  if (fileType.includes("presentation") || fileType.includes("pptx")) return "rgba(200,140,20,.1)";
  return "rgba(255,255,255,.04)";
};

const statusLabel = (s) => {
  if (s === "scheduled") return "⏰ Scheduled";
  if (s === "active")    return "● Live Now";
  if (s === "ended")     return "Ended";
  return "Draft";
};

const rankEmoji = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
const rankClass = (i) => i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : "";

/* ── Icons ── */
const Ico = {
  Overview: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2" y="2" width="7" height="7" rx="1.5"/>
      <rect x="11" y="2" width="7" height="7" rx="1.5"/>
      <rect x="2" y="11" width="7" height="7" rx="1.5"/>
      <rect x="11" y="11" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  Settings: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="10" cy="10" r="2.5"/>
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"/>
    </svg>
  ),
  Check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  ),
  Send: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/>
    </svg>
  ),
  Upload: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Quiz: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  File: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
    </svg>
  ),
  Trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:"13px",height:"13px"}}>
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
    </svg>
  ),
  Star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.87L12 18.07 5.82 22 7 14.14 2 9.27l6.91-1.01z"/>
    </svg>
  ),
  Warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
};

const chartAxisStyle = {
  tickLabelStyle: { fill: "rgba(200,170,100,.6)", fontSize: 11, fontFamily: "DM Mono" },
};
const chartSx = {
  "& .MuiChartsAxis-line": { stroke: "rgba(200,160,50,.15)" },
  "& .MuiChartsAxis-tick": { stroke: "rgba(200,160,50,.15)" },
  "& .MuiChartsLegend-label": { fill: "#c8a040 !important", fontSize: "11px !important" },
};

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("overview");
  const [teacherName, setTeacherName] = useState("");
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ fullName: "", subject: "" });
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

  const [sendModal, setSendModal] = useState(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(null);
  const [toast, setToast] = useState(null);

  const [confirmModal, setConfirmModal] = useState(null);

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3600);
  };

  const showConfirm = (title, message, onConfirm) => {
    setConfirmModal({ title, message, onConfirm });
  };

  const openSendModal = (quiz) => {
    const now = new Date();
    const fmt = (d) => d.toISOString().slice(0, 16);
    setStartTime(fmt(new Date(now.getTime() + 5 * 60000)));
    setEndTime(fmt(new Date(now.getTime() + 65 * 60000)));
    setSelectedStudentIds([]);
    setSendModal({ quiz });
  };

  const handleSelectAllStudents = (e) => {
    setSelectedStudentIds(e.target.checked ? myStudents.map(s => s.id) : []);
  };

  const handleToggleStudent = (id) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (!startTime || !endTime) { showToast("Please set both times", "error"); return; }
    if (new Date(endTime) <= new Date(startTime)) { showToast("End time must be after start time", "error"); return; }
    if (selectedStudentIds.length === 0) { showToast("Please select at least one student", "error"); return; }
    setSending(true);
    try {
      const result = await apiFetch("/api/quiz/schedule", {
        method: "POST",
        body: JSON.stringify({ quizId: sendModal.quiz.id, startTime, endTime, studentIds: selectedStudentIds }),
      });
      setSendModal(null);
      setSendSuccess({ message: result.message || `Quiz sent to ${selectedStudentIds.length} student(s)!` });
      loadQuizzes();
      setTimeout(() => setSendSuccess(null), 2800);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSending(false);
    }
  };

  const deleteQuiz = (quizId, quizTitle) => {
    showConfirm(
      "Delete Quiz",
      `Are you sure you want to delete "${quizTitle}"? This action cannot be undone.`,
      async () => {
        setDeletingQuizId(quizId);
        try {
          await apiFetch(`/api/quiz/${quizId}`, { method: "DELETE" });
          showToast(`"${quizTitle}" deleted`, "success");
          loadQuizzes();
        } catch (err) {
          showToast(err.message, "error");
        } finally {
          setDeletingQuizId(null);
        }
      }
    );
  };

  const loadQuizzes = useCallback(async () => {
    setQuizzesLoading(true);
    try {
      const data = await apiFetch("/api/quiz/my-quizzes-teacher");
      setMyQuizzes(data.quizzes || []);
    } catch { setMyQuizzes([]); }
    finally { setQuizzesLoading(false); }
  }, []);

  const loadCertRequests = useCallback(async () => {
    setCertLoading(true);
    try {
      const data = await apiFetch("/api/admin/my-certificate-requests");
      setCertRequests(data || []);
    } catch { setCertRequests([]); }
    finally { setCertLoading(false); }
  }, []);

  const loadAttendanceTimeline = useCallback(async () => {
    try {
      const data = await apiFetch("/api/quiz/attendance/teacher/timeline");
      setAttendanceTimeline(Array.isArray(data) ? data : []);
    } catch { setAttendanceTimeline([]); }
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

  const resetStudentPoints = () => {
    showConfirm(
      "Reset All Points",
      "Are you sure you want to reset points for all your assigned students? This cannot be undone.",
      async () => {
        try {
          const r = await apiFetch("/api/admin/my-students/reset-points", { method: "PATCH" });
          showToast(r.message || "Points reset", "success");
          await refreshDashboard();
        } catch (err) {
          showToast(err.message, "error");
        }
      }
    );
  };

  const resetSingleStudentPoints = (student) => {
    showConfirm(
      "Reset Points",
      `Reset points for ${student.full_name}? Their score, streak, and tier will be cleared.`,
      async () => {
        try {
          const r = await apiFetch(`/api/admin/my-students/${student.id}/reset-points`, { method: "PATCH" });
          showToast(r.message || "Student points reset", "success");
          setMyStudents(prev => prev.map(s => s.id === student.id ? { ...s, points: 0, streak: 0, tier: "Beginner" } : s));
        } catch (err) {
          showToast(err.message, "error");
        }
      }
    );
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
    w.document.close(); w.focus(); w.print();
  };

  const teacherSubjectOptions = (profileForm.subject || "")
    .split("|").map(s => s.trim()).filter(Boolean);

  const assignStudentSubject = async (studentId, subject, append = false) => {
    if (!subject) return;
    setAssigningSubjectStudentId(studentId);
    try {
      const student = myStudents.find(s => s.id === studentId);
      let nextSubject = subject;
      if (append) {
        const list = (student?.course || "").split("|").map(x => x.trim()).filter(Boolean);
        if (!list.some(x => x.toLowerCase() === subject.toLowerCase())) list.push(subject);
        nextSubject = list.join(" | ");
      }
      await apiFetch(`/api/admin/my-students/${studentId}/subject`, {
        method: "PATCH",
        body: JSON.stringify({ subject: nextSubject }),
      });
      setMyStudents(prev => prev.map(s => s.id === studentId ? { ...s, course: nextSubject } : s));
      setSelectedStudentSubject(prev => ({ ...prev, [studentId]: "" }));
      showToast(append ? "Additional subject added" : "Subject assigned", "success");
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
      setProfileForm({ fullName: profile.full_name || "", subject: profile.subject || "" });
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
      showToast(successMsg, "success");
    } catch (err) { showToast(err.message, "error"); }
  };

  const saveFullName = async (e) => {
    e.preventDefault();
    await updateProfile({ fullName: profileForm.fullName }, "Full name updated");
  };

  const saveSubject = async (e) => {
    e.preventDefault();
    const currentSubject = (profileForm.subject || "").trim();
    const draftSubject   = (newSubjectDraft || "").trim();
    if (addingSubject && !draftSubject) { showToast("Please enter a subject", "error"); return; }
    let subjectToSave = currentSubject;
    if (addingSubject) {
      const existing = currentSubject.split("|").map(s => s.trim()).filter(Boolean);
      if (!existing.some(s => s.toLowerCase() === draftSubject.toLowerCase())) existing.push(draftSubject);
      subjectToSave = existing.join(" | ");
    }
    setProfileForm(p => ({ ...p, subject: subjectToSave }));
    await updateProfile({ subject: subjectToSave }, addingSubject ? "New subject added" : "Subject updated");
    setAddingSubject(false);
    setNewSubjectDraft("");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault(); setPwError("");
    if (pwForm.next.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError("New passwords do not match."); return; }
    if (pwForm.current === pwForm.next) { setPwError("New password must differ from current."); return; }
    setPwLoading(true);
    try {
      await apiFetch("/api/admin/change-password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      setPwSuccess(true);
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err) { setPwError(err.message); }
    finally { setPwLoading(false); }
  };

  useEffect(() => {
    const user = getUser();
    if (!user) { navigate("/"); return; }
    if (user.role !== "teacher") { navigate("/student"); return; }
    loadProfile();
    apiFetch("/api/admin/my-students")
      .then(setMyStudents).catch(() => setMyStudents([]))
      .finally(() => setLoading(false));
    loadQuizzes();
    loadCertRequests();
    loadAttendanceTimeline();
  }, [navigate, loadQuizzes, loadProfile, loadCertRequests, loadAttendanceTimeline]);

  /* ── Derived data ── */
  const sectionSummary = myStudents.reduce((acc, s) => {
    const key = s.section || "Unspecified";
    if (!acc[key]) acc[key] = { total: 0, count: 0 };
    acc[key].total += Math.max(0, Math.min(100, Number(s.points || 0)));
    acc[key].count += 1;
    return acc;
  }, {});
  const topSection = Object.entries(sectionSummary)
    .map(([section, v]) => ({ section, avg: v.count ? +(v.total / v.count).toFixed(1) : 0, count: v.count }))
    .sort((a, b) => b.avg - a.avg)[0] || { section: "—", avg: 0, count: 0 };

  const pointsLeaderboard = [...myStudents].sort((a, b) => (b.points || 0) - (a.points || 0));
  const topPointStudents  = pointsLeaderboard.slice(0, 8);
  const topPointLabels    = topPointStudents.map(s => s.full_name?.split(" ")[0] || "Student");
  const topPointValues    = topPointStudents.map(s => s.points || 0);

  const attendanceDates  = attendanceTimeline.map(d =>
    new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );
  const presentSeries = attendanceTimeline.map(d => d.present || 0);
  const absentSeries  = attendanceTimeline.map(d => d.absent  || 0);

  const quizSpark = myQuizzes.slice(0, 7).reverse().map((_, i) => i + 1);

  return (
    <>
      <Styles />

      {/* Toast */}
      {toast && (
        <div className={`td-toast ${toast.type}`}>
          {toast.type === "success"
            ? Ico.Check
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
          {toast.msg}
        </div>
      )}

      {/* ── Custom Confirm Modal ── */}
      {confirmModal && (
        <div
          className="td-modal-overlay"
          style={{ zIndex: 65 }}
          onClick={() => setConfirmModal(null)}
        >
          <div
            className="td-modal"
            style={{ maxWidth: 420 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="td-modal-icon" style={{ background: "rgba(139,26,26,.25)", borderColor: "rgba(239,68,68,.25)" }}>
              {Ico.Warning}
            </div>
            <h2 className="td-modal-title">{confirmModal.title}</h2>
            <p className="td-modal-sub">{confirmModal.message}</p>
            <div className="td-modal-actions">
              <button className="td-btn-cancel" onClick={() => setConfirmModal(null)}>
                Cancel
              </button>
              <button
                className="td-btn-danger"
                onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }}
              >
                ✦ Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send modal */}
      {sendModal && (
        <div className="td-modal-overlay" onClick={() => !sending && setSendModal(null)}>
          <div className="td-modal" onClick={e => e.stopPropagation()}>
            <div className="td-modal-icon">{Ico.Send}</div>
            <h2 className="td-modal-title">Send Quiz to Students</h2>
            <p className="td-modal-sub">
              Scheduling <strong>"{sendModal.quiz.title}"</strong> — choose recipients and schedule below.
            </p>

            {sendModal.quiz.lecture && (
              <div style={{ display:"flex", alignItems:"center", gap:".65rem", padding:".65rem .9rem", borderRadius:10, background:"rgba(200,160,50,.05)", border:"1px solid rgba(200,160,50,.1)", marginBottom:"1.1rem" }}>
                <span style={{ fontSize:"1.1rem" }}>{fileTypeEmoji(sendModal.quiz.lecture.file_type)}</span>
                <div>
                  <div style={{ fontSize:".8rem", fontWeight:500, color:"rgba(245,230,200,.8)" }}>{sendModal.quiz.lecture.title}</div>
                  <div style={{ fontSize:".7rem", color:"rgba(200,170,100,.35)", fontWeight:300 }}>Source lecture</div>
                </div>
              </div>
            )}

            <label className="td-modal-label">Select Students ({myStudents.length} available)</label>
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
                  <div>
                    <div className="td-student-checkbox-name">{student.full_name}</div>
                    <div className="td-student-checkbox-email">{student.email}</div>
                  </div>
                </label>
              ))}
              {myStudents.length === 0 && (
                <div style={{ padding:"1rem", textAlign:"center", color:"rgba(200,170,100,.25)", fontSize:".8rem" }}>
                  No students assigned yet.
                </div>
              )}
            </div>

            <label className="td-modal-label">Start Time</label>
            <input className="td-modal-input" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
            <label className="td-modal-label">End Time</label>
            <input className="td-modal-input" type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />

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
          <div className="td-send-success-ring">{Ico.Check}</div>
          <div style={{ textAlign:"center" }}>
            <div className="td-send-success-title">Quiz Sent! 🚀</div>
            <div className="td-send-success-sub">{sendSuccess.message}</div>
          </div>
        </div>
      )}

      <div className="td-root">
        <div className="deco-ring" />
        <div className="deco-ring deco-ring-2" />

        {/* Topbar */}
        <header className="td-topbar">
          <div className="td-logo">
            <div className="td-logo-icon">{Ico.Star}</div>
            QuizSystem
          </div>
          <div className="td-topbar-right">
            <div className="td-user-chip">
              <div className="td-user-chip-avatar">{initials(teacherName)}</div>
              {teacherName}
            </div>
            {teacherProfile?.subject && <span className="td-chip-small">{teacherProfile.subject}</span>}
            <button className="td-topbar-btn" onClick={refreshDashboard}>↻ Refresh</button>
            <button className="td-topbar-btn" onClick={resetStudentPoints}>Reset Points</button>
            <button className="td-topbar-btn" onClick={() => { logout(); navigate("/"); }}>Sign out</button>
          </div>
        </header>

        <div className="td-layout">
          {/* Sidebar */}
          <aside className="td-side">
            <div className="td-side-label">Navigation</div>
            <div className={`td-side-item ${activeView === "overview" ? "active" : ""}`} onClick={() => setActiveView("overview")}>
              {Ico.Overview} Overview
            </div>
            <div className={`td-side-item ${activeView === "settings" ? "active" : ""}`} onClick={() => { setActiveView("settings"); setPwError(""); setPwSuccess(false); }}>
              {Ico.Settings} Settings
            </div>
          </aside>

          <div className="td-body">

            {/* ══ OVERVIEW ══ */}
            {activeView === "overview" && (
              <>
                {/* Welcome */}
                <div className="td-welcome">
                  <div className="td-welcome-tag">
                    <span className="td-welcome-tag-dot" /> Teacher Dashboard
                  </div>
                  <h1 className="td-name">
                    Welcome back{teacherName ? `, ${teacherName.split(" ")[0]}` : ""}! 👋
                  </h1>
                  <p className="td-sub">
                    Manage your students, lectures, and quizzes from here
                    {teacherProfile?.subject ? ` · ${teacherProfile.subject}` : ""}
                  </p>
                  {teacherProfile?.subject && (
                    <div className="td-badge-row">
                      <span className="td-badge td-badge-subject">📚 {teacherProfile.subject}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="td-stats">
                  <div className="glass-card td-stat" style={{ animation:"floatUp .5s .1s ease both" }}>
                    <p className="td-stat-label">My Students</p>
                    <p className="td-stat-value">{loading ? "—" : myStudents.length}</p>
                    <p className="td-stat-hint">assigned to you</p>
                  </div>
                  <div className="glass-card td-stat" style={{ animation:"floatUp .5s .14s ease both" }}>
                    <p className="td-stat-label">Quizzes Created</p>
                    <p className="td-stat-value">{quizzesLoading ? "—" : myQuizzes.length}</p>
                    <p className="td-stat-hint">{myQuizzes.filter(q => q.status === "active").length} live now</p>
                    {quizSpark.length > 0 && (
                      <div style={{ marginTop:".5rem" }}>
                        <SparkLineChart data={quizSpark} height={44} color="#c8a040" />
                      </div>
                    )}
                  </div>
                  <div className="glass-card td-stat" style={{ animation:"floatUp .5s .18s ease both" }}>
                    <p className="td-stat-label">Top Section Avg.</p>
                    <p className="td-stat-value">{loading || !myStudents.length ? "—" : `${topSection.avg}%`}</p>
                    <p className="td-stat-hint">{topSection.section} · {topSection.count} student(s)</p>
                  </div>
                </div>

                {/* Attendance & Charts */}
                <div className="td-analytics-grid">
                  <div className="glass-card td-stat">
                    <p className="td-stat-label">Attendance by Date</p>
                    <div className="td-chart-wrap">
                      <LineChart
                        xAxis={[{ scaleType:"point", data: attendanceDates.length ? attendanceDates : ["No data"], ...chartAxisStyle }]}
                        series={[
                          { data: presentSeries.length ? presentSeries : [0], curve:"linear", label:"Present", color:"#c8a040" },
                          { data: absentSeries.length  ? absentSeries  : [0], curve:"linear", label:"Absent",  color:"rgba(200,60,40,.7)" },
                        ]}
                        height={220}
                        sx={chartSx}
                      />
                    </div>
                  </div>
                  <div className="glass-card td-stat">
                    <p className="td-stat-label">Points — Top Students</p>
                    <div className="td-chart-wrap">
                      <BarChart
                        xAxis={[{ scaleType:"band", data: topPointLabels.length ? topPointLabels : ["No data"], ...chartAxisStyle }]}
                        series={[{ data: topPointValues.length ? topPointValues : [0], color:"#c8a040" }]}
                        height={220}
                        sx={chartSx}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="td-actions">
                  <div className="glass-card td-action-card" onClick={() => navigate("/upload-lecture")}>
                    <div className="td-action-icon" style={{ background:"rgba(40,80,200,.12)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <h3 className="td-action-title">Upload Lecture</h3>
                    <p className="td-action-desc">Share PDF, DOCX, or PPTX materials with your class</p>
                  </div>
                  <div className="glass-card td-action-card" onClick={() => navigate("/generate-quiz")}>
                    <div className="td-action-icon" style={{ background:"rgba(120,20,20,.25)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#e8c878" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </div>
                    <h3 className="td-action-title">Generate Quiz</h3>
                    <p className="td-action-desc">Use AI to create quizzes from your lecture materials</p>
                  </div>
                </div>

                <hr className="td-divider" />

                {/* My Quizzes */}
                <div className="td-section">
                  <div className="td-section-heading">
                    <h2 className="td-section-title">My Quizzes</h2>
                    <span className="td-count-chip">{myQuizzes.length}</span>
                  </div>

                  {quizzesLoading ? (
                    <div className="td-quiz-list">
                      {[1,2,3].map(i => (
                        <div key={i} className="glass-card" style={{ padding:"1.1rem 1.4rem", display:"flex", alignItems:"center", gap:"1rem" }}>
                          <div style={{ width:44, height:44, borderRadius:12, background:"rgba(200,160,50,.05)" }} />
                          <div style={{ flex:1 }}>
                            <div className="skeleton" style={{ width:"45%", marginBottom:".4rem" }} />
                            <div className="skeleton" style={{ width:"65%" }} />
                          </div>
                          <div className="skeleton" style={{ width:70 }} />
                        </div>
                      ))}
                    </div>
                  ) : myQuizzes.length === 0 ? (
                    <div className="td-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 11l3 3L22 4"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                      </svg>
                      No quizzes yet — generate one from your lectures above.
                    </div>
                  ) : (
                    <div className="td-quiz-list">
                      {myQuizzes.map(quiz => (
                        <div key={quiz.id} className={`glass-card td-quiz-card status-${quiz.status}`}>
                          <div className="td-quiz-file-icon" style={{ background: fileTypeBg(quiz.lecture?.file_type) }}>
                            {fileTypeEmoji(quiz.lecture?.file_type)}
                          </div>
                          <div className="td-quiz-info">
                            <div className="td-quiz-title">{quiz.title}</div>
                            <div className="td-quiz-source">
                              {Ico.File}
                              {quiz.lecture?.title
                                ? <span>From: <strong style={{ color:"rgba(245,230,200,.6)" }}>{quiz.lecture.title}</strong></span>
                                : <span>No lecture linked</span>}
                            </div>
                            {quiz.start_time && (
                              <div className="td-quiz-time">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                {new Date(quiz.start_time).toLocaleString()} → {new Date(quiz.end_time).toLocaleString()}
                              </div>
                            )}
                          </div>
                          <div className="td-quiz-meta">
                            <span className="td-quiz-q-count">{quiz.question_count}Q</span>
                            <span className={`td-status-badge ${quiz.status}`}>{statusLabel(quiz.status)}</span>
                          </div>
                          <div className="td-quiz-actions">
                            {quiz.status !== "ended" && (
                              <button
                                className="td-quiz-send-btn"
                                disabled={deletingQuizId === quiz.id}
                                onClick={e => { e.stopPropagation(); openSendModal(quiz); }}
                              >
                                {quiz.status === "draft" ? "Send" : "Reschedule"}
                              </button>
                            )}
                            <button
                              className="td-quiz-delete-btn"
                              disabled={deletingQuizId === quiz.id}
                              onClick={e => { e.stopPropagation(); deleteQuiz(quiz.id, quiz.title); }}
                            >
                              {deletingQuizId === quiz.id ? <span className="td-spinner" /> : Ico.Trash}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <hr className="td-divider" />

                {/* My Students */}
                <div className="td-section">
                  <div className="td-section-heading">
                    <h2 className="td-section-title">My Students</h2>
                    <span className="td-count-chip">{myStudents.length}</span>
                  </div>

                  {loading ? (
                    <div className="td-students-grid">
                      {[1,2,3].map(i => (
                        <div key={i} className="glass-card" style={{ padding:"1.25rem" }}>
                          <div style={{ display:"flex", gap:".75rem", marginBottom:".85rem" }}>
                            <div style={{ width:40, height:40, borderRadius:11, background:"rgba(200,160,50,.05)" }} />
                            <div style={{ flex:1 }}>
                              <div className="skeleton" style={{ width:"70%", marginBottom:".4rem" }} />
                              <div className="skeleton" style={{ width:"90%" }} />
                            </div>
                          </div>
                          <div className="skeleton" style={{ width:"60%" }} />
                        </div>
                      ))}
                    </div>
                  ) : myStudents.length === 0 ? (
                    <div className="td-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                      </svg>
                      No students assigned yet. Contact your admin.
                    </div>
                  ) : (
                    <div className="td-students-grid">
                      {myStudents.map(s => (
                        <div key={s.id} className="glass-card td-student-card">
                          <div className="td-student-top">
                            <div className="td-avatar">{initials(s.full_name)}</div>
                            <div style={{ minWidth:0 }}>
                              <div className="td-student-name">{s.full_name}</div>
                              <div className="td-student-email">{s.email}</div>
                            </div>
                          </div>
                          <div className="td-student-stats">
                            <span className="td-pill td-pill-pts">⭐ {s.points ?? 0} pts</span>
                            <span className="td-pill td-pill-tier">{s.tier || "Beginner"}</span>
                            {s.streak > 0 && <span className="td-pill td-pill-streak">🔥 {s.streak}</span>}
                          </div>

                          {/* ── Reset Points — styled like Generate button ── */}
                          <button
                            type="button"
                            className="td-quiz-send-btn"
                            style={{
                              padding: ".4rem .85rem",
                              fontSize: ".75rem",
                              width: "auto",
                              marginBottom: ".7rem",
                            }}
                            onClick={() => resetSingleStudentPoints(s)}
                          >
                            {Ico.Trash} Reset Points
                          </button>

                          <select
                            className="td-input"
                            value={selectedStudentSubject[s.id] || ""}
                            onChange={e => setSelectedStudentSubject(prev => ({ ...prev, [s.id]: e.target.value }))}
                            disabled={assigningSubjectStudentId === s.id || teacherSubjectOptions.length === 0}
                            style={{ marginBottom:".5rem", padding:".45rem .7rem", fontSize:".76rem" }}
                          >
                            <option value="">Select subject…</option>
                            {teacherSubjectOptions.map(subj => (
                              <option key={subj} value={subj}>{subj}</option>
                            ))}
                          </select>
                          <div style={{ display:"flex", gap:".45rem" }}>
                            <button
                              className="td-quiz-send-btn"
                              type="button"
                              style={{ flex:1 }}
                              disabled={assigningSubjectStudentId === s.id || !(selectedStudentSubject[s.id] || "").trim()}
                              onClick={() => assignStudentSubject(s.id, selectedStudentSubject[s.id], false)}
                            >
                              Set Subject
                            </button>
                            <button
                              className="td-btn-cancel"
                              type="button"
                              style={{ flex:1, padding:".4rem" }}
                              disabled={assigningSubjectStudentId === s.id || !(selectedStudentSubject[s.id] || "").trim()}
                              onClick={() => assignStudentSubject(s.id, selectedStudentSubject[s.id], true)}
                            >
                              + Add
                            </button>
                          </div>
                          <p className="td-stat-hint" style={{ marginTop:".5rem", color:"#c8a040" }}>
                            Assigned: {s.course && s.course.trim() ? s.course : "None yet"}
                          </p>
                          {teacherSubjectOptions.length === 0 && (
                            <p className="td-stat-hint" style={{ marginTop:".2rem" }}>Add subjects in Settings first.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <hr className="td-divider" />

                {/* Leaderboard */}
                <div className="td-section">
                  <div className="td-section-heading">
                    <h2 className="td-section-title">Points Leaderboard</h2>
                    <span className="td-count-chip">{pointsLeaderboard.length}</span>
                  </div>
                  <div className="glass-card" style={{ overflow:"hidden" }}>
                    {pointsLeaderboard.length === 0 ? (
                      <div style={{ padding:"2.5rem", textAlign:"center", fontSize:".82rem", color:"rgba(200,170,100,.25)", fontWeight:300 }}>
                        No students with points yet.
                      </div>
                    ) : (
                      pointsLeaderboard.map((s, i) => {
                        const top = pointsLeaderboard[0]?.points || 0;
                        const gap = top - (s.points || 0);
                        return (
                          <div key={s.id} className="td-lb-row">
                            <span className={`td-lb-rank ${rankClass(i)}`}>{rankEmoji(i)}</span>
                            <div className="td-avatar" style={{ width:34, height:34, fontSize:".68rem" }}>{initials(s.full_name)}</div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div className="td-lb-name">{s.full_name}</div>
                              <div className="td-lb-behind">{gap === 0 ? "Leading" : `${gap} pts behind top`}</div>
                            </div>
                            <span className="td-lb-pts">{s.points || 0} pts</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <hr className="td-divider" />
              </>
            )}

            {/* ══ SETTINGS ══ */}
            {activeView === "settings" && (
              <div style={{ animation:"floatUp .4s ease both" }}>
                <div className="td-welcome">
                  <div className="td-welcome-tag">
                    <span className="td-welcome-tag-dot" /> Account
                  </div>
                  <h1 className="td-name" style={{ fontSize:"1.7rem" }}>Settings</h1>
                  <p className="td-sub">Manage your profile and teaching subjects</p>
                </div>

                <div className="glass-card">
                  <div className="td-settings-grid">
                    {/* Full Name */}
                    <form onSubmit={saveFullName}>
                      <label className="td-field-label">Full Name</label>
                      <input
                        className="td-input"
                        value={profileForm.fullName}
                        onChange={e => setProfileForm(p => ({ ...p, fullName: e.target.value }))}
                        placeholder="Your full name"
                        required
                      />
                      <button className="td-submit-btn" type="submit">Save Full Name</button>
                    </form>

                    {/* Subject */}
                    <form onSubmit={saveSubject}>
                      <label className="td-field-label">Subject</label>
                      <input
                        className="td-input"
                        value={profileForm.subject}
                        onChange={e => setProfileForm(p => ({ ...p, subject: e.target.value }))}
                        placeholder="Current subject(s)"
                      />
                      <button
                        className="td-outline-btn"
                        type="button"
                        onClick={() => setAddingSubject(v => !v)}
                      >
                        {addingSubject ? "Cancel New Subject" : "＋ Add New Subject"}
                      </button>
                      {addingSubject && (
                        <input
                          className="td-input"
                          value={newSubjectDraft}
                          onChange={e => setNewSubjectDraft(e.target.value)}
                          placeholder="New subject name"
                          required
                        />
                      )}
                      <button className="td-submit-btn" type="submit">Save Subject</button>
                    </form>

                    {/* Change Password */}
                    <form onSubmit={handleChangePassword}>
                      <label className="td-field-label">Change Password</label>
                      {pwError && <div className="td-error-box">⚠ {pwError}</div>}
                      {pwSuccess && <p className="td-success-hint">Password updated successfully.</p>}
                      <input className="td-input" type="password" placeholder="Current password" required value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} />
                      <input className="td-input" type="password" placeholder="New password (min 6 chars)" required value={pwForm.next} onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} />
                      <input className="td-input" type="password" placeholder="Confirm new password" required value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} />
                      <button className="td-submit-btn" type="submit" disabled={pwLoading}>
                        {pwLoading ? <span className="td-spinner" /> : "Update Password"}
                      </button>
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