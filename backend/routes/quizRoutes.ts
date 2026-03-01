import { Router } from "express";
import { createQuiz, getQuizzes, submitQuiz } from "../controllers/quizController";
import { verifyToken, authorizeRole } from "../middleware/authMiddleware";

const router = Router();

router.post("/", verifyToken, authorizeRole("teacher"), createQuiz);
router.get("/", verifyToken, getQuizzes);
router.post("/:id/submit", verifyToken, submitQuiz);

export default router;
