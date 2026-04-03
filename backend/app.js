const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authController = require('./controllers/authController');
const { verifyToken, authorizeRole } = require('./middleware/authMiddleware');
const lectureRoutes = require('./routes/lectureRoutes');
const quizRoutes = require('./routes/quizRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

const gameRoutes = require('./routes/gamificationRoutes');
app.use('/api/game', gameRoutes);

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "https://se2project.onrender.com",
    "http://localhost:3000",
    "https://se2project.onrender.com"
  ],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const pool = require('./config/db');
    await pool.query('SELECT 1');
    res.json({ status: 'OK', message: 'Backend healthy, DB connected' });
  } catch (err) {
    console.error('Health check DB error:', err);
    res.status(500).json({ status: 'DB Error', message: err.message });
  }
});

// Auth routes
app.post('/register', authController.register);
app.post('/login', authController.login);

// API Routes
app.use('/api/quiz', quizRoutes);
app.use('/lectures', lectureRoutes);
app.use('/api/admin', adminRoutes);

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
});