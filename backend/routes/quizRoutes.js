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
  scheduleQuiz,
  deleteQuiz,
} = require("../controllers/quizController");
const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");
const { supabaseAdmin } = require("../supabaseClient");
const aiService = require("../services/aiService");

// ── Student routes ─────────────────────────────────────────────────────────────
router.post("/submit",     verifyToken, authorizeRole("student"), submitQuiz);
router.get("/my-quizzes",  verifyToken, authorizeRole("student"), getQuizzesForStudent);
router.get("/my-attendance", verifyToken, authorizeRole("student"), getMyAttendance);

// Student: get their past results (maps quizId → result for dashboard display)
router.get("/my-results", verifyToken, authorizeRole("student"), async (req, res) => {
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
router.post("/generate",   verifyToken, authorizeRole("teacher"), generateQuiz);
router.post("/save",       verifyToken, authorizeRole("teacher"), saveQuestions);
router.post("/schedule",   verifyToken, authorizeRole("teacher"), scheduleQuiz);
router.get("/my-quizzes-teacher", verifyToken, authorizeRole("teacher"), getTeacherQuizzes);
router.delete("/:quizId",  verifyToken, authorizeRole("teacher"), deleteQuiz);

// ── Generate from text ────────────────────────────────────────────────────────
router.post("/generate-from-text", verifyToken, authorizeRole("teacher"), async (req, res) => {
  try {
    const { text, type = "multiple-choice", count = 5 } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Lecture text is required" });
    }
    if (count < 1 || count > 10) {
      return res.status(400).json({ success: false, error: "Count must be between 1 and 10" });
    }
    const questions = await aiService.generateQuestions(text, type, count);
    res.json({
      success: true,
      questions,
      generatedAt: new Date().toISOString(),
      metadata: { count: questions.length, type }
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
router.get("/ai/status", verifyToken, authorizeRole("teacher"), (req, res) => {
  res.json({ success: true, status: aiService.getStatus(), timestamp: new Date().toISOString() });
});

// ── Attendance ────────────────────────────────────────────────────────────────
router.get("/attendance/:quizId",        verifyToken, getAttendanceReport);
router.get("/attendance/stats/:quizId",  verifyToken, getAttendanceStats);
router.get("/attendance/teacher/timeline", verifyToken, authorizeRole("teacher"), getTeacherAttendanceTimeline);

// ── Public quiz fetch by ID – MUST BE LAST to avoid shadowing other GET routes ──
router.get("/:quizId", verifyToken, authorizeRole("student"), getQuiz);

module.exports = router;