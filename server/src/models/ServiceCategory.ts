import mongoose, { Schema, Document } from 'mongoose';

export interface ISubService {
  num: string;
  title: string;
  slug: string;
}

export interface IServiceCategory extends Document {
  num: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  subServices: ISubService[];
  order: number;
  isActive: boolean;
}

const ServiceCategorySchema: Schema = new Schema(
  {
    num: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'Code' },
    subServices: [
      {
        num: { type: String, required: true },
        title: { type: String, required: true },
        slug: { type: String, required: true },
      },
    ],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IServiceCategory>('ServiceCategory', ServiceCategorySchema);
