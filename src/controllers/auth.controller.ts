import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User, { IUser } from '../models/user';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.development.env' });
} else {
  dotenv.config({ path: '.production.env' });
}

const JWT_SECRET = process.env.JWT_SECRET || 'secret_secret_sdjflgkldfjg';

const generateToken = (user: IUser) => {
  const payload = { id: user._id, username: user.username };
  const options = { expiresIn: '8h' };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      username,        
      password: hashedPassword,
    });

    const user = await newUser.save();

    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }
   
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
   
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.status(200).json({ user: { username: user.username, role: user.role, accessPolicies: user.accessPolicies, s3systems: user.s3systems }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
