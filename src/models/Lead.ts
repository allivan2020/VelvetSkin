import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  experience: { type: String }, // Новачок або Постійний
  selections: [{ type: String }], // Що обрали (зони/болі)
  status: {
    type: String,
    enum: ['Новий', 'В роботі', 'Конвертовано', 'Відмова'],
    default: 'Новий',
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
