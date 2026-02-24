const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authController = require('./controllers/authController');
const loginController = require('./controllers/loginController'); 
const { verifyToken, authorizeRole } = require('./middleware/authMiddleware');

const app = express();
app.use(cors({origin: "http://localhost:3000"}));
app.use(express.json());

app.post('/register', authController.register);
app.post('/login', loginController.login); 

app.get('/teacher/dashboard',
  verifyToken,
  authorizeRole('teacher'),
  (req, res) => {
    res.json({ message: "Welcome Teacher" });
  }
);

app.get('/student/dashboard',
  verifyToken,
  authorizeRole('student'),
  (req, res) => {
    res.json({ message: "Welcome Student" });
  }
);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
