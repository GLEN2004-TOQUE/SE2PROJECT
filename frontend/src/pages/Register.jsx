import { useState } from "react";
import { Link } from "react-router-dom";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const COURSES = {
  college: ["BSCS", "BSOA", "BTVTED"],
  seniorhigh: ["HE", "HUMSS", "GAS", "ICT", "ABM"],
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes floatUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(0.92); opacity: .6; }
      50%  { transform: scale(1.04); opacity: .15; }
      100% { transform: scale(0.92); opacity: .6; }
    }
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%,60% { transform: translateX(-6px); }
      40%,80% { transform: translateX(6px); }
    }
    @keyframes otp-pop {
      0%   { transform: scale(.8); opacity: 0; }
      70%  { transform: scale(1.05); }
      100% { transform: scale(1); opacity: 1; }
    }

    .reg-root {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 2rem 1rem;
      background-color: #1a0a0a;
      background-image:
        radial-gradient(ellipse 70% 55% at 90% 10%,  rgba(120,20,20,.5)  0%, transparent 70%),
        radial-gradient(ellipse 55% 45% at 5%  90%,  rgba(180,130,20,.22) 0%, transparent 65%),
        radial-gradient(ellipse 40% 40% at 50% 50%,  rgba(80,10,10,.4)    0%, transparent 80%);
      font-family: 'DM Sans', sans-serif;
      position: relative; overflow: hidden;
    }
    .reg-root::before {
      content: ''; position: fixed; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.06'/%3E%3C/svg%3E");
      pointer-events: none; z-index: 0; opacity: .45;
    }
    .deco-ring {
      position: fixed; width: 560px; height: 560px; border-radius: 50%;
      border: 1px solid rgba(200,160,40,.12);
      top: -180px; left: -180px;
      animation: pulse-ring 7s ease-in-out infinite; pointer-events: none;
    }
    .deco-ring-2 {
      width: 380px; height: 380px; bottom: -130px; right: -130px; top: auto; left: auto;
      animation-delay: -3.5s;
    }

    .card-wrap {
      position: relative; z-index: 1;
      width: 100%; max-width: 460px;
      animation: floatUp .65s cubic-bezier(.22,1,.36,1) both;
    }
    .card {
      background: rgba(255,255,255,.045);
      backdrop-filter: blur(18px) saturate(1.4);
      border: 1px solid rgba(255,230,160,.1);
      border-radius: 20px;
      padding: 2rem 2.2rem 2.2rem;
      box-shadow: 0 2px 0 rgba(255,220,100,.06) inset, 0 32px 64px rgba(0,0,0,.55);
    }

    /* Step indicator */
    .step-indicator {
      display: flex; align-items: center; justify-content: center;
      gap: .5rem; margin-bottom: 1.8rem;
    }
    .step-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: rgba(200,160,50,.2); transition: all .3s;
    }
    .step-dot.active { background: #c9a227; width: 24px; border-radius: 4px; }
    .step-dot.done   { background: rgba(200,160,50,.5); }

    .step-label {
      text-align: center; font-size: .72rem; letter-spacing: .1em;
      text-transform: uppercase; color: rgba(200,160,60,.5);
      margin-bottom: 1.4rem;
    }
    .headline {
      font-family: 'Playfair Display', serif; font-size: 1.65rem; font-weight: 700;
      color: #f5e6c8; text-align: center; line-height: 1.25;
      margin-bottom: .35rem;
    }
    .subline {
      text-align: center; font-size: .82rem; font-weight: 300;
      color: rgba(200,170,100,.65); margin-bottom: 1.6rem;
    }

    .field { margin-bottom: 1.1rem; }
    .field label {
      display: block; font-size: .72rem; font-weight: 500;
      letter-spacing: .1em; text-transform: uppercase;
      color: rgba(220,190,110,.75); margin-bottom: .45rem;
    }
    .input-wrap { position: relative; }
    .input-icon {
      position: absolute; left: .95rem; top: 50%; transform: translateY(-50%);
      color: rgba(200,160,60,.5); pointer-events: none; width: 16px; height: 16px;
    }
    .field input, .field select {
      width: 100%; padding: .72rem .95rem .72rem 2.6rem;
      background: rgba(255,255,255,.055);
      border: 1px solid rgba(200,160,50,.2); border-radius: 10px;
      color: #f5e6c8; font-family: 'DM Sans', sans-serif;
      font-size: .9rem; font-weight: 300; outline: none;
      transition: border-color .2s, box-shadow .2s, background .2s;
      appearance: none;
    }
    .field select { cursor: pointer; }
    .field select option { background: #2a0f0f; color: #f5e6c8; }
    .field input::placeholder { color: rgba(200,170,100,.28); }
    .field input:focus, .field select:focus {
      border-color: rgba(200,160,50,.55);
      background: rgba(255,255,255,.085);
      box-shadow: 0 0 0 3px rgba(190,140,30,.13);
    }
    .field input:-webkit-autofill, .field input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0 1000px #2a0f0f inset;
      -webkit-text-fill-color: #f5e6c8; caret-color: #f5e6c8;
    }
    .select-arrow {
      position: absolute; right: .9rem; top: 50%; transform: translateY(-50%);
      color: rgba(200,160,60,.5); pointer-events: none;
    }
    .toggle-password {
      position: absolute; right: .95rem; top: 50%; transform: translateY(-50%);
      background: none; border: none; padding: 0; cursor: pointer;
      color: rgba(200,160,60,.5); display: flex; align-items: center;
      transition: color .2s;
    }
    .toggle-password:hover { color: rgba(200,160,60,.9); }
    .toggle-password svg { width: 18px; height: 18px; }
    .field input[type="password"], .field input[type="text"].has-toggle {
      padding-right: 2.8rem;
    }

    /* OTP input */
    .otp-wrap {
      display: flex; gap: .6rem; justify-content: center; margin: 1.4rem 0;
    }
    .otp-input {
      width: 48px; height: 56px;
      background: rgba(255,255,255,.07);
      border: 1px solid rgba(200,160,50,.3); border-radius: 10px;
      color: #f5e6c8; font-family: 'DM Sans', sans-serif;
      font-size: 1.4rem; font-weight: 700; text-align: center;
      outline: none; transition: all .2s;
      animation: otp-pop .4s ease both;
    }
    .otp-input:focus {
      border-color: #c9a227; background: rgba(255,255,255,.12);
      box-shadow: 0 0 0 3px rgba(190,140,30,.18);
    }
    .otp-input.filled { border-color: rgba(200,160,50,.6); }
    .otp-input.shake  { animation: shake .4s ease; }

    .otp-email-hint {
      text-align: center; font-size: .8rem; color: rgba(200,170,100,.55);
      margin-bottom: .5rem; line-height: 1.5;
    }
    .otp-email-hint strong { color: rgba(200,170,100,.85); }
    .otp-timer {
      text-align: center; font-size: .75rem; color: rgba(200,160,50,.4);
      margin-top: .5rem;
    }
    .otp-resend {
      background: none; border: none; cursor: pointer;
      color: #c9a227; font-family: 'DM Sans', sans-serif;
      font-size: .78rem; font-weight: 500;
      text-decoration: underline; padding: 0;
      transition: color .15s;
    }
    .otp-resend:hover { color: #e8c060; }
    .otp-resend:disabled { color: rgba(200,160,50,.3); cursor: not-allowed; text-decoration: none; }

    .btn-submit {
      width: 100%; margin-top: .4rem; padding: .82rem 1rem;
      border: none; border-radius: 10px; cursor: pointer;
      font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 500;
      letter-spacing: .04em; color: #fff8e8; overflow: hidden;
      transition: transform .15s, box-shadow .2s, opacity .2s;
      background: linear-gradient(135deg, #8b1a1a 0%, #6b1010 50%, #8b1a1a 100%);
      background-size: 200% auto;
      box-shadow: 0 4px 20px rgba(120,20,20,.55), 0 1px 0 rgba(255,200,80,.15) inset;
    }
    .btn-submit:not(:disabled):hover {
      animation: shimmer .9s linear infinite; transform: translateY(-1px);
    }
    .btn-submit:disabled { opacity: .5; cursor: not-allowed; }

    .btn-back {
      width: 100%; margin-top: .6rem; padding: .65rem;
      border: 1px solid rgba(200,160,50,.2); border-radius: 10px;
      background: transparent; color: rgba(200,170,100,.5);
      font-family: 'DM Sans', sans-serif; font-size: .84rem;
      cursor: pointer; transition: all .15s;
    }
    .btn-back:hover { border-color: rgba(200,160,50,.4); color: rgba(200,170,100,.8); }

    .spinner {
      display: inline-block; width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
      border-radius: 50%; animation: spin .7s linear infinite;
      vertical-align: middle; margin-right: .5rem;
    }
    .divider {
      display: flex; align-items: center; gap: .85rem; margin: 1.4rem 0 1.1rem;
    }
    .divider::before, .divider::after {
      content: ''; flex: 1; height: 1px; background: rgba(200,160,50,.15);
    }
    .divider span { font-size: .7rem; letter-spacing: .12em; text-transform: uppercase; color: rgba(200,160,60,.4); }
    .login-line { text-align: center; font-size: .82rem; color: rgba(200,170,100,.55); }
    .login-line a {
      color: #c8a040; text-decoration: none; font-weight: 500;
      border-bottom: 1px solid rgba(200,160,40,.3); padding-bottom: 1px;
      transition: color .15s, border-color .15s;
    }
    .login-line a:hover { color: #e8c060; border-color: rgba(220,180,60,.6); }

    .error-alert {
      display: flex; align-items: center; gap: .55rem;
      padding: .65rem .9rem; background: rgba(239,68,68,.08);
      border: 1px solid rgba(239,68,68,.25); border-radius: 9px;
      margin-bottom: 1rem; font-size: .8rem; color: #fca5a5;
      animation: fadeIn .2s ease both;
    }
    .success-alert {
      display: flex; align-items: center; gap: .55rem;
      padding: .65rem .9rem; background: rgba(16,185,129,.08);
      border: 1px solid rgba(16,185,129,.25); border-radius: 9px;
      margin-bottom: 1rem; font-size: .8rem; color: #6ee7b7;
      animation: fadeIn .2s ease both;
    }
    .footer-note {
      text-align: center; margin-top: 1.8rem; font-size: .7rem;
      letter-spacing: .06em; color: rgba(180,140,60,.3);
    }
  `}</style>
);

/* ── Icons ── */
const IconPerson = () => (
  <svg className="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M15 18v-2a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v2"/><circle cx="10" cy="7" r="3"/>
  </svg>
);
const IconMail = () => (
  <svg className="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="2" y="5" width="16" height="11" rx="2"/><path d="M2 7l8 5 8-5"/>
  </svg>
);
const IconLock = () => (
  <svg className="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="5" y="9" width="10" height="8" rx="2"/><path d="M7 9V6a3 3 0 0 1 6 0v3"/>
  </svg>
);
const IconBook = () => (
  <svg className="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4z"/>
    <path d="M7 2v16M2 7h5"/>
  </svg>
);
const IconLevel = () => (
  <svg className="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M10 2l2.4 4.9 5.4.8-3.9 3.8.9 5.3L10 14.3l-4.8 2.5.9-5.3L2.2 7.7l5.4-.8L10 2z"/>
  </svg>
);
const IconEye = ({ closed }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    {closed ? (
      <><path d="M2 2L18 18M6.7 6.7C4 8 2 10 2 10s3 5 8 5c1.4 0 2.7-.33 3.93-.87M10 15c.88 0 1.74-.14 2.54-.4M16.1 12.1C17.43 10.93 18 10 18 10s-3-5-8-5c-.5 0-1 .04-1.48.12"/></>
    ) : (
      <><path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z"/><circle cx="10" cy="10" r="3"/></>
    )}
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:14,height:14,flexShrink:0}}>
    <circle cx="10" cy="10" r="8"/><line x1="10" y1="6" x2="10" y2="10"/>
    <circle cx="10" cy="13.5" r=".5" fill="currentColor"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14,flexShrink:0}}>
    <path d="M4 10l4 4 8-8"/>
  </svg>
);
const IconMail2 = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" style={{width:32,height:32,color:'#c9a227'}}>
    <rect x="2" y="5" width="16" height="11" rx="2"/><path d="M2 7l8 5 8-5"/>
  </svg>
);

export default function Register() {
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP

  // Form fields
  const [fullName, setFullName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPassword, setShowPass] = useState(false);
  const [level, setLevel]         = useState("");     // college | seniorhigh
  const [course, setCourse]       = useState("");

  // OTP
  const [otpDigits, setOtpDigits] = useState(["","","","","",""]);
  const [otpShake, setOtpShake]   = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [timerRef, setTimerRef]   = useState(null);

  // UI
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const startCountdown = () => {
    setCountdown(60);
    const t = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
    setTimerRef(t);
  };

  // Step 1 → send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!fullName || !email || !password || !level || !course) {
      setError("Please fill in all fields."); return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setSuccess("OTP sent! Check your Gmail inbox.");
      setStep(2);
      startCountdown();
    } catch {
      setError("Cannot reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setSuccess("New OTP sent!");
      setOtpDigits(["","","","","",""]);
      startCountdown();
    } catch {
      setError("Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpDigits];
    next[idx] = val;
    setOtpDigits(next);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };
  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otpDigits];
    pasted.split("").forEach((d, i) => { if (i < 6) next[i] = d; });
    setOtpDigits(next);
    document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus();
  };

  // Step 2 → verify OTP and register
  const handleVerify = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join("");
    if (otp.length < 6) {
      setError("Please enter all 6 digits.");
      setOtpShake(true); setTimeout(() => setOtpShake(false), 500);
      return;
    }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE}/otp/verify-and-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role: "student", course, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        setOtpShake(true); setTimeout(() => setOtpShake(false), 500);
        return;
      }
      setSuccess("🎉 Registration successful! You can now log in.");
      setStep(3);
    } catch {
      setError("Cannot reach the server.");
    } finally {
      setLoading(false);
    }
  };

  const levelLabel = level === "college" ? "College" : level === "seniorhigh" ? "Senior High" : "";

  return (
    <>
      <GlobalStyles />
      <div className="reg-root">
        <div className="deco-ring" />
        <div className="deco-ring deco-ring-2" />

        <div className="card-wrap">
          <div className="card">
            {/* Step dots */}
            <div className="step-indicator">
              {[1,2,3].map(s => (
                <div key={s} className={`step-dot ${step === s ? "active" : step > s ? "done" : ""}`} />
              ))}
            </div>

            {/* ── STEP 1: Registration Form ── */}
            {step === 1 && (
              <>
                <p className="step-label">Step 1 of 3 — Your Details</p>
                <h1 className="headline">Create Account</h1>
                <p className="subline">Fill in your information to get started</p>

                {error && <div className="error-alert"><IconAlert />{error}</div>}

                <form onSubmit={handleSendOTP}>
                  <div className="field">
                    <label>Full Name</label>
                    <div className="input-wrap">
                      <IconPerson />
                      <input type="text" placeholder="Juan Dela Cruz"
                        value={fullName} onChange={e => setFullName(e.target.value)} required />
                    </div>
                  </div>

                  <div className="field">
                    <label>Gmail Address</label>
                    <div className="input-wrap">
                      <IconMail />
                      <input type="email" placeholder="juan@gmail.com"
                        value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                  </div>

                  <div className="field">
                    <label>Password</label>
                    <div className="input-wrap">
                      <IconLock />
                      <input type={showPassword ? "text" : "password"}
                        placeholder="••••••••" className="has-toggle"
                        value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" className="toggle-password"
                        onClick={() => setShowPass(v => !v)}>
                        <IconEye closed={!showPassword} />
                      </button>
                    </div>
                  </div>

                  {/* Level dropdown */}
                  <div className="field">
                    <label>Education Level</label>
                    <div className="input-wrap">
                      <IconLevel />
                      <select value={level} onChange={e => { setLevel(e.target.value); setCourse(""); }} required>
                        <option value="">— Select Level —</option>
                        <option value="college">College</option>
                        <option value="seniorhigh">Senior High School</option>
                      </select>
                      <span className="select-arrow">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 4l4 4 4-4"/>
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Course dropdown — only shows after level is selected */}
                  {level && (
                    <div className="field" style={{animation:"fadeIn .25s ease both"}}>
                      <label>Course / Strand</label>
                      <div className="input-wrap">
                        <IconBook />
                        <select value={course} onChange={e => setCourse(e.target.value)} required>
                          <option value="">— Select {levelLabel} Course —</option>
                          {COURSES[level].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <span className="select-arrow">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 4l4 4 4-4"/>
                          </svg>
                        </span>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? <><span className="spinner"/>Sending OTP…</> : "Continue →"}
                  </button>
                </form>

                <div className="divider"><span>Have an account?</span></div>
                <p className="login-line">Already registered? <Link to="/">Sign in here</Link></p>
              </>
            )}

            {/* ── STEP 2: OTP Verification ── */}
            {step === 2 && (
              <>
                <p className="step-label">Step 2 of 3 — Verify Email</p>
                <div style={{textAlign:"center",marginBottom:"1rem"}}>
                  <IconMail2 />
                </div>
                <h1 className="headline">Check Your Gmail</h1>
                <p className="otp-email-hint">
                  We sent a 6-digit code to<br/>
                  <strong>{email}</strong>
                </p>

                {error   && <div className="error-alert"><IconAlert />{error}</div>}
                {success && <div className="success-alert"><IconCheck />{success}</div>}

                <form onSubmit={handleVerify}>
                  <div className={`otp-wrap ${otpShake ? "shake" : ""}`}
                    onPaste={handleOtpPaste}>
                    {otpDigits.map((d, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        className={`otp-input ${d ? "filled" : ""}`}
                        type="text" inputMode="numeric" maxLength={1}
                        value={d}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        style={{animationDelay:`${i * 0.06}s`}}
                      />
                    ))}
                  </div>

                  <div className="otp-timer">
                    {countdown > 0 ? (
                      <span>Resend code in <strong style={{color:"#c9a227"}}>{countdown}s</strong></span>
                    ) : (
                      <span>Didn't receive it?{" "}
                        <button className="otp-resend" type="button"
                          onClick={handleResend} disabled={loading}>
                          Resend OTP
                        </button>
                      </span>
                    )}
                  </div>

                  <button type="submit" className="btn-submit"
                    style={{marginTop:"1.4rem"}} disabled={loading}>
                    {loading ? <><span className="spinner"/>Verifying…</> : "Verify & Register"}
                  </button>

                  <button type="button" className="btn-back"
                    onClick={() => { setStep(1); setError(""); setSuccess(""); }}>
                    ← Back to form
                  </button>
                </form>
              </>
            )}

            {/* ── STEP 3: Success ── */}
            {step === 3 && (
              <div style={{textAlign:"center",padding:"1rem 0"}}>
                <div style={{
                  width:72,height:72,borderRadius:"50%",margin:"0 auto 1.2rem",
                  background:"rgba(16,185,129,.12)",border:"2px solid rgba(16,185,129,.4)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  animation:"otp-pop .5s cubic-bezier(.34,1.56,.64,1) both"
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"
                    style={{width:36,height:36}}>
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <h1 className="headline" style={{fontSize:"1.5rem"}}>You're In! 🎉</h1>
                <p className="subline" style={{marginBottom:"1.6rem"}}>
                  Account created successfully.<br/>
                  <strong style={{color:"rgba(200,170,100,.8)"}}>{fullName}</strong> — {course}
                </p>
                <Link to="/">
                  <button className="btn-submit" style={{width:"100%"}}>
                    Go to Login →
                  </button>
                </Link>
              </div>
            )}
          </div>

          <p className="footer-note">
            © {new Date().getFullYear()} School Quiz System · All rights reserved
          </p>
        </div>
      </div>
    </>
  );
}