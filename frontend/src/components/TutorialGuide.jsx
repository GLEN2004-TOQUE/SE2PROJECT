import { useState } from "react";

const STUDENT_STEPS = [
  {
    icon: "🎮",
    title: "Welcome to your quest hub",
    body: "This is your home base. Track XP, streaks, tier progress, and daily goals from the overview at the top of the dashboard.",
  },
  {
    icon: "⚔️",
    title: "My Quests — take assigned quizzes",
    body: "Teachers send quizzes to your section. When a quest is active, open it from My Quests and select Start Quest to begin. Each quiz is timed per question.",
  },
  {
    icon: "🏆",
    title: "Earn XP, tiers, and rewards",
    body: "Points and streaks raise your tier and unlock profile themes. Check the tier path and player rank cards to see how close you are to the next reward.",
  },
  {
    icon: "📊",
    title: "Charts and AI study tips",
    body: "Analytics show completion rate, score trends, and quiz load. AI recommendations highlight weak topics based on your results (refreshed about every 24 hours).",
  },
  {
    icon: "🥇",
    title: "Hall of Fame",
    body: "Compete with classmates on the overall, daily, and weekly leaderboards. Filtered rankings use your section when available.",
  },
  {
    icon: "🔔",
    title: "Notifications and settings",
    body: "The bell shows teacher announcements and rewards. Use Settings to change your password. Sign out from the top bar when you are done.",
  },
];

const TEACHER_STEPS = [
  {
    icon: "👋",
    title: "Welcome to your teacher dashboard",
    body: "Overview shows student count, quizzes created, attendance trends, and top performers. Quick actions jump to lecture upload and quiz generation.",
  },
  {
    icon: "📄",
    title: "Upload lectures",
    body: "From Upload Lecture, add PDF, DOCX, or PPTX files. Uploaded material powers AI quiz generation and keeps content organized by subject.",
  },
  {
    icon: "✨",
    title: "Generate quizzes with AI",
    body: "Generate Quiz builds drafts from your lectures. Review and edit questions, then save. Drafts appear under My Quizzes until you send them.",
  },
  {
    icon: "📤",
    title: "Send quizzes to students",
    body: "Use Send on a quiz to pick section, subject, and students, then schedule start and end times. Students see active quests on their dashboard.",
  },
  {
    icon: "📋",
    title: "Students, attendance, and results",
    body: "My Students lists your class with filters by section and subject. View submissions and scores per quiz, track attendance, and manage points or assigned subjects.",
  },
  {
    icon: "📣",
    title: "Announcements and settings",
    body: "Announce sends reward messages and badges to all or selected students. Settings let you update your name, subjects, and password.",
  },
];

