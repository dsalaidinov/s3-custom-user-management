import { Request, Response } from 'express';
import AWS from '@aws-sdk/client-s3';
import { Client as MinioClient } from 'minio';
import S3System, { S3SystemType } from '../models/s3systems';
import Bucket, { IBucket } from '../models/bucket';
import AccessPolicy from '../models/access-policy';
import { Permissions } from '../interface/permissions';
import { S3Client } from '../config/s3client';

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

export const getBucketsByUser = async (req: Request, res: Response) => {
  try {
    const { s3System, userId } = req.query;

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

    const accessPolicies = await AccessPolicy.find({ s3System: s3System, user: userId });

    const filteredBuckets = [];

    for (const bucket of buckets) {
      const hasReadPermission = accessPolicies.some(policy => {
        return (
          policy.resourceName === bucket.name &&
          (policy?.permissions === Permissions.READ || policy?.permissions === Permissions.READ_WRITE)
        );
      });

      if (hasReadPermission) {
        filteredBuckets.push(bucket);
      }
    }
    return res.status(200).json(filteredBuckets);
  } catch (error) {
    console.log(error.message);
    
    return res.status(500).json({ error: 'Failed to fetch resources' + error.message});
  }
};

export const getObjectsInBucketByUser = async (req: Request, res: Response) => {
  try {
    const { s3System, userId, bucketName, prefix } = req.query;

    const existingS3System = await S3System.findOne({ _id: s3System });

    if (!existingS3System) {
      return res.status(400).json({ message: 'There are no S3System settings available for this type' });
    }

    let s3 = S3Client(existingS3System);

    const accessPolicies = await AccessPolicy.find({ s3System: s3System, user: userId });

    let filteredObjects = [];

    if (existingS3System.type === S3SystemType.AmazonS3) {
      filteredObjects = await s3?.listObjectsV2({ Bucket: bucketName });
    } else if (existingS3System.type === S3SystemType.S3Compatible) {
      const objectStream = s3.listObjectsV2(bucketName, prefix);
      
      objectStream.on('data', (object) => {
        const isAccessibleForAllObjects = accessPolicies.some(policy => {
          return (policy.resourceName === bucketName && (policy?.permissions === Permissions.READ_WRITE || policy.permissions === Permissions.READ) && policy.path === '*');
        });

        if(isAccessibleForAllObjects) {
          filteredObjects.push(object);
          return;
        }

        const isAccessible = accessPolicies.some(policy => {
          return (
            policy.resourceName === bucketName &&
            (policy.permissions === Permissions.READ_WRITE ||
              policy.permissions === Permissions.READ) &&
              (policy.path !== '*' &&
                object.name?.startsWith(policy.path) || object.prefix?.startsWith(policy.path)));
        });

        if (isAccessible) {
          filteredObjects.push(object);
        }
      });
      
      objectStream.on('end', () => {
        console.log(filteredObjects);
        return res.status(200).json(filteredObjects);
      });
      
      objectStream.on('error', (error) => {
        console.error('Error reading objects:', error);
        return res.status(500).json({ error: 'Failed to fetch resources' + error.message });
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: 'Failed to fetch resources' + error.message });
  }
};
