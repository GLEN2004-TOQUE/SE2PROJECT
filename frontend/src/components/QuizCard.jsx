import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function QuizCard() {
  const navigate = useNavigate();
  const [quizId, setQuizId] = useState("");
  const [quizError, setQuizError] = useState("");

  const handleStartQuiz = () => {
    const id = quizId.trim();
    if (!id) {
      setQuizError("Please enter a Quiz ID");
      return;
    }
    setQuizError("");
    navigate(`/quiz/${id}`);
  };

  const IconPlay = () => (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M6.3 4.5l9 5.5-9 5.5V4.5z"/>
    </svg>
  );

  return (
    <div className="sd-card">
      <div className="sd-card-header">
        <div className="sd-card-icon">
          <IconPlay />
        </div>
        <div>
          <div className="sd-card-title">Take a Quiz</div>
          <div className="sd-card-sub">Enter your quiz ID to begin</div>
        </div>
      </div>
      <input
        className="sd-quiz-input"
        type="text"
        placeholder="Paste Quiz ID here…"
        value={quizId}
        onChange={(e) => { setQuizId(e.target.value); setQuizError(""); }}
        onKeyDown={(e) => e.key === "Enter" && handleStartQuiz()}
      />
      {quizError && <p className="sd-quiz-err">{quizError}</p>}
      <button className="sd-btn-primary" onClick={handleStartQuiz}>
        Start Quiz
      </button>
    </div>
  );
}