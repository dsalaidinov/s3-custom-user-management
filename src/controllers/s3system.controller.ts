import { Request, Response } from 'express';
import S3System, { S3SystemDocument } from '../models/s3systems';

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
