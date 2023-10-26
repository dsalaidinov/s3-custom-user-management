import mongoose, { Document, Schema, Types } from 'mongoose';
import { Permissions } from 'interface/permissions';
import { ResourceTypes } from '../interface/resource';

export interface AccessPolicyDocument extends Document {
  path: string;
  permissions: Permissions[];
  resourceName: string;
  resourceType: ResourceTypes; 
  s3System: Types.ObjectId;
  user: Types.ObjectId;
}

const accessPolicySchema = new Schema<AccessPolicyDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resourceName: {
    type: String,
    required: true,
  },
  resourceType: {
    type: String,
    enum: Object.values(ResourceTypes),
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  permissions: [
    {
      type: String,
      enum: Object.values(Permissions),
    },
  ],
  s3System: {
    type: Schema.Types.ObjectId,
    ref: 'S3System',
    required: true,
  },
});

const AccessPolicy = mongoose.model<AccessPolicyDocument>('AccessPolicy', accessPolicySchema);

export default AccessPolicy;
