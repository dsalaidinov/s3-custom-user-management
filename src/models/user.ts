import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
  roles: Types.ObjectId[];
  accessPolicies: Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  roles: [
    {
      type: Schema.Types.ObjectId,
      ref: "Role",
    },
  ],
  accessPolicies: [
    {
      type: Schema.Types.ObjectId,
      ref: "AccessPolicy",
    },
  ],
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
