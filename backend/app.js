const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authController = require('./controllers/authController');
const { verifyToken, authorizeRole } = require('./middleware/authMiddleware');
const lectureRoutes = require('./routes/lectureRoutes');
const quizRoutes = require('./routes/quizRoutes');

const app = express();

const gameRoutes = require('./routes/gamificationRoutes');
app.use('/api/game', gameRoutes);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://se2project.onrender.com",
  credentials: true
}));
app.use(express.json());

// Auth routes
app.post('/register', authController.register);
app.post('/login', authController.login);

// API Routes
app.use('/api/quiz', quizRoutes);
app.use('/lectures', lectureRoutes);

// Protected dashboard routes
app.get('/teacher/dashboard', verifyToken, authorizeRole('teacher'), (req, res) => {
  res.json({ message: "Welcome Teacher" });
});

app.get('/student/dashboard', verifyToken, authorizeRole('student'), (req, res) => {
  res.json({ message: "Welcome Student" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
