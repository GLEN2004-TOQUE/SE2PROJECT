const express = require("express");
const router = express.Router();
const {
  generateQuiz,
  saveQuestions,
  submitQuiz,
  getQuiz,
  getAttendanceReport,
  getAttendanceStats,
  getMyAttendance,
  getTeacherAttendanceTimeline,
  getQuizzesForStudent,
  getTeacherQuizzes,
  getTeacherQuizDetail,
  getTeacherQuizResults,
  patchTeacherQuiz,
  scheduleQuiz,
  deleteQuiz,
} = require("../controllers/quizController");
const { verifyToken, authorizeRole, requireActiveUser } = require("../middleware/roleMiddleware");
const { supabaseAdmin } = require("../supabaseClient");
const aiService = require("../services/aiService");

// Teacher quiz-by-id routes registered first (stable match for GET /teacher/:quizId).
router.get("/teacher/:quizId/results", verifyToken, requireActiveUser, authorizeRole("teacher"), getTeacherQuizResults);
router.get("/teacher/:quizId", verifyToken, requireActiveUser, authorizeRole("teacher"), getTeacherQuizDetail);
router.patch("/teacher/:quizId", verifyToken, requireActiveUser, authorizeRole("teacher"), patchTeacherQuiz);

// ── Student routes ─────────────────────────────────────────────────────────────
router.post("/submit",     verifyToken, requireActiveUser, authorizeRole("student"), submitQuiz);
router.get("/my-quizzes",  verifyToken, requireActiveUser, authorizeRole("student"), getQuizzesForStudent);
router.get("/my-attendance", verifyToken, requireActiveUser, authorizeRole("student"), getMyAttendance);

// Student: get their past results (maps quizId → result for dashboard display)
router.get("/my-results", verifyToken, requireActiveUser, authorizeRole("student"), async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from("results")
      .select("id, quiz_id, score, total, submitted_at, answers")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false });

    if (error) throw new Error(error.message);
    res.json(data || []);
  } catch (err) {
    console.error("my-results error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── Teacher routes ────────────────────────────────────────────────────────────
router.post("/generate",   verifyToken, requireActiveUser, authorizeRole("teacher"), generateQuiz);
router.post("/save",       verifyToken, requireActiveUser, authorizeRole("teacher"), saveQuestions);
router.post("/schedule",   verifyToken, requireActiveUser, authorizeRole("teacher"), scheduleQuiz);
router.get("/my-quizzes-teacher", verifyToken, requireActiveUser, authorizeRole("teacher"), getTeacherQuizzes);
router.delete("/:quizId",  verifyToken, requireActiveUser, authorizeRole("teacher"), deleteQuiz);

// ── Generate from text ────────────────────────────────────────────────────────
router.post("/generate-from-text", verifyToken, requireActiveUser, authorizeRole("teacher"), async (req, res) => {
  try {
    const { text, type = "multiple-choice", count = 5, difficulty = "medium" } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Lecture text is required" });
    }
    if (count < 1 || count > 10) {
      return res.status(400).json({ success: false, error: "Count must be between 1 and 10" });
    }
    const questions = await aiService.generateQuestions(text, type, count, difficulty);
    res.json({
      success: true,
      questions,
      generatedAt: new Date().toISOString(),
      metadata: { count: questions.length, type, difficulty }
    });
  } catch (error) {
    const isRateLimit = error.message.includes('quota') || error.message.includes('429');
    res.status(isRateLimit ? 429 : 500).json({
      success: false,
      error: error.message,
      isRateLimit,
      suggestion: isRateLimit ? "Please wait a moment and try again" : "Internal server error"
    });
  }
});

// ── AI status ─────────────────────────────────────────────────────────────────
router.get("/ai/status", verifyToken, requireActiveUser, authorizeRole("teacher"), (req, res) => {
  res.json({ success: true, status: aiService.getStatus(), timestamp: new Date().toISOString() });
});

// ── Attendance (specific paths before /attendance/:quizId) ─────────────────────
router.get("/attendance/stats/:quizId", verifyToken, requireActiveUser, getAttendanceStats);
router.get("/attendance/teacher/timeline", verifyToken, requireActiveUser, authorizeRole("teacher"), getTeacherAttendanceTimeline);
router.get("/attendance/:quizId", verifyToken, requireActiveUser, getAttendanceReport);

// ── Student quiz fetch by ID – MUST BE LAST among GET single-segment routes ───
router.get("/:quizId", verifyToken, requireActiveUser, authorizeRole("student"), getQuiz);

// Unmatched path or method under /api/quiz → 401 without token, 403 if authenticated
router.use(verifyToken, requireActiveUser, (req, res) => {
  res.status(403).json({ message: "Forbidden" });
});

module.exports = router;