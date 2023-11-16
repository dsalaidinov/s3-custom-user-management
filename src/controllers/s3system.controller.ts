import { Request, Response } from 'express';
import S3System, { S3SystemDocument } from '../models/s3systems';
import AccessPolicy from '../models/access-policy';

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

export const getS3Systems = async (req: Request, res: Response) => {
  try {
    const systems = await S3System.find();
    res.status(200).json(systems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error when retrieving S3 systems' });
  }
};

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
