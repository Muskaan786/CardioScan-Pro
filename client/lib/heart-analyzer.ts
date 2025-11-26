import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { composeAnalysis } from './triage-engine';
import type { HeartMetrics, HeartAnalysis } from './triage-engine/types';

// Re-export types for backwards compatibility
export type { HeartMetrics, HeartAnalysis };
export type Sex = "male" | "female";

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

export function extractMetricsFromText(text: string): HeartMetrics {
  console.log('=== HEART DISEASE ANALYSIS - EXTRACTING METRICS ===');
  console.log('Processing text length:', text.length);
  console.log('Full extracted text:', text);
  console.log('Sample text (first 500 chars):', text.substring(0, 500));
  
  const t = text.toLowerCase();
  const metrics: HeartMetrics = {};

  // Helper to find number after a keyword
  const findNumber = (patterns: RegExp[]): number | undefined => {
    for (const p of patterns) {
      const m = t.match(p);
      if (m) {
        // Clean up the number: remove commas, extra spaces, handle different decimal separators
        let numStr = m[1].replace(/,/g, ".").replace(/\s+/g, "").trim();
        const num = parseFloat(numStr);
        if (!Number.isNaN(num)) {
          console.log(`✓ Found number: ${num} using pattern: ${p}`);
          return num;
        }
      }
    }
    return undefined;
  };

  // Extract patient name
  console.log('--- Extracting Patient Name ---');
  const namePatterns = [
    /(?:patient|name|mr\.?|mrs\.?|ms\.?|dr\.?)\s*:?\s*([a-z\s\.]+)/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/m,
    /(mr\.?|mrs\.?|ms\.?|dr\.?)\s+([a-z\s\.]+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      let name = match[match.length - 1].trim();
      if (name.length > 2 && name.length < 50) {
        metrics.patientName = name.toUpperCase();
        console.log(`✓ Extracted name: ${metrics.patientName}`);
        break;
      }
    }
  }

  // Extract age and sex
  console.log('--- Extracting Age and Sex ---');
  
  // More flexible age patterns - handle OCR errors
  const agePatterns = [
    /(\d{2,3})y\/[mf]/i,  // Standard "29Y/M" format
    /[z](\d{1})y\/[mf]/i,  // "Z9Y/M" → extract as 29 (Z = 2)
    /(\d{1,3})\s*(?:y|yr|years?|y\/f|y\/m|year)/,
    /age\s*:?\s*(\d{1,3})/,
    /(\d{1,3})\s*years?\s*old/,
    /patient.*?(\d{1,3})\s*y/
  ];
  
  for (const pattern of agePatterns) {
    const ageMatch = t.match(pattern);
    if (ageMatch) {
      let age = parseInt(ageMatch[1]);
      
      // Fix OCR error: Z9 → 29
      if (ageMatch[0].toLowerCase().startsWith('z') && age < 10) {
        age = 20 + age; // Z9 → 29
        console.log(`✓ Fixed OCR error: ${ageMatch[0]} → ${age} years`);
      }
      
      if (age >= 1 && age <= 120) {
        metrics.age = age;
        console.log(`✓ Extracted age: ${age} using pattern: ${pattern}`);
        break;
      }
    }
  }

  // Extract sex - check for various formats
  if (/\d+y\/f/i.test(t) || t.includes('y/f') || t.includes('female') || t.includes('f/') || t.includes('mrs') || t.includes('ms.')) {
    metrics.sex = 'female';
    console.log('✓ Extracted sex: female');
  } else if (/\d+y\/m/i.test(t) || t.includes('y/m') || t.includes('male') || t.includes('m/') || t.includes('mr.') || t.includes('mr ')) {
    metrics.sex = 'male';
    console.log('✓ Extracted sex: male');
  }

  // Extract vital signs
  console.log('--- Extracting Vital Signs ---');
  
  // Enhanced blood pressure patterns
  const bpPatterns = [
    /(?:bp|blood pressure|systolic|diastolic).*?(\d{2,3})\/(\d{2,3})/,
    /(\d{2,3})\/(\d{2,3})\s*(?:mmhg|mm hg)/,
    /systolic.*?(\d{2,3}).*?diastolic.*?(\d{2,3})/,
    /pressure.*?(\d{2,3})\/(\d{2,3})/,
    /(\d{80,200})\/(\d{40,120})/  // Common BP ranges
  ];
  
  for (const pattern of bpPatterns) {
    const bpMatch = t.match(pattern);
    if (bpMatch) {
      const sys = parseInt(bpMatch[1]);
      const dia = parseInt(bpMatch[2]);
      if (sys >= 70 && sys <= 250 && dia >= 40 && dia <= 150) {
        metrics.systolic = sys;
        metrics.diastolic = dia;
        console.log(`✓ Blood pressure: ${sys}/${dia} using pattern: ${pattern}`);
        break;
      }
    }
  }

  // Heart rate
  const hrPatterns = [
    /(?:heart rate|hr|pulse).*?(\d{2,3})/,
    /(\d{2,3})\s*(?:bpm|beats)/
  ];
  metrics.heartRate = findNumber(hrPatterns);

  // Echo-specific measurements
  console.log('--- Extracting Echo-specific Values ---');
  
  // TR velocity and PASP (important for pulmonary hypertension)
  const trVelocityPatterns = [
    /tr velocity\s*\([^)]+\)\s*(\d{1,2}\.\d+)/,  // For "TR Velocity (MM) 2.4" format
    /tr velocity.*?(\d{1,2}\.\d)m?\/sec/,
    /peak tr velocity.*?(\d{1,2}\.\d)/,
    /trvelocity.*?(\d{1,2}\.\d+)/
  ];
  const trVelocity = findNumber(trVelocityPatterns);
  
  const paspPatterns = [
    /pasp\s*\([^)]+\)\s*(\d{1,3})/,  // For "PASP (MM) 35" format
    /pasp.*?(\d{1,3})\s*mmhg/,
    /epasp.*?(\d{1,3})\s*mmhg/,
    /pulmonary.*?pressure.*?(\d{1,3})/
  ];
  const pasp = findNumber(paspPatterns);
  
  if (trVelocity) {
    metrics.trVelocity = trVelocity; // STORE IT!
    console.log(`✓ TR velocity: ${trVelocity} m/sec`);
    // TR velocity can indicate pulmonary hypertension
    if (trVelocity > 2.8) {
      metrics.heartRate = 90; // Estimate elevated due to pulmonary pressure
    }
  }
  
  if (pasp) {
    metrics.pasp = pasp; // STORE IT!
    console.log(`✓ PASP: ${pasp} mmHg`);
    // Convert PASP to estimated systolic BP for analysis
    if (pasp > 35) {
      metrics.systolic = Math.max(140, pasp + 90); // Estimate systemic pressure
    }
  }

  // Additional Echo Parameters (IVSd, LVIDd, FS, LA Dimension, etc.)
  console.log('--- Extracting Additional Echo Parameters ---');
  
  // IVSd - Interventricular Septum thickness in diastole
  const ivsdPatterns = [
    /ivsd\s*\([^)]+\)\s*(\d{1,2}\.\d+)/,  // "IVSd (MM) 0.915" (with or without cm)
    /ivs[d]?\s*:?\s*(\d{1,2}\.\d+)/,
    /interventricular septum.*?(\d{1,2}\.\d+)/,
    /ivsd.*?(\d{1}\.\d{2,3})/,  // More flexible for OCR errors
  ];
  const ivsd = findNumber(ivsdPatterns);
  if (ivsd && ivsd >= 0.5 && ivsd <= 3.0) {  // Reasonable range for IVSd in cm
    (metrics as any).ivsd = ivsd;
    console.log(`✓ IVSd: ${ivsd} cm`);
  }

  // LVIDd - Left Ventricular Internal Diameter in diastole
  const lviddPatterns = [
    /lvid[do]\s*\([^)]+\)\s*(\d{1,2}\.\d+)/,  // "LVIDO (MM) 3.57" (with or without cm)
    /lvid[do]?\s*:?\s*(\d{1,2}\.\d+)/,
    /lv.*?internal.*?diameter.*?(\d{1,2}\.\d+)/,
    /lvido.*?(\d{1}\.\d{1,2})/,  // More flexible
  ];
  const lvidd = findNumber(lviddPatterns);
  if (lvidd && lvidd >= 2.0 && lvidd <= 7.0) {  // Reasonable range for LVIDd in cm
    (metrics as any).lvidd = lvidd;
    console.log(`✓ LVIDd: ${lvidd} cm`);
  }

  // Fractional Shortening (FS)
  const fsPatterns = [
    /fs\s*\([^)]+\)\s*(\d{1,3}\.\d+)%?/,  // "FS (MM Cubeid) 29.4%"
    /(?:^|\s)fs[\s:]*(\d{1,3}\.\d+)%?/,  // Simplified - just "FS 29.4" or "FS: 29.4"
    /fractional shortening.*?(\d{1,3}\.\d+)/,
    /fs.*?(\d{2}\.\d)%?/,  // More flexible
  ];
  const fs = findNumber(fsPatterns);
  if (fs && fs >= 10 && fs <= 50) {  // Reasonable range for FS in %
    (metrics as any).fractionalShortening = fs;
    console.log(`✓ Fractional Shortening: ${fs}%`);
  }

  // LA Dimension - Left Atrium size
  const laDimenPatterns = [
    /la dimen.*?(\d{1,2}\.\d+)\s*cm/,  // "LA Dimen 2.8 cm"
    /la\s*(?:dimension|size)\s*:?\s*(\d{1,2}\.\d+)/,
    /left atrium.*?(\d{1,2}\.\d+)\s*cm/
  ];
  const laDimen = findNumber(laDimenPatterns);
  if (laDimen) {
    (metrics as any).laDimension = laDimen;
    console.log(`✓ LA Dimension: ${laDimen} cm`);
  }

  // Ejection Fraction (Critical for cardiac assessment)
  console.log('--- Extracting Ejection Fraction ---');
  const efPatterns = [
    /ef\s*\([^)]+\)\s*(\d{2,3})%/,  // For "EF (AAC) 68%" format - require % sign and 2-3 digits
    /(?:^|\s)ef[\s:]*(\d{2,3})%/,  // Simplified - "EF 68%" - require % sign
    /ef\s*:?\s*>?\s*(\d{2,3})%/,  // Require % sign
    /ejection fraction\s*:?\s*>?\s*(\d{2,3})%?/,
    /lvef\s*:?\s*>?\s*(\d{2,3})%?/,
    /left ventricular ejection fraction\s*:?\s*>?\s*(\d{2,3})%?/,
    /ef:\s*>\s*(\d{2,3})/,
    /systolic function.*?ef.*?(\d{2,3})/,
    /ff\s*\([^)]+\)\s*(\d{2,3})%?/,  // "FF (40)" format (alternative notation)
    /\(aac\)\s*(\d{2,3})%/,  // Just look for "(AAC) 68%" pattern
    /ef\s*[-:]?\s*(\d{2,3})\s*%/  // Generic EF with %
  ];
  
  for (const pattern of efPatterns) {
    const match = t.match(pattern);
    if (match) {
      const ef = parseInt(match[1]);
      console.log(`  → Testing EF pattern ${pattern}: matched "${match[0]}", extracted value: ${ef}`);
      // Prefer values in normal range (40-80%) over abnormal ones
      if (ef >= 35 && ef <= 85) {
        // If we already have an EF and this one is in a better range, use it
        if (!metrics.ejectionFraction || (ef >= 45 && ef <= 75)) {
          metrics.ejectionFraction = ef;
          metrics.lvef = ef;
          console.log(`✓ Ejection Fraction: ${ef}% using pattern: ${pattern}`);
          if (ef >= 45 && ef <= 75) break; // Stop if we found a normal-range value
        }
      } else if (ef >= 10 && ef <= 35) {
        // Very low EF - only use if no better value found
        if (!metrics.ejectionFraction) {
          metrics.ejectionFraction = ef;
          metrics.lvef = ef;
          console.log(`✓ Ejection Fraction (Low): ${ef}% using pattern: ${pattern}`);
        }
      } else {
        console.log(`  ✗ Value ${ef} outside valid range (10-85)`);
      }
    }
  }
  
  if (!metrics.ejectionFraction) {
    console.log('⚠️ WARNING: Could not extract Ejection Fraction. Searching for EF-like patterns in text...');
    
    // Try to find any mention of EF in the text
    const efMention = t.match(/ef[^\d]*(\d{2,3})/);
    if (efMention) {
      let val = parseInt(efMention[1]);
      console.log(`  Found EF mention: "${efMention[0]}" with value ${val}`);
      
      // Fix OCR errors: 512 → 51, 682 → 68, etc.
      if (val > 100) {
        const valStr = val.toString();
        val = parseInt(valStr.substring(0, 2)); // Take first 2 digits
        console.log(`  → Fixed OCR error: converted ${valStr} to ${val}`);
      }
      
      if (val >= 35 && val <= 80) {
        metrics.ejectionFraction = val;
        metrics.lvef = val;
        console.log(`  ✓ Using fallback EF value: ${val}%`);
      }
    }
    
    // Also try FF pattern (alternative notation for EF in some reports)
    const ffMatch = t.match(/ff\s*\([^)]+\)\s*(\d{2,3})/);
    if (ffMatch && !metrics.ejectionFraction) {
      let val = parseInt(ffMatch[1]);
      console.log(`  Found FF (Fractional Function) mention: "${ffMatch[0]}" with value ${val}`);
      
      // FF could be 40, 45, 50, etc.
      if (val >= 35 && val <= 80) {
        metrics.ejectionFraction = val;
        metrics.lvef = val;
        console.log(`  ✓ Using FF as EF value: ${val}%`);
      }
    }
  }

  // Cholesterol levels
  console.log('--- Extracting Cholesterol ---');
  const cholesterolPatterns = [
    /(?:total cholesterol|cholesterol|tc)\s*:?\s*(\d{2,4})/,
    /cholesterol\s*[-:]?\s*(\d{2,4})\s*(?:mg\/dl|mg)?/,
    /tc\s*:?\s*(\d{2,4})/
  ];
  metrics.cholesterol = findNumber(cholesterolPatterns);

  const ldlPatterns = [
    /ldl\s*:?\s*(\d{1,4})/,
    /low density\s*:?\s*(\d{1,4})/,
    /ldl.*?(\d{1,4})\s*(?:mg\/dl|mg)?/
  ];
  metrics.ldl = findNumber(ldlPatterns);

  const hdlPatterns = [
    /hdl\s*:?\s*(\d{1,4})/,
    /high density\s*:?\s*(\d{1,4})/,
    /hdl.*?(\d{1,4})\s*(?:mg\/dl|mg)?/
  ];
  metrics.hdl = findNumber(hdlPatterns);

  // Blood sugar
  const sugarPatterns = [
    /(?:fasting glucose|fbs|blood sugar|glucose|sugar)\s*:?\s*(\d{2,4})/,
    /glucose\s*[-:]?\s*(\d{2,4})\s*(?:mg\/dl|mg)?/,
    /hba1c\s*:?\s*(\d{1,2}\.?\d?)/,
    /random glucose\s*:?\s*(\d{2,4})/
  ];
  metrics.fastingBloodSugar = findNumber(sugarPatterns);

  // BMI and obesity metrics
  console.log('--- Extracting Obesity Metrics ---');
  const bmiPatterns = [
    /bmi\s*:?\s*(\d{1,2}\.?\d?)/,
    /body mass index\s*:?\s*(\d{1,2}\.?\d?)/,
    /weight.*?(\d{1,2}\.\d)\s*(?:kg\/m|bmi)/
  ];
  metrics.bmi = findNumber(bmiPatterns);

  // BSA - Body Surface Area
  const bsaPatterns = [
    /bsa\s*:?\s*(\d{1,2}\.\d+)/,
    /body surface area\s*:?\s*(\d{1,2}\.\d+)/,
    /bsa.*?(\d{1,2}\.\d+)\s*m/
  ];
  const bsa = findNumber(bsaPatterns);
  if (bsa) {
    (metrics as any).bsa = bsa;
    console.log(`✓ BSA: ${bsa} m²`);
  }

  // Extract height and weight to calculate BMI if not provided
  const heightPatterns = [
    /height\s*:?\s*(\d{2,3})\s*(?:cm|centimeters?)/,
    /ht\s*:?\s*(\d{2,3})\s*cm/,
    /(\d{2,3})\s*cm.*?tall/
  ];
  const heightCm = findNumber(heightPatterns);
  if (heightCm) {
    metrics.height = heightCm;
    console.log(`✓ Height: ${heightCm} cm`);
  }

  const weightPatterns = [
    /weight\s*:?\s*(\d{2,3}\.?\d?)\s*(?:kg|kilograms?)/,
    /wt\s*:?\s*(\d{2,3}\.?\d?)\s*kg/,
    /body weight\s*:?\s*(\d{2,3}\.?\d?)/
  ];
  const weightKg = findNumber(weightPatterns);
  if (weightKg) {
    metrics.weight = weightKg;
    console.log(`✓ Weight: ${weightKg} kg`);
  }

  // Calculate BMI if height and weight are available but BMI isn't
  if (!metrics.bmi && heightCm && weightKg) {
    const heightM = heightCm / 100;
    metrics.bmi = weightKg / (heightM * heightM);
    console.log(`✓ Calculated BMI: ${metrics.bmi.toFixed(1)} from H:${heightCm}cm W:${weightKg}kg`);
  }

  // Waist circumference (important for obesity assessment)
  const waistPatterns = [
    /waist\s*(?:circumference)?\s*:?\s*(\d{2,3})\s*(?:cm|centimeters?)/,
    /waist\s*:?\s*(\d{2,3})\s*cm/,
    /wc\s*:?\s*(\d{2,3})/
  ];
  const waistCm = findNumber(waistPatterns);
  if (waistCm) {
    metrics.waist = waistCm;
    console.log(`✓ Waist circumference: ${waistCm} cm`);
  }

  // Risk factors
  console.log('--- Extracting Risk Factors ---');
  metrics.smoker = /(?:smoker|smoking|tobacco)/.test(t) && !/(?:non|no|never).*(?:smoker|smoking)/.test(t);
  metrics.diabetes = /diabetes|diabetic/.test(t) && !/no.*diabetes/.test(t);
  metrics.familyHistory = /family history|hereditary|genetic/.test(t);

  // ECG findings and cardiac conditions
  console.log('--- Extracting Cardiac Conditions ---');
  
  // Look for specific cardiac findings
  const cardiacAbnormalities = [];
  
  if (/severe.*(?:ar|aortic regurgitation)/i.test(t)) {
    cardiacAbnormalities.push('Severe Aortic Regurgitation');
    metrics.ecgResult = 'Abnormal';
  }
  
  if (/mild.*(?:mr|mitral regurgitation)/i.test(t)) {
    cardiacAbnormalities.push('Mild Mitral Regurgitation');
  }
  
  if (/mild.*(?:tr|tricuspid regurgitation)/i.test(t)) {
    cardiacAbnormalities.push('Mild Tricuspid Regurgitation');
  }
  
  if (/dilated.*lv|lv.*dilated/i.test(t)) {
    cardiacAbnormalities.push('Dilated Left Ventricle');
  }
  
  if (/calcified.*valve|valve.*calcification/i.test(t)) {
    cardiacAbnormalities.push('Valve Calcification');
  }
  
  // Store cardiac abnormalities for scoring
  (metrics as any).cardiacAbnormalities = cardiacAbnormalities;
  
  if (/normal.*rhythm|sinus rhythm|regular.*rhythm/i.test(t)) {
    metrics.ecgResult = 'Normal';
  } else if (cardiacAbnormalities.length > 0 || /abnormal|arrhythmia|irregular|afib/i.test(t)) {
    metrics.ecgResult = 'Abnormal';
  }
  
  console.log('✓ Cardiac abnormalities found:', cardiacAbnormalities);

  console.log('=== FINAL EXTRACTED METRICS ===');
  console.log(JSON.stringify(metrics, null, 2));
  
  // FALLBACK: Try to extract EF if we still don't have it
  if (!metrics.ejectionFraction && !metrics.lvef) {
    console.log('--- FALLBACK: Trying aggressive EF extraction ---');
    // Look for any percentage between 30-80 that might be EF
    const percentages = text.match(/(\d{2,3})\s*%/g);
    if (percentages) {
      console.log('Found percentages:', percentages);
      
      // Prioritize percentages in the EF range (45-75%)
      const candidates = [];
      for (const p of percentages) {
        const val = parseInt(p);
        if (val >= 35 && val <= 80) {
          const idx = text.toLowerCase().indexOf(p.toLowerCase());
          const before = text.substring(Math.max(0, idx - 50), idx).toLowerCase();
          const after = text.substring(idx, Math.min(text.length, idx + 20)).toLowerCase();
          
          // Score this percentage based on context
          let score = 0;
          if (before.includes('ef') || after.includes('ef')) score += 10;
          if (before.includes('aac') || before.includes('a4c')) score += 8;
          if (before.includes('ejection')) score += 10;
          if (val >= 45 && val <= 75) score += 5; // Normal range bonus
          if (before.includes('fs')) score -= 5; // Fractional shortening, not EF
          
          console.log(`  Candidate: ${val}% (score: ${score}, context: "${before.slice(-20)}${p}")`);
          candidates.push({ val, score });
        }
      }
      
      // Use the highest scoring candidate
      if (candidates.length > 0) {
        candidates.sort((a, b) => b.score - a.score);
        const best = candidates[0];
        if (best.score > 0) {
          metrics.ejectionFraction = best.val;
          metrics.lvef = best.val;
          console.log(`✓ FALLBACK: Extracted EF = ${best.val}% (score: ${best.score})`);
        }
      }
    }
  }
  
  // If we didn't find much data, let's do a comprehensive search for any medical-looking numbers
  if (Object.keys(metrics).length < 3) {
    console.log('--- BACKUP: Searching for any medical-looking patterns ---');
    
    // Look for any numbers that might be medical values
    const allNumbers = text.match(/\d+\.?\d*/g);
    if (allNumbers) {
      console.log('All numbers found in text:', allNumbers);
      
      // Try to infer values based on common medical ranges
      for (const num of allNumbers) {
        const value = parseFloat(num);
        
        // Blood pressure ranges
        if (value >= 90 && value <= 200 && !metrics.systolic) {
          metrics.systolic = value;
          console.log(`Inferred systolic BP: ${value}`);
        }
        if (value >= 50 && value <= 120 && !metrics.diastolic && value < (metrics.systolic || 999)) {
          metrics.diastolic = value;
          console.log(`Inferred diastolic BP: ${value}`);
        }
        
        // Age range
        if (value >= 18 && value <= 100 && !metrics.age) {
          metrics.age = value;
          console.log(`Inferred age: ${value}`);
        }
        
        // Cholesterol ranges
        if (value >= 120 && value <= 400 && !metrics.cholesterol) {
          metrics.cholesterol = value;
          console.log(`Inferred cholesterol: ${value}`);
        }
        
        // Heart rate
        if (value >= 50 && value <= 150 && !metrics.heartRate) {
          metrics.heartRate = value;
          console.log(`Inferred heart rate: ${value}`);
        }
      }
    }
  }
  
  return metrics;
}

