import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';
import {
  formatReviewDateUTC,
  type ApprovedReview,
} from '@/lib/review-date';

export type { ApprovedReview };
export { formatReviewDateUTC };

export async function getApprovedReviews(): Promise<ApprovedReview[]> {
  try {
    await connectToDatabase();
    const reviews = await Review.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .lean();

    return reviews.map((review) => {
      const createdAt =
        review.createdAt instanceof Date
          ? review.createdAt.toISOString()
          : String(review.createdAt);
      return {
        _id: String(review._id),
        name: review.name,
        text: review.text,
        createdAt,
        formattedDate: formatReviewDateUTC(createdAt),
        source: review.source,
      };
    });
  } catch (error) {
    console.error('Failed to load approved reviews:', error);
    return [];
  }
}
