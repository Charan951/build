import mongoose, { Schema, Document } from 'mongoose';

// Single shared connection for the whole admin team, same pattern as
// GoogleIntegration - one Page token connects Meta Lead Ads for everyone.
export interface IMetaIntegration extends Document {
  pageId: string;
  pageAccessToken: string;
  pageName?: string;
  connectedAt: Date;
}

const MetaIntegrationSchema: Schema = new Schema(
  {
    pageId: { type: String, required: true },
    pageAccessToken: { type: String, required: true },
    pageName: { type: String },
    connectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IMetaIntegration>('MetaIntegration', MetaIntegrationSchema);
