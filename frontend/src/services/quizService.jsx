const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000' || "https://backend-7lik.onrender.com";

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const quizService = {
  /**
   * Fetch all quizzes (teacher: all they own; student: all available).
   * Adjust the endpoint path to match your backend.
   */
  getAll: async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/quiz`, {
        headers: authHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  getById: async (quizId) => {
    const res = await fetch(`${BASE_URL}/api/quiz/${quizId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Quiz not found');
    return res.json();
  },
};

export default quizService;