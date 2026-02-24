import { useState } from "react";
import { Link } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Role is fixed to "student" for registration
  const role = "student";

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration Successful! Welcome aboard! 🎉");
      } else {
        alert(data.message || "Registration Failed");
      }
    } catch (error) {
      console.log(error);
      alert("Server Error");
    } finally {
      setIsLoading(false);
    }
  };

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

      <div className="max-w-md w-full relative z-10">
        {/* Header with Registration Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FFD700] rounded-full mb-4 shadow-lg border-4 border-white">
            <svg className="w-10 h-10 text-[#4A0404]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Become a Quizzer</h1>
          <p className="text-[#FFD700]/90 text-lg">Join as a student and start challenging yourself</p>
        </div>

        {/* Register Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-[#FFD700]">
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#4A0404] mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#800000]/20 focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/30 transition-all duration-200 outline-none text-gray-800 placeholder-gray-400 bg-white"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#4A0404] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#800000]/20 focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/30 transition-all duration-200 outline-none text-gray-800 placeholder-gray-400 bg-white"
                required
              />
            </div>

            {/* Hidden role indicator (optional) */}
            <div className="text-xs text-center text-[#800000] bg-[#FFD700]/10 py-2 rounded-lg border border-[#FFD700]/30">
              🎓 Registering as a <span className="font-bold">Student</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#FFD700] hover:bg-[#E5C100] text-[#4A0404] font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg border-2 border-[#4A0404]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-[#4A0404]" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Join the Quiz"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already a member?{" "}
              <Link
                to="/"
                className="text-[#800000] hover:text-[#4A0404] font-semibold hover:underline transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Fun Fact / Quiz Teaser */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>✨ Over 10,000 questions waiting for you!</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 mt-8 text-sm">
          © 2024 Quiz Generator. Ready to test your knowledge? 🧠
        </p>
      </div>
    </div>
  );
}

export default Register;