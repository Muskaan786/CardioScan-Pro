/**
 * Tests for Categorization Module
 */

import { describe, it, expect } from 'vitest';
import { categorizeRisk, getCategoryDescription, getCategoryColor } from '../categorize';

describe('categorizeRisk', () => {
  it('should categorize low score as Normal', () => {
    const result = categorizeRisk(1.5);
    
    expect(result.category).toBe('Normal');
    expect(result.normalizedRiskPercent).toBeLessThan(20);
  });

  it('should categorize moderate score as Low', () => {
    const result = categorizeRisk(7);
    
    expect(result.category).toBe('Low');
    expect(result.normalizedRiskPercent).toBeGreaterThanOrEqual(20);
    expect(result.normalizedRiskPercent).toBeLessThan(50);
  });

  it('should categorize high score as Moderate', () => {
    const result = categorizeRisk(15);
    
    expect(result.category).toBe('Moderate');
    expect(result.normalizedRiskPercent).toBeGreaterThanOrEqual(50);
    expect(result.normalizedRiskPercent).toBeLessThan(80);
  });

  it('should categorize critical score as High', () => {
    const result = categorizeRisk(25);
    
    expect(result.category).toBe('High');
    expect(result.normalizedRiskPercent).toBeGreaterThanOrEqual(80);
  });

  it('should apply minimum risk floor of 5%', () => {
    const result = categorizeRisk(0);
    
    expect(result.normalizedRiskPercent).toBeGreaterThanOrEqual(5);
  });

  it('should cap normalized risk at 100%', () => {
    const result = categorizeRisk(1000);
    
    expect(result.normalizedRiskPercent).toBeLessThanOrEqual(100);
  });
});

describe('getCategoryDescription', () => {
  it('should return description for each category', () => {
    expect(getCategoryDescription('Normal')).toContain('Normal');
    expect(getCategoryDescription('Low')).toContain('Low');
    expect(getCategoryDescription('Moderate')).toContain('Moderate');
    expect(getCategoryDescription('High')).toContain('High');
  });
});

describe('getCategoryColor', () => {
  it('should return distinct colors for each category', () => {
    const colors = [
      getCategoryColor('Normal'),
      getCategoryColor('Low'),
      getCategoryColor('Moderate'),
      getCategoryColor('High')
    ];
    
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(4);
  });

  it('should return red for High category', () => {
    expect(getCategoryColor('High')).toContain('DC2626');
  });

  it('should return green for Normal category', () => {
    expect(getCategoryColor('Normal')).toContain('10B981');
  });
});
