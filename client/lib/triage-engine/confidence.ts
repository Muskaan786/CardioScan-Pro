/**
 * Confidence Estimation Module
 * 
 * Estimates confidence in the analysis based on:
 * 1. Data completeness - how many critical parameters are available
 * 2. Data quality - presence of key cardiac markers
 * 3. Critical value detection - if severe findings are present, confidence is higher
 * 
 * Formula:
 * confidence = (0.6 × dataCompleteness) + (0.3 × keyMarkerPresence) + (0.1 × criticalityBonus)
 * 
 * Where:
 * - dataCompleteness: fraction of important parameters present (0-1)
 * - keyMarkerPresence: fraction of critical cardiac markers available (0-1)
 * - criticalityBonus: boost if critical values detected (0-1)
 */

import { HeartMetrics } from './types';
import { thresholds } from './triageRules';

/**
 * Estimate confidence in the analysis
 * 
 * @param metrics - Extracted cardiac metrics
 * @param score - Computed risk score
 * @returns Confidence value between 0 and 1
 */
export function estimateConfidence(metrics: HeartMetrics, score: number): number {
  // 1. DATA COMPLETENESS ASSESSMENT
  // Check how many of the important parameters are present
  const importantParameters = [
    'age',
    'sex',
    'systolic',
    'diastolic',
    'cholesterol',
    'ldl',
    'hdl',
    'fastingBloodSugar',
    'bmi',
    'smoker',
    'diabetes',
    'familyHistory',
    'heartRate'
  ];

  const presentParameters = importantParameters.filter(
    param => metrics[param as keyof HeartMetrics] !== undefined
  );

  const dataCompleteness = presentParameters.length / importantParameters.length;

  // 2. KEY CARDIAC MARKER PRESENCE
  // Critical markers that provide most diagnostic value
  const keyMarkers = [
    'ejectionFraction',
    'lvef',
    'systolic',
    'diastolic',
    'ldl',
    'cholesterol'
  ];

  const presentKeyMarkers = keyMarkers.filter(
    marker => metrics[marker as keyof HeartMetrics] !== undefined
  );

  // Special consideration: either EF or LVEF counts (they're the same)
  const hasEF = metrics.ejectionFraction !== undefined || metrics.lvef !== undefined;
  const hasBP = metrics.systolic !== undefined && metrics.diastolic !== undefined;
  const hasLipids = metrics.ldl !== undefined || metrics.cholesterol !== undefined;

  let keyMarkerScore = 0;
  if (hasEF) keyMarkerScore += 0.4;  // EF is most important
  if (hasBP) keyMarkerScore += 0.35; // BP is very important
  if (hasLipids) keyMarkerScore += 0.25; // Lipids important for long-term risk

  // 3. CRITICALITY BONUS
  // If we detect critical values, we're more confident in flagging high risk
  let criticalityBonus = 0;

  // Check for critical ejection fraction
  const ef = metrics.ejectionFraction || metrics.lvef;
  if (ef !== undefined && ef < thresholds.ef.severe) {
    criticalityBonus += 0.4; // Very confident when EF is critically low
  }

  // Check for hypertensive crisis
  if (
    (metrics.systolic !== undefined && metrics.systolic >= thresholds.bp.crisisSystolic) ||
    (metrics.diastolic !== undefined && metrics.diastolic >= thresholds.bp.crisisDiastolic)
  ) {
    criticalityBonus += 0.3; // Confident in hypertensive crisis detection
  }

  // Check for severe pulmonary hypertension
  if (metrics.pasp !== undefined && metrics.pasp >= thresholds.pasp.severe) {
    criticalityBonus += 0.3; // Confident in severe PASP
  }

  // Cap criticality bonus at 1.0
  criticalityBonus = Math.min(criticalityBonus, 1.0);

  // 4. SCORE-BASED ADJUSTMENT
  // If score is very high or very low with good data, we're more confident
  let scoreBasedAdjustment = 0;
  if (dataCompleteness > 0.6) {
    if (score >= 12) {
      // High score with good data = high confidence
      scoreBasedAdjustment = 0.1;
    } else if (score <= 2) {
      // Low score with good data = high confidence in low risk
      scoreBasedAdjustment = 0.1;
    }
  }

  // 5. CALCULATE FINAL CONFIDENCE
  // Formula that directly matches the breakdown display for transparency
  // Uses the exact weights shown to customers (Data: 40%, Markers: 40%, Context: 20%)
  
  // Calculate clinical context score based on risk level and critical findings
  let clinicalContextScore = 0.35; // Base context
  if (score > 10) {
    clinicalContextScore = 0.85; // High risk detected
  } else if (score > 6) {
    clinicalContextScore = 0.65; // Moderate risk
  } else if (score > 3) {
    clinicalContextScore = 0.5;  // Low-moderate risk
  }
  
  // Add boost for critical findings
  if ((metrics.ejectionFraction && metrics.ejectionFraction < 40) ||
      (metrics.systolic && metrics.systolic > 160) ||
      (metrics.pasp && metrics.pasp > 40)) {
    clinicalContextScore = Math.min(1.0, clinicalContextScore + 0.15);
  }
  
  // Add criticality bonus to context
  clinicalContextScore = Math.min(1.0, clinicalContextScore + (criticalityBonus * 0.5) + scoreBasedAdjustment);
  
  // Calculate confidence using exact breakdown weights (40% + 40% + 20%)
  let confidence = 
    (0.4 * dataCompleteness) +      // 40% weight on data completeness
    (0.4 * keyMarkerScore) +        // 40% weight on key markers  
    (0.2 * clinicalContextScore);   // 20% weight on clinical context

  // 6. APPLY MINIMAL PENALTIES FOR MISSING CRITICAL CARDIAC MARKERS
  // Only apply penalty if missing BOTH EF and BP (the most critical markers)
  // This keeps confidence transparent while reflecting data limitations
  if (!hasEF && !hasBP) {
    // Missing both most critical cardiac markers - moderate penalty
    confidence *= 0.85; // Reduced from 0.70 - less harsh
  } else if (!hasEF) {
    // Missing EF only - very light penalty
    confidence *= 0.95; // Reduced from 0.85
  } else if (!hasBP) {
    // Missing BP only - minimal penalty
    confidence *= 0.98; // Reduced from 0.95
  }

  // If patient demographics are completely missing
  if (!metrics.age && !metrics.sex) {
    confidence *= 0.9;
  }

  // 7. MINIMUM CONFIDENCE THRESHOLD
  // Even with perfect data, maintain some uncertainty (this is automated analysis)
  // Maximum confidence should be ~0.85-0.90 to reflect limitations
  if (confidence > 0.9) {
    confidence = 0.9;
  }

  // Minimum confidence should be at least 0.15 if we have ANY data
  if (confidence < 0.15 && presentParameters.length > 0) {
    confidence = 0.15;
  }

  // If we have essentially no data, confidence should be very low
  if (presentParameters.length === 0) {
    confidence = 0.05;
  }

  // Round to 2 decimal places
  return Math.round(confidence * 100) / 100;
}

