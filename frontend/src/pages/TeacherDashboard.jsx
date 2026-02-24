import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; 

function TeacherDashboard() {
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // Get the current user from Supabase auth
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          // If no user, redirect to login
          navigate("/");
          return;
        }

        // Fetch the user's profile from the 'profiles' table
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        setFullName(data.full_name || "Teacher");
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Could not load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

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
          <p className="text-white text-xl">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4A0404] to-[#800000] flex items-center justify-center px-4">
        <div className="bg-white/95 p-8 rounded-3xl shadow-2xl border-2 border-[#FFD700] text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#FFD700] text-[#4A0404] rounded-xl font-semibold hover:bg-[#E5C100] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A0404] to-[#800000] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative Quiz Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#FFD700] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#FFD700] opacity-10 rounded-full blur-3xl"></div>
        <svg className="absolute top-1/4 left-10 text-[#FFD700] opacity-20 w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        <svg className="absolute bottom-1/4 right-10 text-[#FFD700] opacity-20 w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.07 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FFD700] rounded-full mb-4 shadow-lg border-4 border-white">
            <svg className="w-10 h-10 text-[#4A0404]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 4v16h16V4H4zm2 4h12v2H6V8zm0 4h12v2H6v-2zm0 4h8v2H6v-2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Teacher Dashboard</h1>
          <p className="text-[#FFD700]/90 text-xl">
            Welcome, <span className="font-bold">{fullName}</span>! 📚
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Upload Lecture Card */}
          <div
            onClick={() => navigate("/upload-lecture")}
            className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border-2 border-[#FFD700] hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-[#4A0404]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 10v9H5v-9h14zm-2-2H7v9h10V8zm-3 5h-4v-2h4v2zM4 6h16v2H4V6zm16-4v2H4V2h16z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#4A0404] mb-2">Upload Lecture</h2>
              <p className="text-gray-600 text-sm">Share new learning materials with students</p>
            </div>
          </div>

          {/* Generate Quiz Card */}
          <div
            onClick={() => navigate("/generate-quiz")}
            className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border-2 border-[#FFD700] hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-[#4A0404]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 13.5v-7l6 3.5-6 3.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#4A0404] mb-2">Generate Quiz</h2>
              <p className="text-gray-600 text-sm">Create interactive quizzes from lectures</p>
            </div>
          </div>

          {/* View Reports Card */}
          <div
            onClick={() => navigate("/view-reports")}
            className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border-2 border-[#FFD700] hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-[#4A0404]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#4A0404] mb-2">View Reports</h2>
              <p className="text-gray-600 text-sm">Analyze student performance and quiz results</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="text-center mt-10">
          <button
            onClick={handleLogout}
            className="px-8 py-3 bg-[#FFD700] hover:bg-[#E5C100] text-[#4A0404] font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border-2 border-[#4A0404]"
          >
            Logout
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 mt-8 text-sm">
          © 2024 Quiz Generator. Empower your teaching! 🍎
        </p>
      </div>
    </div>
  );
}

export default TeacherDashboard;