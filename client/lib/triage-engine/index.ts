/**
 * CardioScan Pro - Triage Engine
 * Public API Exports
 * 
 * Main entry point for importing triage engine functionality
 */

// Core Types
export type {
  HeartMetrics,
  HeartAnalysis,
  ScoringResult,
  CategoryResult,
  AnalysisMeta
} from './types';

// Main Analysis Function
export {
  composeAnalysis,
  composeBatchAnalysis,
  quickRiskAssessment,
  validateMetrics,
  compareAnalyses,
  exportAnalysisJSON,
  generateProviderSummary
} from './composeAnalysis';

// Component Functions (for custom implementations)
export { scoreRisk } from './scoreRisk';
export { 
  categorizeRisk,
  getCategoryDescription,
  getCategoryColor,
  getCategoryIcon,
  getActionTimeline
} from './categorize';
export {
  estimateConfidence,
  getConfidenceDescription,
  getConfidenceImprovementSuggestions
} from './confidence';
export {
  getTriageRecommendation,
  getWarningSigns,
  getNextStepsChecklist
} from './triage';
export {
  generateRecommendations,
  getPriorityRecommendations,
  groupRecommendationsByCategory
} from './recommendations';

// Clinical Rules and Thresholds
export {
  thresholds,
  weights,
  maxPossibleScore,
  triageLevels,
  getClinicalRanges
} from './triageRules';

// Default export for convenience
import { composeAnalysis as _composeAnalysis } from './composeAnalysis';
export { _composeAnalysis as analyzeCardiacRisk };
export default _composeAnalysis;
