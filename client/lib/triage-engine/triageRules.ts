/**
 * Clinical Thresholds and Risk Weighting Rules
 * 
 * This module defines evidence-based clinical thresholds and risk factor weights
 * used in cardiac risk assessment. All values are based on established medical
 * guidelines from AHA, ESC, and ACC/AHA.
 */

/**
 * Clinical thresholds for various cardiac parameters
 * 
 * Rationale:
 * - Ejection Fraction (EF): <40% indicates heart failure (AHA guidelines)
 * - Blood Pressure: Based on 2017 ACC/AHA hypertension guidelines
 * - PASP: >40mmHg suggests pulmonary hypertension
 * - LDL: Based on NCEP ATP III cholesterol guidelines
 */
export const thresholds = {
  // Ejection Fraction (%) - measures heart's pumping efficiency
  ef: {
    severe: 35,      // <35%: Severe systolic dysfunction, high mortality risk
    moderate: 45,    // 35-45%: Moderate dysfunction, requires intervention
    mildlyReduced: 50, // 45-50%: Mildly reduced, monitor closely
    normal: 55       // ≥55%: Normal left ventricular function
  },

  // Blood Pressure (mmHg) - cardiovascular disease primary risk factor
  bp: {
    crisisSystolic: 180,    // ≥180: Hypertensive crisis, immediate care
    crisisDiastolic: 110,   // ≥110: Hypertensive crisis
    stage2Systolic: 140,    // ≥140: Stage 2 hypertension
    stage2Diastolic: 90,    // ≥90: Stage 2 hypertension
    stage1Systolic: 130,    // 130-139: Stage 1 hypertension
    stage1Diastolic: 80,    // 80-89: Stage 1 hypertension
    elevatedSystolic: 120,  // 120-129: Elevated BP
    normalSystolic: 120,    // <120: Normal
    normalDiastolic: 80     // <80: Normal
  },

  // Pulmonary Artery Systolic Pressure (mmHg) - detects pulmonary hypertension
  pasp: {
    severe: 60,      // ≥60mmHg: Severe pulmonary hypertension
    moderate: 50,    // 50-59mmHg: Moderate elevation
    elevated: 40,    // 40-49mmHg: Mildly elevated (normal <40)
    normal: 40
  },

  // Tricuspid Regurgitation Velocity (m/s) - estimates pulmonary pressure
  trVelocity: {
    high: 3.4,       // >3.4 m/s: High probability of pulmonary hypertension
    intermediate: 2.8, // 2.8-3.4 m/s: Intermediate risk
    normal: 2.8      // <2.8 m/s: Normal
  },

  // LDL Cholesterol (mg/dL) - primary target for lipid therapy
  ldl: {
    veryHigh: 190,   // ≥190: Very high, likely familial hypercholesterolemia
    high: 160,       // 160-189: High
    borderlineHigh: 130, // 130-159: Borderline high
    nearOptimal: 100,    // 100-129: Near optimal
    optimal: 100     // <100: Optimal
  },

  // HDL Cholesterol (mg/dL) - "good" cholesterol, protective factor
  hdl: {
    low: 40,         // <40 (men) or <50 (women): Low, increased risk
    optimal: 60      // ≥60: Optimal, protective against heart disease
  },

  // Total Cholesterol (mg/dL)
  cholesterol: {
    high: 240,       // ≥240: High risk
    borderlineHigh: 200, // 200-239: Borderline high
    desirable: 200   // <200: Desirable
  },

  // Fasting Blood Sugar (mg/dL) - diabetes indicator
  fbs: {
    diabetes: 126,   // ≥126: Diabetes diagnosis threshold
    prediabetes: 100, // 100-125: Prediabetes
    normal: 100      // <100: Normal
  },

  // BMI (kg/m²) - obesity indicator
  bmi: {
    obeseClass2: 35, // ≥35: Class 2 obesity, high cardiovascular risk
    obeseClass1: 30, // 30-34.9: Class 1 obesity
    overweight: 25,  // 25-29.9: Overweight
    normal: 18.5     // 18.5-24.9: Normal weight
  },

  // Heart Rate (bpm) - resting heart rate
  heartRate: {
    tachycardia: 100,  // >100: Tachycardia
    normalHigh: 80,    // 80-100: Normal high
    optimal: 60,       // 60-80: Optimal
    bradycardia: 60    // <60: Bradycardia (may be normal for athletes)
  },

  // Age (years) - non-modifiable risk factor
  age: {
    veryHigh: 75,    // ≥75: Very high age-related risk
    high: 65,        // 65-74: High risk
    moderate: 55,    // 55-64: Moderate risk
    elevated: 45     // 45-54: Elevated risk
  }
};

/**
 * Risk factor weights for scoring algorithm
 * 
 * Weights are assigned based on clinical impact and mortality prediction:
 * - Higher weights (4-5): Critical parameters with immediate mortality risk
 * - Medium weights (2-3): Major risk factors with long-term impact
 * - Lower weights (1-2): Contributory factors
 * 
 * Rationale based on:
 * - Framingham Risk Score methodology
 * - Seattle Heart Failure Model
 * - ACC/AHA ASCVD Risk Calculator
 */
