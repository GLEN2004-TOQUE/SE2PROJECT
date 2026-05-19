import { useState, useEffect, useRef, useMemo } from "react";

const STEPS = [
  [0, "SYSTEM::BOOT", "INITIALIZING"],
  [18, "LOADING::ASSETS", "LOADING RESOURCES"],
  [42, "AUTH::VERIFY", "VERIFYING CREDENTIALS"],
  [61, "CONNECT::SERVER", "ESTABLISHING CONNECTION"],
  [78, "SYNC::DATA", "SYNCHRONIZING DATA"],
  [92, "RENDER::UI", "PREPARING INTERFACE"],
  [100, "STATUS::READY", "WELCOME BACK"],
];
const STEP_DELAYS = [400, 700, 700, 700, 700, 700, 700];
const BAR_TRANSITION_MS = 750;
const EXIT_MS = 700;

export default function Preloader({ onDone }) {
  const [pct, setPct] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState("SYSTEM::BOOT");
  const [status, setStatus] = useState("INITIALIZING");
  const [ready, setReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [sysTime, setSysTime] = useState("--:--:--");
  const canvasRef = useRef(null);
  const barRef = useRef(null);
  const onDoneRef = useRef(onDone);
  const finishedRef = useRef(false);
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setSysTime(
        String(n.getHours()).padStart(2, "0") +
          ":" +
          String(n.getMinutes()).padStart(2, "0") +
          ":" +
          String(n.getSeconds()).padStart(2, "0")
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const timers = [];
    const schedule = (fn, ms) => {
      const id = setTimeout(fn, ms);
      timers.push(id);
      return id;
    };

    let i = 0;
    const run = () => {
      if (i >= STEPS.length) return;
      const [val, ph, st] = STEPS[i];
      const isLast = i === STEPS.length - 1;

      setPct(val);
      setStepIndex(i);
      schedule(() => {
        setPhase(ph);
        setStatus(st);
      }, 250);

      if (!isLast) {
        schedule(run, STEP_DELAYS[i]);
      } else {
        setReady(true);
      }
      i++;
    };

    schedule(run, 600);
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (pct < 100 || finishedRef.current) return;

    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      if (reducedMotion) {
        onDoneRef.current?.();
        return;
      }
      setExiting(true);
      setTimeout(() => onDoneRef.current?.(), EXIT_MS);
    };

    const bar = barRef.current;
    if (!bar) {
      finish();
      return;
    }

    const onTransitionEnd = (e) => {
      if (e.target === bar && e.propertyName === "width") finish();
    };
    bar.addEventListener("transitionend", onTransitionEnd);
    const fallback = setTimeout(finish, BAR_TRANSITION_MS + 80);

    return () => {
      bar.removeEventListener("transitionend", onTransitionEnd);
      clearTimeout(fallback);
    };
  }, [pct, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, raf;
    let particles = [];
    let t = 0;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = () => {
      particles.push({
        x: Math.random() * W,
        y: Math.random() < 0.5 ? H + 4 : Math.random() * H,
        vx: (Math.random() - 0.5) * 0.5,
        vy: Math.random() < 0.5 ? -(0.2 + Math.random() * 0.7) : 0,
        size: 0.6 + Math.random() * 1.8,
        life: 1,
        decay: 0.002 + Math.random() * 0.005,
        color: Math.random() > 0.5 ? [220, 175, 50] : [200, 55, 30],
        pulse: Math.random() > 0.6,
      });
    };

    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H * 0.42;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.55);
      glow.addColorStop(0, "rgba(200,150,30,0.07)");
      glow.addColorStop(0.6, "rgba(100,15,15,0.03)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      if (Math.random() < 0.4) spawn();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p.pulse) {
          p.x += p.vx;
          p.y += p.vy;
        }
        p.life -= p.decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const [r, g, b] = p.color;
        ctx.globalAlpha = Math.max(0, p.life * 0.7);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = "rgba(200,150,30,0.3)";
      ctx.lineWidth = 0.4;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 100) {
            ctx.globalAlpha = (1 - dist / 100) * 0.12;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 0.03 + Math.sin(t * 0.4) * 0.008;
      ctx.strokeStyle = "rgba(200,150,30,.4)";
      for (let r = 80; r < Math.max(W, H); r += 100) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');

        @keyframes pl-orbit1    { to { transform: rotate(360deg); } }
        @keyframes pl-orbit2    { to { transform: rotate(-360deg); } }
        @keyframes pl-floatY    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pl-logoIn    { 0%{opacity:0;transform:scale(.8)} 100%{opacity:1;transform:scale(1)} }
        @keyframes pl-titleIn   { 0%{opacity:0;transform:translateY(16px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes pl-charIn    { 0%{opacity:0} 100%{opacity:1} }
        @keyframes pl-wave      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes pl-footerIn  { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes pl-shimmer   { 0%{transform:translateX(-120%)} 100%{transform:translateX(250%)} }
        @keyframes pl-ringExpand{ 0%{transform:scale(.9);opacity:.4} 100%{transform:scale(1.6);opacity:0} }
        @keyframes pl-statusBlink{ 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes pl-dotPulse  { 0%,80%,100%{opacity:.2;transform:scale(.65)} 40%{opacity:1;transform:scale(1)} }
        @keyframes pl-rays      { to { transform: translate(-50%,-50%) rotate(360deg); } }
        @keyframes pl-scanline  { 0%{top:-4px;opacity:0} 8%{opacity:1} 92%{opacity:1} 100%{top:100%;opacity:0} }
        @keyframes pl-exit      { to { opacity:0; filter:blur(10px); } }
        @keyframes pl-barGlow   { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.2)} }

        .pl-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          min-height: 100dvh;
          background: #040106;
          background-image:
            radial-gradient(ellipse 130% 100% at 0% 0%, #220808 0%, transparent 50%),
            radial-gradient(ellipse 100% 80% at 100% 100%, #120e00 0%, transparent 45%),
            radial-gradient(ellipse 80% 60% at 50% 40%, #0a0003 0%, transparent 65%);
          font-family: 'Rajdhani', sans-serif;
          overflow: hidden;
          box-sizing: border-box;
        }
        .pl-root *, .pl-root *::before, .pl-root *::after { box-sizing: border-box; }
        .pl-root.pl-exit { animation: pl-exit ${EXIT_MS}ms ease forwards; pointer-events: none; }

        .pl-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.5;
        }

        .pl-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .pl-bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(0deg, rgba(200,160,30,.02) 0, transparent 1px, transparent clamp(32px, 6vw, 48px)),
            repeating-linear-gradient(90deg, rgba(200,160,30,.02) 0, transparent 1px, transparent clamp(32px, 6vw, 48px));
        }
        .pl-bg-rays {
          position: absolute;
          width: 160vmax;
          height: 160vmax;
          left: 50%;
          top: 38%;
          transform: translate(-50%, -50%);
          background: conic-gradient(from 0deg,
            transparent, rgba(200,150,30,.035) 25deg, transparent 50deg,
            transparent, rgba(180,40,20,.025) 120deg, transparent 150deg,
            transparent, rgba(200,150,30,.03) 200deg, transparent 230deg);
          animation: pl-rays 100s linear infinite;
          opacity: 0.85;
        }
        .pl-bg-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 75% at 50% 42%, transparent 30%, rgba(0,0,0,.7) 100%);
        }
        .pl-bg-scan {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(200,150,30,.15) 50%, transparent);
          animation: pl-scanline 6s linear infinite;
        }

        .pl-hud {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 8px;
          padding:
            max(12px, env(safe-area-inset-top))
            max(16px, env(safe-area-inset-right))
            0
            max(16px, env(safe-area-inset-left));
          font-family: 'Share Tech Mono', monospace;
          font-size: clamp(8px, 2vw, 10px);
          letter-spacing: 0.12em;
          color: rgba(200,150,30,.32);
        }
        .pl-hud span:last-child { margin-left: auto; }

        .pl-stage {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(16px, 4vw, 32px);
          width: 100%;
          min-height: 0;
        }

        .pl-logo-wrap {
          position: relative;
          width: clamp(120px, 28vw, 200px);
          height: clamp(120px, 28vw, 200px);
          margin-bottom: clamp(1rem, 4vw, 2rem);
          animation: pl-logoIn 0.9s cubic-bezier(.34,1.4,.64,1) 0.2s both;
        }
        .pl-logo-orbit {
          position: absolute;
          inset: clamp(-20px, -5vw, -32px);
          animation: pl-orbit1 24s linear infinite;
        }
        .pl-logo-orbit-inner {
          position: absolute;
          inset: clamp(-10px, -3vw, -18px);
          animation: pl-orbit2 16s linear infinite;
        }
        .pl-logo-orbit svg,
        .pl-logo-orbit-inner svg {
          width: 100%;
          height: 100%;
        }
        .pl-logo-ring {
          position: absolute;
          inset: -6%;
          border-radius: 50%;
          border: 1px solid rgba(200,150,30,.35);
          animation: pl-ringExpand 2.8s ease-out infinite;
        }
        .pl-logo-ring-2 {
          animation-delay: 1.4s;
          border-color: rgba(180,40,20,.28);
        }
        .pl-logo-core {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pl-floatY 4.5s ease-in-out infinite;
        }
        .pl-logo-core img {
          width: 72%;
          height: 72%;
          object-fit: contain;
          filter: drop-shadow(0 0 clamp(12px, 3vw, 28px) rgba(200,150,30,.4));
        }

        .pl-brand {
          text-align: center;
          width: 100%;
          max-width: min(96vw, 720px);
          margin-top: clamp(4px, 1.5vw, 12px);
        }
        .pl-title {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: flex-end;
          margin: 0;
          padding: 0;
          font-family: 'Cinzel', serif;
          font-size: clamp(1.85rem, 8.5vw, 3.4rem);
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: clamp(0.05em, 1.2vw, 0.12em);
        }
        .pl-title-char {
          display: inline-block;
          color: #ffe566;
          text-shadow:
            0 0 8px rgba(255, 240, 160, 1),
            0 0 22px rgba(232, 192, 64, 0.85),
            0 0 40px rgba(200, 150, 30, 0.45),
            0 2px 8px rgba(0, 0, 0, 0.9);
          animation:
            pl-charIn 0.55s ease-out both,
            pl-wave 2s ease-in-out infinite;
          will-change: transform;
        }
        .pl-title-space {
          width: 0.28em;
          animation: pl-charIn 0.65s cubic-bezier(.22, 1.3, .36, 1) both;
        }
        .pl-title-line {
          display: block;
          width: min(70%, 280px);
          height: 1px;
          margin: clamp(10px, 2.5vw, 16px) auto 0;
          background: linear-gradient(90deg, transparent, rgba(200,150,30,.55), transparent);
          box-shadow: 0 0 12px rgba(200,150,30,.35);
          animation: pl-titleIn 0.8s ease 0.9s both;
        }
        .pl-brand p {
          margin: clamp(8px, 2vw, 14px) 0 0;
          font-size: clamp(0.65rem, 2.2vw, 0.85rem);
          font-weight: 500;
          letter-spacing: clamp(0.14em, 1vw, 0.32em);
          text-transform: uppercase;
          color: rgba(200,160,90,.5);
          animation: pl-titleIn 0.8s ease 1s both;
        }

        .pl-footer {
          position: relative;
          z-index: 2;
          width: 100%;
          padding:
            0
            max(clamp(16px, 5vw, 48px), env(safe-area-inset-right))
            max(clamp(20px, 5vh, 40px), env(safe-area-inset-bottom))
            max(clamp(16px, 5vw, 48px), env(safe-area-inset-left));
          animation: pl-footerIn 0.85s ease 0.7s both;
        }

        .pl-progress-wrap {
          width: 100%;
          max-width: min(92vw, 720px);
          margin: 0 auto;
        }

        .pl-progress-meta {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          margin-bottom: clamp(8px, 2vw, 12px);
        }
        .pl-status {
          display: flex;
          align-items: center;
          gap: clamp(6px, 1.5vw, 10px);
          min-width: 0;
          flex: 1;
        }
        .pl-status-dot {
          width: clamp(5px, 1.2vw, 7px);
          height: clamp(5px, 1.2vw, 7px);
          border-radius: 50%;
          flex-shrink: 0;
          background: #e8c040;
          box-shadow: 0 0 8px rgba(200,150,30,.7);
          animation: pl-statusBlink 1.4s ease-in-out infinite;
        }
        .pl-root.pl-ready .pl-status-dot {
          background: #2ee85a;
          box-shadow: 0 0 10px rgba(46,232,90,.6);
        }
        .pl-status-text {
          font-family: 'Share Tech Mono', monospace;
          font-size: clamp(0.58rem, 2vw, 0.72rem);
          letter-spacing: 0.08em;
          color: rgba(200,150,30,.55);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.4s;
        }
        .pl-root.pl-ready .pl-status-text { color: rgba(46,232,90,.75); }

        .pl-pct {
          font-family: 'Cinzel', serif;
          font-size: clamp(0.95rem, 3.5vw, 1.25rem);
          font-weight: 700;
          color: #e8c040;
          flex-shrink: 0;
          transition: color 0.4s;
        }
        .pl-root.pl-ready .pl-pct { color: #5eea7a; }

        .pl-bar-track {
          position: relative;
          width: 100%;
          height: clamp(4px, 1.2vw, 6px);
          background: rgba(255,255,255,.05);
          border-radius: 99px;
          overflow: hidden;
        }
        .pl-bar-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #5a0a0a, #a01515, #c8900a, #ffe566, #c8900a);
          background-size: 200% auto;
          transition: width ${BAR_TRANSITION_MS}ms cubic-bezier(.22,1,.36,1);
          position: relative;
          overflow: hidden;
          animation: pl-barGlow 2s ease-in-out infinite;
          box-shadow: 0 0 14px rgba(200,150,30,.35);
        }
        .pl-root.pl-ready .pl-bar-fill {
          box-shadow: 0 0 18px rgba(46,232,90,.4);
        }
        .pl-bar-shine {
          position: absolute;
          inset: 0 auto 0 0;
          width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,245,180,.65), transparent);
          animation: pl-shimmer 2s ease-in-out infinite;
        }

        .pl-phase-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(10px, 2.5vw, 16px);
          margin-top: clamp(12px, 3vw, 18px);
        }
        .pl-phase {
          font-family: 'Share Tech Mono', monospace;
          font-size: clamp(0.58rem, 1.8vw, 0.68rem);
          letter-spacing: 0.12em;
          color: rgba(200,160,70,.4);
          text-align: center;
          transition: color 0.4s;
        }
        .pl-root.pl-ready .pl-phase { color: rgba(46,232,90,.5); }

        .pl-steps {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: clamp(4px, 1.2vw, 8px);
          width: 100%;
          max-width: min(92vw, 560px);
        }
        .pl-step-pip {
          width: clamp(16px, 4vw, 28px);
          height: 3px;
          border-radius: 99px;
          background: rgba(200,150,30,.12);
          transition: background 0.35s, box-shadow 0.35s, transform 0.35s;
        }
        .pl-step-pip.pl-done {
          background: rgba(200,150,30,.55);
          box-shadow: 0 0 6px rgba(200,150,30,.4);
        }
        .pl-step-pip.pl-active {
          background: #e8c040;
          box-shadow: 0 0 10px rgba(232,192,64,.7);
          transform: scaleY(1.4);
        }

        .pl-dots {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        .pl-dots span {
          width: clamp(4px, 1vw, 6px);
          height: clamp(4px, 1vw, 6px);
          border-radius: 50%;
          background: #c8900a;
        }
        .pl-dots span:nth-child(2) { animation: pl-dotPulse 1.5s ease-in-out 0.2s infinite; }
        .pl-dots span:nth-child(1) { animation: pl-dotPulse 1.5s ease-in-out 0s infinite; }
        .pl-dots span:nth-child(3) { animation: pl-dotPulse 1.5s ease-in-out 0.4s infinite; }
        .pl-root.pl-ready .pl-dots span { background: #2ee85a; }

        @media (max-width: 380px) {
          .pl-hud { font-size: 7px; letter-spacing: 0.08em; }
          .pl-brand h1 { letter-spacing: 0.03em; }
        }

        @media (min-width: 1024px) {
          .pl-stage { padding-bottom: 4vh; }
          .pl-footer { padding-bottom: max(48px, env(safe-area-inset-bottom)); }
        }

        @media (prefers-reduced-motion: reduce) {
          .pl-bg-rays, .pl-bg-scan, .pl-logo-orbit, .pl-logo-orbit-inner,
          .pl-logo-ring, .pl-logo-core, .pl-bar-shine, .pl-dots span,
          .pl-status-dot, .pl-bar-fill { animation: none !important; }
          .pl-logo-core { animation: none; }
          .pl-title-char {
            animation: pl-charIn 0.5s ease both !important;
            transform: none !important;
          }
        }
      `}</style>

      <div
        className={`pl-root${ready ? " pl-ready" : ""}${exiting ? " pl-exit" : ""}`}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Loading: ${status}`}
      >
        <canvas ref={canvasRef} className="pl-canvas" aria-hidden />

        <div className="pl-bg" aria-hidden>
          <div className="pl-bg-grid" />
          {!reducedMotion && <div className="pl-bg-rays" />}
          <div className="pl-bg-vignette" />
          {!reducedMotion && <div className="pl-bg-scan" />}
        </div>

        <header className="pl-hud">
          <span>PHILTECH GMA</span>
          <span>{sysTime}</span>
        </header>

        <main className="pl-stage">
          <div className="pl-logo-wrap">
            {!reducedMotion && (
              <>
                <div className="pl-logo-orbit">
                  <svg viewBox="0 0 240 240" fill="none">
                    <circle cx="120" cy="120" r="115" stroke="rgba(200,150,30,.12)" strokeWidth="0.5" strokeDasharray="2 10" />
                  </svg>
                </div>
                <div className="pl-logo-orbit-inner">
                  <svg viewBox="0 0 210 210" fill="none">
                    <circle cx="105" cy="105" r="100" stroke="rgba(180,40,20,.15)" strokeWidth="0.5" strokeDasharray="4 8" />
                  </svg>
                </div>
                <div className="pl-logo-ring" />
                <div className="pl-logo-ring pl-logo-ring-2" />
              </>
            )}
            <div className="pl-logo-core">
              <img src="/image/logo.png" alt="" />
            </div>
          </div>

          <div className="pl-brand">
            <h1 className="pl-title" aria-label="PHILTECH GMA">
              {"PHILTECH GMA".split("").map((char, i) => (
                <span
                  key={`${char}-${i}`}
                  className={`pl-title-char${char === " " ? " pl-title-space" : ""}`}
                  style={{
                    animationDelay: `${0.35 + i * 0.06}s, ${0.9 + i * 0.1}s`,
                  }}
                  aria-hidden={char === " "}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>
            <span className="pl-title-line" aria-hidden />
            <p>Quiz System</p>
          </div>
        </main>

        <footer className="pl-footer">
          <div className="pl-progress-wrap">
            <div className="pl-progress-meta">
              <div className="pl-status">
                <span className="pl-status-dot" aria-hidden />
                <span className="pl-status-text" aria-live="polite">
                  {status}
                </span>
              </div>
              <span className="pl-pct">{pct}%</span>
            </div>

            <div className="pl-bar-track">
              <div ref={barRef} className="pl-bar-fill" style={{ width: `${pct}%` }}>
                {!reducedMotion && <div className="pl-bar-shine" />}
              </div>
            </div>

            <div className="pl-phase-row">
              <div className="pl-steps" aria-hidden>
                {STEPS.slice(0, -1).map(([, ph], i) => (
                  <div
                    key={ph}
                    className={`pl-step-pip${i < stepIndex ? " pl-done" : ""}${i === stepIndex ? " pl-active" : ""}`}
                    title={ph.replace("::", " ")}
                  />
                ))}
              </div>
              <p className="pl-phase">{phase}</p>
              <div className="pl-dots" aria-hidden>
                <span /><span /><span />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
