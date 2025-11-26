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
 * Main risk scoring function
 * 
 * @param metrics - Extracted cardiac metrics
 * @returns Object containing score, reasons, and rawScore
 */
export function scoreRisk(metrics: HeartMetrics): ScoringResult {
  const reasons: string[] = [];
  let rawScore = 0;

  // 1. EJECTION FRACTION (Critical cardiac function indicator)
  // Lower EF = higher risk. Normal is ≥55%, severe dysfunction <35%
  const ef = metrics.ejectionFraction || metrics.lvef;
  if (ef !== undefined) {
    if (ef < thresholds.ef.severe) {
      // Severe dysfunction: <35%
      const factor = 1.0; // Maximum risk
      const contribution = weights.ef * factor;
      rawScore += contribution;
      reasons.push(`⚠️ CRITICAL: Ejection Fraction = ${ef}% (Severely reduced, <${thresholds.ef.severe}%) → +${contribution.toFixed(1)} risk`);
    } else if (ef < thresholds.ef.moderate) {
      // Moderate dysfunction: 35-45%
      const factor = 0.75;
      const contribution = weights.ef * factor;
      rawScore += contribution;
      reasons.push(`⚠️ Ejection Fraction = ${ef}% (Moderately reduced, ${thresholds.ef.severe}-${thresholds.ef.moderate}%) → +${contribution.toFixed(1)} risk`);
    } else if (ef < thresholds.ef.mildlyReduced) {
      // Mildly reduced: 45-50%
      const factor = 0.5;
      const contribution = weights.ef * factor;
      rawScore += contribution;
      reasons.push(`⚠️ Ejection Fraction = ${ef}% (Mildly reduced, ${thresholds.ef.moderate}-${thresholds.ef.mildlyReduced}%) → +${contribution.toFixed(1)} risk`);
    } else if (ef < thresholds.ef.normal) {
      // Below normal but not concerning: 50-55%
      const factor = 0.2;
      const contribution = weights.ef * factor;
      rawScore += contribution;
      reasons.push(`ℹ️ Ejection Fraction = ${ef}% (Slightly below normal, ${thresholds.ef.mildlyReduced}-${thresholds.ef.normal}%) → +${contribution.toFixed(1)} risk`);
    } else {
      // Normal: ≥55%
      reasons.push(`✓ Ejection Fraction = ${ef}% (Normal, ≥${thresholds.ef.normal}%)`);
    }
  }

  // 2. BLOOD PRESSURE (Major cardiovascular risk factor)
  // Formula: Use worst case between systolic and diastolic categories
  if (metrics.systolic !== undefined || metrics.diastolic !== undefined) {
    const sys = metrics.systolic || 0;
    const dia = metrics.diastolic || 0;
    
    if (sys >= thresholds.bp.crisisSystolic || dia >= thresholds.bp.crisisDiastolic) {
      // Hypertensive crisis: ≥180/110
      const factor = 1.0;
      const contribution = weights.bloodPressure * factor;
      rawScore += contribution;
      reasons.push(`⚠️ CRITICAL: Blood Pressure = ${sys}/${dia} mmHg (Hypertensive crisis, ≥${thresholds.bp.crisisSystolic}/${thresholds.bp.crisisDiastolic}) → +${contribution.toFixed(1)} risk`);
    } else if (sys >= thresholds.bp.stage2Systolic || dia >= thresholds.bp.stage2Diastolic) {
      // Stage 2 hypertension: ≥140/90
      const factor = 0.75;
      const contribution = weights.bloodPressure * factor;
      rawScore += contribution;
      reasons.push(`⚠️ Blood Pressure = ${sys}/${dia} mmHg (Stage 2 hypertension, ≥${thresholds.bp.stage2Systolic}/${thresholds.bp.stage2Diastolic}) → +${contribution.toFixed(1)} risk`);
    } else if (sys >= thresholds.bp.stage1Systolic || dia >= thresholds.bp.stage1Diastolic) {
      // Stage 1 hypertension: 130-139/80-89
      const factor = 0.5;
      const contribution = weights.bloodPressure * factor;
      rawScore += contribution;
      reasons.push(`⚠️ Blood Pressure = ${sys}/${dia} mmHg (Stage 1 hypertension, ${thresholds.bp.stage1Systolic}-${thresholds.bp.stage2Systolic-1}/${thresholds.bp.stage1Diastolic}-${thresholds.bp.stage2Diastolic-1}) → +${contribution.toFixed(1)} risk`);
    } else if (sys >= thresholds.bp.elevatedSystolic) {
      // Elevated: 120-129/<80
      const factor = 0.25;
      const contribution = weights.bloodPressure * factor;
      rawScore += contribution;
      reasons.push(`ℹ️ Blood Pressure = ${sys}/${dia} mmHg (Elevated, ${thresholds.bp.elevatedSystolic}-${thresholds.bp.stage1Systolic-1}/<${thresholds.bp.stage1Diastolic}) → +${contribution.toFixed(1)} risk`);
    } else if (sys > 0 && dia > 0) {
      // Normal: <120/80
      reasons.push(`✓ Blood Pressure = ${sys}/${dia} mmHg (Normal, <${thresholds.bp.elevatedSystolic}/${thresholds.bp.stage1Diastolic})`);
    }
  }

  // 3. PULMONARY ARTERY SYSTOLIC PRESSURE (Right heart function)
  // Elevated PASP indicates pulmonary hypertension and right heart strain
  if (metrics.pasp !== undefined) {
    if (metrics.pasp >= thresholds.pasp.severe) {
      // Severe: ≥60 mmHg
      const factor = 1.0;
      const contribution = weights.pasp * factor;
      rawScore += contribution;
      reasons.push(`⚠️ CRITICAL: PASP = ${metrics.pasp} mmHg (Severe pulmonary hypertension, ≥${thresholds.pasp.severe}) → +${contribution.toFixed(1)} risk`);
    } else if (metrics.pasp >= thresholds.pasp.moderate) {
      // Moderate: 50-59 mmHg
      const factor = 0.75;
      const contribution = weights.pasp * factor;
      rawScore += contribution;
      reasons.push(`⚠️ PASP = ${metrics.pasp} mmHg (Moderately elevated, ${thresholds.pasp.moderate}-${thresholds.pasp.severe-1}) → +${contribution.toFixed(1)} risk`);
    } else if (metrics.pasp >= thresholds.pasp.elevated) {
      // Mildly elevated: 40-49 mmHg
      const factor = 0.5;
      const contribution = weights.pasp * factor;
      rawScore += contribution;
      reasons.push(`⚠️ PASP = ${metrics.pasp} mmHg (Mildly elevated, ${thresholds.pasp.elevated}-${thresholds.pasp.moderate-1}) → +${contribution.toFixed(1)} risk`);
    } else {
      // Normal: <40 mmHg
      reasons.push(`✓ PASP = ${metrics.pasp} mmHg (Normal, <${thresholds.pasp.elevated})`);
    }
  }

  // 4. TRICUSPID REGURGITATION VELOCITY (Indirect measure of PASP)
  if (metrics.trVelocity !== undefined) {
    if (metrics.trVelocity >= thresholds.trVelocity.high) {
      // High: >3.4 m/s
      const factor = 1.0;
      const contribution = weights.trVelocity * factor;
      rawScore += contribution;
      reasons.push(`⚠️ TR Velocity = ${metrics.trVelocity} m/s (High, suggests elevated pulmonary pressure, >${thresholds.trVelocity.high}) → +${contribution.toFixed(1)} risk`);
    } else if (metrics.trVelocity >= thresholds.trVelocity.intermediate) {
      // Intermediate: 2.8-3.4 m/s
      const factor = 0.6;
      const contribution = weights.trVelocity * factor;
      rawScore += contribution;
      reasons.push(`⚠️ TR Velocity = ${metrics.trVelocity} m/s (Intermediate, ${thresholds.trVelocity.intermediate}-${thresholds.trVelocity.high}) → +${contribution.toFixed(1)} risk`);
    } else {
      // Normal: <2.8 m/s
      reasons.push(`✓ TR Velocity = ${metrics.trVelocity} m/s (Normal, <${thresholds.trVelocity.intermediate})`);
    }
  }

  // 5. LDL CHOLESTEROL (Primary lipid target for cardiovascular risk)
  if (metrics.ldl !== undefined) {
    if (metrics.ldl >= thresholds.ldl.veryHigh) {
      // Very high: ≥190 mg/dL
      const factor = 1.0;
      const contribution = weights.ldl * factor;
      rawScore += contribution;
      reasons.push(`⚠️ LDL Cholesterol = ${metrics.ldl} mg/dL (Very high, ≥${thresholds.ldl.veryHigh}) → +${contribution.toFixed(1)} risk`);
    } else if (metrics.ldl >= thresholds.ldl.high) {
      // High: 160-189 mg/dL
      const factor = 0.75;
      const contribution = weights.ldl * factor;
      rawScore += contribution;
      reasons.push(`⚠️ LDL Cholesterol = ${metrics.ldl} mg/dL (High, ${thresholds.ldl.high}-${thresholds.ldl.veryHigh-1}) → +${contribution.toFixed(1)} risk`);
    } else if (metrics.ldl >= thresholds.ldl.borderlineHigh) {
      // Borderline high: 130-159 mg/dL
      const factor = 0.5;
      const contribution = weights.ldl * factor;
      rawScore += contribution;
      reasons.push(`⚠️ LDL Cholesterol = ${metrics.ldl} mg/dL (Borderline high, ${thresholds.ldl.borderlineHigh}-${thresholds.ldl.high-1}) → +${contribution.toFixed(1)} risk`);
    } else if (metrics.ldl >= thresholds.ldl.optimal) {
      // Near optimal: 100-129 mg/dL
      const factor = 0.2;
      const contribution = weights.ldl * factor;
      rawScore += contribution;
      reasons.push(`ℹ️ LDL Cholesterol = ${metrics.ldl} mg/dL (Near optimal, ${thresholds.ldl.optimal}-${thresholds.ldl.borderlineHigh-1}) → +${contribution.toFixed(1)} risk`);
    } else {
      // Optimal: <100 mg/dL
      reasons.push(`✓ LDL Cholesterol = ${metrics.ldl} mg/dL (Optimal, <${thresholds.ldl.optimal})`);
    }
  }

  // 6. HDL CHOLESTEROL (Protective factor when high, risk when low)
  if (metrics.hdl !== undefined) {
    const lowThreshold = thresholds.hdl.low;
    const optimalThreshold = thresholds.hdl.optimal;
    
    if (metrics.hdl < lowThreshold) {
      // Low HDL is a risk factor
      const factor = 0.8;
      const contribution = weights.hdl * factor;
      rawScore += contribution;
      reasons.push(`⚠️ HDL Cholesterol = ${metrics.hdl} mg/dL (Low, <${lowThreshold}) → +${contribution.toFixed(1)} risk`);
    } else if (metrics.hdl >= optimalThreshold) {
      // High HDL is protective (negative contribution)
      reasons.push(`✓ HDL Cholesterol = ${metrics.hdl} mg/dL (Optimal, protective, ≥${optimalThreshold})`);
    } else {
      // Acceptable range
      reasons.push(`ℹ️ HDL Cholesterol = ${metrics.hdl} mg/dL (Acceptable, ${lowThreshold}-${optimalThreshold-1})`);
    }
  }

  // 7. TOTAL CHOLESTEROL
  if (metrics.cholesterol !== undefined && metrics.ldl === undefined) {
    // Only score if LDL is not available (avoid double-counting)
    if (metrics.cholesterol >= thresholds.cholesterol.high) {
      // High: ≥240 mg/dL
      const factor = 0.8;
      const contribution = weights.cholesterol * factor;
      rawScore += contribution;
      reasons.push(`⚠️ Total Cholesterol = ${metrics.cholesterol} mg/dL (High, ≥${thresholds.cholesterol.high}) → +${contribution.toFixed(1)} risk`);
    } else if (metrics.cholesterol >= thresholds.cholesterol.borderlineHigh) {
      // Borderline high: 200-239 mg/dL
      const factor = 0.5;
      const contribution = weights.cholesterol * factor;
      rawScore += contribution;
      reasons.push(`⚠️ Total Cholesterol = ${metrics.cholesterol} mg/dL (Borderline high, ${thresholds.cholesterol.borderlineHigh}-${thresholds.cholesterol.high-1}) → +${contribution.toFixed(1)} risk`);
    } else {
      // Desirable: <200 mg/dL
      reasons.push(`✓ Total Cholesterol = ${metrics.cholesterol} mg/dL (Desirable, <${thresholds.cholesterol.borderlineHigh})`);
    }
  }

  // 8. FASTING BLOOD SUGAR (Diabetes indicator)
  if (metrics.fastingBloodSugar !== undefined) {
    if (metrics.fastingBloodSugar >= thresholds.fbs.diabetes) {
      // Diabetes range: ≥126 mg/dL
      const factor = 1.0;
      const contribution = weights.fbs * factor;
      rawScore += contribution;
      reasons.push(`⚠️ Fasting Blood Sugar = ${metrics.fastingBloodSugar} mg/dL (Diabetes range, ≥${thresholds.fbs.diabetes}) → +${contribution.toFixed(1)} risk`);
    } else if (metrics.fastingBloodSugar >= thresholds.fbs.prediabetes) {
      // Prediabetes: 100-125 mg/dL
      const factor = 0.6;
      const contribution = weights.fbs * factor;
      rawScore += contribution;
      reasons.push(`⚠️ Fasting Blood Sugar = ${metrics.fastingBloodSugar} mg/dL (Prediabetes, ${thresholds.fbs.prediabetes}-${thresholds.fbs.diabetes-1}) → +${contribution.toFixed(1)} risk`);
    } else {
      // Normal: <100 mg/dL
      reasons.push(`✓ Fasting Blood Sugar = ${metrics.fastingBloodSugar} mg/dL (Normal, <${thresholds.fbs.prediabetes})`);
    }
  }

  // 9. BMI (Body Mass Index - obesity indicator)
  if (metrics.bmi !== undefined) {
    if (metrics.bmi >= thresholds.bmi.obeseClass2) {
      // Class 2 obesity: ≥35
      const factor = 1.0;
      const contribution = weights.bmi * factor;
      rawScore += contribution;
      reasons.push(`⚠️ BMI = ${metrics.bmi.toFixed(1)} (Class 2 obesity, ≥${thresholds.bmi.obeseClass2}) → +${contribution.toFixed(1)} risk`);
    } else if (metrics.bmi >= thresholds.bmi.obeseClass1) {
      // Class 1 obesity: 30-34.9
      const factor = 0.75;
      const contribution = weights.bmi * factor;
      rawScore += contribution;
      reasons.push(`⚠️ BMI = ${metrics.bmi.toFixed(1)} (Obese, ${thresholds.bmi.obeseClass1}-${thresholds.bmi.obeseClass2-0.1}) → +${contribution.toFixed(1)} risk`);
    } else if (metrics.bmi >= thresholds.bmi.overweight) {
      // Overweight: 25-29.9
      const factor = 0.5;
      const contribution = weights.bmi * factor;
      rawScore += contribution;
      reasons.push(`⚠️ BMI = ${metrics.bmi.toFixed(1)} (Overweight, ${thresholds.bmi.overweight}-${thresholds.bmi.obeseClass1-0.1}) → +${contribution.toFixed(1)} risk`);
    } else if (metrics.bmi >= thresholds.bmi.normal) {
      // Normal: 18.5-24.9
      reasons.push(`✓ BMI = ${metrics.bmi.toFixed(1)} (Normal, ${thresholds.bmi.normal}-${thresholds.bmi.overweight-0.1})`);
    } else {
      // Underweight: <18.5
      reasons.push(`ℹ️ BMI = ${metrics.bmi.toFixed(1)} (Underweight, <${thresholds.bmi.normal})`);
    }
  }

  // 10. AGE (Non-modifiable risk factor)
  if (metrics.age !== undefined) {
    if (metrics.age >= thresholds.age.veryHigh) {
      // Very high risk: ≥75
      const factor = 1.0;
      const contribution = weights.age * factor;
      rawScore += contribution;
      reasons.push(`ℹ️ Age = ${metrics.age} years (Very high age-related risk, ≥${thresholds.age.veryHigh}) → +${contribution.toFixed(1)} risk`);
    } else if (metrics.age >= thresholds.age.high) {
      // High risk: 65-74
      const factor = 0.8;
      const contribution = weights.age * factor;
      rawScore += contribution;
      reasons.push(`ℹ️ Age = ${metrics.age} years (High age-related risk, ${thresholds.age.high}-${thresholds.age.veryHigh-1}) → +${contribution.toFixed(1)} risk`);
    } else if (metrics.age >= thresholds.age.moderate) {
      // Moderate risk: 55-64
      const factor = 0.6;
      const contribution = weights.age * factor;
      rawScore += contribution;
      reasons.push(`ℹ️ Age = ${metrics.age} years (Moderate age-related risk, ${thresholds.age.moderate}-${thresholds.age.high-1}) → +${contribution.toFixed(1)} risk`);
    } else if (metrics.age >= thresholds.age.elevated) {
      // Elevated risk: 45-54
      const factor = 0.3;
      const contribution = weights.age * factor;
      rawScore += contribution;
      reasons.push(`ℹ️ Age = ${metrics.age} years (Elevated age-related risk, ${thresholds.age.elevated}-${thresholds.age.moderate-1}) → +${contribution.toFixed(1)} risk`);
    } else {
      // Lower risk: <45
      reasons.push(`✓ Age = ${metrics.age} years (Lower age-related risk, <${thresholds.age.elevated})`);
    }
  }

  // 11. DIABETES (Major risk factor)
  if (metrics.diabetes === true) {
    const contribution = weights.diabetes;
    rawScore += contribution;
    reasons.push(`⚠️ Diabetes present → +${contribution.toFixed(1)} risk`);
  }

  // 12. SMOKING STATUS (Major modifiable risk factor)
  if (metrics.smoker === true) {
    const contribution = weights.smoker;
    rawScore += contribution;
    reasons.push(`⚠️ Current smoker → +${contribution.toFixed(1)} risk`);
  }

  // 13. FAMILY HISTORY (Genetic predisposition)
  if (metrics.familyHistory === true) {
    const contribution = weights.familyHistory;
    rawScore += contribution;
    reasons.push(`⚠️ Family history of heart disease → +${contribution.toFixed(1)} risk`);
  }

  // 14. HEART RATE (Elevated HR associated with worse outcomes)
  if (metrics.heartRate !== undefined) {
    if (metrics.heartRate >= thresholds.heartRate.tachycardia) {
      // Tachycardia: >100 bpm
      const factor = 0.8;
      const contribution = weights.heartRate * factor;
      rawScore += contribution;
      reasons.push(`⚠️ Heart Rate = ${metrics.heartRate} bpm (Tachycardia, >${thresholds.heartRate.tachycardia}) → +${contribution.toFixed(1)} risk`);
    } else if (metrics.heartRate >= thresholds.heartRate.normalHigh) {
      // Normal high: 80-100 bpm
      const factor = 0.3;
      const contribution = weights.heartRate * factor;
      rawScore += contribution;
      reasons.push(`ℹ️ Heart Rate = ${metrics.heartRate} bpm (Upper normal, ${thresholds.heartRate.normalHigh}-${thresholds.heartRate.tachycardia}) → +${contribution.toFixed(1)} risk`);
    } else if (metrics.heartRate >= thresholds.heartRate.optimal) {
      // Optimal: 60-80 bpm
      reasons.push(`✓ Heart Rate = ${metrics.heartRate} bpm (Optimal, ${thresholds.heartRate.optimal}-${thresholds.heartRate.normalHigh-1})`);
    } else if (metrics.heartRate < thresholds.heartRate.bradycardia && metrics.heartRate > 40) {
      // Bradycardia (may be normal for athletes): <60 bpm
      reasons.push(`ℹ️ Heart Rate = ${metrics.heartRate} bpm (Bradycardia, may be normal for athletes, <${thresholds.heartRate.bradycardia})`);
    } else if (metrics.heartRate <= 40) {
      // Severe bradycardia
      const factor = 0.5;
      const contribution = weights.heartRate * factor;
      rawScore += contribution;
      reasons.push(`⚠️ Heart Rate = ${metrics.heartRate} bpm (Severe bradycardia, ≤40) → +${contribution.toFixed(1)} risk`);
    }
  }

  // 15. SEX (Male sex increases risk, particularly with age)
  // Only count if age is also present for age-sex interaction
  if (metrics.sex === 'male' && metrics.age && metrics.age >= 45) {
    const factor = 0.5;
    const contribution = weights.sex * factor;
    rawScore += contribution;
    reasons.push(`ℹ️ Male sex with age ≥45 → +${contribution.toFixed(1)} risk`);
  }

  // Round final score to 1 decimal place
  const finalScore = Math.round(rawScore * 10) / 10;

  return {
    score: finalScore,
    reasons,
    rawScore: finalScore
  };
}
