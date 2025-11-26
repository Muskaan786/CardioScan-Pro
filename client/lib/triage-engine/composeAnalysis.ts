/**
 * Main Analysis Composition Module
 * 
 * Orchestrates all analysis components to produce comprehensive HeartAnalysis output.
 * 
 * Pipeline:
 * 1. Score risk factors → get raw score and reasons
 * 2. Categorize risk → map score to category and normalized percentage
 * 3. Estimate confidence → assess analysis reliability
 * 4. Generate triage → determine urgency and time window
 * 5. Create recommendations → actionable steps for patient/provider
 * 6. Compose final analysis → combine all components
 * 
 * All processing is client-side, no data transmitted.
 */

import { HeartMetrics, HeartAnalysis, AnalysisMeta, TriageResult, RecommendationsResult, CategoryMeta, ConfidenceMeta, RecommendationItem } from './types';
import { scoreRisk } from './scoreRisk';
import { categorizeRisk, getCategoryColor, getCategoryIcon, getActionTimeline } from './categorize';
import { estimateConfidence, getConfidenceDescription, getConfidenceImprovementSuggestions } from './confidence';
import { getTriageRecommendation, getWarningSigns, getNextStepsChecklist } from './triage';
import { generateRecommendations, getPriorityRecommendations, groupRecommendationsByCategory } from './recommendations';

/**
 * Main function: Compose complete cardiac risk analysis
 * 
 * Example flow:
 * ```typescript
 * const metrics: HeartMetrics = {
 *   age: 65,
 *   sex: 'male',
 *   systolic: 145,
 *   diastolic: 92,
 *   ldl: 165,
 *   ejectionFraction: 42,
 *   diabetes: true
 * };
 * 
 * const analysis = composeAnalysis(metrics);
 * console.log(analysis.category); // "High"
 * console.log(analysis.normalizedRiskPercent); // 67.8
 * console.log(analysis.triage); // "HIGH - Within 48-72 Hours..."
 * console.log(analysis.recommendations); // [...actionable steps...]
 * ```
 * 
 * @param metrics - Extracted cardiac metrics from medical document
 * @param parsedTextPreview - Optional preview of extracted text (for reference)
 * @returns Complete HeartAnalysis object with all components
 */
export function composeAnalysis(
  metrics: HeartMetrics,
  parsedTextPreview?: string
): HeartAnalysis {
  // STEP 1: SCORE RISK FACTORS
  // Calculate weighted risk score and get human-readable reasons
  const scoringResult = scoreRisk(metrics);
  const { score, reasons, rawScore } = scoringResult;

  // STEP 2: CATEGORIZE RISK
  // Map raw score to category (High/Moderate/Low/Normal) and normalized percentage
  const categoryResult = categorizeRisk(score);
  const { category, normalizedRiskPercent } = categoryResult;

  // STEP 3: ESTIMATE CONFIDENCE
  // Assess reliability of analysis based on data completeness and quality
  const confidence = estimateConfidence(metrics, score);

  // STEP 4: CREATE ANALYSIS METADATA
  // Package intermediate results for triage and recommendations
  const analysisMeta: AnalysisMeta = {
    score,
    normalizedRiskPercent,
    category,
    confidence,
    reasons
  };

  // STEP 5: GENERATE TRIAGE RECOMMENDATION
  // Determine urgency and specific time window for seeking care
  const triageString = getTriageRecommendation(metrics, analysisMeta);
  
  // Parse triage string into structured object
  const triage = parseTriageString(triageString, metrics, analysisMeta);

  // STEP 6: GENERATE RECOMMENDATIONS
  // Create actionable, evidence-based recommendations
  const recommendationsArray = generateRecommendations(metrics, analysisMeta);
  
  // Structure recommendations with categorization
  const recommendations = structureRecommendations(recommendationsArray);

  // STEP 7: CREATE DETAILED METADATA
  const scoringMeta = {
    score,
    maxPossibleScore: 15,
    reasons
  };
  
  const categoryMeta = getCategoryMetadata(category);
  const confidenceMeta = getConfidenceMetadata(confidence, metrics, score);

  // STEP 8: COMPOSE FINAL ANALYSIS
  // Combine all components into comprehensive output
  const analysis: HeartAnalysis = {
    normalizedRiskPercent: Math.round(normalizedRiskPercent * 10) / 10,
    category,
    confidence: Math.round(confidence * 100) / 100, // Round to 2 decimals
    metrics, // Include original metrics for reference
    parsedTextPreview: parsedTextPreview?.substring(0, 500), // Limit preview length
    scoring: scoringMeta,
    categoryMeta,
    confidenceMeta,
    triage,
    recommendations,
    meta: {
      analysisDate: new Date().toISOString(),
      version: '1.0.0',
      textPreview: parsedTextPreview?.substring(0, 500)
    },
    // Legacy compatibility
    score: Math.round(score * 10) / 10,
    reasons
  };

  return analysis;
}

