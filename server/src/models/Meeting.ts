import mongoose, { Schema, Document } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  clientId?: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24h)
  durationMinutes: number;
  attendees: string[];
  description?: string;
  meetingLink?: string;
  googleEventId?: string;
  reminderMinutesBefore: number;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
    date: { type: String, required: true },
    time: { type: String, required: true },
    durationMinutes: { type: Number, default: 60 },
    attendees: [{ type: String, trim: true, lowercase: true }],
    description: { type: String },
    meetingLink: { type: String },
    googleEventId: { type: String },
    reminderMinutesBefore: { type: Number, default: 15 },
  },
  { timestamps: true }
);

MeetingSchema.index({ clientId: 1, date: 1 });

export default mongoose.model<IMeeting>('Meeting', MeetingSchema);
