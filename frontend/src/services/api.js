const BASE_URL = process.env.REACT_APP_API_URL ||  "https://backend-7lik.onrender.com";

/** User-facing messages — never surface raw status codes like "404" or "405". */
const HTTP_FRIENDLY = {
  400: "The request could not be completed. Please check your input and try again.",
  401: "Your session has expired or you are not signed in. Please log in again.",
  403: "You do not have permission to do that.",
  404: "That service or endpoint is not available. It may be missing or the link may be wrong.",
  405: "That action is not allowed for this address. Please try again or contact support if it continues.",
  408: "The request took too long. Please try again.",
  409: "This conflicts with existing data. Refresh the page and try again.",
  413: "The file or data is too large.",
  415: "The server cannot accept this type of data.",
  422: "Some of the information provided is not valid. Please check and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on the server. Please try again later.",
  502: "The server is temporarily unreachable. Please try again shortly.",
  503: "The service is temporarily unavailable. Please try again shortly.",
  504: "The server did not respond in time. Please try again.",
};

function normalizeServerMessage(msg) {
  if (msg == null) return "";
  const s = String(msg).trim();
  if (!s) return "";
  if (/^\d{3}$/.test(s)) return "";
  if (s.length > 400) return "";
  if (/<\s*html[\s>]/i.test(s)) return "";
  if (/Server returned\s+\d{3}/i.test(s)) return "";
  return s;
}

/**
 * @param {number} status HTTP status
 * @param {string} [serverMessage] optional message from JSON body
 */
export function getFriendlyApiErrorMessage(status, serverMessage) {
  const fromServer = normalizeServerMessage(serverMessage);
  if (fromServer) return fromServer;
  return HTTP_FRIENDLY[status] || "Something went wrong. Please try again.";
}

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
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) {
    throw new Error(getFriendlyApiErrorMessage(res.status, data.message || data.error));
  }
  return data;
};

export const apiUpload = async (endpoint, formData) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  let data = {};
  try { data = await res.json(); } catch { /* non-JSON error body */ }
  if (!res.ok) {
    throw new Error(getFriendlyApiErrorMessage(res.status, data.message || data.error));
  }
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