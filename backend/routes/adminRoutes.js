const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const {
  getAllStudents, getAllTeachers, getAllUsers,
  getAssignments, getImprovingStudentsTimeline, assignTeacherToStudent,
  removeAssignment, getMyStudents, getMyTeacher,
  createTeacher, toggleUserStatus, deleteUser,
  getAdminLeaderboard, changePassword,
  assignSubjectToMyStudent,
  resetMyStudentsPoints,
  resetSingleMyStudentPoints,
} = require("../controllers/adminController");
const { verifyToken, authorizeRole, requireActiveUser } = require("../middleware/roleMiddleware");
const { supabaseAdmin } = require("../supabaseClient");

/** In-memory certificate queue (lost on restart) until a DB table is added */
const certificateRequests = [];

async function userMiniMapByIds(ids) {
  const unique = [...new Set(ids.map((id) => String(id)).filter(Boolean))];
  if (unique.length === 0) return new Map();
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, full_name, email")
    .in("id", unique);
  if (error || !data) return new Map();
  return new Map(
    data.map((u) => [String(u.id), { id: u.id, full_name: u.full_name, email: u.email }])
  );
}

async function serializeCertRows(rows) {
  const studentIds = rows.map((r) => r.studentId);
  const teacherIds = rows.map((r) => r.teacherId);
  const map = await userMiniMapByIds([...studentIds, ...teacherIds]);
  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    createdAt: row.createdAt,
    student: map.get(String(row.studentId)) || { id: row.studentId, full_name: "Student" },
    teacher: map.get(String(row.teacherId)) || { id: row.teacherId, full_name: "Teacher" },
  }));
}

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
router.get("/improving-students-timeline", verifyToken, requireActiveUser, authorizeRole("admin"), getImprovingStudentsTimeline);

// ─── Teacher: see assigned students ──────────────────────────────────────
router.get("/my-students",  verifyToken, requireActiveUser, authorizeRole("teacher"), getMyStudents);
router.patch("/my-students/:studentId/subject", verifyToken, requireActiveUser, authorizeRole("teacher"), assignSubjectToMyStudent);
router.patch("/my-students/reset-points", verifyToken, requireActiveUser, authorizeRole("teacher"), resetMyStudentsPoints);
router.patch("/my-students/:studentId/reset-points", verifyToken, requireActiveUser, authorizeRole("teacher"), resetSingleMyStudentPoints);

// ─── Student: see assigned teacher ───────────────────────────────────────
router.get("/my-teacher",   verifyToken, requireActiveUser, authorizeRole("student"), getMyTeacher);

// ─── Certificate requests (frontend expects these paths on /api/admin) ─────
router.get(
  "/certificate-requests",
  verifyToken,
  requireActiveUser,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const out = await serializeCertRows(certificateRequests);
      res.json(out);
    } catch (err) {
      res.status(500).json({ message: err.message || "Could not load certificate requests." });
    }
  }
);

router.get(
  "/my-certificate-requests",
  verifyToken,
  requireActiveUser,
  authorizeRole("teacher"),
  async (req, res) => {
    try {
      const mine = certificateRequests.filter((c) => String(c.teacherId) === String(req.user.id));
      const out = await serializeCertRows(mine);
      res.json(out);
    } catch (err) {
      res.status(500).json({ message: err.message || "Could not load certificate requests." });
    }
  }
);

router.post(
  "/certificate-requests",
  verifyToken,
  requireActiveUser,
  authorizeRole("teacher"),
  async (req, res) => {
    try {
      const studentId = req.body?.studentId;
      if (!studentId) {
        return res.status(400).json({ message: "studentId is required" });
      }
      const teacherId = req.user.id;

      const { data: pair, error: pErr } = await supabaseAdmin
        .from("teacher_student_assignments")
        .select("id")
        .eq("student_id", studentId)
        .eq("teacher_id", teacherId)
        .maybeSingle();
      if (pErr) return res.status(400).json({ message: pErr.message });
      if (!pair) {
        return res.status(403).json({
          message: "You can only request certificates for students assigned to you.",
        });
      }

      const dup = certificateRequests.some(
        (c) =>
          String(c.teacherId) === String(teacherId) &&
          String(c.studentId) === String(studentId) &&
          c.status === "pending"
      );
      if (dup) {
        return res.status(409).json({
          message: "A pending certificate request already exists for this student.",
        });
      }

      const row = {
        id: crypto.randomUUID(),
        studentId,
        teacherId,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      certificateRequests.push(row);
      const [shaped] = await serializeCertRows([row]);
      res.status(201).json({ message: "Certificate request submitted", request: shaped });
    } catch (err) {
      res.status(500).json({ message: err.message || "Could not submit certificate request." });
    }
  }
);

router.patch(
  "/certificate-requests/:requestId/status",
  verifyToken,
  requireActiveUser,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const status = String(req.body?.status || "").toLowerCase();
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "status must be pending, approved, or rejected" });
      }
      const row = certificateRequests.find((c) => String(c.id) === String(requestId));
      if (!row) {
        return res.status(404).json({ message: "Certificate request not found." });
      }
      row.status = status;
      res.json({ message: "Certificate request updated" });
    } catch (err) {
      res.status(500).json({ message: err.message || "Could not update certificate request." });
    }
  }
);

module.exports = router;