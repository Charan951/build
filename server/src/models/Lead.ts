import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType: string;
  budgetRange: string;
  message: string;
  status: 'new' | 'contacted' | 'in_progress' | 'closed';
  source?: string;
  ipAddress?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const LeadSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    projectType: { type: String, required: true },
    budgetRange: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['new', 'contacted', 'in_progress', 'closed'],
      default: 'new',
    },
    source: { type: String, default: 'website_contact_form' },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ILead>('Lead', LeadSchema);
