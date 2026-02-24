import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Login clicked");

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log(data);

      if (data.token) {
        localStorage.setItem("token", data.token);
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        const userRole = payload.role;

        if (userRole === "teacher") {
          navigate("/teacher");
        } else if (userRole === "student") {
          navigate("/student");
        } else {
          console.log("Unknown role:", userRole);
        }
      } else {
        alert(data.message || "Login failed");
      }

    } catch (error) {
      console.log(error);
      alert("Server error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A0404] to-[#800000] flex items-center justify-center px-4 relative overflow-hidden">
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
        {/* Header with Quiz Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FFD700] rounded-full mb-4 shadow-lg border-4 border-white">
            <svg className="w-10 h-10 text-[#4A0404]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Quiz Master</h1>
          <p className="text-[#FFD700]/90 text-lg">Sign in to challenge yourself</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-[#FFD700]">
          <form onSubmit={handleLogin} className="space-y-6">
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
                  Starting Quiz...
                </span>
              ) : (
                "Let's Play!"
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              New here?{" "}
              <Link
                to="/register"
                className="text-[#800000] hover:text-[#4A0404] font-semibold hover:underline transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>

          {/* Quiz Stats Placeholder (just for fun) */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#FFD700]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.07 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              10k+ quizzes
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#FFD700]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-1 .05 1.16.84 2 1.87 2 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
              5k+ active users
            </span>
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

export default Login;