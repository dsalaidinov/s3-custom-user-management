import mongoose, { Document, Schema, Types } from "mongoose";

export interface AccessPolicyDocument extends Document {
  user: Types.ObjectId[];
  resource: Types.ObjectId[];
  permissions: Types.ObjectId[];
}

const accessPolicySchema = new Schema<AccessPolicyDocument>({
  user: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  resource: [
    {
      type: Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
  ],
  permissions: [
    {
        type: Schema.Types.ObjectId,
        ref: "Permission",
        required: true,
    },
  ],
});

const AccessPolicy = mongoose.model<AccessPolicyDocument>(
  "AccessPolicy",
  accessPolicySchema
);

export default AccessPolicy;
