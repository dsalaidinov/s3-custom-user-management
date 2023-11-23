import { Request, Response } from 'express';
import User, { IUser } from '../models/user';
import bcrypt from 'bcrypt';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The user ID.
 *         username:
 *           type: string
 *           description: The username of the user.
 *         role:
 *           type: string
 *           enum:
 *             - admin
 *             - user
 *           description: The role of the user.
 *         accessPolicies:
 *           type: array
 *           items:
 *             type: string
 *           description: An array of access policy IDs.
 *         s3systems:
 *           type: array
 *           items:
 *             type: string
 *           description: An array of S3 system IDs.
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
  * @swagger
 * /api/users/create:
 *   post:
 *     summary: Create a new user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - password
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal Server Error.
 */
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

/**
 * @swagger
 * /api/users/list:
 *   get:
 *     summary: Get all users.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal Server Error.
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * @swagger
 * /api/users/update/{id}:
 *   put:
 *     summary: Update user information.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to update.
 *         schema:
 *           type: string
 *       - in: query
 *         name: s3systems
 *         required: false
 *         description: Comma-separated list of S3 system IDs to add to the user.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { s3systems } = req.body;
    
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (s3systems.length) {
      user.s3systems = s3systems;
    }

    await user.save();
    
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: `Failed to update user: ${error}` });
  }
};
