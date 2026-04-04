import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getLectures, generateQuiz, saveQuiz } from "../services/api";

/* ─── Keyframes & global styles ──────────────────────────────────────────── */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes gq-fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes gq-fadeIn   { from { opacity:0; } to { opacity:1; } }
    @keyframes gq-slideDown{ from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes gq-spin     { to { transform: rotate(360deg); } }
    @keyframes gq-shimmer  {
      0%   { background-position: -600px 0; }
      100% { background-position:  600px 0; }
    }
    @keyframes gq-pulse {
      0%,100% { opacity:.5; transform:scale(1); }
      50%      { opacity:1;  transform:scale(1.05); }
    }
    @keyframes gq-orb {
      0%,100% { transform:translate(0,0) scale(1); }
      33%      { transform:translate(30px,-20px) scale(1.1); }
      66%      { transform:translate(-20px,15px) scale(.95); }
    }
    @keyframes gq-orb2 {
      0%,100% { transform:translate(0,0) scale(1); }
      33%      { transform:translate(-25px,20px) scale(1.08); }
      66%      { transform:translate(20px,-15px) scale(.92); }
    }
    @keyframes gq-bar {
      from { width:0; }
      to   { width:var(--target-w,100%); }
    }
    @keyframes gq-checkPop {
      0%  { transform:scale(0) rotate(-20deg); opacity:0; }
      60% { transform:scale(1.2) rotate(5deg);  opacity:1; }
      100%{ transform:scale(1)   rotate(0deg);  opacity:1; }
    }
    @keyframes gq-confetti {
      0%   { transform:translateY(0) rotate(0deg); opacity:1; }
      100% { transform:translateY(60px) rotate(720deg); opacity:0; }
    }
    @keyframes gq-stepPing {
      0%  { transform:scale(1);   opacity:1; }
      70% { transform:scale(1.8); opacity:0; }
      100%{ transform:scale(1);   opacity:0; }
    }
    @keyframes gq-typein {
      from { opacity:0; transform:translateX(-4px); }
      to   { opacity:1; transform:translateX(0); }
    }
    @keyframes gq-successRing {
      0%   { transform:scale(.8); opacity:0; }
      50%  { transform:scale(1.15); opacity:.8; }
      100% { transform:scale(1);  opacity:1; }
    }
    @keyframes gq-float {
      0%,100% { transform:translateY(0); }
      50%      { transform:translateY(-6px); }
    }

    .gq-root {
      min-height: 100vh;
      background: #050810;
      background-image:
        radial-gradient(ellipse 70% 55% at 15% -5%, rgba(99,102,241,.18) 0%, transparent 65%),
        radial-gradient(ellipse 55% 45% at 85% 105%, rgba(16,185,129,.12) 0%, transparent 65%);
      font-family: 'Outfit', sans-serif;
      color: #e2e8f0;
      position: relative;
      overflow-x: hidden;
    }

    /* ambient orbs */
    .gq-orb {
      position: fixed; pointer-events: none; border-radius: 50%;
      filter: blur(80px);
    }
    .gq-orb-1 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(99,102,241,.2), transparent 70%);
      top: -150px; left: -100px;
      animation: gq-orb 14s ease-in-out infinite;
    }
    .gq-orb-2 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(16,185,129,.15), transparent 70%);
      bottom: -100px; right: -80px;
      animation: gq-orb2 16s ease-in-out infinite;
    }

    /* topbar */
    .gq-topbar {
      position: sticky; top: 0; z-index: 40;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 2rem; height: 58px;
      background: rgba(5,8,16,.85); backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255,255,255,.06);
      animation: gq-slideDown .4s ease both;
    }
    .gq-back {
      display: flex; align-items: center; gap: .5rem;
      padding: .4rem .9rem; border-radius: 8px;
      border: 1px solid rgba(255,255,255,.1);
      background: rgba(255,255,255,.04);
      color: rgba(255,255,255,.5);
      font-family: 'Outfit', sans-serif; font-size: .8rem;
      cursor: pointer; transition: all .15s;
    }
    .gq-back:hover { background: rgba(255,255,255,.09); color: #fff; }
    .gq-back svg { width:14px; height:14px; }
    .gq-topbar-title {
      font-size: .95rem; font-weight: 700; color: #fff; letter-spacing: -.01em;
    }
    .gq-topbar-chip {
      font-family: 'JetBrains Mono', monospace;
      font-size: .65rem; padding: .2rem .65rem;
      border-radius: 999px;
      background: rgba(99,102,241,.15); border: 1px solid rgba(99,102,241,.35);
      color: #a5b4fc;
    }

    /* main body */
    .gq-body {
      position: relative; z-index: 1;
      max-width: 780px; margin: 0 auto;
      padding: 2.5rem 1.5rem 4rem;
      animation: gq-fadeUp .5s ease both;
    }
    .gq-hero { margin-bottom: 2.5rem; }
    .gq-hero-tag {
      display: inline-flex; align-items: center; gap: .4rem;
      font-size: .72rem; letter-spacing: .12em; text-transform: uppercase;
      color: rgba(165,180,252,.6); margin-bottom: .7rem;
    }
    .gq-hero-tag span { width:6px; height:6px; border-radius:50%; background:#6366f1; }
    .gq-hero h1 {
      font-size: 2.1rem; font-weight: 800; letter-spacing: -.04em;
      color: #fff; line-height: 1.15; margin-bottom: .5rem;
    }
    .gq-hero p { font-size: .88rem; color: rgba(255,255,255,.35); font-weight: 300; }

    /* card */
    .gq-card {
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 20px;
      padding: 2rem 2.2rem;
      margin-bottom: 1.2rem;
      position: relative; overflow: hidden;
    }
    .gq-card::before {
      content:''; position:absolute; top:0; left:0; right:0; height:1px;
      background: linear-gradient(90deg, transparent, rgba(99,102,241,.4), transparent);
    }

    .gq-label {
      display: block; font-size: .72rem; letter-spacing: .1em; text-transform: uppercase;
      color: rgba(165,180,252,.55); margin-bottom: .55rem; font-weight: 600;
    }

    .gq-select, .gq-input {
      width: 100%;
      padding: .75rem 1rem;
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 10px;
      color: #fff;
      font-family: 'Outfit', sans-serif; font-size: .9rem;
      outline: none; transition: border-color .2s, box-shadow .2s;
      margin-bottom: 1.25rem;
    }
    .gq-select option { background: #0d1117; }
    .gq-select:focus, .gq-input:focus {
      border-color: rgba(99,102,241,.5);
      box-shadow: 0 0 0 3px rgba(99,102,241,.12);
    }
    .gq-input::placeholder { color: rgba(255,255,255,.2); }

    /* count row */
    .gq-count-row {
      display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem;
    }
    .gq-count-label { font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; color: rgba(165,180,252,.55); font-weight:600; white-space:nowrap; }
    .gq-count-track {
      flex: 1; position: relative;
      height: 6px; background: rgba(255,255,255,.08); border-radius: 3px; cursor: pointer;
    }
    .gq-count-fill {
      position:absolute; left:0; top:0; bottom:0; border-radius:3px;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      transition: width .2s;
    }
    .gq-count-thumb {
      position:absolute; top:50%; transform:translate(-50%,-50%);
      width:16px; height:16px; border-radius:50%;
      background:#fff; border:2px solid #6366f1;
      box-shadow: 0 2px 8px rgba(99,102,241,.4);
      cursor:pointer; transition: left .2s;
    }
    .gq-count-val {
      font-family:'JetBrains Mono',monospace; font-size:.88rem;
      color:#a5b4fc; min-width:28px; text-align:center; font-weight:500;
    }

    /* generate button */
    .gq-btn-gen {
      width: 100%; padding: .9rem;
      border: none; border-radius: 12px; cursor: pointer;
      font-family: 'Outfit', sans-serif; font-size: .95rem; font-weight: 700;
      letter-spacing: .02em;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      box-shadow: 0 4px 20px rgba(99,102,241,.4);
      transition: transform .15s, box-shadow .2s, opacity .15s;
      position: relative; overflow: hidden;
    }
    .gq-btn-gen::before {
      content:''; position:absolute; inset:0;
      background: linear-gradient(135deg, rgba(255,255,255,.15), transparent);
      opacity:0; transition: opacity .2s;
    }
    .gq-btn-gen:hover:not(:disabled)::before { opacity:1; }
    .gq-btn-gen:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 28px rgba(99,102,241,.5); }
    .gq-btn-gen:active:not(:disabled) { transform:translateY(0); }
    .gq-btn-gen:disabled { opacity:.45; cursor:not-allowed; }

    /* ── LOADING OVERLAY ──────────────────────────────────────────────────── */
    .gq-loading-overlay {
      position: fixed; inset: 0; z-index: 50;
      background: rgba(5,8,16,.96);
      backdrop-filter: blur(20px);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 2.5rem;
      animation: gq-fadeIn .3s ease both;
    }

    .gq-loading-orb-wrap {
      position:relative; width:120px; height:120px;
    }
    .gq-loading-orb-ring {
      position:absolute; inset:0; border-radius:50%;
      border:2px solid transparent;
      border-top-color: rgba(99,102,241,.6);
      border-right-color: rgba(139,92,246,.4);
      animation: gq-spin 1.2s linear infinite;
    }
    .gq-loading-orb-ring-2 {
      inset:10px;
      border-top-color: rgba(16,185,129,.5);
      border-bottom-color: rgba(16,185,129,.3);
      animation: gq-spin 1.8s linear infinite reverse;
    }
    .gq-loading-orb-core {
      position:absolute; inset:20px; border-radius:50%;
      background: radial-gradient(circle at 40% 40%, rgba(99,102,241,.6), rgba(139,92,246,.4));
      animation: gq-pulse 2s ease-in-out infinite;
      display:flex; align-items:center; justify-content:center;
    }
    .gq-loading-orb-core svg { width:32px; height:32px; color:#a5b4fc; }

    .gq-loading-text { text-align:center; }
    .gq-loading-title {
      font-size:1.3rem; font-weight:800; color:#fff;
      letter-spacing:-.02em; margin-bottom:.5rem;
    }
    .gq-loading-sub {
      font-size:.84rem; color:rgba(255,255,255,.35); font-weight:300;
    }

    /* Step list */
    .gq-steps { display:flex; flex-direction:column; gap:.6rem; width:340px; }
    .gq-step {
      display:flex; align-items:center; gap:.85rem;
      padding:.75rem 1rem;
      border-radius:12px;
      border:1px solid rgba(255,255,255,.06);
      background:rgba(255,255,255,.02);
      transition:all .3s;
    }
    .gq-step.active {
      background:rgba(99,102,241,.1);
      border-color:rgba(99,102,241,.3);
    }
    .gq-step.done {
      background:rgba(16,185,129,.08);
      border-color:rgba(16,185,129,.25);
    }
    .gq-step-dot {
      width:28px; height:28px; border-radius:50%; flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
      position:relative;
    }
    .gq-step-dot-inner {
      width:10px; height:10px; border-radius:50%;
      background:rgba(255,255,255,.15);
      transition:all .3s;
    }
    .gq-step.active .gq-step-dot-inner {
      background:#6366f1;
      box-shadow:0 0 0 3px rgba(99,102,241,.25);
    }
    .gq-step.active .gq-step-dot::after {
      content:''; position:absolute; inset:0; border-radius:50%;
      border:2px solid rgba(99,102,241,.5);
      animation:gq-stepPing 1.4s ease infinite;
    }
    .gq-step.done .gq-step-dot-inner { background:#10b981; }
    .gq-step-label {
      font-size:.84rem; font-weight:600;
      color:rgba(255,255,255,.3); transition:color .3s;
    }
    .gq-step.active .gq-step-label { color:rgba(165,180,252,.9); }
    .gq-step.done  .gq-step-label { color:rgba(52,211,153,.8); }
    .gq-step-check { margin-left:auto; color:#10b981; animation:gq-checkPop .4s ease; }
    .gq-step-check svg { width:16px; height:16px; }

    /* progress bar */
    .gq-progress-wrap {
      width:340px; height:4px;
      background:rgba(255,255,255,.08); border-radius:2px; overflow:hidden;
    }
    .gq-progress-fill {
      height:100%; border-radius:2px;
      background: linear-gradient(90deg, #6366f1, #8b5cf6, #10b981);
      background-size:200% 100%;
      transition:width .5s cubic-bezier(.22,1,.36,1);
      animation: gq-shimmer 2s linear infinite;
    }

    /* ── QUESTIONS PREVIEW ────────────────────────────────────────────────── */
    .gq-questions-wrap {
      animation: gq-fadeUp .5s ease both;
    }
    .gq-q-header {
      display:flex; align-items:center; justify-content:space-between;
      margin-bottom:1.2rem;
    }
    .gq-q-title { font-size:1rem; font-weight:800; color:#fff; letter-spacing:-.02em; }
    .gq-q-count {
      font-family:'JetBrains Mono',monospace; font-size:.72rem;
      padding:.2rem .6rem; border-radius:6px;
      background:rgba(99,102,241,.12); color:#a5b4fc;
      border:1px solid rgba(99,102,241,.2);
    }

    .gq-q-card {
      background:rgba(255,255,255,.035);
      border:1px solid rgba(255,255,255,.07);
      border-radius:14px; padding:1.3rem 1.5rem;
      margin-bottom:.85rem;
      animation: gq-typein .3s ease both;
    }
    .gq-q-num {
      display:inline-flex; align-items:center; justify-content:center;
      width:24px; height:24px; border-radius:7px;
      background:rgba(99,102,241,.15); color:#a5b4fc;
      font-size:.7rem; font-weight:800;
      margin-bottom:.75rem;
    }
    .gq-q-text-input {
      width:100%; padding:.6rem .85rem;
      background:rgba(255,255,255,.055);
      border:1px solid rgba(255,255,255,.09);
      border-radius:9px; color:#fff;
      font-family:'Outfit',sans-serif; font-size:.88rem;
      outline:none; margin-bottom:.85rem;
      transition:border-color .2s;
    }
    .gq-q-text-input:focus { border-color:rgba(99,102,241,.45); }
    .gq-q-options {
      display:grid; grid-template-columns:1fr 1fr; gap:.5rem;
      margin-bottom:.85rem;
    }
    .gq-q-opt-input {
      padding:.5rem .75rem;
      background:rgba(255,255,255,.04);
      border:1px solid rgba(255,255,255,.08);
      border-radius:8px; color:#fff;
      font-family:'Outfit',sans-serif; font-size:.8rem;
      outline:none; width:100%;
      transition:border-color .2s;
    }
    .gq-q-opt-input:focus { border-color:rgba(99,102,241,.4); }
    .gq-q-answer-row {
      display:flex; align-items:center; gap:.65rem;
    }
    .gq-answer-label {
      font-size:.7rem; letter-spacing:.1em; text-transform:uppercase;
      color:rgba(165,180,252,.4); font-weight:600;
    }
    .gq-answer-select {
      padding:.3rem .65rem; border-radius:7px;
      background:rgba(16,185,129,.1); border:1px solid rgba(16,185,129,.25);
      color:#34d399; font-family:'Outfit',sans-serif; font-size:.82rem;
      outline:none; cursor:pointer;
    }

    /* save button */
    .gq-save-row {
      display:flex; align-items:center; gap:1rem; margin-top:1.5rem;
    }
    .gq-btn-save {
      flex:1; padding:.85rem;
      border:none; border-radius:12px; cursor:pointer;
      font-family:'Outfit',sans-serif; font-size:.92rem; font-weight:700;
      background:linear-gradient(135deg,#10b981,#059669);
      color:#fff;
      box-shadow:0 4px 20px rgba(16,185,129,.35);
      transition:transform .15s, box-shadow .2s, opacity .15s;
    }
    .gq-btn-save:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(16,185,129,.45); }
    .gq-btn-save:disabled { opacity:.45; cursor:not-allowed; }
    .gq-btn-discard {
      padding:.85rem 1.4rem; border-radius:12px;
      border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.04);
      color:rgba(255,255,255,.4); font-family:'Outfit',sans-serif;
      font-size:.88rem; cursor:pointer; transition:all .15s;
    }
    .gq-btn-discard:hover { background:rgba(255,255,255,.08); color:rgba(255,255,255,.7); }

    /* ── SUCCESS OVERLAY ──────────────────────────────────────────────────── */
    .gq-success-overlay {
      position:fixed; inset:0; z-index:60;
      display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:1.5rem;
      background:rgba(5,8,16,.95); backdrop-filter:blur(20px);
      animation:gq-fadeIn .3s ease both;
    }
    .gq-success-ring {
      width:100px; height:100px; border-radius:50%;
      background:linear-gradient(135deg,rgba(16,185,129,.25),rgba(6,78,59,.3));
      border:2px solid rgba(16,185,129,.5);
      display:flex; align-items:center; justify-content:center;
      animation:gq-successRing .6s cubic-bezier(.34,1.56,.64,1) both;
      box-shadow:0 0 40px rgba(16,185,129,.3);
    }
    .gq-success-ring svg { width:44px; height:44px; color:#34d399; animation:gq-checkPop .5s .3s both; }
    .gq-success-text { text-align:center; }
    .gq-success-title { font-size:1.5rem; font-weight:800; color:#fff; letter-spacing:-.02em; margin-bottom:.4rem; }
    .gq-success-sub { font-size:.84rem; color:rgba(255,255,255,.35); }
    .gq-confetti-row {
      display:flex; gap:.6rem; align-items:center;
      animation:gq-float 3s ease-in-out infinite;
    }
    .gq-conf { width:8px; height:8px; border-radius:2px; }

    /* error */
    .gq-error {
      display:flex; align-items:center; gap:.6rem;
      padding:.75rem 1rem; border-radius:10px;
      background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.2);
      color:#f87171; font-size:.82rem; margin-bottom:1rem;
      animation:gq-fadeIn .2s ease both;
    }
    .gq-error svg { width:15px; height:15px; flex-shrink:0; }

    @media(max-width:640px){
      .gq-hero h1 { font-size:1.6rem; }
      .gq-q-options { grid-template-columns:1fr; }
      .gq-steps { width:calc(100vw - 4rem); }
      .gq-progress-wrap { width:calc(100vw - 4rem); }
    }
  `}</style>
);

/* ── Icons ── */
const Ico = {
  Back: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 16l-6-6 6-6"/></svg>,
  Brain: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08A3 3 0 0 1 2 13c0-1.05.54-1.97 1.36-2.5A2.5 2.5 0 0 1 6 7.5a2.5 2.5 0 0 1 3.5-5Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08A3 3 0 0 0 22 13c0-1.05-.54-1.97-1.36-2.5A2.5 2.5 0 0 0 18 7.5a2.5 2.5 0 0 0-3.5-5Z"/>
    </svg>
  ),
  Check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  ),
  Alert: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10" cy="10" r="8"/><line x1="10" y1="6" x2="10" y2="10"/><circle cx="10" cy="13" r=".5" fill="currentColor"/></svg>,
};

const STEPS = [
  { id: 1, label: "Analyzing lecture content…" },
  { id: 2, label: "Crafting intelligent questions…" },
  { id: 3, label: "Validating & formatting…" },
];

export default function GenerateQuiz() {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const stepTimers = useRef([]);

  useEffect(() => {
    getLectures()
      .then(setLectures)
      .catch(() => setError("Failed to load lectures."));
  }, []);

  // Clean up timers
  useEffect(() => () => stepTimers.current.forEach(clearTimeout), []);

  const runFakeProgress = () => {
    // Step 1 at ~15%
    stepTimers.current.push(setTimeout(() => { setActiveStep(1); setProgressPct(15); }, 300));
    // Step 2 at ~55%
    stepTimers.current.push(setTimeout(() => { setActiveStep(2); setProgressPct(55); }, 1800));
    // Step 3 at ~80%
    stepTimers.current.push(setTimeout(() => { setActiveStep(3); setProgressPct(80); }, 3200));
  };

  const handleGenerate = async () => {
    if (!selectedLecture) { setError("Please select a lecture."); return; }
    setError("");
    setGenerating(true);
    setActiveStep(0);
    setProgressPct(0);

    runFakeProgress();

    try {
      const data = await generateQuiz(selectedLecture, "multiple-choice", questionCount);
      setProgressPct(100);
      setActiveStep(4);
      await new Promise(r => setTimeout(r, 600));
      setQuestions(data.questions);
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
    else if (field.startsWith("opt")) {
      const oi = parseInt(field.replace("opt", ""));
      const opts = [...updated[idx].options];
      opts[oi] = value;
      updated[idx].options = opts;
    }
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!quizTitle.trim()) { setError("Please enter a quiz title."); return; }
    if (!questions.length) { setError("No questions to save."); return; }
    setSaving(true);
    setError("");
    try {
      await saveQuiz(selectedLecture, quizTitle, questions);
      setSaved(true);
      setTimeout(() => navigate("/teacher"), 2200);
    } catch (err) {
      setError("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const lectureTitle = lectures.find(l => String(l.id) === String(selectedLecture))?.title || "";
  const sliderPct = ((questionCount - 1) / 19) * 100;

  return (
    <>
      <Styles />

      {/* ambient orbs */}
      <div className="gq-orb gq-orb-1" />
      <div className="gq-orb gq-orb-2" />

      {/* ── Loading overlay ── */}
      {generating && (
        <div className="gq-loading-overlay">
          <div className="gq-loading-orb-wrap">
            <div className="gq-loading-orb-ring" />
            <div className="gq-loading-orb-ring gq-loading-orb-ring-2" />
            <div className="gq-loading-orb-core">{Ico.Brain}</div>
          </div>

          <div className="gq-loading-text">
            <div className="gq-loading-title">Generating your quiz</div>
            <div className="gq-loading-sub">AI is reading: <em style={{color:"rgba(165,180,252,.7)"}}>{lectureTitle || "your lecture"}</em></div>
          </div>

          <div className="gq-steps">
            {STEPS.map((s, i) => {
              const idx = i + 1;
              const isDone = activeStep > idx;
              const isActive = activeStep === idx;
              return (
                <div key={s.id} className={`gq-step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
                  <div className="gq-step-dot">
                    <div className="gq-step-dot-inner" />
                  </div>
                  <span className="gq-step-label">{s.label}</span>
                  {isDone && (
                    <span className="gq-step-check">{Ico.Check}</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="gq-progress-wrap">
            <div className="gq-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".72rem", color:"rgba(165,180,252,.45)" }}>
            {progressPct}% complete
          </div>
        </div>
      )}

      {/* ── Success overlay ── */}
      {saved && (
        <div className="gq-success-overlay">
          <div className="gq-confetti-row">
            {["#6366f1","#10b981","#f59e0b","#ec4899","#06b6d4"].map((c,i) => (
              <div key={i} className="gq-conf" style={{background:c, animationDelay:`${i*0.1}s`}} />
            ))}
          </div>
          <div className="gq-success-ring">{Ico.Check}</div>
          <div className="gq-success-text">
            <div className="gq-success-title">Quiz Saved! 🎉</div>
            <div className="gq-success-sub">Redirecting you to the dashboard…</div>
          </div>
        </div>
      )}

      <div className="gq-root">
        {/* Topbar */}
        <header className="gq-topbar">
          <button className="gq-back" onClick={() => navigate("/teacher")}>
            {Ico.Back} Back
          </button>
          <span className="gq-topbar-title">Quiz Generator</span>
          <span className="gq-topbar-chip">AI POWERED</span>
        </header>

        <div className="gq-body">
          {/* Hero */}
          {!questions.length && (
            <div className="gq-hero">
              <div className="gq-hero-tag"><span /> AI Quiz Generation</div>
              <h1>Create a Quiz<br/>in Seconds</h1>
              <p>Pick a lecture, set your question count, and let the AI do the heavy lifting.</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="gq-error">
              {Ico.Alert} {error}
            </div>
          )}

          {/* ── Configuration card ── */}
          {!questions.length && (
            <div className="gq-card">
              <label className="gq-label">Select Lecture</label>
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

              <label className="gq-label">Quiz Title</label>
              <input
                className="gq-input"
                type="text"
                placeholder="e.g., Chapter 3 Review"
                value={quizTitle}
                onChange={e => setQuizTitle(e.target.value)}
              />

              <div className="gq-count-row">
                <span className="gq-count-label">Questions</span>
                <div
                  className="gq-count-track"
                  onClick={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    setQuestionCount(Math.round(1 + pct * 19));
                  }}
                >
                  <div className="gq-count-fill" style={{ width: `${sliderPct}%` }} />
                  <div className="gq-count-thumb" style={{ left: `${sliderPct}%` }} />
                </div>
                <span className="gq-count-val">{questionCount}</span>
              </div>

              <button
                className="gq-btn-gen"
                onClick={handleGenerate}
                disabled={!selectedLecture || generating}
              >
                ✦ Generate Quiz with AI
              </button>
            </div>
          )}

          {/* ── Questions preview & edit ── */}
          {questions.length > 0 && (
            <div className="gq-questions-wrap">
              <div className="gq-q-header">
                <h2 className="gq-q-title">Review & Edit</h2>
                <span className="gq-q-count">{questions.length} questions</span>
              </div>

              {/* Title field */}
              <div className="gq-card" style={{marginBottom:"1rem"}}>
                <label className="gq-label">Quiz Title</label>
                <input
                  className="gq-input"
                  type="text"
                  placeholder="Name your quiz"
                  value={quizTitle}
                  onChange={e => setQuizTitle(e.target.value)}
                  style={{marginBottom:0}}
                />
              </div>

              {questions.map((q, idx) => (
                <div key={idx} className="gq-q-card" style={{ animationDelay: `${idx * 0.04}s` }}>
                  <div className="gq-q-num">{idx + 1}</div>

                  <input
                    className="gq-q-text-input"
                    value={q.question}
                    onChange={e => updateQ(idx, "question", e.target.value)}
                    placeholder="Question text"
                  />

                  <div className="gq-q-options">
                    {["A","B","C","D"].map((letter, oi) => (
                      <input
                        key={letter}
                        className="gq-q-opt-input"
                        value={q.options[oi] || ""}
                        onChange={e => updateQ(idx, `opt${oi}`, e.target.value)}
                        placeholder={`Option ${letter}`}
                      />
                    ))}
                  </div>

                  <div className="gq-q-answer-row">
                    <span className="gq-answer-label">Correct answer</span>
                    <select
                      className="gq-answer-select"
                      value={q.correct_answer}
                      onChange={e => updateQ(idx, "correct_answer", e.target.value)}
                    >
                      {["A","B","C","D"].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
              ))}

              <div className="gq-save-row">
                <button
                  className="gq-btn-discard"
                  onClick={() => { setQuestions([]); setError(""); }}
                >
                  Discard
                </button>
                <button
                  className="gq-btn-save"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "✓ Save Quiz to Dashboard"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}