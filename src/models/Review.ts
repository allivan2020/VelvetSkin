import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  name: string;
  text: string;
  date: string;
  source: string;
  link: string;
  isApproved: boolean;
}

const ReviewSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    text: { type: String, required: true },
    // Сохраняем дату в красивом формате автоматически
    date: {
      type: String,
      default: () => {
        const months = [
          'Січня',
          'Лютого',
          'Березня',
          'Квітня',
          'Травня',
          'Червня',
          'Липня',
          'Серпня',
          'Вересня',
          'Жовтня',
          'Листопада',
          'Грудня',
        ];
        const d = new Date();
        return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
      },
    },
    source: { type: String, default: 'Сайт' },
    link: { type: String, default: '#' },
    // Тот самый скрытый статус модерации! По умолчанию false.
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Проверяем, создана ли уже модель (особенность Next.js)
export default mongoose.models.Review ||
  mongoose.model<IReview>('Review', ReviewSchema);
