const { supabaseAdmin } = require("../supabaseClient");

// ── Users ────────────────────────────────────────────────────────────────────

exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query; // ?role=student | teacher | (all)

    let query = supabaseAdmin
      .from("users")
      .select("id, full_name, email, role, status, points, streak, tier, last_quiz_date, created_at")
      .order("points", { ascending: false });

    if (role && role !== "all") {
      query = query.eq("role", role);
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, full_name, email, role, status, points, streak, tier, last_quiz_date, created_at")
      .eq("id", id)
      .single();

    if (error) return res.status(404).json({ error: "User not found" });

    // Fetch their badges
    const { data: badges } = await supabaseAdmin
      .from("user_badges")
      .select("earned_at, badges(id, name, description, icon_url, min_points)")
      .eq("user_id", id)
      .order("earned_at", { ascending: false });

    res.json({ ...user, badges: badges || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabaseAdmin
      .from("users")
      .update({ status })
      .eq("id", id)
      .select("id, status")
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Stats ────────────────────────────────────────────────────────────────────

exports.getStats = async (req, res) => {
  try {
    const [
      { count: totalStudents },
      { count: totalTeachers },
      { count: totalQuizzes },
      { count: totalBadgesAwarded },
    ] = await Promise.all([
      supabaseAdmin.from("users").select("id", { count: "exact", head: true }).eq("role", "student"),
      supabaseAdmin.from("users").select("id", { count: "exact", head: true }).eq("role", "teacher"),
      supabaseAdmin.from("quizzes").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("user_badges").select("id", { count: "exact", head: true }),
    ]);

    res.json({ totalStudents, totalTeachers, totalQuizzes, totalBadgesAwarded });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Leaderboard with badges ───────────────────────────────────────────────────

exports.getLeaderboard = async (req, res) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("id, full_name, points, streak, tier, last_quiz_date")
      .eq("role", "student")
      .eq("status", true)
      .order("points", { ascending: false })
      .limit(50);

    if (error) return res.status(400).json({ error: error.message });

    // Fetch badges for each user in parallel
    const usersWithBadges = await Promise.all(
      users.map(async (u) => {
        const { data: badges } = await supabaseAdmin
          .from("user_badges")
          .select("badges(id, name, icon_url)")
          .eq("user_id", u.id);
        return {
          ...u,
          badges: badges?.map((b) => b.badges).filter(Boolean) || [],
        };
      })
    );

    res.json(usersWithBadges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};