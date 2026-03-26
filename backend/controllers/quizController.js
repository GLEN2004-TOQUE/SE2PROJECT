const { generateQuestions } = require("../services/aiServices");
const { supabaseAdmin } = require("../supabaseClient");

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
    const { lectureId, quizTitle, questions } = req.body; // ← add quizTitle

    if (!lectureId || !questions || !quizTitle) {
      return res.status(400).json({ message: "Missing data" });
    }

    //  Get the course_id from the lecture's teacher —
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: "Missing courseId" });

    //  Create a quiz row first
    const { data: quiz, error: quizError } = await supabaseAdmin
      .from("quizzes")
      .insert([{ course_id: courseId, title: quizTitle }])
      .select()
      .single();

    if (quizError) return res.status(400).json({ error: quizError.message });

    //  Map AI output to your table's column structure
    const optionLetters = ["A", "B", "C", "D"];

    const formatted = questions.map(q => {
      // AI returns options as ["text A", "text B", "text C", "text D"]
      // correct_answer from AI is "A"/"B"/"C"/"D" or full text — normalize to letter
      let correctLetter = q.correct_answer;
      if (correctLetter.length > 1) {
        // AI returned full text — find which option matches
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

    // Get quiz
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

    // Get questions
    const { data: questions } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId);

    // RANDOMIZE
    const shuffled = questions.sort(() => Math.random() - 0.5);

    res.json({
      quiz,
      questions: shuffled
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    //  Get quiz info
    const { data: quiz } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    const now = new Date();

    //  Check schedule
    let attendanceStatus = "absent";

    if (
      now >= new Date(quiz.start_time) &&
      now <= new Date(quiz.end_time)
    ) {
      attendanceStatus = "present";
    }

    //  Get questions
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

    //  Save result
    await supabase.from("results").insert([
      {
        user_id: req.user.id,
        quiz_id: quizId,
        score,
        total: questions.length
      }
    ]);

    //  Save attendance
    await supabase.from("attendance").insert([
      {
        user_id: req.user.id,
        quiz_id: quizId,
        status: attendanceStatus
      }
    ]);

    res.json({
      score,
      total: questions.length,
      attendance: attendanceStatus
    });

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

    if (error) {
      return res.status(400).json({ error: error.message });
    }

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
    const absent = data.filter(a => a.status === "absent").length;

    res.json({
      total: data.length,
      present,
      absent
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// after score compute
const game = await updateGamification(req.user.id, score, questions.length);

res.json({
  score,
  total: questions.length,
  game
});