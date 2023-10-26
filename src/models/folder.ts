import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFolder extends Document {
  name: string;
  parentBucket: Types.ObjectId;
  s3System: Types.ObjectId;
  files: Types.ObjectId[];
}

const folderSchema = new Schema<IFolder>({
  name: { type: String, required: true },
  parentBucket: {
    type: Schema.Types.ObjectId,
    ref: 'Bucket',
    required: true,
  },
  s3System: {
    type: Schema.Types.ObjectId,
    ref: 'S3System',
    required: true,
  },
  files: [
    {
      type: Schema.Types.ObjectId,
      ref: 'File',
    },
  ],
});

export default mongoose.model<IFolder>('Folder', folderSchema);
