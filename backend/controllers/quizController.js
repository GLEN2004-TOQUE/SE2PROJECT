// controllers/quizController.js
const aiService = require("../services/aiService");
const { supabaseAdmin } = require("../supabaseClient");
const { updateGamification } = require("../services/scoringServices");

const PASSING_PERCENT = 75;

/** Safe per-question weight (defaults to 1 if missing or invalid). */
function questionPoints(q) {
  const n = Number(q?.points);
  if (Number.isFinite(n) && n > 0) return Math.round(n);
  return 1;
}

function mapQuestionRowToClient(row) {
  if (!row) return null;
  return {
    id: row.id,
    question: row.question_text,
    options: [row.option_a, row.option_b, row.option_c, row.option_d],
    correct_answer: row.correct_answer,
    points: questionPoints(row),
  };
}

/** JWT / DB may disagree on numeric vs string IDs for FK columns. */
function userIdCandidates(raw) {
  return Array.from(
    new Set(
      [raw, raw != null ? String(raw) : null, Number.isFinite(Number(raw)) ? Number(raw) : null].filter(
        (v) => v != null && v !== ""
      )
    )
  );
}

/** All id shapes for the signed-in user (JWT + Supabase `req.dbUser`). */
function authUserIds(req) {
  const out = new Set();
  for (const source of [req.user?.id, req.dbUser?.id]) {
    for (const c of userIdCandidates(source)) {
      out.add(c);
      out.add(String(c));
    }
  }
  return [...out].filter((v) => v != null && v !== "");
}

