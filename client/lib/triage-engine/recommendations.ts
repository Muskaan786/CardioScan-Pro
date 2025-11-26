/**
 * Medical Recommendations Generator
 * 
 * Generates personalized, actionable medical recommendations based on:
 * - Specific findings and risk factors
 * - Risk category and urgency level
 * - Evidence-based clinical guidelines
 * 
 * Recommendations are:
 * - Action-oriented (specific steps patient/provider can take)
 * - Non-prescriptive (suggestions, not medical orders)
 * - Evidence-based (aligned with AHA, ESC, ACC/AHA guidelines)
 * - Prioritized (most important actions first)
 * 
 * Categories of recommendations:
 * 1. Immediate safety/medical care
 * 2. Monitoring and follow-up
 * 3. Lifestyle modifications
 * 4. Risk factor management
 * 5. Preventive care
 */

import { HeartMetrics, AnalysisMeta } from './types';
import { thresholds } from './triageRules';

/**
 * Generate comprehensive recommendations based on findings
 * 
 * @param metrics - Cardiac metrics
 * @param analysisMeta - Analysis metadata (score, category, confidence, reasons)
 * @returns Array of actionable recommendation strings
 */
export function generateRecommendations(
  metrics: HeartMetrics,
  analysisMeta: AnalysisMeta
): string[] {
  const recommendations: string[] = [];

  // SECTION 1: IMMEDIATE CARE RECOMMENDATIONS
  // Based on critical findings requiring urgent attention

  const ef = metrics.ejectionFraction || metrics.lvef;
  
  // Critical ejection fraction
  if (ef !== undefined && ef < thresholds.ef.severe) {
    recommendations.push(
      "⚠️ IMMEDIATE: Seek emergency cardiac evaluation for severe heart failure (EF <35%). This requires immediate specialist assessment and treatment."
    );
    recommendations.push(
      "Avoid strenuous physical activity until evaluated by cardiologist. Rest and limit exertion."
    );
    recommendations.push(
      "Monitor for heart failure symptoms: increasing shortness of breath, swelling, rapid weight gain. Seek immediate care if these worsen."
    );
  }

  // Hypertensive crisis
  if (
    (metrics.systolic !== undefined && metrics.systolic >= thresholds.bp.crisisSystolic) ||
    (metrics.diastolic !== undefined && metrics.diastolic >= thresholds.bp.crisisDiastolic)
  ) {
    recommendations.push(
      "⚠️ IMMEDIATE: Seek emergency care for hypertensive crisis (BP ≥180/110). This level requires immediate treatment to prevent stroke or organ damage."
    );
    recommendations.push(
      "Sit or lie down in quiet environment. Avoid sudden movements or stress. Do not drive yourself to hospital."
    );
  }

  // Severe pulmonary hypertension
  if (metrics.pasp !== undefined && metrics.pasp >= thresholds.pasp.severe) {
    recommendations.push(
      "⚠️ IMMEDIATE: Severe pulmonary hypertension requires urgent cardiology evaluation. Avoid high altitudes and strenuous activity."
    );
  }

  // SECTION 2: MONITORING RECOMMENDATIONS
  // Specific monitoring based on findings

  // Blood pressure monitoring - personalized based on actual BP
  if (metrics.systolic && metrics.systolic >= thresholds.bp.stage2Systolic) {
    recommendations.push(
      `📊 URGENT: Your blood pressure (${metrics.systolic}/${metrics.diastolic || '?'} mmHg) is Stage 2 hypertension. Monitor BP twice daily. Contact doctor within 24-48 hours to start or adjust medication.`
    );
    recommendations.push(
      "CRITICAL: Reduce sodium to <1,500mg daily. Avoid all processed foods, canned soups, fast food. Start DASH diet immediately (rich in fruits, vegetables, low-fat dairy)."
    );
  } else if (metrics.systolic && metrics.systolic >= thresholds.bp.stage1Systolic) {
    recommendations.push(
      `📊 Your blood pressure (${metrics.systolic}/${metrics.diastolic || '?'} mmHg) is Stage 1 hypertension. Monitor BP daily at same time. Target: <130/80 mmHg.`
    );
    recommendations.push(
      "Reduce sodium to <2,300mg daily (ideally <1,500mg). Read food labels, avoid processed foods, don't add salt at table."
    );
  } else if (metrics.systolic && metrics.systolic >= thresholds.bp.elevatedSystolic) {
    recommendations.push(
      `📊 Your blood pressure (${metrics.systolic}/${metrics.diastolic || '?'} mmHg) is elevated. Monitor weekly. Implement lifestyle changes now to prevent hypertension.`
    );
  }

  // Moderate heart function
  if (ef !== undefined && ef < thresholds.ef.moderate && ef >= thresholds.ef.severe) {
    recommendations.push(
      "📊 Schedule echocardiogram every 6-12 months to monitor heart function changes. Track any new symptoms."
    );
    recommendations.push(
      "Ask your doctor about cardiac rehabilitation program - structured exercise can improve heart function safely."
    );
  }

  // Lipid management - personalized based on actual LDL level
  if (metrics.ldl !== undefined && metrics.ldl >= thresholds.ldl.veryHigh) {
    recommendations.push(
      `🔬 URGENT: Your LDL cholesterol (${metrics.ldl} mg/dL) is very high. Discuss statin therapy immediately with your doctor. Target LDL <100 mg/dL (ideally <70 for high-risk patients).`
    );
    recommendations.push(
      "Adopt strict low-cholesterol diet: eliminate trans fats, limit saturated fats to <7% of calories, increase soluble fiber (10-25g daily from oats, beans, vegetables)."
    );
  } else if (metrics.ldl !== undefined && metrics.ldl >= thresholds.ldl.high) {
    recommendations.push(
      `🔬 Your LDL cholesterol (${metrics.ldl} mg/dL) is high. Request lipid panel every 3-4 months. Discuss statin therapy if lifestyle changes don't lower LDL to <130 mg/dL within 3 months.`
    );
    recommendations.push(
      "Increase dietary fiber (oats, beans), omega-3 fatty acids (fatty fish 2x/week), and plant sterols (2g daily). Limit red meat and full-fat dairy."
    );
  } else if (metrics.ldl !== undefined && metrics.ldl >= thresholds.ldl.borderlineHigh) {
    recommendations.push(
      `📊 Your LDL cholesterol (${metrics.ldl} mg/dL) is borderline high. Monitor with lipid panel every 6 months. Focus on diet and exercise to lower to <130 mg/dL.`
    );
  } else if (metrics.cholesterol !== undefined && metrics.cholesterol >= thresholds.cholesterol.high) {
    recommendations.push(
      `🔬 Your total cholesterol (${metrics.cholesterol} mg/dL) is high. Get complete lipid panel (LDL, HDL, triglycerides) to assess cardiovascular risk.`
    );
  }

  // Diabetes monitoring - personalized based on FBS level
  if (metrics.diabetes === true) {
    recommendations.push(
      "📊 CRITICAL: Active diabetes diagnosis - check fasting blood glucose daily. Request HbA1c test every 3 months. Target HbA1c <7% to reduce cardiovascular complications."
    );
    recommendations.push(
      "Meet with certified diabetes educator and registered dietitian for personalized meal planning. Consider continuous glucose monitor (CGM) for better glucose control."
    );
  } else if (metrics.fastingBloodSugar !== undefined && metrics.fastingBloodSugar >= thresholds.fbs.diabetes) {
    recommendations.push(
      `⚠️ Your fasting blood sugar (${metrics.fastingBloodSugar} mg/dL) indicates diabetes. Schedule comprehensive diabetes evaluation with doctor immediately. Start HbA1c monitoring.`
    );
    recommendations.push(
      "Begin low-glycemic diet: focus on whole grains, lean proteins, non-starchy vegetables. Limit refined carbs, sugary drinks, sweets."
    );
  } else if (metrics.fastingBloodSugar !== undefined && metrics.fastingBloodSugar >= thresholds.fbs.prediabetes) {
    recommendations.push(
      `📊 Your fasting blood sugar (${metrics.fastingBloodSugar} mg/dL) indicates prediabetes. Check FBS every 6 months. Lose 5-7% body weight to prevent progression to diabetes.`
    );
    recommendations.push(
      "Reduce refined carbohydrates and increase physical activity (150 min/week). This can reduce diabetes risk by 58%."
    );
  }

  // SECTION 3: LIFESTYLE MODIFICATIONS
  // Evidence-based lifestyle changes for cardiovascular health

  // Only add general lifestyle recommendations if we have specific risk factors
  // Don't add generic advice unless needed
  const hasModifiableRiskFactors = (
    metrics.smoker || 
    metrics.diabetes || 
    (metrics.bmi && metrics.bmi >= thresholds.bmi.overweight) ||
    (metrics.systolic && metrics.systolic >= thresholds.bp.stage1Systolic) ||
    (metrics.ldl && metrics.ldl >= thresholds.ldl.borderlineHigh)
  );

  // Only add exercise recommendation if patient has cardiovascular risk
  if (hasModifiableRiskFactors && analysisMeta.category !== "Normal") {
    recommendations.push(
      "🏃 Aim for 150 minutes of moderate aerobic activity weekly (brisk walking, cycling, swimming). Start slowly and gradually increase if currently sedentary."
    );
  }

  // Only add diet recommendation if lipids or BP are elevated
  if (
    (metrics.ldl && metrics.ldl >= thresholds.ldl.borderlineHigh) ||
    (metrics.cholesterol && metrics.cholesterol >= thresholds.cholesterol.borderlineHigh) ||
    (metrics.systolic && metrics.systolic >= thresholds.bp.stage1Systolic) ||
    metrics.diabetes
  ) {
    recommendations.push(
      "🍎 Follow Mediterranean or DASH diet pattern: emphasize fruits, vegetables, whole grains, lean proteins, healthy fats. Limit red meat and sweets."
    );
  }

  // Weight management
  if (metrics.bmi !== undefined && metrics.bmi >= thresholds.bmi.overweight) {
    const bmiCategory = metrics.bmi >= thresholds.bmi.obeseClass1 ? "obesity" : "overweight";
    recommendations.push(
      `⚖️ Work toward healthy weight (BMI 18.5-24.9). Current BMI indicates ${bmiCategory}. Even 5-10% weight loss significantly reduces cardiovascular risk.`
    );
    recommendations.push(
      "Consider referral to registered dietitian for personalized weight management plan. Avoid fad diets; focus on sustainable lifestyle changes."
    );
  }

  // Smoking cessation
  if (metrics.smoker === true) {
    recommendations.push(
      "🚭 PRIORITY: Quit smoking immediately - this is the single most important modifiable risk factor. Contact your doctor about cessation programs, nicotine replacement, or medications (varenicline, bupropion)."
    );
    recommendations.push(
      "Join smoking cessation support group or use quit-smoking apps. Avoid triggers and consider behavioral therapy. Quitting reduces heart attack risk by 50% within 1 year."
    );
  }

  // Stress management - only if high BP or high risk
  if ((metrics.systolic && metrics.systolic >= thresholds.bp.stage2Systolic) || analysisMeta.normalizedRiskPercent >= 60) {
    recommendations.push(
      "🧘 Implement stress reduction techniques: meditation, yoga, deep breathing exercises, or mindfulness practice. Chronic stress elevates cardiovascular risk."
    );
  }
  
  // Alcohol advice - only if BP elevated or high risk
  if ((metrics.systolic && metrics.systolic >= thresholds.bp.stage1Systolic) || analysisMeta.category === "High") {
    recommendations.push(
      "Limit alcohol consumption: maximum 1 drink daily for women, 2 for men. Excessive alcohol raises blood pressure and heart disease risk."
    );
  }

  // SECTION 4: MEDICATION ADHERENCE
  // Remind about medication compliance

  if (analysisMeta.category === "High" || analysisMeta.category === "Moderate") {
    recommendations.push(
      "💊 Take all prescribed medications as directed. Do not stop cardiac medications without consulting your doctor. Use pill organizer and set reminders if needed."
    );
    recommendations.push(
      "Bring complete medication list (including over-the-counter and supplements) to all medical appointments. Some supplements interact with cardiac medications."
    );
  }

  // SECTION 5: PREVENTIVE CARE
  // Only recommend additional screening if there are risk factors and patient is older
  
  if (hasModifiableRiskFactors && metrics.age && metrics.age >= 50 && analysisMeta.category !== "Normal") {
    recommendations.push(
      "Consider additional cardiac screening: exercise stress test, coronary calcium scoring, or advanced lipid testing. Discuss with your cardiologist."
    );
  }

  // Sleep - only for high risk or if BP elevated
  if ((analysisMeta.category === "High" || analysisMeta.category === "Moderate") && 
      (metrics.systolic && metrics.systolic >= thresholds.bp.stage1Systolic)) {
    recommendations.push(
      "😴 Prioritize sleep: aim for 7-9 hours nightly. Poor sleep increases cardiovascular risk. Screen for sleep apnea if snoring or daytime fatigue present."
    );
  }

  // SECTION 6: FAMILY CONSIDERATIONS
  // Family history implications

  if (metrics.familyHistory === true) {
    recommendations.push(
      "👪 Inform immediate family members about your cardiac risk factors. They may have increased genetic risk and should discuss screening with their doctors."
    );
  }

  // SECTION 7: MENTAL HEALTH
  // Depression and cardiac health connection

  if (analysisMeta.category === "High" || analysisMeta.category === "Moderate") {
    recommendations.push(
      "🧠 Monitor mental health: depression and anxiety are common with cardiac conditions and can worsen outcomes. Seek counseling or therapy if experiencing persistent sadness, anxiety, or hopelessness."
    );
  }

  // SECTION 8: EDUCATIONAL RESOURCES
  // Only for patients with chronic conditions
  
  if (metrics.diabetes || (ef && ef < thresholds.ef.moderate) || analysisMeta.category === "High") {
    recommendations.push(
      "📚 Learn more about your condition: visit heart.org (American Heart Association) or diabetes.org for evidence-based information."
    );
  }

  // SECTION 9: EMERGENCY PREPAREDNESS
  // Know the warning signs

  if (analysisMeta.category === "High" || analysisMeta.category === "Moderate") {
    recommendations.push(
      "🚨 Learn cardiac emergency warning signs: chest pain/pressure, shortness of breath, pain radiating to arm/jaw/back, sudden weakness, severe headache. Call 911 immediately if these occur - do not wait."
    );
    recommendations.push(
      "Keep emergency contact information readily available. Inform family/coworkers about your cardiac condition and where you keep emergency medications (if prescribed)."
    );
  }

  // SECTION 10: MEDICAL DISCLAIMER (if no other recommendations)
  // Only add disclaimer if we have very few recommendations
  if (recommendations.length < 3) {
    recommendations.push(
      "⚕️ Based on available data, maintain healthy lifestyle and schedule regular check-ups with your healthcare provider."
    );
  }

  // Remove duplicates (if any)
  const uniqueRecommendations = Array.from(new Set(recommendations));

  return uniqueRecommendations;
}

