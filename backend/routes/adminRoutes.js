const { supabaseAdmin } = require("../supabaseClient");
const express = require("express");
const router = express.Router();
const {
  getAllStudents,
  getAllTeachers,
  getAllUsers,
  getAssignments,
  assignTeacherToStudent,
  removeAssignment,
  getMyStudents,
  getMyTeacher,
} = require("../controllers/adminController");
const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");

router.get("/me", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, full_name, email, points, streak, tier, role")
      .eq("id", req.user.id)
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin-only routes ────────────────────────────────────────────────────────
router.get("/users",       verifyToken, authorizeRole("admin"), getAllUsers);
router.get("/students",    verifyToken, authorizeRole("admin"), getAllStudents);
router.get("/teachers",    verifyToken, authorizeRole("admin"), getAllTeachers);
router.get("/assignments", verifyToken, authorizeRole("admin"), getAssignments);
router.post("/assign",     verifyToken, authorizeRole("admin"), assignTeacherToStudent);
router.delete("/assign/:studentId", verifyToken, authorizeRole("admin"), removeAssignment);

// ─── Teacher: see assigned students ──────────────────────────────────────────
router.get("/my-students", verifyToken, authorizeRole("teacher"), getMyStudents);

// ─── Student: see assigned teacher ───────────────────────────────────────────
router.get("/my-teacher",  verifyToken, authorizeRole("student"), getMyTeacher);

module.exports = router;