function authUserIdsNormalized(req) {
  // For Supabase, column types might be uuid/int/text.
  // We try all safe string + numeric representations.
  const out = new Set();
  for (const id of authUserIds(req)) {
    out.add(String(id));
    const n = Number(id);
    if (Number.isFinite(n)) out.add(n);
  }
  return [...out];
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate quiz questions using AI
// ─────────────────────────────────────────────────────────────────────────────
const AI_QUIZ_TYPES = new Set([
  "matching",
  "identification",
  "true-false",
  "multiple-choice",
]);
const AI_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

exports.generateQuiz = async (req, res) => {
  try {
    const { lectureId, type, count, difficulty } = req.body;
    const raw = parseInt(count, 10);
    const safeCount = Number.isFinite(raw)
      ? Math.min(10, Math.max(1, raw))
      : 5;
    if (!lectureId) {
      return res.status(400).json({ error: "Lecture ID is required" });
    }

    const quizType = String(type || "").trim();
    if (!AI_QUIZ_TYPES.has(quizType)) {
      return res.status(400).json({
        error:
          "Invalid quiz type. Use matching, identification, true-false, or multiple-choice.",
      });
    }

    const diffRaw = String(difficulty || "medium").toLowerCase();
    const diff = AI_DIFFICULTIES.has(diffRaw) ? diffRaw : "medium";

    const { data: lecture, error: lectureError } = await supabaseAdmin
      .from("lectures")
      .select("*")
      .eq("id", lectureId)
      .single();

    if (lectureError) {
      console.error("Lecture lookup failed:", lectureError);
      return res.status(500).json({ error: lectureError.message });
    }
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    console.log(
      `📝 Generating ${safeCount} ${quizType} (${diff}) questions for lecture: ${lecture.title}`
    );
    const generated = await aiService.generateQuestions(
      lecture.extracted_text,
      quizType,
      safeCount,
      diff
    );
    const questions = generated.slice(0, safeCount);

    res.json({
      success: true,
      questions,
      metadata: {
        lectureId,
        lectureTitle: lecture.title,
        type: quizType,
        difficulty: diff,
        count: questions.length,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error("AI generation failed:", err);
    const isRateLimit = err.message.includes('quota') || err.message.includes('429');
    res.status(isRateLimit ? 429 : 500).json({
      error: err.message || "AI generation failed. Please create manually.",
      isRateLimit,
      suggestion: isRateLimit ? "Please wait a minute and try again" : "Try again later"
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Save generated questions to DB and create quiz
// ─────────────────────────────────────────────────────────────────────────────
exports.saveQuestions = async (req, res) => {
  try {
    const { lectureId, quizTitle, questions } = req.body;
    const teacherId = req.dbUser?.id ?? req.user.id;

    if (!lectureId || !questions || !quizTitle) {
      return res.status(400).json({ message: "Missing data" });
    }

    const { data: lecture, error: lectureError } = await supabaseAdmin
      .from("lectures")
      .select("id, title")
      .eq("id", lectureId)
      .single();

    if (lectureError || !lecture) {
      return res.status(404).json({ error: "Lecture not found" });
    }

    const { data: quiz, error: quizError } = await supabaseAdmin
      .from("quizzes")
      .insert([{
        title: quizTitle,
        teacher_id: teacherId,
        lecture_id: lectureId,
        created_at: new Date()
      }])
      .select()
      .single();

    if (quizError) return res.status(400).json({ error: quizError.message });

    const optionLetters = ["A", "B", "C", "D"];
    const formatted = questions.map(q => {
      let correctLetter = q.correct_answer;
      if (correctLetter && correctLetter.length > 1) {
        const idx = q.options.findIndex(o => o === correctLetter);
        correctLetter = idx >= 0 ? optionLetters[idx] : "A";
      }
      if (!["A", "B", "C", "D"].includes(correctLetter)) correctLetter = "A";

      return {
        quiz_id: quiz.id,
        question_text: q.question,
        option_a: q.options[0] || "",
        option_b: q.options[1] || "",
        option_c: q.options[2] || "",
        option_d: q.options[3] || "",
        correct_answer: correctLetter,
        ai_generated: true,
        points: questionPoints(q),
      };
    });

    const { data: insertedRows, error: insertError } = await supabaseAdmin
      .from("questions")
      .insert(formatted)
      .select("id, question_text, option_a, option_b, option_c, option_d, correct_answer, points");

    if (insertError) {
      await supabaseAdmin.from("quizzes").delete().eq("id", quiz.id);
      return res.status(400).json({ error: insertError.message });
    }

    res.json({
      message: "Quiz saved successfully",
      quiz_id: quiz.id,
      questionsCount: formatted.length,
      quiz: {
        id: quiz.id,
        title: quizTitle,
        lecture_id: lectureId,
      },
      questions: (insertedRows || []).map(mapQuestionRowToClient),
    });
  } catch (err) {
    console.error("Save questions error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get teacher's quizzes
// ─────────────────────────────────────────────────────────────────────────────
exports.getTeacherQuizzes = async (req, res) => {
  try {
    const teacherIds = authUserIds(req);
    if (!teacherIds.length) {
      return res.json({ success: true, quizzes: [] });
    }

    const { data: quizzes, error } = await supabaseAdmin
      .from("quizzes")
      .select(`
        id, title, created_at, start_time, end_time,
        lecture:lecture_id ( id, title, file_type, file_url )
      `)
      .in("teacher_id", teacherIds)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const quizzesWithMeta = await Promise.all(
      quizzes.map(async (q) => {
        const { count } = await supabaseAdmin
          .from("questions")
          .select("id", { count: "exact", head: true })
          .eq("quiz_id", q.id);

        const now = new Date();
        let status = "draft";
        if (q.start_time && q.end_time) {
          if (now < new Date(q.start_time)) status = "scheduled";
          else if (now > new Date(q.end_time)) status = "ended";
          else status = "active";
        }
        return { ...q, question_count: count || 0, status };
      })
    );

    res.json({ success: true, quizzes: quizzesWithMeta });
  } catch (err) {
    console.error("getTeacherQuizzes error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE a quiz (teacher only)
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const teacherIds = authUserIds(req);
    if (!teacherIds.length) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { data: quiz, error: fetchErr } = await supabaseAdmin
      .from("quizzes")
      .select("id, teacher_id")
      .eq("id", quizId)
      .in("teacher_id", teacherIds)
      .maybeSingle();

    if (fetchErr) {
      return res.status(500).json({ error: fetchErr.message });
    }
    if (!quiz) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await supabaseAdmin.from("questions").delete().eq("quiz_id", quizId);
    await supabaseAdmin.from("quiz_assignments").delete().eq("quiz_id", quizId);
    const { error } = await supabaseAdmin.from("quizzes").delete().eq("id", quizId);
    if (error) throw new Error(error.message);

    res.json({ message: "Quiz deleted successfully" });
  } catch (err) {
    console.error("Delete quiz error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Schedule / send quiz to students (teacher only)
// ─────────────────────────────────────────────────────────────────────────────
exports.scheduleQuiz = async (req, res) => {
  try {
    const { quizId, startTime, endTime, studentIds, assignedSubject } = req.body;

    if (!quizId || !startTime || !endTime) {
      return res.status(400).json({ error: "quizId, startTime, and endTime are required" });
    }
    if (!studentIds || !studentIds.length) {
      return res.status(400).json({ error: "At least one student must be selected" });
    }

    const teacherIds = authUserIds(req);
    if (!teacherIds.length) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { data: quiz, error: fetchErr } = await supabaseAdmin
      .from("quizzes")
      .select("id, teacher_id, title")
      .eq("id", quizId)
      .in("teacher_id", teacherIds)
      .maybeSingle();

    if (fetchErr) {
      return res.status(500).json({ error: fetchErr.message });
    }
    if (!quiz) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const trimmedSubject =
      assignedSubject != null && String(assignedSubject).trim()
        ? String(assignedSubject).trim()
        : null;

    const baseUpdate = { start_time: startTime, end_time: endTime };
    let { error: updateErr } = await supabaseAdmin
      .from("quizzes")
      .update(
        trimmedSubject ? { ...baseUpdate, assigned_subject: trimmedSubject } : baseUpdate
      )
      .eq("id", quizId);

    if (updateErr && trimmedSubject) {
      ({ error: updateErr } = await supabaseAdmin
        .from("quizzes")
        .update(baseUpdate)
        .eq("id", quizId));
    }

    if (updateErr) throw new Error(updateErr.message);

    await supabaseAdmin.from("quiz_assignments").delete().eq("quiz_id", quizId);
    const assignments = studentIds.map(studentId => ({ quiz_id: quizId, student_id: studentId }));
    const { error: assignErr } = await supabaseAdmin.from("quiz_assignments").insert(assignments);
    if (assignErr) throw new Error(assignErr.message);

    res.json({
      success: true,
      message: `"${quiz.title}" scheduled and sent to ${studentIds.length} student(s).`
    });
  } catch (err) {
    console.error("scheduleQuiz error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get quizzes for a student (only assigned quizzes)
// ─────────────────────────────────────────────────────────────────────────────
exports.getQuizzesForStudent = async (req, res) => {
  try {
    const studentIdCandidates = userIdCandidates(req.user.id);

    let assignments = [];
    let assignErr = null;
    for (const sid of studentIdCandidates) {
      const { data, error } = await supabaseAdmin
        .from("quiz_assignments")
        .select("quiz_id")
        .eq("student_id", sid);
      if (error) {
        assignErr = error;
        break;
      }
      if (data && data.length > 0) {
        assignments = data;
        break;
      }
    }

    if (assignErr) {
      console.error("Assignment fetch error:", assignErr);
      return res.json([]);
    }
    if (!assignments || assignments.length === 0) {
      return res.json([]);
    }

    const quizIds = [...new Set(assignments.map((a) => a.quiz_id).filter(Boolean))];

    const { data: quizRows, error: quizErr } = await supabaseAdmin
      .from("quizzes")
      .select("id, title, start_time, end_time, teacher_id, lecture_id")
      .in("id", quizIds);

    if (quizErr) {
      console.error("Quiz fetch error (student list):", quizErr);
      return res.json([]);
    }

    const teacherIds = [...new Set((quizRows || []).map((q) => q.teacher_id).filter(Boolean))];
    const lectureIds = [...new Set((quizRows || []).map((q) => q.lecture_id).filter(Boolean))];

    const teacherById = {};
    if (teacherIds.length) {
      const { data: teachers, error: tErr } = await supabaseAdmin
        .from("users")
        .select("id, full_name, email, subject")
        .in("id", teacherIds);
      if (tErr) console.error("Teacher lookup (student quizzes):", tErr);
      (teachers || []).forEach((u) => {
        if (u?.id == null) return;
        teacherById[u.id] = u;
        teacherById[String(u.id)] = u;
        const n = Number(u.id);
        if (Number.isFinite(n)) teacherById[n] = u;
      });
    }

    const lectureById = {};
    if (lectureIds.length) {
      const { data: lectures, error: lErr } = await supabaseAdmin
        .from("lectures")
        .select("id, title")
        .in("id", lectureIds);
      if (lErr) console.error("Lecture lookup (student quizzes):", lErr);
      (lectures || []).forEach((lec) => {
        lectureById[lec.id] = lec;
      });
    }

    const assignedByQuizId = {};
    const { data: subjectRows, error: subjectErr } = await supabaseAdmin
      .from("quizzes")
      .select("id, assigned_subject")
      .in("id", quizIds);
    if (!subjectErr && subjectRows) {
      subjectRows.forEach((row) => {
        if (row.id != null && row.assigned_subject != null && String(row.assigned_subject).trim()) {
          assignedByQuizId[row.id] = String(row.assigned_subject).trim();
        }
      });
    }

    const formatSubjectList = (raw) => {
      if (raw == null || !String(raw).trim()) return null;
      const s = String(raw).split("|").map((x) => x.trim()).filter(Boolean).join(" · ");
      return s || null;
    };

    const now = new Date();
    const quizzes = (quizRows || [])
      .filter((q) => q.start_time && q.end_time)
      .map((q) => {
        const tid = q.teacher_id;
        const teacher =
          tid == null
            ? null
            : teacherById[tid] ?? teacherById[String(tid)] ?? (Number.isFinite(Number(tid)) ? teacherById[Number(tid)] : null);
        const lecture = q.lecture_id != null ? lectureById[q.lecture_id] : null;
        const lectureTitle = lecture?.title || null;
        const teacherSubjects = formatSubjectList(teacher?.subject);
        const assignedLabel = assignedByQuizId[q.id] || null;
        const teacherName = (teacher?.full_name && String(teacher.full_name).trim()) || null;
        return {
          id: q.id,
          title: q.title,
          start_time: q.start_time,
          end_time: q.end_time,
          status: now < new Date(q.start_time) ? "upcoming" :
                  now > new Date(q.end_time) ? "ended" : "active",
          teacher_name: teacherName,
          teacher_email: teacher?.email || null,
          teacher_subjects: teacher?.subject || null,
          /** Subject when sent, then teacher profile, then lecture title (file/topic name — not a course label). */
          subject_label: assignedLabel || teacherSubjects || lectureTitle || null,
        };
      });

    res.json(quizzes);
  } catch (err) {
    console.error("Get quizzes for student error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get a single quiz (student only, must be assigned and within time window)
// ─────────────────────────────────────────────────────────────────────────────
exports.getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.user.id;

    console.log(`🔍 Student ${studentId} requesting quiz ${quizId}`);

    // 1. Check assignment (student_id type may differ from JWT id)
    let assignment = null;
    let assignErr = null;
    for (const sid of userIdCandidates(studentId)) {
      const { data, error } = await supabaseAdmin
        .from("quiz_assignments")
        .select("quiz_id")
        .eq("quiz_id", quizId)
        .eq("student_id", sid)
        .maybeSingle();
      if (error) {
        assignErr = error;
        break;
      }
      if (data) {
        assignment = data;
        break;
      }
    }

    if (assignErr) {
      console.error("❌ Assignment check error:", assignErr);
      return res.status(500).json({ error: "Failed to verify quiz assignment", details: assignErr.message });
    }

    if (!assignment) {
      console.warn(`⚠️ No assignment found for student ${studentId} on quiz ${quizId}`);
      return res.status(403).json({ message: "You are not assigned to this quiz" });
    }

    // 2. Fetch quiz details using admin client to bypass RLS
    const { data: quiz, error: quizError } = await supabaseAdmin
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizError) {
      console.error("❌ Quiz fetch error:", quizError);
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!quiz) {
      console.warn(`⚠️ Quiz ${quizId} does not exist`);
      return res.status(403).json({ message: "Forbidden" });
    }

    console.log(`📖 Quiz found: ${quiz.title} (start: ${quiz.start_time}, end: ${quiz.end_time})`);

    // 3. Check time window only if both times are set
    if (quiz.start_time && quiz.end_time) {
      const now = new Date();
      const startTime = new Date(quiz.start_time);
      const endTime = new Date(quiz.end_time);

      if (startTime > now) {
        return res.status(400).json({
          message: "Quiz has not started yet",
          startTime: quiz.start_time,
          status: "upcoming"
        });
      }
      if (endTime < now) {
        return res.status(400).json({
          message: "Quiz has already ended",
          endTime: quiz.end_time,
          status: "ended"
        });
      }
    }

    // 4. Fetch questions using admin client — include correct_answer for grading (strip before sending)
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from("questions")
      .select("id, question_text, option_a, option_b, option_c, option_d, points")
      .eq("quiz_id", quizId);

    if (questionsError) {
      console.error("❌ Questions fetch error:", questionsError);
      return res.status(500).json({ error: questionsError.message });
    }

    if (!questions || questions.length === 0) {
      console.warn(`⚠️ Quiz ${quizId} has no questions`);
      return res.status(403).json({ message: "Forbidden" });
    }

    console.log(`✅ Returning ${questions.length} questions for quiz ${quizId}`);

    // Shuffle questions
    const shuffled = [...questions].sort(() => Math.random() - 0.5);

    res.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        start_time: quiz.start_time,
        end_time: quiz.end_time
      },
      questions: shuffled
    });
  } catch (err) {
    console.error("🔥 Unexpected error in getQuiz:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Submit quiz answers (student only, must be assigned)
// ─────────────────────────────────────────────────────────────────────────────
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const userId = req.user.id;

    if (!quizId || !answers) {
      return res.status(400).json({ message: "quizId and answers are required" });
    }

    // Check assignment
    let assignment = null;
    let assignErr = null;
    for (const sid of userIdCandidates(userId)) {
      const { data, error } = await supabaseAdmin
        .from("quiz_assignments")
        .select("quiz_id")
        .eq("quiz_id", quizId)
        .eq("student_id", sid)
        .maybeSingle();
      if (error) {
        assignErr = error;
        break;
      }
      if (data) {
        assignment = data;
        break;
      }
    }

    if (assignErr || !assignment) {
      return res.status(403).json({ message: "You are not assigned to this quiz" });
    }

    // Check if already submitted
    let existingResult = null;
    for (const uid of userIdCandidates(userId)) {
      const { data } = await supabaseAdmin
        .from("results")
        .select("id, score, total")
        .eq("user_id", uid)
        .eq("quiz_id", quizId)
        .maybeSingle();
      if (data) {
        existingResult = data;
        break;
      }
    }

    if (existingResult) {
      return res.status(400).json({
        message: "You have already taken this quiz",
        previousScore: existingResult.score,
        previousTotal: existingResult.total
      });
    }

    // Fetch quiz
    const { data: quiz, error: quizError } = await supabaseAdmin
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizError || !quiz) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const now = new Date();
    let attendanceStatus = "present";
    if (quiz.start_time && quiz.end_time) {
      const startTime = new Date(quiz.start_time);
      const endTime = new Date(quiz.end_time);
      attendanceStatus = (now >= startTime && now <= endTime) ? "present" : "absent";
    }

    // Fetch questions WITH correct_answer for grading (points = per-question weight)
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from("questions")
      .select("id, question_text, option_a, option_b, option_c, option_d, correct_answer, points")
      .eq("quiz_id", quizId);

    if (questionsError) {
      return res.status(500).json({ error: questionsError.message });
    }

    if (!questions || questions.length === 0) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Grade answers (weighted by `points` per question)
    let score = 0;
    let total = 0;
    const detailedAnswers = [];

    questions.forEach(q => {
      const w = questionPoints(q);
      total += w;
      const userAnswer = answers[q.id] || null;
      const isCorrect = userAnswer === q.correct_answer;
      if (isCorrect) score += w;
      detailedAnswers.push({
        questionId: q.id,
        questionText: q.question_text,
        userAnswer,
        correctAnswer: q.correct_answer,
        isCorrect,
        pointsAvailable: w,
        pointsEarned: isCorrect ? w : 0,
      });
    });

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    // Save result
    const { error: resultError } = await supabaseAdmin
  .from("results")
  .insert([{
    user_id: userId,
    quiz_id: quizId,
    score,
    total,
    submitted_at: new Date()
  }]);

    if (resultError) {
      console.error("Result save error:", resultError);
      return res.status(500).json({ error: resultError.message });
    }

    // Save attendance
    const { error: attendanceError } = await supabaseAdmin
      .from("attendance")
      .insert([{
        user_id: userId,
        quiz_id: quizId,
        status: attendanceStatus,
        timestamp: new Date()
      }]);

    if (attendanceError) {
      console.error("Attendance save error:", attendanceError);
      // Non-fatal — continue
    }

    // Update gamification
    let game = null;
    try {
      game = await updateGamification(userId, score, total);
    } catch (gamErr) {
      console.error("Gamification update error:", gamErr.message);
    }

    res.json({
      success: true,
      score,
      total,
      percentage,
      passed: percentage >= PASSING_PERCENT,
      attendance: attendanceStatus,
      answers: detailedAnswers,
      game
    });
  } catch (err) {
    console.error("Submit quiz error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Attendance endpoints
// ─────────────────────────────────────────────────────────────────────────────
exports.getAttendanceReport = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { data, error } = await supabaseAdmin
      .from("attendance")
      .select(`*, users:user_id (email, full_name)`)
      .eq("quiz_id", quizId);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAttendanceStats = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { data, error } = await supabaseAdmin
      .from("attendance")
      .select("status")
      .eq("quiz_id", quizId);
    if (error) return res.status(400).json({ error: error.message });
    const present = data.filter(a => a.status === "present").length;
    const absent = data.filter(a => a.status === "absent").length;
    res.json({
      total: data.length,
      present,
      absent,
      attendanceRate: data.length > 0 ? Math.round((present / data.length) * 100) : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const ids = userIdCandidates(userId);
    if (!ids.length) return res.json([]);

    const { data, error } = await supabaseAdmin
      .from("attendance")
      .select("quiz_id, status, timestamp")
      .in("user_id", ids)
      .order("timestamp", { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeacherAttendanceTimeline = async (req, res) => {
  try {
    const teacherIds = authUserIds(req);
    if (!teacherIds.length) return res.json([]);

    const { data: quizzes, error: qErr } = await supabaseAdmin
      .from("quizzes")
      .select("id")
      .in("teacher_id", teacherIds);
    if (qErr) return res.status(400).json({ error: qErr.message });
    const quizIds = (quizzes || []).map((q) => q.id);
    if (!quizIds.length) return res.json([]);

    const { data: records, error: aErr } = await supabaseAdmin
      .from("attendance")
      .select("quiz_id, status, timestamp")
      .in("quiz_id", quizIds)
      .order("timestamp", { ascending: true });
    if (aErr) return res.status(400).json({ error: aErr.message });

    const byDate = {};
    (records || []).forEach((r) => {
      const key = new Date(r.timestamp).toISOString().slice(0, 10);
      if (!byDate[key]) byDate[key] = { date: key, present: 0, absent: 0 };
      if (r.status === "present") byDate[key].present += 1;
      else byDate[key].absent += 1;
    });
    res.json(Object.values(byDate));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Teacher: quiz detail (for edit / post-save)
// ─────────────────────────────────────────────────────────────────────────────
exports.getTeacherQuizDetail = async (req, res) => {
  try {
    const { quizId } = req.params;
    const teacherIds = authUserIdsNormalized(req);
    if (!teacherIds.length) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { data: quizRow, error: qe } = await supabaseAdmin
      .from("quizzes")
      .select("id, title, lecture_id, start_time, end_time, teacher_id")
      .eq("id", quizId)
      .in("teacher_id", teacherIds)
      .maybeSingle();

    if (qe) {
      return res.status(500).json({ error: qe.message });
    }
    if (!quizRow) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const quiz = {
      id: quizRow.id,
      title: quizRow.title,
      lecture_id: quizRow.lecture_id,
      start_time: quizRow.start_time,
      end_time: quizRow.end_time,
    };

    const { data: rows, error: qErr } = await supabaseAdmin
      .from("questions")
      .select("id, question_text, option_a, option_b, option_c, option_d, correct_answer, points")
      .eq("quiz_id", quizId)
      .order("id", { ascending: true });

    if (qErr) {
      return res.status(500).json({ error: qErr.message });
    }

    res.json({
      success: true,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        lecture_id: quiz.lecture_id,
        start_time: quiz.start_time,
        end_time: quiz.end_time,
      },
      questions: (rows || []).map(mapQuestionRowToClient),
    });
  } catch (err) {
    console.error("getTeacherQuizDetail error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Teacher: update draft quiz questions + title
// ─────────────────────────────────────────────────────────────────────────────
exports.patchTeacherQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { quizTitle, questions } = req.body;

    const teacherIds = authUserIds(req);
    if (!teacherIds.length) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { data: quizRow, error: qe } = await supabaseAdmin
      .from("quizzes")
      .select("id, teacher_id")
      .eq("id", quizId)
      .in("teacher_id", teacherIds)
      .maybeSingle();

    if (qe) {
      return res.status(500).json({ error: qe.message });
    }
    if (!quizRow) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (quizTitle != null && String(quizTitle).trim()) {
      const { error: te } = await supabaseAdmin
        .from("quizzes")
        .update({ title: String(quizTitle).trim() })
        .eq("id", quizId);
      if (te) throw new Error(te.message);
    }

    if (Array.isArray(questions) && questions.length) {
      const optionLetters = ["A", "B", "C", "D"];
      for (const q of questions) {
        if (q == null || q.id == null) continue;
        let correctLetter = q.correct_answer;
        const opts = Array.isArray(q.options) ? q.options : [];
        if (correctLetter && String(correctLetter).length > 1) {
          const idx = opts.findIndex((o) => o === correctLetter);
          correctLetter = idx >= 0 ? optionLetters[idx] : "A";
        }
        if (!["A", "B", "C", "D"].includes(correctLetter)) correctLetter = "A";

        const { error: up } = await supabaseAdmin
          .from("questions")
          .update({
            question_text: q.question != null ? String(q.question) : "",
            option_a: opts[0] != null ? String(opts[0]) : "",
            option_b: opts[1] != null ? String(opts[1]) : "",
            option_c: opts[2] != null ? String(opts[2]) : "",
            option_d: opts[3] != null ? String(opts[3]) : "",
            correct_answer: correctLetter,
            points: questionPoints(q),
          })
          .eq("id", q.id)
          .eq("quiz_id", quizId);

        if (up) throw new Error(up.message);
      }
    }

    const { data: rows, error: rErr } = await supabaseAdmin
      .from("questions")
      .select("id, question_text, option_a, option_b, option_c, option_d, correct_answer, points")
      .eq("quiz_id", quizId)
      .order("id", { ascending: true });

    if (rErr) throw new Error(rErr.message);

    const { data: qRow } = await supabaseAdmin
      .from("quizzes")
      .select("id, title, lecture_id, start_time, end_time")
      .eq("id", quizId)
      .single();

    res.json({
      success: true,
      message: "Quiz updated",
      quiz: qRow
        ? {
            id: qRow.id,
            title: qRow.title,
            lecture_id: qRow.lecture_id,
            start_time: qRow.start_time,
            end_time: qRow.end_time,
          }
        : { id: quizId },
      questions: (rows || []).map(mapQuestionRowToClient),
    });
  } catch (err) {
    console.error("patchTeacherQuiz error:", err);
    res.status(500).json({ error: err.message });
  }
};

function findResultForStudent(resultsRows, studentId) {
  const cands = userIdCandidates(studentId);
  for (const r of resultsRows || []) {
    if (!r) continue;
    for (const c of cands) {
      if (c != null && String(r.user_id) === String(c)) return r;
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Teacher: assigned students + pass/fail (75% of weighted total)
// ─────────────────────────────────────────────────────────────────────────────
exports.getTeacherQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;

    const teacherIds = authUserIds(req);
    if (!teacherIds.length) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { data: quizRow, error: qe } = await supabaseAdmin
      .from("quizzes")
      .select("id, title, start_time, end_time, teacher_id")
      .eq("id", quizId)
      .in("teacher_id", teacherIds)
      .maybeSingle();

    if (qe) {
      return res.status(500).json({ error: qe.message });
    }
    if (!quizRow) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const quiz = {
      id: quizRow.id,
      title: quizRow.title,
      start_time: quizRow.start_time,
      end_time: quizRow.end_time,
    };
    const { data: assignments, error: ae } = await supabaseAdmin
      .from("quiz_assignments")
      .select("student_id")
      .eq("quiz_id", quizId);
    if (ae) throw new Error(ae.message);

    const studentIds = [...new Set((assignments || []).map((a) => a.student_id).filter((x) => x != null))];

    const { data: users, error: ue } =
      studentIds.length > 0
        ? await supabaseAdmin.from("users").select("id, full_name, email").in("id", studentIds)
        : { data: [], error: null };
    if (ue) throw new Error(ue.message);

    const { data: resultsRows, error: re } = await supabaseAdmin
      .from("results")
      .select("user_id, score, total, submitted_at")
      .eq("quiz_id", quizId);
    if (re) throw new Error(re.message);

    const userById = new Map();
    (users || []).forEach((u) => {
      userById.set(String(u.id), u);
      if (Number.isFinite(Number(u.id))) userById.set(Number(u.id), u);
    });

    const students = studentIds.map((sid) => {
      const u = userById.get(String(sid)) || userById.get(Number(sid)) || {};
      const resRow = findResultForStudent(resultsRows, sid);
      const total = resRow && Number(resRow.total) > 0 ? Number(resRow.total) : null;
      const score = resRow != null && resRow.score != null ? Number(resRow.score) : null;
      const pct = total != null && total > 0 && score != null ? Math.round((score / total) * 100) : null;
      const submitted = Boolean(resRow?.submitted_at);
      const passed = submitted && pct != null ? pct >= PASSING_PERCENT : null;

      return {
        student_id: sid,
        full_name: u.full_name || "Student",
        email: u.email || "",
        submitted,
        submitted_at: resRow?.submitted_at || null,
        score,
        total,
        percentage: pct,
        passed,
        status: submitted ? (passed ? "passed" : "failed") : "pending",
      };
    });

    res.json({
      success: true,
      quiz: { id: quiz.id, title: quiz.title, start_time: quiz.start_time, end_time: quiz.end_time },
      passingPercent: PASSING_PERCENT,
      students,
    });
  } catch (err) {
    console.error("getTeacherQuizResults error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Generate quiz from raw text
// ─────────────────────────────────────────────────────────────────────────────
exports.generateQuizFromText = async (req, res) => {
  try {
    const { text, type = "multiple-choice", count = 5, difficulty = "medium" } = req.body;
    const raw = parseInt(count, 10);
    const safeCount = Number.isFinite(raw)
      ? Math.min(10, Math.max(1, raw))
      : 5;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Text content is required" });
    }
    const questions = await aiService.generateQuestions(
      text,
      type,
      safeCount,
      difficulty
    );
    res.json({ success: true, questions, generatedAt: new Date().toISOString() });
  } catch (err) {
    const isRateLimit = err.message.includes('quota') || err.message.includes('429');
    res.status(isRateLimit ? 429 : 500).json({ error: err.message, isRateLimit });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get AI model status
// ─────────────────────────────────────────────────────────────────────────────
exports.getAIStatus = async (req, res) => {
  try {
    const status = aiService.getStatus();
    res.json({ success: true, status, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};