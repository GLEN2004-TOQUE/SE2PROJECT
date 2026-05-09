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
const { verifyToken, authorizeRole, requireActiveUser } = require("../middleware/roleMiddleware");
const { supabaseAdmin } = require("../supabaseClient");

// ─── /me — fetch full profile including section ───────────────────────────
router.get("/me", verifyToken, requireActiveUser, async (req, res) => {
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

router.patch("/me", verifyToken, requireActiveUser, async (req, res) => {
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
router.patch("/change-password", verifyToken, requireActiveUser, changePassword);

// ─── Admin-only routes ────────────────────────────────────────────────────
router.get("/users",        verifyToken, requireActiveUser, authorizeRole("admin"), getAllUsers);
router.get("/students",     verifyToken, requireActiveUser, authorizeRole("admin"), getAllStudents);
router.get("/teachers",     verifyToken, requireActiveUser, authorizeRole("admin"), getAllTeachers);
router.get("/assignments",  verifyToken, requireActiveUser, authorizeRole("admin"), getAssignments);
router.post("/assign",      verifyToken, requireActiveUser, authorizeRole("admin"), assignTeacherToStudent);
router.delete("/assign/:studentId", verifyToken, requireActiveUser, authorizeRole("admin"), removeAssignment);

// ─── Teacher management ───────────────────────────────────────────────────
router.post("/teachers/create",         verifyToken, requireActiveUser, authorizeRole("admin"), createTeacher);
router.patch("/users/:userId/status",   verifyToken, requireActiveUser, authorizeRole("admin"), toggleUserStatus);
router.delete("/users/:userId",         verifyToken, requireActiveUser, authorizeRole("admin"), deleteUser);
router.get("/leaderboard",  verifyToken, requireActiveUser, authorizeRole("admin"), getAdminLeaderboard);

// ─── Teacher: see assigned students ──────────────────────────────────────
router.get("/my-students",  verifyToken, requireActiveUser, authorizeRole("teacher"), getMyStudents);
router.patch("/my-students/:studentId/subject", verifyToken, requireActiveUser, authorizeRole("teacher"), assignSubjectToMyStudent);
router.patch("/my-students/reset-points", verifyToken, requireActiveUser, authorizeRole("teacher"), resetMyStudentsPoints);
router.patch("/my-students/:studentId/reset-points", verifyToken, requireActiveUser, authorizeRole("teacher"), resetSingleMyStudentPoints);
router.get("/my-certificate-requests", verifyToken, requireActiveUser, authorizeRole("teacher"), getMyCertificateRequests);
router.post("/certificate-requests", verifyToken, requireActiveUser, authorizeRole("teacher"), createCertificateRequest);

// ─── Student: see assigned teacher ───────────────────────────────────────
router.get("/my-teacher",   verifyToken, requireActiveUser, authorizeRole("student"), getMyTeacher);

// ─── Admin: certificate approvals ────────────────────────────────────────
router.get("/certificate-requests", verifyToken, requireActiveUser, authorizeRole("admin"), getAllCertificateRequests);
router.patch("/certificate-requests/:requestId/status", verifyToken, requireActiveUser, authorizeRole("admin"), updateCertificateRequestStatus);

module.exports = router;