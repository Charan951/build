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
  /**
   * Which authoring surface is the source of truth for this template's
   * rendered PDF. 'document' (default) is the rich AI-styled contentHtml
   * renderer (gradient plan cards, meta grid, zebra tables, callout boxes -
   * see pdfService.ts buildProposalHtmlDocument); 'canvas' is the freeform
   * drag/drop editor. Both contentHtml and pages persist regardless of mode
   * so switching back and forth never loses work.
   */
  renderMode: 'document' | 'canvas';
  /**
   * Freeform canvas pages (absolutely-positioned text/table elements), same
   * shape as ProjectWorkspace's quotation canvas. Left `Mixed` because the
   * element shape is owned by the editor UI, not the database - see the
   * identical rationale on ProjectWorkspace.IProjectQuotation.pages.
   */
  pages?: any[];
  fontFamily?: string;
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
    headerGradientFrom: { type: String, default: '#0f2a3d', maxlength: 20 },
    headerGradientTo: { type: String, default: '#1f9d63', maxlength: 20 },
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
    renderMode: { type: String, enum: ['document', 'canvas'], default: 'document' },
    pages: { type: [Schema.Types.Mixed], default: () => [] },
    fontFamily: { type: String, default: 'Helvetica', maxlength: 60 },
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileData: { type: Buffer, select: false },
    branding: { type: ProposalBrandingSchema, default: () => ({}) },
    meta: { type: ProposalMetaSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.model<IProposalTemplate>('ProposalTemplate', ProposalTemplateSchema);
