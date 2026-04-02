import mongoose from 'mongoose';

// Описание одного визита
const VisitSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  zones: [{ type: String }], // Що робили
  notes: { type: String }, // Нотатки по процедурі (напр. "було вростання")
  price: { type: Number }, // Скільки заплатили (опціонально для аналітики)
});

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  source: { type: String }, // Звідки прийшов (Квіз, Інстаграм, Пряма кнопка)
  visits: [VisitSchema], // Історія всіх візитів
  notes: { type: String }, // Загальні нотатки про клієнта
  nextReminderDate: { type: Date }, // Коли написати знову
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Client || mongoose.model('Client', ClientSchema);
