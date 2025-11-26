/**
 * Risk Scoring Engine
 * 
 * Implements weighted risk scoring algorithm that computes:
 * 1. Raw risk score (weighted sum of all risk factors)
 * 2. Human-readable reasons explaining each contributing factor
 * 3. Component scores for debugging/validation
 * 
 * Formula:
 * Raw Score = Σ(weight_i × presenceFactor_i)
 * 
 * where presenceFactor is:
 * - For continuous values: proportion of threshold exceeded (0 to 1+)
 * - For boolean values: 1 if true, 0 if false
 * - Capped at reasonable maximum to prevent single-factor dominance
 */

import { HeartMetrics, ScoringResult } from './types';
import { thresholds, weights } from './triageRules';

/**
 * Calculate missing data penalty
 * Critical cardiac parameters that if missing increase uncertainty and baseline risk
 */
function calculateMissingDataPenalty(metrics: HeartMetrics): { penalty: number; missingCritical: string[] } {
  const criticalParameters = [
    { key: 'ejectionFraction', name: 'Ejection Fraction (EF)' },
    { key: 'lvef', name: 'LVEF' },
    { key: 'systolic', name: 'Systolic BP' },
    { key: 'diastolic', name: 'Diastolic BP' },
    { key: 'pasp', name: 'PASP' },
    { key: 'trVelocity', name: 'TR Velocity' },
    { key: 'ecgResult', name: 'ECG' },
    { key: 'familyHistory', name: 'Family History' }
  ];

  const missingCritical: string[] = [];
  
  // Check EF (either field)
  const hasEF = metrics.ejectionFraction !== undefined || metrics.lvef !== undefined;
  if (!hasEF) missingCritical.push('Ejection Fraction (EF)');
  
  // Check BP (both required)
  const hasBP = metrics.systolic !== undefined && metrics.diastolic !== undefined;
  if (!hasBP) missingCritical.push('Blood Pressure');
  
  // Check other critical parameters
  if (metrics.pasp === undefined) missingCritical.push('PASP');
  if (metrics.trVelocity === undefined) missingCritical.push('TR Velocity');
  if (metrics.ecgResult === undefined) missingCritical.push('ECG');
  if (metrics.familyHistory === undefined) missingCritical.push('Family History');
  
  // Apply penalty: 1 point per missing critical parameter
  const penalty = missingCritical.length * 1.0;
  
  return { penalty, missingCritical };
}

/**
 * NEW: Calculate age-based risk points (-6 to +6)
 */
function calculateAgeRisk(age: number | undefined): { points: number; reason: string } {
  if (age === undefined) return { points: 0, reason: '⚠️ Age not provided (0 points)' };
  
  if (age < 30) return { points: -6, reason: `✓ Age ${age} years (Young, -6 points)` };
  if (age < 40) return { points: -3, reason: `✓ Age ${age} years (Low risk, -3 points)` };
  if (age < 50) return { points: 0, reason: `ℹ️ Age ${age} years (Baseline, 0 points)` };
  if (age < 60) return { points: 2, reason: `⚠️ Age ${age} years (Moderate risk, +2 points)` };
  if (age < 70) return { points: 4, reason: `⚠️ Age ${age} years (Elevated risk, +4 points)` };
  return { points: 6, reason: `⚠️ Age ${age} years (High risk, +6 points)` };
}

/**
 * NEW: Calculate LDL cholesterol risk points (0-8)
 */
function calculateLDLRisk(ldl: number | undefined): { points: number; reason: string } {
  if (ldl === undefined) return { points: 0, reason: 'ℹ️ LDL not provided (0 points)' };
  
  if (ldl < 100) return { points: 0, reason: `✓ LDL ${ldl} mg/dL (Optimal, 0 points)` };
  if (ldl < 130) return { points: 2, reason: `ℹ️ LDL ${ldl} mg/dL (Near optimal, +2 points)` };
  if (ldl < 160) return { points: 4, reason: `⚠️ LDL ${ldl} mg/dL (Borderline high, +4 points)` };
  if (ldl < 190) return { points: 6, reason: `⚠️ LDL ${ldl} mg/dL (High, +6 points)` };
  return { points: 8, reason: `⚠️ CRITICAL: LDL ${ldl} mg/dL (Very high, +8 points)` };
}

