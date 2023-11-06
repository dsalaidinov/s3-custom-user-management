import AWS from '@aws-sdk/client-s3';
import { Client as MinioClient } from 'minio';

import { S3SystemDocument, S3SystemType } from '../models/s3systems';

export const S3Client = (s3System: S3SystemDocument): any => {
    if (s3System.type === S3SystemType.AmazonS3) {
      return new AWS.S3({
          credentials: {
              accessKeyId: s3System.accessKey,
              secretAccessKey: s3System.secretKey,
          },
          region: s3System.region,
      });
    } else if (s3System.type === S3SystemType.S3Compatible) {
      return new MinioClient({
        useSSL: s3System.useSSL,
        endPoint: s3System.endpoint,
        accessKey: s3System.accessKey,
        secretKey: s3System.secretKey,
        port: Number(s3System.port),
      });
    }
};