const express = require("express");
const router = express.Router();
const {
  getAllStudents, getAllTeachers, getAllUsers,
  getAssignments, assignTeacherToStudent,
  removeAssignment, getMyStudents, getMyTeacher,
  createTeacher, toggleUserStatus, deleteUser,
  getAdminLeaderboard, changePassword,
  assignSubjectToMyStudent,
  resetMyStudentsPoints,
  resetSingleMyStudentPoints,
  getMyCertificateRequests,
  createCertificateRequest,
  getAllCertificateRequests,
  updateCertificateRequestStatus,
} = require("../controllers/adminController");
const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");
const { supabaseAdmin } = require("../supabaseClient");

// ─── /me — fetch full profile including section ───────────────────────────
router.get("/me", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, full_name, email, points, streak, tier, role, course, section, subject")
      .eq("id", req.user.id)
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/me", verifyToken, async (req, res) => {
  try {
    const updates = {};
    const { fullName, subject } = req.body || {};
    if (typeof fullName === "string" && fullName.trim()) updates.full_name = fullName.trim();
    if (typeof subject === "string" && subject.trim()) updates.subject = subject.trim();
    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: "No valid fields to update" });
    }
    const { data, error } = await supabaseAdmin
      .from("users")
      .update(updates)
      .eq("id", req.user.id)
      .select("id, full_name, email, points, streak, tier, role, course, section, subject")
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Profile updated", user: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Change password (any authenticated user — teacher, student, admin) ────
router.patch("/change-password", verifyToken, changePassword);

// ─── Admin-only routes ────────────────────────────────────────────────────
router.get("/users",        verifyToken, authorizeRole("admin"), getAllUsers);
router.get("/students",     verifyToken, authorizeRole("admin"), getAllStudents);
router.get("/teachers",     verifyToken, authorizeRole("admin"), getAllTeachers);
router.get("/assignments",  verifyToken, authorizeRole("admin"), getAssignments);
router.post("/assign",      verifyToken, authorizeRole("admin"), assignTeacherToStudent);
router.delete("/assign/:studentId", verifyToken, authorizeRole("admin"), removeAssignment);

// ─── Teacher management ───────────────────────────────────────────────────
router.post("/teachers/create",         verifyToken, authorizeRole("admin"), createTeacher);
router.patch("/users/:userId/status",   verifyToken, authorizeRole("admin"), toggleUserStatus);
router.delete("/users/:userId",         verifyToken, authorizeRole("admin"), deleteUser);
router.get("/leaderboard",  verifyToken, authorizeRole("admin"), getAdminLeaderboard);

// ─── Teacher: see assigned students ──────────────────────────────────────
router.get("/my-students",  verifyToken, authorizeRole("teacher"), getMyStudents);
router.patch("/my-students/:studentId/subject", verifyToken, authorizeRole("teacher"), assignSubjectToMyStudent);
router.patch("/my-students/reset-points", verifyToken, authorizeRole("teacher"), resetMyStudentsPoints);
router.patch("/my-students/:studentId/reset-points", verifyToken, authorizeRole("teacher"), resetSingleMyStudentPoints);
router.get("/my-certificate-requests", verifyToken, authorizeRole("teacher"), getMyCertificateRequests);
router.post("/certificate-requests", verifyToken, authorizeRole("teacher"), createCertificateRequest);

// ─── Student: see assigned teacher ───────────────────────────────────────
router.get("/my-teacher",   verifyToken, authorizeRole("student"), getMyTeacher);

// ─── Admin: certificate approvals ────────────────────────────────────────
router.get("/certificate-requests", verifyToken, authorizeRole("admin"), getAllCertificateRequests);
router.patch("/certificate-requests/:requestId/status", verifyToken, authorizeRole("admin"), updateCertificateRequestStatus);

module.exports = router;