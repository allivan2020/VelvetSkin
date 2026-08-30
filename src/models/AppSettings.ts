import mongoose from 'mongoose';

const AppSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'default' },
    /** Secret iCal/webcal URL of personal calendar (iPhone/Google). Admin only. */
    personalIcsUrl: { type: String, default: '' },
    personalIcsSyncedAt: { type: Date, default: null },
    personalIcsLastError: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.models.AppSettings ||
  mongoose.model('AppSettings', AppSettingsSchema);
