const { supabaseAdmin } = require("../supabaseClient");

/**
 * Badge Model
 *
 * Supabase table: badges
 * Columns: id, name, description, icon_url, min_points, created_at
 *
 * Supabase table: user_badges
 * Columns: id, user_id, badge_id, earned_at
 */

/**
 * Fetch all available badges.
 */
exports.getAllBadges = async () => {
  const { data, error } = await supabaseAdmin
    .from("badges")
    .select("*")
    .order("min_points", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Fetch a single badge by ID.
 */
exports.getBadgeById = async (badgeId) => {
  const { data, error } = await supabaseAdmin
    .from("badges")
    .select("*")
    .eq("id", badgeId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Create a new badge (admin / seeding use).
 */
exports.createBadge = async ({ name, description, icon_url, min_points }) => {
  const { data, error } = await supabaseAdmin
    .from("badges")
    .insert([{ name, description, icon_url, min_points }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Fetch all badges earned by a specific user.
 */
exports.getUserBadges = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from("user_badges")
    .select("earned_at, badges(id, name, description, icon_url, min_points)")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Award a badge to a user if they don't already have it.
 * Returns { awarded: true/false, badge }.
 */
exports.awardBadge = async (userId, badgeId) => {
  // Idempotent: check if already awarded
  const { data: existing } = await supabaseAdmin
    .from("user_badges")
    .select("id")
    .eq("user_id", userId)
    .eq("badge_id", badgeId)
    .maybeSingle();

  if (existing) return { awarded: false, badge: null };

  const { data, error } = await supabaseAdmin
    .from("user_badges")
    .insert([{ user_id: userId, badge_id: badgeId, earned_at: new Date() }])
    .select("earned_at, badges(id, name, description, icon_url)")
    .single();

  if (error) throw new Error(error.message);
  return { awarded: true, badge: data };
};

/**
 * Evaluate and award all badges a user qualifies for based on total points.
 * Returns an array of newly awarded badges.
 */
exports.evaluateAndAwardBadges = async (userId, totalPoints) => {
  const { data: allBadges, error } = await supabaseAdmin
    .from("badges")
    .select("*")
    .lte("min_points", totalPoints);

  if (error) throw new Error(error.message);

  const newlyAwarded = [];

  for (const badge of allBadges) {
    const { awarded, badge: awardedBadge } = await exports.awardBadge(
      userId,
      badge.id
    );
    if (awarded) newlyAwarded.push(awardedBadge);
  }

  return newlyAwarded;
};

/**
 * Delete a badge record (admin use).
 */
exports.deleteBadge = async (badgeId) => {
  const { error } = await supabaseAdmin
    .from("badges")
    .delete()
    .eq("id", badgeId);

  if (error) throw new Error(error.message);
  return { message: "Badge deleted" };
};