import { useState, useRef, useEffect } from "react";

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
  --mustard-mid:  rgba(212,160,23,0.25);
  --mustard-glow: rgba(212,160,23,0.45);
  --danger:       #ff8a80;
  --danger-soft:  rgba(255,138,128,0.12);
  --green:        #a8e6a3;
  --green-soft:   rgba(168,230,163,0.1);
  --sidebar-w:    260px;
}

html, body, #root { height: 100%; }

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  color: var(--text);
  overflow: hidden;
}

/* ── LAYOUT ── */
.qg-layout {
  display: flex; height: 100vh;
  background: var(--bg);
  background-image:
    repeating-linear-gradient(0deg,transparent,transparent 60px,rgba(212,160,23,0.025) 60px,rgba(212,160,23,0.025) 61px),
    repeating-linear-gradient(90deg,transparent,transparent 60px,rgba(212,160,23,0.025) 60px,rgba(212,160,23,0.025) 61px);
  overflow: hidden;
}

/* ── SIDEBAR ── */
.qg-sidebar {
  width: var(--sidebar-w); height: 100vh;
  background: var(--panel); border-right: 1px solid var(--border);
  display: flex; flex-direction: column; padding: 36px 0;
  position: fixed; top: 0; left: 0; z-index: 50;
  overflow-y: auto;
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  animation: slideInLeft 0.5s ease both;
}
.qg-sidebar::after {
  content:''; position:absolute; top:0; right:0;
  width:1px; height:100%;
  background:linear-gradient(to bottom,transparent,var(--mustard),transparent);
  opacity:0.4; pointer-events:none;
}
.qg-sidebar.open { transform:translateX(0) !important; }

.sb-brand { display:flex; align-items:center; gap:11px; padding:0 28px 28px; border-bottom:1px solid var(--border); flex-shrink:0; }
.sb-logo { width:34px; height:34px; background:var(--mustard); border-radius:8px; display:grid; place-items:center; flex-shrink:0; }
.sb-logo svg { width:18px; height:18px; fill:#2a0a0f; }
.sb-brand-name { font-family:'Playfair Display',serif; font-size:1.2rem; letter-spacing:-0.02em; }

.sb-nav { padding:20px 16px 0; flex:1; }
.sb-label { font-size:0.65rem; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted); padding:0 12px; margin-bottom:8px; opacity:0.7; display:block; }

