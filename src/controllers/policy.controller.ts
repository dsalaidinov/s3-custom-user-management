import { Request, Response } from 'express';
import AccessPolicy, { AccessPolicyDocument } from '../models/access-policy';

/**
 * @swagger
 * components:
 *   schemas:
 *     AccessPolicy:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The access policy ID.
 *         user:
 *           type: string
 *           description: The ID of the user to whom access is assigned.
 *         resourceName:
 *           type: string
 *           description: The name of the resource.
 *         resourceType:
 *           type: string
 *           enum:
 *             - bucket
 *             - table
 *             - folder
 *             - file
 *           description: The type of the resource.
 *         path:
 *           type: string
 *           description: The path to the resource.
 *         permissions:
 *           type: string
 *           enum:
 *             - Read
 *             - Write
 *             - Delete
 *             - Admin
 *           description: The assigned permissions for the resource.
 *         s3System:
 *           type: string
 *           description: The ID of the associated S3 system.
 *       required:
 *         - user
 *         - resourceName
 *         - resourceType
 *         - path
 *         - permissions
 *         - s3System
 */

/**
 * @swagger
 * /api/policies/assign:
 *   post:
 *     summary: Assign access to a user for a specific resource in an S3 system.
 *     tags:
 *       - Access Policy
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               s3SystemId:
 *                 type: string
 *               resourceName:
 *                 type: string
 *               path:
 *                 type: string
 *               resourceType:
 *                 type: string
 *                 enum: 
 *                   - Type1
 *                   - Type2
 *               permissions:
 *                 type: string
 *                 enum:
 *                   - Read
 *                   - Write
 *                   - Delete
 *                   - Admin
 *             required:
 *               - userId
 *               - s3SystemId
 *               - resourceName
 *               - path
 *               - resourceType
 *               - permissions
 *     responses:
 *       201:
 *         description: Access assigned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessPolicy'
 *       500:
 *         description: Internal Server Error.
 */
export const assignAccess = async (req: Request, res: Response) => {
  try {
    const { userId, s3SystemId, resourceName, path, resourceType, permissions } = req.body;

    const newAccessPolicy:AccessPolicyDocument = new AccessPolicy({
      user: userId,
      resourceName,
      path,
      resourceType,
      permissions,
      s3System: s3SystemId,
    });

    await newAccessPolicy.save();

    res.status(201).json(newAccessPolicy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error assigning access' });
  }
};


/**
 * @swagger
 * /api/policies/assignments:
 *   get:
 *     summary: Get all access assignments.
 *     tags:
 *       - Access Policy
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of access assignments.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AccessPolicy'
 *       500:
 *         description: Internal Server Error.
 */
export const getAssings = async (req: Request, res: Response) => {
  try {
    const policies = await AccessPolicy.find();
    return res.status(200).json(policies);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch policies' });
  }
};
