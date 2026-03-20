import { Router } from "express";
import { uploadLecture, getLectures, deleteLecture } from "../controllers/lectureController";
import { verifyToken, authorizeRole } from "../middleware/authMiddleware";
import upload from "../middleware/upload";

const router = Router();

router.post("/upload", verifyToken, authorizeRole("teacher"), upload.single("file"), uploadLecture);
router.get("/", verifyToken, authorizeRole("teacher"), getLectures);
router.delete("/:id", verifyToken, authorizeRole("teacher"), deleteLecture);

export default router;
