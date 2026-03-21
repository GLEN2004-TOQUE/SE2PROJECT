import { useState } from "react";
import { Link } from "react-router-dom";

/* ─── Inline styles & keyframes ─── */
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
    @keyframes badge-pop {
      0%   { transform: scale(0.7); opacity: 0; }
      70%  { transform: scale(1.08); }
      100% { transform: scale(1);   opacity: 1; }
    }

    .reg-root {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background-color: #1a0a0a;
      background-image:
        radial-gradient(ellipse 70% 55% at 90% 10%,  rgba(120,20,20,.5)  0%, transparent 70%),
        radial-gradient(ellipse 55% 45% at 5%  90%,  rgba(180,130,20,.22) 0%, transparent 65%),
        radial-gradient(ellipse 40% 40% at 50% 50%,  rgba(80,10,10,.4)    0%, transparent 80%);
      font-family: 'DM Sans', sans-serif;
      position: relative;
      overflow: hidden;
    }

    /* grain */
    .reg-root::before {
      content: '';
      position: fixed; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.06'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 0;
      opacity: .45;
    }

    .deco-ring {
      position: fixed;
      width: 560px; height: 560px;
      border-radius: 50%;
      border: 1px solid rgba(200,160,40,.12);
      top: -180px; left: -180px;
      animation: pulse-ring 7s ease-in-out infinite;
      pointer-events: none;
    }
    .deco-ring-2 {
      width: 380px; height: 380px;
      bottom: -130px; right: -130px;
      top: auto; left: auto;
      animation-delay: -3.5s;
    }

    /* wrapper */
    .card-wrap {
      position: relative; z-index: 1;
      width: 100%; max-width: 440px;
      animation: floatUp .65s cubic-bezier(.22,1,.36,1) both;
    }

    /* avatar badge */
    .avatar-badge {
      width: 80px; height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7a1515 0%, #4a0c0c 100%);
      box-shadow: 0 0 0 6px rgba(190,140,30,.18), 0 8px 28px rgba(0,0,0,.55);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1.4rem;
      animation: badge-pop .55s cubic-bezier(.34,1.56,.64,1) .1s both;
    }
    .avatar-badge svg { width: 36px; height: 36px; color: #e8c060; }

    /* glass card */
    .card {
      background: rgba(255,255,255,.045);
      backdrop-filter: blur(18px) saturate(1.4);
      -webkit-backdrop-filter: blur(18px) saturate(1.4);
      border: 1px solid rgba(255,230,160,.1);
      border-radius: 20px;
      padding: 2rem 2.2rem 2rem;
      box-shadow:
        0 2px 0 rgba(255,220,100,.06) inset,
        0 32px 64px rgba(0,0,0,.55),
        0 0 0 1px rgba(0,0,0,.3);
    }

    /* headline inside card */
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
      margin-bottom: 2rem;
      animation: fadeIn .8s .3s both;
    }

    /* fields */
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

    /* password eye toggle */
    .toggle-password {
      position: absolute;
      right: .95rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      color: rgba(200,160,60,.5);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color .2s;
    }
    .toggle-password:hover {
      color: rgba(200,160,60,.9);
    }
    .toggle-password svg {
      width: 18px;
      height: 18px;
    }
    /* adjust padding for password field with eye */
    .field input[type="password"],
    .field input[type="text"] {
      padding-right: 2.8rem;
    }

    /* student pill */
    .role-pill {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .5rem;
      padding: .55rem 1rem;
      border-radius: 8px;
      background: rgba(200,160,40,.08);
      border: 1px solid rgba(200,160,40,.2);
      margin-bottom: 1.35rem;
      font-size: .76rem;
      letter-spacing: .07em;
      text-transform: uppercase;
      color: rgba(220,185,80,.65);
    }
    .role-pill-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #c8a040;
      box-shadow: 0 0 6px rgba(200,160,40,.6);
    }

    /* submit */
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

    /* divider */
    .divider {
      display: flex; align-items: center;
      gap: .85rem;
      margin: 1.6rem 0 1.2rem;
    }
    .divider::before, .divider::after {
      content: '';
      flex: 1;
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

    /* links */
    .login-line {
      text-align: center;
      font-size: .82rem;
      color: rgba(200,170,100,.55);
    }
    .login-line a {
      color: #c8a040;
      text-decoration: none;
      font-weight: 500;
      border-bottom: 1px solid rgba(200,160,40,.3);
      padding-bottom: 1px;
      transition: color .15s, border-color .15s;
    }
    .login-line a:hover {
      color: #e8c060;
      border-color: rgba(220,180,60,.6);
    }

    /* stat strip */
    .stat-strip {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .4rem;
      margin-top: 1.5rem;
      font-size: .72rem;
      letter-spacing: .07em;
      color: rgba(200,165,70,.38);
    }
    .stat-strip svg { width: 11px; height: 11px; }

    .footer-note {
      text-align: center;
      margin-top: 1.8rem;
      font-size: .7rem;
      letter-spacing: .06em;
      color: rgba(180,140,60,.3);
      animation: fadeIn .8s .5s both;
    }
  `}</style>
);

/* ─── Icons ─── */
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{width:36,height:36}}>
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

const IconPerson = () => (
  <svg className="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M15 18v-2a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v2" />
    <circle cx="10" cy="7" r="3" />
  </svg>
);

const IconMail = () => (
  <svg className="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="2" y="5" width="16" height="11" rx="2"/>
    <path d="M2 7l8 5 8-5"/>
  </svg>
);

const IconLock = () => (
  <svg className="input-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="5" y="9" width="10" height="8" rx="2"/>
    <path d="M7 9V6a3 3 0 0 1 6 0v3"/>
  </svg>
);

const IconEye = ({ closed }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    {closed ? (
      <>
        <path d="M4 4L16 16M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" />
        <line x1="8" y1="12" x2="12" y2="8" />
      </>
    ) : (
      <>
        <path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" />
        <circle cx="10" cy="10" r="3" />
      </>
    )}
  </svg>
);

/* ─── Main Component ─── */
function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const role = "student";

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("https://backend-7lik.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Registration Successful! Welcome aboard! 🎉");
      } else {
        alert(data.message || "Registration Failed");
      }
    } catch (error) {
      console.log(error);
      alert("Server Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles />
      <div className="reg-root">
        {/* Decorative rings */}
        <div className="deco-ring" />
        <div className="deco-ring deco-ring-2" />

        <div className="card-wrap">
          {/* Avatar badge */}
          <div className="avatar-badge">
            <IconUser />
          </div>

          {/* Card */}
          <div className="card">
            <h1 className="headline">Create Your Account</h1>
            <p className="subline">Join as a student and start challenging yourself</p>

            <form onSubmit={handleRegister}>
              {/* Full Name */}
              <div className="field">
                <label htmlFor="fullName">Full Name</label>
                <div className="input-wrap">
                  <IconPerson />
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Glen Toque"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="field">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrap">
                  <IconMail />
                  <input
                    id="email"
                    type="email"
                    placeholder="toxx@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <IconEye closed={!showPassword} />
                  </button>
                </div>
              </div>

              {/* Role – locked to Student */}
              <div className="field">
                <label htmlFor="role">Role</label>
                <div className="input-wrap">
                  <IconPerson />
                  <input
                    id="role"
                    type="text"
                    value="Student"
                    disabled
                    style={{ cursor: 'not-allowed', opacity: 0.7 }}
                  />
                </div>
              </div>

              {/* Role pill */}
              <div className="role-pill">
                <span className="role-pill-dot" />
                Registering as a Student
              </div>

              {/* Submit */}
              <button type="submit" className="btn-submit" disabled={isLoading}>
                {isLoading ? (
                  <><span className="spinner" />Creating Account…</>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider"><span>Already a member?</span></div>

            {/* Login link */}
            <p className="login-line">
              Already have an account?{" "}
              <Link to="/">Sign in here</Link>
            </p>
          </div>

          {/* Footer */}
          <p className="footer-note">
            © {new Date().getFullYear()} School Quiz System · All rights reserved
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;