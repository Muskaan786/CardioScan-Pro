/**
 * Tests for Risk Scoring Engine
 */

import { describe, it, expect } from 'vitest';
import { scoreRisk } from '../scoreRisk';
import { HeartMetrics } from '../types';

describe('scoreRisk', () => {
  it('should return zero score for completely healthy patient', () => {
    const healthyMetrics: HeartMetrics = {
      age: 30,
      sex: 'female',
      systolic: 110,
      diastolic: 70,
      cholesterol: 170,
      ldl: 85,
      hdl: 65,
      fastingBloodSugar: 85,
      bmi: 22,
      ejectionFraction: 65,
      heartRate: 65,
      smoker: false,
      diabetes: false,
      familyHistory: false
    };

    const result = scoreRisk(healthyMetrics);
    
    expect(result.score).toBeLessThan(2);
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.reasons.some(r => r.includes('✓'))).toBe(true);
  });

  it('should score moderate risk for patient with multiple moderate factors', () => {
    const moderateMetrics: HeartMetrics = {
      age: 55,
      sex: 'male',
      systolic: 145,
      diastolic: 92,
      ldl: 155,
      ejectionFraction: 48,
      bmi: 28,
      diabetes: false,
      smoker: false
    };

    const result = scoreRisk(moderateMetrics);
    
    expect(result.score).toBeGreaterThan(5);
    expect(result.score).toBeLessThan(12);
    expect(result.reasons.some(r => r.includes('⚠️'))).toBe(true);
  });

  it('should score high risk for critical patient', () => {
    const criticalMetrics: HeartMetrics = {
      age: 72,
      sex: 'male',
      systolic: 185,
      diastolic: 112,
      ldl: 190,
      ejectionFraction: 30,
      pasp: 65,
      bmi: 33,
      fastingBloodSugar: 165,
      diabetes: true,
      smoker: true,
      familyHistory: true
    };

    const result = scoreRisk(criticalMetrics);
    
    expect(result.score).toBeGreaterThan(15);
    expect(result.reasons.some(r => r.includes('CRITICAL'))).toBe(true);
  });

  it('should handle missing data gracefully', () => {
    const sparseMetrics: HeartMetrics = {
      age: 50,
      systolic: 130
    };

    const result = scoreRisk(sparseMetrics);
    
    expect(result.score).toBeGreaterThan(0);
    expect(result.reasons).toBeDefined();
    expect(Array.isArray(result.reasons)).toBe(true);
  });

  it('should prioritize ejection fraction in scoring', () => {
    const lowEFMetrics: HeartMetrics = {
      ejectionFraction: 28,
      age: 40
    };

    const result = scoreRisk(lowEFMetrics);
    
    expect(result.reasons.some(r => r.includes('Ejection Fraction'))).toBe(true);
    expect(result.score).toBeGreaterThan(3);
  });

  it('should add risk for smoking', () => {
    const smokerMetrics: HeartMetrics = {
      age: 45,
      smoker: true
    };

    const result = scoreRisk(smokerMetrics);
    
    expect(result.reasons.some(r => r.includes('smoker'))).toBe(true);
    expect(result.score).toBeGreaterThan(0);
  });

  it('should score hypertensive crisis appropriately', () => {
    const crisisMetrics: HeartMetrics = {
      systolic: 195,
      diastolic: 118
    };

    const result = scoreRisk(crisisMetrics);
    
    expect(result.reasons.some(r => r.includes('Hypertensive crisis'))).toBe(true);
    expect(result.score).toBeGreaterThan(2);
  });
});