export function scoreRisk(metrics: HeartMetrics): Omit<HeartAnalysis, "metrics"> {
  console.log('=== CALCULATING RISK SCORE ===');
  let score = 0;
  let confidence = 0;
  const reasons: string[] = [];
  const recommendations: string[] = [];

  // Age scoring (major factor)
  if (metrics.age !== undefined) {
    confidence += 0.2;
    if (metrics.age > 65) {
      score += 3;
      reasons.push(`Advanced age (${metrics.age} years) increases cardiovascular risk`);
      recommendations.push('Regular cardiac monitoring recommended for seniors');
    } else if (metrics.age > 45) {
      score += 1.5;
      reasons.push(`Age ${metrics.age} years - moderate risk factor`);
      recommendations.push('Annual cardiac health checkups recommended');
    }
  }

  // Sex-specific risk
  if (metrics.sex === 'male') {
    score += 1;
    confidence += 0.1;
    reasons.push('Male gender increases cardiovascular risk');
  }

  // Ejection Fraction (Critical cardiac parameter)
  if (metrics.ejectionFraction !== undefined || metrics.lvef !== undefined) {
    const ef = metrics.ejectionFraction || metrics.lvef!;
    confidence += 0.3;
    
    if (ef < 40) {
      score += 4;
      reasons.push(`Severely reduced ejection fraction (${ef}%) - indicates heart failure`);
      recommendations.push('🚨 URGENT: Consult cardiologist immediately for heart failure management');
      recommendations.push('Consider ACE inhibitors, beta-blockers, and lifestyle modifications');
    } else if (ef < 50) {
      score += 2.5;
      reasons.push(`Mildly reduced ejection fraction (${ef}%) - indicates mild cardiac dysfunction`);
      recommendations.push('⚠️ Follow up with cardiologist within 2-4 weeks');
      recommendations.push('Consider cardiac rehabilitation program');
    } else if (ef >= 55) {
      score -= 0.5;
      reasons.push(`Normal ejection fraction (${ef}%) - good cardiac function`);
      recommendations.push('✅ Excellent cardiac function - maintain current lifestyle');
    }
  }

  // Blood pressure assessment
  if (metrics.systolic !== undefined && metrics.diastolic !== undefined) {
    confidence += 0.2;
    
    if (metrics.systolic >= 180 || metrics.diastolic >= 110) {
      score += 3;
      reasons.push(`Severely high blood pressure (${metrics.systolic}/${metrics.diastolic})`);
      recommendations.push('🚨 URGENT: Seek immediate medical attention for hypertensive crisis');
    } else if (metrics.systolic >= 140 || metrics.diastolic >= 90) {
      score += 2;
      reasons.push(`High blood pressure (${metrics.systolic}/${metrics.diastolic})`);
      recommendations.push('Start or adjust blood pressure medications');
      recommendations.push('Reduce sodium intake, increase exercise');
    } else if (metrics.systolic <= 120 && metrics.diastolic <= 80) {
      score -= 0.5;
      reasons.push(`Optimal blood pressure (${metrics.systolic}/${metrics.diastolic})`);
      recommendations.push('✅ Excellent blood pressure - maintain healthy habits');
    }
  }

  // Cholesterol assessment
  if (metrics.cholesterol !== undefined) {
    confidence += 0.15;
    if (metrics.cholesterol > 240) {
      score += 2;
      reasons.push(`High cholesterol (${metrics.cholesterol} mg/dL)`);
      recommendations.push('Consider statin therapy and dietary changes');
    } else if (metrics.cholesterol < 200) {
      score -= 0.3;
      reasons.push(`Good cholesterol level (${metrics.cholesterol} mg/dL)`);
    }
  }

  // LDL assessment
  if (metrics.ldl !== undefined) {
    confidence += 0.1;
    if (metrics.ldl > 160) {
      score += 1.5;
      reasons.push(`High LDL cholesterol (${metrics.ldl} mg/dL)`);
      recommendations.push('Target LDL <100 mg/dL (or <70 if high risk)');
    }
  }

  // Risk factors
  if (metrics.diabetes) {
    score += 2.5;
    confidence += 0.1;
    reasons.push('Diabetes significantly increases cardiovascular risk');
    recommendations.push('Maintain HbA1c <7%, monitor cardiac health closely');
  }

  if (metrics.smoker) {
    score += 2;
    confidence += 0.1;
    reasons.push('Smoking dramatically increases heart disease risk');
    recommendations.push('🚭 CRITICAL: Quit smoking immediately - reduces risk by 50% within 1 year');
  }

  if (metrics.familyHistory) {
    score += 1;
    confidence += 0.05;
    reasons.push('Family history increases genetic predisposition');
    recommendations.push('Earlier and more frequent cardiac screening recommended');
  }

  // Cardiac abnormalities from Echo/cardiac reports
  const cardiacAbnormalities = (metrics as any).cardiacAbnormalities || [];
  if (cardiacAbnormalities.length > 0) {
    confidence += 0.4; // High confidence from cardiac imaging
    
    // Score based on severity and number of abnormalities
    if (cardiacAbnormalities.some((a: string) => a.toLowerCase().includes('severe'))) {
      score += 3;
      reasons.push(`Severe cardiac abnormalities detected: ${cardiacAbnormalities.join(', ')}`);
      recommendations.push('🚨 URGENT: Immediate cardiology consultation required');
      recommendations.push('Monitor for symptoms: chest pain, shortness of breath, fatigue');
    } else if (cardiacAbnormalities.length > 2) {
      score += 2;
      reasons.push(`Multiple cardiac abnormalities: ${cardiacAbnormalities.join(', ')}`);
      recommendations.push('⚠️ Schedule cardiology follow-up within 2-4 weeks');
    } else {
      score += 1;
      reasons.push(`Cardiac abnormalities detected: ${cardiacAbnormalities.join(', ')}`);
      recommendations.push('Regular cardiac monitoring recommended');
    }
  }

  // Heart rate assessment
  if (metrics.heartRate !== undefined) {
    confidence += 0.1;
    if (metrics.heartRate > 100) {
      score += 1;
      reasons.push(`Elevated resting heart rate (${metrics.heartRate} bpm)`);
      recommendations.push('Investigate causes of tachycardia');
    } else if (metrics.heartRate < 60 && !reasons.some(r => r.includes('athlete'))) {
      score += 0.5;
      reasons.push(`Low heart rate (${metrics.heartRate} bpm) - may indicate bradycardia`);
    }
  }

  // Calculate final assessment
  const normalizedRiskPercent = Math.min(100, Math.max(5, (score / 15) * 100)); // Minimum 5% to show some activity
  let category: "High" | "Moderate" | "Low" | "Normal";

  if (score >= 8) {
    category = "High";
    recommendations.unshift('🚨 HIGH RISK: Schedule immediate cardiac evaluation');
    recommendations.push('Consider comprehensive cardiac testing (stress test, echocardiogram)');
  } else if (score >= 4) {
    category = "Moderate";
    recommendations.unshift('⚠️ MODERATE RISK: Schedule cardiac consultation within 2-4 weeks');
    recommendations.push('Consider preventive medications and lifestyle modifications');
  } else if (score >= 1) {
    category = "Low";
    recommendations.unshift('✅ LOW RISK: Continue preventive care');
    recommendations.push('Annual cardiac screening and healthy lifestyle maintenance');
  } else {
    category = "Normal";
    recommendations.unshift('✅ NORMAL: Based on available data');
    recommendations.push('Get comprehensive cardiac screening for complete assessment');
  }

  // Add data quality assessment
  if (confidence < 0.3) {
    recommendations.unshift('⚠️ LIMITED DATA: Analysis based on minimal information');
    recommendations.push('');
    recommendations.push('📋 Recommended Medical Tests to Get:');
    recommendations.push('• Blood pressure measurement');
    recommendations.push('• Complete lipid panel (Total cholesterol, LDL, HDL)');
    recommendations.push('• Fasting blood glucose test');
    recommendations.push('• ECG (Electrocardiogram)');
    recommendations.push('• Echocardiogram if over 40 or family history');
  }

  // General recommendations for all patients
  recommendations.push('');
  recommendations.push('🏥 General Heart Health Recommendations:');
  recommendations.push('• Exercise: 150 minutes moderate aerobic activity weekly');
  recommendations.push('• Diet: Mediterranean diet with reduced sodium (<2.3g/day)');
  recommendations.push('• Weight: Maintain BMI 18.5-24.9');
  recommendations.push('• Sleep: 7-9 hours quality sleep nightly');
  recommendations.push('• Stress: Practice stress management techniques');

  console.log(`Final risk assessment: ${category} (${normalizedRiskPercent.toFixed(1)}%)`);
  console.log('Recommendations:', recommendations);

  return {
    score,
    normalizedRiskPercent,
    category,
    confidence: Math.min(1, confidence),
    reasons,
    recommendations: {
      items: recommendations.map(text => ({
        text,
        category: 'General',
        priority: text.includes('⚠️ IMMEDIATE') ? 'urgent' as const : text.includes('📊') ? 'high' as const : 'medium' as const
      })),
      priorityRecommendations: [],
      categorizedRecommendations: {},
      disclaimer: 'This analysis is for informational purposes only and does not constitute medical advice.'
    }
  };
}

