import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuiz, submitQuiz, getUser } from "../services/api";

function QuizPage() {
  const { quizId } = useParams();
  const navigate   = useNavigate();

  const [quiz,      setQuiz]      = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers,   setAnswers]   = useState({});
  const [timeLeft,  setTimeLeft]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result,    setResult]    = useState(null);
  const [submitting,setSubmitting]= useState(false);

  // Load quiz
  useEffect(() => {
    const user = getUser();
    if (!user) { navigate("/"); return; }

    setLoading(true);
    getQuiz(quizId)
      .then(data => {
        setQuiz(data.quiz);
        setQuestions(data.questions || []);
        if (data.quiz?.duration) {
          setTimeLeft(data.quiz.duration * 60);
        }
      })
      .catch(err => setError(err.message || "Could not load quiz."))
      .finally(() => setLoading(false));
  }, [quizId, navigate]);

  // Timer
  const handleSubmit = useCallback(async () => {
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      const data = await submitQuiz(quizId, answers);
      setResult(data);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }, [quizId, answers, submitting, submitted]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return;
    if (timeLeft === 0) { handleSubmit(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, submitted, handleSubmit]);

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const pct = questions.length
    ? Math.round((Object.keys(answers).length / questions.length) * 100)
    : 0;

  const optLabels = ["A", "B", "C", "D"];

  // ── Loading ──────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#0f0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#C9A227]/30 border-t-[#C9A227] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/50 text-sm">Loading quiz…</p>
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────────────
  if (error) return (
    <div className="min-h-screen bg-[#0f0a0a] flex items-center justify-center px-4">
      <div className="bg-[#1a0a0a] border border-red-900/40 rounded-2xl p-8 max-w-md text-center">
        <div className="w-14 h-14 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
        <h2 className="text-white font-semibold mb-2">Quiz Unavailable</h2>
        <p className="text-white/50 text-sm mb-6">{error}</p>
        <button onClick={() => navigate("/student")} className="px-6 py-2.5 bg-[#C9A227] text-[#1a0505] font-semibold rounded-xl text-sm">
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  // ── Result ───────────────────────────────────────────────
  if (submitted && result) {
    const score   = result.score ?? 0;
    const total   = result.total ?? questions.length;
    const percent = total > 0 ? Math.round((score / total) * 100) : 0;
    const grade   = percent >= 90 ? "A" : percent >= 80 ? "B" : percent >= 70 ? "C" : percent >= 60 ? "D" : "F";
    const attendance = result.attendance || "—";

    return (
      <div className="min-h-screen bg-[#0f0a0a] flex items-center justify-center px-4">
        <div className="bg-[#1a0a0a] border border-white/10 rounded-2xl p-10 max-w-md w-full text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl font-bold ${
            percent >= 80 ? "bg-green-900/30 text-green-400 border border-green-500/30" :
            percent >= 60 ? "bg-yellow-900/30 text-yellow-400 border border-yellow-500/30" :
            "bg-red-900/30 text-red-400 border border-red-500/30"
          }`}>
            {grade}
          </div>
          <h2 className="text-white text-2xl font-bold mb-1">Quiz Complete!</h2>
          <p className="text-white/40 text-sm mb-8">Here are your results</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Score",       value: `${score}/${total}` },
              { label: "Percentage",  value: `${percent}%` },
              { label: "Attendance",  value: attendance },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3 border border-white/8">
                <p className="text-xs text-white/30 mb-1">{s.label}</p>
                <p className="text-lg font-bold text-white capitalize">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Points gained */}
          {result.game && (
            <div className="bg-[#C9A227]/10 border border-[#C9A227]/20 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs text-[#C9A227]/70 uppercase tracking-wider mb-2">Gamification</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-white/50">Points Earned</span>
                <span className="text-[#C9A227] font-semibold">+{result.game.pointsEarned}</span>
                <span className="text-white/50">Total Points</span>
                <span className="text-white font-semibold">{result.game.totalPoints}</span>
                <span className="text-white/50">Streak</span>
                <span className="text-white font-semibold">🔥 {result.game.streak}</span>
                <span className="text-white/50">Tier</span>
                <span className="text-white font-semibold">{result.game.tier}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => navigate("/student")}
            className="w-full py-3 bg-[#C9A227] hover:bg-[#b8911f] text-[#1a0505] font-semibold rounded-xl text-sm transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz UI ──────────────────────────────────────────────
  const timerDanger = timeLeft !== null && timeLeft < 60;

  return (
    <div className="min-h-screen bg-[#0f0a0a] text-white">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 bg-[#0f0a0a]/90 backdrop-blur border-b border-white/8">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest">Quiz</p>
            <p className="text-sm font-semibold text-white truncate max-w-xs">{quiz?.title || `#${quizId}`}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Progress */}
            <div className="text-xs text-white/40">
              {Object.keys(answers).length}/{questions.length} answered
            </div>
            {/* Timer */}
            {timeLeft !== null && (
              <div className={`font-mono text-sm font-bold px-3 py-1.5 rounded-lg border ${
                timerDanger
                  ? "bg-red-900/30 border-red-500/40 text-red-400 animate-pulse"
                  : "bg-white/5 border-white/10 text-white"
              }`}>
                ⏱ {fmt(timeLeft)}
              </div>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-white/5">
          <div
            className="h-full bg-[#C9A227] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {questions.map((q, qi) => {
            const opts = [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);
            const selected = answers[q.id];

            return (
              <div key={q.id} className="bg-[#1a0a0a] border border-white/8 rounded-2xl p-6">
                <div className="flex items-start gap-4 mb-5">
                  <span className="flex-shrink-0 w-7 h-7 bg-[#C9A227]/15 rounded-lg flex items-center justify-center text-xs font-bold text-[#C9A227]">
                    {qi + 1}
                  </span>
                  <p className="text-sm text-white/90 leading-relaxed pt-0.5">{q.question_text}</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {opts.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: optLabels[oi] }))}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition ${
                        selected === optLabels[oi]
                          ? "bg-[#C9A227]/15 border-[#C9A227]/50 text-white"
                          : "bg-white/3 border-white/8 text-white/60 hover:border-white/20 hover:text-white/80"
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-xs font-bold transition ${
                        selected === optLabels[oi]
                          ? "bg-[#C9A227] text-[#1a0505]"
                          : "bg-white/8 text-white/40"
                      }`}>
                        {optLabels[oi]}
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <div className="mt-8 bg-[#1a0a0a] border border-white/8 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/70 font-medium">
              {Object.keys(answers).length === questions.length
                ? "All questions answered ✓"
                : `${questions.length - Object.keys(answers).length} question(s) unanswered`}
            </p>
            <p className="text-xs text-white/30 mt-0.5">Unanswered questions will be marked incorrect</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 bg-[#C9A227] hover:bg-[#b8911f] text-[#1a0505] font-bold rounded-xl text-sm transition disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Quiz"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default QuizPage;