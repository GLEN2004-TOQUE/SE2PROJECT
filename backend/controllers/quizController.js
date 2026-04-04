// controllers/quizController.js
const aiService = require("../services/aiService");
const { supabaseAdmin, supabase } = require("../supabaseClient");
const { updateGamification } = require("../services/scoringServices");

// ─────────────────────────────────────────────────────────────────────────────
// Generate quiz questions using AI
// ─────────────────────────────────────────────────────────────────────────────
exports.generateQuiz = async (req, res) => {
  try {
    const { lectureId, type, count } = req.body;
    if (!lectureId) {
      return res.status(400).json({ error: "Lecture ID is required" });
    }

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

    console.log(`📝 Generating ${count || 5} questions for lecture: ${lecture.title}`);
    const questions = await aiService.generateQuestions(
      lecture.extracted_text,
      type || "multiple-choice",
      count || 5
    );

    res.json({
      success: true,
      questions,
      metadata: {
        lectureId,
        lectureTitle: lecture.title,
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
    const teacherId = req.user.id;

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
      };
    });

    const { error: insertError } = await supabaseAdmin
      .from("questions")
      .insert(formatted);

    if (insertError) {
      await supabaseAdmin.from("quizzes").delete().eq("id", quiz.id);
      return res.status(400).json({ error: insertError.message });
    }

    res.json({
      message: "Quiz saved successfully",
      quiz_id: quiz.id,
      questionsCount: formatted.length
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
    const teacherId = req.user.id;

    const { data: quizzes, error } = await supabaseAdmin
      .from("quizzes")
      .select(`
        id, title, created_at, start_time, end_time,
        lecture:lecture_id ( id, title, file_type, file_url )
      `)
      .eq("teacher_id", teacherId)
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
    const teacherId = req.user.id;

    const { data: quiz, error: fetchErr } = await supabaseAdmin
      .from("quizzes")
      .select("id, teacher_id")
      .eq("id", quizId)
      .eq("teacher_id", teacherId)
      .single();

    if (fetchErr || !quiz) {
      return res.status(404).json({ error: "Quiz not found or unauthorized" });
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
    const teacherId = req.user.id;
    const { quizId, startTime, endTime, studentIds } = req.body;

    if (!quizId || !startTime || !endTime) {
      return res.status(400).json({ error: "quizId, startTime, and endTime are required" });
    }
    if (!studentIds || !studentIds.length) {
      return res.status(400).json({ error: "At least one student must be selected" });
    }

    const { data: quiz, error: fetchErr } = await supabaseAdmin
      .from("quizzes")
      .select("id, teacher_id, title")
      .eq("id", quizId)
      .eq("teacher_id", teacherId)
      .single();

    if (fetchErr || !quiz) {
      return res.status(404).json({ error: "Quiz not found or unauthorized" });
    }

    const { error: updateErr } = await supabaseAdmin
      .from("quizzes")
      .update({ start_time: startTime, end_time: endTime })
      .eq("id", quizId);

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
    const studentId = req.user.id;

    const { data: assignments, error: assignErr } = await supabaseAdmin
      .from("quiz_assignments")
      .select(`
        quiz_id,
        quizzes!inner (
          id, title, start_time, end_time, teacher_id
        )
      `)
      .eq("student_id", studentId);

    if (assignErr) {
      console.error("Assignment fetch error:", assignErr);
      return res.json([]);
    }
    if (!assignments || assignments.length === 0) {
      return res.json([]);
    }

    const now = new Date();
    const quizzes = assignments
      .filter(a => a.quizzes)                     // safety: ensure quizzes object exists
      .map(a => a.quizzes)
      .filter(q => q.start_time && q.end_time)
      .map(q => ({
        id: q.id,
        title: q.title,
        start_time: q.start_time,
        end_time: q.end_time,
        status: now < new Date(q.start_time) ? "upcoming" :
                now > new Date(q.end_time) ? "ended" : "active"
      }));

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

    // 1. Check assignment
    const { data: assignment, error: assignErr } = await supabaseAdmin
      .from("quiz_assignments")
      .select("quiz_id")
      .eq("quiz_id", quizId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (assignErr) {
      console.error("❌ Assignment check error:", assignErr);
      return res.status(500).json({ error: "Failed to verify quiz assignment", details: assignErr.message });
    }

    if (!assignment) {
      console.warn(`⚠️ No assignment found for student ${studentId} on quiz ${quizId}`);
      return res.status(403).json({ message: "You are not assigned to this quiz" });
    }

    console.log(`✅ Assignment found: ${assignment.quiz_id}`);

    // 2. Fetch quiz details (using supabase client – not admin)
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizError) {
      console.error("❌ Quiz fetch error:", quizError);
      return res.status(404).json({ message: "Quiz not found", error: quizError.message });
    }

    if (!quiz) {
      console.warn(`⚠️ Quiz ${quizId} does not exist in quizzes table`);
      return res.status(404).json({ message: "Quiz not found" });
    }

    console.log(`📖 Quiz found: ${quiz.title} (start: ${quiz.start_time}, end: ${quiz.end_time})`);

    // 3. Check time window
    const now = new Date();
    const startTime = new Date(quiz.start_time);
    const endTime = new Date(quiz.end_time);

    if (startTime > now) {
      return res.status(400).json({ message: "Quiz not started yet", startTime: quiz.start_time });
    }
    if (endTime < now) {
      return res.status(400).json({ message: "Quiz already ended", endTime: quiz.end_time });
    }

    // 4. Fetch questions
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("id, question_text, option_a, option_b, option_c, option_d")
      .eq("quiz_id", quizId);

    if (questionsError) {
      console.error("❌ Questions fetch error:", questionsError);
      return res.status(500).json({ error: questionsError.message });
    }

    if (!questions || questions.length === 0) {
      console.warn(`⚠️ Quiz ${quizId} has no questions`);
      return res.status(404).json({ message: "This quiz has no questions" });
    }

    console.log(`✅ Returning ${questions.length} questions for quiz ${quizId}`);

    const shuffled = questions.sort(() => Math.random() - 0.5);
    res.json({
      quiz: { id: quiz.id, title: quiz.title, start_time: quiz.start_time, end_time: quiz.end_time },
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

    // Check assignment
    const { data: assignment, error: assignErr } = await supabaseAdmin
      .from("quiz_assignments")
      .select("quiz_id")
      .eq("quiz_id", quizId)
      .eq("student_id", userId)
      .maybeSingle();

    if (assignErr || !assignment) {
      return res.status(403).json({ message: "You are not assigned to this quiz" });
    }

    // Check if already submitted
    const { data: existingResult } = await supabase
      .from("results")
      .select("id")
      .eq("user_id", userId)
      .eq("quiz_id", quizId)
      .single();

    if (existingResult) {
      return res.status(400).json({ message: "You have already taken this quiz" });
    }

   const { data: quiz, error: quizError } = await supabaseAdmin
  .from("quizzes")
  .select("*")
  .eq("id", quizId)
  .single();

    if (quizError || !quiz) return res.status(404).json({ message: "Quiz not found" });

    const now = new Date();
    const startTime = new Date(quiz.start_time);
    const endTime = new Date(quiz.end_time);
    const attendanceStatus = (now >= startTime && now <= endTime) ? "present" : "absent";

    const { data: questions, error: questionsError } = await supabaseAdmin
  .from("questions")
  .select("id, question_text, option_a, option_b, option_c, option_d")
  .eq("quiz_id", quizId);

    if (questionsError) return res.status(500).json({ error: questionsError.message });

    let score = 0;
    const detailedAnswers = [];

    questions.forEach(q => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correct_answer;
      if (isCorrect) score++;
      detailedAnswers.push({
        questionId: q.id,
        userAnswer,
        correctAnswer: q.correct_answer,
        isCorrect
      });
    });

    const { error: resultError } = await supabase
      .from("results")
      .insert([{
        user_id: userId,
        quiz_id: quizId,
        score,
        total: questions.length,
        answers: detailedAnswers,
        submitted_at: new Date()
      }]);

    if (resultError) return res.status(500).json({ error: resultError.message });

    const { error: attendanceError } = await supabase
      .from("attendance")
      .insert([{
        user_id: userId,
        quiz_id: quizId,
        status: attendanceStatus,
        timestamp: new Date()
      }]);

    if (attendanceError) console.error("Attendance save error:", attendanceError);

    const game = await updateGamification(userId, score, questions.length);

    res.json({
      score,
      total: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      attendance: attendanceStatus,
      game,
      passed: score >= questions.length / 2
    });
  } catch (err) {
    console.error("Submit quiz error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Attendance endpoints (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
exports.getAttendanceReport = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { data, error } = await supabase
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
    const { data } = await supabase.from("attendance").select("status").eq("quiz_id", quizId);
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

// ─────────────────────────────────────────────────────────────────────────────
// Generate quiz from raw text (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
exports.generateQuizFromText = async (req, res) => {
  try {
    const { text, type = "multiple-choice", count = 5 } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Text content is required" });
    }
    const questions = await aiService.generateQuestions(text, type, count);
    res.json({ success: true, questions, generatedAt: new Date().toISOString() });
  } catch (err) {
    const isRateLimit = err.message.includes('quota') || err.message.includes('429');
    res.status(isRateLimit ? 429 : 500).json({ error: err.message, isRateLimit });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get AI model status (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
exports.getAIStatus = async (req, res) => {
  try {
    const status = aiService.getStatus();
    res.json({ success: true, status, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
