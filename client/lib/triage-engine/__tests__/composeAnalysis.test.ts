/**
 * Integration Tests for Complete Analysis Pipeline
 */

import { describe, it, expect } from 'vitest';
import { composeAnalysis, validateMetrics, quickRiskAssessment, compareAnalyses } from '../composeAnalysis';
import { HeartMetrics, HeartAnalysis } from '../types';

describe('composeAnalysis - End-to-End', () => {
  it('should produce complete analysis for normal patient', () => {
    const metrics: HeartMetrics = {
      age: 35,
      sex: 'female',
      systolic: 115,
      diastolic: 75,
      ldl: 90,
      hdl: 62,
      ejectionFraction: 60,
      bmi: 22.5,
      smoker: false,
      diabetes: false
    };

    const analysis = composeAnalysis(metrics);

    // Check all required fields are present
    expect(analysis).toHaveProperty('score');
    expect(analysis).toHaveProperty('normalizedRiskPercent');
    expect(analysis).toHaveProperty('category');
    expect(analysis).toHaveProperty('confidence');
    expect(analysis).toHaveProperty('reasons');
    expect(analysis).toHaveProperty('metrics');
    expect(analysis).toHaveProperty('triage');
    expect(analysis).toHaveProperty('recommendations');

    // Check types
    expect(typeof analysis.score).toBe('number');
    expect(typeof analysis.normalizedRiskPercent).toBe('number');
    expect(['High', 'Moderate', 'Low', 'Normal']).toContain(analysis.category);
    expect(analysis.confidence).toBeGreaterThan(0);
    expect(analysis.confidence).toBeLessThanOrEqual(1);
    expect(Array.isArray(analysis.reasons)).toBe(true);
    expect(Array.isArray(analysis.recommendations)).toBe(true);
    expect(typeof analysis.triage).toBe('string');

    // Check expected values for normal patient
    expect(analysis.category).toBe('Normal');
    expect(analysis.normalizedRiskPercent).toBeLessThan(20);
  });

  it('should produce high-risk analysis for critical patient', () => {
    const metrics: HeartMetrics = {
      age: 70,
      sex: 'male',
      systolic: 190,
      diastolic: 115,
      ldl: 200,
      ejectionFraction: 25,
      pasp: 68,
      bmi: 34,
      fastingBloodSugar: 180,
      diabetes: true,
      smoker: true,
      familyHistory: true
    };

    const analysis = composeAnalysis(metrics);

    expect(analysis.category).toBe('High');
    expect(analysis.normalizedRiskPercent).toBeGreaterThan(70);
    expect(analysis.score).toBeGreaterThan(15);
    expect(analysis.triage).toContain('IMMEDIATE');
    expect(analysis.reasons.some(r => r.includes('CRITICAL'))).toBe(true);
  });

  it('should handle moderate risk patient appropriately', () => {
    const metrics: HeartMetrics = {
      age: 58,
      systolic: 148,
      diastolic: 93,
      ldl: 165,
      ejectionFraction: 45,
      bmi: 28.5
    };

    const analysis = composeAnalysis(metrics);

    expect(['Moderate', 'Low']).toContain(analysis.category);
    expect(analysis.normalizedRiskPercent).toBeGreaterThan(20);
    expect(analysis.normalizedRiskPercent).toBeLessThan(80);
  });

  it('should include disclaimer in recommendations', () => {
    const metrics: HeartMetrics = { age: 50, systolic: 130 };
    const analysis = composeAnalysis(metrics);

    expect(
      analysis.recommendations.some(r => 
        r.includes('DISCLAIMER') || r.includes('not constitute medical diagnosis')
      )
    ).toBe(true);
  });

  it('should handle parsed text preview', () => {
    const metrics: HeartMetrics = { age: 50 };
    const textPreview = 'Sample medical report text with cardiac parameters...';
    
    const analysis = composeAnalysis(metrics, textPreview);

    expect(analysis.parsedTextPreview).toBeDefined();
    expect(analysis.parsedTextPreview).toContain('Sample medical');
  });

  it('should provide high confidence when comprehensive data available', () => {
    const comprehensiveMetrics: HeartMetrics = {
      age: 60,
      sex: 'male',
      systolic: 135,
      diastolic: 85,
      cholesterol: 210,
      ldl: 130,
      hdl: 45,
      fastingBloodSugar: 105,
      bmi: 26,
      ejectionFraction: 52,
      heartRate: 75,
      pasp: 35,
      smoker: false,
      diabetes: false,
      familyHistory: true
    };

    const analysis = composeAnalysis(comprehensiveMetrics);

    expect(analysis.confidence).toBeGreaterThan(0.6);
  });

  it('should provide lower confidence with sparse data', () => {
    const sparseMetrics: HeartMetrics = {
      age: 50,
      systolic: 140
    };

    const analysis = composeAnalysis(sparseMetrics);

    expect(analysis.confidence).toBeLessThan(0.5);
  });
});

describe('validateMetrics', () => {
  it('should pass validation for valid metrics', () => {
    const validMetrics: HeartMetrics = {
      age: 50,
      systolic: 130,
      diastolic: 85,
      ejectionFraction: 55,
      bmi: 25
    };

    const result = validateMetrics(validMetrics);

    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should catch invalid age', () => {
    const invalidMetrics: HeartMetrics = {
      age: 150
    };

    const result = validateMetrics(invalidMetrics);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('age'))).toBe(true);
  });

  it('should catch invalid blood pressure', () => {
    const invalidMetrics: HeartMetrics = {
      systolic: 300,
      diastolic: 200
    };

    const result = validateMetrics(invalidMetrics);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should catch invalid ejection fraction', () => {
    const invalidMetrics: HeartMetrics = {
      ejectionFraction: 150
    };

    const result = validateMetrics(invalidMetrics);

    expect(result.isValid).toBe(false);
  });

  it('should warn about unusual values', () => {
    const unusualMetrics: HeartMetrics = {
      age: 15,
      cholesterol: 450
    };

    const result = validateMetrics(unusualMetrics);

    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe('quickRiskAssessment', () => {
  it('should return simplified assessment', () => {
    const metrics: HeartMetrics = {
      age: 55,
      systolic: 145,
      ldl: 155
    };

    const result = quickRiskAssessment(metrics);

    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('category');
    expect(result).toHaveProperty('normalizedRiskPercent');
    expect(Object.keys(result).length).toBe(3);
  });
});

describe('compareAnalyses', () => {
  it('should detect improvements', () => {
    const baseline: HeartAnalysis = composeAnalysis({
      age: 60,
      systolic: 160,
      diastolic: 100,
      ldl: 180,
      ejectionFraction: 40
    });

    const followup: HeartAnalysis = composeAnalysis({
      age: 60,
      systolic: 130,
      diastolic: 80,
      ldl: 100,
      ejectionFraction: 50
    });

    const comparison = compareAnalyses(baseline, followup);

    expect(comparison.scoreChange).toBeLessThan(0);
    expect(comparison.improvements.length).toBeGreaterThan(0);
  });

  it('should detect deteriorations', () => {
    const baseline: HeartAnalysis = composeAnalysis({
      age: 60,
      ejectionFraction: 55,
      systolic: 120
    });

    const followup: HeartAnalysis = composeAnalysis({
      age: 60,
      ejectionFraction: 35,
      systolic: 175
    });

    const comparison = compareAnalyses(baseline, followup);

    expect(comparison.scoreChange).toBeGreaterThan(0);
    expect(comparison.deteriorations.length).toBeGreaterThan(0);
  });
});
