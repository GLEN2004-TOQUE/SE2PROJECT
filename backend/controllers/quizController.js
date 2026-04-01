const { generateQuestions } = require("../services/aiServices");
const { supabaseAdmin, supabase } = require("../supabaseClient");
const { updateGamification } = require("../services/scoringServices");

exports.generateQuiz = async (req, res) => {
  try {
    const { lectureId, type, count } = req.body;

    const { data: lecture } = await supabaseAdmin
      .from("lectures")
      .select("*")
      .eq("id", lectureId)
      .single();

    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    const questions = await generateQuestions(lecture.extracted_text, type, count);
    res.json({ questions });

  } catch (err) {
    res.status(500).json({ error: "AI generation failed. Please create manually." });
  }
};

exports.saveQuestions = async (req, res) => {
  try {
    const { lectureId, quizTitle, questions } = req.body;

    if (!lectureId || !questions || !quizTitle) {
      return res.status(400).json({ message: "Missing data" });
    }

    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: "Missing courseId" });

    const { data: quiz, error: quizError } = await supabaseAdmin
      .from("quizzes")
      .insert([{ course_id: courseId, title: quizTitle }])
      .select()
      .single();

    if (quizError) return res.status(400).json({ error: quizError.message });

    const optionLetters = ["A", "B", "C", "D"];

    const formatted = questions.map(q => {
      let correctLetter = q.correct_answer;
      if (correctLetter.length > 1) {
        const idx = q.options.findIndex(o => o === correctLetter);
        correctLetter = idx >= 0 ? optionLetters[idx] : "A";
      }

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

    const { error } = await supabaseAdmin.from("questions").insert(formatted);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Questions saved successfully", quiz_id: quiz.id });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const { data: quiz } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    const now = new Date();

    if (new Date(quiz.start_time) > now) {
      return res.status(400).json({ message: "Quiz not started yet" });
    }

    if (new Date(quiz.end_time) < now) {
      return res.status(400).json({ message: "Quiz already ended" });
    }

    const { data: questions } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId);

    const shuffled = questions.sort(() => Math.random() - 0.5);

    res.json({ quiz, questions: shuffled });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    const { data: quiz } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    const now = new Date();

    let attendanceStatus = "absent";
    if (now >= new Date(quiz.start_time) && now <= new Date(quiz.end_time)) {
      attendanceStatus = "present";
    }

    const { data: questions } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId);

    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        score++;
      }
    });

    await supabase.from("results").insert([
      { user_id: req.user.id, quiz_id: quizId, score, total: questions.length }
    ]);

    await supabase.from("attendance").insert([
      { user_id: req.user.id, quiz_id: quizId, status: attendanceStatus }
    ]);

    const game = await updateGamification(req.user.id, score, questions.length);

    res.json({ score, total: questions.length, attendance: attendanceStatus, game });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAttendanceReport = async (req, res) => {
  try {
    const { quizId } = req.params;

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
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

    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("quiz_id", quizId);

    const present = data.filter(a => a.status === "present").length;
    const absent  = data.filter(a => a.status === "absent").length;

    res.json({ total: data.length, present, absent });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};