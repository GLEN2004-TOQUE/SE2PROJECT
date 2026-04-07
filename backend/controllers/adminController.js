const { supabaseAdmin } = require("../supabaseClient");
const bcrypt = require("bcrypt");
const { sendTeacherCredentials, generateTempPassword, sendPasswordChangedEmail } = require("../services/emailService");

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
      .select("id, full_name, email, role, status, points, tier, created_at")
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

exports.createTeacher = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ error: "Full name and email are required" });
    }

    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const { data, error } = await supabaseAdmin
      .from("users")
      .insert([{
        full_name: fullName.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "teacher",
        status: true,
        points: 0,
        streak: 0,
        tier: "Beginner",
      }])
      .select("id, full_name, email, role, status, created_at")
      .single();

    if (error) return res.status(400).json({ error: error.message });

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

// ─── Change Password ──────────────────────────────────────────────────────────

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

    // Fetch user with password + contact info
    const { data: user, error: fetchErr } = await supabaseAdmin
      .from("users")
      .select("password, email, full_name")
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

    // Hash and save new password
    const hashedNew = await bcrypt.hash(newPassword, 10);
    const { error: updateErr } = await supabaseAdmin
      .from("users")
      .update({ password: hashedNew })
      .eq("id", userId);

    if (updateErr) return res.status(400).json({ error: updateErr.message });

    console.log(`✅ Password updated for user ${userId}`);

    // Send confirmation email (non-fatal)
    try {
      await sendPasswordChangedEmail(user.email, user.full_name);
      console.log(`📧 Password-changed email sent to ${user.email}`);
    } catch (emailErr) {
      console.error(`⚠️ Password-changed email failed:`, emailErr.message);
    }

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

// ─── Assignments ──────────────────────────────────────────────────────────────

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

    const { data, error } = await supabaseAdmin
      .from("teacher_student_assignments")
      .upsert(
        { teacher_id: teacherId, student_id: studentId, assigned_at: new Date().toISOString() },
        { onConflict: "student_id" }
      )
      .select(`id, assigned_at, teacher:teacher_id(id, full_name, email), student:student_id(id, full_name, email)`)
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({
      message: `${student.full_name} has been successfully assigned to ${teacher.full_name}`,
      assignment: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeAssignment = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { error } = await supabaseAdmin
      .from("teacher_student_assignments").delete().eq("student_id", studentId);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Assignment removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyStudents = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from("teacher_student_assignments")
      .select(`assigned_at, student:student_id ( id, full_name, email, points, tier, streak, status )`)
      .eq("teacher_id", teacherId)
      .order("assigned_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data.map((d) => ({ ...d.student, assigned_at: d.assigned_at })));
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