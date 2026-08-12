import mongoose, { Schema, Document } from 'mongoose';

export interface IRBACEole extends Document {
  roleName: string;
  description?: string;
  permissions: string[];
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RBACRoleSchema: Schema = new Schema(
  {
    roleName: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    permissions: [{ type: String }],
    isSystemRole: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model<IRBACEole>('RBACRole', RBACRoleSchema);
