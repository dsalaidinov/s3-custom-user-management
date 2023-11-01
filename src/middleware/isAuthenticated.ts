import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Authorization required' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'yourSecretKey');

    const user = await User.findById((decodedToken as { id: string }).id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid token' });
  }
};
