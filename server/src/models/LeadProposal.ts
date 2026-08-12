import mongoose, { Schema, Document } from 'mongoose';
import { IProposalBranding, IProposalMeta, ProposalBrandingSchema, ProposalMetaSchema } from './ProposalTemplate';

export interface ILeadProposal extends Document {
  leadId: mongoose.Types.ObjectId;
  sourceTemplateId?: mongoose.Types.ObjectId;
  projectName: string;
  type: string;
  kind: 'generated' | 'uploaded';
  title: string;
  contentHtml: string;
  fileUrl?: string;
  fileName?: string;
  fileData?: Buffer;
  branding: IProposalBranding;
  meta: IProposalMeta;
  status: 'draft' | 'sent';
  sentAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const LeadProposalSchema: Schema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    sourceTemplateId: { type: Schema.Types.ObjectId, ref: 'ProposalTemplate' },
    projectName: { type: String, default: '' },
    type: { type: String, default: 'website' },
    kind: { type: String, enum: ['generated', 'uploaded'], default: 'generated' },
    title: { type: String, default: '' },
    contentHtml: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileData: { type: Buffer, select: false },
    branding: { type: ProposalBrandingSchema, default: () => ({}) },
    meta: { type: ProposalMetaSchema, default: () => ({}) },
    status: { type: String, enum: ['draft', 'sent'], default: 'draft' },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ILeadProposal>('LeadProposal', LeadProposalSchema);
