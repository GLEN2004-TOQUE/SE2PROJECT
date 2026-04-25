const BASE_URL = process.env.REACT_APP_API_URL ||  "https://backend-7lik.onrender.com";

export const getToken = () => localStorage.getItem('token');
export const getMyTeacherQuizzes = () => api('/api/quiz/my-quizzes');

export const getUser = () => {
  const token = getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

export const getMyProfile = () => api('/api/admin/me');
export const getAdminStats = () => api('/api/admin/stats');
export const logout = () => {
  localStorage.removeItem('token');
};

const authHeaders = (extra = {}) => {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

// ─── Core fetch helpers ───────────────────────────────────────────────────────

const withTimeout = async (url, opts = {}, timeoutMs = 15000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
};

export const api = async (endpoint, options = {}) => {
  if (typeof endpoint !== "string" || !endpoint.startsWith("/")) {
    throw new Error("Invalid API endpoint");
  }
  const res = await withTimeout(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  let data = null;
  try { data = await res.json(); } catch { data = { error: "Invalid server response" }; }
  if (!res.ok) throw new Error(data.message || data.error || 'Request failed');
  return data;
};

export const apiUpload = async (endpoint, formData) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Upload failed');
  return data;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const login = (email, password) =>
  api('/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const register = (fullName, email, password, role) =>
  api('/register', { method: 'POST', body: JSON.stringify({ fullName, email, password, role }) });

// ─── Lectures ─────────────────────────────────────────────────────────────────

export const getLectures    = () => api('/lectures');
export const uploadLecture  = (formData) => apiUpload('/lectures/upload', formData);
export const deleteLecture  = (id) => api(`/lectures/${id}`, { method: 'DELETE' });

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export const generateQuiz = (lectureId, type, count) =>
  api('/api/quiz/generate', { method: 'POST', body: JSON.stringify({ lectureId, type, count }) });

export const saveQuiz = (lectureId, quizTitle, questions, courseId) =>
  api('/api/quiz/save', { method: 'POST', body: JSON.stringify({ lectureId, quizTitle, questions, courseId }) });

export const getQuiz   = (quizId) => api(`/api/quiz/${quizId}`);

export const submitQuiz = (quizId, answers) =>
  api('/api/quiz/submit', { method: 'POST', body: JSON.stringify({ quizId, answers }) });

// ─── Gamification ─────────────────────────────────────────────────────────────

export const getLeaderboard = (type = 'overall') =>
  api(`/api/game/leaderboard/${type}`);

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminGetStudents    = () => api('/api/admin/students');
export const adminGetTeachers    = () => api('/api/admin/teachers');
export const adminGetAllUsers    = () => api('/api/admin/users');
export const adminGetAssignments = () => api('/api/admin/assignments');

export const adminAssign = (teacherId, studentId) =>
  api('/api/admin/assign', {
    method: 'POST',
    body: JSON.stringify({ teacherId, studentId }),
  });

export const adminRemoveAssignment = (studentId) =>
  api(`/api/admin/assign/${studentId}`, { method: 'DELETE' });

// ─── Teacher ──────────────────────────────────────────────────────────────────

export const getMyStudents = () => api('/api/admin/my-students');

// ─── Student ──────────────────────────────────────────────────────────────────

export const getMyTeacher = () => api('/api/admin/my-teacher');