import { Request, Response } from 'express';
import pool from '../config/db';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import 'dotenv/config';

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export const login = async (req: LoginRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (userResult.rows.length === 0) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const user = userResult.rows[0];

    if (!user.status) {
      res.status(403).json({ message: "Account disabled" });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export default { login };
