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
    logoUrl: { type: String, default: '' },
    headerGradientFrom: { type: String, default: '#4c1d95' },
    headerGradientTo: { type: String, default: '#f97316' },
    footerAddress: {
      type: String,
      default: 'T-Hub, Plot No 1/C, Sy No 83/1, Raidurgam, Knowledge City Road,',
    },
    footerAddressLine2: {
      type: String,
      default: 'Serilingampalle (M), Hyderabad, Telangana 500032, India',
    },
    footerText: { type: String, default: '' },
    companyName: { type: String, default: 'Speshway Solutions' },
    companyTagline: { type: String, default: 'Website & App Development Company | Hyderabad, India' },
    contactEmail: { type: String, default: 'info@speshway.com' },
    contactPhone: { type: String, default: '+91 91000 06020' },
    website: { type: String, default: 'www.speshway.com' },
  },
  { _id: false }
);

export const ProposalMetaSchema = new Schema<IProposalMeta>(
  {
    preparedFor: { type: String, default: '' },
    projectType: { type: String, default: '' },
    currency: { type: String, default: 'Indian Rupees (INR)' },
    docRef: { type: String, default: '' },
    validityText: { type: String, default: '30 Days from Date of Issue' },
  },
  { _id: false }
);

const ProposalTemplateSchema: Schema = new Schema(
  {
    proposalProjectId: { type: Schema.Types.ObjectId, ref: 'ProposalProject', required: true },
    type: { type: String, default: 'website' },
    kind: { type: String, enum: ['generated', 'uploaded'], default: 'generated' },
    title: { type: String, required: true, trim: true },
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
