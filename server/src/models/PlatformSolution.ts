import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSolution extends Document {
  title: string;
  slug: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  badge?: string;
  isHighlighted: boolean;
  order: number;
  isActive: boolean;
}

const PlatformSolutionSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    features: [{ type: String }],
    ctaText: { type: String, default: 'BOOK FREE CONSULTATION' },
    ctaLink: { type: String, default: '/contact' },
    badge: { type: String, default: '' },
    isHighlighted: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPlatformSolution>('PlatformSolution', PlatformSolutionSchema);
