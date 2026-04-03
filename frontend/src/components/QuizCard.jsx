export default function QuizCard({ quiz }) {
  if (!quiz) return null;
  return (
    <div style={{
      background:"rgba(255,255,255,.05)",
      border:"1px solid rgba(255,255,255,.1)",
      borderRadius:12,
      padding:"1rem 1.25rem",
      color:"#fff"
    }}>
      <p style={{fontWeight:700,marginBottom:".35rem"}}>{quiz.title}</p>
      <p style={{fontSize:".75rem",opacity:.4}}>Quiz ID: {quiz.id}</p>
    </div>
  );
}