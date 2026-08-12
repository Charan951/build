import mongoose, { Schema, Document } from 'mongoose';

export interface IClientFile extends Document {
  clientId: mongoose.Types.ObjectId;
  fileName: string;
  mimeType: string;
  fileSize: number;
  fileData: Buffer;
  uploadedBy: 'admin' | 'client';
  createdAt?: Date;
  updatedAt?: Date;
}

// Client-level attachments (contracts, brand assets, ID/tax documents) that
// aren't tied to a specific project — mirrors the Buffer-in-Mongo storage
// pattern already used for proposal PDFs (see ProposalTemplate.fileData).
const ClientFileSchema: Schema = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
    fileName: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileData: { type: Buffer, required: true, select: false },
    uploadedBy: { type: String, enum: ['admin', 'client'], default: 'admin' },
  },
  { timestamps: true }
);

export default mongoose.model<IClientFile>('ClientFile', ClientFileSchema);