/**
 * Get a human-readable confidence description
 * 
 * @param confidence - Confidence value (0-1)
 * @returns Text description of confidence level
 */
export function getConfidenceDescription(confidence: number): string {
  if (confidence >= 0.75) {
    return 'High Confidence - Analysis based on comprehensive data including critical cardiac markers';
  } else if (confidence >= 0.50) {
    return 'Moderate Confidence - Analysis based on good data but some key parameters missing';
  } else if (confidence >= 0.30) {
    return 'Fair Confidence - Limited data available; consider additional testing';
  } else {
    return 'Low Confidence - Insufficient data for reliable analysis; recommend comprehensive cardiac evaluation';
  }
}

/**
 * Get suggestions for improving confidence
 * 
 * @param metrics - Current metrics
 * @returns Array of suggestions for additional data needed
 */
export function getConfidenceImprovementSuggestions(metrics: HeartMetrics): string[] {
  const suggestions: string[] = [];

  // Check for missing critical markers
  const ef = metrics.ejectionFraction || metrics.lvef;
  if (ef === undefined) {
    suggestions.push('Echocardiogram to assess ejection fraction (most important cardiac function marker)');
  }

  if (metrics.systolic === undefined || metrics.diastolic === undefined) {
    suggestions.push('Blood pressure measurement (critical vital sign)');
  }

  if (metrics.ldl === undefined && metrics.cholesterol === undefined) {
    suggestions.push('Lipid panel (cholesterol, LDL, HDL) to assess cardiovascular risk');
  }

  if (metrics.fastingBloodSugar === undefined && !metrics.diabetes) {
    suggestions.push('Fasting blood glucose test to screen for diabetes');
  }

  if (metrics.age === undefined) {
    suggestions.push('Patient age (important risk factor)');
  }

  if (metrics.bmi === undefined) {
    suggestions.push('Height and weight to calculate BMI (obesity indicator)');
  }

  if (metrics.smoker === undefined) {
    suggestions.push('Smoking status (major modifiable risk factor)');
  }

  if (metrics.familyHistory === undefined) {
    suggestions.push('Family history of heart disease (genetic risk factor)');
  }

  return suggestions;
}
