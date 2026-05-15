const express = require('express');
const cors = require('cors');
require('dotenv').config();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sanitizeHtml = require('sanitize-html');

const authController = require('./controllers/authController');
const { verifyToken, authorizeRole, requireActiveUser } = require('./middleware/roleMiddleware');
const lectureRoutes = require('./routes/lectureRoutes');
const quizRoutes = require('./routes/quizRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiService = require('./services/aiService');
const gameRoutes = require('./routes/gamificationRoutes');
const otpRoutes = require('./routes/otpRoutes'); 

const app = express();

app.use(
  helmet({
    // This API doesn't serve HTML pages; CSP is mainly relevant for browsers rendering HTML.
    // Keep it off to avoid breaking any proxy/embed edge cases while still setting other headers.
    contentSecurityPolicy: false,
  })
);

// Middleware — MUST be before routes
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "https://se2project.onrender.com",
    "http://localhost:3000",
    "http://localhost:5000",
    "https://se2project.onrender.com",
  ],
  credentials: true,
methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Basic request-body sanitization for common text inputs (XSS defense-in-depth)
app.use((req, res, next) => {
  const body = req.body;
  if (!body || typeof body !== 'object') return next();

  for (const [k, v] of Object.entries(body)) {
    if (typeof v === 'string') {
      const trimmed = v.trim();
      body[k] = sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
    }
  }
  return next();
});

// Rate limits for auth/OTP endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many OTP requests. Please wait and try again.' },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait and try again.' },
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend healthy' });
});

// Deeper health check (DB)
app.get('/health/db', async (req, res) => {
  try {
    const pool = require('./config/db');
    await pool.query('SELECT 1');
    res.json({ status: 'OK', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'DB Error', db: 'disconnected', message: err.message });
  }
});

// AI status
app.get('/api/ai-status', (req, res) => {
  const status = aiService.getStatus();
  res.json({ success: true, status, currentTime: new Date().toISOString() });
});

// Auth routes
app.post('/register', authLimiter, authController.register);
app.post('/login', authLimiter, authController.login);

// OTP routes — mount on both paths so clients behind /api proxies or older configs still resolve
const otpPathLimiter = (req, res, next) => {
  const p = req.path || '';
  const isOtpSend = p === '/send' || p.endsWith('/forgot-password/send');
  const limiter = isOtpSend ? otpSendLimiter : otpVerifyLimiter;
  return limiter(req, res, next);
};
app.use('/otp', otpPathLimiter, otpRoutes);
app.use('/api/otp', otpPathLimiter, otpRoutes);

// API Routes
app.use('/api/quiz', quizRoutes);
app.use('/lectures', lectureRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/game', gameRoutes);

// Protected dashboard routes
app.get('/teacher/dashboard', verifyToken, requireActiveUser, authorizeRole('teacher'), (req, res) => {
  res.json({ message: "Welcome Teacher" });
});
app.get('/student/dashboard', verifyToken, requireActiveUser, authorizeRole('student'), (req, res) => {
  res.json({ message: "Welcome Student" });
});
app.get('/admin/dashboard', verifyToken, requireActiveUser, authorizeRole('admin'), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

// Unknown route — JSON only (no HTML error pages with status codes as the only hint)
app.use((req, res) => {
  res.status(404).json({
    message: 'That service or endpoint is not available. It may be missing or the address may be wrong.',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong on the server. Please try again later.',
  });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('📊 AI Model Status:', aiService.getStatus());
    console.log(`📧 Email configured: ${process.env.EMAIL_USER || '❌ EMAIL_USER missing'}`);
  });
}

module.exports = app;