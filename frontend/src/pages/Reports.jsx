import { useState, useMemo } from "react";

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:           #2a0a0f;
  --panel:        #3d1018;
  --panel2:       #451219;
  --border:       #5c1f2a;
  --text:         #fff8f0;
  --muted:        #b87a80;
  --input-bg:     #330d14;
  --mustard:      #d4a017;
  --mustard-soft: rgba(212,160,23,0.12);
  --mustard-mid:  rgba(212,160,23,0.28);
  --green:        #a8e6a3;
  --green-soft:   rgba(168,230,163,0.1);
  --red:          #ff8a80;
  --red-soft:     rgba(255,138,128,0.1);
  --blue:         #93c5fd;
  --blue-soft:    rgba(147,197,253,0.1);
  --purple:       #a78bfa;
  --purple-soft:  rgba(167,139,250,0.1);
  --sidebar-w:    260px;
}

html, body, #root { height: 100%; }
body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); overflow: hidden; }

.gr-layout {
  display: flex; height: 100vh;
  background: var(--bg);
  background-image:
    repeating-linear-gradient(0deg,transparent,transparent 60px,rgba(212,160,23,0.025) 60px,rgba(212,160,23,0.025) 61px),
    repeating-linear-gradient(90deg,transparent,transparent 60px,rgba(212,160,23,0.025) 60px,rgba(212,160,23,0.025) 61px);
  overflow: hidden;
}

/* ── SIDEBAR ── */
.gr-sidebar {
  width: var(--sidebar-w); height: 100vh;
  background: var(--panel); border-right: 1px solid var(--border);
  display: flex; flex-direction: column; padding: 36px 0;
  position: fixed; top: 0; left: 0; z-index: 50; overflow-y: auto;
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  animation: slideInLeft 0.5s ease both;
}
.gr-sidebar::after { content:''; position:absolute; top:0; right:0; width:1px; height:100%; background:linear-gradient(to bottom,transparent,var(--mustard),transparent); opacity:0.4; pointer-events:none; }
.gr-sidebar.open { transform: translateX(0) !important; }

.sb-brand { display:flex; align-items:center; gap:11px; padding:0 28px 28px; border-bottom:1px solid var(--border); flex-shrink:0; }
.sb-logo { width:34px; height:34px; background:var(--mustard); border-radius:8px; display:grid; place-items:center; flex-shrink:0; }
.sb-logo svg { width:18px; height:18px; fill:#2a0a0f; }
.sb-brand-name { font-family:'Playfair Display',serif; font-size:1.2rem; letter-spacing:-0.02em; }
.sb-nav { padding:20px 16px 0; flex:1; }
.sb-label { font-size:0.65rem; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted); padding:0 12px; margin-bottom:8px; opacity:0.7; display:block; }
.sb-item { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:10px; cursor:pointer; color:var(--muted); font-size:0.87rem; font-weight:400; text-decoration:none; transition:all 0.2s; margin-bottom:2px; position:relative; background:transparent; border:none; width:100%; font-family:'DM Sans',sans-serif; text-align:left; }
.sb-item svg { width:17px; height:17px; flex-shrink:0; }
.sb-item:hover { background:var(--mustard-soft); color:var(--text); }
.sb-item.active { background:var(--mustard-soft); color:var(--mustard); font-weight:500; }
.sb-item.active::before { content:''; position:absolute; left:0; top:20%; bottom:20%; width:3px; background:var(--mustard); border-radius:0 2px 2px 0; }
.sb-badge { margin-left:auto; background:var(--mustard); color:#2a0a0f; font-size:0.62rem; font-weight:700; padding:2px 7px; border-radius:20px; }
.sb-footer { padding:16px 16px 0; border-top:1px solid var(--border); margin:0 12px; flex-shrink:0; }
.sb-user { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; cursor:pointer; transition:background 0.2s; }
.sb-user:hover { background:var(--mustard-soft); }
.sb-avatar { width:34px; height:34px; background:linear-gradient(135deg,var(--mustard),#8b5a0a); border-radius:50%; display:grid; place-items:center; font-family:'Playfair Display',serif; font-size:0.9rem; color:#2a0a0f; font-weight:700; flex-shrink:0; }
.sb-user-name { font-size:0.85rem; font-weight:500; color:var(--text); }
.sb-user-role { font-size:0.7rem; color:var(--mustard); }
.sb-logout { display:flex; align-items:center; gap:10px; width:100%; padding:10px 12px; margin-top:6px; border-radius:10px; border:none; background:transparent; color:var(--red); font-family:'DM Sans',sans-serif; font-size:0.87rem; cursor:pointer; transition:background 0.2s; text-align:left; }
.sb-logout:hover { background:var(--red-soft); }
.sb-logout svg { width:17px; height:17px; }

/* ── MAIN ── */
.gr-main { margin-left:var(--sidebar-w); flex:1; padding:36px 44px; overflow-y:scroll; height:100vh; }
.gr-main::-webkit-scrollbar { width:5px; }
.gr-main::-webkit-scrollbar-track { background:transparent; }
.gr-main::-webkit-scrollbar-thumb { background:var(--border); border-radius:3px; }

/* ── TOPBAR ── */
.gr-topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; animation:fadeUp 0.5s 0.05s ease both; }
.topbar-l { display:flex; align-items:center; gap:12px; }
.greeting-sub { font-size:0.75rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--mustard); font-weight:500; margin-bottom:5px; }
.greeting-main { font-family:'Playfair Display',serif; font-size:clamp(1.5rem,2.5vw,2.2rem); line-height:1.1; letter-spacing:-0.03em; }
.greeting-main span { color:var(--mustard); }
.topbar-r { display:flex; align-items:center; gap:12px; }
.icon-btn { width:40px; height:40px; background:var(--panel); border:1px solid var(--border); border-radius:10px; display:grid; place-items:center; cursor:pointer; transition:all 0.2s; color:var(--muted); }
.icon-btn:hover { border-color:var(--mustard); color:var(--mustard); }
.icon-btn svg { width:18px; height:18px; }
.date-chip { padding:8px 16px; background:var(--panel); border:1px solid var(--border); border-radius:10px; font-size:0.75rem; color:var(--muted); letter-spacing:0.04em; }

/* ── STAT CARDS ── */
.stat-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:26px; animation:fadeUp 0.5s 0.1s ease both; }
.stat-card { background:var(--panel); border:1px solid var(--border); border-radius:14px; padding:20px; position:relative; overflow:hidden; transition:border-color 0.25s, transform 0.25s; }
.stat-card:hover { border-color:var(--mustard); transform:translateY(-2px); }
.stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(to right,transparent,var(--mustard),transparent); opacity:0; transition:opacity 0.25s; }
.stat-card:hover::before { opacity:0.5; }
.stat-card-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
.stat-icon { width:36px; height:36px; background:var(--mustard-soft); border-radius:9px; display:grid; place-items:center; color:var(--mustard); }
.stat-icon svg { width:16px; height:16px; }
.stat-trend { font-size:0.68rem; padding:2px 7px; border-radius:20px; font-weight:500; }
.trend-up   { background:var(--green-soft); color:var(--green); }
.trend-down { background:var(--red-soft); color:var(--red); }
.trend-neu  { background:var(--mustard-soft); color:var(--mustard); }
.stat-num { font-family:'Playfair Display',serif; font-size:1.8rem; line-height:1; margin-bottom:3px; }
.stat-desc { font-size:0.74rem; color:var(--muted); }

