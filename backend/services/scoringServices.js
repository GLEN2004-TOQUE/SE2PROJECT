const { supabaseAdmin } = require("../supabaseClient");
const { evaluateAndAwardBadges } = require("../models/Badge");

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER_THRESHOLDS = {
  Master: 1000,
  Advanced: 500,
  Intermediate: 200,
  Beginner: 0,
};

const STREAK_BONUS_THRESHOLD = 5;
const STREAK_BONUS_POINTS = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a raw score to gamification points (0–100 scale).
 */
const computePoints = (score, total) => {
  if (!total || total === 0) return 0;
  return Math.round((score / total) * 100);
};

/**
 * Determine a user's tier from their total point balance.
 */
const getTier = (totalPoints) => {
  if (totalPoints >= TIER_THRESHOLDS.Master) return "Master";
  if (totalPoints >= TIER_THRESHOLDS.Advanced) return "Advanced";
  if (totalPoints >= TIER_THRESHOLDS.Intermediate) return "Intermediate";
  return "Beginner";
};

/**
 * Calculate the new streak count given the user's last quiz date.
 */
const computeStreak = (currentStreak, lastQuizDate) => {
  if (!lastQuizDate) return 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const last = new Date(lastQuizDate);
  last.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return currentStreak;       // Already answered today
  if (diffDays === 1) return currentStreak + 1;   // Consecutive day
  return 1;                                         // Streak broken
};

// ─── Core Exports ─────────────────────────────────────────────────────────────

/**
 * Grade a student's answers against the correct answers for a quiz.
 *
 * @param {Array}  questions   - Full question rows from DB (with correct_answer).
 * @param {Object} answers     - Map of { [questionId]: selectedLetter }.
 * @returns {{ score: number, total: number, breakdown: Array }}
 */
exports.gradeAnswers = (questions, answers) => {
  let score = 0;

  const breakdown = questions.map((q) => {
    const selected = answers[q.id] ?? null;
    const correct = q.correct_answer;
    const isCorrect = selected === correct;

    if (isCorrect) score++;

    return {
      question_id: q.id,
      question_text: q.question_text,
      selected_answer: selected,
      correct_answer: correct,
      is_correct: isCorrect,
    };
  });

  return { score, total: questions.length, breakdown };
};

/**
 * Calculate the percentage score (0–100).
 */
exports.calculatePercentage = (score, total) => {
  if (!total) return 0;
  return Math.round((score / total) * 100);
};

/**
 * Determine pass/fail given a score, total, and optional threshold (default 60%).
 */
exports.isPassing = (score, total, threshold = 0.6) => {
  if (!total) return false;
  return score / total >= threshold;
};

/**
 * Update a user's gamification state after completing a quiz.
 * Handles points, streak, tier, badges.
 *
 * @param {string|number} userId
 * @param {number}        score
 * @param {number}        total
 * @returns {Object} Updated gamification summary
 */
exports.updateGamification = async (userId, score, total) => {
  // 1. Load current user state
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("points, streak, tier, last_quiz_date")
    .eq("id", userId)
    .single();

  if (userError || !user) throw new Error("User not found for gamification update");

  // 2. Calculate points earned this round
  const pointsEarned = computePoints(score, total);

  // 3. Calculate streak
  const newStreak = computeStreak(user.streak, user.last_quiz_date);

  // 4. Apply streak bonus
  const streakBonus =
    newStreak >= STREAK_BONUS_THRESHOLD ? STREAK_BONUS_POINTS : 0;

  // 5. New totals
  const totalPoints = user.points + pointsEarned + streakBonus;
  const newTier = getTier(totalPoints);

  // 6. Persist updated fields
  const { error: updateError } = await supabaseAdmin
    .from("users")
    .update({
      points: totalPoints,
      streak: newStreak,
      tier: newTier,
      last_quiz_date: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) throw new Error(updateError.message);

  // 7. Evaluate and award any newly unlocked badges
  let newBadges = [];
  try {
    newBadges = await evaluateAndAwardBadges(userId, totalPoints);
  } catch (err) {
    // Non-fatal: badge awarding failure should not break quiz submission
    console.warn("Badge evaluation warning:", err.message);
  }

  return {
    pointsEarned,
    streakBonus,
    totalPoints,
    streak: newStreak,
    tier: newTier,
    newBadges,
  };
};

/**
 * Generate a human-readable score summary string.
 * e.g. "You scored 8/10 (80%) – Passing"
 */
exports.formatScoreSummary = (score, total, threshold = 0.6) => {
  const pct = exports.calculatePercentage(score, total);
  const status = exports.isPassing(score, total, threshold) ? "Passing ✅" : "Failing ❌";
  return `You scored ${score}/${total} (${pct}%) – ${status}`;
};

/**
 * Build a per-question results table suitable for a frontend response.
 * Strips the correct_answer from questions if hideAnswers is true.
 */
exports.buildResultsPayload = (breakdown, hideAnswers = false) => {
  return breakdown.map((item) => ({
    question_id: item.question_id,
    question_text: item.question_text,
    selected_answer: item.selected_answer,
    correct_answer: hideAnswers ? undefined : item.correct_answer,
    is_correct: item.is_correct,
  }));
};