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