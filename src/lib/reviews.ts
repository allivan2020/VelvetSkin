import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';

export type ApprovedReview = {
  _id: string;
  name: string;
  text: string;
  createdAt: string;
  source?: string;
};

export async function getApprovedReviews(): Promise<ApprovedReview[]> {
  try {
    await connectToDatabase();
    const reviews = await Review.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .lean();

    return reviews.map((review) => ({
      _id: String(review._id),
      name: review.name,
      text: review.text,
      createdAt:
        review.createdAt instanceof Date
          ? review.createdAt.toISOString()
          : String(review.createdAt),
      source: review.source,
    }));
  } catch (error) {
    console.error('Failed to load approved reviews:', error);
    return [];
  }
}
