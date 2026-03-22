/**
 * scoringServices.js
 * Points computation algorithm for quiz results.
 *
 * Scoring breakdown:
 *  - Base points      : 10 pts per correct answer
 *  - Accuracy bonus   : +20 pts if score >= 90%
 *                       +10 pts if score >= 75%
 *                        +5 pts if score >= 50%
 *  - Attendance bonus : +15 pts if student submitted on time (status = "present")
 *  - Perfect score    : +30 pts bonus on top of everything
 */

/**
 * Compute the total points earned from a quiz attempt.
 *
 * @param {number} correctCount   - Number of correct answers
 * @param {number} totalQuestions - Total number of questions
 * @param {string} attendanceStatus - "present" | "absent"
 * @returns {object} Detailed scoring breakdown
 */
exports.computePoints = (correctCount, totalQuestions, attendanceStatus = "absent") => {
  const BASE_POINTS_PER_CORRECT = 10;

  // --- Base points ---
  const basePoints = correctCount * BASE_POINTS_PER_CORRECT;

  // --- Accuracy (percentage) ---
  const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  // --- Accuracy bonus ---
  let accuracyBonus = 0;
  if (accuracy >= 90) {
    accuracyBonus = 20;
  } else if (accuracy >= 75) {
    accuracyBonus = 10;
  } else if (accuracy >= 50) {
    accuracyBonus = 5;
  }

  // --- Perfect score bonus ---
  const perfectBonus = accuracy === 100 ? 30 : 0;

  // --- Attendance bonus ---
  const attendanceBonus = attendanceStatus === "present" ? 15 : 0;

  // --- Total ---
  const totalPoints = basePoints + accuracyBonus + perfectBonus + attendanceBonus;

  // --- Grade label ---
  let grade;
  if (accuracy === 100) grade = "Perfect";
  else if (accuracy >= 90) grade = "Excellent";
  else if (accuracy >= 75) grade = "Good";
  else if (accuracy >= 50) grade = "Fair";
  else grade = "Needs Improvement";

  return {
    correctCount,
    totalQuestions,
    accuracy: parseFloat(accuracy.toFixed(2)),  // e.g. 83.33
    grade,
    breakdown: {
      basePoints,
      accuracyBonus,
      perfectBonus,
      attendanceBonus,
    },
    totalPoints,
  };
};

/**
 * Determine badge earned based on scoring result.
 *
 * @param {object} scoringResult - Result from computePoints()
 * @returns {string|null} Badge name or null if none earned
 */
exports.getBadge = (scoringResult) => {
  const { accuracy, breakdown } = scoringResult;

  if (accuracy === 100) return "Perfect Scholar";
  if (accuracy >= 90) return "Honor Student";
  if (accuracy >= 75) return "Rising Star";
  if (breakdown.attendanceBonus > 0 && accuracy >= 50) return "Consistent Learner";
  return null;
};