import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import QuizCard from '../components/QuizCard';
import BadgeCard from '../components/BadgeCard';
import { AuthContext } from '../context/AuthContext';
import quizService from '../services/quizService';
import { getUser, logout, getLeaderboard } from "../services/api";

const StudentDashboard = () => {
	const { user } = useContext(AuthContext);
	const [quizzes, setQuizzes] = useState([]);
	const [badges, setBadges] = useState([]);
	const [leaderboard, setLeaderboard] = useState([]);
	const [lbType, setLbType] = useState("overall");
	const [lbLoading, setLbLoading] = useState(false);
	const [quizId, setQuizId] = useState("");
	const [quizError, setQuizError] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [userData, setUserData] = useState(null);
	const navigate = useNavigate();

	// ✅ Fetch user
	useEffect(() => {
		const fetchUser = async () => {
			try {
				const u = getUser();
				if (!u) {
					navigate("/");
					return;
				}
				if (u.role !== "student") {
					navigate("/teacher");
					return;
				}
				setUserData(u);
			} catch (err) {
				setError("Failed to load user data");
			} finally {
				setLoading(false);
			}
		};
		fetchUser();
	}, [navigate]);

	// ✅ Fetch leaderboard
	useEffect(() => {
		setLbLoading(true);
		getLeaderboard(lbType)
			.then(setLeaderboard)
			.catch(() => setLeaderboard([]))
			.finally(() => setLbLoading(false));
	}, [lbType]);

	// ✅ Fetch quizzes
	useEffect(() => {
		const fetchQuizzes = async () => {
			try {
				setLoading(true);
				const data = await quizService.getAll();
				setQuizzes(data || []);
			} catch (err) {
				console.error(err);
				setError("Failed to load quizzes");
			} finally {
				setLoading(false);
			}
		};
		fetchQuizzes();
	}, []);

	const handleLogout = () => {
		logout();
		navigate("/");
	};

	const handleTakeQuiz = () => {
		if (!quizId.trim()) {
			setQuizError("Please enter a Quiz ID");
			return;
		}
		setQuizError("");
		navigate(`/take-quiz/${quizId}`);
	};

	const tierBg = (tier) => {
		switch (tier?.toLowerCase()) {
			case 'gold': return 'bg-[#C9A227]/20 border-[#C9A227]/40';
			case 'silver': return 'bg-gray-400/20 border-gray-400/40';
			case 'bronze': return 'bg-[#b96a30]/20 border-[#b96a30]/40';
			default: return 'bg-white/10 border-white/20';
		}
	};

	const tierColor = (tier) => {
		switch (tier?.toLowerCase()) {
			case 'gold': return 'text-[#C9A227] border-[#C9A227]';
			case 'silver': return 'text-gray-400 border-gray-400';
			case 'bronze': return 'text-[#b96a30] border-[#b96a30]';
			default: return 'text-white/50 border-white/20';
		}
	};

	// ✅ Loading screen
	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-[#4A0404] to-[#800000] flex items-center justify-center">
				<p className="text-white text-xl">Loading your dashboard...</p>
			</div>
		);
	}

	// ✅ Error screen (FIXED)
	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-[#4A0404] to-[#800000] flex items-center justify-center px-4">
				<div className="bg-white/95 p-8 rounded-3xl shadow-2xl border-2 border-[#FFD700] text-center">
					<p className="text-red-600 mb-4">{error}</p>
					<button
						onClick={handleLogout}
						className="px-4 py-2 bg-red-500 text-white rounded-lg"
					>
						Sign out
					</button>
				</div>
			</div>
		);
	}

	// ✅ Main UI (FIXED STRUCTURE)
	return (
		<div className="min-h-screen bg-gradient-to-br from-[#4A0404] to-[#800000]">
			<Navbar />
			<Sidebar />

			<main className="max-w-6xl mx-auto px-6 py-10">
				<h1 className="text-3xl font-bold text-white mb-6">
					Welcome back 👋
				</h1>

				{/* Take Quiz */}
				<div className="mb-6">
					<input
						type="text"
						value={quizId}
						onChange={(e) => setQuizId(e.target.value)}
						placeholder="Enter Quiz ID"
						className="p-2 rounded mr-2"
					/>
					<button
						onClick={handleTakeQuiz}
						className="bg-yellow-500 px-4 py-2 rounded"
					>
						Start Quiz
					</button>
					{quizError && <p className="text-red-400">{quizError}</p>}
				</div>

				{/* Leaderboard */}
				<h2 className="text-xl text-white mb-2">Leaderboard</h2>
				<div className="mb-6">
					{lbLoading ? (
						<p className="text-white">Loading leaderboard...</p>
					) : (
						leaderboard.slice(0, 5).map((u, i) => (
							<div key={i} className="text-white">
								{i + 1}. {u.id} - {u.points}
							</div>
						))
					)}
				</div>

				{/* Quizzes */}
				<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{quizzes.length ? (
						quizzes.map((q) => <QuizCard key={q.id} quiz={q} />)
					) : (
						<p className="text-white">No quizzes available.</p>
					)}
				</section>

				{/* Badges */}
				<section className="mt-8">
					<h2 className="text-xl text-white mb-2">Badges</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{badges.length ? (
							badges.map((b) => <BadgeCard key={b.id} badge={b} />)
						) : (
							<p className="text-white">No badges yet.</p>
						)}
					</div>
				</section>
			</main>
		</div>
	);
};

export default StudentDashboard;