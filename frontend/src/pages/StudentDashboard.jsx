import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout, getLeaderboard, getBadges, getRecentResults } from "../services/api";
import Navbar from "../components/Navbar";
import QuizCard from "../components/QuizCard";
import LeaderboardCard from "../components/LeaderboardCard";
import BadgeCard from "../components/BadgeCard";
import RecentResultCard from "../components/RecentResultCard";
import GlobalStyle from "../components/GlobalStyle";

export default function StudentDashboard() {
  const navigate = useNavigate();

  // User state
  const [userData, setUserData] = useState(null);

  // Leaderboard state
  const [lbType, setLbType] = useState("overall");
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(false);

  // Badges & results
  const [badges, setBadges] = useState([]);
  const [results, setResults] = useState([]);

  // Auth check
  useEffect(() => {
    const u = getUser();
    if (!u) {
      navigate("/");
      return;
    }
    if (u.role !== "student") {
      navigate("/teacher");
      return;
    }
    setUserData(u);
  }, [navigate]);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback((type) => {
    setLbLoading(true);
    getLeaderboard(type)
      .then((data) => setLeaderboard(Array.isArray(data) ? data : []))
      .catch(() => setLeaderboard([]))
      .finally(() => setLbLoading(false));
  }, []);

  useEffect(() => {
    fetchLeaderboard(lbType);
  }, [lbType, fetchLeaderboard]);

  // Fetch badges & recent results (if endpoints exist)
  useEffect(() => {
    if (userData?.id) {
      // Replace with actual API calls when available
      getBadges(userData.id)
        .then(setBadges)
        .catch(() => setBadges([]));
      getRecentResults(userData.id)
        .then(setResults)
        .catch(() => setResults([]));
    }
  }, [userData]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!userData) {
    return <LoadingSpinner />;
  }

  return (
    <>
<GlobalStyle />
      <div className="sd-root">
        <div className="deco-ring" />
        <div className="deco-ring deco-ring-2" />

        <Navbar user={userData} onLogout={handleLogout} />

        <div className="sd-body">
          <WelcomeMessage name={userData.full_name} />

          <StatsBar
            points={userData.points ?? 0}
            streak={userData.streak ?? 0}
            tier={userData.tier ?? "Beginner"}
          />

          <div className="sd-grid">
            <QuizCard />
            <LeaderboardCard
              lbType={lbType}
              setLbType={setLbType}
              leaderboard={leaderboard}
              lbLoading={lbLoading}
              currentUserId={userData.id}
            />
          </div>

          <BadgeCard badges={badges} />
<RecentResultCard results={results} />
        </div>
      </div>
    </>
  );
}

// Helper components (could be in separate files)
function LoadingSpinner() {
  return (
    <div style={{ minHeight: "100vh", background: "#12080a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 36, height: 36, border: "2px solid rgba(200,160,40,.2)",
          borderTopColor: "rgba(200,160,40,.7)", borderRadius: "50%",
          animation: "spin .7s linear infinite", margin: "0 auto 12px"
        }} />
        <p style={{ color: "rgba(200,170,100,.4)", fontSize: ".8rem", letterSpacing: ".06em" }}>
          LOADING DASHBOARD…
        </p>
      </div>
    </div>
  );
}

function WelcomeMessage({ name }) {
  return (
    <div className="sd-welcome">
      <h1>Welcome back, {name?.split(" ")[0] ?? "Student"} 👋</h1>
      <p>Ready to challenge yourself today?</p>
    </div>
  );
}

function StatsBar({ points, streak, tier }) {
  const tierClass = (tier) => {
    const t = tier?.toLowerCase();
    if (t === "master") return "master";
    if (t === "advanced") return "advanced";
    if (t === "intermediate") return "intermediate";
    return "beginner";
  };

  const tierDisplay = tier || "Beginner";
  const tierBadgeClass = tierClass(tierDisplay);

  return (
    <div className="sd-stats">
      <div className="sd-stat">
        <div className="sd-stat-label">Total Points</div>
        <div className="sd-stat-value">{points.toLocaleString()}</div>
        <div className="sd-stat-sub">XP earned overall</div>
        <div className="sd-stat-icon">⭐</div>
      </div>

      <div className="sd-stat">
        <div className="sd-stat-label">Current Streak</div>
        <div className="sd-stat-value sd-streak-flame">
          {streak > 0 ? "🔥" : "❄️"} {streak}
        </div>
        <div className="sd-stat-sub">
          {streak === 0 ? "Take a quiz to start" :
           streak === 1 ? "Keep it going!" :
           `${streak} days in a row`}
        </div>
        <div className="sd-stat-icon">🔥</div>
      </div>

      <div className="sd-stat">
        <div className="sd-stat-label">Current Tier</div>
        <div className="sd-stat-value" style={{ fontSize: "1.1rem", paddingTop: ".2rem" }}>
          <span className={`sd-tier-badge ${tierBadgeClass}`}>
            {tierDisplay === "Master"       ? "👑" :
             tierDisplay === "Advanced"     ? "💎" :
             tierDisplay === "Intermediate" ? "🎯" : "🌱"} {tierDisplay}
          </span>
        </div>
        <div className="sd-stat-sub">
          {tierDisplay === "Master"       ? "Top performer" :
           tierDisplay === "Advanced"     ? "500 pts to Master" :
           tierDisplay === "Intermediate" ? "200 pts to Advanced" :
           "Keep earning points!"}
        </div>
      </div>
    </div>
  );
}