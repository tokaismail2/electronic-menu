
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { AuthRequest } from '../types/express';

interface JWTPayload {
  id: string;
  user_name: string;
  role: string;
  is_active: boolean;

}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as JWTPayload;

    const user = await User.findOne({
      _id: decoded.id,
      is_active: true
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found or inactive.'
      });
    }

    req.user = user;

    next();

  } catch (error) {
    console.error('Authentication error:', error);

    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
      return;
    }

    // Super Admin has unrestricted access - bypass all role checks
    if (req.user.role === 'admin') {
      next();
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
      return;
    }

    next();
  };
};