/**
 * Get priority recommendations (top 5 most important)
 * 
 * @param recommendations - Full recommendations array
 * @returns Top 5 priority recommendations
 */
export function getPriorityRecommendations(recommendations: string[]): string[] {
  // Extract recommendations marked with ⚠️ (immediate) or priority indicators
  const immediate = recommendations.filter(r => r.includes('⚠️ IMMEDIATE'));
  const priority = recommendations.filter(r => r.includes('PRIORITY'));
  const monitoring = recommendations.filter(r => r.includes('📊'));
  const lifestyle = recommendations.filter(r => r.includes('🏃') || r.includes('🍎') || r.includes('🚭'));
  
  // Combine in priority order
  const prioritized = [
    ...immediate,
    ...priority,
    ...monitoring.slice(0, 2),
    ...lifestyle.slice(0, 2)
  ];

  return prioritized.slice(0, 5);
}

/**
 * Get recommendations grouped by category
 * 
 * @param recommendations - Full recommendations array
 * @returns Object with recommendations grouped by category
 */
export function groupRecommendationsByCategory(recommendations: string[]): Record<string, { text: string; category: string; priority: 'urgent' | 'high' | 'medium' | 'low' }[]> {
  const mapToItems = (texts: string[], category: string, priority: 'urgent' | 'high' | 'medium' | 'low') => 
    texts.map(text => ({ text, category, priority }));

  return {
    immediate: mapToItems(recommendations.filter(r => r.includes('⚠️ IMMEDIATE')), 'Immediate Care', 'urgent'),
    monitoring: mapToItems(recommendations.filter(r => r.includes('📊') || r.includes('🔬')), 'Monitoring', 'high'),
    lifestyle: mapToItems(recommendations.filter(r => r.includes('🏃') || r.includes('🍎') || r.includes('⚖️') || r.includes('🚭') || r.includes('🧘')), 'Lifestyle', 'medium'),
    medical: mapToItems(recommendations.filter(r => r.includes('💊') || r.includes('🔍')), 'Medications', 'high'),
    support: mapToItems(recommendations.filter(r => r.includes('🧠') || r.includes('📚') || r.includes('🤝')), 'Support', 'medium'),
    safety: mapToItems(recommendations.filter(r => r.includes('🚨') || r.includes('⚕️')), 'Safety', 'urgent')
  };
}
