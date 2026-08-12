import mongoose, { Schema, Document } from 'mongoose';

export interface IPipelineStage extends Document {
  name: string;
  color: string;
  order: number;
  isSystemDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PipelineStageSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    color: { type: String, required: true, default: '#3B82F6' },
    order: { type: Number, required: true, default: 0 },
    isSystemDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
);

PipelineStageSchema.index({ order: 1 });

export default mongoose.model<IPipelineStage>('PipelineStage', PipelineStageSchema);
