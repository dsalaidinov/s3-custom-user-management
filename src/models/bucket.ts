import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBucket extends Document {
  name: string;
  s3System: Types.ObjectId;
  folders: Types.ObjectId[];
}

const bucketSchema = new Schema<IBucket>({
  name: { type: String, required: true },
  s3System: {
    type: Schema.Types.ObjectId,
    ref: 'S3System',
    required: true,
  },
  folders: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
    },
  ],
});

export default mongoose.model<IBucket>('Bucket', bucketSchema);
