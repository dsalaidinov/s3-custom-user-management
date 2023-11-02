import mongoose, { Document, Schema, Types } from 'mongoose';

export enum S3SystemType {
  AmazonS3 = 'AmazonS3',
  S3Compatible = 'S3Compatible',
}

export interface S3SystemDocument extends Document {
  name: string;
  type: S3SystemType;
  accessKey: string;
  secretKey: string;
  region?: string;
  endpoint?: string;
  port?: string;
  useSSL?: boolean;
}

const s3SystemSchema = new Schema<S3SystemDocument>({
  name: { type: String, required: true },
  type: { type: String, enum: Object.values(S3SystemType), required: true },
  accessKey: { type: String, required: true },
  secretKey: { type: String, required: true },
  region: { type: String },
  endpoint: { type: String },
  port: { type: String },
  useSSL: { type: Boolean },
});

const S3System = mongoose.model<S3SystemDocument>('S3System', s3SystemSchema);

export default S3System;
