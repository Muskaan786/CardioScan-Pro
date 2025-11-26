/**
 * Triage Recommendation Engine
 * 
 * Determines clinical urgency and provides specific guidance on when to seek care.
 * Rules are prioritized by severity - most critical conditions checked first.
 * 
 * Priority Order:
 * 1. Critical cardiac dysfunction (EF <35%, severe PASP)
 * 2. Hypertensive crisis (BP ≥180/110)
 * 3. Very high risk score (≥85%)
 * 4. High risk score (65-84%)
 * 5. Moderate risk (40-64%)
 * 6. Low risk (<40%)
 * 
 * Each rule provides:
 * - Time window for seeking care
 * - Justification
 * - Specific symptoms to watch for
 */

import { HeartMetrics, AnalysisMeta } from './types';
import { thresholds, triageLevels } from './triageRules';

/**
 * Generate triage recommendation based on metrics and analysis
 * 
 * @param metrics - Cardiac metrics
 * @param analysisMeta - Computed analysis metadata (score, category, etc.)
 * @returns Single triage recommendation string
 */
export function getTriageRecommendation(
  metrics: HeartMetrics,
  analysisMeta: AnalysisMeta
): string {
  // PRIORITY 1: CRITICAL EJECTION FRACTION
  // Severe systolic dysfunction indicates heart failure with high mortality risk
  const ef = metrics.ejectionFraction || metrics.lvef;
  if (ef !== undefined && ef < thresholds.ef.severe) {
    return `${triageLevels.immediate.label}: Severe cardiac dysfunction detected (EF = ${ef}%, normal ≥55%). ${triageLevels.immediate.timeWindow}. This indicates significant heart failure requiring immediate evaluation.`;
  }

  // PRIORITY 2: HYPERTENSIVE CRISIS
  // BP ≥180/110 is a medical emergency (risk of stroke, heart attack, organ damage)
  if (
    (metrics.systolic !== undefined && metrics.systolic >= thresholds.bp.crisisSystolic) ||
    (metrics.diastolic !== undefined && metrics.diastolic >= thresholds.bp.crisisDiastolic)
  ) {
    const bpString = `${metrics.systolic || '?'}/${metrics.diastolic || '?'}`;
    return `${triageLevels.immediate.label}: Hypertensive crisis detected (BP = ${bpString} mmHg). ${triageLevels.immediate.timeWindow}. This level of blood pressure requires immediate medical attention to prevent stroke, heart attack, or organ damage.`;
  }

  // PRIORITY 3: SEVERE PULMONARY HYPERTENSION
  // PASP ≥60 indicates severe pulmonary hypertension, high risk for right heart failure
  if (metrics.pasp !== undefined && metrics.pasp >= thresholds.pasp.severe) {
    return `${triageLevels.immediate.label}: Severe pulmonary hypertension detected (PASP = ${metrics.pasp} mmHg, normal <40). ${triageLevels.immediate.timeWindow}. This indicates significant strain on the right side of the heart.`;
  }

  // PRIORITY 4: VERY HIGH RISK SCORE (≥85%)
  // Multiple severe risk factors present
  if (analysisMeta.normalizedRiskPercent >= 85) {
    const criticalReasons = analysisMeta.reasons
      .filter(r => r.includes('⚠️ CRITICAL'))
      .slice(0, 2);
    
    let reasonText = '';
    if (criticalReasons.length > 0) {
      reasonText = ` Critical findings include: ${criticalReasons.map(r => r.split('→')[0]).join('; ')}.`;
    }
    
    return `${triageLevels.urgent.label}: Very high cardiovascular risk detected (${analysisMeta.normalizedRiskPercent}%). ${triageLevels.urgent.timeWindow}.${reasonText} Immediate cardiology consultation recommended.`;
  }

  // PRIORITY 5: HIGH RISK SCORE (65-84%)
  // Significant risk factors requiring prompt attention
  if (analysisMeta.normalizedRiskPercent >= 65) {
    return `${triageLevels.high.label}: High cardiovascular risk detected (${analysisMeta.normalizedRiskPercent}%). ${triageLevels.high.timeWindow}. Multiple significant risk factors present requiring medical evaluation and intervention.`;
  }

  // PRIORITY 6: MODERATE PULMONARY PRESSURE
  // Moderate PASP elevation (50-59 mmHg)
  if (metrics.pasp !== undefined && metrics.pasp >= thresholds.pasp.moderate) {
    return `${triageLevels.high.label}: Moderately elevated pulmonary pressure detected (PASP = ${metrics.pasp} mmHg). ${triageLevels.high.timeWindow}. Further evaluation recommended to assess pulmonary hypertension.`;
  }

  // PRIORITY 7: MODERATE EJECTION FRACTION
  // EF 35-45% indicates moderate systolic dysfunction
  if (ef !== undefined && ef < thresholds.ef.moderate) {
    return `${triageLevels.high.label}: Moderate cardiac dysfunction detected (EF = ${ef}%). ${triageLevels.high.timeWindow}. Evaluation by cardiologist recommended to assess heart function and optimize treatment.`;
  }

  // PRIORITY 8: STAGE 2 HYPERTENSION
  // BP ≥140/90
  if (
    (metrics.systolic !== undefined && metrics.systolic >= thresholds.bp.stage2Systolic) ||
    (metrics.diastolic !== undefined && metrics.diastolic >= thresholds.bp.stage2Diastolic)
  ) {
    const bpString = `${metrics.systolic || '?'}/${metrics.diastolic || '?'}`;
    return `${triageLevels.high.label}: Stage 2 hypertension detected (BP = ${bpString} mmHg). ${triageLevels.high.timeWindow}. Blood pressure control is essential to prevent cardiovascular complications.`;
  }

  // PRIORITY 9: MODERATE RISK SCORE (40-64%)
  // Multiple moderate risk factors or some significant findings
  if (analysisMeta.normalizedRiskPercent >= 40) {
    return `${triageLevels.moderate.label}: Moderate cardiovascular risk detected (${analysisMeta.normalizedRiskPercent}%). ${triageLevels.moderate.timeWindow}. Risk factor assessment and intervention plan recommended.`;
  }

  // PRIORITY 10: MILDLY REDUCED EJECTION FRACTION
  // EF 45-50%
  if (ef !== undefined && ef < thresholds.ef.mildlyReduced) {
    return `${triageLevels.moderate.label}: Mildly reduced ejection fraction (EF = ${ef}%). ${triageLevels.moderate.timeWindow}. Close monitoring recommended to prevent progression.`;
  }

  // PRIORITY 11: STAGE 1 HYPERTENSION
  // BP 130-139/80-89
  if (
    (metrics.systolic !== undefined && metrics.systolic >= thresholds.bp.stage1Systolic) ||
    (metrics.diastolic !== undefined && metrics.diastolic >= thresholds.bp.stage1Diastolic)
  ) {
    const bpString = `${metrics.systolic || '?'}/${metrics.diastolic || '?'}`;
    return `${triageLevels.moderate.label}: Stage 1 hypertension detected (BP = ${bpString} mmHg). ${triageLevels.moderate.timeWindow}. Lifestyle modifications and possible medication recommended.`;
  }

  // PRIORITY 12: VERY HIGH LDL OR DIABETES
  // Major risk factors requiring management
  if (
    (metrics.ldl !== undefined && metrics.ldl >= thresholds.ldl.veryHigh) ||
    (metrics.fastingBloodSugar !== undefined && metrics.fastingBloodSugar >= thresholds.fbs.diabetes)
  ) {
    return `${triageLevels.moderate.label}: Major cardiovascular risk factor detected. ${triageLevels.moderate.timeWindow}. Medical management recommended to reduce long-term cardiovascular risk.`;
  }

  // PRIORITY 13: LOW RISK SCORE (20-39%)
  // Some risk factors present but well-controlled
  if (analysisMeta.normalizedRiskPercent >= 20) {
    return `${triageLevels.routine.label}: Low cardiovascular risk detected (${analysisMeta.normalizedRiskPercent}%). ${triageLevels.routine.timeWindow}. Continue preventive care and lifestyle modifications.`;
  }

  // PRIORITY 14: MINIMAL/NO RISK FACTORS
  // Normal or near-normal findings
  if (analysisMeta.category === "Normal") {
    return `${triageLevels.monitoring.label}: Minimal cardiovascular risk detected (${analysisMeta.normalizedRiskPercent}%). ${triageLevels.monitoring.timeWindow}. Maintain healthy lifestyle habits.`;
  }

  // DEFAULT: ROUTINE FOLLOW-UP
  // Catch-all for any unclassified cases
  return `${triageLevels.routine.label}: ${triageLevels.routine.timeWindow}. Continue regular health monitoring and preventive care.`;
}

