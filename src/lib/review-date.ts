export type ApprovedReview = {
  _id: string;
  name: string;
  text: string;
  createdAt: string;
  /** Preformatted on server (UTC) so SSR and client text match. */
  formattedDate: string;
  source?: string;
};

/** Deterministic UTC date for hydration-safe rendering. */
export function formatReviewDateUTC(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}.${mm}.${yyyy}`;
}
