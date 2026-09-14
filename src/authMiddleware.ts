import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import 'dotenv/config';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
){
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      message: 'Authorization header is required'
    });
  }
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Token is required'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

    if (typeof decoded === 'string' || typeof decoded.userId !== 'string') {
      return res.status(401).json({
        message: 'Invalid token'
      });
    }

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }
}
