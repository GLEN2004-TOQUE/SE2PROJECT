const { supabaseAdmin } = require("../supabaseClient");

// ─── Get all users by role ───────────────────────────────────────────────────

exports.getAllStudents = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, full_name, email, role, status, points, tier, created_at")
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

    // Verify teacher exists with correct role
    const { data: teacher } = await supabaseAdmin
      .from("users")
      .select("id, full_name, role")
      .eq("id", teacherId)
      .eq("role", "teacher")
      .single();

    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    // Verify student exists with correct role
    const { data: student } = await supabaseAdmin
      .from("users")
      .select("id, full_name, role")
      .eq("id", studentId)
      .eq("role", "student")
      .single();

    if (!student) return res.status(404).json({ error: "Student not found" });

    // Upsert: if student already assigned, update to new teacher
    const { data, error } = await supabaseAdmin
      .from("teacher_student_assignments")
      .upsert(
        { teacher_id: teacherId, student_id: studentId, assigned_at: new Date().toISOString() },
        { onConflict: "student_id" }
      )
      .select(`
        id,
        assigned_at,
        teacher:teacher_id ( id, full_name, email ),
        student:student_id ( id, full_name, email )
      `)
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
      .from("teacher_student_assignments")
      .delete()
      .eq("student_id", studentId);

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
      .select(`
        assigned_at,
        student:student_id ( id, full_name, email, points, tier, streak, status )
      `)
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
      .select(`
        assigned_at,
        teacher:teacher_id ( id, full_name, email, tier )
      `)
      .eq("student_id", studentId)
      .maybeSingle();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.json(null);

    res.json({ ...data.teacher, assigned_at: data.assigned_at });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};