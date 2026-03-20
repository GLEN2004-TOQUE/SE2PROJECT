import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';

import * as authController from './controllers/authController';
import * as loginController from './controllers/loginController';
import { verifyToken, authorizeRole } from './middleware/authMiddleware';
import lectureRoutes from "./routes/lectureRoutes";

const app: Application = express();

// Middleware – order matters!
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json()); // must be before routes
app.use("/api/lectures", lectureRoutes);

// Routes
app.use('/lectures', lectureRoutes);

app.post('/register', authController.register);
app.post('/login', loginController.login);

app.get(
  '/teacher/dashboard',
  verifyToken,
  authorizeRole('teacher'),
  (req: AuthRequest, res: Response) => {
    res.json({ message: 'Welcome Teacher' });
  }
);

app.get(
  '/student/dashboard',
  verifyToken,
  authorizeRole('student'),
  (req: AuthRequest, res: Response) => {
    res.json({ message: 'Welcome Student' });
  }
);

interface AuthRequest extends Request {
  user?: {
    id: string;
    user_metadata?: {
      role?: string;
    };
  };
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
