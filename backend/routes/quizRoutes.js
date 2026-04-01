const express = require("express");
const router = express.Router();
const { generateQuiz, saveQuestions, submitQuiz, getQuiz, getAttendanceReport, getAttendanceStats } = require("../controllers/quizController");
const { route } = require("./lectureRoutes");

router.get("/:quizID", getQuiz); 
router.get("/attendance/:quizID", getAttendanceReport);
router.get("/attendance/stats/:quizID", getAttendanceStats);

router.post("/generate", generateQuiz); 
router.post("/save", saveQuestions ); 
router.post("/submit", submitQuiz);


module.exports = router;