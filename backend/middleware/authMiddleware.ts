import { Request, Response, NextFunction } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import getSupabase from '../utils/supabaseClient';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    user_metadata?: {
      role?: string;
    };
  };
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const supabase = getSupabase(token) as SupabaseClient;

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    req.user = user as AuthRequest['user'];
    next();

  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const authorizeRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userRole = req.user?.user_metadata?.role;
    if (userRole !== role) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
    next();
  };
};
