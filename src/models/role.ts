
import mongoose, { Document, Schema } from 'mongoose';

export interface RoleDocument extends Document {
  name: string;
}

const roleSchema = new Schema<RoleDocument>({
  name: { type: String, required: true },
});

const Role = mongoose.model<RoleDocument>('Role', roleSchema);

export default Role;
