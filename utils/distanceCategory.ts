export type DistanceCategory = 'full' | 'half' | '10k' | '5k' | 'ultra' | 'trail';

/**
 * Categorize a distance string (joined tags) into distance categories.
 * A single event can belong to multiple categories (e.g., "풀 / 하프 / 10km").
 */
export function getDistanceCategories(distance: string): DistanceCategory[] {
  if (!distance) return [];
  const categories: Set<DistanceCategory> = new Set();

  // Ultra (50km+)
  if (/(?:50|5[1-9]|[6-9]\d|[1-9]\d{2,})\s*(?:km|k)\b/i.test(distance) || /울트라/i.test(distance)) {
    categories.add('ultra');
  }

  // Trail
  if (/트레일|trail/i.test(distance)) {
    categories.add('trail');
  }

  // Full marathon
  if (/풀|full|42\.?195|42\s*km|42\s*k\b/i.test(distance)) {
    categories.add('full');
  }

  // Half marathon
  if (/하프|half|21\s*km|21\s*k\b/i.test(distance)) {
    categories.add('half');
  }

  // 10km
  if (/\b10\s*km|\b10\s*k\b|10K/i.test(distance)) {
    categories.add('10k');
  }

  // 5km
  if (/\b5\s*km|\b5\s*k\b|5K/i.test(distance)) {
    categories.add('5k');
  }

  return Array.from(categories);
}

export const DISTANCE_LABELS: Record<DistanceCategory, string> = {
  full: '풀코스',
  half: '하프',
  '10k': '10K',
  '5k': '5K',
  ultra: '울트라',
  trail: '트레일',
};

export const DISTANCE_ORDER: DistanceCategory[] = ['full', 'half', '10k', '5k', 'ultra', 'trail'];
