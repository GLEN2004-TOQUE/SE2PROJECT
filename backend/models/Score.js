const { supabaseAdmin } = require("../supabaseClient");

/**
 * Score Model
 *
 * Supabase table: results
 * Columns: id, user_id, quiz_id, score, total, submitted_at
 *
 * Supabase table: attendance
 * Columns: id, user_id, quiz_id, status ("present" | "absent"), submitted_at
 */

// ─── Results ──────────────────────────────────────────────────────────────────

/**
 * Save a quiz result for a student.
 */
exports.saveResult = async ({ user_id, quiz_id, score, total }) => {
  const { data, error } = await supabaseAdmin
    .from("results")
    .insert([{ user_id, quiz_id, score, total, submitted_at: new Date() }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Fetch a student's result for a specific quiz.
 */
exports.getResultByUserAndQuiz = async (userId, quizId) => {
  const { data, error } = await supabaseAdmin
    .from("results")
    .select("*")
    .eq("user_id", userId)
    .eq("quiz_id", quizId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Fetch all results for a quiz (teacher view).
 */
exports.getResultsByQuiz = async (quizId) => {
  const { data, error } = await supabaseAdmin
    .from("results")
    .select("id, user_id, score, total, submitted_at")
    .eq("quiz_id", quizId)
    .order("score", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Fetch all results for a student across all quizzes.
 */
exports.getResultsByUser = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from("results")
    .select("id, quiz_id, score, total, submitted_at, quizzes(title)")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Aggregate statistics for a quiz.
 * Returns { count, average, highest, lowest, passing }.
 */
exports.getQuizStats = async (quizId, passingThreshold = 0.6) => {
  const { data, error } = await supabaseAdmin
    .from("results")
    .select("score, total")
    .eq("quiz_id", quizId);

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    return { count: 0, average: 0, highest: 0, lowest: 0, passing: 0 };
  }

  const percentages = data.map((r) => r.score / r.total);
  const count = percentages.length;
  const average = percentages.reduce((a, b) => a + b, 0) / count;
  const highest = Math.max(...percentages);
  const lowest = Math.min(...percentages);
  const passing = percentages.filter((p) => p >= passingThreshold).length;

  return {
    count,
    average: Math.round(average * 100),
    highest: Math.round(highest * 100),
    lowest: Math.round(lowest * 100),
    passing,
  };
};

// ─── Attendance ───────────────────────────────────────────────────────────────

/**
 * Record attendance for a student.
 * status: "present" | "absent" | "late"
 */
exports.saveAttendance = async ({ user_id, quiz_id, status }) => {
  const { data, error } = await supabaseAdmin
    .from("attendance")
    .insert([{ user_id, quiz_id, status, submitted_at: new Date() }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Determine attendance status based on quiz schedule and submission time.
 */
exports.resolveAttendanceStatus = (quiz, submissionTime = new Date()) => {
  const now = new Date(submissionTime);

  if (!quiz.start_time || !quiz.end_time) return "present";

  const start = new Date(quiz.start_time);
  const end = new Date(quiz.end_time);

  if (now < start || now > end) return "absent";
  return "present";
};

/**
 * Fetch attendance records for a quiz (teacher view).
 */
exports.getAttendanceByQuiz = async (quizId) => {
  const { data, error } = await supabaseAdmin
    .from("attendance")
    .select("id, user_id, status, submitted_at")
    .eq("quiz_id", quizId);

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Aggregate attendance stats for a quiz.
 * Returns { total, present, absent, late }.
 */
exports.getAttendanceStats = async (quizId) => {
  const { data, error } = await supabaseAdmin
    .from("attendance")
    .select("status")
    .eq("quiz_id", quizId);

  if (error) throw new Error(error.message);

  const stats = { total: data.length, present: 0, absent: 0, late: 0 };
  data.forEach((a) => {
    if (a.status in stats) stats[a.status]++;
  });

  return stats;
};

/**
 * Fetch a student's full attendance history.
 */
exports.getAttendanceByUser = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from("attendance")
    .select("id, quiz_id, status, submitted_at, quizzes(title)")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};