.sb-item {
  display:flex; align-items:center; gap:12px;
  padding:10px 12px; border-radius:10px;
  cursor:pointer; color:var(--muted);
  font-size:0.87rem; font-weight:400; text-decoration:none;
  transition:all 0.2s; margin-bottom:2px; position:relative;
  background:transparent; border:none; width:100%;
  font-family:'DM Sans',sans-serif; text-align:left;
}
.sb-item svg { width:17px; height:17px; flex-shrink:0; }
.sb-item:hover { background:var(--mustard-soft); color:var(--text); }
.sb-item.active { background:var(--mustard-soft); color:var(--mustard); font-weight:500; }
.sb-item.active::before {
  content:''; position:absolute; left:0; top:20%; bottom:20%;
  width:3px; background:var(--mustard); border-radius:0 2px 2px 0;
}
.sb-badge { margin-left:auto; background:var(--mustard); color:#2a0a0f; font-size:0.62rem; font-weight:700; padding:2px 7px; border-radius:20px; }

.sb-footer { padding:16px 16px 0; border-top:1px solid var(--border); margin:0 12px; flex-shrink:0; }
.sb-user { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; cursor:pointer; transition:background 0.2s; }
.sb-user:hover { background:var(--mustard-soft); }
.sb-avatar { width:34px; height:34px; background:linear-gradient(135deg,var(--mustard),#8b5a0a); border-radius:50%; display:grid; place-items:center; font-family:'Playfair Display',serif; font-size:0.9rem; color:#2a0a0f; font-weight:700; flex-shrink:0; }
.sb-user-name { font-size:0.85rem; font-weight:500; color:var(--text); }
.sb-user-role { font-size:0.7rem; color:var(--mustard); }
.sb-logout { display:flex; align-items:center; gap:10px; width:100%; padding:10px 12px; margin-top:6px; border-radius:10px; border:none; background:transparent; color:var(--danger); font-family:'DM Sans',sans-serif; font-size:0.87rem; cursor:pointer; transition:background 0.2s; text-align:left; }
.sb-logout:hover { background:var(--danger-soft); }
.sb-logout svg { width:17px; height:17px; }

/* ── MAIN ── */
.qg-main { margin-left:var(--sidebar-w); flex:1; padding:36px 44px; overflow-y:scroll; height:100vh; }
.qg-main::-webkit-scrollbar { width:5px; }
.qg-main::-webkit-scrollbar-track { background:transparent; }
.qg-main::-webkit-scrollbar-thumb { background:var(--border); border-radius:3px; }

/* ── TOPBAR ── */
.qg-topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; animation:fadeUp 0.5s 0.1s ease both; }
.topbar-l { display:flex; align-items:center; gap:12px; }
.greeting-sub { font-size:0.75rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--mustard); font-weight:500; margin-bottom:5px; }
.greeting-main { font-family:'Playfair Display',serif; font-size:clamp(1.5rem,2.5vw,2.2rem); line-height:1.1; letter-spacing:-0.03em; }
.greeting-main span { color:var(--mustard); }
.topbar-r { display:flex; align-items:center; gap:12px; }
.icon-btn { width:40px; height:40px; background:var(--panel); border:1px solid var(--border); border-radius:10px; display:grid; place-items:center; cursor:pointer; transition:all 0.2s; color:var(--muted); }
.icon-btn:hover { border-color:var(--mustard); color:var(--mustard); }
.icon-btn svg { width:18px; height:18px; }
.date-chip { padding:8px 16px; background:var(--panel); border:1px solid var(--border); border-radius:10px; font-size:0.75rem; color:var(--muted); letter-spacing:0.04em; }

/* ── STEP PROGRESS ── */
.step-bar { display:flex; align-items:center; gap:0; margin-bottom:32px; animation:fadeUp 0.5s 0.15s ease both; }
.step-item { display:flex; align-items:center; gap:10px; flex:1; }
.step-item:last-child { flex:0; }
.step-circle {
  width:32px; height:32px; border-radius:50%;
  display:grid; place-items:center;
  font-family:'Playfair Display',serif; font-size:0.8rem; font-weight:700;
  border:2px solid var(--border); color:var(--muted);
  transition:all 0.3s; flex-shrink:0;
  background:var(--input-bg);
}
.step-circle.done { background:var(--mustard-soft); border-color:var(--mustard); color:var(--mustard); }
.step-circle.active { background:var(--mustard); border-color:var(--mustard); color:#2a0a0f; box-shadow:0 0 16px var(--mustard-glow); }
.step-label { font-size:0.72rem; color:var(--muted); white-space:nowrap; transition:color 0.3s; }
.step-label.active { color:var(--mustard); font-weight:500; }
.step-label.done { color:var(--text); }
.step-line { flex:1; height:1px; background:var(--border); margin:0 10px; position:relative; overflow:hidden; }
.step-line::after { content:''; position:absolute; top:0; left:0; height:100%; background:var(--mustard); transition:width 0.4s ease; }
.step-line.done::after { width:100%; }
.step-line.half::after { width:50%; }
.step-line.empty::after { width:0%; }

/* ── CARD ── */
.qg-card { background:var(--panel); border:1px solid var(--border); border-radius:18px; overflow:hidden; margin-bottom:20px; animation:fadeUp 0.5s 0.2s ease both; }
.qg-card-header { padding:22px 28px 0; display:flex; align-items:center; justify-content:space-between; }
.qg-card-title { font-family:'Playfair Display',serif; font-size:1.05rem; letter-spacing:-0.02em; }
.qg-card-sub { font-size:0.73rem; color:var(--muted); margin-top:3px; }
.qg-card-body { padding:22px 28px 28px; }

/* ── FORM ELEMENTS ── */
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
.form-row.cols3 { grid-template-columns:1fr 1fr 1fr; }
.form-row.single { grid-template-columns:1fr; }

.field { display:flex; flex-direction:column; gap:6px; }
.field-label { font-size:0.7rem; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:var(--muted); }

.field-input {
  background:var(--input-bg); border:1px solid var(--border);
  border-radius:10px; padding:11px 14px;
  color:var(--text); font-family:'DM Sans',sans-serif; font-size:0.85rem;
  outline:none; transition:border-color 0.2s, box-shadow 0.2s;
  width:100%;
}
.field-input:focus { border-color:var(--mustard); box-shadow:0 0 0 3px var(--mustard-soft); }
.field-input::placeholder { color:var(--muted); }

textarea.field-input { resize:vertical; min-height:80px; line-height:1.6; }

select.field-input { cursor:pointer; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23b87a80' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:36px; }

/* tags / chips */
.tag-row { display:flex; flex-wrap:wrap; gap:6px; margin-top:4px; }
.tag { padding:4px 12px; border-radius:20px; border:1px solid var(--border); background:var(--input-bg); font-size:0.72rem; color:var(--muted); cursor:pointer; transition:all 0.2s; }
.tag:hover { border-color:rgba(212,160,23,0.4); color:var(--text); }
.tag.selected { background:var(--mustard-soft); border-color:rgba(212,160,23,0.5); color:var(--mustard); }

/* difficulty pills */
.diff-row { display:flex; gap:8px; margin-top:4px; }
.diff-pill { flex:1; padding:8px 0; border-radius:10px; text-align:center; font-size:0.72rem; font-weight:600; letter-spacing:0.05em; cursor:pointer; border:1px solid var(--border); background:var(--input-bg); color:var(--muted); transition:all 0.2s; }
.diff-pill.easy.selected   { background:rgba(168,230,163,0.12); border-color:rgba(168,230,163,0.4); color:var(--green); }
.diff-pill.medium.selected { background:var(--mustard-soft); border-color:rgba(212,160,23,0.4); color:var(--mustard); }
.diff-pill.hard.selected   { background:var(--danger-soft); border-color:rgba(255,138,128,0.4); color:var(--danger); }
.diff-pill:hover:not(.selected) { border-color:rgba(212,160,23,0.3); color:var(--text); }

/* ── QUESTIONS SECTION ── */
.q-list { display:flex; flex-direction:column; gap:14px; }

.q-item {
  background:var(--input-bg); border:1px solid var(--border);
  border-radius:14px; overflow:hidden;
  transition:border-color 0.2s;
  animation:fadeUp 0.3s ease both;
}
.q-item:hover { border-color:rgba(212,160,23,0.3); }
.q-item.expanded { border-color:rgba(212,160,23,0.4); }

.q-item-header {
  display:flex; align-items:center; gap:12px;
  padding:14px 18px; cursor:pointer;
}
.q-num {
  width:26px; height:26px; border-radius:50%; flex-shrink:0;
  display:grid; place-items:center;
  font-family:'Playfair Display',serif; font-size:0.75rem; font-weight:700;
  background:var(--mustard-soft); border:1px solid rgba(212,160,23,0.3); color:var(--mustard);
}
.q-preview { flex:1; font-size:0.83rem; color:var(--text); min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.q-preview.placeholder { color:var(--muted); font-style:italic; }
.q-type-badge { font-size:0.62rem; padding:2px 9px; border-radius:20px; font-weight:600; letter-spacing:0.04em; background:var(--mustard-soft); color:var(--mustard); white-space:nowrap; }
.q-chevron { color:var(--muted); transition:transform 0.25s; flex-shrink:0; }
.q-chevron.open { transform:rotate(180deg); }
.q-chevron svg { width:14px; height:14px; }
.q-del { color:var(--muted); transition:color 0.2s; flex-shrink:0; cursor:pointer; background:none; border:none; padding:2px; display:grid; place-items:center; }
.q-del:hover { color:var(--danger); }
.q-del svg { width:15px; height:15px; }

.q-item-body { padding:0 18px 18px; border-top:1px solid var(--border); padding-top:16px; }

/* Options for MCQ */
.option-list { display:flex; flex-direction:column; gap:8px; margin-top:8px; }
.option-row { display:flex; align-items:center; gap:10px; }
.option-letter {
  width:26px; height:26px; border-radius:6px; flex-shrink:0;
  display:grid; place-items:center; font-size:0.72rem; font-weight:700;
  background:var(--panel2); border:1px solid var(--border); color:var(--muted);
  font-family:'Playfair Display',serif; transition:all 0.2s;
}
.option-row.correct .option-letter { background:var(--green-soft); border-color:rgba(168,230,163,0.4); color:var(--green); }
.option-input {
  flex:1; background:var(--panel2); border:1px solid var(--border);
  border-radius:8px; padding:8px 12px; color:var(--text);
  font-family:'DM Sans',sans-serif; font-size:0.82rem; outline:none;
  transition:border-color 0.2s;
}
.option-input:focus { border-color:var(--mustard); }
.option-input::placeholder { color:var(--muted); }
.correct-toggle { width:28px; height:28px; border-radius:50%; flex-shrink:0; border:2px solid var(--border); background:var(--panel2); cursor:pointer; transition:all 0.2s; display:grid; place-items:center; }
.correct-toggle:hover { border-color:var(--green); }
.correct-toggle.active { background:var(--green-soft); border-color:var(--green); }
.correct-toggle svg { width:12px; height:12px; color:var(--green); }

.add-option-btn {
  display:flex; align-items:center; gap:8px; margin-top:8px;
  background:none; border:none; color:var(--muted); font-family:'DM Sans',sans-serif;
  font-size:0.78rem; cursor:pointer; padding:6px 0; transition:color 0.2s;
}
.add-option-btn:hover { color:var(--mustard); }
.add-option-btn svg { width:14px; height:14px; }

/* TF toggle */
.tf-toggle { display:flex; gap:8px; margin-top:8px; }
.tf-btn { flex:1; padding:10px; border-radius:10px; border:1px solid var(--border); background:var(--panel2); color:var(--muted); font-family:'DM Sans',sans-serif; font-size:0.82rem; font-weight:500; cursor:pointer; transition:all 0.2s; text-align:center; }
.tf-btn.true.selected { background:var(--green-soft); border-color:rgba(168,230,163,0.4); color:var(--green); }
.tf-btn.false.selected { background:var(--danger-soft); border-color:rgba(255,138,128,0.4); color:var(--danger); }
.tf-btn:hover:not(.selected) { border-color:rgba(212,160,23,0.3); color:var(--text); }

/* ── ADD QUESTION BUTTON ── */
.add-q-btn {
  width:100%; padding:14px; margin-top:4px;
  border-radius:12px; border:1px dashed rgba(212,160,23,0.35);
  background:rgba(212,160,23,0.04); color:var(--mustard);
  font-family:'DM Sans',sans-serif; font-size:0.85rem; font-weight:500;
  cursor:pointer; transition:all 0.2s;
  display:flex; align-items:center; justify-content:center; gap:8px;
}
.add-q-btn:hover { background:var(--mustard-soft); border-color:var(--mustard); }
.add-q-btn svg { width:16px; height:16px; }

/* question type picker */
.qtype-picker { display:flex; gap:8px; margin-bottom:14px; }
.qtype-btn {
  flex:1; padding:8px 10px; border-radius:10px; border:1px solid var(--border);
  background:var(--panel2); color:var(--muted); font-family:'DM Sans',sans-serif;
  font-size:0.73rem; font-weight:500; cursor:pointer; transition:all 0.2s; text-align:center;
}
.qtype-btn.active { background:var(--mustard-soft); border-color:rgba(212,160,23,0.4); color:var(--mustard); }
.qtype-btn:hover:not(.active) { border-color:rgba(212,160,23,0.3); color:var(--text); }

/* ── SETTINGS ROW ── */
.settings-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
.setting-card { background:var(--input-bg); border:1px solid var(--border); border-radius:12px; padding:16px; transition:border-color 0.2s; }
.setting-card:hover { border-color:rgba(212,160,23,0.3); }
.setting-card-label { font-size:0.65rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--muted); margin-bottom:10px; }
.setting-stepper { display:flex; align-items:center; gap:10px; }
.step-val { font-family:'Playfair Display',serif; font-size:1.4rem; color:var(--mustard); min-width:36px; text-align:center; }
.step-btn { width:28px; height:28px; border-radius:8px; border:1px solid var(--border); background:var(--panel2); color:var(--muted); cursor:pointer; display:grid; place-items:center; transition:all 0.2s; font-size:1rem; line-height:1; }
.step-btn:hover { border-color:var(--mustard); color:var(--mustard); }

/* toggle switch */
.toggle-wrap { display:flex; align-items:center; justify-content:space-between; }
.toggle { width:40px; height:22px; border-radius:11px; background:var(--border); position:relative; cursor:pointer; transition:background 0.25s; border:none; flex-shrink:0; }
.toggle.on { background:var(--mustard); }
.toggle::after { content:''; position:absolute; width:16px; height:16px; border-radius:50%; background:var(--text); top:3px; left:3px; transition:transform 0.25s; }
.toggle.on::after { transform:translateX(18px); }
.toggle-label { font-size:0.8rem; color:var(--text); }
.toggle-sub { font-size:0.68rem; color:var(--muted); margin-top:2px; }

/* ── PREVIEW MODE ── */
.preview-wrap { animation:fadeUp 0.4s ease both; }
.preview-header {
  background:linear-gradient(135deg,var(--panel),var(--panel2));
  border:1px solid var(--border); border-radius:18px; padding:28px 32px;
  margin-bottom:20px; position:relative; overflow:hidden;
}
.preview-header::before {
  content:''; position:absolute; top:0; left:0; right:0; height:2px;
  background:linear-gradient(to right, transparent, var(--mustard), transparent);
  opacity:0.6;
}
.preview-title { font-family:'Playfair Display',serif; font-size:1.5rem; letter-spacing:-0.02em; margin-bottom:6px; }
.preview-meta { font-size:0.78rem; color:var(--muted); display:flex; gap:16px; flex-wrap:wrap; }
.preview-meta-chip { display:flex; align-items:center; gap:5px; }
.preview-meta-chip svg { width:13px; height:13px; color:var(--mustard); }

.preview-q-card {
  background:var(--panel); border:1px solid var(--border); border-radius:14px; padding:22px 24px;
  margin-bottom:14px; transition:border-color 0.2s;
  animation:fadeUp 0.3s ease both;
}
.preview-q-card:hover { border-color:rgba(212,160,23,0.3); }
.preview-q-num { font-size:0.65rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--mustard); margin-bottom:8px; font-weight:600; }
.preview-q-text { font-family:'Playfair Display',serif; font-size:1rem; line-height:1.5; margin-bottom:16px; }
.preview-opts { display:flex; flex-direction:column; gap:8px; }
.preview-opt {
  display:flex; align-items:center; gap:10px; padding:10px 14px;
  border-radius:10px; border:1px solid var(--border); background:var(--input-bg);
  cursor:pointer; transition:all 0.2s; font-size:0.83rem;
}
.preview-opt:hover { border-color:rgba(212,160,23,0.4); background:var(--mustard-soft); }
.preview-opt.correct { border-color:rgba(168,230,163,0.5); background:var(--green-soft); color:var(--green); }
.opt-letter-sm { width:22px; height:22px; border-radius:5px; background:var(--panel2); border:1px solid var(--border); display:grid; place-items:center; font-size:0.68rem; font-weight:700; font-family:'Playfair Display',serif; flex-shrink:0; color:var(--muted); }

/* ── ACTION BAR ── */
.action-bar { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:20px 0 4px; animation:fadeUp 0.5s 0.3s ease both; }
.action-bar-left { display:flex; gap:10px; }
.btn { padding:11px 22px; border-radius:10px; font-family:'DM Sans',sans-serif; font-size:0.85rem; font-weight:500; cursor:pointer; transition:all 0.2s; border:none; display:flex; align-items:center; gap:8px; }
.btn svg { width:15px; height:15px; }
.btn-ghost { background:transparent; border:1px solid var(--border); color:var(--muted); }
.btn-ghost:hover { border-color:var(--mustard); color:var(--mustard); }
.btn-outline { background:transparent; border:1px solid rgba(212,160,23,0.4); color:var(--mustard); }
.btn-outline:hover { background:var(--mustard-soft); }
.btn-primary { background:var(--mustard); color:#2a0a0f; font-weight:600; }
.btn-primary:hover { background:#e6b020; transform:translateY(-1px); box-shadow:0 4px 20px var(--mustard-mid); }
.btn-primary:active { transform:translateY(0); }
.btn-danger { background:var(--danger-soft); border:1px solid rgba(255,138,128,0.3); color:var(--danger); }
.btn-danger:hover { background:rgba(255,138,128,0.2); }

/* counter badge */
.q-count-badge {
  display:flex; align-items:center; gap:8px; padding:8px 16px;
  background:var(--input-bg); border:1px solid var(--border); border-radius:10px;
  font-size:0.78rem; color:var(--muted);
}
.q-count-badge strong { color:var(--mustard); font-family:'Playfair Display',serif; font-size:1rem; }

/* ── PUBLISHED SUCCESS ── */
.success-screen { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:50vh; text-align:center; animation:fadeUp 0.5s ease both; padding:40px; }
.success-icon { width:80px; height:80px; border-radius:50%; background:var(--green-soft); border:2px solid rgba(168,230,163,0.4); display:grid; place-items:center; margin:0 auto 24px; color:var(--green); }
.success-icon svg { width:36px; height:36px; }
.success-title { font-family:'Playfair Display',serif; font-size:2rem; letter-spacing:-0.03em; margin-bottom:10px; }
.success-sub { font-size:0.88rem; color:var(--muted); max-width:340px; line-height:1.7; margin-bottom:32px; }
.success-chips { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-bottom:32px; }
.s-chip { padding:6px 16px; border-radius:20px; font-size:0.75rem; background:var(--mustard-soft); border:1px solid rgba(212,160,23,0.3); color:var(--mustard); }

/* ── HAMBURGER ── */
.hamburger { display:none; width:40px; height:40px; background:var(--panel); border:1px solid var(--border); border-radius:10px; align-items:center; justify-content:center; cursor:pointer; color:var(--muted); flex-shrink:0; transition:all 0.2s; }
.hamburger:hover { border-color:var(--mustard); color:var(--mustard); }
.hamburger svg { width:18px; height:18px; }
.sb-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.55); backdrop-filter:blur(2px); z-index:40; opacity:0; transition:opacity 0.3s; }
.sb-overlay.show { opacity:1; }

/* ── MODAL ── */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); z-index:200; display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; transition:opacity 0.25s; }
.modal-overlay.show { opacity:1; pointer-events:all; }
.modal-box { background:var(--panel); border:1px solid var(--border); border-radius:20px; padding:36px 32px; width:100%; max-width:360px; text-align:center; position:relative; transform:scale(0.92) translateY(12px); transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1); box-shadow:0 24px 60px rgba(0,0,0,0.5); }
.modal-overlay.show .modal-box { transform:scale(1) translateY(0); }
.modal-box::before { content:''; position:absolute; top:0; left:20%; right:20%; height:1px; background:linear-gradient(to right,transparent,var(--mustard),transparent); opacity:0.4; }
.modal-icon { width:56px; height:56px; background:var(--danger-soft); border:1px solid rgba(255,138,128,0.25); border-radius:50%; display:grid; place-items:center; margin:0 auto 20px; color:var(--danger); }
.modal-icon svg { width:24px; height:24px; }
.modal-title { font-size:1.3rem; font-weight:600; margin-bottom:10px; }
.modal-desc { font-size:0.83rem; color:var(--muted); line-height:1.6; margin-bottom:28px; }
.modal-actions { display:flex; gap:12px; }
.modal-cancel { flex:1; padding:12px; background:var(--input-bg); border:1px solid var(--border); border-radius:10px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:0.88rem; font-weight:500; cursor:pointer; transition:all 0.2s; }
.modal-cancel:hover { border-color:var(--mustard); background:var(--mustard-soft); }
.modal-confirm { flex:1; padding:12px; background:var(--danger); border:none; border-radius:10px; color:#2a0a0f; font-family:'DM Sans',sans-serif; font-size:0.88rem; font-weight:700; cursor:pointer; transition:all 0.2s; }
.modal-confirm:hover { background:#ff6b6b; transform:translateY(-1px); }

/* ── ANIMATIONS ── */
@keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideInLeft { from { transform:translateX(-30px); opacity:0; } to { transform:translateX(0); opacity:1; } }

/* ── RESPONSIVE ── */
@media (max-width:1024px) {
  .settings-grid { grid-template-columns:1fr 1fr; }
  .form-row.cols3 { grid-template-columns:1fr 1fr; }
}
@media (max-width:768px) {
  .hamburger { display:flex; }
  .qg-sidebar { transform:translateX(-100%); animation:none; }
  .sb-overlay { display:block; pointer-events:all; }
  .qg-main { margin-left:0; padding:20px 16px; }
  .date-chip { display:none; }
  .form-row { grid-template-columns:1fr; }
  .form-row.cols3 { grid-template-columns:1fr; }
  .settings-grid { grid-template-columns:1fr; }
  .action-bar { flex-wrap:wrap; }
}
`;

/* ─────────────────────────────────────────────
   DATA & HELPERS
───────────────────────────────────────────── */
const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Filipino', 'MAPEH', 'TLE'];
const GRADES   = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
const SECTIONS = ['Section A', 'Section B', 'Section C', 'Section D'];
const Q_TYPES  = ['Multiple Choice', 'True / False', 'Short Answer', 'Essay'];
const LETTERS   = ['A','B','C','D','E'];

function makeQuestion(id) {
  return {
    id,
    type: 'Multiple Choice',
    text: '',
    options: [
      { id:0, text:'', correct:true  },
      { id:1, text:'', correct:false },
      { id:2, text:'', correct:false },
      { id:3, text:'', correct:false },
    ],
    tfAnswer: null,
    expanded: true,
  };
}

const NAV_ITEMS = [
  { label:'Dashboard',       active:false },
  { label:'My Classes',      active:false },
  { label:'Lectures',        active:false },
  { label:'Manage Quizzes',  active:true,  badge:'3' },
  { label:'Leaderboard',     active:false },
  { label:'Grades & Reports',active:false },
];

const NAV_ICONS = {
  'Dashboard': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  'My Classes': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  'Lectures': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  'Manage Quizzes': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
  'Leaderboard': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  'Grades & Reports': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */

function QuestionItem({ q, idx, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(q.expanded);

  function updateField(field, val) { onUpdate(q.id, { ...q, [field]: val }); }

  function updateOption(oid, text) {
    onUpdate(q.id, { ...q, options: q.options.map(o => o.id === oid ? { ...o, text } : o) });
  }
  function setCorrect(oid) {
    onUpdate(q.id, { ...q, options: q.options.map(o => ({ ...o, correct: o.id === oid })) });
  }
  function addOption() {
    if (q.options.length >= 5) return;
    const newId = q.options.length;
    onUpdate(q.id, { ...q, options: [...q.options, { id:newId, text:'', correct:false }] });
  }
  function removeOption(oid) {
    if (q.options.length <= 2) return;
    const updated = q.options.filter(o => o.id !== oid).map((o, i) => ({ ...o, id:i }));
    if (!updated.some(o => o.correct)) updated[0].correct = true;
    onUpdate(q.id, { ...q, options: updated });
  }

  const preview = q.text.trim() || null;

  return (
    <div className={`q-item${expanded ? ' expanded' : ''}`}>
      <div className="q-item-header" onClick={() => setExpanded(v => !v)}>
        <div className="q-num">{idx + 1}</div>
        <div className={`q-preview${!preview ? ' placeholder' : ''}`}>
          {preview || 'Click to write your question…'}
        </div>
        <div className="q-type-badge">{q.type === 'True / False' ? 'T/F' : q.type === 'Multiple Choice' ? 'MCQ' : q.type === 'Short Answer' ? 'Short' : 'Essay'}</div>
        <button className="q-del" onClick={e => { e.stopPropagation(); onDelete(q.id); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
        </button>
        <div className={`q-chevron${expanded ? ' open' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </div>

      {expanded && (
        <div className="q-item-body">
          {/* Type picker */}
          <div className="qtype-picker">
            {Q_TYPES.map(t => (
              <button key={t} className={`qtype-btn${q.type === t ? ' active' : ''}`} onClick={() => updateField('type', t)}>
                {t === 'Multiple Choice' ? 'MCQ' : t === 'True / False' ? 'True / False' : t}
              </button>
            ))}
          </div>

          {/* Question text */}
          <div className="field" style={{ marginBottom:14 }}>
            <label className="field-label">Question</label>
            <textarea
              className="field-input"
              placeholder="Type your question here…"
              value={q.text}
              onChange={e => updateField('text', e.target.value)}
              rows={2}
            />
          </div>

          {/* MCQ options */}
          {q.type === 'Multiple Choice' && (
            <div>
              <div className="field-label" style={{ marginBottom:8 }}>Answer Options <span style={{ color:'var(--green)', fontWeight:400, textTransform:'none', letterSpacing:0, fontSize:'0.65rem' }}>— tick the correct one</span></div>
              <div className="option-list">
                {q.options.map((opt, i) => (
                  <div className={`option-row${opt.correct ? ' correct' : ''}`} key={opt.id}>
                    <div className="option-letter">{LETTERS[i]}</div>
                    <input
                      className="option-input"
                      type="text"
                      placeholder={`Option ${LETTERS[i]}…`}
                      value={opt.text}
                      onChange={e => updateOption(opt.id, e.target.value)}
                    />
                    <button className={`correct-toggle${opt.correct ? ' active' : ''}`} onClick={() => setCorrect(opt.id)} title="Mark as correct">
                      {opt.correct && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                    {q.options.length > 2 && (
                      <button className="q-del" onClick={() => removeOption(opt.id)} style={{ marginLeft:2 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {q.options.length < 5 && (
                <button className="add-option-btn" onClick={addOption}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add option
                </button>
              )}
            </div>
          )}

          {/* True/False */}
          {q.type === 'True / False' && (
            <div>
              <div className="field-label" style={{ marginBottom:8 }}>Correct Answer</div>
              <div className="tf-toggle">
                <button className={`tf-btn true${q.tfAnswer === true ? ' selected' : ''}`} onClick={() => updateField('tfAnswer', true)}>✓ True</button>
                <button className={`tf-btn false${q.tfAnswer === false ? ' selected' : ''}`} onClick={() => updateField('tfAnswer', false)}>✗ False</button>
              </div>
            </div>
          )}

          {/* Short / Essay */}
          {(q.type === 'Short Answer' || q.type === 'Essay') && (
            <div className="field">
              <label className="field-label">Model Answer / Rubric (optional)</label>
              <textarea className="field-input" placeholder="Describe expected answer or grading rubric…" rows={3} />
            </div>
          )}

          {/* Points */}
          <div className="field" style={{ marginTop:14, maxWidth:140 }}>
            <label className="field-label">Points</label>
            <input className="field-input" type="number" min="1" max="100" defaultValue="1" style={{ textAlign:'center' }} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function QuizGenerator() {
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [showLogout,   setShowLogout]   = useState(false);
  const [step,         setStep]         = useState(0); // 0=details, 1=questions, 2=settings, 3=preview, 4=published
  const [previewing,   setPreviewing]   = useState(false);

  // Details
  const [title,       setTitle]       = useState('');
  const [subject,     setSubject]     = useState('Mathematics');
  const [grade,       setGrade]       = useState('Grade 10');
  const [section,     setSection]     = useState('Section A');
  const [description, setDescription] = useState('');
  const [difficulty,  setDifficulty]  = useState('Medium');
  const [selectedTags, setSelectedTags] = useState(['Algebra']);

  // Questions
  const [questions,   setQuestions]   = useState([makeQuestion(1)]);
  const nextId = useRef(2);

  // Settings
  const [timeLimit, setTimeLimit]   = useState(30);
  const [attempts,  setAttempts]    = useState(1);
  const [shuffleQ,  setShuffleQ]    = useState(true);
  const [shuffleA,  setShuffleA]    = useState(false);
  const [showScore, setShowScore]   = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);

  const TAGS = ['Algebra','Geometry','Statistics','Fractions','Calculus','Trigonometry'];

  function addQuestion() {
    const id = nextId.current++;
    setQuestions(qs => [...qs, makeQuestion(id)]);
  }

  function updateQuestion(id, updated) {
    setQuestions(qs => qs.map(q => q.id === id ? updated : q));
  }

  function deleteQuestion(id) {
    if (questions.length === 1) return;
    setQuestions(qs => qs.filter(q => q.id !== id));
  }

  function toggleTag(t) {
    setSelectedTags(ts => ts.includes(t) ? ts.filter(x => x !== t) : [...ts, t]);
  }

  const stepLabels = ['Details', 'Questions', 'Settings', 'Preview'];
  const lineState = (i) => {
    if (i < step) return 'done';
    if (i === step - 1 || (step > i)) return 'done';
    return 'empty';
  };

  return (
    <>
      <style>{styles}</style>
      <div className="qg-layout">

        {/* SIDEBAR */}
        <aside className={`qg-sidebar${sidebarOpen ? ' open' : ''}`}>
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
              <div>
                <div className="sb-user-name">Mr. Francis Patalen</div>
                <div className="sb-user-role">✦ Teacher</div>
              </div>
            </div>
            <button className="sb-logout" onClick={() => setShowLogout(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Log Out
            </button>
          </div>
        </aside>

        {/* SIDEBAR OVERLAY */}
        <div className={`sb-overlay${sidebarOpen ? ' show' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* MAIN */}
        <main className="qg-main">

          {/* TOPBAR */}
          <div className="qg-topbar">
            <div className="topbar-l">
              <button className="hamburger" onClick={() => setSidebarOpen(v => !v)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <div>
                <div className="greeting-sub">✦ Manage Quizzes</div>
                <h1 className="greeting-main">Create <span>New Quiz.</span></h1>
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

          {/* STEP PROGRESS */}
          {step < 4 && (
            <div className="step-bar">
              {stepLabels.map((label, i) => (
                <div className="step-item" key={label}>
                  <div className={`step-circle${step === i ? ' active' : step > i ? ' done' : ''}`}>
                    {step > i
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width:13, height:13 }}><polyline points="20 6 9 17 4 12"/></svg>
                      : i + 1
                    }
                  </div>
                  <div className={`step-label${step === i ? ' active' : step > i ? ' done' : ''}`}>{label}</div>
                  {i < stepLabels.length - 1 && (
                    <div className={`step-line${step > i ? ' done' : ''}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── STEP 0: DETAILS ── */}
          {step === 0 && (
            <>
              <div className="qg-card">
                <div className="qg-card-header">
                  <div>
                    <div className="qg-card-title">Quiz Details</div>
                    <div className="qg-card-sub">Fill in the basic information about your quiz</div>
                  </div>
                </div>
                <div className="qg-card-body">
                  <div className="form-row single">
                    <div className="field">
                      <label className="field-label">Quiz Title</label>
                      <input className="field-input" type="text" placeholder="e.g. Algebra & Quadratic Equations" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-row cols3">
                    <div className="field">
                      <label className="field-label">Subject</label>
                      <select className="field-input" value={subject} onChange={e => setSubject(e.target.value)}>
                        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">Grade Level</label>
                      <select className="field-input" value={grade} onChange={e => setGrade(e.target.value)}>
                        {GRADES.map(g => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">Section</label>
                      <select className="field-input" value={section} onChange={e => setSection(e.target.value)}>
                        {SECTIONS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-row single">
                    <div className="field">
                      <label className="field-label">Description / Instructions</label>
                      <textarea className="field-input" placeholder="Write any special instructions for students…" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="field">
                      <label className="field-label">Difficulty</label>
                      <div className="diff-row">
                        {['Easy','Medium','Hard'].map(d => (
                          <div key={d} className={`diff-pill ${d.toLowerCase()}${difficulty === d ? ' selected' : ''}`} onClick={() => setDifficulty(d)}>{d}</div>
                        ))}
                      </div>
                    </div>
                    <div className="field">
                      <label className="field-label">Topics / Tags</label>
                      <div className="tag-row">
                        {TAGS.map(t => (
                          <div key={t} className={`tag${selectedTags.includes(t) ? ' selected' : ''}`} onClick={() => toggleTag(t)}>{t}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="action-bar">
                <div className="action-bar-left">
                  <button className="btn btn-ghost">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Save Draft
                  </button>
                </div>
                <button className="btn btn-primary" onClick={() => setStep(1)}>
                  Continue to Questions
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </>
          )}

          {/* ── STEP 1: QUESTIONS ── */}
          {step === 1 && (
            <>
              <div className="qg-card">
                <div className="qg-card-header">
                  <div>
                    <div className="qg-card-title">Question Builder</div>
                    <div className="qg-card-sub">Add and configure all questions for <strong style={{ color:'var(--mustard)' }}>{title || 'your quiz'}</strong></div>
                  </div>
                  <div className="q-count-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width:14, height:14 }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                    <strong>{questions.length}</strong> question{questions.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="qg-card-body">
                  <div className="q-list">
                    {questions.map((q, i) => (
                      <QuestionItem key={q.id} q={q} idx={i} onUpdate={updateQuestion} onDelete={deleteQuestion} />
                    ))}
                  </div>
                  <button className="add-q-btn" style={{ marginTop:14 }} onClick={addQuestion}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Question
                  </button>
                </div>
              </div>

              <div className="action-bar">
                <div className="action-bar-left">
                  <button className="btn btn-ghost" onClick={() => setStep(0)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Back
                  </button>
                  <button className="btn btn-ghost">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
                    Save Draft
                  </button>
                </div>
                <button className="btn btn-primary" onClick={() => setStep(2)}>
                  Continue to Settings
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2: SETTINGS ── */}
          {step === 2 && (
            <>
              <div className="qg-card">
                <div className="qg-card-header">
                  <div>
                    <div className="qg-card-title">Quiz Settings</div>
                    <div className="qg-card-sub">Configure timing, access, and scoring behaviour</div>
                  </div>
                </div>
                <div className="qg-card-body">

                  {/* Timing & Attempts */}
                  <div style={{ marginBottom:24 }}>
                    <div className="field-label" style={{ marginBottom:12 }}>Timing & Attempts</div>
                    <div className="settings-grid">
                      {/* Time limit */}
                      <div className="setting-card">
                        <div className="setting-card-label">Time Limit (min)</div>
                        <div className="setting-stepper">
                          <button className="step-btn" onClick={() => setTimeLimit(v => Math.max(5, v - 5))}>−</button>
                          <div className="step-val">{timeLimit}</div>
                          <button className="step-btn" onClick={() => setTimeLimit(v => Math.min(180, v + 5))}>+</button>
                        </div>
                      </div>
                      {/* Attempts */}
                      <div className="setting-card">
                        <div className="setting-card-label">Allowed Attempts</div>
                        <div className="setting-stepper">
                          <button className="step-btn" onClick={() => setAttempts(v => Math.max(1, v - 1))}>−</button>
                          <div className="step-val">{attempts}</div>
                          <button className="step-btn" onClick={() => setAttempts(v => Math.min(5, v + 1))}>+</button>
                        </div>
                      </div>
                      {/* Points */}
                      <div className="setting-card">
                        <div className="setting-card-label">Total Points</div>
                        <div className="step-val" style={{ marginTop:4 }}>{questions.length}</div>
                        <div style={{ fontSize:'0.65rem', color:'var(--muted)', marginTop:2 }}>1 pt per question</div>
                      </div>
                    </div>
                  </div>

                  {/* Shuffle & Visibility */}
                  <div>
                    <div className="field-label" style={{ marginBottom:12 }}>Behaviour & Visibility</div>
                    <div className="settings-grid">
                      <div className="setting-card">
                        <div className="toggle-wrap">
                          <div>
                            <div className="toggle-label">Shuffle Questions</div>
                            <div className="toggle-sub">Randomise question order per student</div>
                          </div>
                          <button className={`toggle${shuffleQ ? ' on' : ''}`} onClick={() => setShuffleQ(v => !v)} />
                        </div>
                      </div>
                      <div className="setting-card">
                        <div className="toggle-wrap">
                          <div>
                            <div className="toggle-label">Shuffle Answers</div>
                            <div className="toggle-sub">Randomise MCQ option order</div>
                          </div>
                          <button className={`toggle${shuffleA ? ' on' : ''}`} onClick={() => setShuffleA(v => !v)} />
                        </div>
                      </div>
                      <div className="setting-card">
                        <div className="toggle-wrap">
                          <div>
                            <div className="toggle-label">Show Score</div>
                            <div className="toggle-sub">Display results after submission</div>
                          </div>
                          <button className={`toggle${showScore ? ' on' : ''}`} onClick={() => setShowScore(v => !v)} />
                        </div>
                      </div>
                      <div className="setting-card">
                        <div className="toggle-wrap">
                          <div>
                            <div className="toggle-label">Show Answers</div>
                            <div className="toggle-sub">Reveal correct answers after quiz</div>
                          </div>
                          <button className={`toggle${showAnswers ? ' on' : ''}`} onClick={() => setShowAnswers(v => !v)} />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="action-bar">
                <div className="action-bar-left">
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Back
                  </button>
                </div>
                <button className="btn btn-primary" onClick={() => setStep(3)}>
                  Preview Quiz
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: PREVIEW ── */}
          {step === 3 && (
            <>
              <div className="preview-wrap">
                <div className="preview-header">
                  <div className="preview-title">{title || 'Untitled Quiz'}</div>
                  <div className="preview-meta">
                    <div className="preview-meta-chip">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                      {subject} · {grade} · {section}
                    </div>
                    <div className="preview-meta-chip">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {timeLimit} min
                    </div>
                    <div className="preview-meta-chip">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
                      {questions.length} questions · {questions.length} pts
                    </div>
                    <div className="preview-meta-chip">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                      {difficulty}
                    </div>
                  </div>
                  {description && <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:14, lineHeight:1.6 }}>{description}</div>}
                </div>

                {questions.map((q, i) => (
                  <div className="preview-q-card" key={q.id}>
                    <div className="preview-q-num">Question {i + 1} · {q.type}</div>
                    <div className="preview-q-text">{q.text || <em style={{ color:'var(--muted)', fontStyle:'normal' }}>No question text entered</em>}</div>

                    {q.type === 'Multiple Choice' && (
                      <div className="preview-opts">
                        {q.options.map((opt, oi) => (
                          <div key={opt.id} className={`preview-opt${opt.correct ? ' correct' : ''}`}>
                            <div className="opt-letter-sm">{LETTERS[oi]}</div>
                            {opt.text || <em style={{ opacity:0.5 }}>Option {LETTERS[oi]}</em>}
                            {opt.correct && <svg style={{ marginLeft:'auto', width:14, height:14, color:'var(--green)', flexShrink:0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === 'True / False' && (
                      <div className="preview-opts" style={{ flexDirection:'row' }}>
                        <div className={`preview-opt${q.tfAnswer === true ? ' correct' : ''}`} style={{ flex:1 }}>✓ True</div>
                        <div className={`preview-opt${q.tfAnswer === false ? ' correct' : ''}`} style={{ flex:1 }}>✗ False</div>
                      </div>
                    )}

                    {(q.type === 'Short Answer' || q.type === 'Essay') && (
                      <div style={{ height:q.type === 'Essay' ? 80 : 42, border:'1px solid var(--border)', borderRadius:10, background:'var(--input-bg)', marginTop:4, display:'flex', alignItems:'center', padding:'0 14px' }}>
                        <span style={{ fontSize:'0.78rem', color:'var(--muted)', fontStyle:'italic' }}>Student response area</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="action-bar">
                <div className="action-bar-left">
                  <button className="btn btn-ghost" onClick={() => setStep(2)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Back
                  </button>
                  <button className="btn btn-outline" onClick={() => setStep(1)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit Questions
                  </button>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button className="btn btn-ghost">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
                    Save as Draft
                  </button>
                  <button className="btn btn-primary" onClick={() => setStep(4)}>
                    Publish Quiz
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── STEP 4: PUBLISHED ── */}
          {step === 4 && (
            <div className="success-screen">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 className="success-title">Quiz Published!</h2>
              <p className="success-sub">
                <strong style={{ color:'var(--mustard)' }}>{title || 'Your quiz'}</strong> is now live for {grade} {section}. Students can access it immediately from their dashboard.
              </p>
              <div className="success-chips">
                <div className="s-chip">{subject}</div>
                <div className="s-chip">{grade} · {section}</div>
                <div className="s-chip">{questions.length} questions</div>
                <div className="s-chip">{timeLimit} min</div>
                <div className="s-chip">{difficulty}</div>
              </div>
              <div style={{ display:'flex', gap:12 }}>
                <button className="btn btn-outline" onClick={() => {
                  setStep(0); setTitle(''); setQuestions([makeQuestion(1)]); nextId.current = 2;
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Create Another
                </button>
                <button className="btn btn-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                  View Results
                </button>
              </div>
            </div>
          )}

        </main>

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