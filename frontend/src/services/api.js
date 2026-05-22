function normalizeApiBaseUrl(raw) {
  const fallback = "https://backend-7lik.onrender.com";
  if (raw == null || String(raw).trim() === "") return fallback;
  return String(raw).trim().replace(/\/+$/, "");
}

/** Trailing slashes stripped so paths like `${API_BASE_URL}/otp/...` never become `//otp`. */
export const API_BASE_URL = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);

/** User-facing messages — never surface raw status codes like "404" or "405". */
const HTTP_FRIENDLY = {
  400: "The request could not be completed. Please check your input and try again.",
  401: "Your session has expired or you are not signed in. Please log in again.",
  403: "You do not have permission to do that.",
  404: "That service or endpoint is not available. It may be missing or the link may be wrong.",
  405: "That action is not allowed for this address. Please try again or contact support if it continues.",
  408: "The request took too long. Try again in a moment—email and sign-in can be slow when the server is waking up.",
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

export const AUTH_TOKEN_STORAGE_KEY = 'token';

const AUTH_CHANGED_EVENT = 'auth-token-changed';

export const notifyAuthChanged = () => {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

/** Persist JWT and notify all tabs + React auth state (same tab via custom event). */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
  notifyAuthChanged();
};

export const getToken = () => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
export const getMyTeacherQuizzes = () => api('/api/quiz/my-quizzes');

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
};

export const decodeJwtPayload = (token) => {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    return JSON.parse(decodeBase64Url(parts[1]));
  } catch {
    return null;
  }
};

export const getUser = () => {
  const token = getToken();
  return decodeJwtPayload(token);
};

export const getMyProfile = () => api('/api/admin/me');
export const getAdminStats = () => api('/api/admin/stats');
export const logout = () => {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  notifyAuthChanged();
};

const authHeaders = (extra = {}) => {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

// ─── Core fetch helpers ───────────────────────────────────────────────────────

/** Default HTTP timeout; slow routes pass a larger `timeoutMs` in `api()` options. */
const DEFAULT_API_TIMEOUT_MS = 15000;

/** AI generation can exceed default timeout (LLM + cold backend). */
const AI_GENERATE_TIMEOUT_MS = 180000;

/** Email + OTP + cold server (e.g. Render spin-up + Brevo) often exceeds 15s. */
const EMAIL_ACTION_TIMEOUT_MS = 90000;

const withTimeout = async (url, opts = {}, timeoutMs = DEFAULT_API_TIMEOUT_MS) => {
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
  const { timeoutMs, ...restOptions } = options;
  let res;
  try {
    res = await withTimeout(`${API_BASE_URL}${endpoint}`, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
        ...(restOptions.headers || {}),
      },
    }, timeoutMs ?? DEFAULT_API_TIMEOUT_MS);
  } catch (e) {
    const isAbort =
      e?.name === "AbortError" ||
      (typeof e?.message === "string" && e.message.toLowerCase().includes("aborted"));
    if (isAbort) {
      throw new Error(HTTP_FRIENDLY[408]);
    }
    throw e;
  }
  let data = null;
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) {
    throw new Error(getFriendlyApiErrorMessage(res.status, data.message || data.error));
  }
  return data;
};

export const apiUpload = async (endpoint, formData) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
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

/**
 * Forgot-password calls use plain fetch (no Authorization header), same as Register OTP,
 * so gateways and caches do not treat them like authenticated API traffic.
 * If `/otp/...` returns a "route missing" style 404, we retry `/api/otp/...` (both are mounted on the backend).
 */
function forgotPassword404ShouldRetryAltPath(data) {
  const msg = String(data?.message || data?.error || "").toLowerCase();
  if (msg.includes("no account")) return false;
  return true;
}

