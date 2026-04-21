/**
 * Lead Scoring Engine
 * Scores a business lead from 0–100 based on opportunity signals.
 */

const HIGH_VALUE_CATEGORIES = [
  'restaurant', 'cafe', 'gym', 'fitness', 'hotel', 'salon', 'spa',
  'clinic', 'hospital', 'school', 'college', 'institute', 'shop',
  'store', 'boutique', 'bakery', 'pharmacy', 'dental', 'lawyer',
  'advocate', 'consultant', 'agency', 'studio', 'coaching',
];

/**
 * @param {Object} business
 * @param {boolean} business.hasWebsite
 * @param {number} business.rating
 * @param {number} business.reviewCount
 * @param {string} business.category
 * @returns {{ score: number, isHot: boolean, reasons: string[] }}
 */
function scoreLead(business) {
  let score = 0;
  const reasons = [];

  // No website = biggest opportunity signal
  if (!business.hasWebsite) {
    score += 40;
    reasons.push('No website');
  }

  // Review count = business is active
  if (business.reviewCount >= 200) {
    score += 20;
    reasons.push('200+ reviews (very active)');
  } else if (business.reviewCount >= 100) {
    score += 15;
    reasons.push('100+ reviews (active)');
  } else if (business.reviewCount >= 50) {
    score += 10;
    reasons.push('50+ reviews');
  } else if (business.reviewCount >= 20) {
    score += 5;
    reasons.push('20+ reviews');
  }

  // Rating = good reputation, worth approaching
  if (business.rating >= 4.5) {
    score += 15;
    reasons.push('Rating ≥ 4.5');
  } else if (business.rating >= 4.0) {
    score += 10;
    reasons.push('Rating ≥ 4.0');
  } else if (business.rating >= 3.5) {
    score += 5;
    reasons.push('Rating ≥ 3.5');
  }

  // High-value category
  const categoryLower = (business.category || '').toLowerCase();
  const isHighValue = HIGH_VALUE_CATEGORIES.some((cat) =>
    categoryLower.includes(cat)
  );
  if (isHighValue) {
    score += 15;
    reasons.push('High-value category');
  }

  // Has phone number = contactable
  if (business.phone) {
    score += 10;
    reasons.push('Has phone number');
  }

  // Cap at 100
  score = Math.min(score, 100);

  // Hot lead: no website + meaningful reviews
  const isHot = !business.hasWebsite && business.reviewCount >= 30;

  return { score, isHot, reasons };
}

module.exports = { scoreLead };