async function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas with 2x size for better quality
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Scale up for better OCR
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        
        // Draw with smoothing disabled for sharper text
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Apply contrast enhancement
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          // Increase contrast
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const contrast = 1.5;
          data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128));
          data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128));
          data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128));
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function extractTextFromImage(file: File): Promise<string> {
  console.log('=== STARTING OCR ANALYSIS ===');
  console.log(`Processing file: ${file.name} (${file.size} bytes)`);
  
  try {
    console.log('Preprocessing image for better OCR accuracy...');
    const preprocessedImage = await preprocessImage(file);
    
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    
    // Configure Tesseract for medical document OCR
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,:;/-()%[] ',
      preserve_interword_spaces: '1',
    });
    
    console.log('OCR worker initialized with medical document settings...');
    const { data: { text } } = await worker.recognize(preprocessedImage);
    
    await worker.terminate();
    
    console.log('✓ OCR completed successfully');
    console.log(`Extracted text length: ${text.length} characters`);
    console.log('Text preview:', text.substring(0, 500));
    console.log('Full extracted text:', text);
    
    return text;
  } catch (error) {
    console.error('❌ OCR failed:', error);
    throw new Error(`OCR processing failed: ${error}`);
  }
}

export async function extractTextFromPDF(file: File): Promise<string> {
  console.log('=== STARTING PDF ANALYSIS ===');
  console.log(`Processing PDF: ${file.name} (${file.size} bytes)`);
  
  try {
    // Set the worker source for PDF.js - use the correct version
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.149/build/pdf.worker.mjs`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    console.log(`PDF loaded with ${pdf.numPages} pages`);
    
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${pdf.numPages}`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    console.log('✓ PDF text extraction completed');
    console.log(`Extracted text length: ${fullText.length} characters`);
    console.log('Text preview:', fullText.substring(0, 500));
    
    return fullText;
  } catch (error) {
    console.error('❌ PDF extraction failed:', error);
    throw new Error(`PDF processing failed: ${error}`);
  }
}

