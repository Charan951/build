import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  readTime: string;
  isPublished: boolean;
  publishedAt: Date;
  seoTitle?: string;
  seoDescription?: string;
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String, required: true },
    author: {
      name: { type: String, required: true, default: 'Engineering Team' },
      role: { type: String, required: true, default: 'Software Architect' },
      avatar: { type: String },
    },
    category: { type: String, required: true },
    tags: [{ type: String }],
    readTime: { type: String, default: '5 min read' },
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IBlog>('Blog', BlogSchema);
