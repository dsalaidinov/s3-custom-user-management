import mongoose, { Schema, Document } from 'mongoose';

export const resourceTypes = ['Bucket', 'Table']; 

export interface IResource extends Document {
  name: string;
  type: string;
}

const resourceSchema = new Schema<IResource>({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: resourceTypes,
    required: true,
  },
});

export default mongoose.model<IResource>('Resource', resourceSchema);
