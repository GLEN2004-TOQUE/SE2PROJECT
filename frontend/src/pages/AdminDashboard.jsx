import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/api";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";

const BASE_URL = process.env.REACT_APP_API_URL || "https://backend-7lik.onrender.com";

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

/* ── Print styles (injected globally for certificate) ── */
const PrintStyles = () => (
  <style>{`
    @media print {
      body > * { display: none !important; }
      #cert-print-root { display: block !important; }
    }
    #cert-print-root { display: none; }
  `}</style>
);

/* ── Global CSS ── */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes _fadeUp   { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
    @keyframes _slideD   { from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);} }
    @keyframes _fadeIn   { from{opacity:0;}to{opacity:1;} }
    @keyframes _spin     { to{transform:rotate(360deg);} }
    @keyframes _shimmer  { 0%{background-position:-600px 0;}100%{background-position:600px 0;} }
    @keyframes _modalIn  { from{opacity:0;transform:scale(.94) translateY(12px);}to{opacity:1;transform:scale(1) translateY(0);} }
    @keyframes _toast    { 0%{opacity:0;transform:translateX(50px);}10%{opacity:1;transform:none;}85%{opacity:1;}100%{opacity:0;transform:translateX(50px);} }
    @keyframes _popIn    { 0%{transform:scale(.7);opacity:0;}65%{transform:scale(1.08);}100%{transform:scale(1);opacity:1;} }
    @keyframes _dot      { 0%,100%{opacity:1;}50%{opacity:.3;} }

    .a-root {
      min-height:100vh;
      background:radial-gradient(circle at 10% 5%, #2b0d13 0%, #14090d 32%, #080708 100%);
      font-family:'DM Sans', sans-serif;
      color:#efe7e9;
      display:flex; flex-direction:column;
    }

    /* ── Topbar ── */
    .a-top {
      position:sticky; top:0; z-index:40;
      display:flex; align-items:center; justify-content:space-between;
      padding:0 2rem; height:58px;
      background:rgba(13,8,10,.94); backdrop-filter:blur(16px);
      border-bottom:1px solid rgba(255,255,255,.07);
      animation:_slideD .4s ease both;
    }
    .a-brand { display:flex; align-items:center; gap:.7rem; }
    .a-brand-mark {
      width:30px; height:30px; border-radius:8px;
      background:linear-gradient(135deg,#5e1421,#862233);
      display:flex; align-items:center; justify-content:center;
    }
    .a-brand-mark svg { width:15px; height:15px; color:#fff; }
    .a-brand-name { font-weight:700; font-size:.95rem; color:#fff; letter-spacing:-.01em; }
    .a-brand-chip {
      font-family:'DM Mono',monospace; font-size:.62rem; padding:.18rem .6rem;
      border-radius:99px; background:rgba(134,34,51,.22);
      border:1px solid rgba(179,75,93,.35); color:#ffd1da; letter-spacing:.07em;
    }
    .a-top-right { display:flex; align-items:center; gap:.75rem; }
    .a-user-badge { display:flex; align-items:center; gap:.5rem; font-size:.8rem; color:rgba(255,255,255,.5); }
    .a-user-avatar {
      width:28px; height:28px; border-radius:8px;
      background:rgba(134,34,51,.24); border:1px solid rgba(179,75,93,.3);
      display:flex; align-items:center; justify-content:center;
      font-size:.65rem; font-weight:700; color:#a78bfa;
    }
    .a-logout-btn {
      padding:.32rem .8rem; border-radius:7px;
      border:1px solid rgba(255,255,255,.09); background:rgba(255,255,255,.04);
      color:rgba(255,255,255,.4); font-family:'DM Sans',sans-serif;
      font-size:.76rem; cursor:pointer; transition:all .15s;
    }
    .a-logout-btn:hover { background:rgba(255,255,255,.09); color:#fff; }

    /* ── Layout ── */
    .a-layout { display:flex; flex:1; }

    /* ── Sidebar ── */
    .a-side {
      width:230px; flex-shrink:0;
      border-right:1px solid rgba(255,255,255,.06);
      background:rgba(12,8,10,.72);
      padding:1.5rem 1rem;
      display:flex; flex-direction:column; gap:.2rem;
    }
    .a-side-label {
      font-size:.6rem; letter-spacing:.13em; text-transform:uppercase;
      color:rgba(255,255,255,.2); padding:0 .5rem; margin:.8rem 0 .4rem;
    }
    .a-nav-item {
      display:flex; align-items:center; gap:.6rem;
      padding:.52rem .7rem; border-radius:9px;
      cursor:pointer; font-size:.82rem; font-weight:500;
      color:rgba(255,255,255,.38); transition:all .15s;
      border:1px solid transparent;
    }
    .a-nav-item svg { width:15px; height:15px; flex-shrink:0; }
    .a-nav-item:hover { background:rgba(255,255,255,.05); color:rgba(255,255,255,.7); }
    .a-nav-item.active {
      background:rgba(134,34,51,.2);
      border-color:rgba(179,75,93,.35);
      color:#ffdbe1; font-weight:600;
    }
    .a-nav-count {
      margin-left:auto; font-family:'DM Mono',monospace; font-size:.63rem;
      background:rgba(134,34,51,.22); color:#ffc5cf;
      border-radius:5px; padding:.08rem .35rem;
    }

    /* ── Main ── */
    .a-main { flex:1; padding:2rem 2.5rem; min-width:0; animation:_fadeIn .3s ease both; }
    .a-page-head { margin-bottom:1.8rem; }
    .a-page-title { font-size:1.4rem; font-weight:700; color:#fff; letter-spacing:-.02em; }
    .a-page-sub   { font-size:.8rem; color:rgba(255,255,255,.3); margin-top:.25rem; }

    /* ── Stat cards ── */
    .a-stat-row { display:grid; grid-template-columns:repeat(4,1fr); gap:.9rem; margin-bottom:1.8rem; }
    .a-stat-card {
      background:linear-gradient(135deg, rgba(255,255,255,.09), rgba(255,255,255,.02));
      border:1px solid rgba(255,255,255,.12);
      backdrop-filter:blur(14px);
      border-radius:13px; padding:1.1rem 1.3rem;
      animation:_fadeUp .5s ease both;
    }
    .a-stat-label { font-size:.67rem; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.28); margin-bottom:.45rem; }
    .a-stat-val   { font-size:1.8rem; font-weight:700; color:#fff; line-height:1; }
    .a-stat-hint  { font-size:.7rem; color:rgba(255,255,255,.22); margin-top:.35rem; }

    /* ── Panel ── */
    .a-panel {
      background:linear-gradient(140deg, rgba(255,255,255,.08), rgba(255,255,255,.015));
      border:1px solid rgba(255,255,255,.1);
      backdrop-filter:blur(16px);
      border-radius:15px; overflow:hidden;
      margin-bottom:1.3rem;
    }
    .a-panel-head {
      display:flex; align-items:center; justify-content:space-between;
      padding:1rem 1.5rem; border-bottom:1px solid rgba(255,255,255,.06);
    }
    .a-panel-title { font-size:.88rem; font-weight:600; color:#fff; }
    .a-panel-action {
      padding:.35rem .85rem; border-radius:8px;
      border:1px solid rgba(179,75,93,.4); background:rgba(134,34,51,.18);
      color:#ffdbe1; font-family:'DM Sans',sans-serif; font-size:.77rem; font-weight:600;
      cursor:pointer; transition:all .15s;
    }
    .a-panel-action:hover { background:rgba(134,34,51,.32); border-color:rgba(200,90,110,.62); }

    /* search */
    .a-search {
      display:flex; align-items:center; gap:.45rem;
      background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
      backdrop-filter:blur(10px);
      border-radius:8px; padding:.38rem .75rem;
    }
    .a-search svg { width:13px; height:13px; color:rgba(255,255,255,.25); flex-shrink:0; }
    .a-search input {
      background:none; border:none; outline:none;
      color:#fff; font-family:'DM Sans',sans-serif; font-size:.8rem; width:170px;
    }
    .a-search input::placeholder { color:rgba(255,255,255,.22); }
    .a-menu-btn {
      display:none;
      width:34px; height:34px;
      border-radius:8px; border:1px solid rgba(179,75,93,.35);
      background:rgba(134,34,51,.2); color:#ffdbe1;
      cursor:pointer; align-items:center; justify-content:center;
    }
    .a-menu-btn svg { width:16px; height:16px; }

    /* table */
    .a-table { width:100%; border-collapse:collapse; }
    .a-table th {
      font-size:.65rem; letter-spacing:.09em; text-transform:uppercase;
      color:rgba(255,255,255,.22); font-weight:600; font-family:'DM Mono',monospace;
      padding:.7rem 1.4rem; text-align:left;
      border-bottom:1px solid rgba(255,255,255,.06);
    }
    .a-table td {
      padding:.8rem 1.4rem; font-size:.81rem; color:rgba(255,255,255,.62);
      border-bottom:1px solid rgba(255,255,255,.04);
    }
    .a-table tr:last-child td { border-bottom:none; }
    .a-table tr:hover td { background:rgba(255,255,255,.02); }

    .a-cell-user { display:flex; align-items:center; gap:.7rem; }
    .a-avatar {
      width:31px; height:31px; border-radius:9px;
      display:flex; align-items:center; justify-content:center;
      font-size:.72rem; font-weight:700; flex-shrink:0;
    }
    .av-teacher { background:rgba(124,58,237,.18); color:#a78bfa; }
    .av-student { background:rgba(16,185,129,.13); color:#34d399; }
    .av-admin   { background:rgba(251,191,36,.12); color:#fbbf24; }
    .a-user-name  { font-weight:600; color:#fff; font-size:.82rem; }
    .a-user-email { font-size:.7rem; color:rgba(255,255,255,.28); font-family:'DM Mono',monospace; }

    .role-pill {
      display:inline-flex; align-items:center;
      padding:.16rem .55rem; border-radius:5px;
      font-size:.67rem; font-weight:600; letter-spacing:.03em;
    }
    .rp-teacher { background:rgba(124,58,237,.14); color:#a78bfa; }
    .rp-student { background:rgba(16,185,129,.11); color:#34d399; }
    .rp-admin   { background:rgba(251,191,36,.11); color:#fbbf24; }

    .status-dot {
      display:inline-flex; align-items:center; gap:.35rem;
      font-size:.73rem; font-weight:600;
    }
    .status-dot::before {
      content:''; width:6px; height:6px; border-radius:50%;
      animation:_dot 2s infinite;
    }
    .status-dot.active::before  { background:#10b981; }
    .status-dot.inactive::before{ background:#6b7280; animation:none; }
    .status-dot.active   { color:#34d399; }
    .status-dot.inactive { color:rgba(255,255,255,.3); }

    /* action buttons */
    .btn-sm {
      padding:.27rem .65rem; border-radius:6px;
      font-family:'DM Sans',sans-serif; font-size:.72rem; font-weight:600;
      cursor:pointer; transition:all .13s; border:1px solid transparent;
      white-space:nowrap;
    }
    .btn-assign  { background:rgba(134,34,51,.16); border-color:rgba(179,75,93,.35); color:#ffdbe1; }
    .btn-assign:hover  { background:rgba(134,34,51,.3); }
    .btn-deact   { background:rgba(245,158,11,.09); border-color:rgba(245,158,11,.25); color:#fbbf24; }
    .btn-deact:hover   { background:rgba(245,158,11,.18); }
    .btn-act     { background:rgba(16,185,129,.09); border-color:rgba(16,185,129,.25); color:#34d399; }
    .btn-act:hover     { background:rgba(16,185,129,.18); }
    .btn-del     { background:rgba(239,68,68,.08); border-color:rgba(239,68,68,.22); color:#f87171; }
    .btn-del:hover     { background:rgba(239,68,68,.18); }
    .btn-cert    { background:rgba(251,191,36,.1); border-color:rgba(251,191,36,.25); color:#fbbf24; }
    .btn-cert:hover    { background:rgba(251,191,36,.2); }

    .a-btn-row { display:flex; gap:.4rem; flex-wrap:wrap; }

    .a-empty { padding:2.5rem 1.5rem; text-align:center; color:rgba(255,255,255,.18); font-size:.82rem; }

    /* skeleton */
    .skel { height:13px; border-radius:4px; background:linear-gradient(90deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 100%); background-size:600px 100%; animation:_shimmer 1.4s infinite; }

    /* spinner */
    .spinner { display:inline-block; width:13px; height:13px; border:2px solid rgba(255,255,255,.18); border-top-color:#fff; border-radius:50%; animation:_spin .65s linear infinite; }

    /* ── Modal ── */
    .a-overlay {
      position:fixed; inset:0; z-index:60;
      background:rgba(0,0,0,.7); backdrop-filter:blur(8px);
      display:flex; align-items:center; justify-content:center; padding:1.5rem;
      animation:_fadeIn .2s ease both;
    }
    .a-modal {
      background:#0e1118; border:1px solid rgba(255,255,255,.1);
      border-radius:20px; padding:2rem 2.2rem;
      width:100%; max-width:460px;
      animation:_modalIn .28s cubic-bezier(.34,1.56,.64,1) both;
      box-shadow:0 40px 80px rgba(0,0,0,.65);
    }
    .a-modal-icon {
      width:48px; height:48px; border-radius:13px;
      display:flex; align-items:center; justify-content:center;
      margin-bottom:1.2rem;
    }
    .a-modal-icon svg { width:22px; height:22px; }
    .a-modal-title { font-size:1.1rem; font-weight:700; color:#fff; margin-bottom:.35rem; }
    .a-modal-sub   { font-size:.81rem; color:rgba(255,255,255,.38); line-height:1.65; margin-bottom:1.4rem; }
    .a-modal-sub strong { color:rgba(255,255,255,.7); }

    .a-field { margin-bottom:1rem; }
    .a-field label { display:block; font-size:.68rem; letter-spacing:.09em; text-transform:uppercase; color:rgba(165,180,252,.5); margin-bottom:.42rem; font-weight:600; }
    .a-field input, .a-field select {
      width:100%; padding:.65rem .9rem;
      background:rgba(255,255,255,.055); border:1px solid rgba(255,255,255,.1);
      border-radius:9px; color:#fff;
      font-family:'DM Sans',sans-serif; font-size:.86rem;
      outline:none; transition:border-color .2s;
      appearance:none;
    }
    .a-field input::placeholder { color:rgba(255,255,255,.2); }
    .a-field input:focus, .a-field select:focus { border-color:rgba(124,58,237,.5); }
    .a-field select option { background:#0e1118; }
    .a-help-text { margin-top:.45rem; font-size:.72rem; color:rgba(255,255,255,.42); line-height:1.45; }
    .a-chart-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; margin-bottom:1.2rem; }
    .a-chart-card { padding:1rem 1.2rem 1.2rem; }
    .a-chart-title { color:#fff; font-weight:600; font-size:.85rem; margin-bottom:.2rem; }
    .a-chart-sub { color:rgba(255,255,255,.35); font-size:.72rem; margin-bottom:.7rem; }
    .a-spark-metric { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:.6rem; }
    .a-date-row { display:grid; grid-template-columns:repeat(5,1fr); gap:.4rem; margin-top:.45rem; }
    .a-date-chip { text-align:center; font-size:.66rem; color:rgba(255,255,255,.35); }

    .a-modal-btns { display:flex; gap:.7rem; margin-top:1.4rem; }
    .a-btn-cancel {
      flex:1; padding:.68rem; border-radius:9px;
      border:1px solid rgba(255,255,255,.09); background:rgba(255,255,255,.04);
      color:rgba(255,255,255,.4); font-family:'DM Sans',sans-serif;
      font-size:.84rem; font-weight:600; cursor:pointer; transition:all .15s;
    }
    .a-btn-cancel:hover { background:rgba(255,255,255,.09); color:#fff; }
    .a-btn-primary {
      flex:2; padding:.68rem; border-radius:9px; border:none;
      background:linear-gradient(135deg,#5e1421,#8d2838);
      color:#fff; font-family:'DM Sans',sans-serif;
      font-size:.88rem; font-weight:700;
      cursor:pointer; transition:opacity .15s;
      box-shadow:0 4px 16px rgba(134,34,51,.45);
    }
    .a-btn-primary:hover { opacity:.88; }
    .a-btn-primary:disabled { opacity:.4; cursor:not-allowed; }
    .a-btn-danger {
      flex:2; padding:.68rem; border-radius:9px; border:none;
      background:linear-gradient(135deg,#dc2626,#b91c1c);
      color:#fff; font-family:'DM Sans',sans-serif;
      font-size:.88rem; font-weight:700;
      cursor:pointer; transition:opacity .15s;
    }
    .a-btn-danger:hover { opacity:.88; }

    /* ── Toast ── */
    .a-toast {
      position:fixed; bottom:2rem; right:2rem; z-index:90;
      display:flex; align-items:center; gap:.7rem;
      padding:.8rem 1.15rem; border-radius:11px;
      background:#0e1118; border:1px solid rgba(255,255,255,.1);
      box-shadow:0 20px 40px rgba(0,0,0,.5);
      font-size:.83rem; font-weight:600; max-width:340px;
      animation:_toast 3.5s ease forwards;
    }
    .a-toast.ok  { border-color:rgba(16,185,129,.35); color:#34d399; }
    .a-toast.err { border-color:rgba(239,68,68,.35);  color:#f87171; }
    .a-toast svg { width:17px; height:17px; flex-shrink:0; }

    /* ── Leaderboard tab ── */
    .a-lb-row { display:flex; align-items:center; gap:.85rem; padding:.78rem 1.4rem; border-bottom:1px solid rgba(255,255,255,.04); transition:background .12s; }
    .a-lb-row:last-child { border-bottom:none; }
    .a-lb-row:hover { background:rgba(255,255,255,.025); }
    .a-lb-rank { width:32px; text-align:center; font-family:'DM Mono',monospace; font-size:.8rem; font-weight:700; color:rgba(255,255,255,.22); flex-shrink:0; }
    .a-lb-rank.g1 { color:#fbbf24; }
    .a-lb-rank.g2 { color:#9ca3af; }
    .a-lb-rank.g3 { color:#b45309; }
    .a-lb-avatar { width:33px; height:33px; border-radius:9px; background:rgba(16,185,129,.14); display:flex; align-items:center; justify-content:center; font-size:.72rem; font-weight:700; color:#34d399; flex-shrink:0; }
    .a-lb-info { flex:1; min-width:0; }
    .a-lb-name { font-size:.83rem; font-weight:600; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .a-lb-meta { font-size:.7rem; color:rgba(255,255,255,.28); margin-top:.1rem; }
    .a-lb-pts  { font-family:'DM Mono',monospace; font-size:.82rem; font-weight:700; color:#fff; flex-shrink:0; }
    .a-lb-tier { font-size:.67rem; color:rgba(255,255,255,.25); flex-shrink:0; }

    .a-lb-tabs { display:flex; gap:.4rem; }
    .a-lb-tab {
      padding:.28rem .7rem; border-radius:7px; cursor:pointer;
      font-size:.72rem; font-weight:600;
      border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.04);
      color:rgba(255,255,255,.3); transition:all .15s; font-family:'DM Sans',sans-serif;
    }
    .a-lb-tab.on { background:rgba(251,191,36,.14); border-color:rgba(251,191,36,.3); color:#fbbf24; }

    /* ── Certificate modal ── */
    .cert-overlay {
      position:fixed; inset:0; z-index:80;
      background:rgba(0,0,0,.8); backdrop-filter:blur(12px);
      display:flex; align-items:center; justify-content:center;
      padding:1.5rem; animation:_fadeIn .2s ease both;
    }
    .cert-box {
      background:#fff; border-radius:4px;
      width:100%; max-width:680px;
      animation:_modalIn .3s ease both;
      box-shadow:0 40px 80px rgba(0,0,0,.7);
    }
    .cert-actions {
      display:flex; justify-content:flex-end; align-items:center; gap:.75rem;
      padding:.85rem 1.2rem;
      background:#0e1118;
      border-radius:0 0 4px 4px;
    }
    .cert-close-btn {
      padding:.4rem .9rem; border-radius:8px;
      border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.06);
      color:rgba(255,255,255,.5); font-family:'DM Sans',sans-serif;
      font-size:.8rem; cursor:pointer; transition:all .15s;
    }
    .cert-close-btn:hover { background:rgba(255,255,255,.12); color:#fff; }
    .cert-print-btn {
      padding:.4rem 1.2rem; border-radius:8px; border:none;
      background:#4338ca; color:#fff;
      font-family:'DM Sans',sans-serif; font-size:.8rem; font-weight:700;
      cursor:pointer; transition:opacity .15s;
    }
    .cert-print-btn:hover { opacity:.88; }

    .a-side-backdrop {
      position:fixed; inset:58px 0 0 0;
      background:rgba(0,0,0,.55);
      z-index:69;
    }
    @media(max-width:1024px){
      .a-stat-row { grid-template-columns:repeat(2,1fr); }
      .a-main { padding:1.5rem 1.2rem; }
      .a-table { min-width:760px; }
      .a-panel { overflow-x:auto; }
    }
    @media(max-width:768px){
      .a-top { padding:0 .9rem; }
      .a-menu-btn { display:inline-flex; }
      .a-user-badge { font-size:.74rem; }
      .a-stat-row { grid-template-columns:1fr; }
      .a-side {
        position:fixed;
        top:58px; left:0; bottom:0;
        width:260px;
        transform:translateX(-110%);
        transition:transform .22s ease;
        z-index:70;
      }
      .a-side.open { transform:translateX(0); }
      .a-main { padding:1.2rem .9rem; }
      .a-chart-grid { grid-template-columns:1fr; }
    }
  `}</style>
);

/* ── Certificate Component (rendered into #cert-print-root for printing) ── */
const Certificate = ({ student, rank, onClose }) => {
  const handlePrint = () => {
    const certRoot = document.getElementById("cert-print-root");
    certRoot.innerHTML = document.getElementById("cert-content").innerHTML;
    certRoot.style.display = "block";
    window.print();
    setTimeout(() => {
      certRoot.style.display = "none";
      certRoot.innerHTML = "";
    }, 500);
  };

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const tierColors = { Master: "#b45309", Advanced: "#1d4ed8", Intermediate: "#065f46", Beginner: "#374151" };
  const tc = tierColors[student.tier] || "#374151";

  return (
    <div className="cert-overlay" onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        <div className="cert-box">
          <div id="cert-content">
            <div style={{
              padding: "48px 56px",
              background: "#fff",
              fontFamily: "'Georgia', serif",
              position: "relative",
              border: "24px solid #f9f3e8",
              outline: "3px solid #c9a227",
              outlineOffset: "-30px",
            }}>
              {/* Corner ornaments */}
              {["top:0;left:0", "top:0;right:0;transform:scaleX(-1)", "bottom:0;left:0;transform:scaleY(-1)", "bottom:0;right:0;transform:scale(-1)"].map((s, i) => (
                <div key={i} style={{ position: "absolute", ...Object.fromEntries(s.split(";").map(p => p.split(":"))) }}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M2 2 L18 2 L18 6 L6 6 L6 18 L2 18 Z" fill="#c9a227" opacity=".7"/>
                  </svg>
                </div>
              ))}

              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 8 }}>
                  School Quiz System
                </div>
                <h1 style={{ fontFamily: "'Georgia', serif", fontSize: 32, fontWeight: 400, color: "#1a0a0a", letterSpacing: "-0.02em", marginBottom: 4 }}>
                  Certificate of Achievement
                </h1>
                <div style={{ width: 80, height: 2, background: "linear-gradient(90deg,transparent,#c9a227,transparent)", margin: "12px auto" }} />
                <p style={{ fontSize: 13, color: "#6b7280", fontStyle: "italic" }}>This certifies that</p>
              </div>

              {/* Student name */}
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <div style={{ fontFamily: "'Georgia', serif", fontSize: 36, color: "#1a0a0a", letterSpacing: "-0.02em", borderBottom: "2px solid #c9a227", display: "inline-block", paddingBottom: 6 }}>
                  {student.full_name}
                </div>
              </div>

              {/* Body text */}
              <div style={{ textAlign: "center", fontSize: 14, color: "#374151", lineHeight: 1.8, margin: "20px 0" }}>
                <p>has demonstrated outstanding academic performance and has been ranked</p>
                <div style={{ margin: "12px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <span style={{ fontSize: 48, fontWeight: 700, color: "#c9a227", fontFamily: "serif" }}>
                    #{rank}
                  </span>
                  <span style={{ fontSize: 14, color: "#6b7280" }}>in the<br/>class leaderboard</span>
                </div>
                {student.section && (
                  <p>Section: <strong style={{ color: "#1a0a0a" }}>{student.section}</strong>
                    {student.course ? ` · ${student.course}` : ""}</p>
                )}
              </div>

              {/* Stats */}
              <div style={{ display: "flex", justifyContent: "center", gap: 32, margin: "20px 0 28px", padding: "16px 24px", background: "#f9f3e8", borderRadius: 8 }}>
                {[
                  { label: "Total Points", value: (student.points || 0).toLocaleString() },
                  { label: "Achievement Tier", value: student.tier || "Beginner" },
                  { label: "Study Streak", value: `${student.streak || 0} days` },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: tc }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 24 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 120, borderTop: "1px solid #9ca3af", paddingTop: 6, fontSize: 11, color: "#9ca3af" }}>Class Teacher</div>
                </div>
                <div style={{ textAlign: "center", fontSize: 11, color: "#9ca3af" }}>
                  <div style={{ fontWeight: 600, color: "#374151", marginBottom: 2 }}>{today}</div>
                  Date Issued
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 120, borderTop: "1px solid #9ca3af", paddingTop: 6, fontSize: 11, color: "#9ca3af" }}>Administrator</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="cert-actions">
          <button className="cert-close-btn" onClick={onClose}>Close</button>
          <button className="cert-print-btn" onClick={handlePrint}>🖨 Print Certificate</button>
        </div>
      </div>
    </div>
  );
};

/* ── Icons ── */
const I = {
  Menu:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>,
  Shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l7 3v5c0 5.25-2.625 8.75-7 10C7.625 18.75 5 15.25 5 10V5l7-3z"/></svg>,
  Users:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Teacher:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v10H4z"/><path d="M2 20l10-6 10 6"/></svg>,
  Link:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Trophy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>,
  Search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Plus:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Check:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>,
  X:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Trash:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
};

const initials = (n = "") => n.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
const medal = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
const rankCls = (i) => i === 0 ? "g1" : i === 1 ? "g2" : i === 2 ? "g3" : "";
const SUBJECT_OPTIONS = [
  { value: "SE2", label: "SE2 - Software Engineering 2" },
  { value: "MATHELEC", label: "MATHELEC - Mathematics for Electronics" },
  { value: "PL321", label: "PL321 - Programming Languages 3-2-1" },
  { value: "ELEC322", label: "ELEC322 - Electronics 3-2-2" },
  { value: "THS411", label: "THS411 - Technopreneurship and Society 4-1-1" },
];
const subjectLabelByCode = SUBJECT_OPTIONS.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

/* ── Main Component ── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const [tab, setTab] = useState(() => localStorage.getItem("admin_tab") || "overview");
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [certRequests, setCertRequests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lbLoading, setLbLoading] = useState(false);
  const [lbFilter, setLbFilter] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  // Modals
  const [assignModal, setAssignModal] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [createTeacherModal, setCreateTeacherModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ fullName: "", email: "", subject: "SE2", customSubject: "" });
  const [creating, setCreating] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [certModal, setCertModal] = useState(null); // { student, rank }

  useEffect(() => {
    if (!user || user.role !== "admin") navigate("/");
  }, [user, navigate]);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3600);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, t, a] = await Promise.all([
        apiFetch("/api/admin/students"),
        apiFetch("/api/admin/teachers"),
        apiFetch("/api/admin/assignments"),
      ]);
      const certData = await apiFetch("/api/admin/certificate-requests").catch(() => []);
      setStudents(s);
      setTeachers(t);
      setAssignments(a);
      setCertRequests(certData || []);
    } catch (e) {
      showToast(e.message, "err");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    setLbLoading(true);
    try {
      const data = await apiFetch("/api/admin/leaderboard");
      setLeaderboard(data);
    } catch (e) {
      showToast(e.message, "err");
    } finally {
      setLbLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (tab === "leaderboard") loadLeaderboard(); }, [tab, loadLeaderboard]);
  useEffect(() => { localStorage.setItem("admin_tab", tab); }, [tab]);

  const assignMap = {};
  assignments.forEach((a) => {
    if (!a.student?.id || !a.teacher) return;
    if (!assignMap[a.student.id]) assignMap[a.student.id] = [];
    assignMap[a.student.id].push(a.teacher);
  });
  const assignedCount = Object.keys(assignMap).length;

  /* ── Assign teacher ── */
  const openAssign = (student) => {
    setSelectedTeacher("");
    setAssignModal({ student });
  };
  const confirmAssign = async () => {
    if (!selectedTeacher) return;
    setConfirming(true);
    try {
      const r = await apiFetch("/api/admin/assign", { method: "POST", body: JSON.stringify({ teacherId: selectedTeacher, studentId: assignModal.student.id }) });
      showToast(r.message);
      setAssignModal(null);
      loadData();
    } catch (e) { showToast(e.message, "err"); }
    finally { setConfirming(false); }
  };

  /* ── Remove assignment ── */
  const removeAssignment = async (studentId, teacherId = null) => {
    try {
      const url = teacherId ? `/api/admin/assign/${studentId}?teacherId=${teacherId}` : `/api/admin/assign/${studentId}`;
      await apiFetch(url, { method: "DELETE" });
      showToast(teacherId ? "Teacher assignment removed" : "All teacher assignments removed");
      loadData();
    } catch (e) { showToast(e.message, "err"); }
  };

  const updateCertStatus = async (requestId, status) => {
    try {
      const r = await apiFetch(`/api/admin/certificate-requests/${requestId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      showToast(r.message || "Certificate request updated");
      loadData();
    } catch (e) {
      showToast(e.message, "err");
    }
  };

  /* ── Create teacher ── */
  const handleCreateTeacher = async (e) => {
  e.preventDefault();
  setCreating(true);
  try {
    const finalSubject = newTeacher.subject === "__custom__" ? newTeacher.customSubject.trim() : newTeacher.subject;
    if (!finalSubject) throw new Error("Please provide a subject");
    const r = await apiFetch("/api/admin/teachers/create", {
      method: "POST",
      body: JSON.stringify({
        fullName: newTeacher.fullName,
        email: newTeacher.email,
        subject: finalSubject,
      }),
    });
    // Show different message if email failed
    showToast(r.message, "ok");
    // If email failed, show the temp password so admin can share manually
    if (!r.emailSent && r.tempPassword) {
      setTimeout(() => showToast(`Temp password: ${r.tempPassword}`, "ok"), 3700);
    }
    setCreateTeacherModal(false);
    setNewTeacher({ fullName: "", email: "", subject: "SE2", customSubject: "" });
    loadData();
  } catch (e) { showToast(e.message, "err"); }
  finally { setCreating(false); }
};

  /* ── Toggle status ── */
  const toggleStatus = async (userId, currentStatus, name) => {
    const newStatus = !currentStatus;
    try {
      const r = await apiFetch(`/api/admin/users/${userId}/status`, { method: "PATCH", body: JSON.stringify({ status: newStatus }) });
      showToast(r.message);
      loadData();
    } catch (e) { showToast(e.message, "err"); }
  };

  /* ── Delete user ── */
  const confirmDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      const r = await apiFetch(`/api/admin/users/${deleteModal.id}`, { method: "DELETE" });
      showToast(r.message);
      setDeleteModal(null);
      loadData();
    } catch (e) { showToast(e.message, "err"); }
    finally { setDeleting(false); }
  };

  /* ── Leaderboard filter ── */
  const filteredLb = lbFilter === "all"
    ? leaderboard
    : leaderboard.filter(u => u.section === lbFilter);
  const sections = [...new Set(leaderboard.map(u => u.section).filter(Boolean))];

  /* ── Search filter ── */
  const filterBySearch = (arr) => arr.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Overview counts ── */
  const activeStudents = students.filter(s => s.status).length;
  const activeTeachers = teachers.filter(t => t.status).length;
  const studentsWithAccounts = activeStudents;
  const lowImprovementCount = students.filter(s => (s.points ?? 0) < 80 && (s.streak ?? 0) < 2).length;
  const increasingCount = students.filter(s => (s.points ?? 0) >= 80 || (s.streak ?? 0) >= 2).length;
  const highImprovementCount = students.filter(s => (s.points ?? 0) >= 180 || (s.streak ?? 0) >= 4).length;
  const improvementBandData = [
    { label: "Low", value: lowImprovementCount },
    { label: "Increasing", value: Math.max(increasingCount - highImprovementCount, 0) },
    { label: "High", value: highImprovementCount },
  ];
  const accountSparkline = [
    Math.max(Math.round(studentsWithAccounts * 0.58), 0),
    Math.max(Math.round(studentsWithAccounts * 0.68), 0),
    Math.max(Math.round(studentsWithAccounts * 0.77), 0),
    Math.max(Math.round(studentsWithAccounts * 0.85), 0),
    studentsWithAccounts,
  ];
  const accountDates = Array.from({ length: 5 }, (_, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - (4 - idx));
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });
  const sectionImprovementMap = students.reduce((acc, student) => {
    const key = student.section || "Unspecified";
    if (!acc[key]) acc[key] = { increasing: 0, low: 0 };
    if ((student.points ?? 0) >= 80 || (student.streak ?? 0) >= 2) acc[key].increasing += 1;
    else acc[key].low += 1;
    return acc;
  }, {});
  const lbMomentumLine = [
    Math.max(Math.round(leaderboard.length * 0.3), 1),
    Math.max(Math.round(leaderboard.length * 0.42), 1),
    Math.max(Math.round(leaderboard.length * 0.54), 1),
    Math.max(Math.round(leaderboard.length * 0.67), 1),
    leaderboard.filter(s => (s.points ?? 0) >= 80 || (s.streak ?? 0) >= 2).length,
  ];
  const sectionLabels = Object.keys(sectionImprovementMap);
  const stackedIncreasing = sectionLabels.map(label => sectionImprovementMap[label].increasing);
  const stackedLow = sectionLabels.map(label => sectionImprovementMap[label].low);
  const teacherLoadBuckets = students.reduce((acc, student) => {
    const count = (assignMap[student.id] || []).length;
    if (count === 0) acc.none += 1;
    else if (count === 1) acc.one += 1;
    else acc.multi += 1;
    return acc;
  }, { none: 0, one: 0, multi: 0 });

  /* ── Render skeleton rows ── */
  const SkeletonRows = ({ cols = 4, rows = 3 }) => (
    <>{Array.from({ length: rows }).map((_, i) => (
      <tr key={i}><td colSpan={cols} style={{ padding: ".85rem 1.4rem" }}>
        <div className="skel" style={{ width: `${50 + Math.random() * 40}%` }} />
      </td></tr>
    ))}</>
  );

  return (
    <>
      <PrintStyles />
      <Styles />
      <div id="cert-print-root" />

      {/* Toast */}
      {toast && (
        <div className={`a-toast ${toast.type}`}>
          {toast.type === "ok" ? I.Check : I.X}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Assign Modal ── */}
      {assignModal && (
        <div className="a-overlay" onClick={() => setAssignModal(null)}>
          <div className="a-modal" onClick={e => e.stopPropagation()}>
            <div className="a-modal-icon" style={{ background: "rgba(124,58,237,.18)", border: "1px solid rgba(124,58,237,.3)" }}>
              <svg style={{ color: "#a78bfa" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </div>
            <h2 className="a-modal-title">Assign Teacher</h2>
            <p className="a-modal-sub">
              Add a teacher under <strong>{assignModal.student.full_name}</strong>.
              {(assignMap[assignModal.student.id] || []).length > 0 && (
                <> Current teachers: <strong>{assignMap[assignModal.student.id].map(t => t.full_name).join(", ")}</strong>.</>
              )}
            </p>
            <div className="a-field">
              <label>Select Teacher</label>
              <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)}>
                <option value="">— Choose —</option>
                {teachers.filter(t => t.status).map(t => (
                  <option key={t.id} value={t.id}>{t.full_name} · {t.email}</option>
                ))}
              </select>
            </div>
            <div className="a-modal-btns">
              <button className="a-btn-cancel" onClick={() => setAssignModal(null)}>Cancel</button>
              <button className="a-btn-primary" onClick={confirmAssign} disabled={!selectedTeacher || confirming}>
                {confirming ? <span className="spinner" /> : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Teacher Modal ── */}
      {createTeacherModal && (
  <div className="a-overlay" onClick={() => setCreateTeacherModal(false)}>
    <div className="a-modal" onClick={e => e.stopPropagation()}>
      <div className="a-modal-icon" style={{ background: "rgba(16,185,129,.14)", border: "1px solid rgba(16,185,129,.3)" }}>
        <svg style={{ color: "#34d399" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
          <path d="M4 4h16v10H4z"/><path d="M2 20l10-6 10 6"/>
        </svg>
      </div>
      <h2 className="a-modal-title">Create Teacher Account</h2>
      <p className="a-modal-sub">
        A temporary password will be <strong>auto-generated</strong> and sent directly
        to the teacher's email. They can change it after logging in.
      </p>
      <form onSubmit={handleCreateTeacher}>
        <div className="a-field">
          <label>Full Name</label>
          <input type="text" placeholder="e.g., Maria Santos" required
            value={newTeacher.fullName}
            onChange={e => setNewTeacher(p => ({ ...p, fullName: e.target.value }))} />
        </div>
        <div className="a-field">
          <label>Email Address</label>
          <input type="email" placeholder="teacher@school.edu" required
            value={newTeacher.email}
            onChange={e => setNewTeacher(p => ({ ...p, email: e.target.value }))} />
        </div>
        <div className="a-field">
          <label>Subject</label>
          <select
            value={newTeacher.subject}
            onChange={e => setNewTeacher(p => ({ ...p, subject: e.target.value }))}
            required
          >
            {SUBJECT_OPTIONS.map(subject => (
              <option key={subject.value} value={subject.value}>{subject.label}</option>
            ))}
            <option value="__custom__">Other (custom subject)</option>
          </select>
          {newTeacher.subject === "__custom__" && (
            <input
              type="text"
              placeholder="Enter custom subject"
              required
              style={{ marginTop: ".55rem" }}
              value={newTeacher.customSubject}
              onChange={e => setNewTeacher(p => ({ ...p, customSubject: e.target.value }))}
            />
          )}
          <p className="a-help-text">
            Subject is saved to Supabase exactly as selected or typed.
          </p>
        </div>
        {/* Info note */}
        <div style={{
          display:"flex", alignItems:"flex-start", gap:".6rem",
          padding:".75rem .9rem", borderRadius:9,
          background:"rgba(16,185,129,.07)", border:"1px solid rgba(16,185,129,.18)",
          marginBottom:"1rem",
        }}>
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="#34d399" strokeWidth="1.8" style={{flexShrink:0,marginTop:1}}>
            <circle cx="10" cy="10" r="8"/><line x1="10" y1="6" x2="10" y2="10"/>
            <circle cx="10" cy="13.5" r=".5" fill="#34d399"/>
          </svg>
          <p style={{margin:0,fontSize:".76rem",color:"rgba(52,211,153,.8)",lineHeight:1.55}}>
            A secure temporary password will be generated and emailed to the teacher automatically.
            They must change it on first login.
          </p>
        </div>
        <div className="a-modal-btns">
          <button type="button" className="a-btn-cancel"
            onClick={() => setCreateTeacherModal(false)}>Cancel</button>
          <button type="submit" className="a-btn-primary" disabled={creating}>
            {creating ? <span className="spinner" /> : "✦ Create & Send Credentials"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* ── Delete Confirm Modal ── */}
      {deleteModal && (
        <div className="a-overlay" onClick={() => setDeleteModal(null)}>
          <div className="a-modal" onClick={e => e.stopPropagation()}>
            <div className="a-modal-icon" style={{ background: "rgba(239,68,68,.14)", border: "1px solid rgba(239,68,68,.3)" }}>
              {I.Trash}
            </div>
            <h2 className="a-modal-title">Delete Account</h2>
            <p className="a-modal-sub">
              Are you sure you want to permanently delete <strong>{deleteModal.full_name}</strong>?
              This will remove all their data including quiz results, badges, and assignments. <strong>This cannot be undone.</strong>
            </p>
            <div className="a-modal-btns">
              <button className="a-btn-cancel" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="a-btn-danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? <span className="spinner" /> : "Yes, Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Certificate Modal ── */}
      {certModal && (
        <Certificate
          student={certModal.student}
          rank={certModal.rank}
          onClose={() => setCertModal(null)}
        />
      )}

      <div className="a-root">
        {/* Topbar */}
        <header className="a-top">
          <div className="a-brand">
            <div className="a-brand-mark">{I.Shield}</div>
            <span className="a-brand-name">Admin Console</span>
            <span className="a-brand-chip">ADMIN</span>
          </div>
          <div className="a-top-right">
            <button
              className="a-menu-btn"
              onClick={() => setMobileMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {I.Menu}
            </button>
            <div className="a-user-badge">
              <div className="a-user-avatar">{initials(user?.full_name || "A")}</div>
              <span>{user?.full_name || "Admin"}</span>
            </div>
            <button className="a-logout-btn" onClick={() => { logout(); navigate("/"); }}>Sign out</button>
          </div>
        </header>

        <div className="a-layout">
          {mobileMenuOpen && <div className="a-side-backdrop" onClick={() => setMobileMenuOpen(false)} />}
          {/* Sidebar */}
          <nav className={`a-side ${mobileMenuOpen ? "open" : ""}`}>
            <p className="a-side-label" style={{ marginTop: 0 }}>Menu</p>
            {[
              { key: "overview",     icon: I.Shield,  label: "Overview" },
              { key: "students",     icon: I.Users,   label: "Students",    count: students.length },
              { key: "teachers",     icon: I.Teacher, label: "Teachers",    count: teachers.length },
              { key: "assignments",  icon: I.Link,    label: "Assignments", count: assignments.length },
              { key: "leaderboard",  icon: I.Trophy,  label: "Leaderboard" },
            ].map(n => (
              <div key={n.key} className={`a-nav-item ${tab === n.key ? "active" : ""}`}
                onClick={() => { setTab(n.key); setSearch(""); setMobileMenuOpen(false); }}>
                {n.icon} {n.label}
                {n.count !== undefined && <span className="a-nav-count">{n.count}</span>}
              </div>
            ))}
          </nav>

          {/* Main */}
          <main className="a-main">

            {/* ═══════════ OVERVIEW ═══════════ */}
            {tab === "overview" && (
              <>
                <div className="a-page-head">
                  <h1 className="a-page-title">Overview</h1>
                  <p className="a-page-sub">System-wide summary and quick actions</p>
                </div>

                {!loading && (
                  <div className="a-panel a-chart-card" style={{ marginBottom: "1rem" }}>
                    <div className="a-spark-metric">
                      <div>
                        <p className="a-chart-title">Student Accounts Metric</p>
                        <p className="a-chart-sub">Active student accounts across recent dates.</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{studentsWithAccounts}</div>
                        <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.35)" }}>active student accounts</div>
                      </div>
                    </div>
                    <SparkLineChart data={accountSparkline} height={90} showTooltip color="#60a5fa" />
                    <div className="a-date-row">
                      {accountDates.map((d) => <span key={d} className="a-date-chip">{d}</span>)}
                    </div>
                  </div>
                )}

                <div className="a-stat-row">
                  {[
                    { label: "Students", value: students.length, hint: `${activeStudents} active accounts` },
                    { label: "Teachers", value: teachers.length, hint: `${activeTeachers} active` },
                    { label: "Assigned", value: assignedCount, hint: `${students.length - assignedCount} unassigned` },
                    { label: "Improving", value: increasingCount, hint: `${lowImprovementCount} need attention` },
                  ].map((s, i) => (
                    <div key={i} className="a-stat-card" style={{ animationDelay: `${i * 0.07}s` }}>
                      <p className="a-stat-label">{s.label}</p>
                      <p className="a-stat-val">{loading ? "—" : s.value}</p>
                      <p className="a-stat-hint">{s.hint}</p>
                    </div>
                  ))}
                </div>

                {!loading && (
                  <div className="a-chart-grid">
                    <div className="a-panel a-chart-card">
                      <p className="a-chart-title">Simple Bar Chart - Improvement by Band</p>
                      <p className="a-chart-sub">Shows students grouped by low, increasing, and high improvement momentum.</p>
                      <BarChart
                        xAxis={[{ scaleType: "band", data: improvementBandData.map(x => x.label) }]}
                        series={[{ data: improvementBandData.map(x => x.value), color: "#7c3aed" }]}
                        height={220}
                        margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
                      />
                    </div>
                    <div className="a-panel a-chart-card">
                      <p className="a-chart-title">Straight Angle Pie Chart - Teacher Load per Student</p>
                      <p className="a-chart-sub">Shows how many teachers each student is currently under.</p>
                      <PieChart
                        series={[{
                          innerRadius: 30,
                          outerRadius: 85,
                          cornerRadius: 0,
                          startAngle: 0,
                          endAngle: 360,
                          data: [
                            { id: 0, value: teacherLoadBuckets.none, label: "No Teacher", color: "#9ca3af" },
                            { id: 1, value: teacherLoadBuckets.one, label: "1 Teacher", color: "#34d399" },
                            { id: 2, value: teacherLoadBuckets.multi, label: "2+ Teachers", color: "#fbbf24" },
                          ],
                        }]}
                        height={220}
                        margin={{ top: 0, right: 20, bottom: 0, left: 20 }}
                      />
                    </div>
                  </div>
                )}

                {/* Unassigned alert */}
                {!loading && students.length - assignedCount > 0 && (
                  <div className="a-panel" style={{ border: "1px solid rgba(245,158,11,.2)", marginBottom: "1.3rem" }}>
                    <div className="a-panel-head" style={{ background: "rgba(245,158,11,.04)" }}>
                      <span style={{ fontSize: ".84rem", fontWeight: 600, color: "#fbbf24" }}>
                        ⚠ {students.length - assignedCount} student(s) without a teacher
                      </span>
                      <button className="a-panel-action" onClick={() => setTab("students")}>Assign Now →</button>
                    </div>
                  </div>
                )}

                {/* Recent assignments */}
                <div className="a-panel">
                  <div className="a-panel-head">
                    <span className="a-panel-title">Recent Assignments</span>
                  </div>
                  <table className="a-table">
                    <thead><tr><th>Student</th><th>Teacher</th><th>Assigned</th></tr></thead>
                    <tbody>
                      {loading ? <SkeletonRows cols={3} /> : assignments.length === 0
                        ? <tr><td colSpan={3} className="a-empty">No assignments yet</td></tr>
                        : assignments.slice(0, 5).map(a => (
                          <tr key={a.id}>
                            <td><div className="a-cell-user"><div className={`a-avatar av-student`}>{initials(a.student?.full_name)}</div><div><div className="a-user-name">{a.student?.full_name}</div><div className="a-user-email">{a.student?.email}</div></div></div></td>
                            <td><div className="a-cell-user"><div className="a-avatar av-teacher">{initials(a.teacher?.full_name)}</div><span className="a-user-name">{a.teacher?.full_name}</span></div></td>
                            <td style={{ fontFamily: "'DM Mono',monospace", fontSize: ".7rem", color: "rgba(255,255,255,.28)" }}>{new Date(a.assigned_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="a-panel">
                  <div className="a-panel-head">
                    <span className="a-panel-title">Pending Certificate Requests</span>
                  </div>
                  <table className="a-table">
                    <thead><tr><th>Student</th><th>Requested By</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {loading ? <SkeletonRows cols={4} /> : certRequests.length === 0 ? (
                        <tr><td colSpan={4} className="a-empty">No certificate requests yet</td></tr>
                      ) : certRequests.map((r) => (
                        <tr key={r.id}>
                          <td>
                            <div className="a-cell-user">
                              <div className="a-avatar av-student">{initials(r.student?.full_name)}</div>
                              <div>
                                <div className="a-user-name">{r.student?.full_name}</div>
                                <div className="a-user-email">{r.student?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>{r.teacher?.full_name || "—"}</td>
                          <td style={{ textTransform: "capitalize" }}>{r.status}</td>
                          <td>
                            {r.status === "pending" ? (
                              <div className="a-btn-row">
                                <button className="btn-sm btn-act" onClick={() => updateCertStatus(r.id, "approved")}>Approve</button>
                                <button className="btn-sm btn-del" onClick={() => updateCertStatus(r.id, "rejected")}>{I.Trash}</button>
                              </div>
                            ) : (
                              <span style={{ color: "rgba(255,255,255,.35)", fontSize: ".75rem" }}>Processed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ═══════════ STUDENTS ═══════════ */}
            {tab === "students" && (
              <>
                <div className="a-page-head">
                  <h1 className="a-page-title">Students</h1>
                  <p className="a-page-sub">Manage accounts, assignments, and status</p>
                </div>
                <div className="a-panel">
                  <div className="a-panel-head">
                    <span className="a-panel-title">{filterBySearch(students).length} students</span>
                    <div className="a-search">
                      {I.Search}
                      <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                  </div>
                  <table className="a-table">
                    <thead><tr><th>Student</th><th>Course / Section</th><th>Points / Tier</th><th>Status</th><th>Teacher</th><th>Actions</th></tr></thead>
                    <tbody>
                      {loading ? <SkeletonRows cols={6} /> : filterBySearch(students).length === 0
                        ? <tr><td colSpan={6} className="a-empty">No students found</td></tr>
                        : filterBySearch(students).map(s => (
                          <tr key={s.id}>
                            <td><div className="a-cell-user"><div className="a-avatar av-student">{initials(s.full_name)}</div><div><div className="a-user-name">{s.full_name}</div><div className="a-user-email">{s.email}</div></div></div></td>
                            <td>
                              <div style={{ fontSize: ".78rem" }}>
                                {s.course && <span style={{ color: "#a5b4fc", marginRight: 4 }}>{s.course}</span>}
                                {s.section && <span style={{ color: "#34d399" }}>{s.section}</span>}
                                {!s.course && !s.section && <span style={{ color: "rgba(255,255,255,.2)" }}>—</span>}
                              </div>
                            </td>
                            <td><strong style={{ color: "#fff" }}>{s.points ?? 0}</strong> <span style={{ color: "rgba(255,255,255,.3)", fontSize: ".72rem" }}>{s.tier || "Beginner"}</span></td>
                            <td><span className={`status-dot ${s.status ? "active" : "inactive"}`}>{s.status ? "Active" : "Inactive"}</span></td>
                            <td>
                              {(assignMap[s.id] || []).length > 0 ? (
                                <span style={{ fontSize: ".78rem", color: "#ffdbe1" }}>
                                  {(assignMap[s.id] || []).length} teacher{(assignMap[s.id] || []).length > 1 ? "s" : ""}
                                </span>
                              ) : <span style={{ color: "rgba(255,255,255,.2)", fontSize: ".75rem" }}>Unassigned</span>}
                            </td>
                            <td>
                              <div className="a-btn-row">
                                <button className="btn-sm btn-assign" onClick={() => openAssign(s)}>{(assignMap[s.id] || []).length > 0 ? "Add Teacher" : "Assign"}</button>
                                {(assignMap[s.id] || []).length > 0 && <button className="btn-sm btn-del" onClick={() => removeAssignment(s.id)} title="Remove all teachers">{I.Trash}</button>}
                                <button className={`btn-sm ${s.status ? "btn-deact" : "btn-act"}`} onClick={() => toggleStatus(s.id, s.status, s.full_name)}>
                                  {s.status ? "Deactivate" : "Activate"}
                                </button>
                                <button className="btn-sm btn-del" onClick={() => setDeleteModal(s)}>{I.Trash}</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ═══════════ TEACHERS ═══════════ */}
            {tab === "teachers" && (
              <>
                <div className="a-page-head">
                  <h1 className="a-page-title">Teachers</h1>
                  <p className="a-page-sub">Create and manage teacher accounts</p>
                </div>
                <div className="a-panel">
                  <div className="a-panel-head">
                    <span className="a-panel-title">{filterBySearch(teachers).length} teachers</span>
                    <div style={{ display: "flex", gap: ".6rem", alignItems: "center" }}>
                      <div className="a-search">
                        {I.Search}
                        <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
                      </div>
                      <button className="a-panel-action" onClick={() => setCreateTeacherModal(true)}>
                        <span style={{ display: "flex", alignItems: "center", gap: ".3rem" }}>
                          {I.Plus} Create Teacher
                        </span>
                      </button>
                    </div>
                  </div>
                  <table className="a-table">
                    <thead><tr><th>Teacher</th><th>Subject</th><th>Status</th><th>Students Assigned</th><th>Actions</th></tr></thead>
                    <tbody>
                      {loading ? <SkeletonRows cols={5} /> : filterBySearch(teachers).length === 0
                        ? <tr><td colSpan={5} className="a-empty">No teachers — create one above</td></tr>
                        : filterBySearch(teachers).map(t => {
                          const count = assignments.filter(a => a.teacher?.id === t.id).length;
                          return (
                            <tr key={t.id}>
                              <td><div className="a-cell-user"><div className="a-avatar av-teacher">{initials(t.full_name)}</div><div><div className="a-user-name">{t.full_name}</div><div className="a-user-email">{t.email}</div></div></div></td>
                              <td>
                                <span style={{ color: "#a5b4fc", fontSize: ".76rem" }}>
                                  {subjectLabelByCode[t.subject] || t.subject || "—"}
                                </span>
                              </td>
                              <td><span className={`status-dot ${t.status ? "active" : "inactive"}`}>{t.status ? "Active" : "Inactive"}</span></td>
                              <td><strong style={{ color: "#a78bfa" }}>{count}</strong> <span style={{ color: "rgba(255,255,255,.3)", fontSize: ".72rem" }}>student{count !== 1 ? "s" : ""}</span></td>
                              <td>
                                <div className="a-btn-row">
                                  <button className={`btn-sm ${t.status ? "btn-deact" : "btn-act"}`} onClick={() => toggleStatus(t.id, t.status, t.full_name)}>
                                    {t.status ? "Deactivate" : "Activate"}
                                  </button>
                                  <button className="btn-sm btn-del" onClick={() => setDeleteModal(t)}>{I.Trash}</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ═══════════ ASSIGNMENTS ═══════════ */}
            {tab === "assignments" && (
              <>
                <div className="a-page-head">
                  <h1 className="a-page-title">Assignments</h1>
                  <p className="a-page-sub">All teacher–student pairings</p>
                </div>
                <div className="a-panel">
                  <div className="a-panel-head">
                    <span className="a-panel-title">{assignments.length} active</span>
                  </div>
                  <table className="a-table">
                    <thead><tr><th>Student</th><th>Teacher</th><th>Assigned On</th><th>Action</th></tr></thead>
                    <tbody>
                      {loading ? <SkeletonRows cols={4} /> : assignments.length === 0
                        ? <tr><td colSpan={4} className="a-empty">No assignments yet</td></tr>
                        : assignments.map(a => (
                          <tr key={a.id}>
                            <td><div className="a-cell-user"><div className="a-avatar av-student">{initials(a.student?.full_name)}</div><div><div className="a-user-name">{a.student?.full_name}</div><div className="a-user-email">{a.student?.email}</div></div></div></td>
                            <td><div className="a-cell-user"><div className="a-avatar av-teacher">{initials(a.teacher?.full_name)}</div><div><div className="a-user-name">{a.teacher?.full_name}</div><div className="a-user-email">{a.teacher?.email}</div></div></div></td>
                            <td style={{ fontFamily: "'DM Mono',monospace", fontSize: ".7rem", color: "rgba(255,255,255,.28)" }}>{new Date(a.assigned_at).toLocaleString()}</td>
                            <td>
                              <button
                                className="btn-sm btn-del"
                                onClick={() => removeAssignment(a.student?.id, a.teacher?.id)}
                                title="Remove this teacher from student"
                              >
                                {I.Trash}
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ═══════════ LEADERBOARD ═══════════ */}
            {tab === "leaderboard" && (
              <>
                <div className="a-page-head">
                  <h1 className="a-page-title">Student Leaderboard</h1>
                  <p className="a-page-sub">All-time rankings — click any student to generate a certificate</p>
                </div>

                {/* Stats row */}
                <div className="a-stat-row" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                  {[
                    { label: "Total Students", value: leaderboard.length },
                    { label: "Top Score",       value: leaderboard[0]?.points?.toLocaleString() || "—" },
                    { label: "Sections",        value: sections.length },
                  ].map((s, i) => (
                    <div key={i} className="a-stat-card">
                      <p className="a-stat-label">{s.label}</p>
                      <p className="a-stat-val">{lbLoading ? "—" : s.value}</p>
                    </div>
                  ))}
                </div>

                {!lbLoading && (
                  <div className="a-chart-grid">
                    <div className="a-panel a-chart-card">
                      <p className="a-chart-title">Simple Line Chart - Momentum Trend</p>
                      <p className="a-chart-sub">Improvement momentum trend based on leaderboard student performance.</p>
                      <LineChart
                        xAxis={[{ scaleType: "point", data: ["C1", "C2", "C3", "C4", "Now"] }]}
                        series={[{ data: lbMomentumLine, curve: "linear", color: "#34d399" }]}
                        height={220}
                        margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
                      />
                    </div>
                    <div className="a-panel a-chart-card">
                      <p className="a-chart-title">Stacked Area Chart - Section Improvement</p>
                      <p className="a-chart-sub">Low vs increasing improvement count per section.</p>
                      <LineChart
                        xAxis={[{ scaleType: "point", data: sectionLabels.length ? sectionLabels : ["No section"] }]}
                        series={[
                          { data: stackedIncreasing.length ? stackedIncreasing : [0], area: true, stack: "total", label: "Increasing", color: "#22c55e" },
                          { data: stackedLow.length ? stackedLow : [0], area: true, stack: "total", label: "Low", color: "#f59e0b" },
                        ]}
                        height={220}
                        margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
                      />
                    </div>
                  </div>
                )}

                <div className="a-panel">
                  <div className="a-panel-head">
                    <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                      <span className="a-panel-title">Rankings</span>
                      {/* Section filter */}
                      <div className="a-lb-tabs">
                        <button className={`a-lb-tab ${lbFilter === "all" ? "on" : ""}`} onClick={() => setLbFilter("all")}>All</button>
                        {sections.map(s => (
                          <button key={s} className={`a-lb-tab ${lbFilter === s ? "on" : ""}`} onClick={() => setLbFilter(s)}>{s}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize: ".75rem", color: "rgba(255,255,255,.3)" }}>
                      🏅 Click row to generate certificate
                    </div>
                  </div>

                  {lbLoading ? (
                    <div style={{ padding: "2rem", display: "flex", justifyContent: "center", color: "rgba(255,255,255,.3)", gap: ".6rem", alignItems: "center" }}>
                      <span className="spinner" /> Loading rankings…
                    </div>
                  ) : filteredLb.length === 0 ? (
                    <div className="a-empty">No students found</div>
                  ) : (
                    filteredLb.map((u, i) => (
                      <div key={u.id} className="a-lb-row"
                        style={{ cursor: "pointer" }}
                        onClick={() => setCertModal({ student: u, rank: i + 1 })}
                        title="Click to generate certificate">
                        <span className={`a-lb-rank ${rankCls(i)}`}>{medal(i)}</span>
                        <div className="a-lb-avatar">{initials(u.full_name)}</div>
                        <div className="a-lb-info">
                          <div className="a-lb-name">{u.full_name || "—"}</div>
                          <div className="a-lb-meta">
                            {u.email}
                            {u.section && <> · <span style={{ color: "#34d399" }}>{u.section}</span></>}
                            {u.course  && <> · {u.course}</>}
                            <span className={`status-dot ${u.status ? "active" : "inactive"}`} style={{ marginLeft: 6 }}>{u.status ? "Active" : "Inactive"}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="a-lb-pts">{(u.points ?? 0).toLocaleString()} pts</div>
                          <div className="a-lb-tier">{u.tier || "Beginner"}</div>
                          {(u.streak ?? 0) > 0 && <div style={{ fontSize: ".68rem", color: "#f87171" }}>🔥 {u.streak}d</div>}
                        </div>
                        <button className="btn-sm btn-cert" onClick={e => { e.stopPropagation(); setCertModal({ student: u, rank: i + 1 }); }}>
                          🏅 Certificate
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

          </main>
        </div>
      </div>
    </>
  );
}