/**
 * Get warning signs to watch for based on findings
 * 
 * @param metrics - Cardiac metrics
 * @param category - Risk category
 * @returns Array of warning symptoms to monitor
 */
export function getWarningSigns(
  metrics: HeartMetrics,
  category: "High" | "Moderate" | "Low" | "Normal"
): string[] {
  const warnings: string[] = [];

  // Critical EF or heart failure signs
  const ef = metrics.ejectionFraction || metrics.lvef;
  if (ef !== undefined && ef < thresholds.ef.moderate) {
    warnings.push(
      "Seek immediate care if you experience: severe shortness of breath, chest pain, rapid or irregular heartbeat, swelling in legs/ankles, sudden weight gain"
    );
  }

  // Hypertension warnings
  if (
    metrics.systolic && metrics.systolic >= thresholds.bp.stage1Systolic ||
    metrics.diastolic && metrics.diastolic >= thresholds.bp.stage1Diastolic
  ) {
    warnings.push(
      "Monitor for: severe headache, vision changes, severe chest pain, difficulty breathing, confusion - these may indicate hypertensive emergency"
    );
  }

  // Pulmonary hypertension
  if (metrics.pasp && metrics.pasp >= thresholds.pasp.elevated) {
    warnings.push(
      "Watch for: increasing shortness of breath (especially with activity), chest pressure, lightheadedness, fainting, blue lips or skin"
    );
  }

  // High category general warnings
  if (category === "High" || category === "Moderate") {
    warnings.push(
      "General cardiac warning signs requiring immediate care: crushing chest pain, severe shortness of breath, loss of consciousness, sudden weakness on one side of body"
    );
  }

  // If no specific warnings, add general preventive advice
  if (warnings.length === 0) {
    warnings.push(
      "Maintain awareness of cardiovascular symptoms: chest discomfort, unusual fatigue, shortness of breath with normal activities. Seek medical evaluation if symptoms develop."
    );
  }

  return warnings;
}

