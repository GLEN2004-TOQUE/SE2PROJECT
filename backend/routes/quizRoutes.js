const express = require("express");
const router = express.Router();
const { generateQuiz, saveQuestions } = require("../controllers/quizController");

router.post("/generate", generateQuiz); 
router.post("/save", saveQuestions);

module.exports = router;