const { supabase } = require("../supabaseClient");

function computePoints(score, total) {
  return Math.round((score / total) * 100);
}

function getTier(points) {
  if (points >= 1000) return "Master";
  if (points >= 500) return "Advanced";
  if (points >= 200) return "Intermediate";
  return "Beginner";
}

exports.updateGamification = async (userId, score, total) => {
  const pointsEarned = computePoints(score, total);

  // Get user
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  let newStreak = 1;
  const today = new Date().toDateString();

  if (user.last_quiz_date) {
    const last = new Date(user.last_quiz_date).toDateString();

    const diff = (new Date(today) - new Date(last)) / (1000 * 60 * 60 * 24);

    if (diff === 1) newStreak = user.streak + 1;
    else if (diff === 0) newStreak = user.streak;
  }

  // 🔥 STREAK BONUS
  let bonus = 0;
  if (newStreak >= 5) bonus = 20;

  const totalPoints = user.points + pointsEarned + bonus;

  const tier = getTier(totalPoints);

  // Update user
  await supabase.from("users").update({
    points: totalPoints,
    streak: newStreak,
    last_quiz_date: new Date(),
    tier
  }).eq("id", userId);

  // 🎖 BADGE CHECK
  const { data: badges } = await supabase.from("badges").select("*");

  for (let badge of badges) {
    if (totalPoints >= badge.min_points) {
      await supabase.from("user_badges").insert([
        { user_id: userId, badge_id: badge.id }
      ]);
    }
  }

  return {
    pointsEarned,
    totalPoints,
    streak: newStreak,
    tier
  };
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { type } = req.params; // daily / weekly / overall

    let query = supabase.from("users").select("id, points, tier");

    if (type === "daily") {
      const today = new Date().toISOString().split("T")[0];
      query = query.eq("last_quiz_date", today);
    }

    if (type === "weekly") {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      query = query.gte("last_quiz_date", lastWeek.toISOString());
    }

    const { data } = await query.order("points", { ascending: false });

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};