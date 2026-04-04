const { supabaseAdmin } = require("../supabaseClient");

/**
 * Quiz Model
 *
 * Supabase table: quizzes
 * Columns: id, course_id, title, start_time, end_time, created_at
 *
 * Supabase table: questions
 * Columns: id, quiz_id, question_text, option_a, option_b, option_c,
 *          option_d, correct_answer, ai_generated, created_at
 */

// ─── Quiz CRUD ────────────────────────────────────────────────────────────────

// Create a new quiz with associated questions (all-or-nothing)
exports.createQuiz = async ({ course_id, title, start_time, end_time, teacher_id }) => {
  const { data, error } = await supabaseAdmin
    .from("quizzes")
    .insert([{ course_id, title, start_time, end_time, teacher_id }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Save generated questions to DB and create quiz
exports.getQuizzesByTeacher = async (teacherId) => {
  const { data, error } = await supabaseAdmin
    .from("quizzes")
    .select("id, title, start_time, end_time, created_at")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

/**
 * Fetch all quizzes for a given course.
 */
exports.getQuizzesByCourse = async (courseId) => {
  const { data, error } = await supabaseAdmin
    .from("quizzes")
    .select("id, title, start_time, end_time, created_at")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Update quiz metadata (title, schedule).
 */
exports.updateQuiz = async (quizId, updates) => {
  const allowedFields = ["title", "start_time", "end_time"];
  const sanitized = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowedFields.includes(k))
  );

  if (Object.keys(sanitized).length === 0) {
    throw new Error("No valid fields to update");
  }

  const { data, error } = await supabaseAdmin
    .from("quizzes")
    .update(sanitized)
    .eq("id", quizId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Delete a quiz and its associated questions (cascade).
 */
exports.deleteQuiz = async (quizId) => {
  // Questions are deleted first to avoid FK violation if not using ON DELETE CASCADE
  await supabaseAdmin.from("questions").delete().eq("quiz_id", quizId);

  const { error } = await supabaseAdmin
    .from("quizzes")
    .delete()
    .eq("id", quizId);

  if (error) throw new Error(error.message);
  return { message: "Quiz deleted" };
};

// ─── Availability helpers ─────────────────────────────────────────────────────

/**
 * Returns "pending" | "open" | "closed" based on current time vs schedule.
 */
exports.getQuizStatus = (quiz) => {
  const now = new Date();
  if (!quiz.start_time) return "open"; // No schedule set → always open
  if (now < new Date(quiz.start_time)) return "pending";
  if (quiz.end_time && now > new Date(quiz.end_time)) return "closed";
  return "open";
};

// ─── Question CRUD ────────────────────────────────────────────────────────────

/**
 * Fetch all questions for a quiz, optionally shuffled.
 */
exports.getQuestionsByQuiz = async (quizId, shuffle = false) => {
  const { data, error } = await supabaseAdmin
    .from("questions")
    .select("*")
    .eq("quiz_id", quizId);

  if (error) throw new Error(error.message);

  if (shuffle) {
    return data.sort(() => Math.random() - 0.5);
  }
  return data;
};

/**
 * Bulk-insert pre-formatted question rows.
 * Each item must already contain: quiz_id, question_text,
 * option_a-d, correct_answer, ai_generated.
 */
exports.insertQuestions = async (questions) => {
  const { data, error } = await supabaseAdmin
    .from("questions")
    .insert(questions)
    .select();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Update a single question.
 */
exports.updateQuestion = async (questionId, updates) => {
  const allowedFields = [
    "question_text",
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "correct_answer",
  ];
  const sanitized = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowedFields.includes(k))
  );

  const { data, error } = await supabaseAdmin
    .from("questions")
    .update(sanitized)
    .eq("id", questionId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Delete a single question by ID.
 */
exports.deleteQuestion = async (questionId) => {
  const { error } = await supabaseAdmin
    .from("questions")
    .delete()
    .eq("id", questionId);

  if (error) throw new Error(error.message);
  return { message: "Question deleted" };
};

/**
 * Count questions for a quiz.
 */
exports.countQuestions = async (quizId) => {
  const { count, error } = await supabaseAdmin
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("quiz_id", quizId);

  if (error) throw new Error(error.message);
  return count;
};