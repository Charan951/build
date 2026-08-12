import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IContact {
  name: string;
  designation?: string;
  email: string;
  phone?: string;
  isPrimary: boolean;
}

export interface IClient extends Document {
  sourceLeadId?: mongoose.Types.ObjectId;
  companyName: string;
  industry?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  billingEmail?: string;
  phone?: string;
  currency: string;
  contacts: IContact[];
  status: 'active' | 'inactive';
  totalRevenue: number;
  outstandingBalance: number;
  notes?: string;
  passwordHash?: string;
  portalAccessEnabled: boolean;
  lastPortalLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const ContactSchema: Schema = new Schema({
  name: { type: String, required: true },
  designation: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  isPrimary: { type: Boolean, default: false }
});

const ClientSchema: Schema = new Schema(
  {
    sourceLeadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    companyName: { type: String, required: true, trim: true },
    industry: { type: String },
    gstin: { type: String, trim: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'India' },
    zipCode: { type: String },
    billingEmail: { type: String, lowercase: true, trim: true },
    phone: { type: String },
    currency: { type: String, default: 'INR' },
    contacts: [ContactSchema],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    totalRevenue: { type: Number, default: 0 },
    outstandingBalance: { type: Number, default: 0 },
    notes: { type: String },
    passwordHash: { type: String, select: false },
    portalAccessEnabled: { type: Boolean, default: false },
    lastPortalLogin: { type: Date },
  },
  { timestamps: true }
);

ClientSchema.index({ companyName: 'text', billingEmail: 'text' });

ClientSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model<IClient>('Client', ClientSchema);
