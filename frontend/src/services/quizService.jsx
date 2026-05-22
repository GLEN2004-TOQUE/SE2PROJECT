import { API_BASE_URL, getFriendlyApiErrorMessage } from "./api";

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
      const res = await fetch(`${API_BASE_URL}/api/quiz`, {
        headers: authHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  getById: async (quizId) => {
    const res = await fetch(`${API_BASE_URL}/api/quiz/${quizId}`, {
      headers: authHeaders(),
    });
    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (!res.ok) {
      throw new Error(getFriendlyApiErrorMessage(res.status, data.message || data.error));
    }
    return data;
  },
};

export default quizService;