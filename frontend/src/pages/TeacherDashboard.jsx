import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { getUser, logout, getLectures } from "../services/api";

const TeacherDashboard = () => {
	const [fullName, setFullName] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [lectures, setLectures] = useState([]);
	const navigate = useNavigate();

	// ── Decode JWT and validate role ──────────────────────────────────
	useEffect(() => {
		const u = getUser();
		if (!u) {
			navigate("/");
			return;
		}
		if (u.role !== "teacher") {
			navigate("/student");
			return;
		}
		// full_name may not be in the JWT payload; fall back gracefully
		setFullName(u.full_name || u.email || "Teacher");
		setLoading(false);
	}, [navigate]);

	// ── Fetch lectures ────────────────────────────────────────────────
	useEffect(() => {
		if (loading) return; // wait until auth check is done
		getLectures()
			.then(setLectures)
			.catch((err) => console.error("Lectures fetch error:", err));
	}, [loading]);

	const handleLogout = () => {
		logout();
		navigate("/");
	};

	// ── Loading ───────────────────────────────────────────────────────
	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-[#4A0404] to-[#800000] flex items-center justify-center">
				<div className="text-center">
					<svg className="animate-spin h-12 w-12 text-[#FFD700] mx-auto mb-4" viewBox="0 0 24 24">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
					</svg>
					<p className="text-white text-xl">Loading your dashboard…</p>
				</div>
			</div>
		);
	}

	// ── Error ─────────────────────────────────────────────────────────
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

	// ── Main UI ───────────────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-gradient-to-br from-[#4A0404] to-[#800000] flex items-center justify-center px-4 relative overflow-hidden">
			{/* Decorative elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-20 -right-20 w-64 h-64 bg-[#FFD700] opacity-10 rounded-full blur-3xl" />
				<div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#FFD700] opacity-10 rounded-full blur-3xl" />
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

				{/* Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					{/* Upload Lecture */}
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

					{/* Generate Quiz */}
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

					{/* Sign Out */}
					<div
						onClick={handleLogout}
						className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border-2 border-red-300 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
					>
						<div className="flex flex-col items-center text-center">
							<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
								<svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
								</svg>
							</div>
							<h2 className="text-xl font-bold text-red-600 mb-2">Sign Out</h2>
							<p className="text-gray-600 text-sm">End your current session</p>
						</div>
					</div>
				</div>

				{/* Recent Lectures */}
				{lectures.length > 0 && (
					<div className="bg-white/10 backdrop-blur rounded-2xl border border-white/15 p-6">
						<h2 className="text-white font-semibold text-lg mb-4">Recent Lectures</h2>
						<div className="space-y-2">
							{lectures.slice(0, 5).map((lec) => (
								<div key={lec.id} className="flex items-center justify-between bg-white/8 rounded-xl px-4 py-3">
									<span className="text-white/80 text-sm truncate">{lec.title}</span>
									<span className="text-white/30 text-xs ml-4 flex-shrink-0">
										{new Date(lec.created_at).toLocaleDateString()}
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default TeacherDashboard;