/* ── TABS ── */
.tab-row { display:flex; align-items:center; gap:4px; margin-bottom:24px; padding:4px; background:var(--panel); border:1px solid var(--border); border-radius:12px; width:fit-content; animation:fadeUp 0.5s 0.15s ease both; }
.tab-btn { padding:8px 20px; border-radius:9px; font-size:0.8rem; font-weight:500; cursor:pointer; border:none; background:transparent; color:var(--muted); font-family:'DM Sans',sans-serif; transition:all 0.2s; white-space:nowrap; }
.tab-btn:hover { color:var(--text); }
.tab-btn.active { background:var(--mustard-soft); color:var(--mustard); border:1px solid rgba(212,160,23,0.3); }

/* ── TOOLBAR ── */
.toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px; animation:fadeUp 0.5s 0.18s ease both; flex-wrap:wrap; }
.toolbar-l { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.search-bar { display:flex; align-items:center; gap:9px; padding:9px 14px; background:var(--panel); border:1px solid var(--border); border-radius:10px; transition:border-color 0.2s; min-width:220px; }
.search-bar:focus-within { border-color:var(--mustard); }
.search-bar svg { width:14px; height:14px; color:var(--muted); flex-shrink:0; }
.search-bar input { background:none; border:none; outline:none; color:var(--text); font-family:'DM Sans',sans-serif; font-size:0.82rem; flex:1; }
.search-bar input::placeholder { color:var(--muted); }
.filter-sel { background:var(--panel); border:1px solid var(--border); border-radius:10px; padding:9px 32px 9px 14px; color:var(--muted); font-family:'DM Sans',sans-serif; font-size:0.82rem; outline:none; cursor:pointer; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23b87a80' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; transition:border-color 0.2s; }
.filter-sel:focus { border-color:var(--mustard); color:var(--text); }
.btn { padding:9px 18px; border-radius:10px; font-family:'DM Sans',sans-serif; font-size:0.82rem; font-weight:500; cursor:pointer; transition:all 0.2s; border:none; display:flex; align-items:center; gap:7px; }
.btn svg { width:14px; height:14px; }
.btn-ghost { background:transparent; border:1px solid var(--border); color:var(--muted); }
.btn-ghost:hover { border-color:var(--mustard); color:var(--mustard); }
.btn-outline { background:transparent; border:1px solid rgba(212,160,23,0.4); color:var(--mustard); }
.btn-outline:hover { background:var(--mustard-soft); }
.btn-primary { background:var(--mustard); color:#2a0a0f; font-weight:600; }
.btn-primary:hover { background:#e6b020; transform:translateY(-1px); box-shadow:0 4px 16px var(--mustard-mid); }

/* ── GRADES TABLE ── */
.table-wrap { background:var(--panel); border:1px solid var(--border); border-radius:18px; overflow:hidden; animation:fadeUp 0.5s 0.2s ease both; margin-bottom:22px; }
.table-header { display:flex; align-items:center; justify-content:space-between; padding:20px 26px 16px; border-bottom:1px solid var(--border); }
.table-title { font-family:'Playfair Display',serif; font-size:1rem; letter-spacing:-0.02em; }
.table-sub { font-size:0.72rem; color:var(--muted); margin-top:3px; }

table { width:100%; border-collapse:collapse; }
thead tr { border-bottom:1px solid var(--border); }
thead th { padding:12px 20px; text-align:left; font-size:0.65rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--muted); font-weight:600; white-space:nowrap; }
thead th.right { text-align:right; }
thead th.center { text-align:center; }

tbody tr { border-bottom:1px solid rgba(92,31,42,0.3); transition:background 0.15s; cursor:pointer; }
tbody tr:last-child { border-bottom:none; }
tbody tr:hover { background:var(--mustard-soft); }

td { padding:13px 20px; font-size:0.83rem; vertical-align:middle; }
td.right { text-align:right; }
td.center { text-align:center; }

.student-cell { display:flex; align-items:center; gap:10px; }
.s-av { width:32px; height:32px; border-radius:50%; display:grid; place-items:center; font-size:0.75rem; font-weight:700; font-family:'Playfair Display',serif; flex-shrink:0; }
.s-name { font-size:0.83rem; font-weight:500; }
.s-id { font-size:0.67rem; color:var(--muted); }

.score-bar-wrap { display:flex; align-items:center; gap:10px; }
.score-bar-track { flex:1; height:5px; background:var(--border); border-radius:3px; overflow:hidden; min-width:60px; }
.score-bar-fill { height:100%; border-radius:3px; transition:width 0.4s ease; }
.fill-green  { background:linear-gradient(to right,#22c55e,#16a34a); }
.fill-yellow { background:linear-gradient(to right,#fcd34d,#f59e0b); }
.fill-red    { background:linear-gradient(to right,#ff8a80,#ef4444); }
.fill-blue   { background:linear-gradient(to right,#93c5fd,#3b82f6); }
.fill-mustard { background:linear-gradient(to right,var(--mustard),#e6b020); }

.score-num { font-family:'Playfair Display',serif; font-size:0.9rem; min-width:36px; text-align:right; }

.grade-pill { font-size:0.65rem; padding:3px 10px; border-radius:20px; font-weight:700; letter-spacing:0.04em; white-space:nowrap; text-align:center; display:inline-block; }
.pill-a  { background:var(--green-soft);  color:var(--green);  }
.pill-b  { background:var(--mustard-soft); color:var(--mustard); }
.pill-c  { background:var(--blue-soft);   color:var(--blue);   }
.pill-d  { background:var(--red-soft);    color:var(--red);    }
.pill-f  { background:rgba(255,100,80,0.15); color:#ff6b6b; }
.pill-na { background:rgba(255,255,255,0.05); color:var(--muted); }

.status-dot { width:8px; height:8px; border-radius:50%; display:inline-block; margin-right:6px; }

.trend-chip { font-size:0.66rem; padding:2px 8px; border-radius:20px; font-weight:600; }
.chip-up   { background:var(--green-soft); color:var(--green); }
.chip-down { background:var(--red-soft); color:var(--red); }
.chip-same { background:var(--mustard-soft); color:var(--mustard); }

/* ── SUBJECT BREAKDOWN ── */
.subject-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; animation:fadeUp 0.5s 0.22s ease both; }
.subj-card { background:var(--panel); border:1px solid var(--border); border-radius:14px; padding:18px; transition:border-color 0.25s, transform 0.25s; cursor:pointer; position:relative; overflow:hidden; }
.subj-card:hover { border-color:rgba(212,160,23,0.4); transform:translateY(-2px); }
.subj-card::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; border-radius:0 0 14px 14px; transition:opacity 0.25s; opacity:0; }
.subj-card:hover::after { opacity:1; }
.subj-card.active { border-color:rgba(212,160,23,0.5); }
.subj-card-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
.subj-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; margin-top:3px; }
.subj-name { font-family:'Playfair Display',serif; font-size:0.95rem; letter-spacing:-0.01em; margin-bottom:2px; }
.subj-count { font-size:0.68rem; color:var(--muted); }
.subj-avg { font-family:'Playfair Display',serif; font-size:1.6rem; color:var(--mustard); line-height:1; }
.subj-bar-track { height:4px; background:var(--border); border-radius:2px; overflow:hidden; margin-top:10px; }
.subj-bar-fill { height:100%; border-radius:2px; transition:width 0.5s ease; }
.subj-pass { font-size:0.67rem; color:var(--muted); margin-top:6px; }

/* ── BOTTOM GRID ── */
.bottom-grid { display:grid; grid-template-columns:1.4fr 1fr; gap:16px; margin-bottom:8px; animation:fadeUp 0.5s 0.25s ease both; }
.panel-card { background:var(--panel); border:1px solid var(--border); border-radius:18px; }
.panel-inner { padding:22px 24px; }
.sec-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
.sec-title { font-family:'Playfair Display',serif; font-size:1rem; letter-spacing:-0.02em; }
.sec-link { font-size:0.72rem; color:var(--mustard); text-decoration:none; opacity:0.8; cursor:pointer; background:none; border:none; font-family:'DM Sans',sans-serif; }
.sec-link:hover { opacity:1; }

/* ── PERFORMANCE CHART (SVG) ── */
.chart-wrap { height:160px; }

/* ── AT-RISK TABLE ── */
.risk-row { display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid rgba(92,31,42,0.35); }
.risk-row:last-child { border-bottom:none; }
.risk-av { width:30px; height:30px; border-radius:50%; display:grid; place-items:center; font-size:0.7rem; font-weight:700; font-family:'Playfair Display',serif; flex-shrink:0; }
.risk-info { flex:1; min-width:0; }
.risk-name { font-size:0.82rem; font-weight:500; }
.risk-sub  { font-size:0.67rem; color:var(--muted); }
.risk-score { font-family:'Playfair Display',serif; font-size:0.9rem; color:var(--red); }
.risk-badge { font-size:0.6rem; padding:2px 8px; border-radius:20px; background:var(--red-soft); color:var(--red); font-weight:600; white-space:nowrap; }

/* ── STUDENT DETAIL DRAWER ── */
.drawer-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.55); backdrop-filter:blur(3px); z-index:100; opacity:0; pointer-events:none; transition:opacity 0.3s; }
.drawer-overlay.open { opacity:1; pointer-events:all; }
.drawer { position:fixed; top:0; right:0; height:100vh; width:440px; max-width:95vw; background:var(--panel); border-left:1px solid var(--border); z-index:101; transform:translateX(100%); transition:transform 0.35s cubic-bezier(0.4,0,0.2,1); overflow-y:auto; display:flex; flex-direction:column; }
.drawer.open { transform:translateX(0); }
.drawer-header { padding:28px 28px 20px; border-bottom:1px solid var(--border); position:sticky; top:0; background:var(--panel); z-index:1; flex-shrink:0; }
.drawer-header::before { content:''; position:absolute; top:0; left:20%; right:20%; height:1px; background:linear-gradient(to right,transparent,var(--mustard),transparent); opacity:0.4; }
.drawer-close { position:absolute; top:18px; right:20px; width:32px; height:32px; border-radius:8px; background:var(--input-bg); border:1px solid var(--border); display:grid; place-items:center; cursor:pointer; color:var(--muted); transition:all 0.2s; }
.drawer-close:hover { border-color:var(--mustard); color:var(--mustard); }
.drawer-close svg { width:14px; height:14px; }
.drawer-body { padding:24px 28px; flex:1; }
.drawer-av { width:56px; height:56px; border-radius:50%; display:grid; place-items:center; font-family:'Playfair Display',serif; font-size:1.3rem; font-weight:700; margin-bottom:14px; border:3px solid rgba(212,160,23,0.3); }
.drawer-name { font-family:'Playfair Display',serif; font-size:1.2rem; letter-spacing:-0.02em; margin-bottom:3px; }
.drawer-meta { font-size:0.75rem; color:var(--muted); }
.drawer-overall { display:flex; align-items:center; gap:16px; padding:16px; background:var(--input-bg); border:1px solid var(--border); border-radius:12px; margin:18px 0; }
.drawer-overall-num { font-family:'Playfair Display',serif; font-size:2.2rem; color:var(--mustard); line-height:1; }
.drawer-overall-label { font-size:0.7rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.08em; }
.drawer-subj-row { display:flex; align-items:center; gap:10px; padding:11px 0; border-bottom:1px solid rgba(92,31,42,0.35); }
.drawer-subj-row:last-child { border-bottom:none; }
.d-subj-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.d-subj-name { flex:1; font-size:0.82rem; }
.d-subj-bar-track { width:80px; height:4px; background:var(--border); border-radius:2px; overflow:hidden; }
.d-subj-bar-fill { height:100%; border-radius:2px; }
.d-subj-score { font-family:'Playfair Display',serif; font-size:0.88rem; color:var(--mustard); min-width:38px; text-align:right; }
.drawer-quiz-item { padding:11px 0; border-bottom:1px solid rgba(92,31,42,0.3); display:flex; align-items:center; gap:10px; }
.drawer-quiz-item:last-child { border-bottom:none; }
.dq-title { flex:1; font-size:0.8rem; font-weight:500; }
.dq-sub { font-size:0.67rem; color:var(--muted); }
.dq-score { font-family:'Playfair Display',serif; font-size:0.88rem; }

/* ── MODAL ── */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); z-index:200; display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; transition:opacity 0.25s; }
.modal-overlay.show { opacity:1; pointer-events:all; }
.modal-box { background:var(--panel); border:1px solid var(--border); border-radius:20px; padding:36px 32px; width:100%; max-width:360px; text-align:center; position:relative; transform:scale(0.92) translateY(12px); transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1); box-shadow:0 24px 60px rgba(0,0,0,0.5); }
.modal-overlay.show .modal-box { transform:scale(1) translateY(0); }
.modal-box::before { content:''; position:absolute; top:0; left:20%; right:20%; height:1px; background:linear-gradient(to right,transparent,var(--mustard),transparent); opacity:0.4; }
.modal-icon { width:56px; height:56px; background:var(--red-soft); border:1px solid rgba(255,138,128,0.25); border-radius:50%; display:grid; place-items:center; margin:0 auto 20px; color:var(--red); }
.modal-icon svg { width:24px; height:24px; }
.modal-title { font-size:1.3rem; font-weight:600; margin-bottom:10px; }
.modal-desc { font-size:0.83rem; color:var(--muted); line-height:1.6; margin-bottom:28px; }
.modal-actions { display:flex; gap:12px; }
.modal-cancel { flex:1; padding:12px; background:var(--input-bg); border:1px solid var(--border); border-radius:10px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:0.88rem; font-weight:500; cursor:pointer; transition:all 0.2s; }
.modal-cancel:hover { border-color:var(--mustard); background:var(--mustard-soft); }
.modal-confirm { flex:1; padding:12px; background:var(--red); border:none; border-radius:10px; color:#2a0a0f; font-family:'DM Sans',sans-serif; font-size:0.88rem; font-weight:700; cursor:pointer; transition:all 0.2s; }
.modal-confirm:hover { background:#ff6b6b; transform:translateY(-1px); }

/* ── HAMBURGER ── */
.hamburger { display:none; width:40px; height:40px; background:var(--panel); border:1px solid var(--border); border-radius:10px; align-items:center; justify-content:center; cursor:pointer; color:var(--muted); flex-shrink:0; transition:all 0.2s; }
.hamburger:hover { border-color:var(--mustard); color:var(--mustard); }
.hamburger svg { width:18px; height:18px; }
.sb-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.55); backdrop-filter:blur(2px); z-index:40; opacity:0; transition:opacity 0.3s; }
.sb-overlay.show { opacity:1; }

/* ── EMPTY STATE ── */
.empty-state { display:flex; flex-direction:column; align-items:center; padding:48px 24px; color:var(--muted); gap:12px; }
.empty-state svg { width:36px; height:36px; opacity:0.4; }
.empty-state p { font-size:0.85rem; }

@keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideInLeft { from { transform:translateX(-30px); opacity:0; } to { transform:translateX(0); opacity:1; } }

@media (max-width:1280px) { .subject-grid { grid-template-columns:repeat(2,1fr); } .stat-row { grid-template-columns:repeat(2,1fr); } .bottom-grid { grid-template-columns:1fr; } }
@media (max-width:768px) {
  .hamburger { display:flex; } .gr-sidebar { transform:translateX(-100%); animation:none; } .sb-overlay { display:block; pointer-events:all; }
  .gr-main { margin-left:0; padding:20px 16px; } .date-chip { display:none; }
  .stat-row { grid-template-columns:repeat(2,1fr); } .subject-grid { grid-template-columns:repeat(2,1fr); }
  table th:nth-child(n+4), table td:nth-child(n+4) { display:none; }
  .drawer { width:100vw; }
}
`;

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const SUBJECTS_DATA = [
  { name:'Mathematics', color:'#a78bfa', avg:91, pass:95, quizzes:4, colorClass:'fill-blue' },
  { name:'Science',     color:'#6ee7b7', avg:78, pass:82, quizzes:3, colorClass:'fill-green' },
  { name:'English',     color:'#fca5a5', avg:88, pass:94, quizzes:3, colorClass:'fill-red' },
  { name:'History',     color:'#fcd34d', avg:80, pass:87, quizzes:2, colorClass:'fill-mustard' },
];

const STUDENTS = [
  { id:'S-001', init:'S', name:'Sofia Chen',      av:'linear-gradient(135deg,#d4a017,#8b5a0a)', avC:'#2a0a0f', math:98, sci:90, eng:95, hist:88, trend:'up',   remarks:'Excellent performance across all subjects.' },
  { id:'S-002', init:'M', name:'Marcus Lee',      av:'linear-gradient(135deg,#c0c0c0,#888)',    avC:'#2a0a0f', math:94, sci:85, eng:88, hist:92, trend:'up',   remarks:'Consistent and hardworking student.' },
  { id:'S-003', init:'J', name:'Jamie Park',      av:'linear-gradient(135deg,#cd7f32,#7a4a1a)', avC:'#fff8f0', math:82, sci:78, eng:91, hist:76, trend:'same', remarks:'Strong in English. Needs support in History.' },
  { id:'S-004', init:'R', name:'Riley Torres',    av:'#5c1f2a',                                  avC:'#b87a80', math:75, sci:72, eng:80, hist:68, trend:'down', remarks:'Struggling with History and Science. Recommend review sessions.' },
  { id:'S-005', init:'L', name:'Lei Cordial',     av:'linear-gradient(135deg,#d4a017,#8b5a0a)', avC:'#2a0a0f', math:88, sci:83, eng:85, hist:79, trend:'up',   remarks:'Well-rounded. Improving steadily.' },
  { id:'S-006', init:'A', name:'Anika Reyes',     av:'linear-gradient(135deg,#a78bfa,#6d28d9)', avC:'#fff8f0', math:95, sci:70, eng:82, hist:74, trend:'up',   remarks:'Exceptional in Math. Science needs attention.' },
  { id:'S-007', init:'D', name:'Diego Santos',    av:'linear-gradient(135deg,#6ee7b7,#059669)', avC:'#2a0a0f', math:72, sci:88, eng:74, hist:83, trend:'down', remarks:'Excels in Science. Math needs improvement.' },
  { id:'S-008', init:'N', name:'Nina Villanueva', av:'linear-gradient(135deg,#fca5a5,#dc2626)', avC:'#2a0a0f', math:79, sci:75, eng:92, hist:77, trend:'same', remarks:'Literary strength in English. Balanced elsewhere.' },
  { id:'S-009', init:'K', name:'Kai Matsumoto',   av:'linear-gradient(135deg,#fcd34d,#b45309)', avC:'#2a0a0f', math:63, sci:66, eng:71, hist:69, trend:'down', remarks:'Below class average. Needs intervention.' },
  { id:'S-010', init:'P', name:'Priya Nakamura',  av:'#5c1f2a',                                  avC:'#b87a80', math:58, sci:61, eng:65, hist:60, trend:'down', remarks:'At risk. Recommend immediate parent meeting.' },
];

const QUIZ_HISTORY = [
  { title:'Algebra & Quadratic Equations', subject:'Mathematics', date:'Feb 28', max:20 },
  { title:'Cell Biology & Mitosis',        subject:'Science',     date:'Feb 24', max:15 },
  { title:'Literary Analysis & Essays',    subject:'English',     date:'Feb 20', max:10 },
  { title:'Philippine Revolution Era',     subject:'History',     date:'Feb 15', max:18 },
];

const NAV_ITEMS = [
  { label:'Dashboard',        active:false },
  { label:'My Classes',       active:false },
  { label:'Lectures',         active:false },
  { label:'Manage Quizzes',   active:false, badge:'3' },
  { label:'Leaderboard',      active:false },
  { label:'Grades & Reports', active:true  },
];

const NAV_ICONS = {
  'Dashboard':        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  'My Classes':       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  'Lectures':         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  'Manage Quizzes':   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
  'Leaderboard':      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  'Grades & Reports': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function avg(s) { return Math.round((s.math + s.sci + s.eng + s.hist) / 4); }

function getGrade(score) {
  if (score >= 90) return { label:'A', cls:'pill-a' };
  if (score >= 80) return { label:'B', cls:'pill-b' };
  if (score >= 70) return { label:'C', cls:'pill-c' };
  if (score >= 60) return { label:'D', cls:'pill-d' };
  return { label:'F', cls:'pill-f' };
}

function fillClass(score) {
  if (score >= 85) return 'fill-green';
  if (score >= 70) return 'fill-mustard';
  return 'fill-red';
}

function TrendChip({ t }) {
  if (t === 'up')   return <span className="trend-chip chip-up">▲ Up</span>;
  if (t === 'down') return <span className="trend-chip chip-down">▼ Down</span>;
  return <span className="trend-chip chip-same">— Stable</span>;
}

/* ─────────────────────────────────────────────
   SVG PERFORMANCE CHART
───────────────────────────────────────────── */
function PerformanceChart({ activeSubject }) {
  const W = 500, H = 150, pad = { t:10, b:28, l:10, r:10 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;

  const series = activeSubject
    ? [{ data: STUDENTS.map(s => ({ math:s.math,sci:s.sci,eng:s.eng,hist:s.hist }['math'/* placeholder */])), color:'#d4a017', label:'Selected' }]
    : SUBJECTS_DATA.map(sub => ({
        data: STUDENTS.map(s => ({ Mathematics:s.math, Science:s.sci, English:s.eng, History:s.hist }[sub.name])),
        color: sub.color,
        label: sub.name,
      }));

  const allVals = series.flatMap(s => s.data);
  const minV = 50, maxV = 100;
  const n = series[0].data.length;
  const cx = i => pad.l + (i / (n - 1)) * iW;
  const cy = v => pad.t + iH - ((v - minV) / (maxV - minV)) * iH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width:'100%', height:'100%', overflow:'visible' }}>
      {[60,70,80,90].map(v => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={cy(v)} y2={cy(v)} stroke="rgba(92,31,42,0.4)" strokeWidth="1" />
          <text x={pad.l} y={cy(v) - 3} fill="#b87a80" fontSize="8" fontFamily="DM Sans">{v}</text>
        </g>
      ))}
      {series.map(s => {
        const areaD = `M${cx(0)},${cy(s.data[0])} ${s.data.map((v,i)=>`L${cx(i)},${cy(v)}`).join(' ')} L${cx(n-1)},${pad.t+iH} L${cx(0)},${pad.t+iH} Z`;
        const lineD = `M${cx(0)},${cy(s.data[0])} ${s.data.map((v,i)=>`L${cx(i)},${cy(v)}`).join(' ')}`;
        return (
          <g key={s.label}>
            <path d={areaD} fill={s.color} fillOpacity="0.05" />
            <path d={lineD} fill="none" stroke={s.color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
            {s.data.map((v,i) => <circle key={i} cx={cx(i)} cy={cy(v)} r="3" fill={s.color} />)}
          </g>
        );
      })}
      {STUDENTS.map((st,i) => (
        <text key={st.id} x={cx(i)} y={H - 4} textAnchor="middle" fill="#b87a80" fontSize="8" fontFamily="DM Sans">{st.init}</text>
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   STUDENT DRAWER
───────────────────────────────────────────── */
function StudentDrawer({ student, onClose }) {
  const open = !!student;
  const s = student;
  const scoreMap = s ? { Mathematics:s.math, Science:s.sci, English:s.eng, History:s.hist } : {};
  const overall = s ? avg(s) : 0;
  const g = s ? getGrade(overall) : null;

  return (
    <>
      <div className={`drawer-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`drawer${open ? ' open' : ''}`}>
        {s && (
          <>
            <div className="drawer-header">
              <button className="drawer-close" onClick={onClose}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <div className="drawer-av" style={{ background: s.av, color: s.avC }}>{s.init}</div>
              <div className="drawer-name">{s.name}</div>
              <div className="drawer-meta">{s.id} · Grade 10 · Section A</div>
            </div>

            <div className="drawer-body">
              {/* Overall */}
              <div className="drawer-overall">
                <div>
                  <div className="drawer-overall-num">{overall}%</div>
                  <div className="drawer-overall-label">Overall Average</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:'0.72rem', color:'var(--muted)' }}>Performance</span>
                    <span className={`grade-pill ${g.cls}`}>{g.label}</span>
                  </div>
                  <div className="score-bar-track" style={{ height:6 }}>
                    <div className={`score-bar-fill ${fillClass(overall)}`} style={{ width:`${overall}%` }} />
                  </div>
                </div>
                <TrendChip t={s.trend} />
              </div>

              {/* Subject breakdown */}
              <div style={{ marginBottom:22 }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'0.92rem', marginBottom:14 }}>Subject Scores</div>
                {SUBJECTS_DATA.map(sub => {
                  const score = scoreMap[sub.name];
                  const sg = getGrade(score);
                  return (
                    <div className="drawer-subj-row" key={sub.name}>
                      <div className="d-subj-dot" style={{ background: sub.color }} />
                      <div className="d-subj-name">{sub.name}</div>
                      <div className="d-subj-bar-track">
                        <div className="d-subj-bar-fill" style={{ width:`${score}%`, background: sub.color }} />
                      </div>
                      <div className="d-subj-score">{score}%</div>
                      <span className={`grade-pill ${sg.cls}`} style={{ fontSize:'0.6rem', padding:'2px 7px' }}>{sg.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Quiz history */}
              <div style={{ marginBottom:22 }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'0.92rem', marginBottom:14 }}>Quiz History</div>
                {QUIZ_HISTORY.map((q, i) => {
                  const fakeScore = Math.round((Object.values(scoreMap)[i % 4] / 100) * q.max);
                  const pct = Math.round((fakeScore / q.max) * 100);
                  const qg = getGrade(pct);
                  return (
                    <div className="drawer-quiz-item" key={q.title}>
                      <div>
                        <div className="dq-title">{q.title}</div>
                        <div className="dq-sub">{q.subject} · {q.date}</div>
                      </div>
                      <div className={`dq-score`} style={{ color: pct >= 85 ? 'var(--green)' : pct >= 70 ? 'var(--mustard)' : 'var(--red)' }}>
                        {fakeScore}/{q.max}
                      </div>
                      <span className={`grade-pill ${qg.cls}`}>{qg.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Remarks */}
              <div style={{ background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:12, padding:16 }}>
                <div style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--muted)', marginBottom:8 }}>Teacher Remarks</div>
                <p style={{ fontSize:'0.82rem', lineHeight:1.7, color:'var(--text)' }}>{s.remarks}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function GradesReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogout,  setShowLogout]  = useState(false);
  const [activeTab,   setActiveTab]   = useState('All Students');
  const [search,      setSearch]      = useState('');
  const [filterSubj,  setFilterSubj]  = useState('All Subjects');
  const [sortBy,      setSortBy]      = useState('avg');
  const [activeSubject, setActiveSubject] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const TABS = ['All Students', 'By Subject', 'At Risk', 'Top Performers'];

  /* filtered & sorted students */
  const displayed = useMemo(() => {
    let list = [...STUDENTS];
    if (search) list = list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search));
    if (activeTab === 'At Risk')        list = list.filter(s => avg(s) < 72);
    if (activeTab === 'Top Performers') list = list.filter(s => avg(s) >= 85);

    if (sortBy === 'avg')  list.sort((a,b) => avg(b) - avg(a));
    if (sortBy === 'name') list.sort((a,b) => a.name.localeCompare(b.name));
    if (sortBy === 'math') list.sort((a,b) => b.math - a.math);
    if (sortBy === 'sci')  list.sort((a,b) => b.sci - a.sci);
    if (sortBy === 'eng')  list.sort((a,b) => b.eng - a.eng);
    if (sortBy === 'hist') list.sort((a,b) => b.hist - a.hist);

    return list;
  }, [search, activeTab, sortBy]);

  const classAvg = Math.round(STUDENTS.reduce((acc,s) => acc + avg(s), 0) / STUDENTS.length);
  const passing  = STUDENTS.filter(s => avg(s) >= 75).length;
  const atRisk   = STUDENTS.filter(s => avg(s) < 72).length;
  const topCount = STUDENTS.filter(s => avg(s) >= 90).length;

  return (
    <>
      <style>{styles}</style>
      <div className="gr-layout">

        {/* ── SIDEBAR ── */}
        <aside className={`gr-sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="sb-brand">
            <div className="sb-logo"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
            <span className="sb-brand-name">Aether</span>
          </div>
          <nav className="sb-nav">
            <span className="sb-label">Main</span>
            {NAV_ITEMS.map(item => (
              <a key={item.label} className={`sb-item${item.active ? ' active' : ''}`} href="#">
                {NAV_ICONS[item.label]}
                {item.label}
                {item.badge && <span className="sb-badge">{item.badge}</span>}
              </a>
            ))}
            <span className="sb-label" style={{ marginTop:20 }}>Account</span>
            <a className="sb-item" href="#">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Profile
            </a>
            <a className="sb-item" href="#">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
              Settings
            </a>
          </nav>
          <div className="sb-footer">
            <div className="sb-user">
              <div className="sb-avatar">F</div>
              <div><div className="sb-user-name">Mr. Francis Patalen</div><div className="sb-user-role">✦ Teacher</div></div>
            </div>
            <button className="sb-logout" onClick={() => setShowLogout(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Log Out
            </button>
          </div>
        </aside>

        <div className={`sb-overlay${sidebarOpen ? ' show' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* ── MAIN ── */}
        <main className="gr-main">

          {/* TOPBAR */}
          <div className="gr-topbar">
            <div className="topbar-l">
              <button className="hamburger" onClick={() => setSidebarOpen(v => !v)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <div>
                <div className="greeting-sub">✦ Grade 10 · Section A</div>
                <h1 className="greeting-main">Grades <span>&amp; Reports.</span></h1>
              </div>
            </div>
            <div className="topbar-r">
              <div className="date-chip">Semester 2 · Week 8</div>
              <button className="icon-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
              </button>
              <div className="sb-avatar" style={{ width:38, height:38, fontSize:'0.85rem' }}>F</div>
            </div>
          </div>

          {/* STAT CARDS */}
          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg></div>
                <span className="stat-trend trend-up">↑ 4%</span>
              </div>
              <div className="stat-num">{classAvg}%</div>
              <div className="stat-desc">Class Average</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></div>
                <span className="stat-trend trend-neu">of {STUDENTS.length}</span>
              </div>
              <div className="stat-num">{passing}</div>
              <div className="stat-desc">Passing Students</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
                <span className="stat-trend trend-up">Top tier</span>
              </div>
              <div className="stat-num">{topCount}</div>
              <div className="stat-desc">Outstanding (A)</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
                <span className="stat-trend trend-down">Needs help</span>
              </div>
              <div className="stat-num">{atRisk}</div>
              <div className="stat-desc">At-Risk Students</div>
            </div>
          </div>

          {/* SUBJECT CARDS */}
          <div className="subject-grid">
            {SUBJECTS_DATA.map(sub => {
              const g = getGrade(sub.avg);
              const isActive = activeSubject === sub.name;
              return (
                <div
                  key={sub.name}
                  className={`subj-card${isActive ? ' active' : ''}`}
                  onClick={() => setActiveSubject(isActive ? null : sub.name)}
                  style={isActive ? { borderColor: sub.color + '80' } : {}}
                >
                  <div className="subj-card-top">
                    <div>
                      <div className="subj-name">{sub.name}</div>
                      <div className="subj-count">{sub.quizzes} quizzes</div>
                    </div>
                    <span className={`grade-pill ${g.cls}`}>{g.label}</span>
                  </div>
                  <div className="subj-avg">{sub.avg}%</div>
                  <div className="subj-bar-track">
                    <div className="subj-bar-fill" style={{ width:`${sub.avg}%`, background: sub.color }} />
                  </div>
                  <div className="subj-pass">{sub.pass}% of students passing</div>
                </div>
              );
            })}
          </div>

          {/* TABS */}
          <div className="tab-row">
            {TABS.map(t => (
              <button key={t} className={`tab-btn${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
            ))}
          </div>

          {/* TOOLBAR */}
          <div className="toolbar">
            <div className="toolbar-l">
              <div className="search-bar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Search student or ID…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="filter-sel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="avg">Sort: Average</option>
                <option value="name">Sort: Name</option>
                <option value="math">Sort: Math</option>
                <option value="sci">Sort: Science</option>
                <option value="eng">Sort: English</option>
                <option value="hist">Sort: History</option>
              </select>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-ghost">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export CSV
              </button>
              <button className="btn btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Generate Report
              </button>
            </div>
          </div>

          {/* GRADES TABLE */}
          <div className="table-wrap">
            <div className="table-header">
              <div>
                <div className="table-title">
                  {activeTab === 'All Students' ? 'All Students' : activeTab === 'At Risk' ? '⚠ At-Risk Students' : activeTab === 'Top Performers' ? '★ Top Performers' : 'Grade Breakdown by Subject'}
                </div>
                <div className="table-sub">{displayed.length} student{displayed.length !== 1 ? 's' : ''} · Grade 10 · Section A · S.Y. 2025–2026</div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th className="center">Math</th>
                  <th className="center">Science</th>
                  <th className="center">English</th>
                  <th className="center">History</th>
                  <th className="center">Average</th>
                  <th className="center">Grade</th>
                  <th className="center">Trend</th>
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 ? (
                  <tr><td colSpan={8}>
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <p>No students match your search.</p>
                    </div>
                  </td></tr>
                ) : displayed.map(s => {
                  const a = avg(s);
                  const g = getGrade(a);
                  const scores = { math:s.math, sci:s.sci, eng:s.eng, hist:s.hist };
                  return (
                    <tr key={s.id} onClick={() => setSelectedStudent(s)}>
                      <td>
                        <div className="student-cell">
                          <div className="s-av" style={{ background:s.av, color:s.avC }}>{s.init}</div>
                          <div>
                            <div className="s-name">{s.name}</div>
                            <div className="s-id">{s.id}</div>
                          </div>
                        </div>
                      </td>
                      {[s.math, s.sci, s.eng, s.hist].map((sc, i) => (
                        <td className="center" key={i}>
                          <div className="score-bar-wrap" style={{ justifyContent:'center', flexDirection:'column', gap:4, alignItems:'center' }}>
                            <div className="score-bar-track" style={{ width:50 }}>
                              <div className={`score-bar-fill ${fillClass(sc)}`} style={{ width:`${sc}%` }} />
                            </div>
                            <span className="score-num" style={{ fontSize:'0.78rem', minWidth:'auto', color: sc >= 85 ? 'var(--green)' : sc >= 70 ? 'var(--mustard)' : 'var(--red)' }}>{sc}%</span>
                          </div>
                        </td>
                      ))}
                      <td className="center">
                        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:'0.95rem', color: a >= 85 ? 'var(--green)' : a >= 70 ? 'var(--mustard)' : 'var(--red)' }}>{a}%</span>
                      </td>
                      <td className="center"><span className={`grade-pill ${g.cls}`}>{g.label}</span></td>
                      <td className="center"><TrendChip t={s.trend} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* BOTTOM GRID */}
          <div className="bottom-grid">

            {/* Performance Chart */}
            <div className="panel-card">
              <div className="panel-inner">
                <div className="sec-hdr">
                  <div>
                    <div className="sec-title">Score Distribution</div>
                    <div style={{ fontSize:'0.7rem', color:'var(--muted)', marginTop:3 }}>
                      {activeSubject ? activeSubject : 'All subjects'} · per student
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {SUBJECTS_DATA.map(sub => (
                      <button
                        key={sub.name}
                        onClick={() => setActiveSubject(activeSubject === sub.name ? null : sub.name)}
                        style={{
                          padding:'3px 10px', borderRadius:20, fontSize:'0.65rem', fontWeight:600,
                          border:`1px solid ${activeSubject === sub.name ? sub.color : 'var(--border)'}`,
                          background: activeSubject === sub.name ? sub.color + '22' : 'transparent',
                          color: activeSubject === sub.name ? sub.color : 'var(--muted)',
                          cursor:'pointer', transition:'all 0.2s', fontFamily:'DM Sans,sans-serif',
                        }}
                      >{sub.name.slice(0,4)}</button>
                    ))}
                  </div>
                </div>
                <div className="chart-wrap">
                  <PerformanceChart activeSubject={activeSubject} />
                </div>
                <div style={{ display:'flex', gap:14, marginTop:10, flexWrap:'wrap' }}>
                  {SUBJECTS_DATA.map(sub => (
                    <div key={sub.name} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.68rem', color:'var(--muted)' }}>
                      <div style={{ width:16, height:2, background:sub.color, borderRadius:1 }} />
                      {sub.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* At-Risk Panel */}
            <div className="panel-card">
              <div className="panel-inner">
                <div className="sec-hdr">
                  <div className="sec-title">⚠ Needs Attention</div>
                  <button className="sec-link" onClick={() => setActiveTab('At Risk')}>View all →</button>
                </div>
                {STUDENTS.filter(s => avg(s) < 75).sort((a,b) => avg(a) - avg(b)).slice(0,5).map(s => {
                  const a = avg(s);
                  const lowestSubj = ['Mathematics','Science','English','History']
                    .reduce((min, sub, i) => {
                      const sc = [s.math,s.sci,s.eng,s.hist][i];
                      return sc < [s.math,s.sci,s.eng,s.hist][min[1]] ? [sub,i] : min;
                    }, ['Mathematics',0]);
                  return (
                    <div className="risk-row" key={s.id} style={{ cursor:'pointer' }} onClick={() => setSelectedStudent(s)}>
                      <div className="risk-av" style={{ background:s.av, color:s.avC }}>{s.init}</div>
                      <div className="risk-info">
                        <div className="risk-name">{s.name}</div>
                        <div className="risk-sub">Lowest: {lowestSubj[0]}</div>
                      </div>
                      <div className="risk-score">{a}%</div>
                      <span className="risk-badge">{a < 65 ? 'Critical' : 'At Risk'}</span>
                    </div>
                  );
                })}
                {STUDENTS.filter(s => avg(s) < 75).length === 0 && (
                  <div className="empty-state" style={{ padding:'24px 0' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <p>All students are passing!</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </main>

        {/* STUDENT DRAWER */}
        <StudentDrawer student={selectedStudent} onClose={() => setSelectedStudent(null)} />

        {/* LOGOUT MODAL */}
        <div className={`modal-overlay${showLogout ? ' show' : ''}`} onClick={e => { if (e.target === e.currentTarget) setShowLogout(false); }}>
          <div className="modal-box">
            <div className="modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </div>
            <div className="modal-title">Log Out?</div>
            <div className="modal-desc">Are you sure you want to log out of Aether?</div>
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