import { Request, Response } from 'express';
import AWS from '@aws-sdk/client-s3';
import { Client as MinioClient } from 'minio';
import S3System, { S3SystemType } from '../models/s3systems';
import Bucket, { IBucket } from '../models/bucket';

export const createBucket = async (req: Request, res: Response) => {
  try {
    const { bucketName, s3System } = req.body;

    const existingS3System = await S3System.findOne({ _id: s3System });

    if (!existingS3System) {
      return res.status(400).json({ message: 'There are no S3System settings available for this type' });
    }

    let s3;
    
    const params = {
      Bucket: bucketName,
    };

    if (existingS3System.type === S3SystemType.AmazonS3) {
      s3 = new AWS.S3({
        credentials: {
          accessKeyId: existingS3System.accessKey,
          secretAccessKey: existingS3System.secretKey,
        },
        region: existingS3System.region,
      });
      await s3.createBucket(params).promise();
    } else if (existingS3System.type === S3SystemType.S3Compatible) {
      s3 = new MinioClient({
        useSSL: existingS3System.useSSL,
        endPoint: existingS3System.endpoint,
        accessKey: existingS3System.accessKey,
        secretKey: existingS3System.secretKey,
      });
      await s3.makeBucket(`${bucketName.toLowerCase()}`);
    }

    res.status(201).json({ message: 'Bucket created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Error creating bucket: ${error.message}` });
  }
};

export const getBuckets = async (req: Request, res: Response) => {
  try {
    const { s3System } = req.query;

    const existingS3System = await S3System.findOne({ _id: s3System });

    if (!existingS3System) {
      return res.status(400).json({ message: 'There are no S3System settings available for this type' });
    }

    let s3, buckets;

    if (existingS3System.type === S3SystemType.AmazonS3) {
      s3 = new AWS.S3({
        credentials: {
          accessKeyId: existingS3System.accessKey,
          secretAccessKey: existingS3System.secretKey,
        },
        region: existingS3System.region,
      });

      buckets = await s3.listBuckets().promise();
    } else if (existingS3System.type === S3SystemType.S3Compatible) {
      s3 = new MinioClient({
        useSSL: existingS3System.useSSL,
        endPoint: existingS3System.endpoint,
        accessKey: existingS3System.accessKey,
        secretKey: existingS3System.secretKey,
      });

      buckets = await s3.listBuckets();
    }

    return res.status(200).json(buckets);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch resources' });
  }
};
