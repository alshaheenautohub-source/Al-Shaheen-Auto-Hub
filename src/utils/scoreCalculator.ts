import { ChecklistItem, DefectPoint } from '../types/inspection';

export interface CalculatedScores {
  overallRating: number; // 0.0 - 10.0
  scores: {
    engine: number;
    brakes: number;
    suspension: number;
    interior: number;
    ac_heater: number;
    electrical: number;
    exterior: number;
    tyres: number;
    body_frame: number;
  };
  criticalAlerts: string[];
}

export function calculateInspectionScores(
  checklist: ChecklistItem[],
  defectPoints: DefectPoint[]
): CalculatedScores {
  const criticalAlerts: string[] = [];

  // Group items by category
  const categories = {
    engine: checklist.filter((i) => i.category === 'engine'),
    brakes: checklist.filter((i) => i.category === 'brakes'),
    suspension: checklist.filter((i) => i.category === 'suspension'),
    interior: checklist.filter((i) => i.category === 'interior'),
    ac_heater: checklist.filter((i) => i.category === 'ac_heater'),
    electrical: checklist.filter((i) => i.category === 'electrical'),
    exterior: checklist.filter((i) => i.category === 'exterior'),
    tyres: checklist.filter((i) => i.category === 'tyres'),
    body_frame: checklist.filter((i) => i.category === 'body_frame'),
  };

  const calculateCategoryScore = (items: ChecklistItem[], categoryKey: string): number => {
    if (items.length === 0) return 100;

    let totalPoints = 0;
    let earnedPoints = 0;

    for (const item of items) {
      // Base weight
      let weight = 1.0;

      // Critical items have higher impact
      if (item.name.includes('Leakage') || item.name.includes('Blow') || item.name.includes('Air Bag') || item.name.includes('Computer Check') || item.name.includes('Pillar') || item.name.includes('Rail')) {
        weight = 2.0;
      }

      totalPoints += weight;

      if (item.statusType === 'good') {
        earnedPoints += weight * 1.0;
      } else if (item.statusType === 'neutral') {
        earnedPoints += weight * 0.75;
      } else if (item.statusType === 'warning') {
        earnedPoints += weight * 0.45;
      } else if (item.statusType === 'danger') {
        earnedPoints += 0;
        if (item.name.includes('Leakage') || item.name.includes('Air Bag') || item.name.includes('Need Replacement') || item.name.includes('Error')) {
          criticalAlerts.push(`${item.name}: ${item.value}`);
        }
      }
    }

    let percent = Math.round((earnedPoints / totalPoints) * 100);

    // Apply body defect deductions to exterior score
    if (categoryKey === 'exterior') {
      const defectCount = defectPoints.length;
      const penalty = Math.min(defectCount * 3.2, 75);
      percent = Math.max(10, Math.round(percent - penalty));
    }

    return Math.min(100, Math.max(0, percent));
  };

  const scores = {
    engine: calculateCategoryScore(categories.engine, 'engine'),
    brakes: calculateCategoryScore(categories.brakes, 'brakes'),
    suspension: calculateCategoryScore(categories.suspension, 'suspension'),
    interior: calculateCategoryScore(categories.interior, 'interior'),
    ac_heater: calculateCategoryScore(categories.ac_heater, 'ac_heater'),
    electrical: calculateCategoryScore(categories.electrical, 'electrical'),
    exterior: calculateCategoryScore(categories.exterior, 'exterior'),
    tyres: calculateCategoryScore(categories.tyres, 'tyres'),
    body_frame: calculateCategoryScore(categories.body_frame, 'body_frame'),
  };

  // Weighted overall calculation out of 10
  const weights = {
    engine: 0.22,
    body_frame: 0.18,
    brakes: 0.12,
    suspension: 0.12,
    electrical: 0.10,
    ac_heater: 0.08,
    interior: 0.08,
    exterior: 0.05,
    tyres: 0.05,
  };

  const weightedSum =
    scores.engine * weights.engine +
    scores.body_frame * weights.body_frame +
    scores.brakes * weights.brakes +
    scores.suspension * weights.suspension +
    scores.electrical * weights.electrical +
    scores.ac_heater * weights.ac_heater +
    scores.interior * weights.interior +
    scores.exterior * weights.exterior +
    scores.tyres * weights.tyres;

  // Rating out of 10 with 1 decimal place (e.g. 4.4 / 10)
  const overallRating = Math.round((weightedSum / 10) * 10) / 10;

  return {
    overallRating,
    scores,
    criticalAlerts,
  };
}
