/**
 * Example Run - Demonstration of Triage Engine
 * 
 * This file demonstrates the triage engine with three sample cases:
 * 1. Normal - Low risk patient
 * 2. Moderate - Patient with multiple risk factors
 * 3. High/Critical - Patient requiring immediate attention
 * 
 * Run this file to see sample outputs:
 * ts-node exampleRun.ts
 */

import { composeAnalysis, validateMetrics, generateProviderSummary } from './composeAnalysis';
import { HeartMetrics } from './types';

console.log('═══════════════════════════════════════════════════════');
console.log('   CARDIOSCAN PRO - TRIAGE ENGINE DEMONSTRATION');
console.log('═══════════════════════════════════════════════════════\n');

// CASE 1: NORMAL - Low Risk Patient
console.log('📋 CASE 1: NORMAL RISK PATIENT\n');
console.log('Profile: 30-year-old active male, regular checkup\n');

const normalCase: HeartMetrics = {
  patientName: 'John Smith',
  age: 30,
  sex: 'male',
  systolic: 118,
  diastolic: 76,
  cholesterol: 175,
  ldl: 95,
  hdl: 58,
  fastingBloodSugar: 88,
  bmi: 23.5,
  ejectionFraction: 62,
  heartRate: 68,
  smoker: false,
  diabetes: false,
  familyHistory: false
};

const normalAnalysis = composeAnalysis(normalCase, 'Sample normal patient report...');
console.log('ANALYSIS RESULTS:');
console.log(JSON.stringify(normalAnalysis, null, 2));
console.log('\n' + '─'.repeat(80) + '\n');

// CASE 2: MODERATE - Multiple Risk Factors
console.log('📋 CASE 2: MODERATE RISK PATIENT\n');
console.log('Profile: 58-year-old with hypertension and high cholesterol\n');

const moderateCase: HeartMetrics = {
  patientName: 'Mary Johnson',
  age: 58,
  sex: 'female',
  systolic: 152,
  diastolic: 94,
  cholesterol: 245,
  ldl: 168,
  hdl: 42,
  fastingBloodSugar: 115,
  bmi: 28.7,
  ejectionFraction: 48,
  heartRate: 82,
  smoker: false,
  diabetes: false,
  familyHistory: true
};

const moderateAnalysis = composeAnalysis(moderateCase, 'Echo report showing mildly reduced EF...');
console.log('ANALYSIS RESULTS:');
console.log(JSON.stringify(moderateAnalysis, null, 2));
console.log('\n' + '─'.repeat(80) + '\n');

// CASE 3: HIGH/CRITICAL - Immediate Attention Required
console.log('📋 CASE 3: HIGH RISK / CRITICAL PATIENT\n');
console.log('Profile: 68-year-old with severe cardiac dysfunction and crisis BP\n');

const criticalCase: HeartMetrics = {
  patientName: 'Robert Williams',
  age: 68,
  sex: 'male',
  systolic: 188,
  diastolic: 116,
  cholesterol: 285,
  ldl: 195,
  hdl: 32,
  fastingBloodSugar: 178,
  bmi: 32.4,
  ejectionFraction: 28,
  heartRate: 108,
  pasp: 64,
  trVelocity: 3.6,
  smoker: true,
  diabetes: true,
  familyHistory: true
};

const criticalAnalysis = composeAnalysis(criticalCase, 'Echo: Severely reduced LV systolic function...');
console.log('ANALYSIS RESULTS:');
console.log(JSON.stringify(criticalAnalysis, null, 2));
console.log('\n' + '─'.repeat(80) + '\n');

// SUMMARY COMPARISON
console.log('📊 SUMMARY COMPARISON\n');
console.log('┌─────────────────┬──────────┬───────────────┬────────────┬─────────────┐');
console.log('│ Patient         │ Category │ Risk %        │ Score      │ Confidence  │');
console.log('├─────────────────┼──────────┼───────────────┼────────────┼─────────────┤');
console.log(`│ Case 1 (Normal) │ ${normalAnalysis.category.padEnd(8)} │ ${String(normalAnalysis.normalizedRiskPercent).padEnd(13)} │ ${String(normalAnalysis.score).padEnd(10)} │ ${String((normalAnalysis.confidence * 100).toFixed(0) + '%').padEnd(11)} │`);
console.log(`│ Case 2 (Mod)    │ ${moderateAnalysis.category.padEnd(8)} │ ${String(moderateAnalysis.normalizedRiskPercent).padEnd(13)} │ ${String(moderateAnalysis.score).padEnd(10)} │ ${String((moderateAnalysis.confidence * 100).toFixed(0) + '%').padEnd(11)} │`);
console.log(`│ Case 3 (Crit)   │ ${criticalAnalysis.category.padEnd(8)} │ ${String(criticalAnalysis.normalizedRiskPercent).padEnd(13)} │ ${String(criticalAnalysis.score).padEnd(10)} │ ${String((criticalAnalysis.confidence * 100).toFixed(0) + '%').padEnd(11)} │`);
console.log('└─────────────────┴──────────┴───────────────┴────────────┴─────────────┘\n');

// TRIAGE RECOMMENDATIONS
console.log('🚨 TRIAGE RECOMMENDATIONS\n');
console.log('Case 1 (Normal):');
console.log(`  ${normalAnalysis.triage}\n`);
console.log('Case 2 (Moderate):');
console.log(`  ${moderateAnalysis.triage}\n`);
console.log('Case 3 (Critical):');
console.log(`  ${criticalAnalysis.triage}\n`);

// PROVIDER SUMMARY (Case 3 only)
console.log('═'.repeat(80));
console.log('PROVIDER SUMMARY - CASE 3 (CRITICAL)\n');
console.log(generateProviderSummary(criticalAnalysis));
console.log('═'.repeat(80));

// VALIDATION EXAMPLE
console.log('\n🔍 VALIDATION EXAMPLE\n');
const invalidMetrics: HeartMetrics = {
  age: 150, // Invalid
  systolic: 300, // Invalid
  ejectionFraction: 150 // Invalid
};

const validation = validateMetrics(invalidMetrics);
console.log('Validation Result:', validation.isValid ? 'PASS' : 'FAIL');
if (validation.errors.length > 0) {
  console.log('\nErrors:');
  validation.errors.forEach(err => console.log(`  ❌ ${err}`));
}
if (validation.warnings.length > 0) {
  console.log('\nWarnings:');
  validation.warnings.forEach(warn => console.log(`  ⚠️  ${warn}`));
}

console.log('\n═══════════════════════════════════════════════════════');
console.log('   END OF DEMONSTRATION');
console.log('═══════════════════════════════════════════════════════\n');
console.log('💡 All processing completed client-side. No data transmitted.\n');
