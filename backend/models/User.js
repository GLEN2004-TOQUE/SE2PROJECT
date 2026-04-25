const { supabaseAdmin } = require("../supabaseClient");
const bcrypt = require("bcryptjs");

exports.getUserById = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, full_name, email, role, status, points, streak, tier, last_quiz_date, created_at")
    .eq("id", userId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

exports.getUserByEmail = async (email) => {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

exports.getAllUsers = async () => {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, full_name, email, role, status, points, tier, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

exports.getUsersByRole = async (role) => {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, full_name, email, role, status, points, tier, created_at")
    .eq("role", role)
    .order("full_name", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

exports.createUser = async ({ fullName, email, password, role = "student" }) => {
  const { data: existing } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabaseAdmin
    .from("users")
    .insert([{
      full_name: fullName,
      email,
      password: hashedPassword,
      role,
      status: true,
      points: 0,
      streak: 0,
      tier: "Beginner",
    }])
    .select("id, full_name, email, role, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data;
};

exports.updateProfile = async (userId, { fullName, email }) => {
  const updates = {};
  if (fullName) updates.full_name = fullName;
  if (email) updates.email = email;
  if (Object.keys(updates).length === 0) throw new Error("Nothing to update");

  const { data, error } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select("id, full_name, email, role")
    .single();
  if (error) throw new Error(error.message);
  return data;
};

exports.changePassword = async (userId, currentPassword, newPassword) => {
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("password")
    .eq("id", userId)
    .single();
  if (error || !user) throw new Error("User not found");

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new Error("Current password is incorrect");

  const hashed = await bcrypt.hash(newPassword, 10);
  const { error: updateError } = await supabaseAdmin
    .from("users")
    .update({ password: hashed })
    .eq("id", userId);
  if (updateError) throw new Error(updateError.message);
  return { message: "Password updated successfully" };
};

exports.setUserStatus = async (userId, status) => {
  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ status })
    .eq("id", userId)
    .select("id, status")
    .single();
  if (error) throw new Error(error.message);
  return data;
};

exports.deleteUser = async (userId) => {
  const { error } = await supabaseAdmin
    .from("users")
    .delete()
    .eq("id", userId);
  if (error) throw new Error(error.message);
  return { message: "User deleted" };
};

exports.updateGamificationFields = async (userId, { points, streak, tier, last_quiz_date }) => {
  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ points, streak, tier, last_quiz_date })
    .eq("id", userId)
    .select("id, points, streak, tier")
    .single();
  if (error) throw new Error(error.message);
  return data;
};

exports.getLeaderboard = async (scope = "overall", limit = 10) => {
  let query = supabaseAdmin
    .from("users")
    .select("id, full_name, points, tier, streak")
    .eq("status", true);

  if (scope === "daily") {
    const today = new Date().toISOString().split("T")[0];
    query = query.eq("last_quiz_date", today);
  } else if (scope === "weekly") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    query = query.gte("last_quiz_date", weekAgo.toISOString());
  }

  const { data, error } = await query
    .order("points", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data;
};