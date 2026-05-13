import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getLectures, generateQuiz, saveQuiz, updateTeacherQuiz, getTeacherQuiz } from "../services/api";

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
    @keyframes checkPop   { 0%{transform:scale(0) rotate(-20deg);opacity:0;}60%{transform:scale(1.2) rotate(5deg);opacity:1;}100%{transform:scale(1) rotate(0);opacity:1;} }
    @keyframes successRing{ 0%{transform:scale(.7);opacity:0;}50%{transform:scale(1.12);}100%{transform:scale(1);opacity:1;} }
    @keyframes typein     { from{opacity:0;transform:translateX(-4px);}to{opacity:1;transform:translateX(0);} }
    @keyframes stepPing   { 0%{transform:scale(1);opacity:1;}70%{transform:scale(1.8);opacity:0;}100%{transform:scale(1);opacity:0;} }
    @keyframes orb        { 0%,100%{transform:translate(0,0) scale(1);}33%{transform:translate(20px,-15px) scale(1.08);}66%{transform:translate(-15px,12px) scale(.94);} }
    @keyframes pulseDot   { 0%,100%{opacity:.5;transform:scale(1);}50%{opacity:1;transform:scale(1.1);} }
    @keyframes loadingShimmer { 0%{background-position:-600px 0;}100%{background-position:600px 0;} }

    .gq-root {
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
    .gq-root::before {
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
    .gq-topbar {
      position: sticky; top:0; z-index:30;
      display:flex; align-items:center; justify-content:space-between;
      padding: 0 2rem; height:62px;
      background: rgba(26,10,10,.82);
      backdrop-filter: blur(18px) saturate(1.4);
      border-bottom: 1px solid rgba(200,160,50,.12);
      box-shadow: 0 1px 0 rgba(200,160,50,.06) inset, 0 4px 20px rgba(0,0,0,.4);
      animation: slideDown .4s ease both;
    }
    .gq-logo {
      display:flex; align-items:center; gap:.65rem;
      font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:700;
      color:#f5e6c8; letter-spacing:.01em;
    }
    .gq-logo-icon {
      width:34px; height:34px; border-radius:50%;
      background: linear-gradient(135deg,#7a1515,#4a0c0c);
      box-shadow: 0 0 0 4px rgba(190,140,30,.18), 0 4px 12px rgba(0,0,0,.5);
      display:flex; align-items:center; justify-content:center;
    }
    .gq-logo-icon svg { width:16px; height:16px; color:#f5e6c8; }
    .gq-back-btn {
      display:flex; align-items:center; gap:.45rem;
      padding:.36rem .9rem; border-radius:8px; cursor:pointer;
      font-family:'DM Sans',sans-serif; font-size:.78rem; font-weight:500;
      border: 1px solid rgba(200,160,50,.2);
      background: rgba(200,160,50,.06);
      color: rgba(200,160,80,.6);
      transition: all .15s;
    }
    .gq-back-btn:hover { background:rgba(200,160,50,.14); color:#e8c878; }
    .gq-back-btn svg { width:14px; height:14px; }
    .gq-chip-small {
      font-family:'DM Mono',monospace; font-size:.65rem; padding:.18rem .65rem;
      border-radius:999px; background:rgba(200,160,50,.1);
      border:1px solid rgba(200,160,50,.22); color:#e8c878; letter-spacing:.06em;
    }

    /* ── Body ── */
    .gq-body {
      position:relative; z-index:1;
      max-width:680px; margin:0 auto;
      padding:2.5rem 1.5rem 4rem;
      animation: floatUp .5s ease both;
    }

    /* ── Welcome ── */
    .gq-welcome { margin-bottom:2rem; }
    .gq-welcome-tag {
      display:inline-flex; align-items:center; gap:.4rem;
      font-size:.68rem; letter-spacing:.14em; text-transform:uppercase;
      color:rgba(200,160,60,.6); margin-bottom:.6rem; font-weight:500;
    }
    .gq-welcome-tag-dot {
      width:6px; height:6px; border-radius:50%;
      background:#c8a040; animation:glow-dot 2.5s infinite;
    }
    .gq-title {
      font-family:'Playfair Display',serif;
      font-size:2rem; font-weight:700; color:#f5e6c8;
      letter-spacing:-.01em; line-height:1.2;
    }
    .gq-sub { font-size:.86rem; color:rgba(200,170,100,.45); margin-top:.35rem; font-weight:300; }

    /* ── Glass card ── */
    .glass-card {
      background: rgba(255,255,255,.045);
      backdrop-filter: blur(18px) saturate(1.4);
      border: 1px solid rgba(200,160,50,.13);
      border-radius: 16px;
      box-shadow: 0 2px 0 rgba(255,220,100,.04) inset, 0 16px 48px rgba(0,0,0,.35);
    }

    .gq-config-card { padding:2rem 2.2rem; margin-bottom:1.2rem; }

    .gq-field-label {
      display:block; font-size:.66rem; letter-spacing:.12em; text-transform:uppercase;
      color:rgba(200,160,60,.65); margin-bottom:.5rem; font-weight:500;
    }
    .gq-select, .gq-text-input {
      width:100%; padding:.7rem .95rem; border-radius:9px;
      background:rgba(255,255,255,.055); border:1px solid rgba(200,160,50,.2);
      color:#f5e6c8; font-family:'DM Sans',sans-serif; font-size:.87rem; font-weight:300;
      outline:none; transition:all .2s; margin-bottom:1.4rem;
    }
    .gq-select option { background:#1a0a0a; }
    .gq-select:focus, .gq-text-input:focus {
      border-color:rgba(200,160,50,.5); background:rgba(255,255,255,.08);
      box-shadow:0 0 0 3px rgba(190,140,30,.12);
    }
    .gq-text-input::placeholder { color:rgba(200,170,100,.25); }

    /* ── Slider ── */
    .gq-slider-row { display:flex; align-items:center; gap:1rem; margin-bottom:1.4rem; }
    .gq-slider-label { font-size:.66rem; letter-spacing:.12em; text-transform:uppercase; color:rgba(200,160,60,.65); font-weight:500; white-space:nowrap; }
    .gq-slider-track {
      flex:1; height:6px; border-radius:3px;
      background:rgba(255,255,255,.08); position:relative;
      cursor:grab; touch-action:none; user-select:none;
    }
    .gq-slider-track:active { cursor:grabbing; }
    .gq-slider-fill {
      position:absolute; left:0; top:0; bottom:0; border-radius:3px;
      background:linear-gradient(90deg,#8b1a1a,#c8a040); transition:width .2s;
    }
    .gq-slider-thumb {
      position:absolute; top:50%; transform:translate(-50%,-50%);
      width:16px; height:16px; border-radius:50%;
      background:#f5e6c8; border:2px solid #c8a040;
      box-shadow:0 2px 8px rgba(200,160,40,.4);
      cursor:grab; transition:left .08s ease-out; pointer-events:none;
    }
    .gq-slider-val {
      font-family:'DM Mono',monospace; font-size:.88rem;
      color:#e8c878; min-width:28px; text-align:center; font-weight:500;
    }
    .gq-slider-hint {
      font-size:.72rem; color:rgba(200,170,100,.38); margin:.35rem 0 0;
      font-weight:300;
    }
    .gq-slider-block { margin-bottom:1.4rem; }

    /* ── Quiz type & difficulty (segmented) ── */
    .gq-seg-block { margin-bottom:1.4rem; }
    .gq-seg-row { display:flex; flex-wrap:wrap; gap:.45rem; }
    .gq-seg-btn {
      flex:1; min-width:calc(33.33% - .3rem);
      padding:.55rem .65rem; border-radius:9px; cursor:pointer;
      font-family:'DM Sans',sans-serif; font-size:.78rem; font-weight:500;
      border:1px solid rgba(200,160,50,.2);
      background:rgba(255,255,255,.04);
      color:rgba(200,170,100,.5);
      transition:all .18s; text-align:center; line-height:1.25;
    }
    .gq-seg-btn:hover {
      border-color:rgba(200,160,50,.38);
      color:rgba(232,200,120,.85);
      background:rgba(200,160,50,.08);
    }
    .gq-seg-btn.active {
      border-color:rgba(200,160,50,.5);
      background:rgba(200,160,50,.14);
      color:#f5e6c8;
      box-shadow:0 0 0 2px rgba(190,140,30,.1);
    }
    .gq-seg-btn:focus-visible {
      outline:2px solid rgba(200,160,50,.55);
      outline-offset:2px;
    }

    /* ── Generate button ── */
    .gq-btn-generate-wrap { display:flex; justify-content:center; margin-top:.5rem; }
    .gq-btn-generate {
      width:auto; padding:.42rem 1.2rem; border:none; border-radius:7px;
      cursor:pointer; font-family:'DM Sans',sans-serif; font-size:.73rem; font-weight:500;
      letter-spacing:.04em; color:#fff8e8; transition:all .15s;
      background:linear-gradient(135deg,#8b1a1a 0%,#6b1010 50%,#8b1a1a 100%);
      background-size:200% auto;
      box-shadow:0 4px 16px rgba(120,20,20,.45), 0 1px 0 rgba(255,200,80,.12) inset;
      display:flex; align-items:center; justify-content:center; gap:.35rem;
    }
    .gq-btn-generate svg { width:12px; height:12px; }
    .gq-btn-generate:hover:not(:disabled) { animation:shimmer .9s linear infinite; transform:translateY(-1px); }
    .gq-btn-generate:disabled { opacity:.5; cursor:not-allowed; animation:none; transform:none; }

    /* ── Loading overlay ── */
    .gq-loading-overlay {
      position:fixed; inset:0; z-index:50;
      background:rgba(22,8,8,.96); backdrop-filter:blur(20px);
      display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2rem;
      animation:fadeIn .3s ease both;
    }
    .gq-orb-wrap { position:relative; width:110px; height:110px; }
    .gq-orb-ring {
      position:absolute; inset:0; border-radius:50%;
      border:2px solid transparent;
      border-top-color:rgba(200,160,50,.7);
      border-right-color:rgba(200,100,30,.4);
      animation:spin 1.2s linear infinite;
    }
    .gq-orb-ring-2 {
      inset:10px;
      border-top-color:rgba(120,20,20,.7);
      border-bottom-color:rgba(120,20,20,.4);
      animation:spin 1.8s linear infinite reverse;
    }
    .gq-orb-core {
      position:absolute; inset:22px; border-radius:50%;
      background:radial-gradient(circle at 40% 40%, rgba(200,160,50,.3), rgba(120,20,20,.3));
      animation:pulseDot 2s ease-in-out infinite;
      display:flex; align-items:center; justify-content:center;
    }
    .gq-orb-core svg { width:26px; height:26px; color:#e8c878; }
    .gq-loading-title { font-family:'Playfair Display',serif; font-size:1.25rem; font-weight:700; color:#f5e6c8; margin-bottom:.35rem; letter-spacing:-.01em; }
    .gq-loading-sub   { font-size:.82rem; color:rgba(200,170,100,.4); font-weight:300; }

    .gq-steps { display:flex; flex-direction:column; gap:.55rem; width:320px; }
    .gq-step {
      display:flex; align-items:center; gap:.8rem; padding:.7rem 1rem;
      border-radius:10px; border:1px solid rgba(200,160,50,.08);
      background:rgba(255,255,255,.02); transition:all .3s;
    }
    .gq-step.active { background:rgba(200,160,50,.08); border-color:rgba(200,160,50,.25); }
    .gq-step.done   { background:rgba(120,20,20,.1);   border-color:rgba(200,120,30,.2); }
    .gq-step-dot { width:26px; height:26px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; position:relative; }
    .gq-step-dot-inner { width:9px; height:9px; border-radius:50%; background:rgba(255,255,255,.12); transition:all .3s; }
    .gq-step.active .gq-step-dot-inner { background:#c8a040; box-shadow:0 0 0 3px rgba(200,160,40,.25); }
    .gq-step.active .gq-step-dot::after {
      content:''; position:absolute; inset:0; border-radius:50%;
      border:2px solid rgba(200,160,50,.5); animation:stepPing 1.4s ease infinite;
    }
    .gq-step.done .gq-step-dot-inner { background:#c8a040; }
    .gq-step-label { font-size:.82rem; font-weight:500; color:rgba(200,170,100,.35); transition:color .3s; }
    .gq-step.active .gq-step-label { color:rgba(232,200,120,.9); }
    .gq-step.done  .gq-step-label { color:rgba(200,160,60,.7); }
    .gq-step-check { margin-left:auto; color:#c8a040; animation:checkPop .4s ease; }
    .gq-step-check svg { width:15px; height:15px; }

    .gq-progress-wrap { width:320px; height:4px; background:rgba(255,255,255,.08); border-radius:2px; overflow:hidden; }
    .gq-progress-fill {
      height:100%; border-radius:2px;
      background:linear-gradient(90deg,#8b1a1a,#c8a040,#d4a060);
      background-size:200% 100%;
      animation:loadingShimmer 2s linear infinite;
      transition:width .5s cubic-bezier(.22,1,.36,1);
    }

    /* ── Questions section ── */
    .gq-section-heading { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; }
    .gq-section-title { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:600; color:#f5e6c8; }
    .gq-count-chip {
      font-family:'DM Mono',monospace; font-size:.7rem;
      color:rgba(200,160,60,.5); padding:.18rem .55rem;
      background:rgba(200,160,50,.07); border-radius:6px;
      border:1px solid rgba(200,160,50,.12);
    }

    .gq-q-card {
      padding:1.3rem 1.5rem; margin-bottom:.85rem;
      animation:typein .3s ease both;
    }
    .gq-q-num {
      display:inline-flex; align-items:center; justify-content:center;
      width:24px; height:24px; border-radius:7px;
      background:rgba(200,160,50,.1); color:#e8c878;
      font-family:'DM Mono',monospace; font-size:.7rem; font-weight:500;
      margin-bottom:.75rem; border:1px solid rgba(200,160,50,.18);
    }
    .gq-q-text-input {
      width:100%; padding:.6rem .85rem;
      background:rgba(255,255,255,.055); border:1px solid rgba(200,160,50,.18);
      border-radius:9px; color:#f5e6c8;
      font-family:'DM Sans',sans-serif; font-size:.87rem; font-weight:300;
      outline:none; margin-bottom:.85rem; transition:border-color .2s;
    }
    .gq-q-text-input:focus { border-color:rgba(200,160,50,.45); }
    .gq-q-options {
      display:grid; grid-template-columns:1fr 1fr; gap:.55rem; margin-bottom:.85rem;
    }
    .gq-q-opt-input {
      padding:.5rem .75rem;
      background:rgba(255,255,255,.04); border:1px solid rgba(200,160,50,.12);
      border-radius:8px; color:#f5e6c8;
      font-family:'DM Sans',sans-serif; font-size:.8rem; font-weight:300;
      outline:none; width:100%; transition:border-color .2s;
    }
    .gq-q-opt-input:focus { border-color:rgba(200,160,50,.4); }

    /* Multiple-choice / matching: lettered rows */
    .gq-mc-list { display:flex; flex-direction:column; gap:.5rem; margin-bottom:.85rem; }
    .gq-mc-row {
      display:flex; align-items:stretch; gap:.55rem;
      border-radius:10px; border:1px solid rgba(200,160,50,.14);
      background:rgba(255,255,255,.035); overflow:hidden;
      transition:border-color .2s, box-shadow .2s;
    }
    .gq-mc-row:focus-within { border-color:rgba(200,160,50,.38); }
    .gq-mc-letter {
      flex-shrink:0; width:40px;
      display:flex; align-items:center; justify-content:center;
      font-family:'DM Mono',monospace; font-size:.78rem; font-weight:600;
      color:#e8c878; background:rgba(200,160,50,.1);
      border-right:1px solid rgba(200,160,50,.15);
    }
    .gq-mc-row-input {
      flex:1; border:none; background:transparent;
      padding:.55rem .75rem; color:#f5e6c8;
      font-family:'DM Sans',sans-serif; font-size:.82rem; font-weight:300;
      outline:none; min-width:0;
    }
    .gq-mc-row-input::placeholder { color:rgba(200,170,100,.28); }

    /* True / False */
    .gq-tf-row {
      display:grid; grid-template-columns:1fr 1fr; gap:.65rem; margin-bottom:.85rem;
    }
    .gq-tf-btn {
      padding:.85rem 1rem; border-radius:12px; cursor:pointer;
      font-family:'DM Sans',sans-serif; font-size:.95rem; font-weight:600;
      border:2px solid rgba(200,160,50,.22);
      background:rgba(255,255,255,.04); color:rgba(200,170,100,.55);
      transition:all .18s ease;
    }
    .gq-tf-btn:hover {
      border-color:rgba(200,160,50,.45);
      color:#f5e6c8; background:rgba(200,160,50,.1);
    }
    .gq-tf-btn.active {
      border-color:rgba(120,200,140,.55);
      background:rgba(40,120,60,.22);
      color:#d4f0d8;
      box-shadow:0 0 0 2px rgba(120,200,140,.12);
    }
    .gq-tf-btn.active-false {
      border-color:rgba(200,100,100,.55);
      background:rgba(120,40,40,.25);
      color:#f5d0d0;
      box-shadow:0 0 0 2px rgba(200,100,100,.1);
    }

    /* Identification */
    .gq-id-block { margin-bottom:.85rem; }
    .gq-id-hint {
      font-size:.72rem; color:rgba(200,170,100,.38); font-weight:300;
      margin-top:.35rem; line-height:1.45;
    }
    .gq-id-wrong-label {
      display:block; font-size:.66rem; letter-spacing:.1em; text-transform:uppercase;
      color:rgba(200,160,60,.45); font-weight:500; margin:.65rem 0 .35rem;
    }
    .gq-id-wrong-list { display:flex; flex-direction:column; gap:.45rem; }
    .gq-q-answer-row { display:flex; align-items:center; gap:.65rem; }
    .gq-answer-label {
      font-size:.66rem; letter-spacing:.12em; text-transform:uppercase;
      color:rgba(200,160,60,.45); font-weight:500;
    }
    .gq-answer-select {
      padding:.28rem .65rem; border-radius:7px;
      background:rgba(200,160,50,.08); border:1px solid rgba(200,160,50,.22);
      color:#e8c878; font-family:'DM Sans',sans-serif; font-size:.82rem;
      outline:none; cursor:pointer;
    }

    /* ── Save/discard row ── */
    .gq-save-row { display:flex; gap:.65rem; margin-top:1.5rem; justify-content:center; }
    .gq-btn-save {
      padding:.42rem 1.2rem; border:none; border-radius:7px; cursor:pointer;
      font-family:'DM Sans',sans-serif; font-size:.73rem; font-weight:500;
      color:#fff8e8; transition:all .15s;
      background:linear-gradient(135deg,#8b1a1a 0%,#6b1010 50%,#8b1a1a 100%);
      background-size:200% auto;
      box-shadow:0 4px 16px rgba(120,20,20,.45), 0 1px 0 rgba(255,200,80,.12) inset;
    }
    .gq-btn-save:hover:not(:disabled) { animation:shimmer .9s linear infinite; transform:translateY(-1px); }
    .gq-btn-save:disabled { opacity:.45; cursor:not-allowed; animation:none; transform:none; }
    .gq-btn-discard {
      padding:.42rem 1rem; border-radius:7px; cursor:pointer;
      font-family:'DM Sans',sans-serif; font-size:.73rem; font-weight:500;
      border:1px solid rgba(200,160,50,.18); background:rgba(200,160,50,.05);
      color:rgba(200,160,80,.5); transition:all .15s;
    }
    .gq-btn-discard:hover { background:rgba(200,160,50,.12); color:#e8c878; }

    .gq-points-row {
      display:flex; align-items:center; gap:.65rem; margin-bottom:.85rem; flex-wrap:wrap;
    }
    .gq-points-label {
      font-size:.66rem; letter-spacing:.1em; text-transform:uppercase;
      color:rgba(200,160,60,.5); font-weight:500;
    }
    .gq-points-input {
      width:72px; padding:.45rem .55rem; border-radius:8px;
      background:rgba(255,255,255,.055); border:1px solid rgba(200,160,50,.2);
      color:#e8c878; font-family:'DM Mono',monospace; font-size:.82rem;
      outline:none;
    }
    .gq-points-input:focus { border-color:rgba(200,160,50,.45); }
    .gq-postsave-actions {
      display:flex; flex-wrap:wrap; gap:.55rem; margin-top:1.25rem; justify-content:center; align-items:center;
    }
    .gq-btn-draft {
      padding:.42rem 1.1rem; border-radius:7px; cursor:pointer;
      font-family:'DM Sans',sans-serif; font-size:.73rem; font-weight:500;
      border:1px solid rgba(200,160,50,.22); background:rgba(200,160,50,.08);
      color:#e8c878; transition:all .15s;
    }
    .gq-btn-draft:hover:not(:disabled) { background:rgba(200,160,50,.16); }
    .gq-btn-draft:disabled { opacity:.45; cursor:not-allowed; }
    .gq-btn-send-dash {
      padding:.42rem 1.1rem; border:none; border-radius:7px; cursor:pointer;
      font-family:'DM Sans',sans-serif; font-size:.73rem; font-weight:500;
      color:#fff8e8; transition:all .15s;
      background:linear-gradient(135deg,#8b1a1a 0%,#6b1010 50%,#8b1a1a 100%);
      background-size:200% auto;
      box-shadow:0 4px 16px rgba(120,20,20,.45), 0 1px 0 rgba(255,200,80,.12) inset;
    }
    .gq-btn-send-dash:hover:not(:disabled) { animation:shimmer .9s linear infinite; transform:translateY(-1px); }
    .gq-btn-send-dash:disabled { opacity:.45; cursor:not-allowed; animation:none; transform:none; }
    .gq-btn-edit {
      padding:.42rem 1rem; border-radius:7px; cursor:pointer;
      font-family:'DM Sans',sans-serif; font-size:.73rem; font-weight:500;
      border:1px solid rgba(147,130,200,.35); background:rgba(147,130,200,.1);
      color:#c4b5fd; transition:all .15s;
    }
    .gq-btn-edit:hover { background:rgba(147,130,200,.18); }
    .gq-postsave-hint {
      font-size:.72rem; color:rgba(200,170,100,.38); text-align:center; margin-top:.75rem; font-weight:300;
    }
    .gq-q-preview {
      font-size:.82rem; color:rgba(245,230,200,.75); line-height:1.45; margin-bottom:.5rem;
    }

    /* ── Error ── */
    .gq-error-box {
      display:flex; align-items:center; gap:.55rem; padding:.65rem .9rem;
      background:rgba(239,68,68,.07); border:1px solid rgba(239,68,68,.2);
      border-radius:9px; font-size:.79rem; color:#fca5a5; margin-bottom:1rem;
    }
    .gq-error-box svg { width:14px; height:14px; flex-shrink:0; }

    /* ── Success overlay ── */
    .gq-success-overlay {
      position:fixed; inset:0; z-index:70;
      display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.4rem;
      background:rgba(22,8,8,.96); backdrop-filter:blur(20px);
      animation:fadeIn .3s ease both;
    }
    .gq-success-ring {
      width:90px; height:90px; border-radius:50%;
      background:rgba(120,20,20,.25); border:2px solid rgba(200,160,50,.4);
      display:flex; align-items:center; justify-content:center;
      animation:successRing .6s cubic-bezier(.34,1.56,.64,1) both;
      box-shadow:0 0 40px rgba(200,160,40,.2);
    }
    .gq-success-ring svg { width:38px; height:38px; color:#e8c878; animation:checkPop .5s .3s both; }
    .gq-success-title { font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:700; color:#f5e6c8; margin-bottom:.4rem; letter-spacing:-.01em; }
    .gq-success-sub   { font-size:.84rem; color:rgba(200,170,100,.4); font-weight:300; }

    /* ── Spinner ── */
    .gq-spinner {
      display:inline-block; width:14px; height:14px;
      border:2px solid rgba(200,160,50,.2); border-top-color:#c8a040;
      border-radius:50%; animation:spin .7s linear infinite;
    }

    @media(max-width:640px){
      .gq-body { padding:1.5rem 1rem 3rem; }
      .gq-config-card { padding:1.5rem 1.2rem; }
      .gq-title { font-size:1.6rem; }
      .gq-topbar { padding:0 1rem; }
      .gq-q-options { grid-template-columns:1fr; }
      .gq-steps { width:calc(100vw - 4rem); }
      .gq-progress-wrap { width:calc(100vw - 4rem); }
    }
  `}</style>
);

/* ── Icons ── */
const StarIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.87L12 18.07 5.82 22 7 14.14 2 9.27l6.91-1.01z"/>
  </svg>
);
const BackIcon = (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 16l-6-6 6-6"/>
  </svg>
);
const BrainIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08A3 3 0 0 1 2 13c0-1.05.54-1.97 1.36-2.5A2.5 2.5 0 0 1 6 7.5a2.5 2.5 0 0 1 3.5-5Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08A3 3 0 0 0 22 13c0-1.05-.54-1.97-1.36-2.5A2.5 2.5 0 0 0 18 7.5a2.5 2.5 0 0 0-3.5-5Z"/>
  </svg>
);
const CheckIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);
const AlertIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <circle cx="12" cy="16" r=".5" fill="currentColor"/>
  </svg>
);
const QuizIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const STEPS = [
  { id: 1, label: "Analyzing lecture content…" },
  { id: 2, label: "Crafting intelligent questions…" },
  { id: 3, label: "Validating & formatting…" },
];

const MIN_QUESTIONS = 5;

const QUIZ_TYPES = [
  { value: "matching", label: "Matching Type" },
  { value: "identification", label: "Identification" },
  { value: "true-false", label: "True or False" },
];

const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const OPTION_LETTERS = ["A", "B", "C", "D"];

/** Shape questions for the review UI (and stable save payload) per quiz type. */
function normalizeQuestionsForReview(items, type) {
  if (!Array.isArray(items)) return [];
  const pad4 = (opts) => {
    const o = [...(opts || [])].map((x) => (x == null ? "" : String(x)));
    while (o.length < 4) o.push("");
    return o.slice(0, 4);
  };

  if (type === "true-false") {
    return items.map((q) => {
      const options = pad4(q.options);
      options[0] = options[0] || "True";
      options[1] = options[1] || "False";
      options[2] = "";
      options[3] = "";
      let ca = String(q.correct_answer || "A").toUpperCase().trim();
      if (ca !== "B") ca = "A";
      const p = Number(q.points);
      return { ...q, options, correct_answer: ca, points: Number.isFinite(p) && p > 0 ? Math.round(p) : 1 };
    });
  }

  if (type === "identification") {
    return items.map((q) => {
      const opts = pad4(q.options);
      let ci = OPTION_LETTERS.indexOf(String(q.correct_answer || "A").toUpperCase().trim());
      if (ci < 0) ci = 0;
      const correct = opts[ci] || "";
      const wrong = [0, 1, 2, 3]
        .filter((i) => i !== ci)
        .map((i) => opts[i] || "");
      const p = Number(q.points);
      return {
        ...q,
        options: [correct, wrong[0] || "", wrong[1] || "", wrong[2] || ""],
        correct_answer: "A",
        points: Number.isFinite(p) && p > 0 ? Math.round(p) : 1,
      };
    });
  }

  return items.map((q) => {
    const p = Number(q.points);
    return {
      ...q,
      options: pad4(q.options),
      correct_answer: OPTION_LETTERS.includes(String(q.correct_answer || "").toUpperCase())
        ? String(q.correct_answer).toUpperCase()
        : "A",
      points: Number.isFinite(p) && p > 0 ? Math.round(p) : 1,
    };
  });
}

/** Guess quiz type from stored rows (DB has no quiz_type column). */
function inferQuizType(questions) {
  if (!questions?.length) return "identification";
  const q0 = questions[0];
  const o = q0.options || [];
  const t0 = String(o[0] || "").trim().toLowerCase();
  const t1 = String(o[1] || "").trim().toLowerCase();
  if (
    (t0 === "true" && t1 === "false") ||
    (t0 === "false" && t1 === "true")
  ) {
    return "true-false";
  }
  const hasNonACorrect = questions.some(
    (q) => String(q.correct_answer || "A").toUpperCase() !== "A"
  );
  if (hasNonACorrect) return "matching";
  return "identification";
}

export default function GenerateQuiz() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState("");
  const [quizType, setQuizType] = useState("identification");
  const [difficulty, setDifficulty] = useState("medium");
  const [quizTitle, setQuizTitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [savedQuizId, setSavedQuizId] = useState(null);
  const [postSaveEditing, setPostSaveEditing] = useState(false);
  const [draftSaving, setDraftSaving] = useState(false);
  const [sendBusy, setSendBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const stepTimers = useRef([]);

  const editQuizId = searchParams.get("edit");

  useEffect(() => {
    if (!editQuizId) return undefined;
    let cancelled = false;
    setEditLoading(true);
    setError("");
    getTeacherQuiz(editQuizId)
      .then((data) => {
        if (cancelled) return;
        const qs = data.questions || [];
        const inferred = inferQuizType(qs);
        setQuizType(inferred);
        setQuestions(normalizeQuestionsForReview(qs, inferred));
        setQuizTitle(data.quiz?.title || "");
        setSavedQuizId(data.quiz?.id != null ? String(data.quiz.id) : String(editQuizId));
        if (data.quiz?.lecture_id != null) setSelectedLecture(String(data.quiz.lecture_id));
        setPostSaveEditing(true);
        setSearchParams({}, { replace: true });
      })
      .catch((err) => {
        if (!cancelled) setError("Could not load quiz for editing: " + err.message);
      })
      .finally(() => {
        if (!cancelled) setEditLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editQuizId, setSearchParams]);

  useEffect(() => {
    getLectures()
      .then(setLectures)
      .catch(() => setError("Failed to load lectures."));
  }, []);

  useEffect(() => () => stepTimers.current.forEach(clearTimeout), []);

  const runFakeProgress = () => {
    stepTimers.current.push(setTimeout(() => { setActiveStep(1); setProgressPct(15); }, 300));
    stepTimers.current.push(setTimeout(() => { setActiveStep(2); setProgressPct(55); }, 1800));
    stepTimers.current.push(setTimeout(() => { setActiveStep(3); setProgressPct(80); }, 3200));
  };

  const handleGenerate = async () => {
    if (!selectedLecture) { setError("Please select a lecture."); return; }
    if (!quizType) { setError("Please select a quiz type."); return; }
    if (!difficulty) { setError("Please select a difficulty level."); return; }
    setError(""); setGenerating(true); setActiveStep(0); setProgressPct(0);
    setSavedQuizId(null);
    setPostSaveEditing(false);
    runFakeProgress();
    try {
      const data = await generateQuiz(selectedLecture, quizType, MIN_QUESTIONS, difficulty);
      setProgressPct(100); setActiveStep(4);
      await new Promise(r => setTimeout(r, 600));
      setQuestions(normalizeQuestionsForReview(data.questions, quizType));
    } catch (err) {
      setError("AI generation failed: " + err.message);
    } finally {
      stepTimers.current.forEach(clearTimeout);
      stepTimers.current = [];
      setGenerating(false);
    }
  };

  const updateQ = (idx, field, value) => {
    const updated = [...questions];
    if (field === "question") updated[idx].question = value;
    else if (field === "correct_answer") updated[idx].correct_answer = value;
    else if (field === "points") {
      const n = parseInt(value, 10);
      updated[idx].points = Number.isFinite(n) && n > 0 ? n : 1;
    }
    else if (field.startsWith("opt")) {
      const oi = parseInt(field.replace("opt", ""), 10);
      const opts = [...updated[idx].options];
      opts[oi] = value;
      updated[idx].options = opts;
    }
    setQuestions(updated);
  };

  const setTrueFalseKey = (idx, letter) => {
    const updated = [...questions];
    const opts = [...updated[idx].options];
    opts[0] = opts[0] || "True";
    opts[1] = opts[1] || "False";
    opts[2] = "";
    opts[3] = "";
    updated[idx].options = opts;
    updated[idx].correct_answer = letter;
    setQuestions(updated);
  };

  const saveDraftToServer = async () => {
    if (!savedQuizId) throw new Error("No saved quiz");
    const payload = {
      quizTitle: quizTitle.trim(),
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        points: q.points,
      })),
    };
    const data = await updateTeacherQuiz(savedQuizId, payload);
    if (data.questions) setQuestions(data.questions);
    if (data.quiz?.title) setQuizTitle(data.quiz.title);
  };

  const handleDraftSave = async () => {
    setDraftSaving(true); setError("");
    try {
      await saveDraftToServer();
    } catch (err) {
      setError("Could not save draft: " + err.message);
    } finally {
      setDraftSaving(false);
    }
  };

  const handleSave = async () => {
    if (!quizTitle.trim()) { setError("Please enter a quiz title."); return; }
    if (!questions.length) { setError("No questions to save."); return; }
    setSaving(true); setError("");
    try {
      const data = await saveQuiz(selectedLecture, quizTitle, questions);
      const qid = data.quiz_id ?? data.quiz?.id;
      if (data.questions && data.questions.length) {
        setQuestions(data.questions);
      } else if (qid) {
        const detail = await getTeacherQuiz(qid);
        setQuestions(detail.questions || []);
      }
      if (qid) setSavedQuizId(qid);
      setPostSaveEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    } catch (err) {
      setError("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendFromPostSave = async () => {
    if (!savedQuizId) return;
    setSendBusy(true); setError("");
    try {
      await saveDraftToServer();
      navigate("/teacher", { state: { openSendQuizId: savedQuizId } });
    } catch (err) {
      setError((err.message && err.message.includes("No saved")) ? "Save the quiz first." : "Could not prepare send: " + err.message);
    } finally {
      setSendBusy(false);
    }
  };

  const lectureTitle = lectures.find(l => String(l.id) === String(selectedLecture))?.title || "";
  const reviewQuizTypeLabel = QUIZ_TYPES.find((t) => t.value === quizType)?.label ?? "";

  return (
    <>
      <Styles />

      {editLoading && (
        <div className="gq-loading-overlay" style={{ zIndex: 52 }}>
          <div className="gq-orb-wrap">
            <div className="gq-orb-ring" />
            <div className="gq-orb-ring gq-orb-ring-2" />
            <div className="gq-orb-core">{BrainIcon}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="gq-loading-title">Loading quiz…</div>
            <div className="gq-loading-sub">Opening your saved questions for editing</div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {generating && (
        <div className="gq-loading-overlay">
          <div className="gq-orb-wrap">
            <div className="gq-orb-ring" />
            <div className="gq-orb-ring gq-orb-ring-2" />
            <div className="gq-orb-core">{BrainIcon}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="gq-loading-title">Generating your quiz…</div>
            <div className="gq-loading-sub">AI is reading: <em style={{ color: "#e8c878" }}>{lectureTitle || "your lecture"}</em></div>
          </div>
          <div className="gq-steps">
            {STEPS.map((s, i) => {
              const idx = i + 1;
              const isDone = activeStep > idx;
              const isActive = activeStep === idx;
              return (
                <div key={s.id} className={`gq-step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
                  <div className="gq-step-dot"><div className="gq-step-dot-inner" /></div>
                  <span className="gq-step-label">{s.label}</span>
                  {isDone && <span className="gq-step-check">{CheckIcon}</span>}
                </div>
              );
            })}
          </div>
          <div className="gq-progress-wrap">
            <div className="gq-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: ".72rem", color: "rgba(200,170,100,.4)" }}>
            {progressPct}% complete
          </div>
        </div>
      )}

      {/* Success overlay */}
      {saved && (
        <div className="gq-success-overlay">
          <div className="gq-success-ring">{CheckIcon}</div>
          <div style={{ textAlign: "center" }}>
            <div className="gq-success-title">Quiz saved</div>
            <div className="gq-success-sub">Use Draft to update, Send to schedule for students, or Edit to change wording.</div>
          </div>
        </div>
      )}

      <div className="gq-root">
        <div className="deco-ring" />
        <div className="deco-ring deco-ring-2" />

        {/* Topbar */}
        <header className="gq-topbar">
          <div className="gq-logo">
            <div className="gq-logo-icon">{StarIcon}</div>
            QuizSystem
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: ".85rem" }}>
            <span className="gq-chip-small">AI POWERED</span>
            <button className="gq-back-btn" onClick={() => navigate("/teacher")}>
              {BackIcon} Back to Dashboard
            </button>
          </div>
        </header>

        <div className="gq-body">
          {/* Welcome */}
          {!questions.length && (
            <div className="gq-welcome">
              <div className="gq-welcome-tag">
                <span className="gq-welcome-tag-dot" /> AI Quiz Generation
              </div>
              <h1 className="gq-title">Generate a Quiz<br/>in Seconds</h1>
              <p className="gq-sub">Choose lecture, quiz type, difficulty, and question count — then let AI build it</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="gq-error-box">
              {AlertIcon} {error}
            </div>
          )}

          {/* Config card */}
          {!questions.length && (
            <div className="glass-card gq-config-card">
              <label className="gq-field-label">Select Lecture</label>
              <select
                className="gq-select"
                value={selectedLecture}
                onChange={e => { setSelectedLecture(e.target.value); setError(""); }}
              >
                <option value="">— Choose a lecture —</option>
                {lectures.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>

              <div className="gq-seg-block">
                <span className="gq-field-label" style={{ marginBottom: ".55rem" }}>Quiz type</span>
                <div className="gq-seg-row" role="radiogroup" aria-label="Quiz type">
                  {QUIZ_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      role="radio"
                      aria-checked={quizType === t.value}
                      className={`gq-seg-btn${quizType === t.value ? " active" : ""}`}
                      onClick={() => { setQuizType(t.value); setError(""); }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="gq-seg-block">
                <span className="gq-field-label" style={{ marginBottom: ".55rem" }}>Difficulty</span>
                <div className="gq-seg-row" role="radiogroup" aria-label="Difficulty">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      role="radio"
                      aria-checked={difficulty === d.value}
                      className={`gq-seg-btn${difficulty === d.value ? " active" : ""}`}
                      onClick={() => { setDifficulty(d.value); setError(""); }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="gq-field-label">Quiz Title</label>
              <input
                className="gq-text-input"
                type="text"
                placeholder="e.g., Chapter 3 Review"
                value={quizTitle}
                onChange={e => setQuizTitle(e.target.value)}
              />

              <div className="gq-slider-block">
                <p className="gq-slider-hint" style={{ marginBottom: 0 }}>
                  Each AI quiz has exactly <strong style={{ color: "#e8c878" }}>{MIN_QUESTIONS}</strong> questions.
                </p>
              </div>

              <div className="gq-btn-generate-wrap">
                <button
                  className="gq-btn-generate"
                  onClick={handleGenerate}
                  disabled={!selectedLecture || generating}
                >
                  {QuizIcon} Generate
                </button>
              </div>
            </div>
          )}

          {/* Questions preview */}
          {questions.length > 0 && (
            <div style={{ animation: "floatUp .5s ease both" }}>
              {/* Title field */}
              <div className="glass-card gq-config-card" style={{ marginBottom: "1.2rem" }}>
                <label className="gq-field-label">Quiz Title</label>
                <input
                  className="gq-text-input"
                  type="text"
                  placeholder="Name your quiz"
                  value={quizTitle}
                  onChange={e => setQuizTitle(e.target.value)}
                  readOnly={Boolean(savedQuizId && !postSaveEditing)}
                  style={{ marginBottom: 0 }}
                />
              </div>

              <div className="gq-section-heading">
                <h2 className="gq-section-title">{savedQuizId ? "Saved quiz" : "Review & Edit"}</h2>
                <span className="gq-count-chip">
                  {questions.length} questions{reviewQuizTypeLabel ? ` · ${reviewQuizTypeLabel}` : ""}
                </span>
              </div>

              {questions.map((q, idx) => {
                const locked = Boolean(savedQuizId && !postSaveEditing);
                return (
                <div key={q.id != null ? String(q.id) : `q-${idx}`} className="glass-card gq-q-card" style={{ animationDelay: `${idx * 0.04}s` }}>
                  <div className="gq-q-num">{idx + 1}</div>
                  <input
                    className="gq-q-text-input"
                    value={q.question}
                    readOnly={locked}
                    onChange={(e) => updateQ(idx, "question", e.target.value)}
                    placeholder={
                      quizType === "true-false"
                        ? "Statement (quiz taker marks True or False)"
                        : "Question text"
                    }
                  />

                  {quizType === "true-false" && (
                    <>
                      <div className="gq-tf-row" role="group" aria-label="Correct response">
                        <button
                          type="button"
                          className={`gq-tf-btn${q.correct_answer === "A" ? " active" : ""}`}
                          disabled={locked}
                          onClick={() => setTrueFalseKey(idx, "A")}
                        >
                          True
                        </button>
                        <button
                          type="button"
                          className={`gq-tf-btn${q.correct_answer === "B" ? " active-false" : ""}`}
                          disabled={locked}
                          onClick={() => setTrueFalseKey(idx, "B")}
                        >
                          False
                        </button>
                      </div>
                      <p className="gq-id-hint" style={{ marginBottom: ".85rem" }}>
                        Choose whether the statement above should be answered True or False for the answer key.
                      </p>
                    </>
                  )}

                  {quizType === "matching" && (
                    <>
                      <div className="gq-mc-list" role="list" aria-label="Choices A through D">
                        {OPTION_LETTERS.map((letter, oi) => (
                          <div key={letter} className="gq-mc-row" role="listitem">
                            <span className="gq-mc-letter">{letter}</span>
                            <input
                              className="gq-mc-row-input"
                              value={q.options[oi] || ""}
                              readOnly={locked}
                              onChange={(e) => updateQ(idx, `opt${oi}`, e.target.value)}
                              placeholder={`Choice ${letter}`}
                              aria-label={`Choice ${letter}`}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="gq-q-answer-row">
                        <span className="gq-answer-label">Correct choice</span>
                        <select
                          className="gq-answer-select"
                          value={q.correct_answer}
                          disabled={locked}
                          onChange={(e) => updateQ(idx, "correct_answer", e.target.value)}
                        >
                          {OPTION_LETTERS.map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {quizType === "identification" && (
                    <div className="gq-id-block">
                      <label className="gq-field-label">Correct answer</label>
                      <input
                        className="gq-q-text-input"
                        value={q.options[0] || ""}
                        readOnly={locked}
                        onChange={(e) => updateQ(idx, "opt0", e.target.value)}
                        placeholder="The answer students should identify or supply"
                      />
                      <span className="gq-id-wrong-label">Other choices (distractors)</span>
                      <div className="gq-id-wrong-list">
                        {[1, 2, 3].map((oi) => (
                          <input
                            key={oi}
                            className="gq-q-text-input"
                            style={{ marginBottom: 0 }}
                            value={q.options[oi] || ""}
                            readOnly={locked}
                            onChange={(e) => updateQ(idx, `opt${oi}`, e.target.value)}
                            placeholder={`Distractor ${oi}`}
                          />
                        ))}
                      </div>
                      <p className="gq-id-hint">
                        The quiz still presents four phrases; the first field is always the correct answer in the answer key (choice A).
                      </p>
                    </div>
                  )}

                  <div className="gq-points-row">
                    <span className="gq-points-label">Points (weight)</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      className="gq-points-input"
                      value={q.points ?? 1}
                      readOnly={locked}
                      onChange={(e) => updateQ(idx, "points", e.target.value)}
                    />
                  </div>
                </div>
              );
              })}

              <div className="gq-save-row" style={{ flexWrap: "wrap" }}>
                {!savedQuizId ? (
                  <>
                    <button
                      className="gq-btn-discard"
                      type="button"
                      onClick={() => { setQuestions([]); setError(""); setSavedQuizId(null); setPostSaveEditing(false); }}
                    >
                      Discard
                    </button>
                    <button
                      className="gq-btn-save"
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? <><span className="gq-spinner" /> Saving…</> : "Save quiz"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="gq-btn-draft"
                      type="button"
                      onClick={handleDraftSave}
                      disabled={draftSaving || sendBusy}
                    >
                      {draftSaving ? <><span className="gq-spinner" /> Saving…</> : "Draft"}
                    </button>
                    <button
                      className="gq-btn-send-dash"
                      type="button"
                      onClick={handleSendFromPostSave}
                      disabled={sendBusy || draftSaving}
                    >
                      {sendBusy ? <><span className="gq-spinner" /> Preparing…</> : "Send"}
                    </button>
                    <button
                      type="button"
                      className="gq-btn-edit"
                      onClick={() => setPostSaveEditing((e) => !e)}
                    >
                      {postSaveEditing ? "Done editing" : "Edit"}
                    </button>
                    <button
                      className="gq-btn-discard"
                      type="button"
                      onClick={() => navigate("/teacher")}
                    >
                      Dashboard
                    </button>
                  </>
                )}
              </div>
              {savedQuizId && (
                <p className="gq-postsave-hint">
                  Students need <strong style={{ color: "rgba(232,200,120,.85)" }}>75%</strong> of weighted points to pass. Draft saves your edits; Send opens scheduling on your teacher dashboard.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}