import { useState, useEffect, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #2a0a0f;
    --panel: #3d1018;
    --border: #5c1f2a;
    --text: #fff8f0;
    --muted: #b87a80;
    --input-bg: #330d14;
    --mustard: #d4a017;
    --mustard-soft: rgba(212,160,23,0.12);
    --mustard-glow: rgba(212,160,23,0.25);
    --sidebar-w: 260px;
  }

  html, body, #root { height: 100%; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    overflow: hidden;
  }

  .lb-layout {
    display: flex;
    height: 100vh;
    background: var(--bg);
    background-image:
      repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(212,160,23,0.025) 60px, rgba(212,160,23,0.025) 61px),
      repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(212,160,23,0.025) 60px, rgba(212,160,23,0.025) 61px);
    overflow: hidden;
  }

  /* SIDEBAR */
  .lb-sidebar {
    width: var(--sidebar-w);
    height: 100vh;
    background: var(--panel);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 36px 0;
    position: fixed;
    top: 0; left: 0;
    z-index: 50;
    overflow-y: auto;
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    animation: slideInLeft 0.5s ease both;
  }

  .lb-sidebar::after {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 1px; height: 100%;
    background: linear-gradient(to bottom, transparent, var(--mustard), transparent);
    opacity: 0.4;
    pointer-events: none;
  }

  .lb-sidebar.open { transform: translateX(0) !important; }

  .sb-brand {
    display: flex; align-items: center; gap: 11px;
    padding: 0 28px 28px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .sb-logo {
    width: 34px; height: 34px;
    background: var(--mustard);
    border-radius: 8px;
    display: grid; place-items: center;
    flex-shrink: 0;
  }

  .sb-logo svg { width: 18px; height: 18px; fill: #2a0a0f; }
  .sb-brand-name { font-family: 'Playfair Display', serif; font-size: 1.2rem; letter-spacing: -0.02em; color: var(--text); }

  .sb-nav { padding: 20px 16px 0; flex: 1; }

  .sb-label {
    font-size: 0.65rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--muted); padding: 0 12px;
    margin-bottom: 8px; opacity: 0.7;
    display: block;
  }

  .sb-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 10px;
    cursor: pointer; color: var(--muted);
    font-size: 0.87rem; font-weight: 400;
    text-decoration: none;
    transition: all 0.2s; margin-bottom: 2px;
    position: relative;
    background: transparent;
    border: none;
    width: 100%;
    font-family: 'DM Sans', sans-serif;
    text-align: left;
  }

  .sb-item svg { width: 17px; height: 17px; flex-shrink: 0; }
  .sb-item:hover { background: var(--mustard-soft); color: var(--text); }

  .sb-item.active {
    background: var(--mustard-soft);
    color: var(--mustard); font-weight: 500;
  }

  .sb-item.active::before {
    content: '';
    position: absolute;
    left: 0; top: 20%; bottom: 20%;
    width: 3px; background: var(--mustard);
    border-radius: 0 2px 2px 0;
  }

  .sb-badge {
    margin-left: auto;
    background: var(--mustard); color: #2a0a0f;
    font-size: 0.62rem; font-weight: 700;
    padding: 2px 7px; border-radius: 20px;
  }

  .sb-footer {
    padding: 16px 16px 0;
    border-top: 1px solid var(--border);
    margin: 0 12px; flex-shrink: 0;
  }

  .sb-user {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    cursor: pointer; transition: background 0.2s;
  }

  .sb-user:hover { background: var(--mustard-soft); }

  .sb-avatar {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, var(--mustard), #8b5a0a);
    border-radius: 50%;
    display: grid; place-items: center;
    font-family: 'Playfair Display', serif;
    font-size: 0.9rem; color: #2a0a0f;
    font-weight: 700; flex-shrink: 0;
  }

  .sb-user-info { flex: 1; min-width: 0; }
  .sb-user-name { font-size: 0.85rem; font-weight: 500; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sb-user-role { font-size: 0.7rem; color: var(--mustard); }

  .sb-logout {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 10px 12px; margin-top: 6px;
    border-radius: 10px; border: none;
    background: transparent; color: #ff8a80;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.87rem; font-weight: 400;
    cursor: pointer; transition: background 0.2s, color 0.2s; text-align: left;
  }

  .sb-logout:hover { background: rgba(255,138,128,0.1); color: #ff6b6b; }
  .sb-logout svg { width: 17px; height: 17px; flex-shrink: 0; }

  /* MAIN */
  .lb-main {
    margin-left: var(--sidebar-w);
    flex: 1; padding: 36px 44px;
    overflow-y: scroll; height: 100vh;
  }

  .lb-main::-webkit-scrollbar { width: 5px; }
  .lb-main::-webkit-scrollbar-track { background: transparent; }
  .lb-main::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* TOPBAR */
  .lb-topbar {
    display: flex; align-items: center;
    justify-content: space-between;
    margin-bottom: 36px;
    animation: fadeUp 0.5s 0.1s ease both;
  }

  .topbar-l { display: flex; align-items: center; gap: 12px; }

  .greeting-sub {
    font-size: 0.75rem; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--mustard);
    font-weight: 500; margin-bottom: 5px;
  }

  .greeting-main {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.5rem, 2.5vw, 2.2rem);
    line-height: 1.1; letter-spacing: -0.03em;
    color: var(--text);
  }

  .greeting-main span { color: var(--mustard); }

  .topbar-r { display: flex; align-items: center; gap: 12px; }

  .icon-btn {
    width: 40px; height: 40px;
    background: var(--panel); border: 1px solid var(--border);
    border-radius: 10px; display: grid; place-items: center;
    cursor: pointer; transition: all 0.2s; color: var(--muted);
  }

  .icon-btn:hover { border-color: var(--mustard); color: var(--mustard); }
  .icon-btn svg { width: 18px; height: 18px; }

  .date-chip {
    padding: 8px 16px; background: var(--panel);
    border: 1px solid var(--border); border-radius: 10px;
    font-size: 0.75rem; color: var(--muted); letter-spacing: 0.04em;
  }

  /* PODIUM */
  .podium-section {
    animation: fadeUp 0.5s 0.15s ease both;
    margin-bottom: 32px;
  }

  .podium-hdr {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 24px;
  }

  .podium-hdr h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem; letter-spacing: -0.02em; color: var(--text);
  }

  .filters { display: flex; align-items: center; gap: 8px; }

  .filter-btn {
    padding: 6px 14px; border-radius: 20px;
    font-size: 0.72rem; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
    border: 1px solid var(--border);
    background: transparent; color: var(--muted);
    font-family: 'DM Sans', sans-serif;
  }

  .filter-btn.active {
    background: var(--mustard-soft);
    border-color: rgba(212,160,23,0.4);
    color: var(--mustard);
  }

  .filter-btn:hover:not(.active) { border-color: rgba(212,160,23,0.3); color: var(--text); }

  .podium-wrap {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 16px;
    padding: 0 40px 0;
  }

  .podium-player {
    display: flex; flex-direction: column; align-items: center;
    position: relative; cursor: pointer;
    transition: transform 0.25s;
  }

  .podium-player:hover { transform: translateY(-4px); }

  .podium-crown {
    font-size: 1.4rem;
    position: absolute;
    top: -28px;
    animation: floatCrown 3s ease-in-out infinite;
  }

  .podium-av-wrap { position: relative; margin-bottom: 10px; }

  .podium-av {
    border-radius: 50%;
    display: grid; place-items: center;
    font-family: 'Playfair Display', serif;
    font-weight: 700; flex-shrink: 0;
    border: 3px solid transparent;
    position: relative; z-index: 1;
  }

  .podium-av.r1 {
    width: 72px; height: 72px; font-size: 1.5rem;
    background: linear-gradient(135deg,#d4a017,#8b5a0a); color:#2a0a0f;
    border-color: var(--mustard);
    box-shadow: 0 0 30px rgba(212,160,23,0.5), 0 0 60px rgba(212,160,23,0.2);
  }

  .podium-av.r2 {
    width: 58px; height: 58px; font-size: 1.2rem;
    background: linear-gradient(135deg,#c0c0c0,#888); color:#2a0a0f;
    border-color: #c0c0c0;
    box-shadow: 0 0 20px rgba(192,192,192,0.3);
  }

  .podium-av.r3 {
    width: 52px; height: 52px; font-size: 1rem;
    background: linear-gradient(135deg,#cd7f32,#7a4a1a); color:#fff8f0;
    border-color: #cd7f32;
    box-shadow: 0 0 16px rgba(205,127,50,0.3);
  }

  .podium-name {
    font-size: 0.8rem; font-weight: 500; color: var(--text);
    text-align: center; margin-bottom: 2px;
    max-width: 90px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .podium-sub { font-size: 0.65rem; color: var(--muted); text-align: center; margin-bottom: 8px; }

  .podium-xp {
    font-family: 'Playfair Display', serif;
    font-size: 0.88rem; color: var(--mustard);
    text-align: center;
  }

  .podium-block {
    border-radius: 10px 10px 0 0;
    width: 100%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem; font-weight: 700;
    margin-top: 10px;
  }

  .podium-player.p1 { min-width: 120px; }
  .podium-player.p2, .podium-player.p3 { min-width: 100px; }

  .podium-block.b1 {
    height: 90px;
    background: linear-gradient(to top,rgba(212,160,23,0.25),rgba(212,160,23,0.1));
    border: 1px solid rgba(212,160,23,0.4); color: var(--mustard);
  }

  .podium-block.b2 {
    height: 66px;
    background: linear-gradient(to top,rgba(192,192,192,0.15),rgba(192,192,192,0.05));
    border: 1px solid rgba(192,192,192,0.25); color: #c0c0c0;
  }

  .podium-block.b3 {
    height: 50px;
    background: linear-gradient(to top,rgba(205,127,50,0.15),rgba(205,127,50,0.05));
    border: 1px solid rgba(205,127,50,0.25); color: #cd7f32;
  }

  /* LB SECTION */
  .lb-section {
    display: grid; grid-template-columns: 1.6fr 1fr;
    gap: 16px; margin-bottom: 28px;
    animation: fadeUp 0.5s 0.2s ease both;
  }

  .panel-card {
    background: var(--panel); border: 1px solid var(--border);
    border-radius: 18px; overflow: hidden;
  }

  .panel-inner { padding: 24px 26px; }

  .sec-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
  .sec-title { font-family: 'Playfair Display', serif; font-size: 1rem; letter-spacing: -0.02em; color: var(--text); }
  .sec-link { font-size: 0.72rem; color: var(--mustard); text-decoration: none; opacity: 0.8; }
  .sec-link:hover { opacity: 1; }

  .search-bar {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 14px;
    background: var(--input-bg); border: 1px solid var(--border);
    border-radius: 10px; margin-bottom: 16px;
    transition: border-color 0.2s;
  }

  .search-bar:focus-within { border-color: var(--mustard); }
  .search-bar svg { width: 15px; height: 15px; color: var(--muted); flex-shrink: 0; }

  .search-bar input {
    background: none; border: none; outline: none;
    color: var(--text); font-family: 'DM Sans', sans-serif;
    font-size: 0.83rem; flex: 1;
  }

  .search-bar input::placeholder { color: var(--muted); }

  .lb-row {
    display: grid;
    grid-template-columns: 28px 36px 1fr 80px 60px 50px;
    align-items: center; gap: 12px;
    padding: 10px 8px; border-radius: 10px;
    transition: background 0.15s; cursor: pointer;
    border-bottom: 1px solid rgba(92,31,42,0.3);
    margin: 0 -8px;
  }

  .lb-row:last-child { border-bottom: none; }
  .lb-row:hover { background: var(--mustard-soft); }

  .lb-rank {
    font-family: 'Playfair Display', serif;
    font-size: 0.85rem; text-align: center; color: var(--muted);
  }

  .lb-rank.gold   { color: var(--mustard); }
  .lb-rank.silver { color: #c0c0c0; }
  .lb-rank.bronze { color: #cd7f32; }

  .lb-av {
    width: 32px; height: 32px; border-radius: 50%;
    display: grid; place-items: center;
    font-size: 0.75rem; font-weight: 700;
    font-family: 'Playfair Display', serif; flex-shrink: 0;
  }

  .lb-name .n { font-size: 0.83rem; font-weight: 500; color: var(--text); }
  .lb-name .s { font-size: 0.67rem; color: var(--muted); }

  .lb-bar-col { display: flex; flex-direction: column; gap: 3px; }
  .lb-bar-track { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; width: 100%; }
  .lb-bar-fill { height: 100%; border-radius: 2px; background: linear-gradient(to right, var(--mustard), #f0c040); }
  .lb-bar-pct { font-size: 0.62rem; color: var(--muted); }

  .lb-score { font-family: 'Playfair Display', serif; font-size: 0.9rem; color: var(--mustard); text-align: right; }

  .lb-badge {
    font-size: 0.6rem; padding: 2px 7px; border-radius: 20px;
    font-weight: 600; letter-spacing: 0.04em; text-align: center; white-space: nowrap;
  }

  .badge-up   { background: rgba(168,230,163,0.1); color: #a8e6a3; }
  .badge-down { background: rgba(255,138,128,0.1); color: #ff8a80; }
  .badge-same { background: var(--mustard-soft); color: var(--mustard); }

  /* SIDE STATS */
  .side-stats { display: flex; flex-direction: column; gap: 14px; padding: 24px; }

  .trophy-card {
    background: var(--input-bg); border: 1px solid var(--border);
    border-radius: 14px; padding: 20px;
    text-align: center; position: relative; overflow: hidden;
    transition: border-color 0.25s;
  }

  .trophy-card:hover { border-color: rgba(212,160,23,0.4); }

  .trophy-card::before {
    content: '';
    position: absolute; top: 0; left: 20%; right: 20%; height: 1px;
    background: linear-gradient(to right, transparent, var(--mustard), transparent);
    opacity: 0.4;
  }

  .trophy-emoji { font-size: 2rem; margin-bottom: 8px; }
  .trophy-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 4px; }
  .trophy-name { font-family: 'Playfair Display', serif; font-size: 1rem; margin-bottom: 2px; color: var(--text); }
  .trophy-sub { font-size: 0.7rem; color: var(--mustard); }

  .mini-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  .mini-stat {
    background: var(--input-bg); border: 1px solid var(--border);
    border-radius: 12px; padding: 14px; text-align: center;
    transition: border-color 0.2s;
  }

  .mini-stat:hover { border-color: rgba(212,160,23,0.35); }
  .mini-num { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: var(--mustard); }
  .mini-lbl { font-size: 0.63rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }

  .subj-row {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 0; border-bottom: 1px solid rgba(92,31,42,0.4);
  }

  .subj-row:last-child { border-bottom: none; }

  .subj-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .subj-name-t { flex: 1; font-size: 0.8rem; color: var(--text); }
  .subj-bar-w { width: 60px; }
  .subj-bar-t { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .subj-bar-f { height: 100%; border-radius: 2px; }
  .subj-pct { font-size: 0.72rem; color: var(--mustard); font-family: 'Playfair Display', serif; width: 34px; text-align: right; }

  /* BOTTOM */
  .bottom-row {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 16px;
    animation: fadeUp 0.5s 0.25s ease both;
  }

  .sec-card {
    background: var(--panel); border: 1px solid var(--border);
    border-radius: 18px; padding: 24px;
  }

  .chart-wrap { position: relative; height: 130px; margin-top: 12px; }

  .activity-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 10px 0; border-bottom: 1px solid rgba(92,31,42,0.35);
  }

  .activity-item:last-child { border-bottom: none; }

  .act-dot-w { padding-top: 4px; }
  .act-dot { width: 8px; height: 8px; border-radius: 50%; }

  .act-text { flex: 1; }
  .a-main { font-size: 0.81rem; font-weight: 500; color: var(--text); }
  .a-sub { font-size: 0.68rem; color: var(--muted); margin-top: 1px; }

  .act-xp { font-family: 'Playfair Display', serif; font-size: 0.82rem; color: var(--mustard); white-space: nowrap; }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    z-index: 200; display: flex;
    align-items: center; justify-content: center;
    opacity: 0; pointer-events: none;
    transition: opacity 0.25s ease;
  }

  .modal-overlay.show { opacity: 1; pointer-events: all; }

  .modal-box {
    background: var(--panel); border: 1px solid var(--border);
    border-radius: 20px; padding: 36px 32px;
    width: 100%; max-width: 360px; text-align: center;
    position: relative;
    transform: scale(0.92) translateY(12px);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
  }

  .modal-overlay.show .modal-box { transform: scale(1) translateY(0); }

  .modal-box::before {
    content: ''; position: absolute; top: 0; left: 20%; right: 20%; height: 1px;
    background: linear-gradient(to right, transparent, var(--mustard), transparent);
    opacity: 0.4;
  }

  .modal-icon {
    width: 56px; height: 56px;
    background: rgba(255,138,128,0.12);
    border: 1px solid rgba(255,138,128,0.25);
    border-radius: 50%; display: grid; place-items: center;
    margin: 0 auto 20px; color: #ff8a80;
  }

  .modal-icon svg { width: 24px; height: 24px; }
  .modal-title { font-size: 1.3rem; font-weight: 600; margin-bottom: 10px; color: var(--text); }
  .modal-desc { font-size: 0.83rem; color: var(--muted); line-height: 1.6; margin-bottom: 28px; }
  .modal-actions { display: flex; gap: 12px; }

  .modal-cancel {
    flex: 1; padding: 12px;
    background: var(--input-bg); border: 1px solid var(--border);
    border-radius: 10px; color: var(--text);
    font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 500;
    cursor: pointer; transition: border-color 0.2s, background 0.2s;
  }

  .modal-cancel:hover { border-color: var(--mustard); background: var(--mustard-soft); }

  .modal-confirm {
    flex: 1; padding: 12px; background: #ff8a80; border: none;
    border-radius: 10px; color: #2a0a0f;
    font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 700;
    cursor: pointer; transition: background 0.2s, transform 0.2s;
  }

  .modal-confirm:hover { background: #ff6b6b; transform: translateY(-1px); }

  /* HAMBURGER */
  .hamburger {
    display: none; width: 40px; height: 40px;
    background: var(--panel); border: 1px solid var(--border);
    border-radius: 10px; align-items: center; justify-content: center;
    cursor: pointer; color: var(--muted); flex-shrink: 0;
    transition: border-color 0.2s, color 0.2s;
  }

  .hamburger:hover { border-color: var(--mustard); color: var(--mustard); }
  .hamburger svg { width: 18px; height: 18px; }

  .sb-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.55); backdrop-filter: blur(2px);
    z-index: 40; opacity: 0; transition: opacity 0.3s ease;
  }

  .sb-overlay.show { opacity: 1; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideInLeft {
    from { transform: translateX(-30px); opacity: 0; }
    to   { transform: translateX(0); opacity: 1; }
  }

  @keyframes floatCrown {
    0%,100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  @media (max-width: 1280px) {
    .lb-section { grid-template-columns: 1fr; }
    .bottom-row { grid-template-columns: 1fr; }
  }

  @media (max-width: 768px) {
    .hamburger { display: flex; }
    .lb-sidebar { transform: translateX(-100%); animation: none; }
    .sb-overlay { display: block; pointer-events: all; }
    .lb-main { margin-left: 0; padding: 20px 16px; }
    .date-chip { display: none; }
    .podium-wrap { padding: 0 10px; gap: 8px; }
    .podium-player.p1 { min-width: 90px; }
    .podium-player.p2, .podium-player.p3 { min-width: 75px; }
  }

  @media (max-width: 480px) {
    .lb-main { padding: 16px 12px; }
    .lb-row { grid-template-columns: 24px 30px 1fr 50px 44px; }
    .lb-bar-col { display: none; }
  }
`;

// ── DATA ──
const ALL_STUDENTS = [
  { rank:1,  init:'S', name:'Sofia Chen',      subject:'Science', xp:1240, pct:100, change:'up',   av:'linear-gradient(135deg,#d4a017,#8b5a0a)', avColor:'#2a0a0f' },
  { rank:2,  init:'M', name:'Marcus Lee',      subject:'Math',    xp:1090, pct:88,  change:'up',   av:'linear-gradient(135deg,#c0c0c0,#888)',     avColor:'#2a0a0f' },
  { rank:3,  init:'J', name:'Jamie Park',      subject:'English', xp:955,  pct:77,  change:'same', av:'linear-gradient(135deg,#cd7f32,#7a4a1a)',  avColor:'#fff8f0' },
  { rank:4,  init:'R', name:'Riley Torres',    subject:'History', xp:891,  pct:72,  change:'down', av:'#5c1f2a',                                  avColor:'#b87a80' },
  { rank:5,  init:'L', name:'Lei Cordial',     subject:'All',     xp:847,  pct:68,  change:'up',   av:'linear-gradient(135deg,#d4a017,#8b5a0a)', avColor:'#2a0a0f' },
  { rank:6,  init:'A', name:'Anika Reyes',     subject:'Math',    xp:810,  pct:65,  change:'up',   av:'linear-gradient(135deg,#a78bfa,#6d28d9)',  avColor:'#fff8f0' },
  { rank:7,  init:'D', name:'Diego Santos',    subject:'Science', xp:775,  pct:63,  change:'down', av:'linear-gradient(135deg,#6ee7b7,#059669)',  avColor:'#2a0a0f' },
  { rank:8,  init:'N', name:'Nina Villanueva', subject:'English', xp:740,  pct:60,  change:'same', av:'linear-gradient(135deg,#fca5a5,#dc2626)',  avColor:'#2a0a0f' },
  { rank:9,  init:'K', name:'Kai Matsumoto',   subject:'History', xp:700,  pct:57,  change:'up',   av:'linear-gradient(135deg,#fcd34d,#b45309)',  avColor:'#2a0a0f' },
  { rank:10, init:'P', name:'Priya Nakamura',  subject:'Math',    xp:665,  pct:54,  change:'down', av:'#5c1f2a',                                  avColor:'#b87a80' },
];

const SUBJECTS = [
  { name:'Mathematics', color:'#a78bfa', pct:91 },
  { name:'Science',     color:'#6ee7b7', pct:78 },
  { name:'English',     color:'#fca5a5', pct:88 },
  { name:'History',     color:'#fcd34d', pct:80 },
];

const ACTIVITIES = [
  { dot:'#a8e6a3', main:'Sofia Chen completed Algebra Quiz',    sub:'Mathematics · 2 hours ago · Score: 98%', xp:'+120 XP' },
  { dot:'#d4a017', main:'Marcus Lee completed Algebra Quiz',    sub:'Mathematics · 3 hours ago · Score: 91%', xp:'+105 XP' },
  { dot:'#fca5a5', main:'Jamie Park submitted Literary Essay',  sub:'English · 5 hours ago · Score: 87%',     xp:'+95 XP'  },
  { dot:'#c0c0c0', main:'Riley Torres reviewed History Notes',  sub:'History · 6 hours ago · Activity logged', xp:'+30 XP' },
  { dot:'#6ee7b7', main:'Lei Cordial watched Science Lecture',  sub:'Science · 8 hours ago · Completed module', xp:'+50 XP'},
];

const CHART_SERIES = [
  { data:[820,880,960,1020,1100,1240], color:'#d4a017', label:'Sofia'  },
  { data:[700,780,860,920,980,1090],   color:'#c0c0c0', label:'Marcus' },
  { data:[600,660,720,790,860,955],    color:'#cd7f32', label:'Jamie'  },
];

const WEEKS = ['W3','W4','W5','W6','W7','W8'];

// ── HELPERS ──
function rankClass(r) {
  if (r === 1) return 'gold';
  if (r === 2) return 'silver';
  if (r === 3) return 'bronze';
  return '';
}

function Badge({ change }) {
  if (change === 'up')   return <span className="lb-badge badge-up">▲ Up</span>;
  if (change === 'down') return <span className="lb-badge badge-down">▼ Down</span>;
  return <span className="lb-badge badge-same">— Same</span>;
}

// ── XP CHART ──
function XPChart() {
  const W = 460, H = 130, pad = { t:10, b:20, l:10, r:10 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;
  const allVals = CHART_SERIES.flatMap(s => s.data);
  const minV = Math.min(...allVals) * 0.95;
  const maxV = Math.max(...allVals) * 1.02;
  const weeks = CHART_SERIES[0].data.length;
  const cx = i => pad.l + (i / (weeks - 1)) * iW;
  const cy = v => pad.t + iH - ((v - minV) / (maxV - minV)) * iH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width:'100%', height:'100%', overflow:'visible' }}>
      {/* Grid lines */}
      {[0.25,0.5,0.75,1].map(p => (
        <line key={p}
          x1={pad.l} x2={W - pad.r}
          y1={pad.t + iH * (1-p)} y2={pad.t + iH * (1-p)}
          stroke="rgba(92,31,42,0.4)" strokeWidth="1"
        />
      ))}
      {/* Series */}
      {CHART_SERIES.map(s => {
        const areaD = `M${cx(0)},${cy(s.data[0])} ${s.data.map((v,i) => `L${cx(i)},${cy(v)}`).join(' ')} L${cx(weeks-1)},${pad.t+iH} L${cx(0)},${pad.t+iH} Z`;
        const lineD = `M${cx(0)},${cy(s.data[0])} ${s.data.map((v,i) => `L${cx(i)},${cy(v)}`).join(' ')}`;
        return (
          <g key={s.label}>
            <path d={areaD} fill={s.color} fillOpacity="0.06" />
            <path d={lineD} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={cx(weeks-1)} cy={cy(s.data[weeks-1])} r="4" fill={s.color} />
          </g>
        );
      })}
      {/* Week labels */}
      {WEEKS.map((w, i) => (
        <text key={w} x={cx(i)} y={H - 4} textAnchor="middle" fill="#b87a80" fontSize="9" fontFamily="DM Sans, sans-serif">{w}</text>
      ))}
    </svg>
  );
}

// ── NAV ITEMS ──
const NAV_ITEMS = [
  { label:'Dashboard', active:false, icon:(
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )},
  { label:'My Classes', active:false, icon:(
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  )},
  { label:'Lectures', active:false, icon:(
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )},
  { label:'Manage Quizzes', active:false, badge:'3', icon:(
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>
    </svg>
  )},
  { label:'Leaderboard', active:true, icon:(
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 20V10M12 20V4M6 20v-6"/>
    </svg>
  )},
  { label:'Grades & Reports', active:false, icon:(
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )},
];

// ── MAIN COMPONENT ──
export default function Leaderboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Subjects');
  const [search, setSearch] = useState('');

  const filteredStudents = ALL_STUDENTS.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.subject.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'All Subjects' || s.subject === activeFilter;
    return matchSearch && matchFilter;
  });

  const toggleSidebar = () => setSidebarOpen(v => !v);

  return (
    <>
      <style>{styles}</style>
      <div className="lb-layout">

        {/* SIDEBAR */}
        <aside className={`lb-sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="sb-brand">
            <div className="sb-logo">
              <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <span className="sb-brand-name">Aether</span>
          </div>

          <nav className="sb-nav">
            <span className="sb-label">Main</span>
            {NAV_ITEMS.map(item => (
              <a key={item.label} className={`sb-item${item.active ? ' active' : ''}`} href="#">
                {item.icon}
                {item.label}
                {item.badge && <span className="sb-badge">{item.badge}</span>}
              </a>
            ))}

            <span className="sb-label" style={{ marginTop:'20px' }}>Account</span>
            <a className="sb-item" href="#">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Profile
            </a>
            <a className="sb-item" href="#">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
              </svg>
              Settings
            </a>
          </nav>

          <div className="sb-footer">
            <div className="sb-user">
              <div className="sb-avatar">F</div>
              <div className="sb-user-info">
                <div className="sb-user-name">Mr. Francis Patalen</div>
                <div className="sb-user-role">✦ Teacher</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color:'var(--muted)' }}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
            <button className="sb-logout" onClick={() => setShowLogout(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Log Out
            </button>
          </div>
        </aside>

        {/* SIDEBAR OVERLAY */}
        <div className={`sb-overlay${sidebarOpen ? ' show' : ''}`} onClick={toggleSidebar} />

        {/* MAIN */}
        <main className="lb-main">

          {/* TOPBAR */}
          <div className="lb-topbar">
            <div className="topbar-l">
              <button className="hamburger" onClick={toggleSidebar} aria-label="Open menu">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <div>
                <div className="greeting-sub">✦ Monday, March 02, 2026</div>
                <h1 className="greeting-main">Class <span>Leaderboard.</span></h1>
              </div>
            </div>
            <div className="topbar-r">
              <div className="date-chip">Semester 2 · Week 8</div>
              <button className="icon-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
              </button>
              <div className="sb-avatar" style={{ width:38, height:38, fontSize:'0.85rem' }}>F</div>
            </div>
          </div>

          {/* PODIUM */}
          <div className="podium-section">
            <div className="podium-hdr">
              <h2>Top Performers — Grade 10 · Section A</h2>
              <div className="filters">
                {['All Subjects','Math','Science','English'].map(f => (
                  <button
                    key={f}
                    className={`filter-btn${activeFilter === f ? ' active' : ''}`}
                    onClick={() => setActiveFilter(f)}
                  >{f}</button>
                ))}
              </div>
            </div>

            <div className="podium-wrap">
              {/* 2nd */}
              <div className="podium-player p2">
                <div className="podium-crown">🥈</div>
                <div className="podium-av-wrap"><div className="podium-av r2">M</div></div>
                <div className="podium-name">Marcus Lee</div>
                <div className="podium-sub">Math · Sec A</div>
                <div className="podium-xp">1,090 XP</div>
                <div className="podium-block b2">2</div>
              </div>
              {/* 1st */}
              <div className="podium-player p1">
                <div className="podium-crown">👑</div>
                <div className="podium-av-wrap"><div className="podium-av r1">S</div></div>
                <div className="podium-name">Sofia Chen</div>
                <div className="podium-sub">Science · Sec A</div>
                <div className="podium-xp">1,240 XP</div>
                <div className="podium-block b1">1</div>
              </div>
              {/* 3rd */}
              <div className="podium-player p3">
                <div className="podium-crown">🥉</div>
                <div className="podium-av-wrap"><div className="podium-av r3">J</div></div>
                <div className="podium-name">Jamie Park</div>
                <div className="podium-sub">English · Sec A</div>
                <div className="podium-xp">955 XP</div>
                <div className="podium-block b3">3</div>
              </div>
            </div>
          </div>

          {/* LEADERBOARD + SIDE STATS */}
          <div className="lb-section">

            {/* Full Rankings */}
            <div className="panel-card">
              <div className="panel-inner">
                <div className="sec-hdr">
                  <h2 className="sec-title">Full Rankings</h2>
                  <a href="#" className="sec-link">Export CSV →</a>
                </div>
                <div className="search-bar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                <div>
                  {filteredStudents.map(s => (
                    <div className="lb-row" key={s.rank}>
                      <div className={`lb-rank ${rankClass(s.rank)}`}>{s.rank}</div>
                      <div className="lb-av" style={{ background: s.av, color: s.avColor }}>{s.init}</div>
                      <div className="lb-name">
                        <div className="n">{s.name}</div>
                        <div className="s">{s.subject}</div>
                      </div>
                      <div className="lb-bar-col">
                        <div className="lb-bar-track"><div className="lb-bar-fill" style={{ width:`${s.pct}%` }} /></div>
                        <div className="lb-bar-pct">{s.pct}%</div>
                      </div>
                      <div className="lb-score">{s.xp.toLocaleString()}</div>
                      <Badge change={s.change} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="panel-card">
              <div className="side-stats">
                <div className="sec-hdr">
                  <h2 className="sec-title">Insights</h2>
                </div>
                <div className="trophy-card">
                  <div className="trophy-emoji">🏆</div>
                  <div className="trophy-label">This Week's Champion</div>
                  <div className="trophy-name">Sofia Chen</div>
                  <div className="trophy-sub">+180 XP gained this week</div>
                </div>
                <div className="mini-grid">
                  {[{n:'38',l:'Students'},{n:'84%',l:'Avg Score'},{n:'19',l:'Online Now'},{n:'4',l:'Subjects'}].map(m => (
                    <div className="mini-stat" key={m.l}>
                      <div className="mini-num">{m.n}</div>
                      <div className="mini-lbl">{m.l}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="sec-hdr" style={{ marginBottom:12 }}>
                    <span style={{ fontFamily:"'Playfair Display',serif", fontSize:'0.9rem', color:'var(--text)' }}>Avg by Subject</span>
                  </div>
                  {SUBJECTS.map(s => (
                    <div className="subj-row" key={s.name}>
                      <div className="subj-dot" style={{ background: s.color }} />
                      <div className="subj-name-t">{s.name}</div>
                      <div className="subj-bar-w">
                        <div className="subj-bar-t">
                          <div className="subj-bar-f" style={{ width:`${s.pct}%`, background: s.color }} />
                        </div>
                      </div>
                      <div className="subj-pct">{s.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* BOTTOM ROW */}
          <div className="bottom-row">

            {/* XP Chart */}
            <div className="sec-card">
              <div className="sec-hdr">
                <h2 className="sec-title">XP Progress — Top 3</h2>
                <a href="#" className="sec-link">Last 6 weeks</a>
              </div>
              <div className="chart-wrap">
                <XPChart />
              </div>
              <div style={{ display:'flex', gap:16, marginTop:12 }}>
                {CHART_SERIES.map(s => (
                  <div key={s.label} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.7rem', color:'var(--muted)' }}>
                    <div style={{ width:20, height:2, background:s.color, borderRadius:1 }} />
                    {s.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="sec-card">
              <div className="sec-hdr">
                <h2 className="sec-title">Recent Activity</h2>
                <a href="#" className="sec-link">View all →</a>
              </div>
              {ACTIVITIES.map((a, i) => (
                <div className="activity-item" key={i}>
                  <div className="act-dot-w"><div className="act-dot" style={{ background: a.dot }} /></div>
                  <div className="act-text">
                    <div className="a-main">{a.main}</div>
                    <div className="a-sub">{a.sub}</div>
                  </div>
                  <div className="act-xp">{a.xp}</div>
                </div>
              ))}
            </div>

          </div>

        </main>

        {/* LOGOUT MODAL */}
        <div className={`modal-overlay${showLogout ? ' show' : ''}`} onClick={e => { if (e.target === e.currentTarget) setShowLogout(false); }}>
          <div className="modal-box">
            <div className="modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <div className="modal-title">Log Out?</div>
            <div className="modal-desc">Are you sure you want to log out?</div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="modal-confirm" onClick={() => setShowLogout(false)}>Log Out</button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
