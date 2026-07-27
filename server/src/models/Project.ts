import mongoose, { Schema, Document } from 'mongoose';

export interface IImpactMetric {
  label: string;
  value: string;
  description?: string;
}

export interface IProject extends Document {
  title: string;
  slug: string;
  tagline: string;
  client: string;
  industry: string;
  category: 'Enterprise' | 'AI' | 'Mobile' | 'Cloud' | 'UI/UX';
  summary: string;
  heroImage: string;
  challenge: string;
  solution: string;
  technicalArchitecture: string;
  impactMetrics: IImpactMetric[];
  techStack: string[];
  gallery: string[];
  websiteUrl?: string;
  playStoreUrl?: string;
  appStoreUrl?: string;
  location?: string;
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    company: string;
    avatar?: string;
  };
  status: 'draft' | 'published';
  featured: boolean;
  order: number;
}

const ProjectSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    tagline: { type: String, required: true },
    client: { type: String, required: true },
    industry: { type: String, required: true },
    category: {
      type: String,
      enum: ['Enterprise', 'AI', 'Mobile', 'Cloud', 'UI/UX'],
      required: true,
    },
    summary: { type: String, required: true },
    heroImage: { type: String, required: true },
    challenge: { type: String, required: true },
    solution: { type: String, required: true },
    technicalArchitecture: { type: String, required: true },
    impactMetrics: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
        description: { type: String },
      },
    ],
    techStack: [{ type: String }],
    gallery: [{ type: String }],
    websiteUrl: { type: String, default: 'https://www.buildyourthougths.in/' },
    playStoreUrl: { type: String, default: '' },
    appStoreUrl: { type: String, default: '' },
    location: { type: String, default: '' },
    testimonial: {
      quote: { type: String },
      author: { type: String },
      role: { type: String },
      company: { type: String },
      avatar: { type: String },
    },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IProject>('Project', ProjectSchema);
