import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLectures, generateQuiz, saveQuiz } from "../services/api";

export default function GenerateQuiz() {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getLectures()
      .then(setLectures)
      .catch((err) => setError("Failed to load lectures: " + err.message));
  }, []);

  const handleGenerate = async () => {
    if (!selectedLecture) {
      setError("Please select a lecture.");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const data = await generateQuiz(selectedLecture, "multiple_choice", questionCount);
      // Expected format: { questions: [{ question, options, correct_answer }] }
      setQuestions(data.questions);
    } catch (err) {
      setError("AI generation failed: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    if (field === "question") updated[idx].question = value;
    else if (field === "options") updated[idx].options = value.split(",").map(s => s.trim());
    else if (field === "correct_answer") updated[idx].correct_answer = value;
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!quizTitle.trim()) {
      setError("Please enter a quiz title.");
      return;
    }
    if (questions.length === 0) {
      setError("No questions to save. Generate a quiz first.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await saveQuiz(selectedLecture, quizTitle, questions);
      navigate("/teacher");
    } catch (err) {
      setError("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b10] text-black p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Generate AI Quiz</h1>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Lecture selection */}
        <div className="bg-[#1a1a24] p-6 rounded-2xl mb-6">
          <label className="block mb-2 font-semibold">Select Lecture</label>
          <select
            value={selectedLecture}
            onChange={(e) => setSelectedLecture(e.target.value)}
            className="w-full p-2 rounded bg-white/10 border border-white/20 mb-4"
          >
            <option value="">-- Choose a lecture --</option>
            {lectures.map((lec) => (
              <option key={lec.id} value={lec.id}>{lec.title}</option>
            ))}
          </select>

          <label className="block mb-2 font-semibold">Quiz Title</label>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            className="w-full p-2 rounded bg-white/10 border border-white/20 mb-4"
            placeholder="e.g., Chapter 1 Review"
          />

          <label className="block mb-2 font-semibold">Number of Questions</label>
          <input
            type="number"
            min="1"
            max="20"
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            className="w-full p-2 rounded bg-white/10 border border-white/20 mb-4"
          />

          <button
            onClick={handleGenerate}
            disabled={!selectedLecture || generating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate Quiz"}
          </button>
        </div>

        {/* Preview & Edit */}
        {questions.length > 0 && (
          <div className="bg-[#1a1a24] p-6 rounded-2xl mb-6">
            <h2 className="text-xl font-bold mb-4">Preview & Edit Questions</h2>
            {questions.map((q, idx) => (
              <div key={idx} className="border border-white/20 p-4 rounded mb-4">
                <div className="mb-2">
                  <label className="block text-sm font-medium">Question {idx+1}</label>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateQuestion(idx, "question", e.target.value)}
                    className="w-full p-2 rounded bg-white/10 border border-white/20"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium">Options (comma separated)</label>
                  <input
                    type="text"
                    value={q.options.join(", ")}
                    onChange={(e) => updateQuestion(idx, "options", e.target.value)}
                    className="w-full p-2 rounded bg-white/10 border border-white/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Correct Answer (A, B, C, D)</label>
                  <input
                    type="text"
                    value={q.correct_answer}
                    onChange={(e) => updateQuestion(idx, "correct_answer", e.target.value)}
                    className="w-full p-2 rounded bg-white/10 border border-white/20"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2 bg-green-600 hover:bg-green-700 rounded font-semibold disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save & Send to Students"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}