/**
 * NEW: Calculate HDL cholesterol risk points (-2 to +4)
 */
function calculateHDLRisk(hdl: number | undefined, sex?: 'male' | 'female'): { points: number; reason: string } {
  if (hdl === undefined) return { points: 0, reason: 'ℹ️ HDL not provided (0 points)' };
  
  const lowThreshold = sex === 'female' ? 50 : 40;
  
  if (hdl >= 60) return { points: -2, reason: `✓ HDL ${hdl} mg/dL (Protective, -2 points)` };
  if (hdl >= lowThreshold) return { points: 0, reason: `ℹ️ HDL ${hdl} mg/dL (Acceptable, 0 points)` };
  if (hdl >= 35) return { points: 2, reason: `⚠️ HDL ${hdl} mg/dL (Low, +2 points)` };
  return { points: 4, reason: `⚠️ HDL ${hdl} mg/dL (Very low, +4 points)` };
}

/**
 * NEW: Calculate obesity risk using BMI and optional waist-hip ratio
 */
function calculateObesityRisk(metrics: HeartMetrics): { points: number; reasons: string[] } {
  const reasons: string[] = [];
  let points = 0;

  // BMI-based scoring
  if (metrics.bmi !== undefined) {
    const bmi = metrics.bmi;
    if (bmi < 18.5) {
      points += 1;
      reasons.push(`ℹ️ BMI ${bmi.toFixed(1)} (Underweight, +1 point)`);
    } else if (bmi < 25) {
      points += 0;
      reasons.push(`✓ BMI ${bmi.toFixed(1)} (Normal, 0 points)`);
    } else if (bmi < 30) {
      points += 2;
      reasons.push(`⚠️ BMI ${bmi.toFixed(1)} (Overweight, +2 points)`);
    } else if (bmi < 35) {
      points += 4;
      reasons.push(`⚠️ BMI ${bmi.toFixed(1)} (Obese Class I, +4 points)`);
    } else {
      points += 6;
      reasons.push(`⚠️ CRITICAL: BMI ${bmi.toFixed(1)} (Obese Class II+, +6 points)`);
    }
  }

  // Waist-hip ratio adjustment (if available)
  if (metrics.waist !== undefined && metrics.waist > 0) {
    const waist = metrics.waist;
    const threshold = metrics.sex === 'male' ? 102 : 88; // cm
    if (waist > threshold) {
      points += 2;
      reasons.push(`⚠️ Waist circumference ${waist}cm (Abdominal obesity, +2 points)`);
    }
  }

  // Diabetes + Obesity interaction
  if (metrics.bmi && metrics.bmi >= 25 && metrics.diabetes === true) {
    points += 3;
    reasons.push(`⚠️ INTERACTION: Diabetes + Obesity (+3 points)`);
  }

  // Smoking + Obesity interaction
  if (metrics.bmi && metrics.bmi >= 25 && metrics.smoker === true) {
    points += 2;
    reasons.push(`⚠️ INTERACTION: Smoking + Obesity (+2 points)`);
  }

  return { points, reasons };
}

/**
 * NEW: Compute final risk percentage with normalization
 * Maximum possible points = 45
 * Formula: (totalRiskPoints / 45) * 100, clamped to 5-100%
 */