export async function analyzeFile(file: File): Promise<HeartAnalysis> {
  console.log('=== HEART DISEASE ANALYSIS STARTED ===');
  console.log(`Analyzing file: ${file.name}, type: ${file.type}, size: ${file.size}`);
  
  let text: string;
  let parsedTextPreview: string | undefined;

  if (file.type.startsWith('image/')) {
    console.log('📷 Image detected - using OCR');
    text = await extractTextFromImage(file);
    parsedTextPreview = text.substring(0, 1000);
  } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    console.log('📄 PDF detected - extracting text');
    text = await extractTextFromPDF(file);
    parsedTextPreview = text.substring(0, 1000);
  } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    console.log('📄 Text file detected');
    text = await file.text();
    parsedTextPreview = text.substring(0, 1000);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF, image (PNG, JPG), or text file (.txt)');
  }

  if (!text || text.trim().length < 10) {
    throw new Error('No meaningful text found in the file. Please ensure the file contains medical information.');
  }

  console.log('✓ Text extraction successful');
  
  const metrics = extractMetricsFromText(text);
  
  // If OCR failed badly (extracted < 3 useful metrics), show helpful message
  const extractedCount = Object.keys(metrics).filter(k => 
    !['smoker', 'diabetes', 'familyHistory', 'ecgResult', 'cardiacAbnormalities', 'patientName'].includes(k)
  ).length;
  
  if (extractedCount < 2) {
    console.warn('⚠️ OCR extracted very little useful data. Consider:');
    console.warn('  1. Using a higher resolution scan');
    console.warn('  2. Ensuring good lighting and contrast');
    console.warn('  3. Uploading a PDF instead of image');
    console.warn('  4. Manually entering the data');
  }
  
  // Use new comprehensive triage engine
  const analysis = composeAnalysis(metrics, parsedTextPreview);

  console.log('=== ANALYSIS COMPLETE ===');
  console.log(`Final diagnosis: ${analysis.category} risk (${analysis.normalizedRiskPercent}%)`);
  console.log(`Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
  console.log(`Triage level: ${analysis.triage?.level} - ${analysis.triage?.priority}`);
  
  return analysis;
}
