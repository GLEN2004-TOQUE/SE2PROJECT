import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUser, logout, getFriendlyApiErrorMessage } from "../services/api";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
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
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) {
    throw new Error(getFriendlyApiErrorMessage(res.status, data.error || data.message));
  }
  return data;
};

const PrintStyles = () => (
  <style>{`
    @media print {
      body > * { display: none !important; }
      #cert-print-root { display: block !important; }
    }
    #cert-print-root { display: none; }
  `}</style>
);

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #2a0a0f;
      --panel:     #3d1018;
      --panel2:    #321019;
      --border:    #5c1f2a;
      --border2:   rgba(92,31,42,.4);
      --mustard:   #d4a017;
      --msoft:     rgba(212,160,23,.13);
      --msoft2:    rgba(212,160,23,.06);
      --text:      #fff8f0;
      --muted:     #b87a80;
      --input-bg:  #330d14;
      --green:     #22c55e;
      --red:       #f87171;
      --blue:      #60a5fa;
      --nav-h:     64px;
      --side-w:    240px;
    }

    @keyframes _fadeUp  { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
    @keyframes _slideD  { from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);} }
    @keyframes _fadeIn  { from{opacity:0;}to{opacity:1;} }
    @keyframes _spin    { to{transform:rotate(360deg);} }
    @keyframes _shimmer { 0%{background-position:-600px 0;}100%{background-position:600px 0;} }
    @keyframes _modalIn { from{opacity:0;transform:scale(.95) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);} }
    @keyframes _toast   { 0%{opacity:0;transform:translateX(50px);}10%{opacity:1;transform:none;}85%{opacity:1;}100%{opacity:0;transform:translateX(50px);} }
    @keyframes _pulse   { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.75);} }
    @keyframes _dot     { 0%,100%{opacity:1;}50%{opacity:.3;} }
    @keyframes _cardGlow { 0%,100%{opacity:.7;}50%{opacity:1;} }

    html, body { min-height: 100vh; }

    .ad-root {
      min-height: 100vh;
      background-color: var(--bg);
      background-image:
        radial-gradient(ellipse 80% 60% at 10% 10%,  rgba(120,20,20,.45) 0%, transparent 70%),
        radial-gradient(ellipse 60% 50% at 90% 90%,  rgba(180,130,20,.18) 0%, transparent 65%),
        radial-gradient(ellipse 40% 40% at 50% 50%,  rgba(80,10,10,.35)  0%, transparent 80%);
      font-family: 'DM Sans', sans-serif;
      color: var(--text);
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      position: relative;
    }

    .ad-root::before {
      content: '';
      position: fixed; inset: 0;
      pointer-events: none; z-index: 0;
      background-image:
        repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(212,160,23,.018) 60px, rgba(212,160,23,.018) 61px),
        repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(212,160,23,.018) 60px, rgba(212,160,23,.018) 61px);
    }

    /* ══════════════════════════════
       TOPBAR
    ══════════════════════════════ */
    .ad-top {
      position: sticky; top: 0; z-index: 100;
      height: var(--nav-h);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 2rem;
      background: rgba(42,10,15,.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(92,31,42,.5);
      animation: _slideD .4s ease both;
    }
    .ad-top::after {
      content: '';
      position: absolute; bottom: -1px; left: 20%; right: 20%; height: 1px;
      background: linear-gradient(to right, transparent, rgba(212,160,23,.3), transparent);
      pointer-events: none;
    }

    .ad-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
    .ad-brand-logo {
      width: 34px; height: 34px; border-radius: 9px;
      background: var(--mustard);
      display: grid; place-items: center; overflow: hidden; flex-shrink: 0;
      box-shadow: 0 0 0 3px rgba(212,160,23,.2);
    }
    .ad-brand-logo img { width: 22px; height: 22px; object-fit: contain; }
    .ad-brand-name {
      font-family: 'Playfair Display', serif;
      font-size: 1.05rem; font-weight: 700;
      color: var(--text); letter-spacing: -.01em;
    }
    .ad-brand-chip {
      padding: .18rem .65rem; border-radius: 100px;
      background: rgba(212,160,23,.12);
      border: 1px solid rgba(212,160,23,.3);
      font-size: .62rem; font-weight: 600; letter-spacing: .1em;
      color: var(--mustard); font-family: 'DM Mono', monospace;
    }

    .ad-top-right { display: flex; align-items: center; gap: .75rem; }
    .ad-user-pill {
      display: flex; align-items: center; gap: .5rem;
      padding: .3rem .75rem .3rem .4rem;
      border: 1px solid var(--border2);
      border-radius: 100px;
      background: rgba(255,255,255,.03);
      font-size: .8rem; color: var(--muted);
    }
    .ad-avatar {
      width: 26px; height: 26px; border-radius: 50%;
      background: rgba(212,160,23,.18);
      border: 1px solid rgba(212,160,23,.3);
      display: grid; place-items: center;
      font-size: .64rem; font-weight: 700; color: var(--mustard);
    }

    .ad-menu-btn {
      display: none; width: 36px; height: 36px;
      border-radius: 9px; border: 1px solid var(--border);
      background: var(--msoft2); color: var(--text);
      cursor: pointer; align-items: center; justify-content: center;
    }
    .ad-menu-btn svg { width: 16px; height: 16px; }

    /* ══════════════════════════════
       LAYOUT
    ══════════════════════════════ */
    .ad-layout { display: flex; flex: 1; position: relative; z-index: 1; }

    /* ══════════════════════════════
       SIDEBAR — DataNest style with logout pinned at bottom
    ══════════════════════════════ */
    .ad-side {
      width: var(--side-w); flex-shrink: 0;
      border-right: 1px solid var(--border2);
      background: rgba(42,10,15,.6);
      padding: 1.5rem .85rem;
      display: flex; flex-direction: column;
      backdrop-filter: blur(12px);
      position: sticky;
      top: var(--nav-h);
      height: calc(100vh - var(--nav-h));
      overflow-y: auto;
    }

    .ad-side-nav { display: flex; flex-direction: column; gap: .15rem; flex: 1; }

    /* Logout pinned to sidebar bottom — DataNest style */
    .ad-side-bottom {
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid var(--border2);
    }
    .ad-side-logout {
      display: flex; align-items: center; gap: .65rem;
      padding: .55rem .75rem; border-radius: 10px;
      cursor: pointer; font-size: .83rem; font-weight: 500;
      color: var(--muted); transition: all .2s;
      border: 1px solid transparent;
      background: none; width: 100%;
      font-family: 'DM Sans', sans-serif;
    }
    .ad-side-logout svg { width: 15px; height: 15px; flex-shrink: 0; }
    .ad-side-logout:hover {
      background: rgba(248,113,113,.07);
      border-color: rgba(248,113,113,.2);
      color: var(--red);
    }

    .ad-side-label {
      font-size: .6rem; letter-spacing: .14em; text-transform: uppercase;
      color: rgba(212,160,23,.4); padding: 0 .6rem; margin: 1rem 0 .4rem;
      font-family: 'DM Mono', monospace;
    }
    .ad-nav-item {
      display: flex; align-items: center; gap: .65rem;
      padding: .55rem .75rem; border-radius: 10px;
      cursor: pointer; font-size: .83rem; font-weight: 500;
      color: var(--muted); transition: all .2s;
      border: 1px solid transparent; position: relative;
    }
    .ad-nav-item svg { width: 15px; height: 15px; flex-shrink: 0; }
    .ad-nav-item:hover { background: var(--msoft2); color: var(--text); border-color: var(--border2); }
    .ad-nav-item.active {
      background: var(--msoft);
      border-color: rgba(212,160,23,.3);
      color: var(--mustard); font-weight: 600;
    }
    .ad-nav-item.active::before {
      content: ''; position: absolute; left: -1px; top: 20%; bottom: 20%;
      width: 2px; border-radius: 0 2px 2px 0;
      background: var(--mustard);
    }
    .ad-nav-count {
      margin-left: auto;
      font-family: 'DM Mono', monospace; font-size: .62rem;
      background: rgba(212,160,23,.12); color: var(--mustard);
      border: 1px solid rgba(212,160,23,.2);
      border-radius: 5px; padding: .06rem .38rem;
    }

    /* ══════════════════════════════
       MAIN
    ══════════════════════════════ */
    .ad-main {
      flex: 1; padding: 2rem 2.2rem; min-width: 0;
      animation: _fadeIn .3s ease both;
      overflow-x: hidden;
    }
    .ad-page-head { margin-bottom: 2rem; display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .ad-page-head-text {}
    .ad-page-eyebrow {
      display: inline-block;
      font-size: .62rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
      color: var(--mustard); font-family: 'DM Mono', monospace;
      margin-bottom: .4rem;
    }
    .ad-page-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.7rem; font-weight: 700; color: var(--text);
      letter-spacing: -.02em; line-height: 1.2;
    }
    .ad-page-sub { font-size: .8rem; color: var(--muted); margin-top: .25rem; font-weight: 300; }

    /* ══════════════════════════════
       STAT CARDS — DataNest gradient style
    ══════════════════════════════ */
    .ad-stat-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; margin-bottom: 1.8rem; }
    .ad-stat-card {
      border-radius: 16px; padding: 1.35rem 1.4rem;
      position: relative; overflow: hidden;
      animation: _fadeUp .5s ease both;
      transition: transform .2s, box-shadow .25s;
      border: 1px solid transparent;
    }
    .ad-stat-card:hover { transform: translateY(-3px); }

    /* Gradient card variants */
    .ad-stat-card.grad-gold {
      background: linear-gradient(135deg, rgba(212,160,23,.22) 0%, rgba(120,80,10,.35) 60%, rgba(61,16,24,.9) 100%);
      border-color: rgba(212,160,23,.3);
      box-shadow: 0 4px 32px rgba(212,160,23,.1), inset 0 1px 0 rgba(212,160,23,.2);
    }
    .ad-stat-card.grad-gold:hover { box-shadow: 0 8px 40px rgba(212,160,23,.2), inset 0 1px 0 rgba(212,160,23,.3); }
    .ad-stat-card.grad-green {
      background: linear-gradient(135deg, rgba(34,197,94,.18) 0%, rgba(15,90,45,.35) 60%, rgba(61,16,24,.9) 100%);
      border-color: rgba(34,197,94,.25);
      box-shadow: 0 4px 32px rgba(34,197,94,.08), inset 0 1px 0 rgba(34,197,94,.15);
    }
    .ad-stat-card.grad-green:hover { box-shadow: 0 8px 40px rgba(34,197,94,.16), inset 0 1px 0 rgba(34,197,94,.25); }
    .ad-stat-card.grad-blue {
      background: linear-gradient(135deg, rgba(96,165,250,.18) 0%, rgba(30,60,120,.35) 60%, rgba(61,16,24,.9) 100%);
      border-color: rgba(96,165,250,.25);
      box-shadow: 0 4px 32px rgba(96,165,250,.08), inset 0 1px 0 rgba(96,165,250,.15);
    }
    .ad-stat-card.grad-blue:hover { box-shadow: 0 8px 40px rgba(96,165,250,.16), inset 0 1px 0 rgba(96,165,250,.25); }
    .ad-stat-card.grad-red {
      background: linear-gradient(135deg, rgba(248,113,113,.18) 0%, rgba(120,20,20,.35) 60%, rgba(61,16,24,.9) 100%);
      border-color: rgba(248,113,113,.25);
      box-shadow: 0 4px 32px rgba(248,113,113,.08), inset 0 1px 0 rgba(248,113,113,.15);
    }
    .ad-stat-card.grad-red:hover { box-shadow: 0 8px 40px rgba(248,113,113,.16), inset 0 1px 0 rgba(248,113,113,.25); }

    /* Corner glow on each card */
    .ad-stat-card::after {
      content: '';
      position: absolute; top: -30px; right: -30px;
      width: 90px; height: 90px; border-radius: 50%;
      pointer-events: none;
      animation: _cardGlow 3s ease-in-out infinite;
    }
    .grad-gold::after  { background: radial-gradient(circle, rgba(212,160,23,.35) 0%, transparent 70%); }
    .grad-green::after { background: radial-gradient(circle, rgba(34,197,94,.28)  0%, transparent 70%); }
    .grad-blue::after  { background: radial-gradient(circle, rgba(96,165,250,.28) 0%, transparent 70%); }
    .grad-red::after   { background: radial-gradient(circle, rgba(248,113,113,.25) 0%, transparent 70%); }

    .ad-stat-card::before {
      content: ''; position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
      background: linear-gradient(to right, transparent, rgba(255,255,255,.12), transparent);
      pointer-events: none;
    }
    .ad-stat-icon {
      width: 38px; height: 38px; border-radius: 10px;
      display: grid; place-items: center; margin-bottom: .85rem;
    }
    .ad-stat-icon svg { width: 17px; height: 17px; }
    .grad-gold  .ad-stat-icon { background: rgba(212,160,23,.18); border: 1px solid rgba(212,160,23,.3); color: var(--mustard); }
    .grad-green .ad-stat-icon { background: rgba(34,197,94,.14);  border: 1px solid rgba(34,197,94,.25);  color: var(--green); }
    .grad-blue  .ad-stat-icon { background: rgba(96,165,250,.14); border: 1px solid rgba(96,165,250,.25); color: var(--blue); }
    .grad-red   .ad-stat-icon { background: rgba(248,113,113,.12); border: 1px solid rgba(248,113,113,.22); color: var(--red); }

    .ad-stat-label {
      font-size: .65rem; letter-spacing: .1em; text-transform: uppercase;
      color: var(--muted); margin-bottom: .35rem;
      font-family: 'DM Mono', monospace;
    }
    .ad-stat-val {
      font-family: 'Playfair Display', serif;
      font-size: 2.1rem; font-weight: 700; color: var(--text); line-height: 1;
    }
    .grad-gold  .ad-stat-val { color: #f5c84a; }
    .grad-green .ad-stat-val { color: #4ade80; }
    .grad-blue  .ad-stat-val { color: #93c5fd; }
    .grad-red   .ad-stat-val { color: #fca5a5; }
    .ad-stat-hint { font-size: .7rem; color: var(--muted); margin-top: .4rem; font-weight: 300; }

    /* ══════════════════════════════
       PANEL
    ══════════════════════════════ */
    .ad-panel {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 16px; overflow: hidden;
      margin-bottom: 1.4rem;
      position: relative;
    }
    .ad-panel::before {
      content: ''; position: absolute; top: 0; left: 20%; right: 20%; height: 1px;
      background: linear-gradient(to right, transparent, rgba(212,160,23,.2), transparent);
      pointer-events: none;
    }
    .ad-panel-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.1rem 1.5rem; border-bottom: 1px solid var(--border2);
    }
    .ad-panel-title {
      font-family: 'Playfair Display', serif;
      font-size: .95rem; font-weight: 700; color: var(--text);
    }
    .ad-panel-action {
      padding: .38rem .9rem; border-radius: 8px;
      border: 1px solid rgba(212,160,23,.35); background: var(--msoft2);
      color: var(--mustard); font-family: 'DM Sans', sans-serif;
      font-size: .76rem; font-weight: 600;
      cursor: pointer; transition: all .2s;
    }
    .ad-panel-action:hover { background: var(--msoft); border-color: rgba(212,160,23,.6); }

    /* ══════════════════════════════
       ANALYTICS SECTION HEADER — DataNest style
    ══════════════════════════════ */
    .ad-analytics-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 1.4rem; gap: 1rem; flex-wrap: wrap;
    }
    .ad-filter-btn {
      display: flex; align-items: center; gap: .45rem;
      padding: .42rem .9rem; border-radius: 9px;
      border: 1px solid var(--border);
      background: rgba(255,255,255,.03);
      color: var(--muted); font-family: 'DM Sans', sans-serif;
      font-size: .78rem; cursor: pointer; transition: all .2s;
    }
    .ad-filter-btn svg { width: 13px; height: 13px; }
    .ad-filter-btn:hover { border-color: rgba(212,160,23,.3); color: var(--text); }

    /* ══════════════════════════════
       CHART CARDS — enhanced with gradient
    ══════════════════════════════ */
    .ad-chart-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 1.2rem; margin-bottom: 1.4rem; }
    .ad-chart-card {
      background: linear-gradient(145deg, rgba(61,16,24,.95) 0%, rgba(50,16,25,.98) 60%, rgba(42,10,15,1) 100%);
      border: 1px solid var(--border);
      border-radius: 16px; padding: 1.4rem 1.6rem; position: relative; overflow: hidden;
      transition: border-color .25s, transform .2s, box-shadow .25s;
    }
    .ad-chart-card:hover {
      border-color: rgba(212,160,23,.35);
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(0,0,0,.3), 0 0 0 1px rgba(212,160,23,.1);
    }
    .ad-chart-card::before {
      content: ''; position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
      background: linear-gradient(to right, transparent, rgba(212,160,23,.25), transparent);
    }
    /* Ambient glow in corner */
    .ad-chart-card::after {
      content: '';
      position: absolute; bottom: -40px; right: -40px;
      width: 120px; height: 120px; border-radius: 50%;
      background: radial-gradient(circle, rgba(212,160,23,.1) 0%, transparent 70%);
      pointer-events: none;
    }
    .ad-chart-eyebrow {
      font-size: .6rem; letter-spacing: .12em; text-transform: uppercase;
      color: var(--mustard); font-family: 'DM Mono', monospace; margin-bottom: .3rem;
    }
    .ad-chart-title {
      font-family: 'Playfair Display', serif;
      font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: .2rem;
    }
    .ad-chart-sub { font-size: .73rem; color: var(--muted); font-weight: 300; margin-bottom: 1rem; line-height: 1.5; }

    /* Sparkline */
    .ad-spark-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: .7rem; }
    .ad-spark-val { font-family: 'Playfair Display', serif; font-size: 1.8rem; color: var(--mustard); line-height: 1; }
    .ad-spark-lbl { font-size: .7rem; color: var(--muted); font-weight: 300; }
    .ad-date-row { display: flex; justify-content: space-between; margin-top: .5rem; }
    .ad-date-chip { font-size: .63rem; color: var(--muted); font-family: 'DM Mono', monospace; }

    /* ══════════════════════════════
       SEARCH
    ══════════════════════════════ */
    .ad-search {
      display: flex; align-items: center; gap: .45rem;
      background: var(--input-bg); border: 1px solid var(--border);
      border-radius: 9px; padding: .42rem .8rem;
      transition: border-color .2s;
    }
    .ad-search:focus-within { border-color: rgba(212,160,23,.4); }
    .ad-search svg { width: 13px; height: 13px; color: var(--muted); flex-shrink: 0; }
    .ad-search input {
      background: none; border: none; outline: none;
      color: var(--text); font-family: 'DM Sans', sans-serif; font-size: .81rem; width: 180px;
    }
    .ad-search input::placeholder { color: rgba(184,122,128,.5); }

    /* ══════════════════════════════
       TABLE
    ══════════════════════════════ */
    .ad-table { width: 100%; border-collapse: collapse; }
    .ad-table th {
      font-size: .63rem; letter-spacing: .1em; text-transform: uppercase;
      color: var(--muted); font-weight: 600;
      font-family: 'DM Mono', monospace;
      padding: .75rem 1.4rem; text-align: left;
      border-bottom: 1px solid var(--border2);
    }
    .ad-table td {
      padding: .85rem 1.4rem; font-size: .82rem; color: rgba(255,248,240,.65);
      border-bottom: 1px solid rgba(92,31,42,.25);
    }
    .ad-table tr:last-child td { border-bottom: none; }
    .ad-table tr:hover td { background: rgba(212,160,23,.03); }

    .ad-cell-user { display: flex; align-items: center; gap: .7rem; }
    .ad-av {
      width: 32px; height: 32px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      font-size: .72rem; font-weight: 700; flex-shrink: 0;
    }
    .av-teacher { background: rgba(212,160,23,.18); color: var(--mustard); }
    .av-student { background: rgba(34,197,94,.12);  color: #22c55e; }
    .av-admin   { background: rgba(96,165,250,.12); color: #60a5fa; }
    .ad-user-name  { font-weight: 600; color: var(--text); font-size: .83rem; }
    .ad-user-email { font-size: .7rem; color: var(--muted); font-family: 'DM Mono', monospace; }

    .role-pill {
      display: inline-flex; align-items: center;
      padding: .18rem .6rem; border-radius: 6px;
      font-size: .67rem; font-weight: 600; letter-spacing: .03em;
    }
    .rp-teacher { background: rgba(212,160,23,.14); color: var(--mustard); border: 1px solid rgba(212,160,23,.25); }
    .rp-student { background: rgba(34,197,94,.11);  color: #22c55e; border: 1px solid rgba(34,197,94,.2); }
    .rp-admin   { background: rgba(96,165,250,.11); color: #60a5fa; border: 1px solid rgba(96,165,250,.2); }

    .status-dot {
      display: inline-flex; align-items: center; gap: .35rem;
      font-size: .73rem; font-weight: 600;
    }
    .status-dot::before {
      content: ''; width: 6px; height: 6px; border-radius: 50%;
      animation: _dot 2s infinite;
    }
    .status-dot.active::before  { background: var(--green); }
    .status-dot.inactive::before{ background: #6b7280; animation: none; }
    .status-dot.active   { color: var(--green); }
    .status-dot.inactive { color: rgba(255,255,255,.3); }

    .btn-sm {
      padding: .28rem .7rem; border-radius: 7px;
      font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 600;
      cursor: pointer; transition: all .15s; border: 1px solid transparent;
      white-space: nowrap;
    }
    .btn-assign { background: var(--msoft2); border-color: rgba(212,160,23,.3); color: var(--mustard); }
    .btn-assign:hover { background: var(--msoft); border-color: rgba(212,160,23,.55); }
    .btn-deact  { background: rgba(251,191,36,.08); border-color: rgba(251,191,36,.22); color: #fbbf24; }
    .btn-deact:hover  { background: rgba(251,191,36,.16); }
    .btn-act    { background: rgba(34,197,94,.08);  border-color: rgba(34,197,94,.22);  color: var(--green); }
    .btn-act:hover    { background: rgba(34,197,94,.16); }
    .btn-del    { background: rgba(248,113,113,.07); border-color: rgba(248,113,113,.2); color: var(--red); }
    .btn-del:hover    { background: rgba(248,113,113,.16); }
    .btn-cert   { background: rgba(212,160,23,.1); border-color: rgba(212,160,23,.25); color: var(--mustard); }
    .btn-cert:hover   { background: var(--msoft); }

    .ad-btn-row { display: flex; gap: .4rem; flex-wrap: wrap; }
    .ad-empty { padding: 2.5rem; text-align: center; color: var(--muted); font-size: .83rem; }

    .skel {
      height: 13px; border-radius: 4px;
      background: linear-gradient(90deg, rgba(255,255,255,.03) 0%, rgba(212,160,23,.06) 50%, rgba(255,255,255,.03) 100%);
      background-size: 600px 100%; animation: _shimmer 1.4s infinite;
    }

    .spinner {
      display: inline-block; width: 13px; height: 13px;
      border: 2px solid rgba(212,160,23,.25); border-top-color: var(--mustard);
      border-radius: 50%; animation: _spin .65s linear infinite;
    }

    /* ══════════════════════════════
       MODAL
    ══════════════════════════════ */
    .ad-overlay {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(0,0,0,.75); backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center; padding: 1.5rem;
      animation: _fadeIn .2s ease both;
    }
    .ad-modal {
      background: var(--panel); border: 1px solid var(--border);
      border-radius: 20px; padding: 2rem 2.2rem;
      width: 100%; max-width: 460px;
      animation: _modalIn .28s cubic-bezier(.34,1.56,.64,1) both;
      box-shadow: 0 40px 80px rgba(0,0,0,.65);
      position: relative;
    }
    .ad-modal::before {
      content: ''; position: absolute; top: 0; left: 20%; right: 20%; height: 1px;
      background: linear-gradient(to right, transparent, rgba(212,160,23,.35), transparent);
    }
    .ad-modal-icon {
      width: 48px; height: 48px; border-radius: 13px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1.2rem;
    }
    .ad-modal-icon svg { width: 22px; height: 22px; }
    .ad-modal-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.2rem; font-weight: 700; color: var(--text); margin-bottom: .35rem;
    }
    .ad-modal-sub { font-size: .82rem; color: var(--muted); line-height: 1.65; margin-bottom: 1.4rem; }
    .ad-modal-sub strong { color: var(--text); }

    .ad-field { margin-bottom: 1rem; }
    .ad-field label {
      display: block; font-size: .67rem; letter-spacing: .1em; text-transform: uppercase;
      color: rgba(212,160,23,.6); margin-bottom: .44rem; font-weight: 600;
      font-family: 'DM Mono', monospace;
    }
    .ad-field input, .ad-field select {
      width: 100%; padding: .68rem .95rem;
      background: var(--input-bg); border: 1px solid var(--border);
      border-radius: 10px; color: var(--text);
      font-family: 'DM Sans', sans-serif; font-size: .87rem;
      outline: none; transition: border-color .2s, box-shadow .2s;
      appearance: none;
    }
    .ad-field input::placeholder { color: rgba(184,122,128,.45); }
    .ad-field input:focus, .ad-field select:focus {
      border-color: rgba(212,160,23,.5);
      box-shadow: 0 0 0 3px rgba(212,160,23,.1);
    }
    .ad-field select option { background: var(--panel); }
    .ad-help-text { margin-top: .45rem; font-size: .72rem; color: var(--muted); line-height: 1.45; }

    .ad-modal-btns { display: flex; gap: .7rem; margin-top: 1.4rem; }
    .ad-btn-cancel {
      flex: 1; padding: .7rem; border-radius: 10px;
      border: 1px solid var(--border); background: transparent;
      color: var(--muted); font-family: 'DM Sans', sans-serif;
      font-size: .85rem; font-weight: 600; cursor: pointer; transition: all .2s;
    }
    .ad-btn-cancel:hover { border-color: rgba(212,160,23,.3); color: var(--text); background: var(--msoft2); }
    .ad-btn-primary {
      flex: 2; padding: .7rem; border-radius: 10px; border: none;
      background: linear-gradient(135deg, #8b1a1a 0%, #6b1010 50%, #8b1a1a 100%);
      background-size: 200%;
      color: var(--text); font-family: 'DM Sans', sans-serif;
      font-size: .88rem; font-weight: 700;
      cursor: pointer; transition: all .2s;
      box-shadow: 0 4px 16px rgba(120,20,20,.45);
    }
    .ad-btn-primary:hover { box-shadow: 0 8px 28px rgba(140,30,30,.6); transform: translateY(-1px); }
    .ad-btn-primary:disabled { opacity: .45; cursor: not-allowed; transform: none; }
    .ad-btn-danger {
      flex: 2; padding: .7rem; border-radius: 10px; border: none;
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      color: #fff; font-family: 'DM Sans', sans-serif;
      font-size: .88rem; font-weight: 700;
      cursor: pointer; transition: all .2s;
    }
    .ad-btn-danger:hover { opacity: .88; }

    /* ══════════════════════════════
       TOAST
    ══════════════════════════════ */
    .ad-toast {
      position: fixed; bottom: 2rem; right: 2rem; z-index: 300;
      display: flex; align-items: center; gap: .7rem;
      padding: .85rem 1.2rem; border-radius: 12px;
      background: var(--panel); border: 1px solid var(--border);
      box-shadow: 0 20px 50px rgba(0,0,0,.55);
      font-size: .83rem; font-weight: 600; max-width: 340px;
      animation: _toast 3.5s ease forwards;
    }
    .ad-toast.ok  { border-color: rgba(34,197,94,.35);  color: var(--green); }
    .ad-toast.err { border-color: rgba(248,113,113,.35); color: var(--red); }
    .ad-toast svg { width: 17px; height: 17px; flex-shrink: 0; }

    /* ══════════════════════════════
       LEADERBOARD
    ══════════════════════════════ */
    .ad-lb-row {
      display: flex; align-items: center; gap: .85rem;
      padding: .85rem 1.4rem; border-bottom: 1px solid rgba(92,31,42,.25);
      transition: background .15s; cursor: pointer;
    }
    .ad-lb-row:last-child { border-bottom: none; }
    .ad-lb-row:hover { background: var(--msoft2); }
    .ad-lb-rank {
      width: 32px; text-align: center;
      font-family: 'Playfair Display', serif; font-size: .9rem; font-weight: 700;
      color: var(--muted); flex-shrink: 0;
    }
    .ad-lb-rank.g1 { color: #ffd700; }
    .ad-lb-rank.g2 { color: #c0c0c0; }
    .ad-lb-rank.g3 { color: #cd7f32; }
    .ad-lb-av {
      width: 34px; height: 34px; border-radius: 9px;
      background: rgba(34,197,94,.12); display: grid; place-items: center;
      font-size: .72rem; font-weight: 700; color: var(--green); flex-shrink: 0;
    }
    .ad-lb-info { flex: 1; min-width: 0; }
    .ad-lb-name { font-size: .83rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ad-lb-meta { font-size: .7rem; color: var(--muted); margin-top: .1rem; }
    .ad-lb-pts {
      font-family: 'Playfair Display', serif;
      font-size: .88rem; font-weight: 700; color: var(--mustard); flex-shrink: 0;
    }
    .ad-lb-tier { font-size: .67rem; color: var(--muted); flex-shrink: 0; }

    .ad-lb-tabs { display: flex; gap: .4rem; flex-wrap: wrap; }
    .ad-lb-tab {
      padding: .28rem .75rem; border-radius: 7px; cursor: pointer;
      font-size: .72rem; font-weight: 600;
      border: 1px solid var(--border); background: transparent;
      color: var(--muted); transition: all .15s;
      font-family: 'DM Sans', sans-serif;
    }
    .ad-lb-tab.on { background: var(--msoft); border-color: rgba(212,160,23,.35); color: var(--mustard); }

    /* ══════════════════════════════
       CERTIFICATE
    ══════════════════════════════ */
    .cert-overlay {
      position: fixed; inset: 0; z-index: 250;
      background: rgba(0,0,0,.82); backdrop-filter: blur(14px);
      display: flex; align-items: center; justify-content: center;
      padding: 1.5rem; animation: _fadeIn .2s ease both;
    }
    .cert-box {
      background: #fff; border-radius: 4px;
      width: 100%; max-width: 680px;
      animation: _modalIn .3s ease both;
      box-shadow: 0 40px 80px rgba(0,0,0,.7);
    }
    .cert-actions {
      display: flex; justify-content: flex-end; align-items: center; gap: .75rem;
      padding: .85rem 1.2rem; background: var(--panel);
      border-radius: 0 0 4px 4px;
    }
    .cert-close-btn {
      padding: .4rem .9rem; border-radius: 8px;
      border: 1px solid var(--border); background: transparent;
      color: var(--muted); font-family: 'DM Sans', sans-serif;
      font-size: .8rem; cursor: pointer; transition: all .2s;
    }
    .cert-close-btn:hover { color: var(--text); border-color: rgba(212,160,23,.3); }
    .cert-print-btn {
      padding: .4rem 1.2rem; border-radius: 8px; border: none;
      background: linear-gradient(135deg, #8b1a1a, #6b1010);
      color: var(--text); font-family: 'DM Sans', sans-serif;
      font-size: .8rem; font-weight: 700; cursor: pointer; transition: opacity .2s;
    }
    .cert-print-btn:hover { opacity: .88; }

    /* ══════════════════════════════
       MOBILE
    ══════════════════════════════ */
    .ad-side-backdrop {
      position: fixed; inset: var(--nav-h) 0 0 0;
      background: rgba(0,0,0,.55); z-index: 89;
    }
    @media (max-width: 1100px) {
      .ad-stat-row { grid-template-columns: repeat(2,1fr); }
      .ad-main { padding: 1.5rem 1.4rem; }
      .ad-table { min-width: 760px; }
      .ad-panel { overflow-x: auto; }
    }
    @media (max-width: 768px) {
      .ad-top { padding: 0 1rem; }
      .ad-menu-btn { display: inline-flex; }
      .ad-user-pill span { display: none; }
      .ad-stat-row { grid-template-columns: 1fr 1fr; }
      .ad-side {
        position: fixed; top: var(--nav-h); left: 0; bottom: 0;
        width: 260px; transform: translateX(-110%);
        transition: transform .25s ease; z-index: 90;
        height: calc(100vh - var(--nav-h));
      }
      .ad-side.open { transform: translateX(0); }
      .ad-main { padding: 1.2rem 1rem; }
      .ad-chart-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 500px) {
      .ad-stat-row { grid-template-columns: 1fr; }
    }
  `}</style>
);

/* ══════════════════════════════
   ICONS
══════════════════════════════ */
const I = {
  Menu:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>,
  Shield:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l7 3v5c0 5.25-2.625 8.75-7 10C7.625 18.75 5 15.25 5 10V5l7-3z"/></svg>,
  Users:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Teacher: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v10H4z"/><path d="M2 20l10-6 10 6"/></svg>,
  Link:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Trophy:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>,
  Search:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Plus:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Check:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>,
  X:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Trash:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  Chart:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  User:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Logout:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const initials = (n="") => n.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase()||"?";
const medal = (i) => i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`;
const rankCls = (i) => i===0?"g1":i===1?"g2":i===2?"g3":"";

const SUBJECT_OPTIONS = [
  { value:"SE2",      label:"SE2 - Software Engineering 2" },
  { value:"MATHELEC", label:"MATHELEC - Mathematics for Electronics" },
  { value:"PL321",    label:"PL321 - Programming Languages 3-2-1" },
  { value:"ELEC322",  label:"ELEC322 - Electronics 3-2-2" },
  { value:"THS411",   label:"THS411 - Technopreneurship and Society 4-1-1" },
];
const subjectLabelByCode = SUBJECT_OPTIONS.reduce((acc,item)=>{ acc[item.value]=item.label; return acc; }, {});

/* ══════════════════════════════
   MAIN COMPONENT
══════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const [tab, setTab]               = useState(()=>localStorage.getItem("admin_tab")||"overview");
  const [students, setStudents]     = useState([]);
  const [teachers, setTeachers]     = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [certRequests, setCertRequests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [lbLoading, setLbLoading]   = useState(false);
  const [lbFilter, setLbFilter]     = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch]         = useState("");
  const [toast, setToast]           = useState(null);

  const [assignModal, setAssignModal]           = useState(null);
  const [selectedTeacher, setSelectedTeacher]   = useState("");
  const [confirming, setConfirming]             = useState(false);
  const [createTeacherModal, setCreateTeacherModal] = useState(false);
  const [newTeacher, setNewTeacher]             = useState({ fullName:"", email:"", subject:"SE2", customSubject:"" });
  const [creating, setCreating]                 = useState(false);
  const [deleteModal, setDeleteModal]           = useState(null);
  const [deleting, setDeleting]                 = useState(false);
  const [certModal, setCertModal]               = useState(null);

  useEffect(()=>{ if(!user||user.role!=="admin") navigate("/"); },[user,navigate]);

  const showToast = (msg,type="ok")=>{
    setToast({msg,type});
    setTimeout(()=>setToast(null),3600);
  };

  const loadData = useCallback(async()=>{
    setLoading(true);
    try {
      const [s,t,a] = await Promise.all([
        apiFetch("/api/admin/students"),
        apiFetch("/api/admin/teachers"),
        apiFetch("/api/admin/assignments"),
      ]);
      const certData = await apiFetch("/api/admin/certificate-requests").catch(()=>[]);
      setStudents(s); setTeachers(t); setAssignments(a);
      setCertRequests(certData||[]);
    } catch(e){ showToast(e.message,"err"); }
    finally { setLoading(false); }
  },[]);

  const loadLeaderboard = useCallback(async()=>{
    setLbLoading(true);
    try {
      const data = await apiFetch("/api/admin/leaderboard");
      setLeaderboard(data);
    } catch(e){ showToast(e.message,"err"); }
    finally { setLbLoading(false); }
  },[]);

  useEffect(()=>{ loadData(); },[loadData]);
  useEffect(()=>{ if(tab==="leaderboard") loadLeaderboard(); },[tab,loadLeaderboard]);
  useEffect(()=>{ localStorage.setItem("admin_tab",tab); },[tab]);

  const assignMap = {};
  assignments.forEach(a=>{
    if(!a.student?.id||!a.teacher) return;
    if(!assignMap[a.student.id]) assignMap[a.student.id]=[];
    assignMap[a.student.id].push(a.teacher);
  });
  const assignedCount = Object.keys(assignMap).length;

  const openAssign = (student)=>{ setSelectedTeacher(""); setAssignModal({student}); };
  const confirmAssign = async()=>{
    if(!selectedTeacher) return;
    setConfirming(true);
    try {
      const r = await apiFetch("/api/admin/assign",{method:"POST",body:JSON.stringify({teacherId:selectedTeacher,studentId:assignModal.student.id})});
      showToast(r.message); setAssignModal(null); loadData();
    } catch(e){ showToast(e.message,"err"); }
    finally { setConfirming(false); }
  };

  const removeAssignment = async(studentId,teacherId=null)=>{
    try {
      const url = teacherId?`/api/admin/assign/${studentId}?teacherId=${teacherId}`:`/api/admin/assign/${studentId}`;
      await apiFetch(url,{method:"DELETE"});
      showToast(teacherId?"Teacher assignment removed":"All teacher assignments removed");
      loadData();
    } catch(e){ showToast(e.message,"err"); }
  };

  const updateCertStatus = async(requestId,status)=>{
    try {
      const r = await apiFetch(`/api/admin/certificate-requests/${requestId}/status`,{method:"PATCH",body:JSON.stringify({status})});
      showToast(r.message||"Certificate request updated"); loadData();
    } catch(e){ showToast(e.message,"err"); }
  };

  const handleCreateTeacher = async(e)=>{
    e.preventDefault(); setCreating(true);
    try {
      const finalSubject = newTeacher.subject==="__custom__"?newTeacher.customSubject.trim():newTeacher.subject;
      if(!finalSubject) throw new Error("Please provide a subject");
      const r = await apiFetch("/api/admin/teachers/create",{method:"POST",body:JSON.stringify({fullName:newTeacher.fullName,email:newTeacher.email,subject:finalSubject})});
      showToast(r.message,"ok");
      if(!r.emailSent&&r.tempPassword) setTimeout(()=>showToast(`Temp password: ${r.tempPassword}`,"ok"),3700);
      setCreateTeacherModal(false);
      setNewTeacher({fullName:"",email:"",subject:"SE2",customSubject:""});
      loadData();
    } catch(e){ showToast(e.message,"err"); }
    finally { setCreating(false); }
  };

  const toggleStatus = async(userId,currentStatus)=>{
    try {
      const r = await apiFetch(`/api/admin/users/${userId}/status`,{method:"PATCH",body:JSON.stringify({status:!currentStatus})});
      showToast(r.message); loadData();
    } catch(e){ showToast(e.message,"err"); }
  };

  const confirmDelete = async()=>{
    if(!deleteModal) return;
    setDeleting(true);
    try {
      const r = await apiFetch(`/api/admin/users/${deleteModal.id}`,{method:"DELETE"});
      showToast(r.message); setDeleteModal(null); loadData();
    } catch(e){ showToast(e.message,"err"); }
    finally { setDeleting(false); }
  };

  const filteredLb = lbFilter==="all" ? leaderboard : leaderboard.filter(u=>u.section===lbFilter);
  const sections = [...new Set(leaderboard.map(u=>u.section).filter(Boolean))];

  const filterBySearch = arr => arr.filter(u=>
    u.full_name?.toLowerCase().includes(search.toLowerCase())||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const activeStudents   = students.filter(s=>s.status).length;
  const activeTeachers   = teachers.filter(t=>t.status).length;
  const lowCount         = students.filter(s=>(s.points??0)<80&&(s.streak??0)<2).length;
  const increasingCount  = students.filter(s=>(s.points??0)>=80||(s.streak??0)>=2).length;
  const highCount        = students.filter(s=>(s.points??0)>=180||(s.streak??0)>=4).length;

  const improvementBandData = [
    {label:"Needs Attention",value:lowCount},
    {label:"Progressing",value:Math.max(increasingCount-highCount,0)},
    {label:"High Achiever",value:highCount},
  ];

  const accountSparkline = [
    Math.max(Math.round(activeStudents*.58),0),
    Math.max(Math.round(activeStudents*.68),0),
    Math.max(Math.round(activeStudents*.77),0),
    Math.max(Math.round(activeStudents*.85),0),
    activeStudents,
  ];
  const accountDates = Array.from({length:5},(_,idx)=>{
    const d = new Date(); d.setDate(d.getDate()-(4-idx));
    return d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
  });

  const sectionImprovementMap = students.reduce((acc,s)=>{
    const key = s.section||"Unspecified";
    if(!acc[key]) acc[key]={increasing:0,low:0};
    if((s.points??0)>=80||(s.streak??0)>=2) acc[key].increasing+=1;
    else acc[key].low+=1;
    return acc;
  },{});

  const lbMomentumLine = [
    Math.max(Math.round(leaderboard.length*.3),1),
    Math.max(Math.round(leaderboard.length*.42),1),
    Math.max(Math.round(leaderboard.length*.54),1),
    Math.max(Math.round(leaderboard.length*.67),1),
    leaderboard.filter(s=>(s.points??0)>=80||(s.streak??0)>=2).length,
  ];

  const sectionLabels    = Object.keys(sectionImprovementMap);
  const stackedIncreasing = sectionLabels.map(l=>sectionImprovementMap[l].increasing);
  const stackedLow        = sectionLabels.map(l=>sectionImprovementMap[l].low);

  const teacherLoadBuckets = students.reduce((acc,s)=>{
    const c=(assignMap[s.id]||[]).length;
    if(c===0) acc.none+=1; else if(c===1) acc.one+=1; else acc.multi+=1;
    return acc;
  },{none:0,one:0,multi:0});

  const SkeletonRows = ({cols=4,rows=3}) => (
    <>{Array.from({length:rows}).map((_,i)=>(
      <tr key={i}><td colSpan={cols} style={{padding:".9rem 1.4rem"}}>
        <div className="skel" style={{width:`${50+Math.random()*40}%`}}/>
      </td></tr>
    ))}</>
  );

  const chartSx = {
    "& .MuiChartsAxis-tickLabel":  { fill: "#b87a80", fontSize: "0.68rem", fontFamily: "DM Mono, monospace" },
  "& .MuiChartsAxis-line":       { stroke: "rgba(92,31,42,.4)" },
  "& .MuiChartsAxis-tick":       { stroke: "rgba(92,31,42,.4)" },
  "& .MuiChartsGrid-line":       { stroke: "rgba(92,31,42,.25)", strokeDasharray:"4 4" },
  "& .MuiChartsLegend-label":    { fill: "#b87a80", fontSize: "0.72rem" },
  };

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <>
      <PrintStyles />
      <Styles />

      <div id="cert-print-root" />


      {toast && (
        <div className={`ad-toast ${toast.type}`}>
          {toast.type==="ok" ? I.Check : I.X}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ══ ASSIGN MODAL ══ */}
      {assignModal && (
        <div className="ad-overlay" onClick={()=>setAssignModal(null)}>
          <div className="ad-modal" onClick={e=>e.stopPropagation()}>
            <div className="ad-modal-icon" style={{background:"var(--msoft)",border:"1px solid rgba(212,160,23,.3)"}}>
              <svg style={{color:"var(--mustard)"}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </div>
            <h2 className="ad-modal-title">Assign Teacher</h2>
            <p className="ad-modal-sub">
              Add a teacher under <strong>{assignModal.student.full_name}</strong>.
              {(assignMap[assignModal.student.id]||[]).length>0 && (
                <> Current: <strong>{assignMap[assignModal.student.id].map(t=>t.full_name).join(", ")}</strong>.</>
              )}
            </p>
            <div className="ad-field">
              <label>Select Teacher</label>
              <select value={selectedTeacher} onChange={e=>setSelectedTeacher(e.target.value)}>
                <option value="">— Choose —</option>
                {teachers.filter(t=>t.status).map(t=>(
                  <option key={t.id} value={t.id}>{t.full_name} · {t.email}</option>
                ))}
              </select>
            </div>
            <div className="ad-modal-btns">
              <button className="ad-btn-cancel" onClick={()=>setAssignModal(null)}>Cancel</button>
              <button className="ad-btn-primary" onClick={confirmAssign} disabled={!selectedTeacher||confirming}>
                {confirming?<span className="spinner"/>:"Confirm Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ CREATE TEACHER MODAL ══ */}
      {createTeacherModal && (
        <div className="ad-overlay" onClick={()=>setCreateTeacherModal(false)}>
          <div className="ad-modal" onClick={e=>e.stopPropagation()}>
            <div className="ad-modal-icon" style={{background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.25)"}}>
              <svg style={{color:"#22c55e"}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M4 4h16v10H4z"/><path d="M2 20l10-6 10 6"/></svg>
            </div>
            <h2 className="ad-modal-title">Create Teacher Account</h2>
            <p className="ad-modal-sub">A temporary password will be <strong>auto-generated</strong> and sent to the teacher's email. They can change it after first login.</p>
            <form onSubmit={handleCreateTeacher}>
              <div className="ad-field">
                <label>Full Name</label>
                <input type="text" placeholder="e.g., Maria Santos" required value={newTeacher.fullName} onChange={e=>setNewTeacher(p=>({...p,fullName:e.target.value}))}/>
              </div>
              <div className="ad-field">
                <label>Email Address</label>
                <input type="email" placeholder="teacher@school.edu" required value={newTeacher.email} onChange={e=>setNewTeacher(p=>({...p,email:e.target.value}))}/>
              </div>
              <div className="ad-field">
                <label>Subject</label>
                <select value={newTeacher.subject} onChange={e=>setNewTeacher(p=>({...p,subject:e.target.value}))} required>
                  {SUBJECT_OPTIONS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
                  <option value="__custom__">Other (custom subject)</option>
                </select>
                {newTeacher.subject==="__custom__" && (
                  <input type="text" placeholder="Enter custom subject" required style={{marginTop:".55rem"}}
                    value={newTeacher.customSubject} onChange={e=>setNewTeacher(p=>({...p,customSubject:e.target.value}))}/>
                )}
                <p className="ad-help-text">Subject is saved to Supabase exactly as selected or typed.</p>
              </div>
              <div style={{display:"flex",alignItems:"flex-start",gap:".6rem",padding:".75rem .9rem",borderRadius:10,background:"rgba(34,197,94,.06)",border:"1px solid rgba(34,197,94,.18)",marginBottom:"1rem"}}>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="#22c55e" strokeWidth="1.8" style={{flexShrink:0,marginTop:1}}><circle cx="10" cy="10" r="8"/><line x1="10" y1="6" x2="10" y2="10"/><circle cx="10" cy="13.5" r=".5" fill="#22c55e"/></svg>
                <p style={{margin:0,fontSize:".76rem",color:"rgba(34,197,94,.8)",lineHeight:1.55}}>A secure temporary password will be generated and emailed automatically. Teacher must change it on first login.</p>
              </div>
              <div className="ad-modal-btns">
                <button type="button" className="ad-btn-cancel" onClick={()=>setCreateTeacherModal(false)}>Cancel</button>
                <button type="submit" className="ad-btn-primary" disabled={creating}>
                  {creating?<span className="spinner"/>:"✦ Create & Send Credentials"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ DELETE MODAL ══ */}
      {deleteModal && (
        <div className="ad-overlay" onClick={()=>setDeleteModal(null)}>
          <div className="ad-modal" onClick={e=>e.stopPropagation()}>
            <div className="ad-modal-icon" style={{background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.25)"}}>
              <span style={{color:"var(--red)"}}>{I.Trash}</span>
            </div>
            <h2 className="ad-modal-title">Delete Account</h2>
            <p className="ad-modal-sub">
              Are you sure you want to permanently delete <strong>{deleteModal.full_name}</strong>?
              This removes all data including quiz results, badges, and assignments. <strong>This cannot be undone.</strong>
            </p>
            <div className="ad-modal-btns">
              <button className="ad-btn-cancel" onClick={()=>setDeleteModal(null)}>Cancel</button>
              <button className="ad-btn-danger" onClick={confirmDelete} disabled={deleting}>
                {deleting?<span className="spinner"/>:"Yes, Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ad-root">

        {/* ══════ TOPBAR ══════ */}
        <header className="ad-top">
          <Link to="/" className="ad-brand">
            <div className="ad-brand-logo">
              <img src="/image/logo.png" alt="School Quiz Logo" onError={e=>{e.target.style.display="none";}}/>
            </div>
            <span className="ad-brand-name">School Quiz System</span>
            <span className="ad-brand-chip">ADMIN</span>
          </Link>

          <div className="ad-top-right">
            <button className="ad-menu-btn" onClick={()=>setMobileMenuOpen(v=>!v)} aria-label="Toggle menu">{I.Menu}</button>
            <div className="ad-user-pill">
              <div className="ad-avatar">{initials(user?.full_name||"A")}</div>
              <span>{user?.full_name||"Admin"}</span>
            </div>
          </div>
        </header>

        <div className="ad-layout">
          {mobileMenuOpen && <div className="ad-side-backdrop" onClick={()=>setMobileMenuOpen(false)}/>}

          {/* ══════ SIDEBAR — logout pinned at bottom ══════ */}
          <nav className={`ad-side${mobileMenuOpen?" open":""}`}>
            <div className="ad-side-nav">
              <p className="ad-side-label" style={{marginTop:0}}>Navigation</p>
              {[
                {key:"overview",    icon:I.Shield,  label:"Overview"},
                {key:"students",    icon:I.Users,   label:"Students",    count:students.length},
                {key:"teachers",    icon:I.Teacher, label:"Teachers",    count:teachers.length},
                {key:"assignments", icon:I.Link,    label:"Assignments", count:assignments.length},
                {key:"leaderboard", icon:I.Trophy,  label:"Leaderboard"},
              ].map(n=>(
                <div key={n.key} className={`ad-nav-item${tab===n.key?" active":""}`}
                  onClick={()=>{setTab(n.key);setSearch("");setMobileMenuOpen(false);}}>
                  {n.icon} {n.label}
                  {n.count!==undefined && <span className="ad-nav-count">{n.count}</span>}
                </div>
              ))}
            </div>

            {/* ── Logout pinned to sidebar bottom (DataNest style) ── */}
            <div className="ad-side-bottom">
              <button className="ad-side-logout" onClick={handleLogout}>
                {I.Logout}
                <span>Sign out</span>
              </button>
            </div>
          </nav>

          {/* ══════ MAIN ══════ */}
          <main className="ad-main">

            {/* ═══ OVERVIEW ═══ */}
            {tab==="overview" && (
              <>
                {/* Page header — DataNest style with filter button */}
                <div className="ad-page-head">
                  <div className="ad-page-head-text">
                    <div className="ad-page-eyebrow">Admin Console</div>
                    <h1 className="ad-page-title">Analytics</h1>
                    <p className="ad-page-sub">System-wide summary and performance insights</p>
                  </div>

                </div>

                {/* Sparkline card */}
                {!loading && (
                  <div className="ad-chart-card" style={{marginBottom:"1.4rem"}}>
                    <div className="ad-chart-eyebrow">Student Activity</div>
                    <div className="ad-spark-row">
                      <div>
                        <div className="ad-chart-title">Active Student Accounts</div>
                        <div className="ad-chart-sub">Trend over the last 5 days</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div className="ad-spark-val">{activeStudents}</div>
                        <div className="ad-spark-lbl">active accounts</div>
                      </div>
                    </div>
                    <SparkLineChart data={accountSparkline} height={80} showTooltip color="#d4a017"/>
                    <div className="ad-date-row">
                      {accountDates.map(d=><span key={d} className="ad-date-chip">{d}</span>)}
                    </div>
                  </div>
                )}

                {/* Stat cards — DataNest gradient style */}
                <div className="ad-stat-row">
                  {[
                    {icon:I.Users,   label:"Students",  value:students.length, hint:`${activeStudents} active accounts`,   grad:"grad-gold"},
                    {icon:I.Teacher, label:"Teachers",  value:teachers.length, hint:`${activeTeachers} active`,            grad:"grad-green"},
                    {icon:I.Link,    label:"Assigned",  value:assignedCount,   hint:`${students.length-assignedCount} unassigned`, grad:"grad-blue"},
                    {icon:I.Chart,   label:"Improving", value:increasingCount, hint:`${lowCount} need attention`,          grad:"grad-red"},
                  ].map((s,i)=>(
                    <div key={i} className={`ad-stat-card ${s.grad}`} style={{animationDelay:`${i*.08}s`}}>
                      <div className="ad-stat-icon">{s.icon}</div>
                      <p className="ad-stat-label">{s.label}</p>
                      <p className="ad-stat-val">{loading?"—":s.value}</p>
                      <p className="ad-stat-hint">{s.hint}</p>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                {!loading && (
                  <div className="ad-chart-grid">
                    <div className="ad-chart-card">
                      <div className="ad-chart-eyebrow">Momentum Trend</div>
  <div className="ad-chart-title">Improving Students Over Time</div>
  <div className="ad-chart-sub">Students with ≥80 pts or ≥2-day streak, tracked across checkpoints</div>
  <LineChart
    xAxis={[{scaleType:"point",data:["C1","C2","C3","C4","Now"],tickLabelStyle:{fill:"#b87a80",fontSize:11}}]}
    series={[{data:lbMomentumLine,curve:"natural",color:"#d4a017",label:"Students",area:true,showMark:true}]}
    height={230}
    margin={{top:16,right:16,bottom:44,left:36}}
    sx={chartSx}
                      />
                    </div>
                    <div className="ad-chart-card">
                      <div className="ad-chart-eyebrow">Teacher Load</div>
                      <div className="ad-chart-title">Teacher Assignment Distribution</div>
                      <div className="ad-chart-sub">How many teachers each student currently has assigned</div>
                      <PieChart
                        series={[{
                          innerRadius:45,outerRadius:90,cornerRadius:4,
                          paddingAngle:3,startAngle:-90,endAngle:270,
                          data:[
                            {id:0,value:teacherLoadBuckets.none, label:"No Teacher",  color:"rgba(184,122,128,.5)"},
                            {id:1,value:teacherLoadBuckets.one,  label:"1 Teacher",   color:"#d4a017"},
                            {id:2,value:teacherLoadBuckets.multi,label:"2+ Teachers", color:"#22c55e"},
                          ],
                        }]}
                        height={230}
                        margin={{top:8,right:100,bottom:8,left:16}}
                        slotProps={{legend:{direction:"column",position:{vertical:"middle",horizontal:"right"},itemMarkWidth:10,itemMarkHeight:10,markGap:6,itemGap:10,labelStyle:{fill:"#b87a80",fontSize:11}}}}
                        sx={chartSx}
                      />
                    </div>
                  </div>
                )}

                {/* Unassigned warning */}
                {!loading && students.length-assignedCount>0 && (
                  <div className="ad-panel" style={{border:"1px solid rgba(212,160,23,.3)",marginBottom:"1.4rem"}}>
                    <div className="ad-panel-head" style={{background:"rgba(212,160,23,.04)"}}>
                      <span style={{fontSize:".85rem",fontWeight:600,color:"var(--mustard)"}}>
                        ⚠ {students.length-assignedCount} student(s) without a teacher assigned
                      </span>
                      <button className="ad-panel-action" onClick={()=>setTab("students")}>Assign Now →</button>
                    </div>
                  </div>
                )}

                {/* Recent assignments */}
                <div className="ad-panel">
                  <div className="ad-panel-head">
                    <span className="ad-panel-title">Recent Assignments</span>
                  </div>
                  <table className="ad-table">
                    <thead><tr><th>Student</th><th>Teacher</th><th>Assigned</th></tr></thead>
                    <tbody>
                      {loading ? <SkeletonRows cols={3}/> : assignments.length===0
                        ? <tr><td colSpan={3} className="ad-empty">No assignments yet</td></tr>
                        : assignments.slice(0,5).map(a=>(
                          <tr key={a.id}>
                            <td><div className="ad-cell-user"><div className="ad-av av-student">{initials(a.student?.full_name)}</div><div><div className="ad-user-name">{a.student?.full_name}</div><div className="ad-user-email">{a.student?.email}</div></div></div></td>
                            <td><div className="ad-cell-user"><div className="ad-av av-teacher">{initials(a.teacher?.full_name)}</div><span className="ad-user-name">{a.teacher?.full_name}</span></div></td>
                            <td style={{fontFamily:"'DM Mono',monospace",fontSize:".7rem",color:"var(--muted)"}}>{new Date(a.assigned_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Certificate requests */}
                <div className="ad-panel">
                  <div className="ad-panel-head"><span className="ad-panel-title">Pending Certificate Requests</span></div>
                  <table className="ad-table">
                    <thead><tr><th>Student</th><th>Requested By</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {loading ? <SkeletonRows cols={4}/> : certRequests.length===0
                        ? <tr><td colSpan={4} className="ad-empty">No certificate requests yet</td></tr>
                        : certRequests.map(r=>(
                          <tr key={r.id}>
                            <td><div className="ad-cell-user"><div className="ad-av av-student">{initials(r.student?.full_name)}</div><div><div className="ad-user-name">{r.student?.full_name}</div><div className="ad-user-email">{r.student?.email}</div></div></div></td>
                            <td>{r.teacher?.full_name||"—"}</td>
                            <td style={{textTransform:"capitalize"}}>{r.status}</td>
                            <td>
                              {r.status==="pending" ? (
                                <div className="ad-btn-row">
                                  <button className="btn-sm btn-act" onClick={()=>updateCertStatus(r.id,"approved")}>Approve</button>
                                  <button className="btn-sm btn-del" onClick={()=>updateCertStatus(r.id,"rejected")}>{I.Trash}</button>
                                </div>
                              ) : <span style={{color:"var(--muted)",fontSize:".75rem"}}>Processed</span>}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ═══ STUDENTS ═══ */}
            {tab==="students" && (
              <>
                <div className="ad-page-head">
                  <div className="ad-page-head-text">
                    <div className="ad-page-eyebrow">User Management</div>
                    <h1 className="ad-page-title">Students</h1>
                    <p className="ad-page-sub">Manage accounts, assignments, and status</p>
                  </div>
                </div>
                <div className="ad-panel">
                  <div className="ad-panel-head">
                    <span className="ad-panel-title">{filterBySearch(students).length} students</span>
                    <div className="ad-search">
                      {I.Search}
                      <input placeholder="Search by name or email…" value={search} onChange={e=>setSearch(e.target.value)}/>
                    </div>
                  </div>
                  <table className="ad-table">
                    <thead><tr><th>Student</th><th>Course / Section</th><th>Points / Tier</th><th>Status</th><th>Teacher</th><th>Actions</th></tr></thead>
                    <tbody>
                      {loading ? <SkeletonRows cols={6}/> : filterBySearch(students).length===0
                        ? <tr><td colSpan={6} className="ad-empty">No students found</td></tr>
                        : filterBySearch(students).map(s=>(
                          <tr key={s.id}>
                            <td><div className="ad-cell-user"><div className="ad-av av-student">{initials(s.full_name)}</div><div><div className="ad-user-name">{s.full_name}</div><div className="ad-user-email">{s.email}</div></div></div></td>
                            <td><div style={{fontSize:".78rem"}}>{s.course&&<span style={{color:"#60a5fa",marginRight:4}}>{s.course}</span>}{s.section&&<span style={{color:"var(--green)"}}>{s.section}</span>}{!s.course&&!s.section&&<span style={{color:"var(--muted)"}}>—</span>}</div></td>
                            <td><strong style={{color:"var(--text)"}}>{s.points??0}</strong> <span style={{color:"var(--muted)",fontSize:".72rem"}}>{s.tier||"Beginner"}</span></td>
                            <td><span className={`status-dot ${s.status?"active":"inactive"}`}>{s.status?"Active":"Inactive"}</span></td>
                            <td>{(assignMap[s.id]||[]).length>0?<span style={{fontSize:".78rem",color:"var(--mustard)"}}>{(assignMap[s.id]||[]).length} teacher{(assignMap[s.id]||[]).length>1?"s":""}</span>:<span style={{color:"var(--muted)",fontSize:".75rem"}}>Unassigned</span>}</td>
                            <td>
                              <div className="ad-btn-row">
                                <button className="btn-sm btn-assign" onClick={()=>openAssign(s)}>{(assignMap[s.id]||[]).length>0?"Add Teacher":"Assign"}</button>
                                {(assignMap[s.id]||[]).length>0&&<button className="btn-sm btn-del" onClick={()=>removeAssignment(s.id)} title="Remove all teachers">{I.Trash}</button>}
                                <button className={`btn-sm ${s.status?"btn-deact":"btn-act"}`} onClick={()=>toggleStatus(s.id,s.status)}>{s.status?"Deactivate":"Activate"}</button>
                                <button className="btn-sm btn-del" onClick={()=>setDeleteModal(s)}>{I.Trash}</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ═══ TEACHERS ═══ */}
            {tab==="teachers" && (
              <>
                <div className="ad-page-head">
                  <div className="ad-page-head-text">
                    <div className="ad-page-eyebrow">User Management</div>
                    <h1 className="ad-page-title">Teachers</h1>
                    <p className="ad-page-sub">Create and manage teacher accounts</p>
                  </div>
                </div>
                <div className="ad-panel">
                  <div className="ad-panel-head">
                    <span className="ad-panel-title">{filterBySearch(teachers).length} teachers</span>
                    <div style={{display:"flex",gap:".65rem",alignItems:"center"}}>
                      <div className="ad-search">
                        {I.Search}
                        <input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
                      </div>
                      <button className="ad-panel-action" onClick={()=>setCreateTeacherModal(true)}>
                        <span style={{display:"flex",alignItems:"center",gap:".3rem"}}>{I.Plus} Create Teacher</span>
                      </button>
                    </div>
                  </div>
                  <table className="ad-table">
                    <thead><tr><th>Teacher</th><th>Subject</th><th>Status</th><th>Students</th><th>Actions</th></tr></thead>
                    <tbody>
                      {loading ? <SkeletonRows cols={5}/> : filterBySearch(teachers).length===0
                        ? <tr><td colSpan={5} className="ad-empty">No teachers — create one above</td></tr>
                        : filterBySearch(teachers).map(t=>{
                          const count=assignments.filter(a=>a.teacher?.id===t.id).length;
                          return (
                            <tr key={t.id}>
                              <td><div className="ad-cell-user"><div className="ad-av av-teacher">{initials(t.full_name)}</div><div><div className="ad-user-name">{t.full_name}</div><div className="ad-user-email">{t.email}</div></div></div></td>
                              <td><span style={{color:"#60a5fa",fontSize:".76rem"}}>{subjectLabelByCode[t.subject]||t.subject||"—"}</span></td>
                              <td><span className={`status-dot ${t.status?"active":"inactive"}`}>{t.status?"Active":"Inactive"}</span></td>
                              <td><strong style={{color:"var(--mustard)"}}>{count}</strong> <span style={{color:"var(--muted)",fontSize:".72rem"}}>student{count!==1?"s":""}</span></td>
                              <td>
                                <div className="ad-btn-row">
                                  <button className={`btn-sm ${t.status?"btn-deact":"btn-act"}`} onClick={()=>toggleStatus(t.id,t.status)}>{t.status?"Deactivate":"Activate"}</button>
                                  <button className="btn-sm btn-del" onClick={()=>setDeleteModal(t)}>{I.Trash}</button>
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

            {/* ═══ ASSIGNMENTS ═══ */}
            {tab==="assignments" && (
              <>
                <div className="ad-page-head">
                  <div className="ad-page-head-text">
                    <div className="ad-page-eyebrow">Relationships</div>
                    <h1 className="ad-page-title">Assignments</h1>
                    <p className="ad-page-sub">All teacher–student pairings</p>
                  </div>
                </div>
                <div className="ad-panel">
                  <div className="ad-panel-head"><span className="ad-panel-title">{assignments.length} active pairings</span></div>
                  <table className="ad-table">
                    <thead><tr><th>Student</th><th>Teacher</th><th>Assigned On</th><th>Action</th></tr></thead>
                    <tbody>
                      {loading ? <SkeletonRows cols={4}/> : assignments.length===0
                        ? <tr><td colSpan={4} className="ad-empty">No assignments yet</td></tr>
                        : assignments.map(a=>(
                          <tr key={a.id}>
                            <td><div className="ad-cell-user"><div className="ad-av av-student">{initials(a.student?.full_name)}</div><div><div className="ad-user-name">{a.student?.full_name}</div><div className="ad-user-email">{a.student?.email}</div></div></div></td>
                            <td><div className="ad-cell-user"><div className="ad-av av-teacher">{initials(a.teacher?.full_name)}</div><div><div className="ad-user-name">{a.teacher?.full_name}</div><div className="ad-user-email">{a.teacher?.email}</div></div></div></td>
                            <td style={{fontFamily:"'DM Mono',monospace",fontSize:".7rem",color:"var(--muted)"}}>{new Date(a.assigned_at).toLocaleString()}</td>
                            <td><button className="btn-sm btn-del" onClick={()=>removeAssignment(a.student?.id,a.teacher?.id)} title="Remove this teacher">{I.Trash}</button></td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ═══ LEADERBOARD ═══ */}
            {tab==="leaderboard" && (
              <>
                <div className="ad-page-head">
                  <div className="ad-page-head-text">
                    <div className="ad-page-eyebrow">Rankings</div>
                    <h1 className="ad-page-title">Student Leaderboard</h1>
                    <p className="ad-page-sub">All-time rankings — click any student to generate a certificate</p>
                  </div>
                </div>

                <div className="ad-stat-row" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
                  {[
                    {icon:I.Users,  label:"Total Students", value:leaderboard.length,                        grad:"grad-gold"},
                    {icon:I.Trophy, label:"Top Score",       value:leaderboard[0]?.points?.toLocaleString()||"—", grad:"grad-green"},
                    {icon:I.Chart,  label:"Sections",        value:sections.length,                           grad:"grad-blue"},
                  ].map((s,i)=>(
                    <div key={i} className={`ad-stat-card ${s.grad}`}>
                      <div className="ad-stat-icon">{s.icon}</div>
                      <p className="ad-stat-label">{s.label}</p>
                      <p className="ad-stat-val">{lbLoading?"—":s.value}</p>
                    </div>
                  ))}
                </div>

                {!lbLoading && (
                  <div className="ad-chart-grid">
                    <div className="ad-chart-card">
                      <div className="ad-chart-eyebrow">Momentum Trend</div>
                      <div className="ad-chart-title">Improving Students Over Time</div>
                      <div className="ad-chart-sub">Students with ≥80 pts or ≥2-day streak, tracked across checkpoints</div>
                      <LineChart
                        xAxis={[{scaleType:"point",data:["C1","C2","C3","C4","Now"],tickLabelStyle:{fill:"#b87a80",fontSize:11}}]}
                        series={[{data:lbMomentumLine,curve:"natural",color:"#d4a017",label:"Students",area:true,showMark:true}]}
                        height={230}
                        margin={{top:16,right:16,bottom:44,left:36}}
                        sx={chartSx}
                      />
                    </div>
                    <div className="ad-chart-card">
                      <div className="ad-chart-eyebrow">Section Breakdown</div>
                      <div className="ad-chart-title">Improvement by Section</div>
                      <div className="ad-chart-sub">Progressing vs. needs-attention count per section</div>
                      <LineChart
                        xAxis={[{scaleType:"point",data:sectionLabels.length?sectionLabels:["No section"],tickLabelStyle:{fill:"#b87a80",fontSize:11}}]}
                        series={[
                          {data:stackedIncreasing.length?stackedIncreasing:[0],area:true,stack:"total",label:"Progressing",color:"#22c55e",curve:"natural"},
                          {data:stackedLow.length?stackedLow:[0],area:true,stack:"total",label:"Needs Attention",color:"#d4a017",curve:"natural"},
                        ]}
                        height={230}
                        margin={{top:16,right:16,bottom:44,left:36}}
                        sx={chartSx}
                      />
                    </div>
                  </div>
                )}

                <div className="ad-panel">
                  <div className="ad-panel-head">
                    <div style={{display:"flex",alignItems:"center",gap:".85rem",flexWrap:"wrap"}}>
                      <span className="ad-panel-title">Rankings</span>
                      <div className="ad-lb-tabs">
                        <button className={`ad-lb-tab${lbFilter==="all"?" on":""}`} onClick={()=>setLbFilter("all")}>All</button>
                        {sections.map(s=>(
                          <button key={s} className={`ad-lb-tab${lbFilter===s?" on":""}`} onClick={()=>setLbFilter(s)}>{s}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {lbLoading ? (
                    <div style={{padding:"2rem",display:"flex",justifyContent:"center",color:"var(--muted)",gap:".6rem",alignItems:"center"}}>
                      <span className="spinner"/> Loading rankings…
                    </div>
                  ) : filteredLb.length===0 ? (
                    <div className="ad-empty">No students found</div>
                  ) : filteredLb.map((u,i)=>(
                    <div key={u.id} className="ad-lb-row" onClick={()=>setCertModal({student:u,rank:i+1})} title="Click to generate certificate">
                      <span className={`ad-lb-rank ${rankCls(i)}`}>{medal(i)}</span>
                      <div className="ad-lb-av">{initials(u.full_name)}</div>
                      <div className="ad-lb-info">
                        <div className="ad-lb-name">{u.full_name||"—"}</div>
                        <div className="ad-lb-meta">
                          {u.email}
                          {u.section&&<> · <span style={{color:"var(--green)"}}>{u.section}</span></>}
                          {u.course&&<> · {u.course}</>}
                          <span className={`status-dot ${u.status?"active":"inactive"}`} style={{marginLeft:6}}>{u.status?"Active":"Inactive"}</span>
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div className="ad-lb-pts">{(u.points??0).toLocaleString()} pts</div>
                        <div className="ad-lb-tier">{u.tier||"Beginner"}</div>
                        {(u.streak??0)>0&&<div style={{fontSize:".68rem",color:"var(--red)"}}>🔥 {u.streak}d</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

          </main>
        </div>
      </div>
    </>
  );
}
