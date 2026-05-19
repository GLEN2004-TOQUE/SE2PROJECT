import { useState, useEffect, useRef } from "react";

const STEPS = [
  [0,   "SYSTEM::BOOT",    "INITIALIZING"],
  [18,  "LOADING::ASSETS", "LOADING RESOURCES"],
  [42,  "AUTH::VERIFY",    "VERIFYING CREDENTIALS"],
  [61,  "CONNECT::SERVER", "ESTABLISHING CONNECTION"],
  [78,  "SYNC::DATA",      "SYNCHRONIZING DATA"],
  [92,  "RENDER::UI",      "PREPARING INTERFACE"],
  [100, "STATUS::READY",   "WELCOME BACK"],
];
const STEP_DELAYS = [400, 700, 700, 700, 700, 700, 900];

export default function Preloader({ onDone }) {
  const [pct, setPct]         = useState(0);
  const [phase, setPhase]     = useState("SYSTEM::BOOT");
  const [status, setStatus]   = useState("INITIALIZING");
  const [ready, setReady]     = useState(false);
  const [sysTime, setSysTime] = useState("--:--:--");
  const [teams, setTeams]     = useState(0);
  const [events, setEvents]   = useState(0);
  const [players, setPlayers] = useState(0);
  const canvasRef = useRef(null);

  /* ── clock ── */
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setSysTime(
        String(n.getHours()).padStart(2,"0") + ":" +
        String(n.getMinutes()).padStart(2,"0") + ":" +
        String(n.getSeconds()).padStart(2,"0")
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* ── loading steps ── */
  useEffect(() => {
    let i = 0;
    const run = () => {
      if (i >= STEPS.length) return;
      const [val, ph, st] = STEPS[i];
      setPct(val);
      setTimeout(() => { setPhase(ph); setStatus(st); }, 250);
      if (i < STEPS.length - 1) {
        setTimeout(run, STEP_DELAYS[i]);
      } else {
        setReady(true);
        if (onDone) setTimeout(onDone, 900);
      }
      i++;
    };
    const t = setTimeout(run, 600);
    return () => clearTimeout(t);
  }, [onDone]);

  /* ── canvas particles + rings ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, raf;
    let particles = [];

    const resize = () => {
      const p = canvas.parentElement;
      W = canvas.width  = p ? p.offsetWidth  : 680;
      H = canvas.height = p ? p.offsetHeight : 700;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = () => {
      if (Math.random() < 0.5) {
        particles.push({
          x: Math.random() * W, y: H + 5,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -(0.3 + Math.random() * 0.8),
          size: 0.8 + Math.random() * 2,
          life: 1, decay: 0.004 + Math.random() * 0.006,
          color: Math.random() > 0.5 ? [200,150,30] : [180,40,20],
        });
      } else {
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: 0, vy: 0,
          size: 0.5 + Math.random() * 1.2,
          life: Math.random(), decay: 0.002 + Math.random() * 0.004,
          pulse: true,
          color: Math.random() > 0.5 ? [200,150,30] : [180,40,20],
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      if (Math.random() < 0.3) spawn();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p.pulse) { p.x += p.vx; p.y += p.vy; }
        else { p.life += (Math.random() - 0.5) * 0.05; }
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        const [r,g,b] = p.color;
        ctx.globalAlpha = Math.max(0, p.life * (p.pulse ? 0.5 : 0.8));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 0.03;
      ctx.strokeStyle = "rgba(200,150,30,.5)";
      ctx.lineWidth = 0.5;
      for (let r = 80; r < 600; r += 90) {
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
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
  }, []);

  const fmt = (n, len) => String(n).padStart(len, "0");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');

        @keyframes pl-orbit1      { to { transform: rotate(360deg); } }
        @keyframes pl-orbit2      { to { transform: rotate(-360deg); } }
        @keyframes pl-orbit3      { to { transform: rotate(360deg); } }
        @keyframes pl-floatY      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pl-logoReveal  { 0%{opacity:0;transform:scale(.7) rotate(-15deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }
        @keyframes pl-titleReveal { 0%{opacity:0;transform:translateY(20px);letter-spacing:.5em} 100%{opacity:1;transform:translateY(0);letter-spacing:.06em} }
        @keyframes pl-wave       { 0%,100%{transform:translateY(0)} 25%{transform:translateY(-6px)} 75%{transform:translateY(6px)} }
        @keyframes pl-fadeUp      { 0%{opacity:0;transform:translateY(10px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes pl-barGlow     { 0%,100%{opacity:.8} 50%{opacity:1} }
        @keyframes pl-shimmer     { 0%{left:-100%} 100%{left:150%} }
        @keyframes pl-dotPulse    { 0%,80%,100%{opacity:.2;transform:scale(.7)} 40%{opacity:1;transform:scale(1)} }
        @keyframes pl-scanline    { 0%{top:-4px} 100%{top:100%} }
        @keyframes pl-cornerPulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes pl-ringExpand  { 0%{transform:scale(1);opacity:.3} 100%{transform:scale(1.8);opacity:0} }
        @keyframes pl-statusBlink { 0%,100%{opacity:1} 50%{opacity:.5} }

        .pl-corner-tl { position:absolute;top:12px;left:12px;width:28px;height:28px;border-top:1.5px solid rgba(200,150,30,.7);border-left:1.5px solid rgba(200,150,30,.7);animation:pl-cornerPulse 2s ease-in-out infinite; }
        .pl-corner-tr { position:absolute;top:12px;right:12px;width:28px;height:28px;border-top:1.5px solid rgba(200,150,30,.7);border-right:1.5px solid rgba(200,150,30,.7);animation:pl-cornerPulse 2s ease-in-out infinite .5s; }
        .pl-corner-bl { position:absolute;bottom:12px;left:12px;width:28px;height:28px;border-bottom:1.5px solid rgba(180,40,20,.6);border-left:1.5px solid rgba(180,40,20,.6);animation:pl-cornerPulse 2s ease-in-out infinite 1s; }
        .pl-corner-br { position:absolute;bottom:12px;right:12px;width:28px;height:28px;border-bottom:1.5px solid rgba(180,40,20,.6);border-right:1.5px solid rgba(180,40,20,.6);animation:pl-cornerPulse 2s ease-in-out infinite 1.5s; }
      `}</style>

      <div style={{
        position:"fixed", inset:0, zIndex:9999,
        display:"flex", alignItems:"center", justifyContent:"center",
        background:"#060208",
        backgroundImage:`
          radial-gradient(ellipse 100% 80% at 0% 0%, #1a0505 0%, transparent 60%),
          radial-gradient(ellipse 80% 60% at 100% 100%, #0d0a00 0%, transparent 55%),
          radial-gradient(ellipse 60% 60% at 50% 50%, #0a0002 0%, transparent 75%),
          radial-gradient(ellipse 40% 40% at 80% 20%, #160804 0%, transparent 50%)`,
        fontFamily:"'Rajdhani',sans-serif",
        overflow:"hidden",
      }}>
        {/* Canvas layer */}
        <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", opacity:.5 }} />

        {/* Decorative layer */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
          {/* Grid */}
          <div style={{ position:"absolute", inset:0,
            backgroundImage:`repeating-linear-gradient(0deg,rgba(200,160,30,.018) 0,transparent 1px,transparent 36px),repeating-linear-gradient(90deg,rgba(200,160,30,.018) 0,transparent 1px,transparent 36px)` }}/>
          <div style={{ position:"absolute", inset:0,
            backgroundImage:`repeating-linear-gradient(0deg,rgba(180,40,20,.012) 0,transparent 1px,transparent 108px),repeating-linear-gradient(90deg,rgba(180,40,20,.012) 0,transparent 1px,transparent 108px)` }}/>

          {/* Edge lines */}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,rgba(200,150,30,.6) 50%,transparent)" }}/>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,rgba(180,40,20,.5) 50%,transparent)" }}/>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:2, background:"linear-gradient(180deg,transparent,rgba(200,150,30,.3),transparent)" }}/>
          <div style={{ position:"absolute", right:0, top:0, bottom:0, width:2, background:"linear-gradient(180deg,transparent,rgba(180,40,20,.3),transparent)" }}/>

          {/* Corners */}
          <div className="pl-corner-tl"/>
          <div className="pl-corner-tr"/>
          <div className="pl-corner-bl"/>
          <div className="pl-corner-br"/>

          {/* HUD labels */}
          <div style={{ position:"absolute", top:14, left:48, fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"rgba(200,150,30,.3)", letterSpacing:".12em" }}>SYS::PHILTECH_GMA</div>
          <div style={{ position:"absolute", top:14, right:52, fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"rgba(200,150,30,.25)", letterSpacing:".12em" }}>VER 2025.1</div>
          <div style={{ position:"absolute", bottom:14, left:48, fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"rgba(180,40,20,.25)", letterSpacing:".12em" }}>NODE::ARENA_01</div>
          <div style={{ position:"absolute", bottom:14, right:48, fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"rgba(200,150,30,.3)", letterSpacing:".12em" }}>{sysTime}</div>

          {/* Scanline */}
          <div style={{ position:"absolute", left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,rgba(200,150,30,.12) 50%,transparent)", animation:"pl-scanline 4s linear infinite", top:0 }}/>
        </div>

        {/* Main content */}
        <div style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", padding:"48px 24px 44px" }}>

          {/* Logo */}
          <div style={{ position:"relative", width:160, height:160, marginBottom:"2rem", animation:"pl-logoReveal .9s cubic-bezier(.34,1.56,.64,1) .3s both" }}>

            {/* Outer star orbit */}
            <div style={{ position:"absolute", inset:-40, animation:"pl-orbit1 20s linear infinite" }}>
              <svg width="100%" height="100%" viewBox="0 0 240 240" style={{ position:"absolute", inset:0 }}>
                <polygon points="120,4 140,80 220,80 158,128 180,208 120,164 60,208 82,128 20,80 100,80" fill="none" stroke="rgba(200,150,30,.12)" strokeWidth="0.5"/>
              </svg>
              <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%) translateY(-6px)", width:10, height:10, borderRadius:"50%", background:"#c8960f", boxShadow:"0 0 12px 4px rgba(200,150,30,.5)" }}/>
              <div style={{ position:"absolute", bottom:30, right:15, width:6, height:6, borderRadius:"50%", background:"rgba(200,150,30,.4)", boxShadow:"0 0 8px 2px rgba(200,150,30,.3)" }}/>
            </div>

            {/* Inner dashed orbit */}
            <div style={{ position:"absolute", inset:-25, animation:"pl-orbit2 14s linear infinite" }}>
              <div style={{ position:"absolute", top:"50%", left:-5, transform:"translateY(-50%)", width:8, height:8, borderRadius:"50%", background:"#a02010", boxShadow:"0 0 10px 3px rgba(180,40,20,.6)" }}/>
              <div style={{ position:"absolute", bottom:-4, right:30, width:5, height:5, borderRadius:"50%", background:"rgba(180,40,20,.4)" }}/>
              <svg width="100%" height="100%" viewBox="0 0 210 210" style={{ position:"absolute", inset:0 }}>
                <circle cx="105" cy="105" r="100" fill="none" stroke="rgba(180,40,20,.15)" strokeWidth="0.5" strokeDasharray="4 8"/>
              </svg>
            </div>

            {/* Far slow orbit */}
            <div style={{ position:"absolute", inset:-55, animation:"pl-orbit3 35s linear infinite", opacity:.4 }}>
              <svg width="100%" height="100%" viewBox="0 0 270 270" style={{ position:"absolute", inset:0 }}>
                <circle cx="135" cy="135" r="130" fill="none" stroke="rgba(200,150,30,.2)" strokeWidth="0.5" strokeDasharray="1 12"/>
              </svg>
              <div style={{ position:"absolute", top:20, left:"50%", transform:"translateX(-50%)", width:4, height:4, borderRadius:"50%", background:"rgba(200,150,30,.6)" }}/>
            </div>

            {/* Pulse rings */}
            <div style={{ position:"absolute", inset:-10, borderRadius:"50%", border:"1px solid rgba(200,150,30,.35)", animation:"pl-ringExpand 2.5s ease-out infinite" }}/>
            <div style={{ position:"absolute", inset:-10, borderRadius:"50%", border:"1px solid rgba(180,40,20,.25)", animation:"pl-ringExpand 2.5s ease-out infinite 1.25s" }}/>

            {/* Logo only (no circle) */}
            <div style={{
              position:"relative", width:160, height:160,
              display:"flex", alignItems:"center", justifyContent:"center",
              animation:"pl-floatY 4s ease-in-out infinite",
            }}>
              <img src="/image/logo.png" alt="Philtech logo" style={{ width:"120px", height:"120px", objectFit:"contain" }} />
            </div>
          </div>

          {/* Title */}
          <div style={{ animation:"pl-titleReveal 1.1s cubic-bezier(.4,0,.2,1) .4s both", textAlign:"center", marginBottom:".4rem" }}>
            <div style={{
              fontFamily:"'Cinzel',serif", fontSize:"2.2rem", fontWeight:900, letterSpacing:".06em", lineHeight:1,
              background:"linear-gradient(180deg,#f5e8b0 0%,#c8900a 50%,#8b5e08 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              filter:"drop-shadow(0 2px 8px rgba(200,150,30,.3))",
              display:"inline-block",
              animation:"pl-wave 2s ease-in-out infinite",
            }}>PHILTECH GMA</div>
          </div>

          {/* Progress bar */}
          <div style={{ width:340, animation:"pl-fadeUp .8s ease 1.1s both" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background: ready ? "#22cc44" : "#c8960f", boxShadow: ready ? "0 0 6px rgba(30,200,60,.8)" : "0 0 6px rgba(200,150,30,.8)", animation:"pl-statusBlink 1.5s ease-in-out infinite" }}/>
                <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:".62rem", color:"rgba(200,150,30,.5)", letterSpacing:".1em" }}>{status}</span>
              </div>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:".9rem", fontWeight:700, color:"#c8960f", letterSpacing:".05em" }}>{pct}%</span>
            </div>

            <div style={{ position:"relative", width:"100%", height:6, background:"rgba(255,255,255,.04)", borderRadius:99, overflow:"hidden", border:"0.5px solid rgba(200,150,30,.1)" }}>
              <div style={{
                height:"100%", borderRadius:99,
                background:"linear-gradient(90deg,#5a0a0a,#a01515,#c8900a,#f0d030,#c8900a,#a01515)",
                backgroundSize:"400% auto",
                width:`${pct}%`,
                transition:"width .75s cubic-bezier(.4,0,.2,1)",
                position:"relative", overflow:"hidden",
                animation:"pl-barGlow 2s ease-in-out infinite",
              }}>
                <div style={{ position:"absolute", top:0, height:"100%", width:"60%", background:"linear-gradient(90deg,transparent,rgba(255,240,150,.6),transparent)", animation:"pl-shimmer 1.8s ease-in-out infinite" }}/>
              </div>
            </div>
          </div>

          {/* Dots */}
          <div style={{ display:"flex", gap:10, marginTop:14, animation:"pl-fadeUp .8s ease 1.2s both" }}>
            {[0, 0.25, 0.5].map((d,i) => (
              <div key={i} style={{ width:5, height:5, borderRadius:"50%", background:"#c8900a", animation:`pl-dotPulse 1.5s ease-in-out ${d}s infinite` }}/>
            ))}
          </div>

          {/* Phase text */}
          <div style={{ marginTop:12, animation:"pl-fadeUp .8s ease 1.3s both", textAlign:"center" }}>
            <p style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:".65rem", color:"rgba(200,160,70,.4)", letterSpacing:".12em", transition:"all .4s ease" }}>{phase}</p>
          </div>
        </div>
      </div>
    </>
  );
}