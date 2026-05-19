import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Preloader from "../components/Preloader";
import { canAttemptAuth, isValidEmail, sanitizeEmail } from "../utils/security";
import { getFriendlyApiErrorMessage, setAuthToken, API_BASE_URL, forgotPasswordSend, forgotPasswordVerify, forgotPasswordComplete } from "../services/api";

/* ─── Inline styles & keyframes injected once ─── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes floatUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(0.92); opacity: .6; }
      50%  { transform: scale(1.04); opacity: .15; }
      100% { transform: scale(0.92); opacity: .6; }
    }

    .login-root {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background-color: #1a0a0a;
      background-image:
        radial-gradient(ellipse 80% 60% at 10% 10%,  rgba(120,20,20,.55) 0%, transparent 70%),
        radial-gradient(ellipse 60% 50% at 90% 90%,  rgba(180,130,20,.25) 0%, transparent 65%),
        radial-gradient(ellipse 40% 40% at 50% 50%,  rgba(80,10,10,.4)   0%, transparent 80%);
      font-family: 'DM Sans', sans-serif;
      position: relative;
      overflow: hidden;
    }

    .login-root::before {
      content: '';
      position: fixed; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.06'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 0;
      opacity: .45;
    }

    .deco-ring {
      position: fixed;
      width: 600px; height: 600px;
      border-radius: 50%;
      border: 1px solid rgba(200,160,40,.12);
      top: -200px; right: -200px;
      animation: pulse-ring 6s ease-in-out infinite;
      pointer-events: none;
    }
    .deco-ring-2 {
      width: 360px; height: 360px;
      bottom: -120px; left: -120px;
      top: auto; right: auto;
      animation-delay: -3s;
    }

    .card-wrap {
      position: relative; z-index: 1;
      width: 100%; max-width: 440px;
      animation: floatUp .65s cubic-bezier(.22,1,.36,1) both;
    }

    .card {
      background: rgba(255,255,255,.045);
      backdrop-filter: blur(18px) saturate(1.4);
      -webkit-backdrop-filter: blur(18px) saturate(1.4);
      border: 1px solid rgba(255,230,160,.1);
      border-radius: 20px;
      padding: 2.4rem 2.2rem 2rem;
      box-shadow:
        0 2px 0 rgba(255,220,100,.06) inset,
        0 32px 64px rgba(0,0,0,.55),
        0 0 0 1px rgba(0,0,0,.3);
    }

    .logo-badge {
      width: 76px; height: 76px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7a1515 0%, #4a0c0c 100%);
      box-shadow: 0 0 0 6px rgba(190,140,30,.18), 0 8px 28px rgba(0,0,0,.55);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1.4rem;
      overflow: hidden;
    }
    .logo-badge img { width: 52px; height: 52px; object-fit: contain; }

    .headline {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: #f5e6c8;
      text-align: center;
      line-height: 1.25;
      letter-spacing: -.01em;
      margin-bottom: .45rem;
    }
    .subline {
      text-align: center;
      font-size: .85rem;
      font-weight: 300;
      color: rgba(200,170,100,.7);
      letter-spacing: .03em;
      margin-bottom: 2.2rem;
      animation: fadeIn .8s .3s both;
    }

    .field { margin-bottom: 1.35rem; }
    .field label {
      display: block;
      font-size: .72rem;
      font-weight: 500;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: rgba(220,190,110,.75);
      margin-bottom: .5rem;
    }

    .input-wrap { position: relative; }
    .input-icon {
      position: absolute; left: .95rem; top: 50%;
      transform: translateY(-50%);
      color: rgba(200,160,60,.5);
      pointer-events: none;
      width: 16px; height: 16px;
    }
    .toggle-password {
      position: absolute;
      right: .95rem; top: 50%;
      transform: translateY(-50%);
      background: none; border: none;
      cursor: pointer;
      color: rgba(200,160,60,.5);
      width: 18px; height: 18px;
      padding: 0;
      display: flex; align-items: center; justify-content: center;
      transition: color .2s;
    }
    .toggle-password:hover { color: rgba(220,180,80,.8); }

    .field input {
      width: 100%;
      padding: .75rem .95rem .75rem 2.6rem;
      background: rgba(255,255,255,.055);
      border: 1px solid rgba(200,160,50,.2);
      border-radius: 10px;
      color: #f5e6c8;
      font-family: 'DM Sans', sans-serif;
      font-size: .9rem;
      font-weight: 300;
      outline: none;
      transition: border-color .2s, box-shadow .2s, background .2s;
    }
    .field input::placeholder { color: rgba(200,170,100,.28); }
    .field input:focus {
      border-color: rgba(200,160,50,.55);
      background: rgba(255,255,255,.085);
      box-shadow: 0 0 0 3px rgba(190,140,30,.13);
    }
    .field input:-webkit-autofill,
    .field input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0 1000px #2a0f0f inset;
      -webkit-text-fill-color: #f5e6c8;
      caret-color: #f5e6c8;
    }
    .password-input { padding-right: 2.6rem; }

    .btn-submit {
      width: 100%;
      margin-top: .5rem;
      padding: .8rem 1rem;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      font-size: .9rem;
      font-weight: 500;
      letter-spacing: .04em;
      color: #fff8e8;
      position: relative;
      overflow: hidden;
      transition: transform .15s, box-shadow .2s, opacity .2s;
      background: linear-gradient(135deg, #8b1a1a 0%, #6b1010 50%, #8b1a1a 100%);
      background-size: 200% auto;
      box-shadow: 0 4px 20px rgba(120,20,20,.55), 0 1px 0 rgba(255,200,80,.15) inset;
    }
    .btn-submit:not(:disabled):hover {
      animation: shimmer .9s linear infinite;
      transform: translateY(-1px);
      box-shadow: 0 8px 28px rgba(140,30,30,.65), 0 1px 0 rgba(255,200,80,.2) inset;
    }
    .btn-submit:not(:disabled):active { transform: translateY(0); }
    .btn-submit:disabled { opacity: .5; cursor: not-allowed; }

    .spinner {
      display: inline-block;
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin .7s linear infinite;
      vertical-align: middle;
      margin-right: .5rem;
    }

    .divider {
      display: flex; align-items: center;
      gap: .85rem;
      margin: 1.6rem 0 1.2rem;
    }
    .divider::before, .divider::after {
      content: ''; flex: 1;
      height: 1px;
      background: rgba(200,160,50,.15);
    }
    .divider span {
      font-size: .7rem;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: rgba(200,160,60,.4);
      white-space: nowrap;
    }

    .register-line {
      text-align: center;
      font-size: .82rem;
      color: rgba(200,170,100,.55);
    }
    .register-line a {
      color: #c8a040;
      text-decoration: none;
      font-weight: 500;
      border-bottom: 1px solid rgba(200,160,40,.3);
      padding-bottom: 1px;
      transition: color .15s, border-color .15s;
    }
    .register-line a:hover {
      color: #e8c060;
      border-color: rgba(220,180,60,.6);
    }

    .footer-note {
      text-align: center;
      margin-top: 1.8rem;
      font-size: .7rem;
      letter-spacing: .06em;
      color: rgba(180,140,60,.3);
      animation: fadeIn .8s .5s both;
    }

    .secure-badge {
      display: flex; align-items: center; justify-content: center;
      gap: .4rem;
      margin-top: 1.5rem;
      font-size: .7rem;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: rgba(180,140,60,.35);
    }
    .secure-badge svg { width: 11px; height: 11px; }

    /* error alert */
    .error-alert {
      display: flex; align-items: center; gap: .55rem;
      padding: .65rem .9rem;
      background: rgba(239,68,68,.08);
      border: 1px solid rgba(239,68,68,.25);
      border-radius: 9px;
      margin-bottom: 1.2rem;
      font-size: .8rem;
      color: #fca5a5;
      animation: fadeIn .2s ease both;
    }
    .error-alert svg { width:14px; height:14px; flex-shrink:0; }

    .success-alert {
      display: flex; align-items: center; gap: .55rem;
      padding: .65rem .9rem;
      background: rgba(34,197,94,.1);
      border: 1px solid rgba(34,197,94,.28);
      border-radius: 9px;
      margin-bottom: 1.2rem;
      font-size: .8rem;
      color: #86efac;
      animation: fadeIn .2s ease both;
    }
    .success-alert svg { width:14px; height:14px; flex-shrink:0; }

    .forgot-row {
      text-align: right;
      margin: -.4rem 0 1rem;
    }
    .forgot-link {
      background: none; border: none; padding: 0;
      font-family: 'DM Sans', sans-serif;
      font-size: .78rem;
      color: rgba(200,160,80,.85);
      cursor: pointer;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .forgot-link:hover { color: #e8c060; }

    .modal-overlay {
      position: fixed; inset: 0; z-index: 100;
      background: rgba(0,0,0,.72);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      padding: 1.25rem;
      animation: fadeIn .2s ease both;
    }
    .modal-panel {
      width: 100%; max-width: 400px;
      background: rgba(30,12,12,.97);
      border: 1px solid rgba(255,230,160,.14);
      border-radius: 16px;
      padding: 1.5rem 1.45rem 1.35rem;
      box-shadow: 0 24px 64px rgba(0,0,0,.65);
      animation: floatUp .4s cubic-bezier(.22,1,.36,1) both;
    }
    .modal-head {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #f5e6c8;
      margin-bottom: .35rem;
    }
    .modal-desc {
      font-size: .8rem;
      color: rgba(200,170,100,.65);
      margin-bottom: 1.1rem;
      line-height: 1.45;
    }
    .modal-actions {
      display: flex; gap: .6rem; margin-top: 1.1rem;
      justify-content: flex-end;
    }
    .btn-ghost {
      padding: .55rem .9rem;
      border-radius: 9px;
      border: 1px solid rgba(200,160,50,.25);
      background: transparent;
      color: rgba(220,190,120,.85);
      font-family: 'DM Sans', sans-serif;
      font-size: .82rem;
      cursor: pointer;
    }
    .btn-ghost:hover { border-color: rgba(200,160,50,.45); color: #f5e6c8; }
    .btn-primary-sm {
      padding: .55rem 1rem;
      border-radius: 9px;
      border: none;
      background: linear-gradient(135deg, #8b1a1a 0%, #6b1010 100%);
      color: #fff8e8;
      font-family: 'DM Sans', sans-serif;
      font-size: .82rem;
      font-weight: 500;
      cursor: pointer;
    }
    .btn-primary-sm:disabled { opacity: .5; cursor: not-allowed; }

  `}</style>
);

/* ─── SVG icon helpers ─── */
const IconMail = () => (
  <svg className="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="2" y="5" width="16" height="11" rx="2"/>
    <path d="M2 7l8 5 8-5"/>
  </svg>
);
const IconLock = () => (
  <svg className="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="5" y="9" width="10" height="8" rx="2"/>
    <path d="M7 9V6a3 3 0 016 0v3"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M10 2l7 3v5c0 4-3 7-7 8C7 17 3 14 3 10V5l7-3z"/>
    <path d="M7 10l2 2 4-4"/>
  </svg>
);
const IconEyeOpen = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10 5C5 5 2 10 2 10s3 5 8 5 8-5 8-5-3-5-8-5z" />
    <circle cx="10" cy="10" r="3" />
  </svg>
);
const IconEyeClosed = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 2L18 18M6.712 6.712C4.033 8.032 2 10 2 10s3 5 8 5c1.406 0 2.731-.331 3.93-.87M10 15c.884 0 1.736-.138 2.537-.395M16.103 12.103C17.434 10.934 18 10 18 10s-3-5-8-5c-.503 0-.996.042-1.48.12" />
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="10" cy="10" r="8"/>
    <line x1="10" y1="6" x2="10" y2="10"/>
    <circle cx="10" cy="13.5" r=".5" fill="currentColor"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 10l4 4 8-8" />
  </svg>
);
/* role → redirect path */
const ROLE_HOME = {
  teacher: "/teacher",
  student: "/student",
  admin:   "/admin",
};

/* ─── Main Component ─── */
function Login() {
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPassword,setShowPassword]= useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [showPreloader, setShowPreloader] = useState(false);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [loginDone, setLoginDone] = useState(false);
  const [loginDestination, setLoginDestination] = useState(null);
  const [errorMsg,    setErrorMsg]    = useState("");
  const [successMsg,  setSuccessMsg]  = useState("");

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState("email"); // 'email' | 'otp' | 'password'
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [forgotResetToken, setForgotResetToken] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotInfo, setForgotInfo] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();

  // If another tab signs in (localStorage sync) or user already has a session, leave login.
  useEffect(() => {
    if (!user?.role) return;
    const dest = ROLE_HOME[user.role];
    if (dest) navigate(dest, { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    const cleanEmail = sanitizeEmail(email);
    if (!isValidEmail(cleanEmail)) {
      setErrorMsg("Please enter a valid email.");
      return;
    }
    if (!canAttemptAuth()) {
      setErrorMsg("Too many attempts. Please wait a few minutes.");
      return;
    }
    setShowPreloader(true);
    setPreloaderDone(false);
    setLoginDone(false);
    setLoginDestination(null);
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, password }),
        }
      );
      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (data.token) {
        setAuthToken(data.token);
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        const dest = ROLE_HOME[payload.role];
        if (dest) {
          setLoginDestination(dest);
          setLoginDone(true);
          if (preloaderDone) navigate(dest);
        } else {
          setShowPreloader(false);
          setLoginDone(true);
          setErrorMsg(`Unknown role: ${payload.role}`);
        }
      } else {
        setShowPreloader(false);
        setLoginDone(true);
        setErrorMsg(
          getFriendlyApiErrorMessage(response.status, data.message || data.error) ||
            "Login failed. Please check your credentials."
        );
      }
    } catch {
      setShowPreloader(false);
      setLoginDone(true);
      setErrorMsg("Cannot reach the server. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginPreloaderDone = () => {
    setPreloaderDone(true);
    if (loginDone && loginDestination) {
      navigate(loginDestination);
      return;
    }
    if (loginDone && !loginDestination) {
      setShowPreloader(false);
    }
  };

  const resetForgotState = () => {
    setForgotStep("email");
    setForgotEmail("");
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotConfirm("");
    setForgotResetToken("");
    setForgotError("");
    setForgotInfo("");
    setForgotLoading(false);
  };

  const openForgotModal = () => {
    resetForgotState();
    setForgotEmail(sanitizeEmail(email));
    setForgotOpen(true);
  };

  const closeForgotModal = () => {
    setForgotOpen(false);
    resetForgotState();
  };

  const handleForgotSend = async () => {
    setForgotError("");
    const clean = sanitizeEmail(forgotEmail);
    if (!isValidEmail(clean)) {
      setForgotError("Please enter a valid email.");
      return;
    }
    if (!canAttemptAuth()) {
      setForgotError("Too many attempts. Please wait a few minutes.");
      return;
    }
    setForgotLoading(true);
    try {
      const data = await forgotPasswordSend(clean);
      setForgotEmail(clean);
      setForgotInfo(data.message || "A verification code was sent to your email. Check your inbox and spam folder.");
      setForgotStep("otp");
    } catch (e) {
      setForgotError(e?.message || "Could not send code. Try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotVerify = async () => {
    setForgotError("");
    const clean = sanitizeEmail(forgotEmail);
    const code = String(forgotOtp).trim().replace(/\s/g, "");
    if (!isValidEmail(clean)) {
      setForgotError("Please enter a valid email.");
      return;
    }
    if (code.length < 6) {
      setForgotError("Enter the 6-digit code from your email.");
      return;
    }
    setForgotLoading(true);
    try {
      const data = await forgotPasswordVerify(clean, code);
      setForgotResetToken(data.resetToken || "");
      setForgotOtp("");
      setForgotInfo("Your code is correct! Enter a new password below.");
      setForgotStep("password");
    } catch (e) {
      setForgotError(e?.message || "Verification failed.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotComplete = async () => {
    setForgotError("");
    if (!forgotResetToken) {
      setForgotError("Session expired. Close this dialog and start again.");
      return;
    }
    if (forgotNewPassword.length < 6) {
      setForgotError("Password must be at least 6 characters.");
      return;
    }
    if (forgotNewPassword !== forgotConfirm) {
      setForgotError("Passwords do not match.");
      return;
    }
    setForgotLoading(true);
    try {
      const data = await forgotPasswordComplete(forgotResetToken, forgotNewPassword);
      const clean = sanitizeEmail(forgotEmail);
      setEmail(clean);
      setPassword("");
      setSuccessMsg(data.message || "Password updated. Sign in with your email and new password.");
      closeForgotModal();
    } catch (e) {
      setForgotError(e?.message || "Could not save password.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles />
      <div className="login-root">
        <div className="deco-ring" />
        <div className="deco-ring deco-ring-2" />

        <div className="card-wrap">
          <div className="card">
            {/* Logo */}
            <div className="logo-badge">
              <img src="/image/logo.png" alt="School Quiz Logo"
                onError={e => { e.target.style.display="none"; }} />
            </div>

            <h1 className="headline">Welcome Back</h1>
            <p className="subline">Sign in to continue your quiz journey</p>

            {/* Error */}
            {errorMsg && (
              <div className="error-alert">
                <IconAlert />
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="success-alert">
                <IconCheck />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleLogin}>
                {/* Email */}
                <div className="field">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrap">
                    <IconMail />
                    <input
                      id="email" type="email"
                      placeholder="student@school.edu"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="field">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrap">
                    <IconLock />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="password-input"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <IconEyeOpen /> : <IconEyeClosed />}
                    </button>
                  </div>
                </div>

                <div className="forgot-row">
                  <button type="button" className="forgot-link" onClick={openForgotModal}>
                    Forgot password?
                  </button>
                </div>

                <button type="submit" className="btn-submit" disabled={isLoading}>
                  {isLoading
                    ? <><span className="spinner" />Signing in…</>
                    : "Sign In"}
                </button>
              </form>

            {/* Login footer links */}
              <>
                <div className="divider"><span>New here?</span></div>

                <p className="register-line">
                  Don't have an account?{" "}
                  <Link to="/register">Create one now</Link>
                </p>

                <div className="secure-badge">
                  <IconShield />
                  Secure, encrypted connection
                </div>
              </>
          </div>

          <p className="footer-note">
            © {new Date().getFullYear()} School Quiz System · All rights reserved
          </p>
        </div>
      </div>

      {showPreloader && <Preloader onDone={handleLoginPreloaderDone} />}

      {forgotOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeForgotModal();
          }}
        >
          <div className="modal-panel" onMouseDown={(e) => e.stopPropagation()}>
            <h2 id="forgot-title" className="modal-head">Reset password</h2>

            {forgotStep === "email" && (
              <>
                <p className="modal-desc">
                  Enter the email on your account. If it exists, we will send a 6-digit code you can use to set a new password.
                </p>
                {forgotError && (
                  <div className="error-alert" style={{ marginBottom: "1rem" }}>
                    <IconAlert />
                    {forgotError}
                  </div>
                )}
                <div className="field">
                  <label htmlFor="forgot-email">Email</label>
                  <div className="input-wrap">
                    <IconMail />
                    <input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@school.edu"
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-ghost" onClick={closeForgotModal}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-primary-sm"
                    disabled={forgotLoading}
                    onClick={handleForgotSend}
                  >
                    {forgotLoading ? "Sending…" : "Send code"}
                  </button>
                </div>
              </>
            )}

            {forgotStep === "otp" && (
              <>
                <p className="modal-desc">
                  Enter the 6-digit code sent to <strong style={{ color: "#e8c060" }}>{forgotEmail}</strong>.
                </p>
                {forgotInfo && (
                  <div className="success-alert" style={{ marginBottom: "1rem" }}>
                    <IconCheck />
                    {forgotInfo}
                  </div>
                )}
                {forgotError && (
                  <div className="error-alert" style={{ marginBottom: "1rem" }}>
                    <IconAlert />
                    {forgotError}
                  </div>
                )}
                <div className="field">
                  <label htmlFor="forgot-otp">Verification code</label>
                  <div className="input-wrap">
                    <IconLock />
                    <input
                      id="forgot-otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={8}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      setForgotStep("email");
                      setForgotOtp("");
                      setForgotError("");
                      setForgotInfo("");
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn-primary-sm"
                    disabled={forgotLoading}
                    onClick={handleForgotVerify}
                  >
                    {forgotLoading ? "Checking…" : "Verify code"}
                  </button>
                </div>
              </>
            )}

            {forgotStep === "password" && (
              <>
                <p className="modal-desc">
                  Choose a new password for <strong style={{ color: "#e8c060" }}>{forgotEmail}</strong>, then sign in on this page.
                </p>
                {forgotInfo && (
                  <div className="success-alert" style={{ marginBottom: "1rem" }}>
                    <IconCheck />
                    {forgotInfo}
                  </div>
                )}
                {forgotError && (
                  <div className="error-alert" style={{ marginBottom: "1rem" }}>
                    <IconAlert />
                    {forgotError}
                  </div>
                )}
                <div className="field">
                  <label htmlFor="forgot-new">New password</label>
                  <div className="input-wrap">
                    <IconLock />
                    <input
                      id="forgot-new"
                      type="password"
                      autoComplete="new-password"
                      className="password-input"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="forgot-confirm">Confirm password</label>
                  <div className="input-wrap">
                    <IconLock />
                    <input
                      id="forgot-confirm"
                      type="password"
                      autoComplete="new-password"
                      className="password-input"
                      value={forgotConfirm}
                      onChange={(e) => setForgotConfirm(e.target.value)}
                      placeholder="Repeat password"
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-ghost" onClick={closeForgotModal}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-primary-sm"
                    disabled={forgotLoading}
                    onClick={handleForgotComplete}
                  >
                    {forgotLoading ? "Saving…" : "Save password"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Login;