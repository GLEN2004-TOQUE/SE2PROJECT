import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import {
  API_BASE_URL,
  getUser,
  logout,
  getMyProfile,
  getFriendlyApiErrorMessage,
  getStudentNotifications,
  markNotificationRead,
} from "../services/api";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";

const apiFetch = async (path) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}${path}`, {
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
      border-bottom: 1px solid rgba(var(--tier-rgb),.18);
      box-shadow: 0 1px 0 rgba(var(--tier-rgb),.08) inset, 0 4px 20px rgba(0,0,0,.4);
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
    .sd-notification-panel {
      margin:1rem 0 1.25rem;
      padding:1rem;
      border-radius:18px;
      background: rgba(255,255,255,.05);
      border:1px solid rgba(200,160,50,.14);
      box-shadow: 0 12px 35px rgba(0,0,0,.16);
    }
    .sd-notification-panel-header {
      display:flex; align-items:center; justify-content:space-between; gap:.75rem;
      margin-bottom:.9rem;
    }
    .sd-notification-panel-header h4 {
      margin:0; color:#f5e6c8; font-size:1rem;
    }
    .sd-notification-panel-header button {
      border:none; background:transparent; color:#f5e6c8;
      font-size:.82rem; cursor:pointer; opacity:.78;
    }
    .sd-notification-panel-list { display:grid; gap:.75rem; }
    .sd-notification-item {
      padding:1rem; border-radius:16px;
      background:rgba(255,255,255,.05);
      border:1px solid rgba(255,255,255,.08);
      transition:all .15s;
      cursor:pointer;
    }
    .sd-notification-item:hover { background:rgba(255,255,255,.1); }
    .sd-notification-item.unread {
      border-color:rgba(233,145,77,.45);
      background:linear-gradient(180deg,rgba(233,145,77,.12),rgba(255,255,255,.05));
    }
    .sd-notification-item-title {
      display:flex; align-items:center; justify-content:space-between; gap:.75rem;
      margin-bottom:.45rem; color:#f5e6c8; font-weight:600;
    }
    .sd-notification-item-title span {
      font-size:.75rem; color:rgba(240,220,155,.8);
    }
    .sd-notification-item-message {
      margin:0; color:rgba(240,220,155,.82); font-size:.85rem; line-height:1.55;
    }
    .sd-notification-empty {
      padding:1.1rem 1rem; border-radius:14px;
      background:rgba(255,255,255,.04); color:rgba(200,170,100,.7);
      font-size:.88rem;
    }
    .sd-notification-error {
      padding:1rem; border-radius:14px; background:rgba(239,68,68,.08);
      color:#fca5a5; border:1px solid rgba(239,68,68,.2); margin-bottom:1rem;
    }
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
    .sd-notification-button {
      position:relative;
      display:inline-flex; align-items:center; justify-content:center;
      width:42px; height:42px; border-radius:12px;
      border:1px solid rgba(255,255,255,.12);
      background:rgba(255,255,255,.05);
      color:#f5e6c8; cursor:pointer;
      transition: all .18s;
    }
    .sd-notification-button:hover {
      background:rgba(255,255,255,.1);
      transform:translateY(-1px);
    }
    .sd-notification-button svg { width:20px; height:20px; }
    .sd-notification-badge {
      position:absolute; top:6px; right:6px;
      min-width:18px; height:18px; padding:.05rem .25rem;
      border-radius:999px;
      background:#e9914d; color:#fff;
      font-size:.68rem; font-weight:700; display:flex;
      align-items:center; justify-content:center;
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
      max-width:1280px; margin:0 auto; padding:1.2rem 1.2rem 3rem;
    }
    .sd-topbar-left {
      display:flex; align-items:center; gap:1rem; flex-wrap:wrap;
    }
    .sd-topnav {
      display:flex; gap:.65rem; flex-wrap:wrap; align-items:center;
    }
    .sd-topnav-item {
      padding:.45rem .9rem; border-radius:999px;
      border:1px solid rgba(255,255,255,.12);
      background:rgba(255,255,255,.05);
      color:#f5e6c8; font-size:.82rem; font-weight:500;
      transition:all .15s;
      cursor:pointer;
    }
    .sd-topnav-item:hover,
    .sd-topnav-item.active {
      background:rgba(var(--tier-rgb),.22);
      border-color:rgba(var(--tier-rgb),.35);
      color:#fff;
    }
    .sd-section-subject {
      display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:1rem; margin-bottom:1.5rem;
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
    .sd-hero-grid {
      display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:1rem; margin-bottom:1.75rem;
    }
    .sd-hero-card {
      position:relative; overflow:hidden;
      padding:1.35rem; border-radius:20px;
      background: linear-gradient(180deg, rgba(var(--tier-rgb),.12), rgba(255,255,255,.03));
      border: 1px solid rgba(var(--tier-rgb),.16);
      box-shadow: 0 14px 40px rgba(0,0,0,.18);
    }
    .sd-player-rank-card {
      margin-bottom:1.5rem;
      padding:1.45rem 1.5rem;
    }
    .sd-player-rank-title {
      display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;
      flex-wrap:wrap;
      margin-bottom:1.15rem;
    }
    .sd-player-rank-title h3 {
      margin:0; font-size:1.1rem; color:#f5e6c8;
    }
    .sd-player-rank-title p {
      margin:0; color:rgba(240,220,155,.78); line-height:1.6;
      max-width:520px;
    }
    .sd-player-rank-body {
      display:flex; flex-direction:column; gap:1rem;
    }
    .sd-player-rank-main {
      display:flex; flex-direction:column; gap:.75rem;
    }
    .sd-player-rank-summary {
      display:flex; align-items:center; justify-content:space-between; gap:.75rem;
      flex-wrap:wrap;
    }
    .sd-player-rank-summary .rank-info {
      display:flex; align-items:center; gap:.6rem;
      flex-wrap:wrap;
    }
    .sd-player-rank-summary .rank-info div {
      color:#f5e6c8;
    }
    .sd-player-rank-summary .rank-info strong {
      font-size:1.7rem; font-weight:700;
    }
    .sd-hero-card::after {
      content:''; position:absolute; inset:0;
      background: radial-gradient(circle at top right, rgba(200,160,70,.14), transparent 40%);
      pointer-events:none;
    }
    .sd-hero-card h3 {
      margin:0 0 .55rem; font-size:1rem; color:#f5e6c8;
    }
    .sd-hero-card p {
      margin:0; color:rgba(240,220,155,.82);
      line-height:1.6;
    }
    .sd-progress-meter {
      margin-top:1rem; height:12px; border-radius:999px;
      background: rgba(255,255,255,.08); overflow:hidden;
      border:1px solid rgba(200,160,50,.18);
    }
    .sd-progress-bar {
      height:100%; border-radius:999px;
      background: linear-gradient(90deg, #f3dc6d 0%, #d18d0f 100%);
      box-shadow: 0 0 15px rgba(200,160,40,.25);
      transition: width .4s ease;
    }
    .sd-quest-banner {
      padding:.95rem 1rem; border-radius:16px;
      background: linear-gradient(135deg, rgba(var(--tier-rgb),.18), rgba(120,20,20,.1));
      border:1px dashed rgba(var(--tier-rgb),.18);
      color:#f5e6c8; font-size:.85rem; font-weight:500;
      display:flex; align-items:center; gap:.75rem;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,.03);
    }
    .sd-quest-pill {
      display:inline-flex; align-items:center; gap:.35rem;
      padding:.28rem .65rem; border-radius:999px;
      background:rgba(255,255,255,.08); color:#f5e6c8;
      font-size:.74rem; font-weight:600;
    }
    .sd-hero-badge {
      display:inline-flex; align-items:center; gap:.3rem;
      padding:.28rem .75rem; border-radius:14px;
      background:rgba(200,160,40,.16); color:#f5e6c8;
      font-size:.78rem; font-weight:600;
    }
    .sd-tier-system {
      padding:1.35rem 1.25rem 1.2rem;
      border-radius:22px;
      background: linear-gradient(135deg, rgba(var(--tier-rgb),.12), rgba(255,255,255,.03));
      border: 1px solid rgba(var(--tier-rgb),.18);
      box-shadow: 0 18px 55px rgba(0,0,0,.2);
      margin-bottom:1.5rem;
    }
    .sd-tier-header {
      display:flex; align-items:flex-start; justify-content:space-between; gap:1rem;
      flex-wrap:wrap;
    }
    .sd-tier-header h2 { margin:0; }
    .sd-tier-row {
      display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; margin-top:1rem;
    }
    .sd-tier-card {
      padding:1rem; border-radius:18px;
      background: rgba(255,255,255,.06);
      border:1px solid rgba(255,255,255,.08);
      box-shadow: inset 0 0 0 1px rgba(255,255,255,.02);
      transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
    }
    .sd-tier-card.current {
      border-color: rgba(var(--tier-rgb),.45);
      background: rgba(var(--tier-rgb),.18);
      box-shadow: 0 16px 45px rgba(0,0,0,.18);
      transform: translateY(-1px);
    }
    .sd-tier-card h4 {
      margin:0; font-size:1rem; color:#f5e6c8; display:flex; align-items:center; gap:.5rem;
    }
    .sd-tier-card p {
      margin:.75rem 0 0; color:rgba(240,220,155,.82); line-height:1.6; font-size:.84rem;
    }
    .sd-tier-card .sd-tier-req {
      margin-top:.75rem; font-size:.78rem; color:rgba(200,170,100,.8);
    }
    .sd-tier-card .sd-tier-reward {
      margin-top:.35rem; font-size:.82rem; color:rgba(255,255,255,.85);
    }
    .sd-section-subject {
      display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem;
    }
    .sd-section-card {
      padding:1rem 1.15rem; border-radius:18px;
      background: rgba(255,255,255,.045);
      border:1px solid rgba(var(--tier-rgb),.14);
      box-shadow: 0 12px 30px rgba(0,0,0,.15);
    }
    .sd-section-card h4 {
      margin:0 0 .55rem; font-size:.92rem; color:#f5e6c8;
    }
    .sd-section-card p {
      margin:0; color:rgba(240,220,155,.82); font-size:.84rem; line-height:1.6;
    }
    .sd-section-card span {
      display:inline-flex; align-items:center; gap:.45rem;
      color:#f5e6c8; font-weight:600; margin-top:.85rem; font-size:.84rem;
    }
    .sd-tier-chip {
      display:inline-flex; align-items:center; gap:.3rem;
      padding:.32rem .75rem; border-radius:999px;
      border:1px solid rgba(200,160,50,.15);
      background:rgba(255,255,255,.05); color:#f5e6c8;
      font-size:.78rem; font-weight:600;
    }
    .sd-reward-note {
      display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.75rem;
      margin-top:1rem; color:rgba(240,220,155,.82); font-size:.9rem;
    }
    .sd-reward-note strong { color:#fff; }
    .sd-reward-pill {
      display:inline-flex; align-items:center; gap:.35rem;
      padding:.35rem .75rem; border-radius:999px;
      background:rgba(255,255,255,.08); border:1px solid rgba(var(--tier-rgb),.25);
      color:#f5e6c8; font-weight:600; font-size:.82rem;
    }
    }
    .sd-tier-chip svg { display:block; }
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
    .sd-teacher-header {
      display:flex; align-items:center; justify-content:space-between; gap:.85rem; flex-wrap:wrap;
    }
    .sd-teacher-pagination {
      display:flex; align-items:center; gap:.55rem; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08);
      border-radius:999px; padding:.35rem .55rem;
      color:#f5e6c8; font-size:.78rem;
    }
    .sd-teacher-page-btn {
      border:none; background:transparent; color:#f5e6c8; padding:.4rem .7rem; border-radius:999px;
      cursor:pointer; transition:all .15s;
    }
    .sd-teacher-page-btn:hover:not(:disabled) { background:rgba(255,255,255,.08); }
    .sd-teacher-page-btn:disabled { opacity:.35; cursor:not-allowed; }
    .sd-popup-alert {
      display:flex; align-items:center; justify-content:space-between; gap:1rem;
      background:rgba(255,255,255,.08); border:1px solid rgba(200,160,50,.2);
      color:#f5e6c8; padding:1rem 1.2rem; border-radius:14px;
      box-shadow:0 8px 24px rgba(0,0,0,.18); margin-bottom:1rem;
    }
    .sd-popup-close {
      border:none; color:#fff; background:rgba(200,160,50,.18);
      padding:.45rem .85rem; border-radius:999px; cursor:pointer;
      font-size:.78rem; font-weight:600;
    }
    .sd-popup-close:hover { background:rgba(200,160,50,.28); }
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
    @media(max-width:1024px){
      .sd-hero-grid { grid-template-columns:1fr; }
    }
    @media(max-width:760px){
      .sd-layout { padding:.85rem; }
      .sd-stats { grid-template-columns:1fr 1fr; }
      .sd-analytics-grid { grid-template-columns:1fr; }
      .sd-settings-grid { grid-template-columns:1fr; }
      .sd-topbar {
        padding:0 1rem; flex-direction:column; align-items:flex-start;
        height:auto; gap:.85rem;
      }
      .sd-topbar-left { width:100%; justify-content:space-between; }
      .sd-topbar-right { width:100%; justify-content:space-between; flex-wrap:wrap; }
      .sd-topnav { width:100%; }
      .sd-topnav-item { flex:1 1 auto; min-width:120px; }
      .sd-name { font-size:1.65rem; }
    }
  `}</style>
);

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";
const rankClass = (i) => i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : "";
const rankEmoji = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;

