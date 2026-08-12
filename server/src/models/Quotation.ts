import mongoose, { Schema, Document } from 'mongoose';

export interface IQuotationLineItem {
  moduleName: string;
  description?: string;
  hours: number;
  rate: number;
  lineTotal: number;
}

export interface IQuotation extends Document {
  quotationNumber: string;
  clientId: mongoose.Types.ObjectId;
  requirementId?: mongoose.Types.ObjectId;
  version: string;
  lineItems: IQuotationLineItem[];
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxType: 'GST_18' | 'CGST_SGST_9' | 'NONE';
  taxAmount: number;
  grandTotal: number;
  estimatedTimelineDays: number;
  terms?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  validUntil: Date;
  approvedAt?: Date;
  versionHistory: {
    version: string;
    grandTotal: number;
    updatedAt: Date;
    changesNote?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const QuotationLineItemSchema: Schema = new Schema({
  moduleName: { type: String, required: true },
  description: { type: String },
  hours: { type: Number, required: true, default: 0 },
  rate: { type: Number, required: true, default: 0 },
  lineTotal: { type: Number, required: true, default: 0 }
});

const QuotationSchema: Schema = new Schema(
  {
    quotationNumber: { type: String, required: true, unique: true, trim: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    requirementId: { type: Schema.Types.ObjectId, ref: 'Requirement' },
    version: { type: String, default: 'v1.0' },
    lineItems: [QuotationLineItemSchema],
    subtotal: { type: Number, required: true, default: 0 },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' },
    discountValue: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxType: { type: String, enum: ['GST_18', 'CGST_SGST_9', 'NONE'], default: 'GST_18' },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },
    estimatedTimelineDays: { type: Number, default: 30 },
    terms: { type: String },
    status: {
      type: String,
      enum: ['draft', 'sent', 'approved', 'rejected', 'expired'],
      default: 'draft'
    },
    validUntil: { type: Date, required: true },
    approvedAt: { type: Date },
    versionHistory: [
      {
        version: { type: String },
        grandTotal: { type: Number },
        updatedAt: { type: Date, default: Date.now },
        changesNote: { type: String }
      }
    ]
  },
  { timestamps: true }
);

QuotationSchema.index({ quotationNumber: 1, clientId: 1, status: 1 });

export default mongoose.model<IQuotation>('Quotation', QuotationSchema);
