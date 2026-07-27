import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  category: string;
  features: string[];
  benefits: string[];
  techStack: string[];
  processSteps: { title: string; description: string }[];
  isActive: boolean;
  order: number;
}

const ServiceSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, required: true },
    icon: { type: String, required: true, default: 'Code2' },
    category: { type: String, required: true },
    features: [{ type: String }],
    benefits: [{ type: String }],
    techStack: [{ type: String }],
    processSteps: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IService>('Service', ServiceSchema);
