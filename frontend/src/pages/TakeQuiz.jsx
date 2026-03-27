import React, { useState } from "react";

export default function AutoCheckQuiz() {
  // Questions + correct answers
  const questions = [
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5"],
      correct: "4",
    },
    {
      question: "Capital of Philippines?",
      options: ["Cebu", "Manila", "Davao"],
      correct: "Manila",
    },
    {
      question: "HTML stands for?",
      options: [
        "Hyper Trainer Marking Language",
        "Hyper Text Markup Language",
        "Hyper Text Marketing Language",
      ],
      correct: "Hyper Text Markup Language",
    },
  ];

  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  // Handle answer selection
  const handleSelect = (qIndex, option) => {
    setAnswers({
      ...answers,
      [qIndex]: option,
    });
  };

  // Auto-check logic
  const checkAnswers = () => {
    let newScore = 0;

    questions.forEach((q, index) => {
      if (answers[index] === q.correct) {
        newScore++;
      }
    });

    setScore(newScore);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Quiz</h1>

      {questions.map((q, qIndex) => (
        <div key={qIndex} style={{ marginBottom: "20px" }}>
          <h3>{q.question}</h3>

          {q.options.map((opt, i) => (
            <label key={i} style={{ display: "block" }}>
              <input
                type="radio"
                name={`question-${qIndex}`}
                value={opt}
                onChange={() => handleSelect(qIndex, opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}

      <button onClick={checkAnswers}>Submit</button>

      {score !== null && (
        <h2>
          Your Score: {score} / {questions.length}
        </h2>
      )}
    </div>
  );
}