import { Request, Response } from 'express';
import AccessPolicy, { AccessPolicyDocument } from '../models/access-policy';

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