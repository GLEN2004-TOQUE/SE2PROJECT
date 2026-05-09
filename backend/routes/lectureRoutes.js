const express = require("express");
const router = express.Router();
const { uploadLecture, getLectures, deleteLecture } = require("../controllers/lectureController");
const { verifyToken, authorizeRole, requireActiveUser } = require("../middleware/roleMiddleware"); 
const upload = require("../middleware/upload");

router.post("/upload", verifyToken, requireActiveUser, authorizeRole("teacher"), upload.single("file"), uploadLecture);
router.get("/", verifyToken, requireActiveUser, authorizeRole("teacher"), getLectures);
router.delete("/:id", verifyToken, requireActiveUser, authorizeRole("teacher"), deleteLecture);

module.exports = router;