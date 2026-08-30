import mongoose from 'mongoose';

// Описание одного визита
const VisitSchema = new mongoose.Schema({
  date: { type: String, required: true }, // Оставляем String (напр. '10.04.2026'), чтобы не было проблем с часовыми поясами
  zones: [{ type: String }], // Что делали
  notes: { type: String, default: '' }, // Заметки по конкретной процедуре (например, "было врастание")
  price: { type: Number, default: 0 }, // Сколько заплатили
});

// Карточка клиента
const ClientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    telegram: { type: String, default: '' },
    source: { type: String, default: '' }, // Откуда пришел (Квиз, Инстаграм, Сайт)
    visits: [VisitSchema], // История всех визитов
    generalNotes: { type: String, default: '' }, // Общие заметки о клиенте (характер, особенности)
    /** Next visit date yyyy-MM-dd */
    nextAppointment: { type: String, default: '' },
    /** Next visit time HH:mm (local Europe/Kyiv) */
    nextAppointmentTime: { type: String, default: '' },
    /** Short label for calendar (service / zones) */
    nextAppointmentService: { type: String, default: '' },
  },
  { timestamps: true }, // Автоматически добавит createdAt и updatedAt
);

export default mongoose.models.Client || mongoose.model('Client', ClientSchema);
