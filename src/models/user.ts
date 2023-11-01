import mongoose, { Document, Schema, Types } from 'mongoose';

enum UserRole {
  Admin = 'admin',
  User = 'user',
}

export interface IUser extends Document {
  username: string;
  password: string;
  role: UserRole;
  accessPolicies: Types.ObjectId[];
  s3systems: Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.User },
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
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
