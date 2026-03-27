import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function GenerateQuiz() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], answer: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], answer: "" }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    if (field === "question" || field === "answer") {
      updated[index][field] = value;
    } else {
      // field format: option-0, option-1, etc
      const optionIndex = parseInt(field.split("-")[1]);
      updated[index].options[optionIndex] = value;
    }
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        navigate("/");
        return;
      }

      const { error: insertError } = await supabase
        .from("quizzes")
        .insert([
          {
            teacher_id: user.id,
            title,
            questions, // store questions as JSON
          },
        ]);

      if (insertError) throw insertError;

      alert("Quiz saved successfully!");
      navigate("/teacher-dashboard");
    } catch (err) {
      console.error("Error saving quiz:", err);
      setError("Failed to save quiz. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A0404] to-[#800000] flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Generate Quiz</h1>

      <input
        type="text"
        placeholder="Quiz Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full max-w-xl mb-6 p-3 rounded-xl text-[#4A0404] font-semibold"
      />

      {questions.map((q, i) => (
        <div key={i} className="bg-white/90 p-6 rounded-3xl shadow-md mb-6 w-full max-w-xl">
          <input
            type="text"
            placeholder={`Question ${i + 1}`}
            value={q.question}
            onChange={(e) => handleQuestionChange(i, "question", e.target.value)}
            className="w-full mb-4 p-2 rounded-md border border-gray-300"
          />
          {q.options.map((opt, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={`Option ${idx + 1}`}
              value={opt}
              onChange={(e) => handleQuestionChange(i, `option-${idx}`, e.target.value)}
              className="w-full mb-2 p-2 rounded-md border border-gray-300"
            />
          ))}
          <input
            type="text"
            placeholder="Correct Answer"
            value={q.answer}
            onChange={(e) => handleQuestionChange(i, "answer", e.target.value)}
            className="w-full mt-2 p-2 rounded-md border border-gray-300"
          />
        </div>
      ))}

      <button
        onClick={addQuestion}
        className="mb-4 px-6 py-2 bg-[#FFD700] text-[#4A0404] rounded-xl font-semibold hover:bg-[#E5C100] transition"
      >
        Add Question
      </button>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-8 py-3 bg-[#FFD700] text-[#4A0404] rounded-xl font-bold hover:bg-[#E5C100] transition"
      >
        {loading ? "Saving..." : "Save Quiz"}
      </button>
    </div>
  );
}

export default GenerateQuiz;