/**
 * Get next steps checklist based on triage level
 * 
 * @param triageText - Triage recommendation text
 * @returns Ordered list of action items
 */
export function getNextStepsChecklist(triageText: string): string[] {
  if (triageText.includes('IMMEDIATE')) {
    return [
      "1. Call 911 or go to nearest emergency department immediately",
      "2. Do not drive yourself - call emergency services or have someone drive you",
      "3. Bring all current medications and medical records if possible",
      "4. Inform emergency staff of your cardiac risk factors",
      "5. Have someone contact your primary care doctor or cardiologist"
    ];
  }

  if (triageText.includes('URGENT')) {
    return [
      "1. Contact your healthcare provider or cardiologist today",
      "2. Explain your symptoms and test results",
      "3. Request same-day or next-day appointment",
      "4. Prepare list of current medications and symptoms",
      "5. If unable to reach provider, consider urgent care visit"
    ];
  }

  if (triageText.includes('HIGH')) {
    return [
      "1. Call your healthcare provider within 48-72 hours to schedule appointment",
      "2. Bring this analysis and any medical reports to your visit",
      "3. List all medications and supplements you're taking",
      "4. Note any symptoms you've experienced",
      "5. Ask about cardiac risk factor management strategies"
    ];
  }

  if (triageText.includes('MODERATE')) {
    return [
      "1. Schedule appointment with your healthcare provider within 1-2 weeks",
      "2. Discuss findings and risk factors at your visit",
      "3. Begin tracking blood pressure and other vitals daily",
      "4. Start implementing heart-healthy lifestyle changes now",
      "5. Ask about screening tests that may be needed"
    ];
  }

  return [
    "1. Continue regular preventive care visits (annually or as recommended)",
    "2. Maintain healthy lifestyle habits (diet, exercise, stress management)",
    "3. Monitor blood pressure and other vitals periodically",
    "4. Stay current with recommended health screenings",
    "5. Report any new symptoms to your healthcare provider promptly"
  ];
}
