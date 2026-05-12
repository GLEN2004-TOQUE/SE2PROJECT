import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuiz, submitQuiz, getUser } from "../services/api";

const QUESTION_WINDOW_SEC = 5;

function QuizPage() {
  const { quizId } = useParams();
  const navigate   = useNavigate();

  const [quiz,       setQuiz]       = useState(null);
  const [questions,  setQuestions]  = useState([]);
  const [answers,    setAnswers]    = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_WINDOW_SEC);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [submitted,  setSubmitted]  = useState(false);
  const [result,     setResult]     = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitRef = useRef(() => {});

  // Load quiz
  useEffect(() => {
    const user = getUser();
    if (!user) { navigate("/"); return; }

    setLoading(true);
    getQuiz(quizId)
      .then(data => {
        setQuiz(data.quiz);
        setQuestions(data.questions || []);
        setCurrentIndex(0);
        setSecondsLeft(QUESTION_WINDOW_SEC);
      })
      .catch(err => {
        const msg = err.message || "Could not load quiz.";
        // Surface friendly messages
        if (msg.includes("not started") || msg.includes("upcoming")) {
          setError("⏳ This quiz hasn't started yet. Check back when it opens.");
        } else if (msg.includes("ended") || msg.includes("already ended")) {
          setError("🔒 This quiz has ended. You can no longer take it.");
        } else if (msg.includes("not assigned")) {
          setError("⚠️ You are not assigned to this quiz.");
        } else {
          setError(msg);
        }
      })
      .finally(() => setLoading(false));
  }, [quizId, navigate]);

  const handleSubmit = useCallback(async (answerSnapshot) => {
    if (submitting || submitted) return;
    const payload = answerSnapshot ?? answers;
    setSubmitting(true);
    try {
      const data = await submitQuiz(quizId, payload);
      setResult(data);
      setSubmitted(true);
    } catch (err) {
      const msg = err.message || "Submission failed.";
      if (msg.includes("already taken")) {
        setError("You have already submitted this quiz.");
        setSubmitted(true);
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }, [quizId, answers, submitting, submitted]);

  useEffect(() => {
    handleSubmitRef.current = () => handleSubmit();
  }, [handleSubmit]);

  // Per-question countdown (flash card window)
  useEffect(() => {
    if (submitted || !questions.length || currentIndex >= questions.length) return;

    if (secondsLeft <= 0) return;

    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, currentIndex, questions.length, submitted]);

  // When window hits 0: advance or finish (skipped questions stay unanswered; prior cards are gone)
  useEffect(() => {
    if (submitted || !questions.length || secondsLeft > 0 || currentIndex >= questions.length) return;

    const isLast = currentIndex >= questions.length - 1;
    if (isLast) {
      handleSubmitRef.current();
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSecondsLeft(QUESTION_WINDOW_SEC);
  }, [secondsLeft, currentIndex, questions.length, submitted]);

  const pickAnswer = useCallback((qId, letter) => {
    if (submitting || submitted) return;
    const next = { ...answers, [qId]: letter };
    setAnswers(next);
    const isLast = currentIndex >= questions.length - 1;
    if (isLast) {
      handleSubmit(next);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSecondsLeft(QUESTION_WINDOW_SEC);
  }, [answers, currentIndex, questions.length, submitting, submitted, handleSubmit]);

  const progressPct = questions.length
    ? Math.min(
        100,
        Math.round(
          ((currentIndex + (QUESTION_WINDOW_SEC - secondsLeft) / QUESTION_WINDOW_SEC) / questions.length) * 100,
        ),
      )
    : 0;

  const optLabels = ["A", "B", "C", "D"];

  // ── Loading ──────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0f0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "2px solid rgba(201,162,39,.3)", borderTopColor: "#C9A227", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 1rem" }} />
        <p style={{ color: "rgba(255,255,255,.4)", fontSize: ".9rem" }}>Loading quiz…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Error ────────────────────────────────────────────────
  if (error && !submitted) return (
    <div style={{ minHeight: "100vh", background: "#0f0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ background: "#1a0a0a", border: "1px solid rgba(239,68,68,.3)", borderRadius: 20, padding: "2.5rem 2rem", maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
          {error.startsWith("⏳") ? "⏳" : error.startsWith("🔒") ? "🔒" : "⚠️"}
        </div>
        <h2 style={{ color: "#fff", fontWeight: 700, marginBottom: ".75rem", fontSize: "1.1rem" }}>Quiz Unavailable</h2>
        <p style={{ color: "rgba(255,255,255,.45)", fontSize: ".88rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          {error.replace(/^[⏳🔒⚠️]\s*/, "")}
        </p>
        <button
          onClick={() => navigate("/student")}
          style={{ padding: ".75rem 2rem", background: "#C9A227", color: "#1a0505", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: ".9rem" }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  // ── Result ───────────────────────────────────────────────
  if (submitted && result) {
    const score    = result.score ?? 0;
    const total    = result.total ?? questions.length;
    const percent  = total > 0 ? Math.round((score / total) * 100) : 0;
    const grade    = percent >= 90 ? "A" : percent >= 80 ? "B" : percent >= 70 ? "C" : percent >= 60 ? "D" : "F";
    const passed   = percent >= 50;
    const attendance = result.attendance || "present";
    const game     = result.game;
    const detailedAnswers = result.answers || [];

    return (
      <div style={{ minHeight: "100vh", background: "#0f0a0a", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <style>{`
          @keyframes pop{0%{transform:scale(.7);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        `}</style>

        {/* Header */}
        <div style={{ background: "rgba(255,255,255,.04)", borderBottom: "1px solid rgba(255,255,255,.08)", padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <button onClick={() => navigate("/student")} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)", borderRadius: 8, padding: ".4rem .9rem", cursor: "pointer", fontSize: ".82rem" }}>
            ← Dashboard
          </button>
          <span style={{ color: "rgba(255,255,255,.4)", fontSize: ".9rem" }}>{quiz?.title}</span>
        </div>

        <div style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem 1.5rem" }}>

          {/* Grade circle */}
          <div style={{ textAlign: "center", marginBottom: "2rem", animation: "fadeUp .5s ease both" }}>
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              background: passed ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.12)",
              border: `2px solid ${passed ? "rgba(16,185,129,.4)" : "rgba(239,68,68,.4)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1rem",
              animation: "pop .6s cubic-bezier(.34,1.56,.64,1) both"
            }}>
              <span style={{ fontSize: "2.2rem", fontWeight: 900, color: passed ? "#34d399" : "#f87171" }}>{grade}</span>
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: ".4rem" }}>
              {passed ? "🎉 Quiz Complete!" : "Quiz Submitted"}
            </h2>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: ".9rem" }}>
              {passed ? "Great job! Keep it up." : "Keep practicing — you'll get it next time!"}
            </p>
          </div>

          {/* Score cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem", animation: "fadeUp .5s .1s ease both" }}>
            {[
              { label: "Score",      value: `${score}/${total}`,    color: "#fff" },
              { label: "Percentage", value: `${percent}%`,           color: passed ? "#34d399" : "#f87171" },
              { label: "Attendance", value: attendance,              color: attendance === "present" ? "#34d399" : "#fbbf24" },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "1rem", textAlign: "center" }}>
                <p style={{ fontSize: ".68rem", color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: ".5rem" }}>{s.label}</p>
                <p style={{ fontSize: "1.4rem", fontWeight: 800, color: s.color, textTransform: "capitalize" }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Gamification card */}
          {game && (
            <div style={{
              background: "rgba(201,162,39,.08)", border: "1px solid rgba(201,162,39,.2)",
              borderRadius: 14, padding: "1.2rem 1.4rem", marginBottom: "1.5rem",
              animation: "fadeUp .5s .15s ease both"
            }}>
              <p style={{ fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".1em", color: "rgba(201,162,39,.7)", marginBottom: ".9rem" }}>
                🏆 Gamification Update
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".6rem" }}>
                {[
                  { label: "Points Earned",  value: `+${game.pointsEarned}`,          color: "#C9A227" },
                  { label: "Streak Bonus",   value: game.streakBonus > 0 ? `+${game.streakBonus}` : "—", color: game.streakBonus > 0 ? "#f59e0b" : "rgba(255,255,255,.3)" },
                  { label: "Total Points",   value: game.totalPoints.toLocaleString(), color: "#fff" },
                  { label: "Current Streak", value: `🔥 ${game.streak} days`,          color: "#f87171" },
                  { label: "Tier",           value: game.tier,                         color: "#a78bfa" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".4rem 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                    <span style={{ fontSize: ".78rem", color: "rgba(255,255,255,.4)" }}>{item.label}</span>
                    <span style={{ fontSize: ".88rem", fontWeight: 700, color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
              {game.newBadges && game.newBadges.length > 0 && (
                <div style={{ marginTop: ".9rem", paddingTop: ".9rem", borderTop: "1px solid rgba(255,255,255,.08)" }}>
                  <p style={{ fontSize: ".7rem", color: "rgba(201,162,39,.7)", marginBottom: ".5rem" }}>🎖 New Badges Earned!</p>
                  <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                    {game.newBadges.map((b, i) => (
                      <span key={i} style={{ padding: ".25rem .7rem", borderRadius: 8, background: "rgba(201,162,39,.15)", color: "#C9A227", fontSize: ".75rem", fontWeight: 600 }}>
                        {b.badges?.name || "Badge"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Answer review */}
          {detailedAnswers.length > 0 && (
            <div style={{ animation: "fadeUp .5s .2s ease both" }}>
              <h3 style={{ fontSize: ".9rem", fontWeight: 700, marginBottom: "1rem", color: "rgba(255,255,255,.7)" }}>
                Answer Review
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                {detailedAnswers.map((a, i) => (
                  <div key={i} style={{
                    background: a.isCorrect ? "rgba(16,185,129,.06)" : "rgba(239,68,68,.06)",
                    border: `1px solid ${a.isCorrect ? "rgba(16,185,129,.2)" : "rgba(239,68,68,.15)"}`,
                    borderRadius: 12, padding: "1rem 1.2rem"
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: ".65rem", marginBottom: ".6rem" }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        background: a.isCorrect ? "rgba(16,185,129,.2)" : "rgba(239,68,68,.15)",
                        color: a.isCorrect ? "#34d399" : "#f87171",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: ".7rem", fontWeight: 800
                      }}>
                        {a.isCorrect ? "✓" : "✗"}
                      </span>
                      <p style={{ fontSize: ".85rem", color: "rgba(255,255,255,.8)", lineHeight: 1.5, flex: 1 }}>
                        {a.questionText || `Question ${i + 1}`}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", paddingLeft: "1.85rem", fontSize: ".75rem" }}>
                      <span style={{ color: "rgba(255,255,255,.35)" }}>
                        Your answer: <strong style={{ color: a.isCorrect ? "#34d399" : "#f87171" }}>{a.userAnswer || "—"}</strong>
                      </span>
                      {!a.isCorrect && (
                        <span style={{ color: "rgba(255,255,255,.35)" }}>
                          Correct: <strong style={{ color: "#34d399" }}>{a.correctAnswer}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate("/student")}
            style={{ width: "100%", marginTop: "2rem", padding: ".9rem", background: "#C9A227", color: "#1a0505", border: "none", borderRadius: 12, fontWeight: 800, fontSize: ".95rem", cursor: "pointer" }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Empty quiz ─────────────────────────────────────────────
  if (!loading && quiz && questions.length === 0 && !error) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ color: "rgba(255,255,255,.55)", fontSize: ".95rem", marginBottom: "1.25rem" }}>This quiz has no questions.</p>
          <button
            type="button"
            onClick={() => navigate("/student")}
            style={{ padding: ".75rem 1.5rem", background: "#C9A227", color: "#1a0505", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz UI (flash card: one question, 5s per card) ───────
  const q = questions[currentIndex];
  const timerDanger = secondsLeft <= 2;
  const opts = q ? [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean) : [];

  return (
    <div style={{ minHeight: "100vh", background: "#0f0a0a", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes qpulse{0%,100%{opacity:1}50%{opacity:.72}}
      `}</style>

      {/* Sticky header */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(15,10,10,.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: ".85rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: ".65rem", color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".1em" }}>Flash quiz · {QUESTION_WINDOW_SEC}s per question</p>
            <p style={{ fontSize: ".9rem", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {quiz?.title || `Quiz #${quizId}`}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: ".85rem", flexShrink: 0 }}>
            <span style={{ fontSize: ".72rem", color: "rgba(255,255,255,.38)" }}>
              {currentIndex + 1} / {questions.length}
            </span>
            <div style={{
              fontFamily: "monospace", fontSize: ".95rem", fontWeight: 800, padding: ".45rem .95rem",
              borderRadius: 10, border: `1px solid ${timerDanger ? "rgba(239,68,68,.55)" : "rgba(201,162,39,.35)"}`,
              background: timerDanger ? "rgba(239,68,68,.14)" : "rgba(201,162,39,.1)",
              color: timerDanger ? "#f87171" : "#C9A227",
              animation: timerDanger ? "qpulse .85s ease infinite" : "none",
              minWidth: 52,
              textAlign: "center",
            }}>
              {secondsLeft}s
            </div>
          </div>
        </div>
        <div style={{ height: 3, background: "rgba(255,255,255,.05)" }}>
          <div style={{ height: "100%", background: "#C9A227", transition: "width .35s ease", width: `${progressPct}%` }} />
        </div>
      </header>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1.5rem 3rem" }}>
        {q && (
          <div style={{
            background: "rgba(255,255,255,.04)",
            border: `1px solid ${timerDanger ? "rgba(239,68,68,.22)" : "rgba(255,255,255,.1)"}`,
            borderRadius: 20,
            padding: "1.75rem 1.6rem",
            boxShadow: "0 24px 48px rgba(0,0,0,.35)",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.35rem" }}>
              <span style={{
                width: 36, height: 36, borderRadius: 10, background: "rgba(201,162,39,.15)", color: "#C9A227",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".8rem", fontWeight: 800, flexShrink: 0,
              }}>
                {currentIndex + 1}
              </span>
              <p style={{ fontSize: "1rem", color: "rgba(255,255,255,.92)", lineHeight: 1.65, fontWeight: 500 }}>
                {q.question_text}
              </p>
            </div>

            <p style={{ fontSize: ".72rem", color: "rgba(255,255,255,.35)", marginBottom: ".9rem" }}>
              Answer within {QUESTION_WINDOW_SEC} seconds. When time runs out, this question is skipped and you cannot go back.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: ".55rem" }}>
              {opts.map((opt, oi) => {
                const letter = optLabels[oi];
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={submitting}
                    onClick={() => pickAnswer(q.id, letter)}
                    style={{
                      display: "flex", alignItems: "center", gap: ".85rem",
                      padding: ".85rem 1rem", borderRadius: 12,
                      border: "1px solid rgba(255,255,255,.1)",
                      background: "rgba(255,255,255,.03)",
                      color: "rgba(255,255,255,.88)",
                      cursor: submitting ? "not-allowed" : "pointer",
                      opacity: submitting ? 0.55 : 1,
                      textAlign: "left",
                      transition: "border-color .15s, background .15s",
                      width: "100%",
                    }}
                  >
                    <span style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: ".78rem", fontWeight: 800,
                      background: "rgba(201,162,39,.2)",
                      color: "#C9A227",
                    }}>
                      {letter}
                    </span>
                    <span style={{ fontSize: ".9rem" }}>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {submitting && (
          <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: ".85rem", color: "rgba(255,255,255,.45)", display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem" }}>
            <span style={{ width: 14, height: 14, border: "2px solid rgba(201,162,39,.25)", borderTopColor: "#C9A227", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
            Submitting your quiz…
          </p>
        )}
      </main>
    </div>
  );
}

export default QuizPage;