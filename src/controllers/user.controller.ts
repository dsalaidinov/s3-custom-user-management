import { Request, Response } from 'express';
import User, { IUser } from '../models/user';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user: IUser = new User({ username, password });
    await user.save();
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};
