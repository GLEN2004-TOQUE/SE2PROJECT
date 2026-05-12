const { supabaseAdmin } = require("../supabaseClient");

const computePoints = (score, total) => {
  if (!total) return 0;
  return Math.round((score / total) * 100);
};

const getTier = (totalPoints) => {
  if (totalPoints >= 1000) return "Master";
  if (totalPoints >= 500)  return "Advanced";
  if (totalPoints >= 200)  return "Intermediate";
  return "Beginner";
};

// ← now accepts section param
exports.getLeaderboard = async (type = "overall", section = null) => {
  let query = supabaseAdmin
    .from("users")
    .select("id, full_name, points, tier, streak, section")
    .eq("status", true)
    .eq("role", "student");   // students only

  // Filter by section if provided
  if (section) {
    query = query.eq("section", section);
  }

  if (type === "daily") {
    const today = new Date().toISOString().split("T")[0];
    query = query.eq("last_quiz_date", today);
  } else if (type === "weekly") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    query = query.gte("last_quiz_date", weekAgo.toISOString());
  }

  const { data, error } = await query
    .order("points", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return data || [];
};

exports.getBadges = async () => {
  const { data, error } = await supabaseAdmin
    .from("badges")
    .select("*")
    .order("min_points", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

exports.getUserBadges = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from("user_badges")
    .select("earned_at, badges(id, name, description, icon_url, min_points)")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

exports.awardBadge = async (userId, badgeId) => {
  const { data: existing } = await supabaseAdmin
    .from("user_badges")
    .select("id")
    .eq("user_id", userId)
    .eq("badge_id", badgeId)
    .maybeSingle();

  if (existing) return { awarded: false };

  const { data, error } = await supabaseAdmin
    .from("user_badges")
    .insert([{ user_id: userId, badge_id: badgeId, earned_at: new Date() }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { awarded: true, badge: data };
};

// NOTE:
// Gamification update logic has been consolidated into `scoringServices.updateGamification`
// to avoid duplicate implementations. This file now focuses on read-only gamification
// helpers such as leaderboards and badge queries.