import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    user_metadata?: {
      role?: string;
    };
  };
}

export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userRole = req.user?.user_metadata?.role;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ message: "Access denied. Insufficient permissions." });
      return;
    }
    
    next();
  };
};
