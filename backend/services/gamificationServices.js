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

exports.getLeaderboard = async (type = "overall") => {
  let query = supabaseAdmin
    .from("users")
    .select("id, full_name, points, tier, streak")
    .eq("status", true);

  if (type === "daily") {
    const today = new Date().toISOString().split("T")[0];
    query = query.eq("last_quiz_date", today);
  } else if (type === "weekly") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    query = query.gte("last_quiz_date", weekAgo.toISOString());
  }

  const { data, error } = await query.order("points", { ascending: false }).limit(10);
  if (error) throw new Error(error.message);
  return data;
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

exports.updateGamification = async (userId, score, total) => {
  const pointsEarned = computePoints(score, total);

  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("points, streak, last_quiz_date")
    .eq("id", userId)
    .single();

  if (userError || !user) throw new Error("User not found");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let newStreak = 1;
  if (user.last_quiz_date) {
    const last = new Date(user.last_quiz_date);
    last.setHours(0, 0, 0, 0);
    const diff = Math.round((today - last) / (1000 * 60 * 60 * 24));
    if (diff === 0) newStreak = user.streak;
    else if (diff === 1) newStreak = user.streak + 1;
  }

  const streakBonus = newStreak >= 5 ? 20 : 0;
  const totalPoints = user.points + pointsEarned + streakBonus;
  const tier = getTier(totalPoints);

  await supabaseAdmin
    .from("users")
    .update({ points: totalPoints, streak: newStreak, last_quiz_date: new Date().toISOString(), tier })
    .eq("id", userId);

  // Award badges
  const { data: badges } = await supabaseAdmin
    .from("badges")
    .select("*")
    .lte("min_points", totalPoints);

  if (badges) {
    for (const badge of badges) {
      const { data: existing } = await supabaseAdmin
        .from("user_badges")
        .select("id")
        .eq("user_id", userId)
        .eq("badge_id", badge.id)
        .maybeSingle();

      if (!existing) {
        await supabaseAdmin
          .from("user_badges")
          .insert([{ user_id: userId, badge_id: badge.id }]);
      }
    }
  }

  return { pointsEarned, streakBonus, totalPoints, streak: newStreak, tier };
};