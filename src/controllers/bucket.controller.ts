import { Request, Response } from 'express';
import AWS from '@aws-sdk/client-s3';
import { Client as MinioClient } from 'minio';
import S3System, { S3SystemType } from '../models/s3systems';

export const createBucket = async (req: Request, res: Response) => {
  try {
    const { bucketName, s3Type } = req.body;

    const s3System = await S3System.findOne({ type: s3Type });

    if (!s3System) {
      return res.status(400).json({ message: 'There are no S3System settings available for this type' });
    }

    let s3;

    if (s3Type === S3SystemType.AmazonS3) {
      s3 = new AWS.S3({
        credentials: {accessKeyId: s3System.accessKey,
        secretAccessKey: s3System.secretKey,
        },
        region: s3System.region,
      });
    } else if (s3Type === S3SystemType.S3Compatible) {
      s3 = new MinioClient({
        endPoint: s3System.endpoint,
        accessKey: s3System.accessKey,
        secretKey: s3System.secretKey,
      });
    }

    const params = {
      Bucket: bucketName,
    };

    await s3.createBucket(params).promise();

    res.status(201).json({ message: 'Bucket created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating bucket' });
  }
};
