const express = require("express");
const router = express.Router();
const { uploadLecture, getLectures, deleteLecture } = require("../controllers/lectureController");
const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post("/upload", verifyToken, authorizeRole("teacher"), upload.single("file"), uploadLecture);
router.get("/", verifyToken, authorizeRole("teacher"), getLectures);
router.delete("/:id", verifyToken, authorizeRole("teacher"), deleteLecture);

module.exports = router;