import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout, getLeaderboard } from "../services/api";

function StudentDashboard() {
  const [user, setUser]             = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbType, setLbType]         = useState("overall");
  const [lbLoading, setLbLoading]   = useState(false);
  const [quizId, setQuizId]         = useState("");
  const [quizError, setQuizError]   = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const u = getUser();
    if (!u) { navigate("/"); return; }
    if (u.role !== "student") { navigate("/teacher"); return; }
    setUser(u);
  }, [navigate]);

  useEffect(() => {
    setLbLoading(true);
    getLeaderboard(lbType)
      .then(setLeaderboard)
      .catch(() => setLeaderboard([]))
      .finally(() => setLbLoading(false));
  }, [lbType]);

  const handleLogout = () => { logout(); navigate("/"); };

  const submitQuiz = async () => {
  const res = await fetch("/api/quiz/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ quizId, answers })
  });

  const data = await res.json();

  alert(`Score: ${data.score}/${data.total}\nAttendance: ${data.attendance}`);
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4A0404] to-[#800000] flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-[#FFD700] mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-white text-xl">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4A0404] to-[#800000] flex items-center justify-center px-4">
        <div className="bg-white/95 p-8 rounded-3xl shadow-2xl border-2 border-[#FFD700] text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleLogout}
            className="text-xs text-white/50 hover:text-white/90 transition px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/25"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-1">
            Welcome back 👋
          </h1>
          <p className="text-white/40 text-sm">Ready to challenge yourself today?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Take Quiz Card */}
          <div className="bg-[#1a0a0a] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#C9A227]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 13.5v-7l6 3.5-6 3.5z"/>
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-white">Take a Quiz</h2>
                <p className="text-xs text-white/40">Enter your quiz ID to begin</p>
              </div>
            </div>
            <input
              type="text"
              value={quizId}
              onChange={e => { setQuizId(e.target.value); setQuizError(""); }}
              placeholder="Paste Quiz ID here..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#C9A227]/50 focus:bg-white/8 transition mb-3"
            />
            {quizError && <p className="text-red-400 text-xs mb-3">{quizError}</p>}
            <button
              onClick={handleTakeQuiz}
              className="w-full py-2.5 bg-[#C9A227] hover:bg-[#b8911f] text-[#1a0505] font-semibold rounded-xl text-sm transition"
            >
              Start Quiz
            </button>
          </div>

          {/* Leaderboard Card */}
          <div className="bg-[#1a0a0a] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8b1a1a]/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#e87070]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.07 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-white">Leaderboard</h2>
                  <p className="text-xs text-white/40">Top performers</p>
                </div>
              </div>
              {/* Type selector */}
              <div className="flex gap-1 text-xs">
                {["daily","weekly","overall"].map(t => (
                  <button
                    key={t}
                    onClick={() => setLbType(t)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition ${lbType === t ? "bg-[#C9A227] text-[#1a0505] font-semibold" : "text-white/40 hover:text-white/70"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {lbLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#C9A227]/30 border-t-[#C9A227] rounded-full animate-spin" />
              </div>
            ) : leaderboard.length === 0 ? (
              <p className="text-center text-white/30 text-sm py-8">No data available</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.slice(0, 8).map((u, i) => (
                  <div
                    key={u.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${
                      i === 0 ? "bg-[#C9A227]/10 border-[#C9A227]/30" :
                      i === 1 ? "bg-gray-500/10 border-gray-500/20" :
                      i === 2 ? "bg-[#b96a30]/10 border-[#b96a30]/20" :
                      "bg-white/3 border-white/5"
                    }`}
                  >
                    <span className={`text-xs font-bold w-5 text-center ${
                      i === 0 ? "text-[#C9A227]" :
                      i === 1 ? "text-gray-400" :
                      i === 2 ? "text-[#b96a30]" :
                      "text-white/30"
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/70 truncate font-mono">{u.id}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${tierBg(u.tier)} ${tierColor(u.tier)}`}>
                      {u.tier || "—"}
                    </span>
                    <span className="text-sm font-bold text-white">{u.points ?? 0}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;