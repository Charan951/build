import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceLineItem {
  description: string;
  quantity: number;
  price: number;
  taxPercent?: number;
  amount: number;
}

export interface IPaymentRecord {
  amount: number;
  paymentMode: 'UPI' | 'NetBanking' | 'Wire' | 'Cheque' | 'Cash';
  transactionRef: string;
  paymentDate: Date;
  receiptPdfUrl?: string;
  notes?: string;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  clientId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  quotationId?: mongoose.Types.ObjectId;
  type: 'advance' | 'milestone' | 'final' | 'maintenance';
  lineItems: IInvoiceLineItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
  dueDate: Date;
  paymentQRUrl?: string;
  payments: IPaymentRecord[];
  notes?: string;
  fromName?: string;
  fromEmail?: string;
  fromPhone?: string;
  billToName?: string;
  billToEmail?: string;
  billToPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceLineItemSchema: Schema = new Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true, default: 0 },
  taxPercent: { type: Number, default: 0 },
  amount: { type: Number, required: true, default: 0 }
});

const PaymentRecordSchema: Schema = new Schema({
  amount: { type: Number, required: true },
  paymentMode: {
    type: String,
    enum: ['UPI', 'NetBanking', 'Wire', 'Cheque', 'Cash'],
    default: 'UPI'
  },
  transactionRef: { type: String, required: true },
  paymentDate: { type: Date, default: Date.now },
  receiptPdfUrl: { type: String },
  notes: { type: String }
});

const InvoiceSchema: Schema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'ProjectWorkspace' },
    quotationId: { type: Schema.Types.ObjectId, ref: 'Quotation' },
    type: {
      type: String,
      enum: ['advance', 'milestone', 'final', 'maintenance'],
      default: 'advance'
    },
    lineItems: [InvoiceLineItemSchema],
    subtotal: { type: Number, required: true, default: 0 },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'paid', 'overdue'],
      default: 'unpaid'
    },
    dueDate: { type: Date, required: true },
    paymentQRUrl: { type: String },
    payments: [PaymentRecordSchema],
    notes: { type: String },
    fromName: { type: String },
    fromEmail: { type: String },
    fromPhone: { type: String },
    billToName: { type: String },
    billToEmail: { type: String },
    billToPhone: { type: String },
  },
  { timestamps: true }
);

InvoiceSchema.index({ invoiceNumber: 1, clientId: 1, status: 1 });

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
