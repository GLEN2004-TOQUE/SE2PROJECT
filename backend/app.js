const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authController = require('./controllers/authController');
const { verifyToken, authorizeRole } = require('./middleware/authMiddleware');
const lectureRoutes = require('./routes/lectureRoutes');
const quizRoutes = require('./routes/quizRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiService = require('./services/aiService');
const gameRoutes = require('./routes/gamificationRoutes');
const otpRoutes = require('./routes/otpRoutes'); // ← ADD THIS

const app = express();

// Middleware — MUST be before routes
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "https://se2project.onrender.com",
    "http://localhost:3000",
    "http://localhost:5000",
    "https://se2project.onrender.com",
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    const pool = require('./config/db');
    await pool.query('SELECT 1');
    res.json({ status: 'OK', message: 'Backend healthy, DB connected' });
  } catch (err) {
    res.status(500).json({ status: 'DB Error', message: err.message });
  }
});

// AI status
app.get('/api/ai-status', (req, res) => {
  const status = aiService.getStatus();
  res.json({ success: true, status, currentTime: new Date().toISOString() });
});

// Auth routes
app.post('/register', authController.register);
app.post('/login', authController.login);

// OTP routes ← ADD THIS
app.use('/otp', otpRoutes);

// API Routes
app.use('/api/quiz', quizRoutes);
app.use('/lectures', lectureRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/game', gameRoutes);

// Protected dashboard routes
app.get('/teacher/dashboard', verifyToken, authorizeRole('teacher'), (req, res) => {
  res.json({ message: "Welcome Teacher" });
});
app.get('/student/dashboard', verifyToken, authorizeRole('student'), (req, res) => {
  res.json({ message: "Welcome Student" });
});
app.get('/admin/dashboard', verifyToken, authorizeRole('admin'), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('📊 AI Model Status:', aiService.getStatus());
  console.log(`📧 Email configured: ${process.env.EMAIL_USER || '❌ EMAIL_USER missing'}`);
});