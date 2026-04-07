const AUTH_RATE_KEY = "auth_attempts_v1";

export const sanitizeText = (value = "") =>
  String(value).replace(/[<>`"']/g, "").trim();

export const sanitizeEmail = (value = "") =>
  sanitizeText(value).toLowerCase();

export const isValidEmail = (value = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isStrongPassword = (value = "") =>
  typeof value === "string" && value.length >= 6;

export const canAttemptAuth = (maxAttempts = 8, windowMs = 5 * 60 * 1000) => {
  try {
    const now = Date.now();
    const raw = localStorage.getItem(AUTH_RATE_KEY);
    const attempts = raw ? JSON.parse(raw) : [];
    const recent = attempts.filter((t) => now - t < windowMs);
    if (recent.length >= maxAttempts) return false;
    recent.push(now);
    localStorage.setItem(AUTH_RATE_KEY, JSON.stringify(recent));
    return true;
  } catch {
    return true;
  }
};

