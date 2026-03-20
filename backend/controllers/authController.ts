import { Request, Response } from 'express';
import pool from '../config/db';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import 'dotenv/config';
import getSupabase from '../utils/supabaseClient';
import { SupabaseClient } from '@supabase/supabase-js';

interface RegisterRequest extends Request {
  body: {
    full_name: string;
    email: string;
    password: string;
    role: string;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export const register = async (req: RegisterRequest, res: Response): Promise<void> => {
  try {
    const { full_name, email, password, role } = req.body;

    const supabase = getSupabase() as SupabaseClient;

    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role, // stored in user_metadata
        }
      }
    });

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const login = async (req: LoginRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const supabase = getSupabase() as SupabaseClient;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401).json({ message: error.message });
      return;
    }

    res.json({ token: data.session?.access_token });

  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const supabase = getSupabase(token || undefined) as SupabaseClient;

    const { error } = await supabase.auth.signOut();
    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.json({ message: "Logged out successfully" });

  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export default { register, login, logout };
