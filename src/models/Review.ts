import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  name: string;
  text: string;
  source: string;
  isApproved: boolean;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    text: { type: String, required: true },
    source: { type: String, default: 'Сайт' },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Review =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
