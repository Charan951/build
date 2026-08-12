import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType?: string;
  budgetRange?: string;
  message?: string;
  status: string; // Dynamic stage name or 'New'|'Contacted'|'Qualified'|'Proposal Sent'|'Won'|'Lost'
  stageId?: mongoose.Types.ObjectId;
  estimatedValue: number;
  source: string;
  assignedTo?: string;
  followUpDate?: Date;
  followUpTime?: string;
  notes?: string;
  wonAt?: Date;
  convertedAt?: Date;
  lostReason?: string;
  ipAddress?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const LeadSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, default: '' },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    projectType: { type: String, default: 'General Inquiry' },
    budgetRange: { type: String, default: 'Flexible' },
    message: { type: String, default: '' },
    status: { type: String, default: 'New' },
    stageId: { type: Schema.Types.ObjectId, ref: 'PipelineStage' },
    estimatedValue: { type: Number, default: 0 },
    source: { type: String, default: 'Other' },
    assignedTo: { type: String, default: 'Unassigned' },
    followUpDate: { type: Date },
    followUpTime: { type: String },
    notes: { type: String },
    wonAt: { type: Date },
    convertedAt: { type: Date },
    lostReason: { type: String },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

LeadSchema.index({ name: 'text', company: 'text', email: 'text', phone: 'text' });

export default mongoose.model<ILead>('Lead', LeadSchema);
