const aiService = require("../services/aiService");
const { supabaseAdmin, supabase } = require("../supabaseClient");
const { updateGamification } = require("../services/scoringServices");

// Generate quiz questions using AI with auto model switching
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

// Save generated questions to DB and create quiz
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

// ─── NEW: Get teacher's quizzes with lecture source info ──────────────────────
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

    // Attach question count per quiz
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

// ─── NEW: Schedule / send quiz to students ────────────────────────────────────
exports.scheduleQuiz = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { quizId, startTime, endTime } = req.body;

    if (!quizId || !startTime || !endTime) {
      return res.status(400).json({ error: "quizId, startTime, and endTime are required" });
    }

    // Verify ownership
    const { data: quiz, error: fetchErr } = await supabaseAdmin
      .from("quizzes")
      .select("id, teacher_id, title")
      .eq("id", quizId)
      .eq("teacher_id", teacherId)
      .single();

    if (fetchErr || !quiz) {
      return res.status(404).json({ error: "Quiz not found or unauthorized" });
    }

    const { data, error } = await supabaseAdmin
      .from("quizzes")
      .update({ start_time: startTime, end_time: endTime })
      .eq("id", quizId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    res.json({
      success: true,
      quiz: data,
      message: `"${quiz.title}" has been scheduled and sent to your students!`
    });
  } catch (err) {
    console.error("scheduleQuiz error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get quizzes for a student (from their assigned teacher)
exports.getQuizzesForStudent = async (req, res) => {
  try {
    const studentId = req.user.id;

    const { data: assignment, error: assignError } = await supabaseAdmin
      .from("teacher_student_assignments")
      .select("teacher_id")
      .eq("student_id", studentId)
      .maybeSingle();

    if (assignError || !assignment) return res.json([]);

    const { data: quizzes, error: quizError } = await supabaseAdmin
      .from("quizzes")
      .select("id, title, created_at, start_time, end_time")
      .eq("teacher_id", assignment.teacher_id)
      .order("created_at", { ascending: false });

    if (quizError) throw new Error(quizError.message);

    const now = new Date();
    const quizzesWithStatus = quizzes.map(quiz => ({
      ...quiz,
      status: now < new Date(quiz.start_time) ? "upcoming" :
              now > new Date(quiz.end_time) ? "ended" : "active"
    }));

    res.json(quizzesWithStatus);

  } catch (err) {
    console.error("Get quizzes for student error:", err);
    res.json([]);
  }
};

// Get quiz details (for students, only if within time window)
exports.getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizError || !quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const now = new Date();
    const startTime = new Date(quiz.start_time);
    const endTime = new Date(quiz.end_time);

    if (startTime > now) {
      return res.status(400).json({ message: "Quiz not started yet", startTime: quiz.start_time });
    }
    if (endTime < now) {
      return res.status(400).json({ message: "Quiz already ended", endTime: quiz.end_time });
    }

    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("id, question_text, option_a, option_b, option_c, option_d")
      .eq("quiz_id", quizId);

    if (questionsError) return res.status(500).json({ error: questionsError.message });

    const shuffled = questions.sort(() => Math.random() - 0.5);
    res.json({
      quiz: { id: quiz.id, title: quiz.title, start_time: quiz.start_time, end_time: quiz.end_time },
      questions: shuffled
    });

  } catch (err) {
    console.error("Get quiz error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Submit quiz answers
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const userId = req.user.id;

    const { data: existingResult } = await supabase
      .from("results")
      .select("id")
      .eq("user_id", userId)
      .eq("quiz_id", quizId)
      .single();

    if (existingResult) {
      return res.status(400).json({ message: "You have already taken this quiz" });
    }

    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizError || !quiz) return res.status(404).json({ message: "Quiz not found" });

    const now = new Date();
    const startTime = new Date(quiz.start_time);
    const endTime = new Date(quiz.end_time);
    const attendanceStatus = (now >= startTime && now <= endTime) ? "present" : "absent";

    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("*")
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

// Get attendance report for a quiz
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

// Get attendance stats for a quiz
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

exports.getAIStatus = async (req, res) => {
  try {
    const status = aiService.getStatus();
    res.json({ success: true, status, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};