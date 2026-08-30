import mongoose from 'mongoose';

/** Events synced from personal ICS (iPhone notes / busy). Read-only from phone. */
const BusyBlockSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },
    summary: { type: String, default: '' },
    description: { type: String, default: '' },
    allDay: { type: Boolean, default: false },
    source: { type: String, default: 'personal_ics' },
  },
  { timestamps: true },
);

export default mongoose.models.BusyBlock ||
  mongoose.model('BusyBlock', BusyBlockSchema);
