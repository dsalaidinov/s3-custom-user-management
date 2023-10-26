import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFile extends Document {
  name: string;
  parentFolder: Types.ObjectId;
  s3System: Types.ObjectId;
}

const fileSchema = new Schema<IFile>({
  name: { type: String, required: true },
  parentFolder: {
    type: Schema.Types.ObjectId,
    ref: 'Folder',
    required: true,
  },
  s3System: {
    type: Schema.Types.ObjectId,
    ref: 'S3System',
    required: true,
  },
});

export default mongoose.model<IFile>('File', fileSchema);
