import mongoose, { Schema, Document } from 'mongoose';

// Single shared connection for the whole admin team — one workspace, one
// connected Google Calendar, same pattern as SMTP/Cloudinary being global env config.
export interface IGoogleIntegration extends Document {
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
  connectedEmail?: string;
  scope?: string;
  connectedAt: Date;
}

const GoogleIntegrationSchema: Schema = new Schema(
  {
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiryDate: { type: Number, required: true },
    connectedEmail: { type: String },
    scope: { type: String },
    connectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IGoogleIntegration>('GoogleIntegration', GoogleIntegrationSchema);