async function postPublicOtpWithPathFallback(primaryPath, secondaryPath, body) {
  const run = async (path) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), EMAIL_ACTION_TIMEOUT_MS);
    try {
      const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      return { res, data };
    } catch (e) {
      const isAbort =
        e?.name === "AbortError" ||
        (typeof e?.message === "string" && e.message.toLowerCase().includes("aborted"));
      if (isAbort) throw new Error(HTTP_FRIENDLY[408]);
      throw e;
    } finally {
      clearTimeout(id);
    }
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const runWithWakeRetry = async (path) => {
    let { res, data } = await run(path);
    if (res.status === 503 || res.status === 502) {
      await sleep(4000);
      ({ res, data } = await run(path));
    }
    return { res, data };
  };

  let { res, data } = await runWithWakeRetry(primaryPath);
  if (res.ok) return data;

  if (res.status === 404 && forgotPassword404ShouldRetryAltPath(data)) {
    ({ res, data } = await runWithWakeRetry(secondaryPath));
  }

  if (!res.ok) {
    if (res.status === 503 || res.status === 502) {
      throw new Error(
        data.message ||
          "The server is starting up — please wait 30 seconds and try again."
      );
    }
    throw new Error(getFriendlyApiErrorMessage(res.status, data.message || data.error));
  }
  return data;
}

export const registerOtpSend = (email) =>
  postPublicOtpWithPathFallback("/otp/send", "/api/otp/send", { email });

export const registerOtpVerify = (payload) =>
  postPublicOtpWithPathFallback(
    "/otp/verify-and-register",
    "/api/otp/verify-and-register",
    payload
  );

export const forgotPasswordSend = (email) =>
  postPublicOtpWithPathFallback(
    "/otp/forgot-password/send",
    "/api/otp/forgot-password/send",
    { email }
  );

export const forgotPasswordVerify = (email, otp) =>
  postPublicOtpWithPathFallback(
    "/otp/forgot-password/verify",
    "/api/otp/forgot-password/verify",
    { email, otp }
  );

export const forgotPasswordComplete = (resetToken, newPassword) =>
  postPublicOtpWithPathFallback(
    "/otp/forgot-password/complete",
    "/api/otp/forgot-password/complete",
    { resetToken, newPassword }
  );

// ─── Lectures ─────────────────────────────────────────────────────────────────

export const getLectures    = () => api('/lectures');
export const uploadLecture  = (formData) => apiUpload('/lectures/upload', formData);
export const deleteLecture  = (id) => api(`/lectures/${id}`, { method: 'DELETE' });

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export const generateQuiz = (lectureId, type, count, difficulty) =>
  api('/api/quiz/generate', {
    method: 'POST',
    body: JSON.stringify({ lectureId, type, count, difficulty }),
    timeoutMs: AI_GENERATE_TIMEOUT_MS,
  });

export const saveQuiz = (lectureId, quizTitle, questions, courseId) =>
  api('/api/quiz/save', { method: 'POST', body: JSON.stringify({ lectureId, quizTitle, questions, courseId }) });

export const getTeacherQuiz = (quizId) => api(`/api/quiz/teacher/${quizId}`);

export const updateTeacherQuiz = (quizId, payload) =>
  api(`/api/quiz/teacher/${quizId}`, { method: 'PATCH', body: JSON.stringify(payload) });

export const getTeacherQuizResults = (quizId) => api(`/api/quiz/teacher/${quizId}/results`);

export const getQuiz   = (quizId) => api(`/api/quiz/${quizId}`);

export const submitQuiz = (quizId, answers) =>
  api('/api/quiz/submit', { method: 'POST', body: JSON.stringify({ quizId, answers }) });

export const getQuizAnalysis = () => api('/api/quiz/analysis');

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
export const getStudentNotifications = () => api('/api/admin/my-notifications');
export const markNotificationRead = (notificationId) => api(`/api/admin/my-notifications/${notificationId}/read`, { method: 'PATCH' });
export const sendTeacherNotification = (payload) => api('/api/admin/teacher-notifications', { method: 'POST', body: JSON.stringify(payload) });