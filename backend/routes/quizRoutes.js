const express = require("express");
const router = express.Router();
const {
  generateQuiz,
  saveQuestions,
  submitQuiz,
  getQuiz,
  getAttendanceReport,
  getAttendanceStats,
  getQuizzesForStudent,
  getTeacherQuizzes,
  scheduleQuiz,
} = require("../controllers/quizController");
const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");
const aiService = require("../services/aiService");

// ── Student routes ────────────────────────────────────────────────────────────
router.post("/submit",     verifyToken, authorizeRole("student"), submitQuiz);
router.get("/my-quizzes",  verifyToken, authorizeRole("student"), getQuizzesForStudent);

// ── Teacher routes ────────────────────────────────────────────────────────────
router.post("/generate",   verifyToken, authorizeRole("teacher"), generateQuiz);
router.post("/save",       verifyToken, authorizeRole("teacher"), saveQuestions);
router.post("/schedule",   verifyToken, authorizeRole("teacher"), scheduleQuiz);
router.get("/my-quizzes-teacher", verifyToken, authorizeRole("teacher"), getTeacherQuizzes);

// ── Generate from text ────────────────────────────────────────────────────────
router.post("/generate-from-text", verifyToken, authorizeRole("teacher"), async (req, res) => {
  try {
    const { text, type = "multiple-choice", count = 5 } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Lecture text is required" });
    }
    if (count < 1 || count > 20) {
      return res.status(400).json({ success: false, error: "Count must be between 1 and 20" });
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
router.get("/attendance/:quizId",        getAttendanceReport);
router.get("/attendance/stats/:quizId",  getAttendanceStats);

// ── Public quiz fetch (must be LAST to avoid route collisions) ────────────────
router.get("/:quizId", getQuiz);

module.exports = router;