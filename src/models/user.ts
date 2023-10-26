import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  roles: Types.ObjectId[];
  accessPolicies: Types.ObjectId[];
  s3systems: Types.ObjectId[]; // Связь с системами S3
  authentification: {};
}

const userSchema = new Schema<IUser>({
  username: { type: String, unique: true, required: true },
  roles: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Role',
    },
  ],
  accessPolicies: [
    {
      type: Schema.Types.ObjectId,
      ref: 'AccessPolicy',
    },
  ],
  s3systems: [
    {
      type: Schema.Types.ObjectId,
      ref: 'S3System',
    },
  ],
  authentification: {
    password: { type: String, required: true, select: false },
    sald: { type: String, select: false },
    sessionToken: { type: String, select: false },
  },
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
