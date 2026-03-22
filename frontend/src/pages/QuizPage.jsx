import { useEffect, useState } from "react";

function QuizPage({ quizId }) {
  const [questions, setQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetch(`http://localhost:5000/api/quiz/${quizId}`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions);
        setTimeLeft(data.quiz.duration * 60);
      });
  }, [quizId]);

  // TIMER
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // SUBMIT FUNCTION
  const submitQuiz = async () => {
    const res = await fetch("http://localhost:5000/api/quiz/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        quizId,
        answers
      })
    });

    const data = await res.json();
    alert(`Score: ${data.score}/${data.total}`);
  };

  return (
    <div>
      <h2>Time Left: {timeLeft}s</h2>

      {questions.map(q => (
        <div key={q.id}>
          <p>{q.question}</p>

          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
            >
              {opt}
            </button>
          ))}
        </div>
      ))}

      <button onClick={submitQuiz}>Submit</button>
    </div>
  );
}

export default QuizPage;