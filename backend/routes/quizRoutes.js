// routes/quizRoutes.js
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
} = require("../controllers/quizController");
const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");
const aiService = require("../services/aiService"); // ✅ Import auto model switching service

// Public or teacher routes (existing)
router.get("/:quizId", getQuiz);
router.get("/attendance/:quizId", getAttendanceReport);
router.get("/attendance/stats/:quizId", getAttendanceStats);
router.post("/generate", verifyToken, authorizeRole("teacher"), generateQuiz);
router.post("/save", verifyToken, authorizeRole("teacher"), saveQuestions);
router.post("/submit", verifyToken, authorizeRole("student"), submitQuiz);

// Student: get quizzes from their teacher
router.get("/my-quizzes", verifyToken, authorizeRole("student"), getQuizzesForStudent);

// ✅ NEW: Generate questions from text with auto model switching
router.post("/generate-from-text", verifyToken, authorizeRole("teacher"), async (req, res) => {
  try {
    const { text, type = "multiple-choice", count = 5 } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Lecture text is required" 
      });
    }
    
    if (count < 1 || count > 20) {
      return res.status(400).json({ 
        success: false, 
        error: "Count must be between 1 and 20" 
      });
    }
    
    console.log(`📝 Generating ${count} ${type} questions from text (User: ${req.user.id})...`);
    
    // ✅ Use auto-switching AI service
    const questions = await aiService.generateQuestions(text, type, count);
    
    res.json({
      success: true,
      questions: questions,
      generatedAt: new Date().toISOString(),
      metadata: {
        count: questions.length,
        type: type,
        modelUsed: "auto-switch" // The service handles which model
      }
    });
    
  } catch (error) {
    console.error("AI Generation Error:", error.message);
    
    // Check if it's a rate limit error
    const isRateLimit = error.message.includes('quota') || error.message.includes('429');
    
    res.status(isRateLimit ? 429 : 500).json({ 
      success: false, 
      error: error.message,
      isRateLimit: isRateLimit,
      suggestion: isRateLimit ? "Please wait a moment and try again" : "Internal server error"
    });
  }
});

// ✅ NEW: Generate quiz directly with auto model switching
router.post("/generate-advanced", verifyToken, authorizeRole("teacher"), async (req, res) => {
  try {
    const { text, type = "multiple-choice", count = 5, saveToDatabase = false } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Lecture text is required" 
      });
    }
    
    console.log(`📝 Generating ${count} questions with auto-retry...`);
    
    // Generate questions
    const questions = await aiService.generateQuestions(text, type, count);
    
    // Optional: Save to database immediately
    let savedQuiz = null;
    if (saveToDatabase) {
      // Call your existing saveQuestions logic
      // You might want to create a separate function for this
      const { saveQuestionsDirectly } = require("../controllers/quizController");
      savedQuiz = await saveQuestionsDirectly(questions, req.user.id, text.substring(0, 200));
    }
    
    // Get model status for monitoring
    const modelStatus = aiService.getStatus();
    
    res.json({
      success: true,
      questions: questions,
      saved: saveToDatabase,
      savedQuiz: savedQuiz,
      modelStatus: modelStatus,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Advanced Generation Error:", error);
    
    const isRateLimit = error.message.includes('quota') || error.message.includes('429');
    
    res.status(isRateLimit ? 429 : 500).json({ 
      success: false, 
      error: error.message,
      isRateLimit: isRateLimit,
      suggestion: isRateLimit ? "Rate limit reached. Please wait a minute." : "Server error"
    });
  }
});

// ✅ NEW: Check AI service status (for teachers/admins)
router.get("/ai/status", verifyToken, authorizeRole("teacher"), (req, res) => {
  const status = aiService.getStatus();
  res.json({
    success: true,
    status: status,
    timestamp: new Date().toISOString()
  });
});

// ✅ NEW: Test AI connection
router.post("/ai/test", verifyToken, authorizeRole("teacher"), async (req, res) => {
  try {
    const testText = "What is the capital of France?";
    const questions = await aiService.generateQuestions(testText, "multiple-choice", 1);
    
    res.json({
      success: true,
      message: "AI service is working properly",
      testQuestion: questions[0],
      modelStatus: aiService.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "AI service is not responding properly"
    });
  }
});

module.exports = router;