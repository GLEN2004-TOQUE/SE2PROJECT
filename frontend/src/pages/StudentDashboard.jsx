import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const [fullName, setFullName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loginTime, setLoginTime] = useState("");
  const [activeView, setActiveView] = useState("home");
  const navigate = useNavigate();

  useEffect(() => {
    // Mock profile data
    setFullName("Maria Santos");
    const now = new Date();
    let h = now.getHours(),
      m = now.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    setLoginTime(`Logged in at ${h}:${String(m).padStart(2, "0")} ${ampm}`);
    setLoading(false);
  }, [navigate]);

  const handleLogout = async () => {
    navigate("/");
  };

  const updateProfile = (newName, newPic) => {
    if (newName) setFullName(newName);
    if (newPic) setProfilePic(newPic);
  };

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4A0404] to-[#800000] flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-[#FFD700] mx-auto mb-4"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
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
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#FFD700] text-[#4A0404] rounded-xl font-semibold hover:bg-[#E5C100] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      id: "home",
      label: "Dashboard",
      icon: <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />,
    },
    {
      id: "quiz",
      label: "Take Quiz",
      icon: (
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 13.5v-7l6 3.5-6 3.5z" />
      ),
    },
    {
      id: "badges",
      label: "Badges",
      icon: (
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.07 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
      ),
    },
    {
      id: "leaderboard",
      label: "Leaderboard",
      icon: (
        <path d="M7 14H2v5h5v-5zm5-11H7v16h5V3zm5 7h-5v9h5v-9zm3-4v13h-2V6h2z" />
      ),
    },
    {
      id: "classmates",
      label: "Classmates",
      icon: (
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-1 .05 1.16.84 2 1.87 2 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: (
        <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z" />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#1A0000] flex flex-col">
      {/* TOP BAR */}
      <div className="bg-[#2A0000] border-b border-[#6B0000] px-5 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#C9A84C] rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 fill-[#2A0000]" viewBox="0 0 24 24">
              <path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm7 3a4 4 0 100 8 4 4 0 000-8zm0 10c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <span className="text-[#C9A84C] text-sm font-medium tracking-wide">
            QuizGen &nbsp;|&nbsp; Student Portal
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[#E2C17A] text-sm font-medium">{fullName}</p>
            <p className="text-[#B08040] text-xs">{loginTime}</p>
          </div>
          <div className="w-8 h-8 bg-[#C9A84C] rounded-full flex items-center justify-center text-[#2A0000] text-xs font-semibold border-2 border-[#E2C17A]">
            {initials}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <div className="w-44 bg-[#2E0000] border-r border-[#5A0000] flex flex-col flex-shrink-0">
          <nav className="flex flex-col gap-0.5 pt-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-all border-l-[3px] ${
                  activeView === item.id
                    ? "bg-[#C9A84C]/15 text-[#C9A84C] border-[#C9A84C]"
                    : "text-[#B08040] border-transparent hover:bg-[#C9A84C]/10 hover:text-[#E2C17A]"
                }`}
              >
                <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                  {item.icon}
                </svg>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="h-px bg-[#5A0000] mx-4 my-2" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-4 py-2.5 text-[#8A4040] text-sm hover:text-[#C06060] transition-colors mt-auto mb-4"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
            </svg>
            Logout
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto bg-[#3D0000] p-5">
          {activeView === "home" && (
            <HomeView fullName={fullName} setActiveView={setActiveView} />
          )}
          {activeView === "quiz" && <QuizView />}
          {activeView === "badges" && <BadgesView />}
          {activeView === "leaderboard" && <LeaderboardView />}
          {activeView === "classmates" && <ClassmatesView />}
          {activeView === "profile" && (
            <ProfileView
              fullName={fullName}
              initials={initials}
              profilePic={profilePic}
              updateProfile={updateProfile}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── HOME VIEW (with graphs) ─── */
function HomeView({ fullName, setActiveView }) {
  const stats = [
    { val: "87", label: "Total Points" },
    { val: "12", label: "Quizzes Taken" },
    { val: "5", label: "Badges Earned" },
    { val: "#4", label: "Class Rank" },
  ];
  const actions = [
    {
      id: "quiz",
      label: "Take Quiz",
      sub: "3 pending",
      icon: (
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 13.5v-7l6 3.5-6 3.5z" />
      ),
    },
    {
      id: "badges",
      label: "My Badges",
      sub: "5 earned",
      icon: (
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.07 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
      ),
    },
    {
      id: "leaderboard",
      label: "Leaderboard",
      sub: "You're #4",
      icon: (
        <path d="M7 14H2v5h5v-5zm5-11H7v16h5V3zm5 7h-5v9h5v-9zm3-4v13h-2V6h2z" />
      ),
    },
  ];

  // Mock data for graphs
  const subjectScores = [
    { subject: "Math", score: 85 },
    { subject: "Science", score: 78 },
    { subject: "English", score: 92 },
    { subject: "History", score: 68 },
    { subject: "Art", score: 95 },
  ];

  const weeklyScores = [72, 78, 85, 82, 88, 91, 87];

  const scoreDistribution = {
    Excellent: 4, // > 90%
    Good: 5, // 70-90%
    NeedsImprovement: 3, // < 70%
  };

  const totalQuizzes = 12;
  const excellentCount = 4;
  const goodCount = 5;
  const poorCount = 3;

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[#C9A84C] text-xl font-medium">
          Good morning, {fullName.split(" ")[0]} 👋
        </h2>
        <p className="text-[#B08040] text-xs mt-1">
          Here's your academic snapshot for today
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2.5 mb-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-[#2A0000] rounded-xl border border-[#5A0000] p-3 text-center"
          >
            <p className="text-[#C9A84C] text-2xl font-medium">{s.val}</p>
            <p className="text-[#B08040] text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <p className="text-[#E2C17A] text-xs font-medium tracking-widest uppercase mb-2.5">
        Quick actions
      </p>
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {actions.map((a) => (
          <button
            key={a.id}
            onClick={() => setActiveView(a.id)}
            className="bg-[#2A0000] rounded-xl border border-[#5A0000] p-4 text-center hover:border-[#C9A84C] hover:bg-[#340000] transition-all group"
          >
            <div className="w-9 h-9 bg-[#C9A84C]/15 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-[#C9A84C]/25 transition-colors">
              <svg className="w-5 h-5 fill-[#C9A84C]" viewBox="0 0 24 24">
                {a.icon}
              </svg>
            </div>
            <p className="text-[#E2C17A] text-xs font-medium">{a.label}</p>
            <p className="text-[#8A6030] text-xs mt-0.5">{a.sub}</p>
          </button>
        ))}
      </div>

      {/* Graphs Section */}
      <p className="text-[#E2C17A] text-xs font-medium tracking-widest uppercase mb-2.5">
        Performance Analytics
      </p>
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {/* Bar Graph - Subject Performance */}
        <div className="bg-[#2A0000] rounded-xl border border-[#5A0000] p-3">
          <p className="text-[#C9A84C] text-xs font-medium mb-2">
            Subject Scores (%)
          </p>
          <div className="space-y-2">
            {subjectScores.map((item) => (
              <div key={item.subject}>
                <div className="flex justify-between text-[10px] text-[#B08040] mb-0.5">
                  <span>{item.subject}</span>
                  <span>{item.score}%</span>
                </div>
                <div className="h-1.5 bg-[#4A0000] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C9A84C] rounded-full"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Line Graph - Weekly Progress */}
        <div className="bg-[#2A0000] rounded-xl border border-[#5A0000] p-3">
          <p className="text-[#C9A84C] text-xs font-medium mb-2">
            Weekly Quiz Scores
          </p>
          <div className="relative h-24 flex items-end gap-1">
            {weeklyScores.map((score, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center"
                style={{ height: "100%" }}
              >
                <div
                  className="w-full bg-[#C9A84C] rounded-t"
                  style={{ height: `${(score / 100) * 100}%` }}
                />
                <span className="text-[8px] text-[#B08040] mt-1">W{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart - Score Distribution */}
        <div className="bg-[#2A0000] rounded-xl border border-[#5A0000] p-3">
          <p className="text-[#C9A84C] text-xs font-medium mb-2">
            Score Distribution
          </p>
          <div className="flex items-center justify-between">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 32 32" className="w-full h-full transform -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r="15.9"
                  fill="none"
                  stroke="#4A0000"
                  strokeWidth="2"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="15.9"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeDasharray={`${(excellentCount / totalQuizzes) * 100} 100`}
                  strokeDashoffset="0"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="15.9"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeDasharray={`${(goodCount / totalQuizzes) * 100} 100`}
                  strokeDashoffset={`-${(excellentCount / totalQuizzes) * 100}`}
                />
                <circle
                  cx="16"
                  cy="16"
                  r="15.9"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeDasharray={`${(poorCount / totalQuizzes) * 100} 100`}
                  strokeDashoffset={`-${((excellentCount + goodCount) / totalQuizzes) * 100}`}
                />
              </svg>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-[10px] text-[#B08040]">Excellent</span>
                <span className="text-[10px] text-[#C9A84C] ml-1">
                  {excellentCount}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-[10px] text-[#B08040]">Good</span>
                <span className="text-[10px] text-[#C9A84C] ml-1">
                  {goodCount}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-[10px] text-[#B08040]">
                  Needs Improvement
                </span>
                <span className="text-[10px] text-[#C9A84C] ml-1">
                  {poorCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Results Table (unchanged) */}
      <p className="text-[#E2C17A] text-xs font-medium tracking-widest uppercase mb-2.5">
        Recent quiz results
      </p>
      <div className="bg-[#2A0000] rounded-xl border border-[#5A0000] overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#1E0000] border-b border-[#5A0000]">
              <th className="text-[#C9A84C] font-medium text-left px-3 py-2.5">
                Quiz
              </th>
              <th className="text-[#C9A84C] font-medium text-left px-3 py-2.5">
                Subject
              </th>
              <th className="text-[#C9A84C] font-medium text-left px-3 py-2.5">
                Score
              </th>
              <th className="text-[#C9A84C] font-medium text-left px-3 py-2.5">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                name: "Unit 4 – Fractions",
                subject: "Mathematics",
                score: 92,
                date: "Mar 20",
              },
              {
                name: "Ch. 3 Review",
                subject: "Science",
                score: 74,
                date: "Mar 18",
              },
              {
                name: "Vocab Test 6",
                subject: "English",
                score: 88,
                date: "Mar 15",
              },
              {
                name: "History – WWII",
                subject: "History",
                score: 55,
                date: "Mar 12",
              },
            ].map((q, i) => {
              const scoreBadge = (s) => {
                if (s >= 80) return "bg-green-900/40 text-green-400";
                if (s >= 60) return "bg-yellow-900/40 text-yellow-400";
                return "bg-red-900/40 text-red-400";
              };
              return (
                <tr
                  key={i}
                  className="border-b border-[#3A0000] last:border-b-0 hover:bg-[#C9A84C]/5 transition-colors"
                >
                  <td className="text-[#C8B08A] px-3 py-2">{q.name}</td>
                  <td className="text-[#C8B08A] px-3 py-2">{q.subject}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full ${scoreBadge(q.score)}`}>
                      {q.score}%
                    </span>
                  </td>
                  <td className="text-[#C8B08A] px-3 py-2">{q.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── QUIZ VIEW (unchanged) ─── */
const QUESTIONS = [
  {
    q: "What is ¾ expressed as a decimal?",
    opts: ["0.25", "0.75", "0.50", "1.25"],
    ans: 1,
  },
  {
    q: "What is 0.5 expressed as a fraction?",
    opts: ["¼", "⅓", "½", "⅔"],
    ans: 2,
  },
  {
    q: "Which is greater: 0.8 or ⅔?",
    opts: ["⅔", "0.8", "They are equal", "Cannot tell"],
    ans: 1,
  },
  {
    q: "What is 1¼ as a decimal?",
    opts: ["1.2", "1.25", "1.4", "1.5"],
    ans: 1,
  },
  {
    q: "Convert 0.125 to a fraction in lowest terms.",
    opts: ["⅛", "¼", "⅙", "1/10"],
    ans: 0,
  },
];

function QuizView() {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = QUESTIONS[qIdx];
  const pct = Math.round(((answered ? qIdx + 1 : qIdx) / QUESTIONS.length) * 100);

  const handleNext = () => {
    if (selected === null || answered) return;
    setAnswered(true);
    const correct = selected === q.ans;
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (qIdx < QUESTIONS.length - 1) {
        setQIdx((i) => i + 1);
        setSelected(null);
        setAnswered(false);
      } else {
        setDone(true);
      }
    }, 900);
  };

  const handleRetry = () => {
    setQIdx(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setDone(false);
  };

  const optClass = (i) => {
    const base =
      "w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ";
    if (!answered) {
      return (
        base +
        (selected === i
          ? "border-[#C9A84C] bg-[#C9A84C]/15 text-[#C9A84C]"
          : "border-[#5A0000] bg-[#350000] text-[#C8B08A] hover:border-[#C9A84C] hover:text-[#E2C17A]")
      );
    }
    if (i === q.ans)
      return base + "border-green-500 bg-green-900/20 text-green-400";
    if (i === selected)
      return base + "border-red-500 bg-red-900/10 text-red-400";
    return base + "border-[#5A0000] bg-[#350000] text-[#6A5030]";
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[#C9A84C] text-xl font-medium">Take a Quiz</h2>
        <p className="text-[#B08040] text-xs mt-1">
          Mathematics — Unit 5: Fractions &amp; Decimals
        </p>
      </div>
      <div className="bg-[#2A0000] rounded-xl border border-[#5A0000] p-5">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[#C9A84C] font-medium text-sm">
            Unit 5: Fractions &amp; Decimals
          </span>
          <span className="text-[#8A6030] text-xs">
            {done
              ? "Quiz complete!"
              : `Question ${qIdx + 1} of ${QUESTIONS.length}`}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-[#4A0000] rounded-full mb-5">
          <div
            className="h-full bg-[#C9A84C] rounded-full transition-all duration-300"
            style={{ width: done ? "100%" : `${pct}%` }}
          />
        </div>

        {!done ? (
          <>
            <p className="text-[#E2C17A] font-medium text-sm mb-4 leading-relaxed">
              {q.q}
            </p>
            <div className="flex flex-col gap-2 mb-5">
              {q.opts.map((opt, i) => (
                <button
                  key={i}
                  className={optClass(i)}
                  onClick={() => {
                    if (!answered) setSelected(i);
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  if (qIdx < QUESTIONS.length - 1) {
                    setQIdx((i) => i + 1);
                    setSelected(null);
                    setAnswered(false);
                  }
                }}
                className="px-3 py-2 text-[#8A6030] text-xs border border-[#5A0000] rounded-lg hover:text-[#C8B08A] transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                disabled={selected === null}
                className="px-5 py-2 bg-[#C9A84C] text-[#2A0000] text-xs font-semibold rounded-lg hover:bg-[#E2C17A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {qIdx < QUESTIONS.length - 1 ? "Next →" : "Finish"}
              </button>
            </div>
          </>
        ) : (
          <div className="bg-[#1E0000] border border-[#5A0000] rounded-xl p-6 text-center mt-2">
            <p className="text-[#C9A84C] text-4xl font-medium mb-2">
              {score} / {QUESTIONS.length}
            </p>
            <p className="text-[#B08040] text-sm mb-4">
              You scored {Math.round((score / QUESTIONS.length) * 100)}% —{" "}
              {score >= 4
                ? "Great job! 🎉"
                : score >= 3
                ? "Keep practicing! 💪"
                : "Try again! 📚"}
            </p>
            <button
              onClick={handleRetry}
              className="px-5 py-2 bg-[#C9A84C] text-[#2A0000] text-xs font-semibold rounded-lg hover:bg-[#E2C17A] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── BADGES VIEW (with ranking system) ─── */
const BADGES = [
  {
    name: "First Star",
    pts: 10,
    earned: true,
    icon: (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.07 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
    ),
  },
  {
    name: "Quick Learner",
    pts: 15,
    earned: true,
    icon: (
      <path d="M7 20h2V8h3L8 4 4 8h3v12zm13-4h-3V4h-2v12h-3l4 4 4-4z" />
    ),
  },
  {
    name: "Consistent",
    pts: 20,
    earned: true,
    icon: (
      <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
    ),
  },
  {
    name: "Quiz Shield",
    pts: 25,
    earned: true,
    icon: (
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    ),
  },
  {
    name: "Top Student",
    pts: 17,
    earned: true,
    icon: (
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
    ),
  },
  {
    name: "Perfect Score",
    pts: 30,
    earned: false,
    icon: (
      <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    ),
  },
  {
    name: "Speed Runner",
    pts: 20,
    earned: false,
    icon: (
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 13.5v-7l6 3.5-6 3.5z" />
    ),
  },
  {
    name: "Helpful Peer",
    pts: 15,
    earned: false,
    icon: (
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-1 .05 1.16.84 2 1.87 2 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    ),
  },
  {
    name: "Champion",
    pts: 50,
    earned: false,
    icon: (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.07 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
    ),
  },
];

function BadgesView() {
  const totalPts = BADGES.filter((b) => b.earned).reduce(
    (acc, b) => acc + b.pts,
    0
  );
  const earnedCount = BADGES.filter((b) => b.earned).length;

  // Ranking system (similar to Mobile Legends)
  const ranks = [
    { name: "Beginner", minPoints: 0, icon: "⭐" },
    { name: "Elite", minPoints: 50, icon: "🌟" },
    { name: "Master", minPoints: 100, icon: "🏆" },
    { name: "Grandmaster", minPoints: 200, icon: "👑" },
    { name: "Legend", minPoints: 300, icon: "🔥" },
  ];
  const currentRank = [...ranks].reverse().find((r) => totalPts >= r.minPoints) || ranks[0];
  const nextRank = ranks[ranks.findIndex((r) => r.name === currentRank.name) + 1];
  const pointsToNext = nextRank ? nextRank.minPoints - totalPts : 0;
  const progressPercent = nextRank
    ? ((totalPts - currentRank.minPoints) /
        (nextRank.minPoints - currentRank.minPoints)) *
      100
    : 100;

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[#C9A84C] text-xl font-medium">My Badges</h2>
        <p className="text-[#B08040] text-xs mt-1">
          Your earned achievements &amp; points
        </p>
      </div>

      {/* Rank Card */}
      <div className="bg-[#2A0000] border border-[#C9A84C] rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#E2C17A] text-xs uppercase tracking-wider">
              Current Rank
            </p>
            <p className="text-[#C9A84C] text-2xl font-bold">
              {currentRank.name} {currentRank.icon}
            </p>
            <p className="text-[#B08040] text-xs mt-1">
              Total Points: {totalPts}
            </p>
          </div>
          {nextRank && (
            <div className="text-right">
              <p className="text-[#E2C17A] text-xs uppercase tracking-wider">
                Next Rank
              </p>
              <p className="text-[#C9A84C] text-lg font-semibold">
                {nextRank.name} {nextRank.icon}
              </p>
              <p className="text-[#B08040] text-xs mt-1">
                {pointsToNext} points to go
              </p>
            </div>
          )}
        </div>
        {nextRank && (
          <div className="mt-3">
            <div className="h-1.5 bg-[#4A0000] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C9A84C] rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Points summary (unchanged) */}
      <div className="bg-[#2A0000] border border-[#C9A84C] rounded-xl p-4 flex items-center justify-center gap-6 mb-5">
        <div className="text-center">
          <p className="text-[#C9A84C] text-3xl font-medium">{totalPts}</p>
          <p className="text-[#8A6030] text-xs mt-0.5">Total badge points</p>
        </div>
        <div className="w-px h-10 bg-[#5A0000]" />
        <div className="text-center">
          <p className="text-[#C9A84C] text-xl font-medium">
            {earnedCount} / {BADGES.length}
          </p>
          <p className="text-[#8A6030] text-xs mt-0.5">Badges earned</p>
        </div>
      </div>

      {/* Badge grid (unchanged) */}
      <div className="grid grid-cols-3 gap-3">
        {BADGES.map((b) => (
          <div
            key={b.name}
            className={`bg-[#2A0000] rounded-xl border p-4 text-center ${
              b.earned ? "border-[#C9A84C]" : "border-[#5A0000]"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2.5 ${
                b.earned ? "bg-[#C9A84C]/20" : "bg-[#5A4020]/20"
              }`}
            >
              <svg
                className={`w-6 h-6 ${
                  b.earned ? "fill-[#C9A84C]" : "fill-[#6A5030]"
                }`}
                viewBox="0 0 24 24"
              >
                {b.icon}
              </svg>
            </div>
            <p
              className={`text-xs font-medium ${
                b.earned ? "text-[#E2C17A]" : "text-[#6A5030]"
              }`}
            >
              {b.name}
            </p>
            <p className="text-[#8A6030] text-xs mt-0.5">+{b.pts} pts</p>
            <span
              className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full ${
                b.earned
                  ? "bg-[#C9A84C]/20 text-[#C9A84C]"
                  : "bg-[#5A4020]/15 text-[#6A5030]"
              }`}
            >
              {b.earned ? "Earned" : "Locked"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── LEADERBOARD VIEW (with line graph) ─── */
const LB_DATA = [
  { rank: 1, initials: "JR", name: "Juan Reyes", pts: 142, me: false },
  { rank: 2, initials: "AL", name: "Ana Lim", pts: 128, me: false },
  { rank: 3, initials: "RC", name: "Rico Cruz", pts: 110, me: false },
  { rank: 4, initials: "MS", name: "Maria Santos", pts: 87, me: true },
  { rank: 5, initials: "DG", name: "Diana Go", pts: 80, me: false },
  { rank: 6, initials: "MR", name: "Marco Ramos", pts: 75, me: false },
  { rank: 7, initials: "LT", name: "Lea Tan", pts: 68, me: false },
  { rank: 8, initials: "BM", name: "Ben Malay", pts: 60, me: false },
];

// Mock points trend for top 3 students
const pointsTrend = [
  { week: "W1", Juan: 120, Ana: 110, Rico: 95 },
  { week: "W2", Juan: 128, Ana: 115, Rico: 100 },
  { week: "W3", Juan: 135, Ana: 122, Rico: 105 },
  { week: "W4", Juan: 142, Ana: 128, Rico: 110 },
];

function LeaderboardView() {
  const [filter, setFilter] = useState("All Time");
  const rankColor = (r) =>
    r === 1
      ? "text-yellow-400"
      : r === 2
      ? "text-gray-400"
      : r === 3
      ? "text-amber-600"
      : "text-[#8A6030]";

  // Find max value for scaling
  const maxPoints = Math.max(
    ...pointsTrend.flatMap((w) => [w.Juan, w.Ana, w.Rico])
  );

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[#C9A84C] text-xl font-medium">Leaderboard</h2>
        <p className="text-[#B08040] text-xs mt-1">
          Class ranking by total points
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        {["All Time", "This Week", "This Month"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs border transition-all ${
              filter === f
                ? "bg-[#C9A84C] text-[#2A0000] border-[#C9A84C] font-medium"
                : "border-[#5A0000] text-[#8A6030] hover:text-[#C8B08A]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Line Graph */}
      <div className="bg-[#2A0000] rounded-xl border border-[#5A0000] p-4 mb-5">
        <p className="text-[#C9A84C] text-xs font-medium mb-3">
          Points Trend (Top 3)
        </p>
        <div className="relative h-40">
          <svg viewBox="0 0 500 150" className="w-full h-full">
            {/* Draw grid lines */}
            <line
              x1="40"
              y1="10"
              x2="40"
              y2="140"
              stroke="#5A0000"
              strokeWidth="1"
            />
            <line
              x1="40"
              y1="140"
              x2="480"
              y2="140"
              stroke="#5A0000"
              strokeWidth="1"
            />
            {[0, 30, 60, 90, 120].map((y) => (
              <line
                key={y}
                x1="40"
                y1={140 - (y / maxPoints) * 130}
                x2="480"
                y2={140 - (y / maxPoints) * 130}
                stroke="#3A0000"
                strokeWidth="0.5"
                strokeDasharray="4"
              />
            ))}

            {/* Points for Juan */}
            <polyline
              points={pointsTrend
                .map(
                  (w, i) =>
                    `${40 + i * (440 / (pointsTrend.length - 1))},${
                      140 - (w.Juan / maxPoints) * 130
                    }`
                )
                .join(" ")}
              fill="none"
              stroke="#C9A84C"
              strokeWidth="2"
            />
            {/* Points for Ana */}
            <polyline
              points={pointsTrend
                .map(
                  (w, i) =>
                    `${40 + i * (440 / (pointsTrend.length - 1))},${
                      140 - (w.Ana / maxPoints) * 130
                    }`
                )
                .join(" ")}
              fill="none"
              stroke="#E2C17A"
              strokeWidth="2"
            />
            {/* Points for Rico */}
            <polyline
              points={pointsTrend
                .map(
                  (w, i) =>
                    `${40 + i * (440 / (pointsTrend.length - 1))},${
                      140 - (w.Rico / maxPoints) * 130
                    }`
                )
                .join(" ")}
              fill="none"
              stroke="#B08040"
              strokeWidth="2"
            />

            {/* X-axis labels */}
            {pointsTrend.map((w, i) => (
              <text
                key={i}
                x={40 + i * (440 / (pointsTrend.length - 1))}
                y="155"
                fontSize="8"
                fill="#8A6030"
                textAnchor="middle"
              >
                {w.week}
              </text>
            ))}
            {/* Y-axis labels */}
            {[0, 30, 60, 90, 120].map((y) => (
              <text
                key={y}
                x="30"
                y={140 - (y / maxPoints) * 130 + 3}
                fontSize="8"
                fill="#8A6030"
                textAnchor="end"
              >
                {y}
              </text>
            ))}
          </svg>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-[#C9A84C]" />
              <span className="text-[10px] text-[#B08040]">Juan</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-[#E2C17A]" />
              <span className="text-[10px] text-[#B08040]">Ana</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-[#B08040]" />
              <span className="text-[10px] text-[#B08040]">Rico</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard table (unchanged) */}
      <div className="bg-[#2A0000] rounded-xl border border-[#5A0000] overflow-hidden">
        {LB_DATA.map((row) => (
          <div
            key={row.rank}
            className={`flex items-center gap-3 px-4 py-2.5 border-b border-[#3A0000] last:border-b-0 ${
              row.me ? "bg-[#C9A84C]/8" : "hover:bg-[#C9A84C]/5"
            } transition-colors`}
          >
            <span
              className={`w-5 text-xs font-medium flex-shrink-0 ${rankColor(
                row.rank
              )}`}
            >
              {row.rank}
            </span>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                row.me
                  ? "bg-[#C9A84C] text-[#2A0000]"
                  : "bg-[#5A0000] text-[#C9A84C]"
              }`}
            >
              {row.initials}
            </div>
            <span
              className={`flex-1 text-xs ${
                row.me ? "text-[#E2C17A] font-medium" : "text-[#C8B08A]"
              }`}
            >
              {row.name}
              {row.me ? " (You)" : ""}
            </span>
            <span className="text-[#C9A84C] text-sm font-medium">
              {row.pts} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CLASSMATES VIEW (with modal for bar graph) ─── */
const CLASSMATES = [
  {
    initials: "JR",
    name: "Juan Reyes",
    pts: 142,
    badges: 9,
    rank: 1,
    me: false,
  },
  { initials: "AL", name: "Ana Lim", pts: 128, badges: 8, rank: 2, me: false },
  {
    initials: "RC",
    name: "Rico Cruz",
    pts: 110,
    badges: 7,
    rank: 3,
    me: false,
  },
  {
    initials: "MS",
    name: "Maria Santos",
    pts: 87,
    badges: 5,
    rank: 4,
    me: true,
  },
  { initials: "DG", name: "Diana Go", pts: 80, badges: 5, rank: 5, me: false },
  {
    initials: "MR",
    name: "Marco Ramos",
    pts: 75,
    badges: 4,
    rank: 6,
    me: false,
  },
  { initials: "LT", name: "Lea Tan", pts: 68, badges: 3, rank: 7, me: false },
  { initials: "BM", name: "Ben Malay", pts: 60, badges: 3, rank: 8, me: false },
];

// Mock quiz scores for each student (by subject)
const studentScores = {
  "Juan Reyes": [
    { subject: "Math", score: 88 },
    { subject: "Science", score: 92 },
    { subject: "English", score: 75 },
    { subject: "History", score: 84 },
  ],
  "Ana Lim": [
    { subject: "Math", score: 78 },
    { subject: "Science", score: 85 },
    { subject: "English", score: 95 },
    { subject: "History", score: 70 },
  ],
  "Rico Cruz": [
    { subject: "Math", score: 65 },
    { subject: "Science", score: 72 },
    { subject: "English", score: 68 },
    { subject: "History", score: 80 },
  ],
  "Maria Santos": [
    { subject: "Math", score: 85 },
    { subject: "Science", score: 78 },
    { subject: "English", score: 92 },
    { subject: "History", score: 68 },
  ],
  "Diana Go": [
    { subject: "Math", score: 82 },
    { subject: "Science", score: 88 },
    { subject: "English", score: 79 },
    { subject: "History", score: 91 },
  ],
  "Marco Ramos": [
    { subject: "Math", score: 70 },
    { subject: "Science", score: 65 },
    { subject: "English", score: 72 },
    { subject: "History", score: 68 },
  ],
  "Lea Tan": [
    { subject: "Math", score: 55 },
    { subject: "Science", score: 62 },
    { subject: "English", score: 70 },
    { subject: "History", score: 58 },
  ],
  "Ben Malay": [
    { subject: "Math", score: 48 },
    { subject: "Science", score: 52 },
    { subject: "English", score: 60 },
    { subject: "History", score: 55 },
  ],
};

function ClassmatesView() {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filtered = CLASSMATES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[#C9A84C] text-xl font-medium">Classmates</h2>
        <p className="text-[#B08040] text-xs mt-1">
          Browse and connect with your class
        </p>
      </div>

      <input
        type="text"
        placeholder="Search classmate..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-[#2A0000] border border-[#5A0000] rounded-xl px-3 py-2 text-[#E2C17A] text-sm placeholder-[#5A4020] outline-none focus:border-[#C9A84C] transition-colors mb-4"
      />

      <div className="grid grid-cols-2 gap-2.5">
        {filtered.map((c) => (
          <button
            key={c.name}
            onClick={() => setSelectedStudent(c)}
            className={`bg-[#2A0000] rounded-xl border p-3 flex items-center gap-3 text-left transition-all ${
              c.me ? "border-[#C9A84C]" : "border-[#5A0000] hover:border-[#C9A84C]/50"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                c.me
                  ? "bg-[#C9A84C] text-[#2A0000]"
                  : "bg-[#5A0000] text-[#C9A84C]"
              }`}
            >
              {c.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs font-medium truncate ${
                  c.me ? "text-[#C9A84C]" : "text-[#E2C17A]"
                }`}
              >
                {c.name}
                {c.me ? " (You)" : ""}
              </p>
              <p className="text-[#8A6030] text-xs">
                {c.pts} pts · {c.badges} badges
              </p>
            </div>
            <span className="text-[#C9A84C] text-xs font-medium">#{c.rank}</span>
          </button>
        ))}
      </div>

      {/* Modal for student analytics */}
      {selectedStudent && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="bg-[#2A0000] rounded-xl border border-[#C9A84C] w-96 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[#C9A84C] font-medium">
                {selectedStudent.name}
              </h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-[#8A6030] hover:text-[#C9A84C]"
              >
                ✕
              </button>
            </div>
            <p className="text-[#B08040] text-xs mb-4">
              Quiz scores by subject
            </p>
            <div className="space-y-2">
              {(studentScores[selectedStudent.name] || []).map((item) => (
                <div key={item.subject}>
                  <div className="flex justify-between text-xs text-[#E2C17A] mb-0.5">
                    <span>{item.subject}</span>
                    <span>{item.score}%</span>
                  </div>
                  <div className="h-2 bg-[#4A0000] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C9A84C] rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-[#8A6030] text-xs">
                Total Points: {selectedStudent.pts} · Badges: {selectedStudent.badges}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── PROFILE VIEW (editable) ─── */
function ProfileView({ fullName, initials, profilePic, updateProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(fullName);
  const [tempPic, setTempPic] = useState(profilePic);
  const [previewPic, setPreviewPic] = useState(profilePic);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempPic(reader.result);
        setPreviewPic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateProfile(editName, tempPic);
    setIsEditing(false);
  };

  const fields = [
    { label: "Student ID", val: "2024-00834", highlight: false },
    { label: "Email", val: "maria.s@school.edu", highlight: false },
    { label: "Section", val: "Grade 8 — Sampaguita", highlight: false },
    { label: "Adviser", val: "Ms. Reyes", highlight: false },
    { label: "Total Points", val: "87 pts", highlight: true },
    { label: "Badges Earned", val: "5 / 9", highlight: true },
    { label: "Quizzes Taken", val: "12", highlight: false },
    { label: "Class Rank", val: "#4", highlight: false },
  ];

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[#C9A84C] text-xl font-medium">My Profile</h2>
        <p className="text-[#B08040] text-xs mt-1">Your account information</p>
      </div>

      {/* Hero */}
      <div className="bg-[#2A0000] border border-[#5A0000] rounded-xl p-5 text-center mb-4">
        {!isEditing ? (
          <>
            <div className="w-16 h-16 bg-[#C9A84C] rounded-full flex items-center justify-center text-[#2A0000] text-2xl font-semibold mx-auto mb-3 border-2 border-[#E2C17A]">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <p className="text-[#C9A84C] text-base font-medium">{fullName}</p>
            <p className="text-[#8A6030] text-xs mt-1">
              Grade 8 — Section Sampaguita
            </p>
            <button
              onClick={() => {
                setIsEditing(true);
                setEditName(fullName);
                setTempPic(profilePic);
                setPreviewPic(profilePic);
              }}
              className="mt-3 px-3 py-1 bg-[#C9A84C]/20 text-[#C9A84C] text-xs rounded-full hover:bg-[#C9A84C]/30 transition"
            >
              Edit Profile
            </button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col items-center">
              <label className="cursor-pointer">
                <div className="w-16 h-16 bg-[#C9A84C] rounded-full flex items-center justify-center text-[#2A0000] text-2xl font-semibold mx-auto mb-2 border-2 border-[#E2C17A] overflow-hidden">
                  {previewPic ? (
                    <img
                      src={previewPic}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-[#8A6030] text-xs block mt-1">
                  Change Picture
                </span>
              </label>
            </div>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="bg-[#3A0000] border border-[#5A0000] rounded-lg px-3 py-1 text-[#E2C17A] text-sm w-full focus:outline-none focus:border-[#C9A84C]"
            />
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleSave}
                className="px-4 py-1 bg-[#C9A84C] text-[#2A0000] text-xs font-medium rounded-lg hover:bg-[#E2C17A] transition"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-1 border border-[#5A0000] text-[#8A6030] text-xs rounded-lg hover:text-[#C9A84C] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {fields.map((f) => (
          <div
            key={f.label}
            className="bg-[#2A0000] border border-[#5A0000] rounded-xl p-3"
          >
            <p className="text-[#8A6030] text-xs">{f.label}</p>
            <p
              className={`text-sm font-medium mt-1 ${
                f.highlight ? "text-[#C9A84C]" : "text-[#E2C17A]"
              }`}
            >
              {f.val}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentDashboard;