const { supabaseAdmin } = require("../supabaseClient");
const bcrypt = require("bcrypt");

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
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Full name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check duplicate email
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

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
    res.status(201).json({ message: `Teacher account for ${fullName} created successfully`, user: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Toggle user status (activate / deactivate) ───────────────────────────────

exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // boolean: true = active, false = inactive

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

    // Fetch user first so we can return their name in message
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id, full_name, role")
      .eq("id", userId)
      .single();

    if (!user) return res.status(404).json({ error: "User not found" });

    // Remove from teacher_student_assignments first (FK cleanup)
    await supabaseAdmin.from("teacher_student_assignments").delete().eq("student_id", userId);
    await supabaseAdmin.from("teacher_student_assignments").delete().eq("teacher_id", userId);

    // Remove quiz assignments (students)
    await supabaseAdmin.from("quiz_assignments").delete().eq("student_id", userId);

    // Remove results + attendance
    await supabaseAdmin.from("results").delete().eq("user_id", userId);
    await supabaseAdmin.from("attendance").delete().eq("user_id", userId);

    // Remove user badges
    await supabaseAdmin.from("user_badges").delete().eq("user_id", userId);

    // Finally delete user
    const { error } = await supabaseAdmin.from("users").delete().eq("id", userId);
    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: `${user.full_name} (${user.role}) has been permanently deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Admin Leaderboard (all students, no section filter) ──────────────────────

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

// ─── For teacher: get their assigned students ─────────────────────────────────

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

// ─── For student: get their assigned teacher ─────────────────────────────────

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