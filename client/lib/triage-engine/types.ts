/**
 * Core Type Definitions for CardioScan Pro Triage Engine
 * 
 * These types define the structure of cardiac metrics extracted from medical reports
 * and the comprehensive analysis output including risk assessment and recommendations.
 */

/**
 * HeartMetrics: Extracted cardiac parameters from medical documents
 * All fields are optional as not all reports contain complete data
 */
export type HeartMetrics = {
  // Patient Demographics
  patientName?: string;
  age?: number;
  sex?: "male" | "female";

  // Vital Signs
  systolic?: number;        // Systolic blood pressure (mmHg)
  diastolic?: number;       // Diastolic blood pressure (mmHg)
  heartRate?: number;       // Beats per minute

  // Lipid Panel
  cholesterol?: number;     // Total cholesterol (mg/dL)
  ldl?: number;            // Low-density lipoprotein (mg/dL)
  hdl?: number;            // High-density lipoprotein (mg/dL)

  // Metabolic Markers
  fastingBloodSugar?: number;  // Fasting glucose (mg/dL)
  bmi?: number;                 // Body mass index

  // Obesity Metrics
  height?: number;              // Height in cm
  weight?: number;              // Weight in kg
  waist?: number;               // Waist circumference in cm

  // Risk Factors (Boolean)
  smoker?: boolean;
  diabetes?: boolean;
  familyHistory?: boolean;  // Family history of heart disease

  // Echocardiogram Findings
  ejectionFraction?: number;  // Left ventricular ejection fraction (%)
  lvef?: number;              // Alias for ejection fraction
  pasp?: number;              // Pulmonary artery systolic pressure (mmHg)
  trVelocity?: number;        // Tricuspid regurgitation velocity (m/s)

  // Diagnostic Tests
  ecgResult?: string;       // ECG/EKG findings (text)
  stressTest?: string;      // Stress test results (text)
};

/**
 * Triage recommendation with detailed urgency information
 */
export type TriageResult = {
  priority: "IMMEDIATE" | "URGENT" | "SEMI-URGENT" | "NON-URGENT";
  level: string;
  timeWindow: string;
  reason: string;
  action?: string;
  warningSigns?: string[];
  nextStepsChecklist?: string[];
};

/**
 * Recommendation item with category and priority
 */
export type RecommendationItem = {
  text: string;
  category: string;
  priority: "urgent" | "high" | "medium" | "low";
  rationale?: string;
};

/**
 * Structured recommendations with categorization
 */
export type RecommendationsResult = {
  items: RecommendationItem[];
  priorityRecommendations: RecommendationItem[];
  categorizedRecommendations: Record<string, RecommendationItem[]>;
  disclaimer: string;
};

/**
 * Confidence metadata with breakdown
 */
export type ConfidenceMeta = {
  confidence: number;
  description: string;
  breakdown: {
    dataCompleteness: number;
    keyMarkerQuality: number;
    clinicalContext: number;
  };
  missingParameters: string[];
  suggestions: string[];
};

/**
 * Category metadata with UI helpers
 */
export type CategoryMeta = {
  description: string;
  color: string;
  icon: string;
  actionTimeline: string;
};

/**
 * Scoring result with detailed breakdown
 */
export type ScoringMeta = {
  score: number;
  maxPossibleScore: number;
  reasons: string[];
};

/**
 * HeartAnalysis: Comprehensive cardiac risk analysis output
 * Includes risk scoring, categorization, triage, and actionable recommendations
 */
export type HeartAnalysis = {
  // Risk Scoring
  normalizedRiskPercent: number;    // Normalized to 0-100 scale
  category: "High" | "Moderate" | "Low" | "Normal";  // Risk category
  
  // Quality Metrics
  confidence: number;               // Confidence in analysis (0-1)
  
  // Source Data
  metrics: HeartMetrics;            // Original extracted metrics
  parsedTextPreview?: string;       // Preview of parsed text from document
  
  // Detailed Metadata
  scoring?: ScoringMeta;            // Detailed scoring information
  categoryMeta?: CategoryMeta;      // Category details with UI helpers
  confidenceMeta?: ConfidenceMeta;  // Confidence breakdown and suggestions
  
  // Clinical Guidance
  triage?: TriageResult;            // Structured triage recommendation
  recommendations?: RecommendationsResult;  // Structured recommendations
  
  // Metadata
  meta?: {
    analysisDate: string;
    version: string;
    textPreview?: string;
  };
  
  // Legacy compatibility (for old heart-analyzer)
  score?: number;                   // Raw risk score (deprecated, use scoring.score)
  reasons?: string[];               // Risk reasons (deprecated, use scoring.reasons)
};

/**
 * Internal type for scoring results
 */
export type ScoringResult = {
  score: number;
  reasons: string[];
  rawScore: number;
};

/**
 * Internal type for categorization results
 */
export type CategoryResult = {
  category: "High" | "Moderate" | "Low" | "Normal";
  normalizedRiskPercent: number;
};

/**
 * Internal type for analysis metadata passed between functions
 */
export type AnalysisMeta = {
  score: number;
  normalizedRiskPercent: number;
  category: "High" | "Moderate" | "Low" | "Normal";
  confidence: number;
  reasons: string[];
};
