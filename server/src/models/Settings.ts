import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  address: string;
  phone: string;
  email: string;
  githubUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
}

const SettingsSchema: Schema = new Schema(
  {
    address: { type: String, required: true, default: 'Kota, Rajasthan, India' },
    phone: { type: String, required: true, default: '+91 98765 43210' },
    email: { type: String, required: true, default: 'hello@buildyourthoughts.com' },
    githubUrl: { type: String, default: 'https://github.com' },
    twitterUrl: { type: String, default: 'https://twitter.com' },
    linkedinUrl: { type: String, default: 'https://linkedin.com' },
  },
  { timestamps: true }
);

export default mongoose.model<ISettings>('Settings', SettingsSchema);
