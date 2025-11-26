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

  // Blood pressure monitoring
  if (
    metrics.systolic && metrics.systolic >= thresholds.bp.stage1Systolic ||
    metrics.diastolic && metrics.diastolic >= thresholds.bp.stage1Diastolic
  ) {
    recommendations.push(
      "📊 Monitor blood pressure twice daily (morning and evening) at the same times. Keep a log to share with your healthcare provider."
    );
    recommendations.push(
      "Reduce sodium intake to <2,300mg daily (ideally <1,500mg if hypertensive). Read food labels and avoid processed foods."
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

  // Lipid management
  if (
    (metrics.ldl !== undefined && metrics.ldl >= thresholds.ldl.borderlineHigh) ||
    (metrics.cholesterol !== undefined && metrics.cholesterol >= thresholds.cholesterol.borderlineHigh)
  ) {
    recommendations.push(
      "🔬 Request lipid panel testing every 3-6 months to monitor cholesterol management. Discuss statin therapy with your doctor if LDL remains elevated."
    );
    recommendations.push(
      "Adopt heart-healthy diet: increase fiber (oats, beans), omega-3 fatty acids (fish), and plant sterols. Limit saturated fats and trans fats."
    );
  }

  // Diabetes monitoring
  if (
    metrics.diabetes === true ||
    (metrics.fastingBloodSugar !== undefined && metrics.fastingBloodSugar >= thresholds.fbs.prediabetes)
  ) {
    recommendations.push(
      "📊 Check fasting blood glucose regularly. Request HbA1c test every 3 months. Diabetes doubles cardiovascular risk - tight control is essential."
    );
    recommendations.push(
      "Meet with diabetes educator or dietitian for meal planning. Consider continuous glucose monitor if diabetic."
    );
  }

  // SECTION 3: LIFESTYLE MODIFICATIONS
  // Evidence-based lifestyle changes for cardiovascular health

  // General cardiovascular health (for all risk levels)
  if (analysisMeta.category !== "Normal") {
    recommendations.push(
      "🏃 Aim for 150 minutes of moderate aerobic activity weekly (brisk walking, cycling, swimming). Start slowly and gradually increase if currently sedentary."
    );
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

  // Alcohol and stress
  if (analysisMeta.normalizedRiskPercent >= 40) {
    recommendations.push(
      "🧘 Implement stress reduction techniques: meditation, yoga, deep breathing exercises, or mindfulness practice. Chronic stress elevates cardiovascular risk."
    );
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
  // Screening and preventive measures

  if (analysisMeta.category !== "High") {
    // Not immediate crisis - include preventive recommendations
    recommendations.push(
      "🔍 Maintain regular preventive care: annual physical exam, dental cleanings (oral health linked to heart disease), vision screening, and age-appropriate cancer screenings."
    );
    
    if (metrics.age && metrics.age >= 50) {
      recommendations.push(
        "Consider additional cardiac screening: exercise stress test, coronary calcium scoring, or advanced lipid testing. Discuss with your cardiologist."
      );
    }
  }

  // Sleep and hydration
  if (analysisMeta.category !== "Normal") {
    recommendations.push(
      "😴 Prioritize sleep: aim for 7-9 hours nightly. Poor sleep increases cardiovascular risk. Screen for sleep apnea if snoring or daytime fatigue present."
    );
    recommendations.push(
      "💧 Stay hydrated: drink adequate water daily (about 8 glasses). Dehydration can strain the heart and affect blood pressure."
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
  // Encourage patient education

  recommendations.push(
    "📚 Educate yourself about heart disease: visit heart.org (American Heart Association) for reliable information. Understanding your condition improves outcomes."
  );

  recommendations.push(
    "🤝 Consider joining cardiac support group (in-person or online). Connecting with others managing similar conditions provides motivation and practical tips."
  );

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

  // SECTION 10: MEDICAL DISCLAIMER
  // Important legal/safety notice

  recommendations.push(
    "⚕️ IMPORTANT DISCLAIMER: These recommendations are educational suggestions based on automated analysis. They do not constitute medical diagnosis or treatment. Consult with qualified healthcare professionals before making any medical decisions or changes to your treatment plan."
  );

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
export function groupRecommendationsByCategory(recommendations: string[]): Record<string, string[]> {
  return {
    immediate: recommendations.filter(r => r.includes('⚠️ IMMEDIATE')),
    monitoring: recommendations.filter(r => r.includes('📊') || r.includes('🔬')),
    lifestyle: recommendations.filter(r => r.includes('🏃') || r.includes('🍎') || r.includes('⚖️') || r.includes('🚭') || r.includes('🧘')),
    medical: recommendations.filter(r => r.includes('💊') || r.includes('🔍')),
    support: recommendations.filter(r => r.includes('🧠') || r.includes('📚') || r.includes('🤝')),
    safety: recommendations.filter(r => r.includes('🚨') || r.includes('⚕️'))
  };
}
