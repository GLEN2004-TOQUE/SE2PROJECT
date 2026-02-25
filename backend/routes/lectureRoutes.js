const express = require("express");
const router = express.Router();
const { uploadLecture, getLectures, deleteLecture } = require("../controllers/lectureController");
const { verifyToken, authorizeRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Upload lecture
router.post("/upload", verifyToken, authorizeRole("teacher"), upload.single("file"), uploadLecture);

// Get all lectures for teacher
router.get("/", verifyToken, authorizeRole("teacher"), getLectures);

// Delete a lecture
router.delete("/:id", verifyToken, authorizeRole("teacher"), deleteLecture);

module.exports = router;