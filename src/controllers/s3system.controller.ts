import { Request, Response } from 'express';
import S3System, { S3SystemDocument } from '../models/s3systems';
import AccessPolicy from '../models/access-policy';

/**
 * @swagger
 * components:
 *   schemas:
 *     S3System:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The S3 system ID.
 *         name:
 *           type: string
 *           description: The name of the S3 system.
 *         type:
 *           type: string
 *           enum:
 *             - AmazonS3
 *             - S3Compatible
 *           description: The type of the S3 system.
 *         accessKey:
 *           type: string
 *           description: The access key for the S3 system.
 *         secretKey:
 *           type: string
 *           description: The secret key for the S3 system.
 *         region:
 *           type: string
 *           description: The region of the S3 system.
 *         endpoint:
 *           type: string
 *           description: The endpoint of the S3 system.
 *         port:
 *           type: string
 *           description: The port of the S3 system.
 *         useSSL:
 *           type: boolean
 *           description: Whether to use SSL for the S3 system.
 */

/**
 * @swagger
 * /api/s3systems/create:
 *   post:
 *     summary: Create a new S3 system.
 *     tags:
 *       - S3 Systems
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum:
 *                   - AmazonS3
 *                   - S3Compatible
 *               accessKey:
 *                 type: string
 *               secretKey:
 *                 type: string
 *               region:
 *                 type: string
 *               endpoint:
 *                 type: string
 *               port:
 *                 type: string
 *               useSSL:
 *                 type: boolean
 *             required:
 *               - name
 *               - type
 *               - accessKey
 *               - secretKey
 *     responses:
 *       201:
 *         description: S3 system created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/S3System'
 *       500:
 *         description: Internal Server Error.
 */
export const createS3System = async (req: Request, res: Response) => {
  try {
    const { name, type, accessKey, secretKey, region, endpoint, port, useSSL } = req.body;
    
    const newS3System: S3SystemDocument = new S3System({
      name,
      type,
      accessKey,
      secretKey,
      region,
      endpoint,
      port,
      useSSL
    });

    await newS3System.save();

    res.status(201).json(newS3System);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating S3 system' });
  }
};

/**
 * @swagger
 * /api/s3systems/list:
 *   get:
 *     summary: Get all S3 systems.
 *     tags:
 *       - S3 Systems
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of S3 systems.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/S3System'
 *       500:
 *         description: Internal Server Error.
 */
export const getS3Systems = async (req: Request, res: Response) => {
  try {
    const systems = await S3System.find();
    res.status(200).json(systems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error when retrieving S3 systems' });
  }
};

/**
 * @swagger
 * /api/s3systems/update/{id}:
 *   put:
 *     summary: Update an S3 system by ID.
 *     tags:
 *       - S3 Systems
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the S3 system to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/S3System'
 *     responses:
 *       200:
 *         description: S3 system updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/S3System'
 *       404:
 *         description: S3 system not found.
 *       500:
 *         description: Internal Server Error.
 */
export const updateS3System = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const existingS3System = await S3System.findById(id);

    if (!existingS3System) {
      return res.status(404).json({ message: 'S3 system not found' });
    }

    Object.assign(existingS3System, updateFields);

    await existingS3System.save();

    res.status(200).json(existingS3System);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating S3 system' });
  }
};

/**
 * @swagger
 * /api/s3systems/list-system-by-user:
 *   get:
 *     summary: Get S3 systems accessible by the user.
 *     tags:
 *       - S3 Systems
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of accessible S3 systems.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/S3System'
 *       403:
 *         description: Unauthorized.
 *       404:
 *         description: No S3 systems found.
 *       500:
 *         description: Internal Server Error.
 */
export const getS3SystemsByUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const s3Systems = await S3System.find();

    if (!s3Systems || s3Systems.length === 0) {
      return res.status(404).json({ message: "No S3 systems found" });
    }

    if (user.role === "admin") {
      return res.status(200).json(s3Systems);
    }

    const accessibleS3Systems = [];

    for (const s3System of s3Systems) {
      const hasAccess = await hasUserAccessToS3System(user._id, s3System._id);

      if (hasAccess) {
        accessibleS3Systems.push(s3System);
      }
    }

    res.status(200).json(accessibleS3Systems);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch S3 systems: " + error.message });
  }
};

async function hasUserAccessToS3System(userId: string, s3SystemId: string): Promise<boolean> {
  try {
    const accessPolicies = await AccessPolicy.find({
      s3System: s3SystemId,
      user: userId,
    });

    return accessPolicies.length > 0;
  } catch (error) {
    console.error(error.message);
    return false;
  }
}
