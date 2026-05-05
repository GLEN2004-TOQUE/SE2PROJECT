import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadLecture } from "../services/api";

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
    @keyframes dropZonePulse { 0%,100%{border-color:rgba(200,160,50,.25);}50%{border-color:rgba(200,160,50,.55);} }
    @keyframes fileFloat  { 0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);} }

    .ul-root {
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
    .ul-root::before {
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
    .ul-topbar {
      position: sticky; top:0; z-index:30;
      display:flex; align-items:center; justify-content:space-between;
      padding: 0 2rem; height:62px;
      background: rgba(26,10,10,.82);
      backdrop-filter: blur(18px) saturate(1.4);
      border-bottom: 1px solid rgba(200,160,50,.12);
      box-shadow: 0 1px 0 rgba(200,160,50,.06) inset, 0 4px 20px rgba(0,0,0,.4);
      animation: slideDown .4s ease both;
    }
    .ul-logo {
      display:flex; align-items:center; gap:.65rem;
      font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:700;
      color:#f5e6c8; letter-spacing:.01em;
    }
    .ul-logo-icon {
      width:34px; height:34px; border-radius:50%;
      background: linear-gradient(135deg,#7a1515,#4a0c0c);
      box-shadow: 0 0 0 4px rgba(190,140,30,.18), 0 4px 12px rgba(0,0,0,.5);
      display:flex; align-items:center; justify-content:center;
    }
    .ul-logo-icon svg { width:16px; height:16px; color:#f5e6c8; }
    .ul-back-btn {
      display:flex; align-items:center; gap:.45rem;
      padding:.36rem .9rem; border-radius:8px; cursor:pointer;
      font-family:'DM Sans',sans-serif; font-size:.78rem; font-weight:500;
      border: 1px solid rgba(200,160,50,.2);
      background: rgba(200,160,50,.06);
      color: rgba(200,160,80,.6);
      transition: all .15s;
    }
    .ul-back-btn:hover { background:rgba(200,160,50,.14); color:#e8c878; }
    .ul-back-btn svg { width:14px; height:14px; }
    .ul-chip-small {
      font-family:'DM Mono',monospace; font-size:.65rem; padding:.18rem .65rem;
      border-radius:999px; background:rgba(200,160,50,.1);
      border:1px solid rgba(200,160,50,.22); color:#e8c878; letter-spacing:.06em;
    }

    /* ── Body ── */
    .ul-body {
      position:relative; z-index:1;
      max-width:580px; margin:0 auto;
      padding:2.5rem 1.5rem 4rem;
      animation: floatUp .5s ease both;
    }

    /* ── Welcome ── */
    .ul-welcome { margin-bottom:2rem; }
    .ul-welcome-tag {
      display:inline-flex; align-items:center; gap:.4rem;
      font-size:.68rem; letter-spacing:.14em; text-transform:uppercase;
      color:rgba(200,160,60,.6); margin-bottom:.6rem; font-weight:500;
    }
    .ul-welcome-tag-dot {
      width:6px; height:6px; border-radius:50%;
      background:#c8a040; animation:glow-dot 2.5s infinite;
    }
    .ul-title {
      font-family:'Playfair Display',serif;
      font-size:2rem; font-weight:700; color:#f5e6c8;
      letter-spacing:-.01em; line-height:1.2;
    }
    .ul-sub { font-size:.86rem; color:rgba(200,170,100,.45); margin-top:.35rem; font-weight:300; }

    /* ── Glass card ── */
    .glass-card {
      background: rgba(255,255,255,.045);
      backdrop-filter: blur(18px) saturate(1.4);
      border: 1px solid rgba(200,160,50,.13);
      border-radius: 16px;
      box-shadow: 0 2px 0 rgba(255,220,100,.04) inset, 0 16px 48px rgba(0,0,0,.35);
    }

    /* ── Form card ── */
    .ul-form-card { padding:2rem 2.2rem; }

    .ul-field-label {
      display:block; font-size:.66rem; letter-spacing:.12em; text-transform:uppercase;
      color:rgba(200,160,60,.65); margin-bottom:.5rem; font-weight:500;
    }
    .ul-input {
      width:100%; padding:.7rem .95rem; border-radius:9px;
      background:rgba(255,255,255,.055); border:1px solid rgba(200,160,50,.2);
      color:#f5e6c8; font-family:'DM Sans',sans-serif; font-size:.87rem; font-weight:300;
      outline:none; transition:all .2s; margin-bottom:1.4rem;
    }
    .ul-input::placeholder { color:rgba(200,170,100,.25); }
    .ul-input:focus { border-color:rgba(200,160,50,.5); background:rgba(255,255,255,.08); box-shadow:0 0 0 3px rgba(190,140,30,.12); }

    /* ── Drop zone ── */
    .ul-dropzone {
      border:2px dashed rgba(200,160,50,.25); border-radius:14px;
      padding:2.2rem 1.5rem; text-align:center;
      cursor:pointer; transition:all .2s; margin-bottom:1.4rem;
      background:rgba(200,160,50,.03);
      position:relative; overflow:hidden;
    }
    .ul-dropzone:hover, .ul-dropzone.drag-over {
      border-color:rgba(200,160,50,.55);
      background:rgba(200,160,50,.07);
    }
    .ul-dropzone.has-file {
      border-color:rgba(200,160,50,.4);
      background:rgba(200,160,50,.07);
      animation: none;
    }
    .ul-dropzone.idle { animation: dropZonePulse 2.5s ease-in-out infinite; }
    .ul-dropzone input[type="file"] {
      position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%;
    }
    .ul-drop-icon {
      width:48px; height:48px; border-radius:14px; margin:0 auto .9rem;
      background:rgba(120,20,20,.25); border:1px solid rgba(200,160,50,.2);
      display:flex; align-items:center; justify-content:center;
    }
    .ul-drop-icon svg { width:22px; height:22px; color:#e8c878; }
    .ul-drop-icon.has-file { animation: fileFloat 2s ease-in-out infinite; }
    .ul-drop-title { font-size:.9rem; font-weight:500; color:#f5e6c8; margin-bottom:.3rem; }
    .ul-drop-hint  { font-size:.76rem; color:rgba(200,170,100,.4); font-weight:300; }
    .ul-drop-filename {
      font-family:'DM Mono',monospace; font-size:.78rem; color:#e8c878;
      background:rgba(200,160,50,.1); border:1px solid rgba(200,160,50,.2);
      border-radius:7px; padding:.3rem .7rem; display:inline-block; margin-top:.5rem;
    }
    .ul-file-types {
      display:flex; justify-content:center; gap:.5rem; margin-top:.75rem; flex-wrap:wrap;
    }
    .ul-type-chip {
      font-family:'DM Mono',monospace; font-size:.62rem; padding:.16rem .55rem;
      border-radius:5px; background:rgba(255,255,255,.04);
      border:1px solid rgba(200,160,50,.12); color:rgba(200,170,100,.4);
    }

    /* ── Submit btn ── */
    .ul-submit-btn-wrap { display:flex; justify-content:center; margin-top:.5rem; }
    .ul-submit-btn {
      width:auto; padding:.42rem 1.2rem; border:none; border-radius:7px;
      cursor:pointer; font-family:'DM Sans',sans-serif; font-size:.73rem; font-weight:500;
      letter-spacing:.04em; color:#fff8e8; transition:all .15s;
      background:linear-gradient(135deg,#8b1a1a 0%,#6b1010 50%,#8b1a1a 100%);
      background-size:200% auto;
      box-shadow:0 4px 16px rgba(120,20,20,.45), 0 1px 0 rgba(255,200,80,.12) inset;
      display:flex; align-items:center; justify-content:center; gap:.35rem;
    }
    .ul-submit-btn svg { width:12px; height:12px; }
    .ul-submit-btn:hover:not(:disabled) { animation:shimmer .9s linear infinite; transform:translateY(-1px); }
    .ul-submit-btn:disabled { opacity:.5; cursor:not-allowed; animation:none; transform:none; }
    .ul-spinner {
      display:inline-block; width:14px; height:14px;
      border:2px solid rgba(200,160,50,.2); border-top-color:#c8a040;
      border-radius:50%; animation:spin .7s linear infinite;
    }

    /* ── Notifications ── */
    .ul-error-box {
      display:flex; align-items:center; gap:.55rem; padding:.65rem .9rem;
      background:rgba(239,68,68,.07); border:1px solid rgba(239,68,68,.2);
      border-radius:9px; font-size:.79rem; color:#fca5a5; margin-bottom:1rem;
    }
    .ul-error-box svg { width:14px; height:14px; flex-shrink:0; }
    .ul-success-overlay {
      position:fixed; inset:0; z-index:70;
      display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.4rem;
      background:rgba(22,8,8,.96); backdrop-filter:blur(20px);
      animation:fadeIn .3s ease both;
    }
    .ul-success-ring {
      width:90px; height:90px; border-radius:50%;
      background:rgba(120,20,20,.25); border:2px solid rgba(200,160,50,.4);
      display:flex; align-items:center; justify-content:center;
      animation:successRing .6s cubic-bezier(.34,1.56,.64,1) both;
      box-shadow:0 0 40px rgba(200,160,40,.2);
    }
    .ul-success-ring svg { width:38px; height:38px; color:#e8c878; animation:checkPop .5s .3s both; }
    .ul-success-title { font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:700; color:#f5e6c8; margin-bottom:.4rem; letter-spacing:-.01em; }
    .ul-success-sub   { font-size:.84rem; color:rgba(200,170,100,.4); font-weight:300; }

    @media(max-width:640px){
      .ul-body { padding:1.5rem 1rem 3rem; }
      .ul-form-card { padding:1.5rem 1.2rem; }
      .ul-title { font-size:1.6rem; }
      .ul-topbar { padding:0 1rem; }
    }
  `}</style>
);

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
const UploadIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const FileIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <path d="M14 2v6h6"/>
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

export default function UploadLecture() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !file) { setError("Please provide both a title and a file."); return; }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);
      await uploadLecture(formData);
      setSuccess(true);
      setTimeout(() => navigate("/teacher"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fileEmoji = (f) => {
    if (!f) return null;
    if (f.name.endsWith(".pdf")) return "📕";
    if (f.name.endsWith(".docx")) return "📘";
    if (f.name.endsWith(".pptx")) return "📊";
    return "📄";
  };

  return (
    <>
      <Styles />

      {/* Success overlay */}
      {success && (
        <div className="ul-success-overlay">
          <div className="ul-success-ring">{CheckIcon}</div>
          <div style={{ textAlign: "center" }}>
            <div className="ul-success-title">Lecture Uploaded! 🚀</div>
            <div className="ul-success-sub">Redirecting to dashboard…</div>
          </div>
        </div>
      )}

      <div className="ul-root">
        <div className="deco-ring" />
        <div className="deco-ring deco-ring-2" />

        {/* Topbar */}
        <header className="ul-topbar">
          <div className="ul-logo">
            <div className="ul-logo-icon">{StarIcon}</div>
            QuizSystem
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: ".85rem" }}>
            <span className="ul-chip-small">UPLOAD</span>
            <button className="ul-back-btn" onClick={() => navigate("/teacher")}>
              {BackIcon} Back to Dashboard
            </button>
          </div>
        </header>

        <div className="ul-body">
          {/* Welcome */}
          <div className="ul-welcome">
            <div className="ul-welcome-tag">
              <span className="ul-welcome-tag-dot" /> Lecture Management
            </div>
            <h1 className="ul-title">Upload Lecture</h1>
            <p className="ul-sub">Share your materials — PDF, DOCX, or PPTX</p>
          </div>

          {/* Form card */}
          <div className="glass-card ul-form-card">
            {error && (
              <div className="ul-error-box">
                {AlertIcon} {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label className="ul-field-label">Lecture Title</label>
              <input
                className="ul-input"
                type="text"
                value={title}
                onChange={e => { setTitle(e.target.value); setError(""); }}
                placeholder="e.g., Introduction to Photosynthesis"
                required
              />

              <label className="ul-field-label">File</label>
              <div
                className={`ul-dropzone ${dragOver ? "drag-over" : ""} ${file ? "has-file" : "idle"}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.pptx"
                  onChange={e => { setFile(e.target.files[0]); setError(""); }}
                  required={!file}
                />
                <div className={`ul-drop-icon ${file ? "has-file" : ""}`}>
                  {file ? FileIcon : UploadIcon}
                </div>
                {file ? (
                  <>
                    <div className="ul-drop-title">{fileEmoji(file)} File selected</div>
                    <div className="ul-drop-filename">{file.name}</div>
                    <div className="ul-drop-hint" style={{ marginTop: ".5rem" }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB · Click to replace
                    </div>
                  </>
                ) : (
                  <>
                    <div className="ul-drop-title">Drop your file here</div>
                    <div className="ul-drop-hint">or click to browse</div>
                    <div className="ul-file-types">
                      <span className="ul-type-chip">PDF</span>
                      <span className="ul-type-chip">DOCX</span>
                      <span className="ul-type-chip">PPTX</span>
                    </div>
                  </>
                )}
              </div>

              <div className="ul-submit-btn-wrap">
                <button className="ul-submit-btn" type="submit" disabled={loading || !title || !file}>
                  {loading ? <><span className="ul-spinner" /> Uploading…</> : <>{UploadIcon} Upload</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}