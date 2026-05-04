import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ─── Global Styles ─── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #2a0a0f;
      --panel: #3d1018;
      --border: #5c1f2a;
      --accent: #d4a017;
      --text: #fff8f0;
      --muted: #b87a80;
      --input-bg: #330d14;
      --mustard: #d4a017;
      --msoft: rgba(212,160,23,0.15);
      --nav-h: 68px;
    }

    html { scroll-behavior: smooth; }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--mustard); }

    body {
      font-family: 'DM Sans', sans-serif;
      background: var(--bg);
      color: var(--text);
      overflow-x: hidden;
    }

    .landing-root {
      position: relative;
      min-height: 100vh;
    }

    .landing-root::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      background-image:
        repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(212,160,23,.025) 60px, rgba(212,160,23,.025) 61px),
        repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(212,160,23,.025) 60px, rgba(212,160,23,.025) 61px);
    }

    @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.75)} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes scrollT { from{transform:translateX(0)} to{transform:translateX(-50%)} }

    .reveal { opacity: 0; transform: translateY(26px); transition: opacity .7s ease, transform .7s ease; }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .d1 { transition-delay: .1s; }
    .d2 { transition-delay: .2s; }
    .d3 { transition-delay: .3s; }

    /* ── NAV ── */
    nav.aether-nav {
      position: fixed; top: 0; left: 0; right: 0;
      height: var(--nav-h);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 6%; z-index: 200;
      background: rgba(42,10,15,.8);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(92,31,42,.4);
      transition: background .3s, border-color .3s, transform .35s cubic-bezier(.4,0,.2,1);
    }
    nav.aether-nav.scrolled { background: rgba(42,10,15,.97); border-bottom-color: rgba(212,160,23,.35); }
    nav.aether-nav.hidden { transform: translateY(-100%); }

    .nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
    .nav-logo { width: 32px; height: 32px; background: var(--mustard); border-radius: 8px; display: grid; place-items: center; overflow: hidden; }
    .nav-logo img { width: 22px; height: 22px; object-fit: contain; }
    .nav-name { font-family: 'Playfair Display', serif; font-size: 1.15rem; color: var(--text); letter-spacing: -.02em; }

    .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
    .nav-links a {
      color: var(--muted); text-decoration: none; font-size: .85rem;
      font-weight: 500; letter-spacing: .04em; text-transform: uppercase;
      transition: color .2s; position: relative;
    }
    .nav-links a::after {
      content: ''; position: absolute; bottom: -4px; left: 0; right: 0;
      height: 1px; background: var(--mustard); transform: scaleX(0); transition: transform .25s;
    }
    .nav-links a:hover { color: var(--text); }
    .nav-links a:hover::after { transform: scaleX(1); }

    .nav-acts { display: flex; gap: 10px; align-items: center; }

    .btn-ghost {
      padding: 8px 18px; border: 1px solid var(--border); border-radius: 8px;
      background: transparent; color: var(--text); font-family: 'DM Sans', sans-serif;
      font-size: .82rem; font-weight: 500; cursor: pointer; text-decoration: none;
      transition: border-color .2s, background .2s;
    }
    .btn-ghost:hover { border-color: var(--mustard); background: var(--msoft); }

    .btn-fill {
      padding: 8px 20px; border: none; border-radius: 8px;
      background: var(--mustard); color: #2a0a0f; font-family: 'DM Sans', sans-serif;
      font-size: .82rem; font-weight: 700; cursor: pointer; text-decoration: none;
      letter-spacing: .04em; text-transform: uppercase;
      transition: box-shadow .2s, transform .2s;
    }
    .btn-fill:hover { box-shadow: 0 6px 22px rgba(212,160,23,.45); transform: translateY(-1px); }

    .hamburger {
      display: none; flex-direction: column; gap: 5px;
      cursor: pointer; padding: 4px; background: none; border: none;
    }
    .hamburger span { display: block; width: 22px; height: 2px; background: var(--text); border-radius: 2px; transition: all .3s; }
    .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    .mob-menu {
      display: none; position: fixed; top: var(--nav-h); left: 0; right: 0;
      background: rgba(42,10,15,.98); backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border); padding: 24px 6%;
      flex-direction: column; gap: 4px; z-index: 199;
    }
    .mob-menu.open { display: flex; animation: slideDown .3s ease both; }
    .mob-menu a {
      color: var(--muted); text-decoration: none; font-size: .95rem; font-weight: 500;
      padding: 13px 0; border-bottom: 1px solid rgba(92,31,42,.4); transition: color .2s;
    }
    .mob-menu a:last-of-type { border-bottom: none; }
    .mob-menu a:hover { color: var(--mustard); }
    .mob-btns { display: flex; gap: 10px; padding-top: 16px; }
    .mob-btns .btn-fill, .mob-btns .btn-ghost { flex: 1; text-align: center; }

    /* ── HERO ── */
    .hero-section {
      position: relative; z-index: 1; min-height: 100vh;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; padding: calc(var(--nav-h) + 80px) 6% 80px; overflow: hidden;
    }
    .hero-glow {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -55%);
      width: 700px; height: 700px;
      background: radial-gradient(circle, rgba(212,160,23,.1) 0%, transparent 65%);
      pointer-events: none;
    }
    .badge {
      display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px;
      border: 1px solid rgba(212,160,23,.4); border-radius: 100px;
      background: var(--msoft); font-size: .73rem; font-weight: 600;
      color: var(--mustard); letter-spacing: .08em; text-transform: uppercase;
      margin-bottom: 28px; animation: fadeUp .6s ease both;
    }
    .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mustard); animation: pulse 2s infinite; }

    .hero-section h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.8rem, 7vw, 5.2rem);
      line-height: 1.08; letter-spacing: -.04em; margin-bottom: 24px;
      animation: fadeUp .6s .1s ease both;
    }
    .hero-section h1 em { font-style: normal; color: var(--mustard); text-shadow: 0 0 50px rgba(212,160,23,.35); }
    .hero-sub {
      font-size: clamp(.95rem, 2vw, 1.1rem); color: var(--muted); font-weight: 300;
      line-height: 1.8; max-width: 560px; margin: 0 auto 44px;
      animation: fadeUp .6s .2s ease both;
    }
    .hero-acts {
      display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
      margin-bottom: 64px; animation: fadeUp .6s .3s ease both;
    }
    .btn-hero {
      padding: 15px 36px; border: none; border-radius: 12px; background: var(--mustard);
      color: #2a0a0f; font-family: 'DM Sans', sans-serif; font-size: .95rem; font-weight: 700;
      cursor: pointer; text-decoration: none; letter-spacing: .06em; text-transform: uppercase;
      transition: box-shadow .25s, transform .2s;
    }
    .btn-hero:hover { box-shadow: 0 12px 40px rgba(212,160,23,.5); transform: translateY(-2px); }
    .btn-outline {
      padding: 14px 36px; border: 1.5px solid var(--border); border-radius: 12px;
      background: transparent; color: var(--text); font-family: 'DM Sans', sans-serif;
      font-size: .95rem; font-weight: 500; cursor: pointer; text-decoration: none;
      transition: border-color .2s, background .2s;
    }
    .btn-outline:hover { border-color: var(--mustard); background: var(--msoft); }

    /* ── HERO MOCKUP ── */
    .hero-mockup {
      width: 100%; max-width: 880px; background: var(--panel);
      border: 1px solid var(--border); border-radius: 20px; overflow: hidden;
      box-shadow: 0 30px 100px rgba(0,0,0,.6); position: relative;
      animation: fadeUp .8s .4s ease both;
    }
    .hero-mockup::before {
      content: ''; position: absolute; top: -1px; left: 15%; right: 15%;
      height: 2px; background: linear-gradient(to right, transparent, var(--mustard), transparent);
    }
    .m-topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 13px 20px; background: var(--input-bg); border-bottom: 1px solid var(--border);
    }
    .m-dots { display: flex; gap: 6px; }
    .m-dots span { width: 10px; height: 10px; border-radius: 50%; }
    .m-dots span:nth-child(1) { background: #ff5f57; }
    .m-dots span:nth-child(2) { background: #febc2e; }
    .m-dots span:nth-child(3) { background: #28c840; }
    .m-url { background: var(--border); border-radius: 6px; padding: 5px 16px; font-size: .73rem; color: var(--muted); }
    .m-body { display: flex; min-height: 300px; }
    .m-sidebar {
      width: 190px; min-width: 190px; border-right: 1px solid var(--border);
      padding: 18px 14px; display: flex; flex-direction: column; gap: 4px;
    }
    .m-item {
      display: flex; align-items: center; gap: 10px; padding: 9px 12px;
      border-radius: 8px; font-size: .78rem; color: var(--muted); cursor: default; transition: all .2s;
    }
    .m-item svg { width: 15px; height: 15px; flex-shrink: 0; }
    .m-item.active { background: var(--msoft); color: var(--mustard); }
    .m-main { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
    .qcard {
      background: var(--input-bg); border: 1px solid var(--border); border-radius: 10px;
      padding: 14px 18px; display: flex; align-items: center; gap: 14px; transition: border-color .2s;
    }
    .qcard:hover { border-color: rgba(212,160,23,.4); }
    .qcard-icon { width: 40px; height: 40px; min-width: 40px; border-radius: 9px; display: grid; place-items: center; font-size: 1.1rem; }
    .qcard-info { flex: 1; }
    .qcard-title { font-size: .85rem; font-weight: 600; margin-bottom: 2px; }
    .qcard-sub { font-size: .72rem; color: var(--muted); }
    .qbadge { padding: 3px 9px; border-radius: 100px; font-size: .68rem; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; }
    .qlive { background: rgba(34,197,94,.12); color: #22c55e; border: 1px solid rgba(34,197,94,.25); }
    .qnew { background: var(--msoft); color: var(--mustard); border: 1px solid rgba(212,160,23,.25); }
    .qdone { background: rgba(184,122,128,.08); color: var(--muted); border: 1px solid rgba(184,122,128,.2); }
    .m-lb {
      width: 210px; min-width: 210px; border-left: 1px solid var(--border);
      padding: 18px 14px; display: flex; flex-direction: column; gap: 8px;
    }
    .lb-h { font-size: .73rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
    .lb-r { display: flex; align-items: center; gap: 9px; padding: 5px 0; }
    .lb-pos { width: 18px; font-family: 'Playfair Display', serif; font-size: .88rem; color: var(--muted); text-align: center; }
    .lb-pos.g { color: #ffd700; } .lb-pos.s { color: #c0c0c0; } .lb-pos.b { color: #cd7f32; }
    .lb-av { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-size: .68rem; font-weight: 700; color: #2a0a0f; }
    .lb-nm { flex: 1; font-size: .78rem; font-weight: 500; }
    .lb-xp { font-size: .72rem; color: var(--mustard); font-family: 'Playfair Display', serif; }

    /* ── STATS ── */
    .stats-strip {
      position: relative; z-index: 1; background: var(--panel);
      border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
      padding: 40px 6%; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 0;
    }
    .s-div { width: 1px; height: 44px; background: var(--border); flex-shrink: 0; }
    .s-item { padding: 0 clamp(24px,4.5vw,60px); text-align: center; }
    .s-num { font-family: 'Playfair Display', serif; font-size: clamp(1.9rem,3.8vw,2.7rem); color: var(--mustard); line-height: 1; }
    .s-num sup { font-size: .9rem; vertical-align: super; }
    .s-lbl { font-size: .72rem; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; margin-top: 6px; }

    /* ── FEATURES ── */
    .feat { position: relative; z-index: 1; padding: 96px 6%; }
    .feat.alt { background: var(--panel); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .feat-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; max-width: 1100px; margin: 0 auto; }
    .feat-wrap.flip { direction: rtl; }
    .feat-wrap.flip > * { direction: ltr; }
    .feat-tag {
      display: inline-block; padding: 5px 14px; border-radius: 100px;
      background: var(--msoft); border: 1px solid rgba(212,160,23,.3);
      font-size: .72rem; font-weight: 600; color: var(--mustard);
      letter-spacing: .08em; text-transform: uppercase; margin-bottom: 18px;
    }
    .feat-text h2 { font-family: 'Playfair Display', serif; font-size: clamp(1.7rem,3.5vw,2.5rem); line-height: 1.2; letter-spacing: -.02em; margin-bottom: 14px; }
    .feat-text h2 span { color: var(--mustard); }
    .feat-text p { color: var(--muted); font-size: .93rem; line-height: 1.8; font-weight: 300; margin-bottom: 24px; }
    .feat-pts { display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px; }
    .feat-pt { display: flex; align-items: flex-start; gap: 10px; }
    .feat-pt-ico {
      width: 20px; height: 20px; min-width: 20px; border-radius: 50%;
      background: var(--msoft); display: grid; place-items: center; margin-top: 1px;
    }
    .feat-pt-ico svg { width: 11px; height: 11px; color: var(--mustard); }
    .feat-pt p { color: var(--muted); font-size: .87rem; line-height: 1.6; font-weight: 300; margin: 0; }
    .feat-pt strong { color: var(--text); font-weight: 500; }

    /* ── VISUAL CARDS ── */
    .fv { position: relative; }
    .fv-card {
      background: var(--panel); border: 1px solid var(--border); border-radius: 18px;
      overflow: hidden; box-shadow: 0 20px 70px rgba(0,0,0,.45); position: relative;
    }
    .fv-card::before {
      content: ''; position: absolute; top: -1px; left: 20%; right: 20%;
      height: 2px; background: linear-gradient(to right, transparent, var(--mustard), transparent);
    }
    .fv-hd {
      padding: 14px 18px; background: var(--input-bg); border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
    }
    .fv-hd-title { font-size: .78rem; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--muted); }
    .fv-live { display: flex; align-items: center; gap: 5px; font-size: .68rem; font-weight: 600; color: #22c55e; letter-spacing: .04em; text-transform: uppercase; }
    .fv-live-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: pulse 1.5s infinite; }
    .fv-body { padding: 18px; }
    .fv-q { background: var(--input-bg); border: 1px solid var(--border); border-radius: 10px; padding: 14px; margin-bottom: 10px; }
    .fv-q-lbl { font-size: .68rem; color: var(--mustard); font-weight: 600; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 6px; }
    .fv-q-txt { font-size: .85rem; font-weight: 500; margin-bottom: 10px; }
    .fv-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .fv-opt { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 7px; font-size: .78rem; color: var(--muted); border: 1px solid var(--border); cursor: default; }
    .fv-opt.c { border-color: rgba(34,197,94,.4); background: rgba(34,197,94,.08); color: #22c55e; }
    .fv-opt.w { border-color: rgba(239,68,68,.3); background: rgba(239,68,68,.06); color: #f87171; }
    .opt-d { width: 12px; height: 12px; min-width: 12px; border-radius: 50%; border: 1.5px solid currentColor; opacity: .5; }
    .ai-box { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--msoft); border: 1px solid rgba(212,160,23,.25); border-radius: 8px; font-size: .78rem; color: var(--mustard); }
    .tdots { display: flex; gap: 3px; }
    .tdots span { width: 5px; height: 5px; border-radius: 50%; background: var(--mustard); animation: pulse 1.4s ease infinite; }
    .tdots span:nth-child(2) { animation-delay: .2s; }
    .tdots span:nth-child(3) { animation-delay: .4s; }

    /* Leaderboard big */
    .lb-row { display: flex; align-items: center; gap: 10px; padding: 12px 18px; border-bottom: 1px solid var(--border); }
    .lb-row:last-child { border-bottom: none; }
    .lb-rk { width: 22px; font-family: 'Playfair Display', serif; font-size: .9rem; color: var(--muted); text-align: center; flex-shrink: 0; }
    .lb-rk.g { color: #ffd700; } .lb-rk.s { color: #c0c0c0; } .lb-rk.b { color: #cd7f32; }
    .lb-av2 { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; font-size: .72rem; font-weight: 700; color: #2a0a0f; flex-shrink: 0; }
    .lb-inf { flex: 1; min-width: 0; }
    .lb-nm2 { font-size: .82rem; font-weight: 600; }
    .lb-sec { font-size: .68rem; color: var(--muted); }
    .lb-bar { width: 80px; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; flex-shrink: 0; }
    .lb-fill { height: 100%; background: linear-gradient(to right, var(--mustard), #f5c842); border-radius: 2px; }
    .lb-pts { font-size: .75rem; color: var(--mustard); font-family: 'Playfair Display', serif; flex-shrink: 0; }

    /* XP Profile */
    .xp-body { padding: 18px; }
    .xp-prof { display: flex; align-items: center; gap: 12px; padding: 14px; background: var(--input-bg); border-radius: 10px; margin-bottom: 14px; }
    .xp-av { width: 44px; height: 44px; border-radius: 50%; background: var(--mustard); display: grid; place-items: center; font-family: 'Playfair Display', serif; font-size: 1.2rem; color: #2a0a0f; font-weight: 700; flex-shrink: 0; }
    .xp-nm { font-size: .9rem; font-weight: 600; margin-bottom: 2px; }
    .xp-lv { font-size: .72rem; color: var(--mustard); margin-bottom: 8px; }
    .xp-bar-w { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
    .xp-bar-f { height: 100%; width: 72%; background: linear-gradient(to right, var(--mustard), #f5c842); border-radius: 2px; }
    .xp-bgs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px; }
    .xp-bg { padding: 10px 6px; background: var(--input-bg); border: 1px solid var(--border); border-radius: 9px; text-align: center; opacity: .45; }
    .xp-bg.on { border-color: rgba(212,160,23,.35); opacity: 1; }
    .xp-bg-ico { font-size: 1.1rem; margin-bottom: 4px; }
    .xp-bg-nm { font-size: .64rem; color: var(--muted); }
    .xp-streak { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: var(--msoft); border: 1px solid rgba(212,160,23,.25); border-radius: 9px; }
    .str-fire { font-size: 1.4rem; }
    .str-inf { flex: 1; }
    .str-t { font-size: .8rem; font-weight: 600; }
    .str-s { font-size: .68rem; color: var(--muted); }
    .str-n { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: var(--mustard); font-weight: 700; }

    /* ── TESTIMONIALS ── */
    .tests { position: relative; z-index: 1; padding: 80px 0; background: var(--panel); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); overflow: hidden; }
    .tests-hd { text-align: center; margin-bottom: 48px; padding: 0 6%; }
    .tests-hd h2 { font-family: 'Playfair Display', serif; font-size: clamp(1.7rem,3.5vw,2.5rem); line-height: 1.2; letter-spacing: -.02em; }
    .tests-hd h2 span { color: var(--mustard); }
    .tt-wrap { position: relative; overflow: hidden; }
    .tt-wrap::before, .tt-wrap::after { content: ''; position: absolute; top: 0; bottom: 0; width: 120px; z-index: 2; pointer-events: none; }
    .tt-wrap::before { left: 0; background: linear-gradient(to right, var(--panel), transparent); }
    .tt-wrap::after { right: 0; background: linear-gradient(to left, var(--panel), transparent); }
    .tt-track { display: flex; gap: 18px; animation: scrollT 40s linear infinite; width: max-content; }
    .tt-track:hover { animation-play-state: paused; }
    .tc {
      width: 290px; min-width: 290px; background: var(--panel); border: 1px solid var(--border);
      border-radius: 14px; padding: 22px; position: relative; transition: border-color .3s;
    }
    .tc::before {
      content: ''; position: absolute; top: 0; left: 20%; right: 20%;
      height: 1px; background: linear-gradient(to right, transparent, rgba(212,160,23,.25), transparent);
    }
    .tc:hover { border-color: rgba(212,160,23,.35); }
    .tc-stars { display: flex; gap: 3px; margin-bottom: 12px; }
    .tc-stars svg { width: 13px; height: 13px; fill: var(--mustard); }
    .tc-q { font-size: .86rem; color: var(--muted); line-height: 1.7; font-style: italic; margin-bottom: 16px; font-weight: 300; }
    .tc-q strong { color: var(--text); font-style: normal; font-weight: 500; }
    .tc-auth { display: flex; align-items: center; gap: 9px; }
    .tc-av { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-size: .74rem; font-weight: 700; color: #2a0a0f; flex-shrink: 0; }
    .tc-nm { font-size: .83rem; font-weight: 600; }
    .tc-role { font-size: .7rem; color: var(--muted); margin-top: 1px; }

    /* ── HOW IT WORKS ── */
    .how {
      position: relative; z-index: 1; background: var(--panel);
      border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 96px 6%;
    }
    .how-hd { text-align: center; margin-bottom: 56px; }
    .how-hd h2 { font-family: 'Playfair Display', serif; font-size: clamp(1.7rem,3.5vw,2.5rem); line-height: 1.2; letter-spacing: -.02em; }
    .how-hd h2 span { color: var(--mustard); }
    .how-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px;
      border: 1px solid var(--border); border-radius: 14px; overflow: hidden;
      max-width: 1100px; margin: 0 auto;
    }
    .h-step { background: var(--input-bg); padding: 32px 24px; position: relative; transition: background .3s; cursor: default; }
    .h-step:hover { background: var(--bg); }
    .h-num {
      width: 40px; height: 40px; border-radius: 10px; background: var(--msoft);
      border: 1px solid rgba(212,160,23,.3); display: grid; place-items: center;
      font-family: 'Playfair Display', serif; font-size: 1rem; color: var(--mustard); margin-bottom: 18px;
    }
    .h-step h3 { font-size: .95rem; font-weight: 600; margin-bottom: 8px; }
    .h-step p { color: var(--muted); font-size: .83rem; line-height: 1.6; font-weight: 300; }
    .h-arrow {
      position: absolute; top: 50%; right: -11px; width: 22px; height: 22px;
      background: var(--border); border-radius: 50%; display: grid; place-items: center;
      z-index: 1; transform: translateY(-50%);
    }
    .h-arrow svg { width: 11px; height: 11px; color: var(--mustard); }

    /* ── CTA ── */
    .cta { position: relative; z-index: 1; padding: 96px 6%; text-align: center; overflow: hidden; }
    .cta::before {
      content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 600px; height: 400px;
      background: radial-gradient(ellipse, rgba(212,160,23,.1) 0%, transparent 70%); pointer-events: none;
    }
    .cta-in { position: relative; z-index: 1; max-width: 620px; margin: 0 auto; }
    .cta-in h2 { font-family: 'Playfair Display', serif; font-size: clamp(2rem,5vw,3.3rem); line-height: 1.1; letter-spacing: -.03em; margin-bottom: 18px; }
    .cta-in h2 span { color: var(--mustard); }
    .cta-in p { color: var(--muted); font-size: .98rem; line-height: 1.8; font-weight: 300; margin-bottom: 36px; }
    .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

    /* ── CONTACT ── */
    .contact { position: relative; z-index: 1; background: var(--panel); border-top: 1px solid var(--border); padding: 96px 6%; }
    .cont-wrap { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: start; }
    .cont-text .feat-tag { margin-bottom: 18px; }
    .cont-text h2 { font-family: 'Playfair Display', serif; font-size: clamp(1.7rem,3.5vw,2.5rem); line-height: 1.2; letter-spacing: -.02em; margin-bottom: 14px; }
    .cont-text h2 span { color: var(--mustard); }
    .cont-text p { color: var(--muted); font-size: .9rem; line-height: 1.8; font-weight: 300; margin-bottom: 32px; }
    .cont-items { display: flex; flex-direction: column; gap: 18px; }
    .ci { display: flex; align-items: flex-start; gap: 12px; }
    .ci-ico { width: 40px; height: 40px; min-width: 40px; background: var(--msoft); border: 1px solid rgba(212,160,23,.3); border-radius: 9px; display: grid; place-items: center; }
    .ci-ico svg { width: 17px; height: 17px; color: var(--mustard); }
    .ci h4 { font-size: .86rem; font-weight: 600; margin-bottom: 2px; }
    .ci p { color: var(--muted); font-size: .81rem; line-height: 1.5; font-weight: 300; }
    .cont-form { display: flex; flex-direction: column; gap: 14px; }
    .cf-g label { display: block; font-size: .71rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
    .cf-g input, .cf-g textarea {
      width: 100%; padding: 11px 14px; background: var(--input-bg); border: 1px solid var(--border);
      border-radius: 9px; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: .88rem;
      outline: none; transition: border-color .3s, box-shadow .3s; resize: none;
    }
    .cf-g input:focus, .cf-g textarea:focus { border-color: var(--mustard); box-shadow: 0 0 0 3px rgba(212,160,23,.15); }
    .cf-g input::placeholder, .cf-g textarea::placeholder { color: #7a3a40; }
    .cf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    /* ── FOOTER ── */
    footer.aether-footer {
      position: relative; z-index: 1; border-top: 1px solid var(--border);
      padding: 28px 6%; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;
    }
    .ft-brand { display: flex; align-items: center; gap: 9px; text-decoration: none; }
    .ft-logo { width: 26px; height: 26px; background: var(--mustard); border-radius: 6px; display: grid; place-items: center; overflow: hidden; }
    .ft-logo img { width: 18px; height: 18px; object-fit: contain; }
    .ft-nm { font-family: 'Playfair Display', serif; font-size: .9rem; color: var(--text); }
    .ft-copy { font-size: .76rem; color: var(--muted); }
    .ft-links { display: flex; gap: 22px; }
    .ft-links a { color: var(--muted); text-decoration: none; font-size: .78rem; transition: color .2s; }
    .ft-links a:hover { color: var(--mustard); }

    /* ── RESPONSIVE ── */
    @media (max-width: 1024px) {
      .feat-wrap { gap: 48px; }
      .how-grid { grid-template-columns: repeat(2, 1fr); }
      .h-arrow { display: none; }
      .m-lb, .m-sidebar { display: none; }
    }
    @media (max-width: 768px) {
      .nav-links, .nav-acts { display: none; }
      .hamburger { display: flex; }
      .feat-wrap, .feat-wrap.flip { grid-template-columns: 1fr; direction: ltr; gap: 40px; }
      .cont-wrap { grid-template-columns: 1fr; gap: 44px; }
      .s-item { padding: 16px clamp(14px,3.5vw,36px); }
      footer.aether-footer { flex-direction: column; text-align: center; }
      .ft-links { justify-content: center; }
      .how-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 480px) {
      .fv-opts { grid-template-columns: 1fr; }
      .xp-bgs { grid-template-columns: repeat(2, 1fr); }
      .cf-row { grid-template-columns: 1fr; }
      .hero-acts { flex-direction: column; align-items: stretch; }
      .hero-acts a { text-align: center; }
      .cta-btns { flex-direction: column; align-items: center; }
    }
  `}</style>
);

/* ─── Star SVG ─── */
const StarSvg = () => (
  <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

/* ─── Testimonial Card ─── */
const TestCard = ({ quote, name, role, initials, avatarBg }) => (
  <div className="tc">
    <div className="tc-stars">
      {[1,2,3,4,5].map(i => <StarSvg key={i} />)}
    </div>
    <div className="tc-q" dangerouslySetInnerHTML={{ __html: quote }} />
    <div className="tc-auth">
      <div className="tc-av" style={{ background: avatarBg }}>{initials}</div>
      <div>
        <div className="tc-nm">{name}</div>
        <div className="tc-role">{role}</div>
      </div>
    </div>
  </div>
);

const TESTIMONIALS = [
  { quote: "My students who used to hate quizzes are now <strong>begging me to make more</strong>. The leaderboard changed everything.", name: "Ma. Johnson", role: "Science Teacher · Grade 9", initials: "MJ", avatarBg: "#d4a017" },
  { quote: "I got a <strong>perfect score three times in a row</strong> just to keep the badge. Never studied this hard before!", name: "Liam S.", role: "Student · 3rd Year Section B", initials: "LS", avatarBg: "#b87a80" },
  { quote: "Creating a quiz used to take an hour. With Aether I do it in <strong>under 10 minutes</strong>. My students absolutely love it.", name: "R. Patalen", role: "History Teacher · Senior High", initials: "RP", avatarBg: "#5c1f2a" },
  { quote: "I maintained a <strong>14-day streak</strong> and unlocked the Gold Scholar badge. Best feeling ever — and my grades went up!", name: "Anna C.", role: "Student · 2nd Year Section A", initials: "AC", avatarBg: "#cd7f32" },
  { quote: "Quiet students started speaking up because they wanted to <strong>explain how they got the answer right.</strong> That's powerful.", name: "K. Bautista", role: "Filipino Teacher · Junior High", initials: "KB", avatarBg: "#3d1018" },
  { quote: "The XP system is <strong>addictive in the best way.</strong> I used to dread review sessions — now I look forward to them.", name: "Diego L.", role: "Student · 4th Year Section C", initials: "DL", avatarBg: "#ffd700" },
];

/* ─── Send Message Handler ─── */
function useSendMsg() {
  const [state, setState] = useState("idle");
  const send = () => {
    if (state !== "idle") return;
    setState("sending");
    setTimeout(() => {
      setState("sent");
      setTimeout(() => setState("idle"), 3000);
    }, 1500);
  };
  const label = state === "sending" ? "Sending…" : state === "sent" ? "✓ Message Sent!" : "Send Message →";
  const style = state === "sent" ? { background: "#22c55e" } : {};
  return { send, label, style };
}

/* ─── Main Component ─── */
function LandingPage() {
  const navRef = useRef(null);
  const mmRef = useRef(null);
  const hbRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { send, label: msgLabel, style: msgStyle } = useSendMsg();

  /* Scroll hide/show + scrolled class */
  useEffect(() => {
    let lastY = 0;
    const nav = navRef.current;
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle("scrolled", y > 50);
      if (y > lastY && y > 80) {
        nav.classList.add("hidden");
        setMenuOpen(false);
      } else {
        nav.classList.remove("hidden");
      }
      lastY = y;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Reveal on scroll */
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <GlobalStyles />
      <div className="landing-root">

        {/* ── NAV ── */}
        <nav className="aether-nav" ref={navRef} id="nav">
          <Link to="/" className="nav-brand">
            <div className="nav-logo">
              <img src="/image/logo.png" alt="School Quiz Logo"
                onError={e => { e.target.style.display = "none"; }} />
            </div>
            <span className="nav-name">School Quiz System</span>
          </Link>
          <ul className="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#features">About</a></li>
            <li><a href="#how">How It Works</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
          <div className="nav-acts">
            <Link to="/login" className="btn-ghost">Sign In</Link>
            <Link to="/register" className="btn-fill">Create Account for Free</Link>
          </div>
          <button
            className={`hamburger${menuOpen ? " open" : ""}`}
            ref={hbRef}
            aria-label="Menu"
            onClick={() => setMenuOpen(v => !v)}
          >
            <span/><span/><span/>
          </button>
        </nav>

        {/* Mobile Menu */}
        <div className={`mob-menu${menuOpen ? " open" : ""}`} ref={mmRef}>
          <a href="#home" onClick={closeMenu}>Home</a>
          <a href="#features" onClick={closeMenu}>About</a>
          <a href="#how" onClick={closeMenu}>How It Works</a>
          <a href="#contact" onClick={closeMenu}>Contact Us</a>
          <div className="mob-btns">
            <Link to="/login" className="btn-ghost">Sign In</Link>
            <Link to="/register" className="btn-fill">Create Account for Free</Link>
          </div>
        </div>

        {/* ── HERO ── */}
        <section className="hero-section" id="home">
          <div className="hero-glow" />
          <div className="badge"><div className="badge-dot" />Gamified Learning Platform</div>
          <h1><strong>Create quizzes.</strong><br /><em>Compete.</em> <strong>Conquer.</strong></h1>
          <p className="hero-sub">
            Aether turns every lesson into an epic challenge. Students earn XP, climb leaderboards, and unlock badges — while teachers effortlessly manage quizzes and track real progress.
          </p>
          <div className="hero-acts">
            <Link to="/register" className="btn-hero">Start for Free →</Link>
            <a href="#how" className="btn-outline">How It Works</a>
          </div>

          {/* Dashboard Mockup */}
          <div className="hero-mockup reveal">
            <div className="m-topbar">
              <div className="m-dots"><span/><span/><span/></div>
              <div className="m-url">aether.edu.ph/dashboard</div>
              <div style={{width:56}} />
            </div>
            <div className="m-body">
              <div className="m-sidebar">
                <div className="m-item active">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                  Dashboard
                </div>
                <div className="m-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  My Quizzes
                </div>
                <div className="m-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  Leaderboard
                </div>
                <div className="m-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  Achievements
                </div>
              </div>
              <div className="m-main">
                <div className="qcard">
                  <div className="qcard-icon" style={{background:"rgba(34,197,94,.1)"}}>📚</div>
                  <div className="qcard-info">
                    <div className="qcard-title">Philippine History — Chapter 5</div>
                    <div className="qcard-sub">24 questions · 3rd Year Section B</div>
                  </div>
                  <div className="qbadge qlive">Live</div>
                </div>
                <div className="qcard">
                  <div className="qcard-icon" style={{background:"rgba(212,160,23,.1)"}}>🔬</div>
                  <div className="qcard-info">
                    <div className="qcard-title">General Biology Quiz 2</div>
                    <div className="qcard-sub">18 questions · 2nd Year Section A</div>
                  </div>
                  <div className="qbadge qnew">New</div>
                </div>
                <div className="qcard">
                  <div className="qcard-icon" style={{background:"rgba(184,122,128,.08)"}}>📐</div>
                  <div className="qcard-info">
                    <div className="qcard-title">Algebra Fundamentals</div>
                    <div className="qcard-sub">30 questions · 1st Year Section C</div>
                  </div>
                  <div className="qbadge qdone">Done</div>
                </div>
              </div>
              <div className="m-lb">
                <div className="lb-h">🏆 Top This Week</div>
                <div className="lb-r"><div className="lb-pos g">1</div><div className="lb-av" style={{background:"#ffd700"}}>LM</div><div className="lb-nm">Lei M.</div><div className="lb-xp">4,820</div></div>
                <div className="lb-r"><div className="lb-pos s">2</div><div className="lb-av" style={{background:"#c0c0c0"}}>JS</div><div className="lb-nm">Juan S.</div><div className="lb-xp">4,310</div></div>
                <div className="lb-r"><div className="lb-pos b">3</div><div className="lb-av" style={{background:"#cd7f32"}}>MR</div><div className="lb-nm">Maria R.</div><div className="lb-xp">3,975</div></div>
                <div className="lb-r"><div className="lb-pos">4</div><div className="lb-av" style={{background:"#b87a80"}}>AP</div><div className="lb-nm">Ana P.</div><div className="lb-xp">3,540</div></div>
                <div className="lb-r"><div className="lb-pos">5</div><div className="lb-av" style={{background:"#5c1f2a"}}>CG</div><div className="lb-nm">Carlo G.</div><div className="lb-xp">3,190</div></div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className="stats-strip">
          <div className="s-item"><div className="s-num">12<sup>K+</sup></div><div className="s-lbl">Students</div></div>
          <div className="s-div"/>
          <div className="s-item"><div className="s-num">450<sup>+</sup></div><div className="s-lbl">Quizzes Created</div></div>
          <div className="s-div"/>
          <div className="s-item"><div className="s-num">98<sup>%</sup></div><div className="s-lbl">Satisfaction</div></div>
          <div className="s-div"/>
          <div className="s-item"><div className="s-num">3<sup>×</sup></div><div className="s-lbl">Faster Learning</div></div>
        </div>

        {/* ── FEATURE 1: Quiz Builder ── */}
        <section className="feat" id="features">
          <div className="feat-wrap">
            <div className="feat-text reveal">
              <div className="feat-tag">For Teachers</div>
              <h2>Create quizzes <span>in minutes</span></h2>
              <p>No technical skills required. Choose a template, add your questions, and your quiz is automatically ready to assign to any section.</p>
              <div className="feat-pts">
                <div className="feat-pt"><div className="feat-pt-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div><p><strong>Multiple question types</strong> — multiple choice, true/false, identification, and more.</p></div>
                <div className="feat-pt"><div className="feat-pt-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div><p><strong>Assign by section</strong> — send quizzes directly to specific year levels and sections.</p></div>
                <div className="feat-pt"><div className="feat-pt-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div><p><strong>Set time limits</strong> — control quiz duration to create urgency and focus.</p></div>
              </div>
              <Link to="/register" className="btn-hero">Create Your First Quiz →</Link>
            </div>
            <div className="fv reveal d1">
              <div className="fv-card">
                <div className="fv-hd">
                  <span className="fv-hd-title">Quiz Builder</span>
                  <span className="fv-live"><div className="fv-live-dot"/>Auto-saving</span>
                </div>
                <div className="fv-body">
                  <div className="fv-q">
                    <div className="fv-q-lbl">Question 2 of 10</div>
                    <div className="fv-q-txt">What is the capital of the Philippines?</div>
                    <div className="fv-opts">
                      <div className="fv-opt c"><div className="opt-d"/>Manila</div>
                      <div className="fv-opt"><div className="opt-d"/>Cebu City</div>
                      <div className="fv-opt w"><div className="opt-d"/>Davao</div>
                      <div className="fv-opt"><div className="opt-d"/>Quezon City</div>
                    </div>
                  </div>
                  <div className="ai-box"><div className="tdots"><span/><span/><span/></div>AI is generating your next question…</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURE 2: Leaderboard ── */}
        <section className="feat alt">
          <div className="feat-wrap flip">
            <div className="feat-text reveal">
              <div className="feat-tag">Live Competition</div>
              <h2>Leaderboards that <span>drive results</span></h2>
              <p>Nothing motivates students like seeing their name climb the board. Rankings update instantly after every answer, turning every quiz into a friendly competition.</p>
              <div className="feat-pts">
                <div className="feat-pt"><div className="feat-pt-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div><p><strong>Weekly &amp; all-time rankings</strong> — fresh competition every week so everyone has a chance.</p></div>
                <div className="feat-pt"><div className="feat-pt-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div><p><strong>Section-based boards</strong> — compete within your section or against the whole school.</p></div>
                <div className="feat-pt"><div className="feat-pt-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div><p><strong>Teacher visibility</strong> — monitor every student's standing and spot who needs help.</p></div>
              </div>
              <Link to="/register" className="btn-hero">Join the Competition →</Link>
            </div>
            <div className="fv reveal d1">
              <div className="fv-card">
                <div className="fv-hd">
                  <span className="fv-hd-title">🏆 Weekly Leaderboard</span>
                  <span className="fv-live"><div className="fv-live-dot"/>Live</span>
                </div>
                {[
                  { rank: "g", label: "1", av: "#ffd700", initials: "LM", name: "Lei M.", section: "3rd Year · Section B", width: "96%", xp: "4,820 XP" },
                  { rank: "s", label: "2", av: "#c0c0c0", initials: "JS", name: "Juan S.", section: "2nd Year · Section A", width: "84%", xp: "4,310 XP" },
                  { rank: "b", label: "3", av: "#cd7f32", initials: "MR", name: "Maria R.", section: "4th Year · Section C", width: "74%", xp: "3,975 XP" },
                  { rank: "", label: "4", av: "#b87a80", initials: "AP", name: "Ana P.", section: "1st Year · Section D", width: "64%", xp: "3,540 XP" },
                  { rank: "", label: "5", av: "#5c1f2a", initials: "CG", name: "Carlo G.", section: "3rd Year · Section A", width: "57%", xp: "3,190 XP" },
                ].map(r => (
                  <div className="lb-row" key={r.label}>
                    <div className={`lb-rk ${r.rank}`}>{r.label}</div>
                    <div className="lb-av2" style={{background: r.av}}>{r.initials}</div>
                    <div className="lb-inf"><div className="lb-nm2">{r.name}</div><div className="lb-sec">{r.section}</div></div>
                    <div className="lb-bar"><div className="lb-fill" style={{width: r.width}}/></div>
                    <div className="lb-pts">{r.xp}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURE 3: AI Quiz Creation ── */}
        <section className="feat alt">
          <div className="feat-wrap">
            <div className="feat-text reveal">
              <div className="feat-tag">Powered by AI</div>
              <h2>Create quizzes effortlessly <span>with AI</span></h2>
              <p>Just provide a topic or upload your file — AI instantly generates complete quiz questions, answer choices, and even sets the difficulty. No more spending hours writing questions manually.</p>
              <div className="feat-pts">
                <div className="feat-pt"><div className="feat-pt-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div><p><strong>AI reads your topic</strong> — type a subject or chapter and AI builds the full quiz in seconds.</p></div>
                <div className="feat-pt"><div className="feat-pt-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div><p><strong>Auto-generates choices</strong> — questions, correct answers, and distractors all done for you.</p></div>
                <div className="feat-pt"><div className="feat-pt-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div><p><strong>Adjustable difficulty</strong> — AI fine-tunes easy, medium, or hard questions based on your students' level.</p></div>
                <div className="feat-pt"><div className="feat-pt-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div><p><strong>Review before publishing</strong> — you stay in control. Edit, remove, or approve any AI-generated question.</p></div>
              </div>
              <Link to="/register" className="btn-hero">Try AI Quiz Creation →</Link>
            </div>
            <div className="fv reveal d1">
              <div className="fv-card">
                <div className="fv-hd">
                  <span className="fv-hd-title">✨ AI Quiz Generator</span>
                  <span className="fv-live"><div className="fv-live-dot"/>Generating</span>
                </div>
                <div className="fv-body">
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:".68rem",color:"var(--mustard)",fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",marginBottom:6}}>Topic / Subject</div>
                    <div style={{background:"var(--input-bg)",border:"1px solid var(--mustard)",borderRadius:8,padding:"10px 14px",fontSize:".85rem",color:"var(--text)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      Philippine History — Chapter 5
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:"var(--mustard)"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                  </div>
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:".68rem",color:"var(--mustard)",fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",marginBottom:6}}>Difficulty</div>
                    <div style={{display:"flex",gap:6}}>
                      <div style={{flex:1,padding:7,borderRadius:7,border:"1px solid var(--border)",fontSize:".74rem",color:"var(--muted)",textAlign:"center",cursor:"default"}}>Easy</div>
                      <div style={{flex:1,padding:7,borderRadius:7,border:"1px solid var(--mustard)",background:"var(--msoft)",fontSize:".74rem",color:"var(--mustard)",textAlign:"center",cursor:"default",fontWeight:600}}>Medium</div>
                      <div style={{flex:1,padding:7,borderRadius:7,border:"1px solid var(--border)",fontSize:".74rem",color:"var(--muted)",textAlign:"center",cursor:"default"}}>Hard</div>
                    </div>
                  </div>
                  <div className="fv-q" style={{marginBottom:8}}>
                    <div className="fv-q-lbl" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span>AI Generated · Q1</span>
                      <span style={{color:"#22c55e",fontSize:".65rem"}}>✓ Approved</span>
                    </div>
                    <div className="fv-q-txt">Who was the first President of the Philippine Commonwealth?</div>
                    <div className="fv-opts">
                      <div className="fv-opt c"><div className="opt-d"/>Manuel Quezon</div>
                      <div className="fv-opt"><div className="opt-d"/>Emilio Aguinaldo</div>
                      <div className="fv-opt"><div className="opt-d"/>Jose Rizal</div>
                      <div className="fv-opt"><div className="opt-d"/>Sergio Osmeña</div>
                    </div>
                  </div>
                  <div className="ai-box"><div className="tdots"><span/><span/><span/></div>AI is writing question 2 of 10…</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURE 4: XP & Gamification ── */}
        <section className="feat">
          <div className="feat-wrap">
            <div className="feat-text reveal">
              <div className="feat-tag">For Students</div>
              <h2>Earn XP. Level up. <span>Get rewarded.</span></h2>
              <p>Every correct answer earns experience points. Students level up, unlock badges, maintain streaks, and build a profile they're proud to show off.</p>
              <div className="feat-pts">
                <div className="feat-pt"><div className="feat-pt-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div><p><strong>XP &amp; Level system</strong> — watch your level rise with every quiz you complete.</p></div>
                <div className="feat-pt"><div className="feat-pt-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div><p><strong>Achievement badges</strong> — earn special badges for streaks, perfect scores, and speed.</p></div>
                <div className="feat-pt"><div className="feat-pt-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div><p><strong>Daily streaks</strong> — keep your streak alive to earn bonus XP multipliers.</p></div>
              </div>
              <Link to="/register" className="btn-hero">Start Earning XP →</Link>
            </div>
            <div className="fv reveal d1">
              <div className="fv-card">
                <div className="fv-hd">
                  <span className="fv-hd-title">My Profile</span>
                  <span style={{fontSize:".73rem",color:"var(--mustard)",fontWeight:600}}>Level 7</span>
                </div>
                <div className="xp-body">
                  <div className="xp-prof">
                    <div className="xp-av">L</div>
                    <div style={{flex:1}}>
                      <div className="xp-nm">Lei M.</div>
                      <div className="xp-lv">⭐ Level 7 — Scholar</div>
                      <div className="xp-bar-w"><div className="xp-bar-f"/></div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.05rem",color:"var(--mustard)"}}>4,820</div>
                      <div style={{fontSize:".68rem",color:"var(--muted)"}}>XP Total</div>
                    </div>
                  </div>
                  <div className="xp-bgs">
                    <div className="xp-bg on"><div className="xp-bg-ico">🏆</div><div className="xp-bg-nm">Top Scorer</div></div>
                    <div className="xp-bg on"><div className="xp-bg-ico">🔥</div><div className="xp-bg-nm">7-Day Streak</div></div>
                    <div className="xp-bg on"><div className="xp-bg-ico">⚡</div><div className="xp-bg-nm">Speed Demon</div></div>
                    <div className="xp-bg"><div className="xp-bg-ico">💎</div><div className="xp-bg-nm">Perfect Score</div></div>
                  </div>
                  <div className="xp-streak">
                    <div className="str-fire">🔥</div>
                    <div className="str-inf">
                      <div className="str-t">Current Streak</div>
                      <div className="str-s">Keep it going for bonus XP!</div>
                    </div>
                    <div className="str-n">7</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="tests">
          <div className="tests-hd reveal">
            <div className="feat-tag" style={{marginBottom:16}}>What They Say</div>
            <h2>Loved by teachers and <span>students alike</span></h2>
          </div>
          <div className="tt-wrap reveal">
            <div className="tt-track">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                <TestCard key={i} {...t} />
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="how" id="how">
          <div className="how-hd reveal">
            <div className="feat-tag" style={{marginBottom:14}}>Simple by Design</div>
            <h2>From sign-up to <span>top of the class</span></h2>
          </div>
          <div className="how-grid reveal">
            <div className="h-step">
              <div className="h-num">1</div>
              <h3>Create Your Account</h3>
              <p>Sign up as a student or teacher in under a minute. Choose your role, section, and you're ready to go.</p>
              <div className="h-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div>
            </div>
            <div className="h-step">
              <div className="h-num">2</div>
              <h3>Join or Build a Quiz</h3>
              <p>Teachers create and assign quizzes. Students join with a code or find their class quizzes instantly on the dashboard.</p>
              <div className="h-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div>
            </div>
            <div className="h-step">
              <div className="h-num">3</div>
              <h3>Play &amp; Earn XP</h3>
              <p>Answer questions, earn points, and climb the leaderboard in real time. Streaks and speed bonuses keep the energy high.</p>
              <div className="h-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div>
            </div>
            <div className="h-step">
              <div className="h-num">4</div>
              <h3>Review &amp; Improve</h3>
              <p>Detailed results show exactly what you got right, wrong, and why. Track growth over time with clear analytics.</p>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta">
          <div className="cta-in reveal">
            <div className="feat-tag" style={{marginBottom:18}}>Get Started Today</div>
            <h2>Make learning <span>impossible to ignore.</span></h2>
            <p>Join thousands of Filipino students and teachers who have transformed their classrooms with Aether's gamified quiz platform. Free to start, forever.</p>
            <div className="cta-btns">
              <Link to="/register" className="btn-hero">Create Free Account →</Link>
              <a href="#contact" className="btn-outline">Talk to Us First</a>
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section className="contact" id="contact">
          <div className="cont-wrap">
            <div className="reveal">
              <div className="cont-text">
                <div className="feat-tag">Contact Us</div>
                <h2>Let's bring Aether <span>to your school</span></h2>
                <p>Have questions or want to set up Aether for your entire school? We'd love to hear from you and make it happen.</p>
              </div>
              <div className="cont-items">
                <div className="ci">
                  <div className="ci-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
                  <div><h4>Email</h4><p>hello@aether.edu.ph</p></div>
                </div>
                <div className="ci">
                  <div className="ci-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.22 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg></div>
                  <div><h4>Phone</h4><p>+63 912 345 6789</p></div>
                </div>
                <div className="ci">
                  <div className="ci-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
                  <div><h4>Location</h4><p>Silang, Cavite, Philippines</p></div>
                </div>
              </div>
            </div>

            <div className="cont-form reveal d1">
              <div className="cf-row">
                <div className="cf-g"><label>First Name</label><input type="text" placeholder="Juan"/></div>
                <div className="cf-g"><label>Last Name</label><input type="text" placeholder="dela Cruz"/></div>
              </div>
              <div className="cf-g"><label>Email</label><input type="email" placeholder="your@email.com"/></div>
              <div className="cf-g"><label>Subject</label><input type="text" placeholder="e.g. School Partnership Inquiry"/></div>
              <div className="cf-g"><label>Message</label><textarea rows="5" placeholder="Tell us about your school and how we can help…"/></div>
              <button className="btn-hero" onClick={send} style={{width:"100%", ...msgStyle}}>{msgLabel}</button>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="aether-footer">
          <Link to="/" className="ft-brand">
            <div className="ft-logo">
              <img src="/image/logo.png" alt="Logo"
                onError={e => { e.target.style.display = "none"; }} />
            </div>
            <span className="ft-nm">School Quiz System</span>
          </Link>
          <span className="ft-copy">© {new Date().getFullYear()} School Quiz System. All rights reserved.</span>
          <div className="ft-links">
            <a href="#home">Home</a>
            <a href="#features">About</a>
            <a href="#how">How It Works</a>
            <a href="#contact">Contact</a>
            <Link to="/register">Sign Up</Link>
          </div>
        </footer>

      </div>
    </>
  );
}

export default LandingPage;
