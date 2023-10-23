import mongoose, { Document, Schema } from 'mongoose';

export interface PermissionDocument extends Document {
  name: string;
}

const permissionSchema = new Schema<PermissionDocument>({
  name: { type: String, required: true },
});

const Permission = mongoose.model<PermissionDocument>('Permission', permissionSchema);

export default Permission;
