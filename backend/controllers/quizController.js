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
    const { lectureId, questions } = req.body;

    if (!lectureId || !questions) {
      return res.status(400).json({ message: "Missing data" });
    }

    const formatted = questions.map(q => ({
      lecture_id: lectureId,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      type: q.type || "mcq"
    }));

    const { error } = await supabaseAdmin  
      .from("questions")
      .insert(formatted);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Questions saved successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};