import mongoose, { Schema, Document } from 'mongoose';

export interface IPricingPlan extends Document {
  name: string;
  price: string;
  currency: string;
  billingCycle: string;
  description?: string;
  features: string[];
  isPopular: boolean;
  buttonText: string;
  buttonLink: string;
  order: number;
  isActive: boolean;
}

const PricingPlanSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: String, required: true },
    currency: { type: String, default: '$' },
    billingCycle: { type: String, default: 'One-time payment' },
    description: { type: String, default: '' },
    features: [{ type: String }],
    isPopular: { type: Boolean, default: false },
    buttonText: { type: String, default: 'Get Started' },
    buttonLink: { type: String, default: '/contact' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPricingPlan>('PricingPlan', PricingPlanSchema);
