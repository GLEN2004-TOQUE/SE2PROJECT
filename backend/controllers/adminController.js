const { supabaseAdmin } = require("../supabaseClient");
const bcrypt = require("bcryptjs");
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

exports.createTeacher = async (req, res) => {
  try {
    const { firstName, middleName, lastName, fullName: legacyFullName, email, subject } = req.body;

    const fromParts =
      firstName?.trim() && middleName?.trim() && lastName?.trim()
        ? [firstName, middleName, lastName].map((s) => String(s).trim()).join(" ")
        : "";
    const fullName = (fromParts || String(legacyFullName || "").trim()).trim();

    const emailNorm = String(email || "").toLowerCase().trim();
    const subj = String(subject || "").trim();

    if (!fullName || !emailNorm || !subj) {
      return res.status(400).json({
        error: "Please fill in first name, middle name, last name, email, and subject.",
      });
    }

    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", emailNorm)
      .maybeSingle();
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const { data, error } = await supabaseAdmin
      .from("users")
      .insert([{
        full_name: fullName.trim(),
        email: emailNorm,
        password: hashedPassword,
        password_plain: String(tempPassword),
        role: "teacher",
        subject: subj,
        status: true,
        points: 0,
        streak: 0,
        tier: "Beginner",
      }])
      .select("id, full_name, email, role, status, subject, created_at")
      .single();

    if (error) return res.status(400).json({ error: error.message });

    let emailSent = false;
    try {
      await sendTeacherCredentials(emailNorm, fullName.trim(), tempPassword);
      emailSent = true;
      console.log(`✅ Credentials email sent to ${emailNorm}`);
    } catch (emailErr) {
      console.error(`❌ Email send failed for ${emailNorm}:`, emailErr.message);
    }

    res.status(201).json({
      message: emailSent
        ? `Teacher account created. Login credentials have been sent to ${emailNorm}.`
        : `Teacher account created, but the credentials email could not be delivered. Please share login details manually.`,
      user: data,
      emailSent,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Change Password ─────────────────────────────────────────────────────────

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

    const { data: user, error: fetchErr } = await supabaseAdmin
      .from("users")
      .select("password")
      .eq("id", userId)
      .single();

    if (fetchErr || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    const { error: updateErr } = await supabaseAdmin
      .from("users")
      .update({ password: hashedNew, password_plain: String(newPassword) })
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

// ─── Improving students timeline (admin dashboard momentum chart) ────────────

function dayKeyUTC(isoOrDate) {
  const x = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  return x.toISOString().slice(0, 10);
}

function cumulativeQuizPoints(results, endDate) {
  const end = new Date(endDate).getTime();
  let sum = 0;
  for (const r of results) {
    if (!r.total) continue;
    const t = new Date(r.submitted_at).getTime();
    if (t <= end) sum += Math.round((r.score / r.total) * 100);
  }
  return sum;
}

/** Consecutive calendar days with at least one quiz, ending on the latest quiz day on or before endDate */
function quizStreakAsOf(userResults, endDate) {
  const end = new Date(endDate).getTime();
  const days = new Set();
  for (const r of userResults) {
    if (new Date(r.submitted_at).getTime() <= end) days.add(dayKeyUTC(r.submitted_at));
  }
  const sorted = [...days].sort();
  if (sorted.length === 0) return 0;
  let last = sorted[sorted.length - 1];
  let streak = 1;
  for (let i = sorted.length - 2; i >= 0; i -= 1) {
    const cur = sorted[i];
    const diffDays = Math.round(
      (new Date(`${last}T12:00:00.000Z`) - new Date(`${cur}T12:00:00.000Z`)) / 86400000
    );
    if (diffDays === 1) {
      streak += 1;
      last = cur;
    } else break;
  }
  return streak;
}

exports.getImprovingStudentsTimeline = async (req, res) => {
  try {
    const { data: students, error: stErr } = await supabaseAdmin
      .from("users")
      .select("id, points, streak")
      .eq("role", "student");
    if (stErr) return res.status(400).json({ error: stErr.message });
    const studentList = students || [];

    const liveImprovingCount = () =>
      studentList.filter((s) => (s.points ?? 0) >= 80 || (s.streak ?? 0) >= 2).length;

    const { data: results, error: rErr } = await supabaseAdmin
      .from("results")
      .select("user_id, score, total, submitted_at")
      .order("submitted_at", { ascending: true });
    if (rErr) return res.status(400).json({ error: rErr.message });
    const rows = results || [];

    if (rows.length === 0) {
      const n = liveImprovingCount();
      return res.json({ checkpoints: [n, n, n, n, n], labels: ["C1", "C2", "C3", "C4", "Now"] });
    }

    const first = new Date(rows[0].submitted_at);
    const last = new Date();
    const span = Math.max(last.getTime() - first.getTime(), 1);

    const byUser = {};
    for (const r of rows) {
      if (!byUser[r.user_id]) byUser[r.user_id] = [];
      byUser[r.user_id].push(r);
    }

    const checkpoints = [0, 0.25, 0.5, 0.75, 1].map((p) => {
      const d = new Date(first.getTime() + p * span);
      let count = 0;
      for (const s of studentList) {
        const userResults = byUser[s.id] || [];
        const pts = cumulativeQuizPoints(userResults, d);
        const str = quizStreakAsOf(userResults, d);
        if (pts >= 80 || str >= 2) count += 1;
      }
      return count;
    });

    checkpoints[4] = liveImprovingCount();

    res.json({ checkpoints, labels: ["C1", "C2", "C3", "C4", "Now"] });
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

    const { data: teacher, error: teacherErr } = await supabaseAdmin
      .from("users")
      .select("id, full_name, role")
      .eq("id", teacherId)
      .eq("role", "teacher")
      .maybeSingle();
    if (teacherErr) return res.status(400).json({ error: teacherErr.message });
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    const { data: student, error: studentErr } = await supabaseAdmin
      .from("users")
      .select("id, full_name, role")
      .eq("id", studentId)
      .eq("role", "student")
      .maybeSingle();
    if (studentErr) return res.status(400).json({ error: studentErr.message });
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Use IDs exactly as stored (avoids string/number UUID mismatches on .eq() so we don't miss a row and INSERT into a duplicate student_id).
    const tid = teacher.id;
    const sid = student.id;

    const { data: existingPair, error: exErr } = await supabaseAdmin
      .from("teacher_student_assignments")
      .select("id")
      .eq("student_id", sid)
      .eq("teacher_id", tid)
      .maybeSingle();

    if (exErr) return res.status(400).json({ error: exErr.message });

    if (existingPair) {
      return res.status(409).json({
        error: `${student.full_name} is already assigned to ${teacher.full_name}`,
      });
    }

    const assignedAt = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("teacher_student_assignments")
      .insert({ student_id: sid, teacher_id: tid, assigned_at: assignedAt })
      .select(`id, assigned_at, teacher:teacher_id(id, full_name, email), student:student_id(id, full_name, email)`)
      .single();

    if (error) {
      if (error.code === "23505" || /duplicate key/i.test(error.message || "")) {
        return res.status(409).json({
          error: `${student.full_name} is already assigned to ${teacher.full_name}`,
        });
      }
      return res.status(400).json({ error: error.message });
    }

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
    const { teacherId } = req.query;
    let q = supabaseAdmin.from("teacher_student_assignments").delete().eq("student_id", studentId);
    if (teacherId) q = q.eq("teacher_id", teacherId);
    const { error } = await q;
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
    const rawStudentId = req.user.id;
    const studentIdCandidates = Array.from(
      new Set(
        [
          rawStudentId,
          rawStudentId != null ? String(rawStudentId) : null,
          Number.isFinite(Number(rawStudentId)) ? Number(rawStudentId) : null,
        ].filter((v) => v != null && v !== "")
      )
    );

    let rows = [];
    let lastError = null;
    for (const sid of studentIdCandidates) {
      const { data, error } = await supabaseAdmin
        .from("teacher_student_assignments")
        .select("teacher_id, assigned_at")
        .eq("student_id", sid)
        .order("assigned_at", { ascending: false });
      if (error) {
        lastError = error;
        break;
      }
      if (data && data.length > 0) {
        rows = data;
        break;
      }
    }
    if (lastError) return res.status(400).json({ error: lastError.message });
    if (!rows.length) return res.json([]);

    const teacherIds = [...new Set(rows.map((r) => r.teacher_id).filter((id) => id != null && id !== ""))];
    if (teacherIds.length === 0) return res.json([]);

    const { data: teachers, error: tErr } = await supabaseAdmin
      .from("users")
      .select("id, full_name, email, subject")
      .in("id", teacherIds);

    if (tErr) return res.status(400).json({ error: tErr.message });

    const byId = {};
    (teachers || []).forEach((u) => {
      if (u?.id == null) return;
      byId[u.id] = u;
      byId[String(u.id)] = u;
    });

    const seen = new Set();
    const out = [];
    for (const row of rows) {
      const tid = row.teacher_id;
      if (tid == null || tid === "") continue;
      const tidKey = String(tid);
      if (seen.has(tidKey)) continue;
      const t = byId[tid] || byId[tidKey];
      if (!t) continue;
      seen.add(tidKey);
      out.push({
        id: t.id,
        full_name: t.full_name,
        email: t.email,
        subject: t.subject,
        assigned_at: row.assigned_at,
      });
    }

    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
