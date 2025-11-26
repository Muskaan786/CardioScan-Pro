/**
 * Risk Categorization Module
 * 
 * Maps raw risk scores to clinical categories and normalized percentages.
 * 
 * Categories:
 * - High: ≥80% - Immediate medical attention required
 * - Moderate: 50-79% - Follow-up within 2-4 weeks recommended
 * - Low: 20-49% - Annual monitoring recommended
 * - Normal: <20% - Continue preventive care
 * 
 * Formula:
 * normalizedRiskPercent = min(100, max(5, (rawScore / maxPossibleScore) × 100))
 * 
 * The normalization ensures:
 * - Minimum 5% (even with zero score, some baseline risk exists)
 * - Maximum 100% (cap at 100 for clarity)
 * - Linear scaling based on maximum achievable score
 */

import { CategoryResult } from './types';
import { maxPossibleScore } from './triageRules';

/**
 * Categorize risk based on raw score
 * 
 * @param score - Raw risk score from scoreRisk function
 * @returns Object containing category and normalized percentage
 */
export function categorizeRisk(score: number): CategoryResult {
  // 1. NORMALIZE SCORE TO PERCENTAGE
  // Calculate percentage of maximum possible score
  // maxPossibleScore represents worst-case scenario across all parameters
  let normalizedRiskPercent = (score / maxPossibleScore) * 100;

  // Apply floor and ceiling
  // Floor at 5%: Even with no risk factors, baseline cardiovascular risk exists
  // Ceiling at 100%: Maximum risk percentage for clarity
  normalizedRiskPercent = Math.min(100, Math.max(5, normalizedRiskPercent));

  // Round to 1 decimal place for readability
  normalizedRiskPercent = Math.round(normalizedRiskPercent * 10) / 10;

  // 2. MAP TO CLINICAL CATEGORY
  // Categories based on clinical urgency and recommended action timelines
  let category: "High" | "Moderate" | "Low" | "Normal";

  if (normalizedRiskPercent >= 80) {
    // HIGH RISK: ≥80%
    // Indicates multiple severe risk factors or critical cardiac dysfunction
    // Requires immediate medical attention
    category = "High";
  } else if (normalizedRiskPercent >= 50) {
    // MODERATE RISK: 50-79%
    // Indicates significant risk factors requiring intervention
    // Recommend follow-up within 2-4 weeks
    category = "Moderate";
  } else if (normalizedRiskPercent >= 20) {
    // LOW RISK: 20-49%
    // Indicates some risk factors present but not immediately concerning
    // Recommend annual monitoring and lifestyle modifications
    category = "Low";
  } else {
    // NORMAL: <20%
    // Minimal or no significant risk factors detected
    // Continue preventive care and healthy lifestyle
    category = "Normal";
  }

  return {
    category,
    normalizedRiskPercent
  };
}

/**
 * Get detailed category description
 * 
 * @param category - Risk category
 * @returns Detailed description of what the category means
 */
export function getCategoryDescription(category: "High" | "Moderate" | "Low" | "Normal"): string {
  switch (category) {
    case "High":
      return "High cardiovascular risk detected. This indicates the presence of severe risk factors or critical cardiac dysfunction that requires immediate medical attention. Multiple parameters are outside normal ranges.";
    
    case "Moderate":
      return "Moderate cardiovascular risk detected. Significant risk factors are present that require medical intervention. Schedule a follow-up appointment with your healthcare provider within 2-4 weeks.";
    
    case "Low":
      return "Low cardiovascular risk detected. Some risk factors are present but not immediately concerning. Annual monitoring and lifestyle modifications recommended.";
    
    case "Normal":
      return "Normal cardiovascular risk profile. Minimal or no significant risk factors detected. Continue preventive care and maintain healthy lifestyle habits.";
  }
}

/**
 * Get category color code for UI display
 * 
 * @param category - Risk category
 * @returns Color code (hex or CSS color name)
 */
export function getCategoryColor(category: "High" | "Moderate" | "Low" | "Normal"): string {
  switch (category) {
    case "High":
      return "#DC2626"; // Red - urgent/critical
    
    case "Moderate":
      return "#F59E0B"; // Amber/Orange - warning
    
    case "Low":
      return "#3B82F6"; // Blue - informational
    
    case "Normal":
      return "#10B981"; // Green - healthy/safe
  }
}

/**
 * Get category icon/emoji for display
 * 
 * @param category - Risk category
 * @returns Icon character or emoji
 */
export function getCategoryIcon(category: "High" | "Moderate" | "Low" | "Normal"): string {
  switch (category) {
    case "High":
      return "⚠️"; // Warning sign
    
    case "Moderate":
      return "⚡"; // Attention needed
    
    case "Low":
      return "ℹ️"; // Information
    
    case "Normal":
      return "✓"; // Check mark
  }
}

/**
 * Get recommended action timeline based on category
 * 
 * @param category - Risk category
 * @returns Timeline description
 */
export function getActionTimeline(category: "High" | "Moderate" | "Low" | "Normal"): string {
  switch (category) {
    case "High":
      return "Immediate action required - Seek medical care within 24 hours or visit emergency department";
    
    case "Moderate":
      return "Follow-up recommended within 2-4 weeks - Contact your healthcare provider to schedule appointment";
    
    case "Low":
      return "Annual monitoring recommended - Schedule routine check-up and consider lifestyle modifications";
    
    case "Normal":
      return "Continue current care - Maintain healthy lifestyle and attend regular preventive care visits";
  }
}
