const { supabaseAdmin } = require("../supabaseClient");
const bcrypt = require("bcrypt");
const { sendTeacherCredentials, generateTempPassword } = require("../services/emailService");

// ─── Get all users by role ───────────────────────────────────────────────────

exports.getAllStudents = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, full_name, email, role, status, points, tier, streak, section, course, created_at")
      .eq("role", "student")
      .order("full_name", { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, full_name, email, role, status, points, tier, subject, created_at")
      .eq("role", "teacher")
      .order("full_name", { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, full_name, email, role, status, points, tier, created_at")
      .order("created_at", { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Create Teacher ───────────────────────────────────────────────────────────
// Auto-generates a temporary password and emails it to the teacher.

exports.createTeacher = async (req, res) => {
  try {
    const { fullName, email, subject } = req.body;

    if (!fullName || !email || !subject) {
      return res.status(400).json({ error: "Full name, email, and subject are required" });
    }

    // Check duplicate
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();
    if (existing) return res.status(409).json({ error: "Email already registered" });

    // Generate temp password
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Insert into DB
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert([{
        full_name: fullName.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "teacher",
        subject: subject.trim(),
        status: true,
        points: 0,
        streak: 0,
        tier: "Beginner",
      }])
      .select("id, full_name, email, role, status, subject, created_at")
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Send credentials email (non-fatal)
    let emailSent = false;
    try {
      await sendTeacherCredentials(email.toLowerCase().trim(), fullName.trim(), tempPassword);
      emailSent = true;
      console.log(`✅ Credentials email sent to ${email}`);
    } catch (emailErr) {
      console.error(`❌ Email send failed for ${email}:`, emailErr.message);
    }

    res.status(201).json({
      message: emailSent
        ? `Teacher account created. Login credentials have been sent to ${email}.`
        : `Teacher account created, but the credentials email could not be delivered. Please share login details manually.`,
      user: data,
      emailSent,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Change Password (teacher or any authenticated user) ─────────────────────

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ error: "New password must differ from the current password" });
    }

    // Fetch hashed password
    const { data: user, error: fetchErr } = await supabaseAdmin
      .from("users")
      .select("password")
      .eq("id", userId)
      .single();

    if (fetchErr || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash and persist new password
    const hashedNew = await bcrypt.hash(newPassword, 10);
    const { error: updateErr } = await supabaseAdmin
      .from("users")
      .update({ password: hashedNew })
      .eq("id", userId);

    if (updateErr) return res.status(400).json({ error: updateErr.message });

    console.log(`✅ Password updated for user ${userId}`);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Toggle user status ───────────────────────────────────────────────────────

exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (typeof status !== "boolean") {
      return res.status(400).json({ error: "status must be a boolean" });
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .update({ status })
      .eq("id", userId)
      .select("id, full_name, status")
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({
      message: `${data.full_name} has been ${status ? "activated" : "deactivated"}`,
      user: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Delete user ──────────────────────────────────────────────────────────────

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id, full_name, role")
      .eq("id", userId)
      .single();

    if (!user) return res.status(404).json({ error: "User not found" });

    await supabaseAdmin.from("teacher_student_assignments").delete().eq("student_id", userId);
    await supabaseAdmin.from("teacher_student_assignments").delete().eq("teacher_id", userId);
    await supabaseAdmin.from("quiz_assignments").delete().eq("student_id", userId);
    await supabaseAdmin.from("results").delete().eq("user_id", userId);
    await supabaseAdmin.from("attendance").delete().eq("user_id", userId);
    await supabaseAdmin.from("user_badges").delete().eq("user_id", userId);

    const { error } = await supabaseAdmin.from("users").delete().eq("id", userId);
    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: `${user.full_name} (${user.role}) has been permanently deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Admin Leaderboard ────────────────────────────────────────────────────────

exports.getAdminLeaderboard = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, full_name, email, points, tier, streak, section, course, status, last_quiz_date")
      .eq("role", "student")
      .order("points", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Assignments ─────────────────────────────────────────────────────────────

exports.getAssignments = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("teacher_student_assignments")
      .select(`
        id,
        assigned_at,
        teacher:teacher_id ( id, full_name, email ),
        student:student_id ( id, full_name, email )
      `)
      .order("assigned_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assignTeacherToStudent = async (req, res) => {
  try {
    const { teacherId, studentId } = req.body;
    if (!teacherId || !studentId) {
      return res.status(400).json({ error: "teacherId and studentId are required" });
    }

    const { data: teacher } = await supabaseAdmin
      .from("users").select("id, full_name, role").eq("id", teacherId).eq("role", "teacher").single();
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    const { data: student } = await supabaseAdmin
      .from("users").select("id, full_name, role").eq("id", studentId).eq("role", "student").single();
    if (!student) return res.status(404).json({ error: "Student not found" });

    const { data: existingLink } = await supabaseAdmin
      .from("teacher_student_assignments")
      .select("id")
      .eq("teacher_id", teacherId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (existingLink) {
      return res.status(409).json({ error: `${student.full_name} is already assigned to ${teacher.full_name}` });
    }

    const { data, error } = await supabaseAdmin
      .from("teacher_student_assignments")
      .insert({ teacher_id: teacherId, student_id: studentId, assigned_at: new Date().toISOString() })
      .select(`id, assigned_at, teacher:teacher_id(id, full_name, email), student:student_id(id, full_name, email)`)
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({
      message: `${student.full_name} has been successfully added under ${teacher.full_name}`,
      assignment: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeAssignment = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { teacherId } = req.query;
    const query = supabaseAdmin
      .from("teacher_student_assignments")
      .delete()
      .eq("student_id", studentId);
    if (teacherId) query.eq("teacher_id", teacherId);
    const { error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: teacherId ? "Teacher assignment removed successfully" : "All assignments removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyStudents = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from("teacher_student_assignments")
      .select(`assigned_at, student:student_id ( id, full_name, email, points, tier, streak, status, section, course )`)
      .eq("teacher_id", teacherId)
      .order("assigned_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data.map((d) => ({ ...d.student, assigned_at: d.assigned_at })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assignSubjectToMyStudent = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { studentId } = req.params;
    const { subject } = req.body;
    if (!subject || !subject.trim()) {
      return res.status(400).json({ error: "subject is required" });
    }

    const { data: assignment } = await supabaseAdmin
      .from("teacher_student_assignments")
      .select("id")
      .eq("teacher_id", teacherId)
      .eq("student_id", studentId)
      .maybeSingle();
    if (!assignment) {
      return res.status(403).json({ error: "You can only assign subjects to your own students" });
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .update({ course: subject.trim() })
      .eq("id", studentId)
      .eq("role", "student")
      .select("id, full_name, email, points, tier, streak, status, section, course")
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Student subject assigned", student: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetMyStudentsPoints = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { data: links, error: linkErr } = await supabaseAdmin
      .from("teacher_student_assignments")
      .select("student_id")
      .eq("teacher_id", teacherId);
    if (linkErr) return res.status(400).json({ error: linkErr.message });

    const studentIds = (links || []).map((l) => l.student_id).filter(Boolean);
    if (!studentIds.length) return res.json({ message: "No assigned students to reset", count: 0 });

    const { error: updateErr } = await supabaseAdmin
      .from("users")
      .update({ points: 0, streak: 0, tier: "Beginner" })
      .in("id", studentIds)
      .eq("role", "student");
    if (updateErr) return res.status(400).json({ error: updateErr.message });

    res.json({ message: "Assigned students' points have been reset", count: studentIds.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetSingleMyStudentPoints = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { studentId } = req.params;
    if (!studentId) return res.status(400).json({ error: "studentId is required" });

    const { data: link } = await supabaseAdmin
      .from("teacher_student_assignments")
      .select("id")
      .eq("teacher_id", teacherId)
      .eq("student_id", studentId)
      .maybeSingle();
    if (!link) return res.status(403).json({ error: "You can only reset your assigned students" });

    // Remove point-related history for this student.
    await supabaseAdmin.from("results").delete().eq("user_id", studentId);
    await supabaseAdmin.from("attendance").delete().eq("user_id", studentId);
    await supabaseAdmin.from("user_badges").delete().eq("user_id", studentId);

    const { data, error } = await supabaseAdmin
      .from("users")
      .update({ points: 0, streak: 0, tier: "Beginner" })
      .eq("id", studentId)
      .eq("role", "student")
      .select("id, full_name, points, streak, tier")
      .single();
    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: `${data.full_name}'s points were reset`, student: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyTeacher = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from("teacher_student_assignments")
      .select(`assigned_at, teacher:teacher_id ( id, full_name, email, tier )`)
      .eq("student_id", studentId)
      .maybeSingle();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.json(null);
    res.json({ ...data.teacher, assigned_at: data.assigned_at });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Certificate requests ─────────────────────────────────────────────────────

exports.createCertificateRequest = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ error: "studentId is required" });

    const { data: student } = await supabaseAdmin
      .from("users")
      .select("id, full_name, role")
      .eq("id", studentId)
      .eq("role", "student")
      .single();
    if (!student) return res.status(404).json({ error: "Student not found" });

    const { data: existing } = await supabaseAdmin
      .from("certificate_requests")
      .select("id, status")
      .eq("student_id", studentId)
      .eq("teacher_id", teacherId)
      .eq("status", "pending")
      .maybeSingle();
    if (existing) {
      return res.status(409).json({ error: "A pending certificate request already exists for this student" });
    }

    const { data, error } = await supabaseAdmin
      .from("certificate_requests")
      .insert({
        student_id: studentId,
        teacher_id: teacherId,
        requested_by: teacherId,
        status: "pending",
      })
      .select(`
        id, status, created_at, approved_at,
        student:student_id ( id, full_name, email, points, section ),
        teacher:teacher_id ( id, full_name, email )
      `)
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: "Certificate request submitted", request: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyCertificateRequests = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from("certificate_requests")
      .select(`
        id, status, created_at, approved_at,
        student:student_id ( id, full_name, email, points, section ),
        teacher:teacher_id ( id, full_name, email )
      `)
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });
    if (error) {
      if (error.code === "42P01") return res.json([]);
      return res.status(400).json({ error: error.message });
    }
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllCertificateRequests = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("certificate_requests")
      .select(`
        id, status, created_at, approved_at,
        student:student_id ( id, full_name, email, points, section ),
        teacher:teacher_id ( id, full_name, email )
      `)
      .order("created_at", { ascending: false });
    if (error) {
      if (error.code === "42P01") return res.json([]);
      return res.status(400).json({ error: error.message });
    }
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCertificateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "status must be approved or rejected" });
    }
    const patch = {
      status,
      approved_at: status === "approved" ? new Date().toISOString() : null,
    };
    const { data, error } = await supabaseAdmin
      .from("certificate_requests")
      .update(patch)
      .eq("id", requestId)
      .select(`
        id, status, created_at, approved_at,
        student:student_id ( id, full_name, email, points, section ),
        teacher:teacher_id ( id, full_name, email )
      `)
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: `Certificate request ${status}`, request: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};