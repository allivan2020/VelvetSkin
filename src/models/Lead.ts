import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  service: { type: String },
  type: { type: String },
  experience: { type: String },
  selections: [{ type: String }],
  status: {
    type: String,
    enum: ['Новий', 'В роботі', 'Конвертовано', 'Відмова'],
    default: 'Новий',
  },
  // Додаємо поле для поради від нашого ІІ-агента
  aiSummary: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