function computeFinalRisk(totalPoints: number, metrics: HeartMetrics): { normalizedRisk: number; reasons: string[] } {
  const additionalReasons: string[] = [];
  
  // Base normalization: totalPoints / 45 * 100
  let normalizedRisk = (totalPoints / 45) * 100;
  
  // Young age adjustment: If age < 25 AND (diabetes OR smoking), add +10%
  if (metrics.age && metrics.age < 25 && (metrics.diabetes === true || metrics.smoker === true)) {
    normalizedRisk += 10;
    additionalReasons.push(`⚠️ YOUNG AGE ADJUSTMENT: Age <25 with major risk factors (+10% risk)`);
  }
  
  // Clamp to 5-100% range
  normalizedRisk = Math.max(5, Math.min(100, normalizedRisk));
  
  // Round to 1 decimal place for consistency
  normalizedRisk = Math.round(normalizedRisk * 10) / 10;
  
  return { normalizedRisk, reasons: additionalReasons };
}

/**
 * Main risk scoring function - NEW POINTS-BASED SYSTEM
 * 
 * @param metrics - Extracted cardiac metrics
 * @returns Object containing score, reasons, and rawScore
 */
export function scoreRisk(metrics: HeartMetrics): ScoringResult {
  const reasons: string[] = [];
  let totalRiskPoints = 0;

  // === NEW UNIFIED POINTS-BASED SCORING SYSTEM ===
  // Maximum possible points = 45
  
  // 1. AGE RISK (-6 to +6 points)
  const ageRisk = calculateAgeRisk(metrics.age);
  totalRiskPoints += ageRisk.points;
  reasons.push(ageRisk.reason);
  
  // 2. DIABETES (+12 points - major risk factor)
  if (metrics.diabetes === true) {
    totalRiskPoints += 12;
    reasons.push(`⚠️ CRITICAL: Diabetes present (+12 points)`);
  }
  
  // 3. SMOKING (+10 points - major modifiable risk factor)
  if (metrics.smoker === true) {
    totalRiskPoints += 10;
    reasons.push(`⚠️ CRITICAL: Current smoker (+10 points)`);
  }
  
  // 4. LDL CHOLESTEROL (0-8 points)
  const ldlRisk = calculateLDLRisk(metrics.ldl);
  totalRiskPoints += ldlRisk.points;
  reasons.push(ldlRisk.reason);
  
  // 5. HDL CHOLESTEROL (-2 to +4 points)
  const hdlRisk = calculateHDLRisk(metrics.hdl, metrics.sex);
  totalRiskPoints += hdlRisk.points;
  reasons.push(hdlRisk.reason);
  
  // 6. OBESITY RISK (BMI + waist + interactions)
  const obesityRisk = calculateObesityRisk(metrics);
  totalRiskPoints += obesityRisk.points;
  reasons.push(...obesityRisk.reasons);
  
  // 7. EJECTION FRACTION (0-8 points for cardiac function)
  const ef = metrics.ejectionFraction || metrics.lvef;
  if (ef !== undefined) {
    if (ef < 35) {
      totalRiskPoints += 8;
      reasons.push(`⚠️ CRITICAL: Ejection Fraction ${ef}% (Severely reduced, +8 points)`);
    } else if (ef < 45) {
      totalRiskPoints += 5;
      reasons.push(`⚠️ Ejection Fraction ${ef}% (Moderately reduced, +5 points)`);
    } else if (ef < 50) {
      totalRiskPoints += 3;
      reasons.push(`⚠️ Ejection Fraction ${ef}% (Mildly reduced, +3 points)`);
    } else if (ef < 55) {
      totalRiskPoints += 1;
      reasons.push(`ℹ️ Ejection Fraction ${ef}% (Slightly below normal, +1 point)`);
    } else {
      reasons.push(`✓ Ejection Fraction ${ef}% (Normal, 0 points)`);
    }
  }

  
  // 8. BLOOD PRESSURE (0-6 points)
  if (metrics.systolic !== undefined && metrics.diastolic !== undefined) {
    const sys = metrics.systolic;
    const dia = metrics.diastolic;
    
    if (sys >= 180 || dia >= 110) {
      totalRiskPoints += 6;
      reasons.push(`⚠️ CRITICAL: Blood Pressure ${sys}/${dia} mmHg (Hypertensive crisis, +6 points)`);
    } else if (sys >= 140 || dia >= 90) {
      totalRiskPoints += 4;
      reasons.push(`⚠️ Blood Pressure ${sys}/${dia} mmHg (Stage 2 hypertension, +4 points)`);
    } else if (sys >= 130 || dia >= 80) {
      totalRiskPoints += 2;
      reasons.push(`⚠️ Blood Pressure ${sys}/${dia} mmHg (Stage 1 hypertension, +2 points)`);
    } else if (sys >= 120) {
      totalRiskPoints += 1;
      reasons.push(`ℹ️ Blood Pressure ${sys}/${dia} mmHg (Elevated, +1 point)`);
    } else {
      reasons.push(`✓ Blood Pressure ${sys}/${dia} mmHg (Normal, 0 points)`);
    }
  }

  // 9. FAMILY HISTORY (+3 points)
  if (metrics.familyHistory === true) {
    totalRiskPoints += 3;
    reasons.push(`⚠️ Family history of heart disease (+3 points)`);
  }
  
  // 10. FASTING BLOOD SUGAR / PREDIABETES (0-4 points if not diabetic)
  if (metrics.diabetes !== true && metrics.fastingBloodSugar !== undefined) {
    const fbs = metrics.fastingBloodSugar;
    if (fbs >= 126) {
      totalRiskPoints += 4;
      reasons.push(`⚠️ Fasting Blood Sugar ${fbs} mg/dL (Diabetes range, +4 points)`);
    } else if (fbs >= 100) {
      totalRiskPoints += 2;
      reasons.push(`⚠️ Fasting Blood Sugar ${fbs} mg/dL (Prediabetes, +2 points)`);
    } else {
      reasons.push(`✓ Fasting Blood Sugar ${fbs} mg/dL (Normal, 0 points)`);
    }
  }
  
  // 11. PULMONARY HYPERTENSION - PASP (0-4 points)
  if (metrics.pasp !== undefined) {
    if (metrics.pasp >= 60) {
      totalRiskPoints += 4;
      reasons.push(`⚠️ CRITICAL: PASP ${metrics.pasp} mmHg (Severe pulmonary hypertension, +4 points)`);
    } else if (metrics.pasp >= 50) {
      totalRiskPoints += 3;
      reasons.push(`⚠️ PASP ${metrics.pasp} mmHg (Moderate elevation, +3 points)`);
    } else if (metrics.pasp >= 40) {
      totalRiskPoints += 1;
      reasons.push(`ℹ️ PASP ${metrics.pasp} mmHg (Mildly elevated, +1 point)`);
    } else {
      reasons.push(`✓ PASP ${metrics.pasp} mmHg (Normal, 0 points)`);
    }
  }
  
  // === EXPLAINABLE AI MESSAGES ===
  // Add critical warning for high-risk combinations
  const hasDiabetes = metrics.diabetes === true;
  const isSmoker = metrics.smoker === true;
  const hasElevatedLDL = metrics.ldl !== undefined && metrics.ldl > 130;

  if (hasDiabetes && isSmoker) {
    reasons.unshift(`🔴 CRITICAL: Diabetes + Smoking combination significantly increases cardiovascular risk. These are major independent risk factors for heart disease, stroke, and cardiac events.`);
  }
  
  if (hasDiabetes && isSmoker && hasElevatedLDL) {
    reasons.push(`⚠️ TRIPLE THREAT: Diabetes + Smoking + Elevated LDL creates very high cardiovascular risk profile.`);
  }
  
  // === COMPUTE FINAL NORMALIZED RISK ===
  const finalRisk = computeFinalRisk(totalRiskPoints, metrics);
  reasons.push(...finalRisk.reasons);
  
  // Add summary message
  reasons.push(`\n📊 TOTAL RISK POINTS: ${totalRiskPoints} / 45`);
  reasons.push(`📈 NORMALIZED RISK: ${finalRisk.normalizedRisk}%`);
  
  // Return result with normalized percentage
  return {
    score: finalRisk.normalizedRisk,
    reasons,
    rawScore: totalRiskPoints
  };
}
