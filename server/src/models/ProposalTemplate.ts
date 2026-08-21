import mongoose, { Schema, Document } from 'mongoose';

export interface IProposalBranding {
  logoUrl?: string;
  headerGradientFrom?: string;
  headerGradientTo?: string;
  footerAddress?: string;
  footerAddressLine2?: string;
  footerText?: string;
  companyName?: string;
  companyTagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
}

export interface IProposalMeta {
  preparedFor?: string;
  projectType?: string;
  currency?: string;
  docRef?: string;
  validityText?: string;
}

export interface IProposalTemplate extends Document {
  proposalProjectId: mongoose.Types.ObjectId;
  type: string; // 'website' | 'app' | 'website_app' | custom
  kind: 'generated' | 'uploaded';
  title: string;
  contentHtml: string;
  fileUrl?: string;
  fileName?: string;
  fileData?: Buffer;
  branding: IProposalBranding;
  meta: IProposalMeta;
  createdAt?: Date;
  updatedAt?: Date;
}

export const ProposalBrandingSchema = new Schema<IProposalBranding>(
  {
    logoUrl: { type: String, default: '', maxlength: 2048 },
    headerGradientFrom: { type: String, default: '#4c1d95', maxlength: 20 },
    headerGradientTo: { type: String, default: '#f97316', maxlength: 20 },
    footerAddress: {
      type: String,
      default: 'T-Hub, Plot No 1/C, Sy No 83/1, Raidurgam, Knowledge City Road,',
      maxlength: 160,
    },
    footerAddressLine2: {
      type: String,
      default: 'Serilingampalle (M), Hyderabad, Telangana 500032, India',
      maxlength: 160,
    },
    footerText: { type: String, default: '', maxlength: 160 },
    companyName: { type: String, default: 'Speshway Solutions', maxlength: 120 },
    companyTagline: { type: String, default: 'Website & App Development Company | Hyderabad, India', maxlength: 160 },
    contactEmail: { type: String, default: 'info@speshway.com', maxlength: 254 },
    contactPhone: { type: String, default: '+91 91000 06020', maxlength: 40 },
    website: { type: String, default: 'www.speshway.com', maxlength: 200 },
  },
  { _id: false }
);

export const ProposalMetaSchema = new Schema<IProposalMeta>(
  {
    preparedFor: { type: String, default: '', maxlength: 120 },
    projectType: { type: String, default: '', maxlength: 120 },
    currency: { type: String, default: 'Indian Rupees (INR)', maxlength: 60 },
    docRef: { type: String, default: '', maxlength: 80 },
    validityText: { type: String, default: '30 Days from Date of Issue', maxlength: 120 },
  },
  { _id: false }
);

const ProposalTemplateSchema: Schema = new Schema(
  {
    proposalProjectId: { type: Schema.Types.ObjectId, ref: 'ProposalProject', required: true },
    type: { type: String, default: 'website' },
    kind: { type: String, enum: ['generated', 'uploaded'], default: 'generated' },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    contentHtml: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileData: { type: Buffer, select: false },
    branding: { type: ProposalBrandingSchema, default: () => ({}) },
    meta: { type: ProposalMetaSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.model<IProposalTemplate>('ProposalTemplate', ProposalTemplateSchema);
