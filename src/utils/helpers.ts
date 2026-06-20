import type { AuditCategory } from '../types';

const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

/**
 * Format ISO date string (YYYY-MM-DD) to Thai Buddhist calendar date.
 * Example: "2026-06-20" -> "20 มิ.ย. 2569"
 */
export const formatBuddhistDate = (dateStr: string | null | undefined, fullMonth = false): string => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(monthIdx) || isNaN(day) || monthIdx < 0 || monthIdx > 11) {
      return dateStr;
    }

    const bYear = year + 543;
    const month = fullMonth ? THAI_MONTHS_FULL[monthIdx] : THAI_MONTHS[monthIdx];
    return `${day} ${month} ${bYear}`;
  } catch (e) {
    return dateStr;
  }
};

/**
 * Calculate live score and grade based on weights.
 * Normal Score = sum(categoryAverage * categoryWeight) for categories that have scored items.
 * Categories with all N/A items are excluded, and weights of remaining categories are normalized to 100%.
 */
export const calculateAuditScore = (categories: AuditCategory[]): { score: number; grade: 'A' | 'B' | 'C' | 'D' } => {
  let totalScore = 0;
  let activeWeightSum = 0;

  for (const cat of categories) {
    let catPoints = 0;
    let catPossibleCount = 0;

    for (const item of cat.items) {
      if (item.status === 'na' || item.status === null) continue;
      
      // Status points mapping:
      // pass = 1.0, improve = 0.5, fail = 0.0
      let points = 0;
      if (item.status === 'pass') points = 1.0;
      else if (item.status === 'improve') points = 0.5;
      else if (item.status === 'fail') points = 0;

      catPoints += points;
      catPossibleCount += 1;
    }

    if (catPossibleCount > 0) {
      const catAverage = catPoints / catPossibleCount; // value between 0 and 1
      totalScore += catAverage * cat.weight;
      activeWeightSum += cat.weight;
    }
  }

  // Normalize score if some categories are completely N/A
  let finalScore = 0;
  if (activeWeightSum > 0) {
    finalScore = (totalScore / activeWeightSum) * 100;
  }

  // Round to 1 decimal place
  finalScore = Math.round(finalScore * 10) / 10;

  // Grade rules: A >= 90, B >= 80, C >= 70, D < 70
  let grade: 'A' | 'B' | 'C' | 'D' = 'D';
  if (finalScore >= 90) grade = 'A';
  else if (finalScore >= 80) grade = 'B';
  else if (finalScore >= 70) grade = 'C';

  return { score: finalScore, grade };
};