export const weights = {
  // Critical cardiac function indicators
  ef: 5,              // Ejection fraction: strongest predictor of cardiac mortality
  pasp: 4,            // Pulmonary pressure: indicates right heart strain
  trVelocity: 3,      // Related to PASP, secondary measure

  // Major cardiovascular risk factors
  bloodPressure: 3,   // Hypertension: leading modifiable risk factor
  diabetes: 3,        // Diabetes: doubles cardiovascular risk
  age: 3,             // Age: strongest non-modifiable predictor

  // Lipid-related risk
  ldl: 2.5,           // LDL: primary lipid target
  hdl: 1.5,           // HDL: protective when high, risk when low
  cholesterol: 2,     // Total cholesterol

  // Metabolic and lifestyle factors
  fbs: 2,             // Fasting blood sugar: diabetes indicator
  bmi: 2,             // Obesity: independent risk factor
  smoker: 3,          // Smoking: major modifiable risk factor
  familyHistory: 2,   // Genetic predisposition

  // Additional indicators
  heartRate: 1.5,     // Elevated HR associated with outcomes
  sex: 1              // Male sex increases risk (used for age-sex interaction)
};

/**
 * Maximum possible score calculation
 * Used to normalize risk percentages
 * 
 * Assumes worst-case scenario for all parameters
 */
export const maxPossibleScore = 
  weights.ef +           // Severe EF
  weights.pasp +         // Severe PASP
  weights.trVelocity +   // High TR velocity
  weights.bloodPressure +// Hypertensive crisis
  weights.diabetes +     // Diabetes present
  weights.age +          // Very high age
  weights.ldl +          // Very high LDL
  weights.hdl +          // Low HDL (risk factor)
  weights.cholesterol +  // High cholesterol
  weights.fbs +          // Diabetic range
  weights.bmi +          // Severe obesity
  weights.smoker +       // Current smoker
  weights.familyHistory +// Positive family history
  weights.heartRate +    // Tachycardia
  weights.sex;           // Male

/**
 * Get all clinical ranges in a structured format
 * Useful for validation and UI display
 */
export function getClinicalRanges(): Record<string, any> {
  return {
    ejectionFraction: {
      unit: '%',
      ranges: [
        { label: 'Severe dysfunction', max: thresholds.ef.severe, risk: 'critical' },
        { label: 'Moderate dysfunction', min: thresholds.ef.severe, max: thresholds.ef.moderate, risk: 'high' },
        { label: 'Mildly reduced', min: thresholds.ef.moderate, max: thresholds.ef.mildlyReduced, risk: 'moderate' },
        { label: 'Normal', min: thresholds.ef.normal, risk: 'normal' }
      ]
    },
    bloodPressure: {
      unit: 'mmHg',
      ranges: [
        { label: 'Hypertensive crisis', systolic: thresholds.bp.crisisSystolic, diastolic: thresholds.bp.crisisDiastolic, risk: 'critical' },
        { label: 'Stage 2 hypertension', systolic: thresholds.bp.stage2Systolic, diastolic: thresholds.bp.stage2Diastolic, risk: 'high' },
        { label: 'Stage 1 hypertension', systolic: thresholds.bp.stage1Systolic, diastolic: thresholds.bp.stage1Diastolic, risk: 'moderate' },
        { label: 'Elevated', systolic: thresholds.bp.elevatedSystolic, risk: 'low' },
        { label: 'Normal', systolic: 120, diastolic: 80, risk: 'normal' }
      ]
    },
    pasp: {
      unit: 'mmHg',
      ranges: [
        { label: 'Severe pulmonary hypertension', min: thresholds.pasp.severe, risk: 'critical' },
        { label: 'Moderate elevation', min: thresholds.pasp.moderate, max: thresholds.pasp.severe, risk: 'high' },
        { label: 'Mildly elevated', min: thresholds.pasp.elevated, max: thresholds.pasp.moderate, risk: 'moderate' },
        { label: 'Normal', max: thresholds.pasp.normal, risk: 'normal' }
      ]
    },
    ldl: {
      unit: 'mg/dL',
      ranges: [
        { label: 'Very high', min: thresholds.ldl.veryHigh, risk: 'critical' },
        { label: 'High', min: thresholds.ldl.high, max: thresholds.ldl.veryHigh, risk: 'high' },
        { label: 'Borderline high', min: thresholds.ldl.borderlineHigh, max: thresholds.ldl.high, risk: 'moderate' },
        { label: 'Near optimal', min: thresholds.ldl.optimal, max: thresholds.ldl.borderlineHigh, risk: 'low' },
        { label: 'Optimal', max: thresholds.ldl.optimal, risk: 'normal' }
      ]
    }
  };
}

/**
 * Triage priority levels with time windows
 * Used to map analysis results to clinical urgency
 */
export const triageLevels = {
  immediate: {
    label: 'IMMEDIATE - Emergency Care Required',
    timeWindow: 'Seek emergency care now (call 911 or go to ER)',
    priority: 1
  },
  urgent: {
    label: 'URGENT - Same Day',
    timeWindow: 'Contact healthcare provider within 24 hours',
    priority: 2
  },
  high: {
    label: 'HIGH - Within 48-72 Hours',
    timeWindow: 'Schedule appointment within 2-3 days',
    priority: 3
  },
  moderate: {
    label: 'MODERATE - Within 1-2 Weeks',
    timeWindow: 'Schedule follow-up within 1-2 weeks',
    priority: 4
  },
  routine: {
    label: 'ROUTINE - Within 1 Month',
    timeWindow: 'Schedule routine follow-up as recommended',
    priority: 5
  },
  monitoring: {
    label: 'MONITORING - Continue Current Care',
    timeWindow: 'Continue regular monitoring and preventive care',
    priority: 6
  }
};
