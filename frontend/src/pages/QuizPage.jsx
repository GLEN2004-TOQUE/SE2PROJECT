import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import ProtectedRoute from "../../components/ProtectedRoute"; // Assume wrapper, but component direct

function QuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [fullName, setFullName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/");
          return;
        }

        // Fetch profile with role
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();

        if (profile) {
          setFullName(profile.full_name || "User");
          setUserRole(profile.role || "student");
        }

        // Fetch quizzes
        const { data, error } = await supabase
          .from("quizzes")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setQuizzes(data || []);
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load quizzes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleTakeQuiz = (quizId) => {
    navigate(`/take-quiz/${quizId}`);
  };

  const handleManageQuiz = (quizId) => {
    navigate(`/quiz/${quizId}/manage`); // Placeholder for manage
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4A0404] to-[#800000] flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-[#FFD700] mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-white text-xl">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4A0404] to-[#800000] flex items-center justify-center px-4">
        <div className="bg-white/95 p-8 rounded-3xl shadow-2xl border-2 border-[#FFD700] text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-[#FFD700] text-[#4A0404] rounded-xl font-semibold hover:bg-[#E5C100] transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A0404] to-[#800000] flex flex-col items-center px-4 py-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#FFD700] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#FFD700] opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FFD700] rounded-full mb-6 shadow-lg border-4 border-white">
            <svg className="w-10 h-10 text-[#4A0404]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 13.5v-7l6 3.5-6 3.5z"/>
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">Quiz Hub</h1>
          <p className="text-[#FFD700]/90 text-2xl font-semibold">
            Hello, <span className="text-white">{fullName}</span> ({userRole})!
          </p>
        </div>

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {quizzes.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <svg className="w-24 h-24 text-[#FFD700]/50 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.07 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <h3 className="text-2xl font-bold text-white mb-2">No quizzes yet</h3>
              <p className="text-[#FFD700]/80 mb-6">{userRole === "teacher" ? "Generate your first quiz!" : "No quizzes available. Check back soon!"}</p>
              {userRole === "teacher" && (
                <button
                  onClick={() => navigate("/generate-quiz")}
                  className="px-8 py-3 bg-[#FFD700] hover:bg-[#E5C100] text-[#4A0404] font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Create Quiz
                </button>
              )}
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-[#FFD700]/50 hover:shadow-3xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer hover:bg-white">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-[#4A0404] group-hover:text-[#800000] transition-colors">{quiz.title}</h3>
                  <span className="px-3 py-1 bg-[#FFD700]/20 text-[#FFD700] rounded-full text-sm font-semibold">
                    {quiz.questions?.length || 0} Qs
                  </span>
                </div>
                <p className="text-gray-700 mb-6 line-clamp-3">{quiz.description || "Interactive quiz generated from lectures."}</p>
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#FFD700]/30">
                  {userRole === "student" ? (
                    <button
                      onClick={() => handleTakeQuiz(quiz.id)}
                      className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#E5C100] hover:from-[#E5C100] hover:to-[#FFD700] text-[#4A0404] font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-center"
                    >
                      Take Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => handleManageQuiz(quiz.id)}
                      className="flex-1 bg-gradient-to-r from-[#4A0404] to-[#800000] hover:from-[#800000] hover:to-[#A10000] text-[#FFD700] font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-center"
                    >
                      Manage Quiz
                    </button>
                  )}
                  <button className="px-4 py-3 text-gray-500 hover:text-gray-700 transition-colors">
                    ...
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(userRole === "teacher" ? "/generate-quiz" : "/student")}
            className="px-8 py-4 bg-[#FFD700]/90 hover:bg-[#FFD700] text-[#4A0404] font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg"
          >
            {userRole === "teacher" ? "+ New Quiz" : "Back to Dashboard"}
          </button>
          <button
            onClick={handleLogout}
            className="px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold rounded-2xl border-2 border-white/50 hover:border-white transition-all duration-300 text-lg"
          >
            Logout
          </button>
        </div>

        <p className="text-center text-white/50 mt-12 text-sm">
          © 2024 Quiz Generator. Challenge accepted! 🏆
        </p>
      </div>
    </div>
  );
}

export default QuizPage;

