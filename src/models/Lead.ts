import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  service: { type: String }, // <-- Добавили (услуга из формы)
  type: { type: String }, // <-- Добавили (Квіз или Кнопка)
  experience: { type: String },
  selections: [{ type: String }],
  status: {
    type: String,
    enum: ['Новий', 'В роботі', 'Конвертовано', 'Відмова'],
    default: 'Новий',
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
