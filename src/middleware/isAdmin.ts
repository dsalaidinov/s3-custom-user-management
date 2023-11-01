import { Request, Response, NextFunction } from 'express';

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user; 

    if (user && user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  };
  