const TutorialStyles = () => (
  <style>{`
    @keyframes tg-modalIn {
      from { opacity: 0; transform: scale(.96) translateY(12px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes tg-fadeIn {
      from { opacity: 0; transform: translateX(8px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes tg-overlayIn { from { opacity: 0; } to { opacity: 1; } }

    .tg-overlay {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(8, 4, 4, .78);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      padding: 1.25rem;
      animation: tg-overlayIn .25s ease both;
    }

    .tg-panel {
      width: 100%; max-width: 520px;
      background: linear-gradient(160deg, rgba(42, 14, 14, .98), rgba(26, 10, 10, .99));
      border: 1px solid rgba(200, 160, 50, .28);
      border-radius: 18px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, .55), 0 0 0 1px rgba(200, 160, 50, .06) inset;
      overflow: hidden;
      animation: tg-modalIn .35s cubic-bezier(.22, 1, .36, 1) both;
    }
    .tg-panel--student .tg-headline {
      font-family: 'Orbitron', monospace;
    }
    .tg-panel--teacher .tg-headline {
      font-family: 'Playfair Display', serif;
    }

    .tg-header {
      padding: 1.35rem 1.5rem 1rem;
      border-bottom: 1px solid rgba(200, 160, 50, .12);
      background: rgba(120, 20, 20, .18);
    }
    .tg-kicker {
      font-size: .62rem; letter-spacing: .14em; text-transform: uppercase;
      color: rgba(200, 160, 60, .65); margin-bottom: .35rem; font-weight: 500;
    }
    .tg-headline {
      font-size: 1.25rem; font-weight: 700; color: #f5e6c8; line-height: 1.3;
    }
    .tg-greeting {
      margin-top: .45rem; font-size: .82rem; color: rgba(200, 170, 100, .55);
      font-weight: 300;
    }

    .tg-body { padding: 1.35rem 1.5rem 1.1rem; }

    .tg-step-icon {
      width: 52px; height: 52px; border-radius: 14px;
      background: rgba(120, 20, 20, .35);
      border: 1px solid rgba(200, 160, 50, .22);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; margin-bottom: 1rem;
    }
    .tg-step-title {
      font-size: 1.05rem; font-weight: 600; color: #f5e6c8;
      margin-bottom: .55rem; line-height: 1.35;
    }
    .tg-step-body {
      font-size: .88rem; line-height: 1.65; color: rgba(220, 200, 160, .72);
      font-weight: 300;
    }
    .tg-step-content { animation: tg-fadeIn .3s ease both; }

    .tg-progress {
      display: flex; align-items: center; gap: .45rem;
      margin-top: 1.25rem;
    }
    .tg-dot {
      flex: 1; height: 4px; border-radius: 99px;
      background: rgba(200, 160, 50, .15);
      transition: background .25s, box-shadow .25s;
    }
    .tg-dot.is-active {
      background: linear-gradient(90deg, #c8a040, #e8c878);
      box-shadow: 0 0 10px rgba(200, 160, 64, .45);
    }
    .tg-dot.is-done { background: rgba(200, 160, 50, .45); }

    .tg-step-label {
      margin-top: .65rem; font-size: .68rem; letter-spacing: .1em;
      text-transform: uppercase; color: rgba(200, 160, 60, .5);
    }

    .tg-footer {
      display: flex; align-items: center; justify-content: space-between;
      gap: .75rem; padding: 0 1.5rem 1.35rem;
    }
    .tg-skip {
      background: none; border: none; cursor: pointer;
      font-size: .78rem; color: rgba(200, 170, 100, .4);
      padding: .4rem .2rem; transition: color .2s;
    }
    .tg-skip:hover { color: rgba(232, 200, 120, .85); }

    .tg-actions { display: flex; gap: .6rem; margin-left: auto; }

    .tg-btn {
      padding: .62rem 1.15rem; border-radius: 10px; cursor: pointer;
      font-size: .84rem; font-weight: 500; letter-spacing: .03em;
      transition: transform .15s, box-shadow .2s, opacity .2s;
      border: 1px solid transparent;
    }
    .tg-btn:disabled { opacity: .5; cursor: not-allowed; }
    .tg-btn--ghost {
      background: rgba(255, 255, 255, .04);
      border-color: rgba(200, 160, 50, .22);
      color: rgba(245, 230, 200, .85);
    }
    .tg-btn--ghost:not(:disabled):hover {
      border-color: rgba(200, 160, 50, .45);
      color: #f5e6c8;
    }
    .tg-btn--primary {
      color: #fff8e8;
      background: linear-gradient(135deg, #8b1a1a, #6b1010);
      border-color: rgba(200, 160, 50, .25);
      box-shadow: 0 4px 16px rgba(120, 20, 20, .45);
    }
    .tg-btn--primary:not(:disabled):hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 22px rgba(140, 30, 30, .55);
    }
  `}</style>
);

/**
 * Multi-step tutorial modal for new students or teachers (first dashboard visit).
 */
export default function TutorialGuide({ variant = "student", displayName, onClose }) {
  const steps = variant === "teacher" ? TEACHER_STEPS : STUDENT_STEPS;
  const [step, setStep] = useState(0);
  const total = steps.length;
  const current = steps[step];
  const isLast = step === total - 1;
  const roleLabel = variant === "teacher" ? "Teacher" : "Student";

  const finish = () => onClose?.();

  const handleNext = () => {
    if (isLast) finish();
    else setStep((s) => s + 1);
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) finish();
  };

  return (
    <>
      <TutorialStyles />
      <div
        className="tg-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tg-title"
        onClick={handleBackdrop}
      >
        <div
          className={`tg-panel tg-panel--${variant}`}
          onClick={(e) => e.stopPropagation()}
        >
          <header className="tg-header">
            <p className="tg-kicker">Getting started · {roleLabel} guide</p>
            <h2 id="tg-title" className="tg-headline">
              How to use the School Quiz System
            </h2>
            {displayName && (
              <p className="tg-greeting">
                Hi, {displayName.split(" ")[0] || displayName} — here is a quick tour.
              </p>
            )}
          </header>

          <div className="tg-body" key={step}>
            <div className="tg-step-content">
              <div className="tg-step-icon" aria-hidden="true">
                {current.icon}
              </div>
              <h3 className="tg-step-title">{current.title}</h3>
              <p className="tg-step-body">{current.body}</p>
            </div>

            <div className="tg-progress" aria-hidden="true">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`tg-dot ${i === step ? "is-active" : ""} ${i < step ? "is-done" : ""}`}
                />
              ))}
            </div>
            <p className="tg-step-label">
              Step {step + 1} of {total}
            </p>
          </div>

          <footer className="tg-footer">
            <button type="button" className="tg-skip" onClick={finish}>
              Skip tour
            </button>
            <div className="tg-actions">
              {step > 0 && (
                <button
                  type="button"
                  className="tg-btn tg-btn--ghost"
                  onClick={() => setStep((s) => s - 1)}
                >
                  Back
                </button>
              )}
              <button type="button" className="tg-btn tg-btn--primary" onClick={handleNext}>
                {isLast ? "Get started" : "Next"}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