/**
 * Batch analysis function for multiple patients/documents
 * 
 * @param metricsList - Array of metrics objects
 * @returns Array of analysis results
 */
export function composeBatchAnalysis(
  metricsList: Array<{ metrics: HeartMetrics; textPreview?: string }>
): HeartAnalysis[] {
  return metricsList.map(item => 
    composeAnalysis(item.metrics, item.textPreview)
  );
}

/**
 * Quick risk assessment (returns only score and category)
 * Useful for lightweight screening or dashboards
 * 
 * @param metrics - Cardiac metrics
 * @returns Simplified assessment
 */
export function quickRiskAssessment(metrics: HeartMetrics): {
  score: number;
  category: "High" | "Moderate" | "Low" | "Normal";
  normalizedRiskPercent: number;
} {
  const { score } = scoreRisk(metrics);
  const { category, normalizedRiskPercent } = categorizeRisk(score);
  
  return {
    score: Math.round(score * 10) / 10,
    category,
    normalizedRiskPercent: Math.round(normalizedRiskPercent * 10) / 10
  };
}

/**
 * Validate metrics before analysis
 * Checks for obviously invalid values
 * 
 * @param metrics - Metrics to validate
 * @returns Validation result with any errors
 */
export function validateMetrics(metrics: HeartMetrics): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Age validation
  if (metrics.age !== undefined) {
    if (metrics.age < 0 || metrics.age > 120) {
      errors.push(`Invalid age: ${metrics.age}. Must be between 0 and 120.`);
    }
    if (metrics.age < 18) {
      warnings.push('Analysis optimized for adults. Pediatric values may differ.');
    }
  }

  // Blood pressure validation
  if (metrics.systolic !== undefined) {
    if (metrics.systolic < 60 || metrics.systolic > 250) {
      errors.push(`Invalid systolic BP: ${metrics.systolic}. Typical range 60-250 mmHg.`);
    }
  }
  if (metrics.diastolic !== undefined) {
    if (metrics.diastolic < 30 || metrics.diastolic > 150) {
      errors.push(`Invalid diastolic BP: ${metrics.diastolic}. Typical range 30-150 mmHg.`);
    }
  }
  if (metrics.systolic && metrics.diastolic && metrics.systolic <= metrics.diastolic) {
    errors.push('Systolic BP should be higher than diastolic BP.');
  }

  // Ejection fraction validation
  const ef = metrics.ejectionFraction || metrics.lvef;
  if (ef !== undefined) {
    if (ef < 10 || ef > 100) {
      errors.push(`Invalid ejection fraction: ${ef}%. Must be between 10-100%.`);
    }
  }

  // Cholesterol validation
  if (metrics.cholesterol !== undefined && (metrics.cholesterol < 100 || metrics.cholesterol > 500)) {
    warnings.push(`Unusual cholesterol value: ${metrics.cholesterol} mg/dL. Verify reading.`);
  }
  if (metrics.ldl !== undefined && (metrics.ldl < 20 || metrics.ldl > 400)) {
    warnings.push(`Unusual LDL value: ${metrics.ldl} mg/dL. Verify reading.`);
  }
  if (metrics.hdl !== undefined && (metrics.hdl < 10 || metrics.hdl > 150)) {
    warnings.push(`Unusual HDL value: ${metrics.hdl} mg/dL. Verify reading.`);
  }

  // Blood sugar validation
  if (metrics.fastingBloodSugar !== undefined && (metrics.fastingBloodSugar < 40 || metrics.fastingBloodSugar > 600)) {
    warnings.push(`Unusual blood sugar value: ${metrics.fastingBloodSugar} mg/dL. Verify reading.`);
  }

  // BMI validation
  if (metrics.bmi !== undefined && (metrics.bmi < 10 || metrics.bmi > 80)) {
    errors.push(`Invalid BMI: ${metrics.bmi}. Typical range 10-80.`);
  }

  // Heart rate validation
  if (metrics.heartRate !== undefined && (metrics.heartRate < 30 || metrics.heartRate > 220)) {
    warnings.push(`Unusual heart rate: ${metrics.heartRate} bpm. Verify reading.`);
  }

  // PASP validation
  if (metrics.pasp !== undefined && (metrics.pasp < 10 || metrics.pasp > 150)) {
    warnings.push(`Unusual PASP value: ${metrics.pasp} mmHg. Verify reading.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Compare two analyses (e.g., before/after treatment)
 * 
 * @param baseline - Initial analysis
 * @param followup - Follow-up analysis
 * @returns Comparison summary
 */
export function compareAnalyses(
  baseline: HeartAnalysis,
  followup: HeartAnalysis
): {
  scoreChange: number;
  categoryChange: string;
  riskPercentChange: number;
  improvements: string[];
  deteriorations: string[];
} {
  const scoreChange = followup.score - baseline.score;
  const riskPercentChange = followup.normalizedRiskPercent - baseline.normalizedRiskPercent;
  
  const categoryChange = baseline.category === followup.category
    ? 'No change'
    : `Changed from ${baseline.category} to ${followup.category}`;

  const improvements: string[] = [];
  const deteriorations: string[] = [];

  // Compare specific metrics
  const compareMetric = (
    key: keyof HeartMetrics,
    label: string,
    lowerIsBetter: boolean
  ) => {
    const baseValue = baseline.metrics[key];
    const followValue = followup.metrics[key];
    
    if (baseValue !== undefined && followValue !== undefined && typeof baseValue === 'number' && typeof followValue === 'number') {
      const change = followValue - baseValue;
      if (change !== 0) {
        const improved = lowerIsBetter ? change < 0 : change > 0;
        const changeText = `${label}: ${baseValue} → ${followValue} (${change > 0 ? '+' : ''}${change.toFixed(1)})`;
        
        if (improved) {
          improvements.push(changeText);
        } else {
          deteriorations.push(changeText);
        }
      }
    }
  };

  compareMetric('systolic', 'Systolic BP', true);
  compareMetric('diastolic', 'Diastolic BP', true);
  compareMetric('ejectionFraction', 'Ejection Fraction', false);
  compareMetric('ldl', 'LDL Cholesterol', true);
  compareMetric('hdl', 'HDL Cholesterol', false);
  compareMetric('fastingBloodSugar', 'Fasting Blood Sugar', true);
  compareMetric('bmi', 'BMI', true);
  compareMetric('pasp', 'PASP', true);

  return {
    scoreChange,
    categoryChange,
    riskPercentChange,
    improvements,
    deteriorations
  };
}

/**
 * Export analysis as JSON string (for saving/sharing)
 * 
 * @param analysis - Analysis to export
 * @param pretty - Whether to format with indentation
 * @returns JSON string
 */
export function exportAnalysisJSON(analysis: HeartAnalysis, pretty: boolean = true): string {
  return JSON.stringify(analysis, null, pretty ? 2 : 0);
}

/**
 * Generate summary text for sharing with healthcare provider
 * 
 * @param analysis - Analysis results
 * @returns Human-readable summary
 */
export function generateProviderSummary(analysis: HeartAnalysis): string {
  const { metrics, score, normalizedRiskPercent, category, confidence, triage } = analysis;
  
  let summary = '=== CARDIOSCAN PRO ANALYSIS SUMMARY ===\n\n';
  summary += `Risk Assessment: ${category} (${normalizedRiskPercent}% normalized risk)\n`;
  summary += `Raw Risk Score: ${score}\n`;
  summary += `Analysis Confidence: ${(confidence * 100).toFixed(0)}%\n`;
  summary += `Triage: ${triage}\n\n`;
  
  summary += 'KEY FINDINGS:\n';
  const ef = metrics.ejectionFraction || metrics.lvef;
  if (ef) summary += `- Ejection Fraction: ${ef}%\n`;
  if (metrics.systolic && metrics.diastolic) {
    summary += `- Blood Pressure: ${metrics.systolic}/${metrics.diastolic} mmHg\n`;
  }
  if (metrics.pasp) summary += `- PASP: ${metrics.pasp} mmHg\n`;
  if (metrics.ldl) summary += `- LDL Cholesterol: ${metrics.ldl} mg/dL\n`;
  if (metrics.hdl) summary += `- HDL Cholesterol: ${metrics.hdl} mg/dL\n`;
  if (metrics.fastingBloodSugar) summary += `- Fasting Blood Sugar: ${metrics.fastingBloodSugar} mg/dL\n`;
  if (metrics.bmi) summary += `- BMI: ${metrics.bmi.toFixed(1)}\n`;
  
  summary += '\nRISK FACTORS IDENTIFIED:\n';
  analysis.reasons
    .filter(r => r.includes('⚠️'))
    .slice(0, 5)
    .forEach((reason, i) => {
      summary += `${i + 1}. ${reason.replace(/⚠️/g, '').trim()}\n`;
    });
  
  summary += '\n=== END OF AUTOMATED ANALYSIS ===\n';
  summary += 'Note: This is automated analysis. Clinical correlation required.\n';
  
  return summary;
}

/**
 * Helper: Parse triage string into structured object
 */
function parseTriageString(triageStr: string, metrics: HeartMetrics, meta: AnalysisMeta): TriageResult {
  let priority: TriageResult['priority'] = 'NON-URGENT';
  let level = 'Standard Care';
  let timeWindow = 'Schedule routine follow-up';
  let reason = triageStr;
  
  if (triageStr.includes('IMMEDIATE') || triageStr.includes('Emergency')) {
    priority = 'IMMEDIATE';
    level = triageStr.split(':')[0]?.trim() || 'Critical Condition';
    timeWindow = 'Seek immediate emergency care';
  } else if (triageStr.includes('URGENT') || triageStr.includes('Within 24-48')) {
    priority = 'URGENT';
    level = triageStr.split(':')[0]?.trim() || 'Urgent Condition';
    timeWindow = 'Within 24-48 hours';
  } else if (triageStr.includes('SEMI-URGENT') || triageStr.includes('1-2 weeks')) {
    priority = 'SEMI-URGENT';
    level = triageStr.split(':')[0]?.trim() || 'Semi-Urgent Condition';
    timeWindow = 'Within 1-2 weeks';
  }
  
  const action = priority === 'IMMEDIATE' ? 'Call 911 or go to emergency room immediately' :
                 priority === 'URGENT' ? 'Schedule urgent appointment with cardiologist' :
                 priority === 'SEMI-URGENT' ? 'Schedule follow-up within 1-2 weeks' :
                 'Continue routine care and monitoring';
  
  return {
    priority,
    level,
    timeWindow,
    reason,
    action,
    warningSigns: getWarningSigns(metrics, meta),
    nextStepsChecklist: getNextStepsChecklist(triageStr)
  };
}

/**
 * Helper: Structure recommendations array into categorized object
 */
function structureRecommendations(recsArray: string[]): RecommendationsResult {
  const items: RecommendationItem[] = recsArray.map(text => {
    let priority: RecommendationItem['priority'] = 'medium';
    let category = 'General';
    
    if (text.includes('IMMEDIATE') || text.includes('🚨')) {
      priority = 'urgent';
      category = 'Immediate Care';
    } else if (text.includes('URGENT') || text.includes('⚠️')) {
      priority = 'high';
      category = 'Monitoring';
    } else if (text.includes('📊')) {
      category = 'Monitoring';
    } else if (text.includes('🏃') || text.includes('🍎') || text.includes('⚖️')) {
      category = 'Lifestyle';
      priority = 'medium';
    } else if (text.includes('🔬') || text.includes('💊')) {
      category = 'Medications';
      priority = 'high';
    } else if (text.includes('🏥')) {
      category = 'Preventive Care';
      priority = 'low';
    } else if (text.includes('🚭')) {
      category = 'Risk Management';
      priority = 'urgent';
    }
    
    return {
      text: text.replace(/^[🚨⚠️✅📊🏃🍎⚖️🔬💊🏥🚭]\s*/, ''),
      category,
      priority
    };
  });
  
  const priorityRecs = getPriorityRecommendations(recsArray).map(text => ({
    text,
    category: 'Immediate Care',
    priority: 'urgent' as const
  }));
  
  const categorizedRecs = groupRecommendationsByCategory(recsArray);
  
  return {
    items,
    priorityRecommendations: priorityRecs,
    categorizedRecommendations: categorizedRecs,
    disclaimer: 'This analysis is for informational purposes only and does not constitute medical advice. Always consult with qualified healthcare professionals for diagnosis and treatment decisions.'
  };
}

/**
 * Helper: Get category metadata with UI helpers
 */
function getCategoryMetadata(category: HeartAnalysis['category']): CategoryMeta {
  let description = '';
  
  switch (category) {
    case 'High':
      description = 'High cardiovascular risk detected. Immediate medical attention recommended.';
      break;
    case 'Moderate':
      description = 'Moderate cardiovascular risk. Follow-up with healthcare provider recommended.';
      break;
    case 'Low':
      description = 'Low cardiovascular risk. Continue healthy lifestyle and regular monitoring.';
      break;
    case 'Normal':
      description = 'Normal cardiovascular risk profile. Maintain healthy habits.';
      break;
  }
  
  return {
    description,
    color: getCategoryColor(category),
    icon: getCategoryIcon(category),
    actionTimeline: getActionTimeline(category)
  };
}

/**
 * Helper: Get confidence metadata with breakdown
 */
function getConfidenceMetadata(confidence: number, metrics: HeartMetrics, score: number): ConfidenceMeta {
  const importantParams = ['age', 'ejectionFraction', 'systolic', 'diastolic', 'cholesterol', 'ldl', 'hdl', 'fastingBloodSugar'];
  const presentCount = importantParams.filter(p => metrics[p as keyof HeartMetrics] !== undefined).length;
  const dataCompleteness = presentCount / importantParams.length;
  
  const keyMarkers = ['ejectionFraction', 'systolic', 'pasp'];
  const keyMarkersPresent = keyMarkers.filter(p => metrics[p as keyof HeartMetrics] !== undefined).length;
  const keyMarkerQuality = keyMarkersPresent / keyMarkers.length;
  
  const clinicalContext = score > 8 ? 0.8 : score > 5 ? 0.6 : 0.4;
  
  const missingParams = importantParams.filter(p => metrics[p as keyof HeartMetrics] === undefined);
  
  return {
    confidence,
    description: getConfidenceDescription(confidence),
    breakdown: {
      dataCompleteness,
      keyMarkerQuality,
      clinicalContext
    },
    missingParameters: missingParams,
    suggestions: getConfidenceImprovementSuggestions(metrics)
  };
}