const TIER_DEFINITIONS = [
  { id:"bronze", label:"Bronze", min:0, color:"#b36a2b", reward:"Classic Arcade Theme" },
  { id:"silver", label:"Silver", min:500, color:"#c0c0c0", reward:"Silver Circuit Theme" },
  { id:"gold",   label:"Gold",   min:1200, color:"#d4af37", reward:"Golden Arena Theme" },
  { id:"platinum", label:"Platinum", min:2200, color:"#8bc5ff", reward:"Platinum Pulse Theme" },
  { id:"diamond", label:"Diamond", min:3600, color:"#8ce6f2", reward:"Diamond Vault Theme" },
];

const findTierByLabel = (label) => {
  if (!label) return TIER_DEFINITIONS[0];
  return TIER_DEFINITIONS.find((tier) => tier.label.toLowerCase() === String(label).trim().toLowerCase()) || TIER_DEFINITIONS[0];
};

const hexToRgb = (hex) => {
  const normalized = String(hex || "#f5e6c8").replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `${r},${g},${b}`;
};

const TierIcon = ({ tier, size = 24 }) => {
  const color = tier?.color || "#f5e6c8";
  if (!tier) return null;

  const shape = tier.id;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`tier-grad-${tier.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor="#1a0a0a" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#tier-grad-${tier.id})`} />
      {shape === 'bronze' && (
        <path d="M20 36l7-14 7 14 15-3-12 10 4 15-13-8-13 8 4-15-12-10 15 3Z" fill="rgba(255,255,255,0.92)" />
      )}
      {shape === 'silver' && (
        <path d="M32 16l14 8v14l-14 10-14-10V24l14-8Zm0 6.5L22.75 28v8l9.25 6.5 9.25-6.5v-8L32 22.5Z" fill="rgba(255,255,255,0.92)" />
      )}
      {shape === 'gold' && (
        <path d="M32 14l12.5 25H36l3.5 15L32 44l-7.5 10L28 39.5H19.5L32 14Z" fill="rgba(255,255,255,0.92)" />
      )}
      {shape === 'platinum' && (
        <path d="M32 12 52 26 44 50 20 50 12 26 32 12Zm0 5.5L16 26l8 18h24l8-18-16-8.5Z" fill="rgba(255,255,255,0.92)" />
      )}
      {shape === 'diamond' && (
        <path d="M20 22 32 12l12 10 8 22H12L20 22Zm6 3 6-5 6 5 5 14H21l5-14Z" fill="rgba(255,255,255,0.92)" />
      )}
    </svg>
  );
};

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
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.64 5.36 6 7.92 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 1 1-6 0h6Z"/>
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
  const [itemAnalysis, setItemAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [cachedAiAnalysis, setCachedAiAnalysis] = useState(null);
  const [showAiExpiredPopup, setShowAiExpiredPopup] = useState(false);
  const [teacherPage, setTeacherPage] = useState(0);
  /** Start true so overview does not flash "No teacher" while quizzes may still supply teacher fallback. */
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [quizError, setQuizError]       = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [pwForm, setPwForm] = useState({ current:"", next:"", confirm:"" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");

  const tokenUser = getUser();
  const studentId = tokenUser?.id;
  const isStudent = tokenUser?.role === "student";
  const AI_RECOMMENDATION_TTL = 24 * 60 * 60 * 1000;
  const aiAnalysisStorageKey = studentId ? `student_ai_recs_${studentId}` : null;

  const getStoredAiAnalysisState = useCallback(() => {
    if (!aiAnalysisStorageKey) return { itemAnalysis: null, expired: false };
    try {
      const raw = localStorage.getItem(aiAnalysisStorageKey);
      if (!raw) return { itemAnalysis: null, expired: false };
      const parsed = JSON.parse(raw);
      if (!parsed?.timestamp || !parsed?.itemAnalysis) return { itemAnalysis: null, expired: false };
      const age = Date.now() - parsed.timestamp;
      if (age < AI_RECOMMENDATION_TTL) return { itemAnalysis: parsed.itemAnalysis, expired: false };
      return { itemAnalysis: null, expired: true };
    } catch {
      return { itemAnalysis: null, expired: false };
    }
  }, [aiAnalysisStorageKey, AI_RECOMMENDATION_TTL]);

  const storeAiAnalysisCache = useCallback((analysis) => {
    if (!aiAnalysisStorageKey) return;
    try {
      localStorage.setItem(aiAnalysisStorageKey, JSON.stringify({ timestamp: Date.now(), itemAnalysis: analysis }));
    } catch {}
  }, [aiAnalysisStorageKey]);

  const clearAiAnalysisCache = useCallback(() => {
    if (!aiAnalysisStorageKey) return;
    localStorage.removeItem(aiAnalysisStorageKey);
    setCachedAiAnalysis(null);
  }, [aiAnalysisStorageKey]);

  const loadLeaderboard = useCallback(async (type) => {
    setLbLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/game/leaderboard/${type}`, {
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
      const res = await fetch(`${API_BASE_URL}/api/quiz/my-results`, { headers:{ Authorization:`Bearer ${token}` } });
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

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationsError("");
    try {
      const data = await getStudentNotifications();
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
    } catch (err) {
      setNotificationsError(err.message || "Unable to load notifications.");
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification || notification.read) return;
    try {
      await markNotificationRead(notification.id);
      setNotifications((prev) => prev.map((item) =>
        item.id === notification.id ? { ...item, read: true } : item
      ));
    } catch (err) {
      // ignore; user can still read the notification
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadItemAnalysis = useCallback(async () => {
    setAnalysisLoading(true);
    setAnalysisError("");
    setShowAiExpiredPopup(false);
    try {
      const data = await apiFetch("/api/quiz/analysis");
      const hasRecs = Array.isArray(data?.recommendations) && data.recommendations.length > 0;
      const stored = getStoredAiAnalysisState();

      if (hasRecs) {
        setItemAnalysis(data || null);
        setCachedAiAnalysis(data || null);
        storeAiAnalysisCache(data);
      } else {
        if (stored.itemAnalysis) {
          setCachedAiAnalysis(stored.itemAnalysis);
        } else if (stored.expired) {
          clearAiAnalysisCache();
          setShowAiExpiredPopup(true);
        }
        setItemAnalysis(data || null);
      }
    } catch (err) {
      setAnalysisError(err.message);
      setItemAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  }, [clearAiAnalysisCache, getStoredAiAnalysisState, storeAiAnalysisCache]);

  const displayedAiAnalysis = useMemo(() => {
    if (itemAnalysis?.recommendations?.length) return itemAnalysis;
    return cachedAiAnalysis || itemAnalysis || {};
  }, [cachedAiAnalysis, itemAnalysis]);

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

  useEffect(() => {
    if (studentId && isStudent) {
      loadNotifications();
    }
  }, [studentId, isStudent, loadNotifications]);

  useEffect(() => { loadLeaderboard(lbType); }, [lbType, loadLeaderboard]);

  useEffect(() => {
    if (!studentId || !isStudent) {
      setLoadingQuizzes(false);
      return;
    }
    loadQuizzes();
    loadResults();
    loadAttendance();
    loadItemAnalysis();
  }, [studentId, isStudent, loadQuizzes, loadResults, loadAttendance, loadItemAnalysis]);

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

  const TEACHERS_PER_PAGE = 4;
  const teacherPageCount = Math.max(1, Math.ceil(teachersForOverview.length / TEACHERS_PER_PAGE));
  const pagedTeachers = useMemo(
    () => teachersForOverview.slice(teacherPage * TEACHERS_PER_PAGE, (teacherPage + 1) * TEACHERS_PER_PAGE),
    [teacherPage, teachersForOverview]
  );

  useEffect(() => {
    if (teacherPage >= teacherPageCount) {
      setTeacherPage(0);
    }
  }, [teacherPage, teacherPageCount]);

  const handleRefreshQuizzes = async () => { await loadQuizzes(); await loadResults(); await loadAttendance(); await loadItemAnalysis(); };

  useEffect(() => {
    if (!studentId) return;
    const stored = getStoredAiAnalysisState();
    if (stored.itemAnalysis) {
      setCachedAiAnalysis(stored.itemAnalysis);
    } else if (stored.expired) {
      clearAiAnalysisCache();
      setShowAiExpiredPopup(true);
    }
  }, [studentId, getStoredAiAnalysisState, clearAiAnalysisCache]);

  const handleChangePassword = async (e) => {
    e.preventDefault(); setPwMsg("");
    if (pwForm.next.length < 6) return setPwMsg("New password must be at least 6 characters.");
    if (pwForm.next !== pwForm.confirm) return setPwMsg("Passwords do not match.");
    setPwLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/change-password`, {
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
  const avatarText    = initials(displayName);
  const currentUserId = tokenUser?.id;
  const mySection     = profile?.section || "";
  const myCourse      = profile?.course  || "";
  const completedQuizzes = quizzes.filter(q => !!quizResults[q.id]);
  const completionRate = quizzes.length ? Math.round((completedQuizzes.length / quizzes.length) * 100) : 0;
  const currentPoints = Number(profile?.points || 0);
  const currentTier = [...TIER_DEFINITIONS].reverse().find((tier) => currentPoints >= tier.min) || TIER_DEFINITIONS[0];
  const nextTier = TIER_DEFINITIONS.find((tier) => tier.min > currentTier.min) || null;
  const pointsToNextTier = nextTier ? Math.max(0, nextTier.min - currentPoints) : 0;
  const tierProgress = nextTier ? Math.round(((currentPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100) : 100;
  const levelNumber = Math.max(1, TIER_DEFINITIONS.indexOf(currentTier) + 1);
  const currentReward = currentTier.reward;
  const nextRewardText = nextTier ? `${nextTier.reward} theme at ${nextTier.min.toLocaleString()} XP` : "Max tier reached";
  const currentTierRgb = hexToRgb(currentTier.color);
  const rootStyle = {
    "--tier-primary": currentTier.color,
    "--tier-rgb": currentTierRgb,
  };
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
      <div className="sd-root" style={rootStyle}>
        <div className="deco-ring" />
        <div className="deco-ring deco-ring-2" />

        {/* ── Topbar ── */}
        <header className="sd-topbar">
          <div className="sd-topbar-left">
            <div className="sd-logo">
              <div className="sd-logo-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.87L12 18.07 5.82 22 7 14.14 2 9.27l6.91-1.01z"/>
                </svg>
              </div>
              QuizSystem
            </div>
            <div className="sd-topnav">
              <button className={`sd-topnav-item ${activeView==="overview"?"active":""}`} onClick={()=>setActiveView("overview")}>Overview</button>
              <button className={`sd-topnav-item ${activeView==="settings"?"active":""}`} onClick={()=>setActiveView("settings")}>Settings</button>
            </div>
          </div>
          <div className="sd-topbar-right">
            <button
              className="sd-notification-button"
              onClick={() => {
                setNotificationsOpen((open) => !open);
                if (!notificationsOpen) {
                  loadNotifications();
                }
              }}
              aria-label="Toggle notifications"
            >
              <BellIcon />
              {unreadCount > 0 && <span className="sd-notification-badge">{unreadCount}</span>}
            </button>
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
          {showAiExpiredPopup && (
            <div className="sd-popup-alert">
              <span>⚠️ AI-generated recommendations have expired after 24 hours. New suggestions will appear after fresh quiz activity.</span>
              <button className="sd-popup-close" onClick={() => setShowAiExpiredPopup(false)}>Dismiss</button>
            </div>
          )}

          {notificationsOpen && (
            <div className="sd-notification-panel">
              <div className="sd-notification-panel-header">
                <h4>Teacher messages</h4>
                <button type="button" onClick={() => setNotificationsOpen(false)}>Close</button>
              </div>
              {notificationsError ? (
                <div className="sd-notification-error">{notificationsError}</div>
              ) : null}
              {notificationsLoading ? (
                <div className="sd-notification-empty">Loading messages...</div>
              ) : notifications.length === 0 ? (
                <div className="sd-notification-empty">You have no messages from your teacher yet.</div>
              ) : (
                <div className="sd-notification-panel-list">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`sd-notification-item ${notification.read ? "" : "unread"}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="sd-notification-item-title">
                        <span>{notification.title || "Message from teacher"}</span>
                        <span>{formatTime(notification.createdAt)}</span>
                      </div>
                      <p className="sd-notification-item-message">{notification.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

            {/* ══ OVERVIEW ══ */}
            {activeView === "overview" && (
              <>
              
                <div className="sd-section-subject">
                  <div className="sd-section-card">
                    <h4>Section</h4>
                    <p>{mySection || "No section assigned yet."}</p>
                    <span>📍 Class zone</span>
                  </div>
                  <div className="sd-section-card">
                    <h4>Subject</h4>
                    <p>{myCourse || "No subject info available."}</p>
                    <span>🧠 Learning track</span>
                  </div>
                </div>

                <div className="sd-tier-system glass-card">
                  <div className="sd-tier-header">
                    <div>
                      <div className="sd-welcome-tag">
                        <span className="sd-welcome-tag-dot" /> Tier Path
                      </div>
                      <h2 className="sd-section-title">See every tier and what it takes to unlock the next theme</h2>
                      <p style={{margin:"0.75rem 0 0", color:"rgba(240,220,155,.82)", maxWidth:560}}>
                        Track your current rank, compare every unlocked badge, and watch the dashboard style evolve as you level up.
                      </p>
                    </div>
                    <div className="sd-tier-chip">
                      <TierIcon tier={currentTier} size={22} />
                      {currentTier.label} • {currentPoints.toLocaleString()} XP
                    </div>
                  </div>
                  <div className="sd-tier-row">
                    {TIER_DEFINITIONS.map((tier) => {
                      const isCurrent = tier.id === currentTier.id;
                      const needed = tier.min <= currentPoints ? "Unlocked" : `${Math.max(0, tier.min - currentPoints).toLocaleString()} XP to unlock`;
                      return (
                        <div key={tier.id} className={`sd-tier-card ${isCurrent ? "current" : ""}`}>
                          <h4><TierIcon tier={tier} size={18} /> {tier.label}</h4>
                          <div className="sd-tier-req">{tier.min.toLocaleString()} XP tier threshold</div>
                          <div className="sd-tier-reward">Unlocks: {tier.reward}</div>
                          <p>{isCurrent ? "Current tier. Your dashboard theme is active." : needed}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="glass-card sd-hero-card sd-player-rank-card">
                  <div className="sd-player-rank-title">
                    <div>
                      <h3>Player Rank</h3>
                      <p>See your current tier, XP balance, and how close you are to the next unlock.</p>
                    </div>
                    <div className="sd-tier-chip">
                      <TierIcon tier={currentTier} size={22} />
                      {currentTier.label} • {currentPoints.toLocaleString()} XP
                    </div>
                  </div>
                  <div className="sd-player-rank-body">
                    <div className="sd-player-rank-summary">
                      <div className="rank-info">
                        <TierIcon tier={currentTier} size={30} />
                        <div>
                          <strong>{currentTier.label}</strong>
                          <div style={{color:"rgba(200,170,100,.7)", marginTop:"0.2rem"}}>{currentPoints.toLocaleString()} XP</div>
                        </div>
                      </div>
                      <div className="sd-tier-chip">Level {levelNumber}</div>
                    </div>
                    <div className="sd-progress-meter">
                      <div className="sd-progress-bar" style={{width:`${tierProgress}%`}} />
                    </div>
                    <p style={{marginTop:"0.85rem",color:"rgba(240,220,155,.65)"}}>
                      {nextTier ? `${pointsToNextTier.toLocaleString()} XP to reach ${nextTier.label}` : "You have reached the highest tier!"}
                    </p>
                    <div className="sd-reward-note">
                      <span>Reward unlocked: <strong>{currentReward}</strong></span>
                      <span className="sd-reward-pill">Next theme: {nextRewardText}</span>
                    </div>
                  </div>
                </div>
                <div className="sd-hero-grid">
                  <div className="glass-card sd-hero-card">
                    <h3>Daily Quest</h3>
                    <p>{completedQuizzes.length > 0 ? "Great work — keep stacking streaks and bonus points today." : "Start your first quiz quest to unlock your progress streak."}</p>
                    <div className="sd-quest-banner">
                      <span>🎯</span>
                      <span>{completedQuizzes.length > 0 ? "Momentum is on your side. Keep going!" : "Take your first quiz to begin your journey."}</span>
                    </div>
                  </div>
                  <div className="glass-card sd-hero-card">
                    <h3>Achievement Hub</h3>
                    <p>Earn badges for streaks, top scores, and on-time quiz completion.</p>
                    <div style={{display:"flex",gap:"0.65rem",flexWrap:"wrap",marginTop:"1rem"}}>
                      <span className="sd-quest-pill">🔥 {profile?.streak??0}-day streak</span>
                      <span className="sd-quest-pill">🏆 {completedQuizzes.length} completed quests</span>
                      <span className="sd-quest-pill">🌟 {completionRate}% completion</span>
                    </div>
                  </div>
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
                    <div className="sd-teacher-header">
                      <div className="sd-teacher-label">
                        <span className="sd-teacher-label-dot" /> Your Teachers &amp; subjects
                      </div>
                      {teacherPageCount > 1 && (
                        <div className="sd-teacher-pagination">
                          <button
                            className="sd-teacher-page-btn"
                            disabled={teacherPage === 0}
                            onClick={() => setTeacherPage((page) => Math.max(0, page - 1))}
                          >
                            Prev
                          </button>
                          <span>{teacherPage + 1} / {teacherPageCount}</span>
                          <button
                            className="sd-teacher-page-btn"
                            disabled={teacherPage + 1 >= teacherPageCount}
                            onClick={() => setTeacherPage((page) => Math.min(teacherPageCount - 1, page + 1))}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                    {pagedTeachers.map((t) => {
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

                <div className="glass-card sd-stat" style={{ gridColumn: "1 / -1", animation: "floatUp .5s .15s ease both" }}>
                  <p className="sd-stat-label">AI Study Recommendations</p>
                  {analysisLoading ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(200,170,100,.65)", padding: "1.2rem 0" }}>
                      <span className="sd-spinner" /> Analyzing your weak quiz areas…
                    </div>
                  ) : analysisError ? (
                    <div className="sd-error">⚠ {analysisError}</div>
                  ) : displayedAiAnalysis?.recommendations?.length ? (
                    <div style={{ display: "grid", gap: ".95rem" }}>
                      <p style={{ color: "rgba(200,170,100,.55)", fontSize: ".82rem", margin: 0 }}>
                        {displayedAiAnalysis?.weakItems?.length
                          ? `Found ${displayedAiAnalysis.weakItems.length} weak quiz item${displayedAiAnalysis.weakItems.length === 1 ? "" : "s"}. Review these recommended topics.`
                          : "Study recommendations from your lecture materials."}
                      </p>
                      {(displayedAiAnalysis?.recommendations || []).map((rec, idx) => (
                        <div key={idx} style={{ padding: "1rem", borderRadius: 14, background: "rgba(255,255,255,.04)", border: "1px solid rgba(200,160,50,.12)" }}>
                          <div style={{ fontWeight: 600, color: "#f5e6c8", marginBottom: ".35rem" }}>{rec.topic}</div>
                          <div style={{ fontSize: ".85rem", color: "rgba(200,170,100,.78)", lineHeight: 1.65 }}>{rec.reason}</div>
                        </div>
                      ))}
                      {displayedAiAnalysis?.analysisNote && (
                        <div style={{ color: "rgba(200,170,100,.55)", fontSize: ".8rem" }}>
                          {displayedAiAnalysis.analysisNote}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: ".75rem", color: "rgba(200,170,100,.55)", fontSize: ".9rem", padding: "1rem 0" }}>
                      {displayedAiAnalysis?.analysisNote ? (
                        <div>{displayedAiAnalysis.analysisNote}</div>
                      ) : (
                        <div>{displayedAiAnalysis?.message || itemAnalysis?.message || "No study suggestions available yet. Complete more quizzes to generate personalized recommendations."}</div>
                      )}
                    </div>
                  )}
                </div>

                <hr className="sd-divider" />

                {/* Quizzes */}
                <div style={{marginBottom:"1.75rem",animation:"floatUp .5s .15s ease both"}}>
                  <div className="sd-section-heading">
                    <h2 className="sd-section-title">My Quests</h2>
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
                                  {isActive ? "● Live Now" : quiz.status==="upcoming" ? "⏰ Upcoming" : "🏁 Completed"}
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
                                {isActive ? "Start Quest →" : quiz.status==="upcoming" ? "Locked" : "Closed"}
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
                      <h2 className="sd-section-title">Hall of Fame</h2>
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
                            <div style={{display:"inline-flex",alignItems:"center",gap:".3rem",justifyContent:"flex-end"}}>
                              <TierIcon tier={findTierByLabel(u.tier)} size={16} />
                              <span className="sd-lb-tier">{findTierByLabel(u.tier).label}</span>
                            </div>
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
    </>
  );
}