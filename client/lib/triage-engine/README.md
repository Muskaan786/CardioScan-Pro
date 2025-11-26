# CardioScan Pro - Triage Engine

## Client-Side Cardiac Risk Assessment & Triage System

### 🏥 Purpose

The Triage Engine is a comprehensive, client-side medical analysis system that:
- Extracts cardiac metrics from medical reports
- Calculates weighted cardiovascular risk scores
- Categorizes risk levels (Normal, Low, Moderate, High)
- Provides urgency-based triage recommendations
- Generates actionable medical recommendations

**Key Feature:** All processing occurs locally in the browser. **No patient data is ever transmitted to external servers.**

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [Clinical Rationale](#clinical-rationale)
4. [Usage Examples](#usage-examples)
5. [API Reference](#api-reference)
6. [Testing](#testing)
7. [Integration with React UI](#integration-with-react-ui)
8. [Privacy & Security](#privacy--security)
9. [Medical Disclaimer](#medical-disclaimer)

---

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run example demonstration
npx ts-node lib/triage-engine/exampleRun.ts
```

### Basic Usage

```typescript
import { composeAnalysis } from './triage-engine/composeAnalysis';
import { HeartMetrics } from './triage-engine/types';

// Define patient metrics
const metrics: HeartMetrics = {
  age: 60,
  sex: 'male',
  systolic: 145,
  diastolic: 92,
  ldl: 165,
  ejectionFraction: 48,
  diabetes: true,
  smoker: false
};

// Run complete analysis
const analysis = composeAnalysis(metrics);

console.log(`Risk Category: ${analysis.category}`);
console.log(`Risk Score: ${analysis.score}`);
console.log(`Triage: ${analysis.triage}`);
console.log(`Recommendations:`, analysis.recommendations);
```

---

## 🏗️ Architecture

### Module Structure

```
triage-engine/
├── types.ts                # TypeScript type definitions
├── triageRules.ts         # Clinical thresholds and weights
├── scoreRisk.ts           # Risk scoring algorithm
├── confidence.ts          # Confidence estimation
├── categorize.ts          # Risk categorization
├── triage.ts              # Urgency recommendation engine
├── recommendations.ts     # Action recommendation generator
├── composeAnalysis.ts     # Main orchestrator
├── exampleRun.ts          # Demonstration script
├── index.ts               # Public API exports
└── __tests__/             # Test suite
    ├── scoreRisk.test.ts
    ├── categorize.test.ts
    └── composeAnalysis.test.ts
```

### Data Flow

```
Input: HeartMetrics
      ↓
[scoreRisk] → Raw Score + Reasons
      ↓
[categorizeRisk] → Category + Normalized %
      ↓
[estimateConfidence] → Confidence Score
      ↓
[getTriageRecommendation] → Urgency Level
      ↓
[generateRecommendations] → Action Items
      ↓
Output: HeartAnalysis
```

---

## 🩺 Clinical Rationale

### Risk Scoring Methodology

The engine uses a **weighted multi-factor risk assessment model** based on:

#### Primary Risk Factors (High Weight)
- **Ejection Fraction (Weight: 5)** - Strongest predictor of cardiac mortality
  - <35%: Severe dysfunction, immediate risk
  - 35-45%: Moderate dysfunction
  - 45-55%: Mildly reduced
  - ≥55%: Normal

- **Pulmonary Artery Pressure (Weight: 4)** - Right heart strain indicator
  - ≥60 mmHg: Severe pulmonary hypertension
  - 40-59 mmHg: Elevated

- **Blood Pressure (Weight: 3)** - Leading modifiable risk factor
  - ≥180/110: Hypertensive crisis
  - ≥140/90: Stage 2 hypertension
  - ≥130/80: Stage 1 hypertension

#### Secondary Risk Factors (Medium Weight)
- Diabetes (Weight: 3) - Doubles cardiovascular risk
- Age (Weight: 3) - Non-modifiable but strong predictor
- Smoking (Weight: 3) - Major modifiable factor
- LDL Cholesterol (Weight: 2.5) - Primary lipid target
- BMI (Weight: 2) - Obesity indicator

### Evidence Base

All thresholds and weights are derived from:
- **American Heart Association (AHA)** Guidelines
- **European Society of Cardiology (ESC)** Recommendations
- **ACC/AHA Cardiovascular Risk Assessment** Standards
- **Framingham Risk Score** Methodology
- **Seattle Heart Failure Model**

### Risk Categories

| Category | Risk % | Clinical Meaning | Action Timeline |
|----------|--------|------------------|-----------------|
| **High** | ≥80% | Multiple severe risk factors | Immediate (≤24 hrs) |
| **Moderate** | 50-79% | Significant factors present | 2-4 weeks |
| **Low** | 20-49% | Some risk factors | Annual monitoring |
| **Normal** | <20% | Minimal risk | Continue preventive care |

---

## 💻 Usage Examples

### Example 1: Normal Risk Patient

```typescript
const normalPatient: HeartMetrics = {
  age: 35,
  systolic: 118,
  diastolic: 75,
  ldl: 95,
  hdl: 60,
  ejectionFraction: 62,
  bmi: 22.5,
  smoker: false,
  diabetes: false
};

const analysis = composeAnalysis(normalPatient);

// Result:
// {
//   category: "Normal",
//   normalizedRiskPercent: 8.3,
//   confidence: 0.82,
//   triage: "MONITORING - Continue Current Care...",
//   recommendations: ["Continue preventive care...", ...]
// }
```

### Example 2: Moderate Risk Patient

```typescript
const moderatePatient: HeartMetrics = {
  age: 58,
  systolic: 152,
  diastolic: 94,
  ldl: 168,
  ejectionFraction: 48,
  bmi: 28.7,
  familyHistory: true
};

const analysis = composeAnalysis(moderatePatient);

// Result:
// {
//   category: "Moderate",
//   normalizedRiskPercent: 53.2,
//   triage: "MODERATE - Within 1-2 Weeks...",
//   recommendations: [
//     "Monitor blood pressure twice daily...",
//     "Schedule echocardiogram every 6-12 months...",
//     ...
//   ]
// }
```

### Example 3: Critical Patient (Emergency)

```typescript
const criticalPatient: HeartMetrics = {
  age: 68,
  systolic: 188,
  diastolic: 116,
  ejectionFraction: 28,
  pasp: 64,
  ldl: 195,
  fastingBloodSugar: 178,
  bmi: 32.4,
  smoker: true,
  diabetes: true
};

const analysis = composeAnalysis(criticalPatient);

// Result:
// {
//   category: "High",
//   normalizedRiskPercent: 89.7,
//   triage: "IMMEDIATE - Emergency Care Required...",
//   recommendations: [
//     "⚠️ IMMEDIATE: Seek emergency cardiac evaluation...",
//     "Call 911 or go to nearest emergency department...",
//     ...
//   ]
// }
```

### Example 4: Validation

```typescript
import { validateMetrics } from './composeAnalysis';

const metrics: HeartMetrics = {
  age: 150, // Invalid
  systolic: 300, // Invalid
  ejectionFraction: 120 // Invalid
};

const validation = validateMetrics(metrics);

console.log(validation.isValid); // false
console.log(validation.errors);
// [
//   "Invalid age: 150. Must be between 0 and 120.",
//   "Invalid systolic BP: 300. Typical range 60-250 mmHg.",
//   "Invalid ejection fraction: 120%. Must be between 10-100%."
// ]
```

### Example 5: Comparison (Tracking Progress)

```typescript
import { compareAnalyses } from './composeAnalysis';

const baseline = composeAnalysis(baselineMetrics);
const followup = composeAnalysis(followupMetrics);

const comparison = compareAnalyses(baseline, followup);

console.log(`Score Change: ${comparison.scoreChange}`);
console.log(`Category: ${comparison.categoryChange}`);
console.log('Improvements:', comparison.improvements);
console.log('Deteriorations:', comparison.deteriorations);
```

---

## 📚 API Reference

### Core Types

#### `HeartMetrics`
```typescript
type HeartMetrics = {
  // Demographics
  patientName?: string;
  age?: number;
  sex?: "male" | "female";
  
  // Vital Signs
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  
  // Lipid Panel
  cholesterol?: number;
  ldl?: number;
  hdl?: number;
  
  // Metabolic
  fastingBloodSugar?: number;
  bmi?: number;
  
  // Risk Factors
  smoker?: boolean;
  diabetes?: boolean;
  familyHistory?: boolean;
  
  // Echo Findings
  ejectionFraction?: number;
  lvef?: number;
  pasp?: number;
  trVelocity?: number;
  
  // Tests
  ecgResult?: string;
  stressTest?: string;
};
```

#### `HeartAnalysis`
```typescript
type HeartAnalysis = {
  score: number;                    // Raw risk score
  normalizedRiskPercent: number;    // 0-100 scale
  category: "High" | "Moderate" | "Low" | "Normal";
  confidence: number;               // 0-1
  reasons: string[];                // Human-readable explanations
  metrics: HeartMetrics;            // Original data
  parsedTextPreview?: string;       // Text excerpt
  triage: string;                   // Urgency recommendation
  recommendations: string[];        // Action items
};
```

### Main Functions

#### `composeAnalysis(metrics, textPreview?): HeartAnalysis`
**Primary function** - Performs complete cardiac risk analysis.

**Parameters:**
- `metrics: HeartMetrics` - Extracted cardiac parameters
- `textPreview?: string` - Optional text preview from source document

**Returns:** Complete `HeartAnalysis` object

**Example:**
```typescript
const analysis = composeAnalysis({
  age: 60,
  systolic: 145,
  ldl: 165,
  ejectionFraction: 48
});
```

#### `validateMetrics(metrics): ValidationResult`
Validates metrics for obvious errors before analysis.

**Returns:**
```typescript
{
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

#### `quickRiskAssessment(metrics): SimpleAssessment`
Lightweight version returning only score and category.

**Returns:**
```typescript
{
  score: number;
  category: string;
  normalizedRiskPercent: number;
}
```

#### `compareAnalyses(baseline, followup): Comparison`
Compares two analyses to track progress.

**Returns:**
```typescript
{
  scoreChange: number;
  categoryChange: string;
  riskPercentChange: number;
  improvements: string[];
  deteriorations: string[];
}
```

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test Suite

```bash
npm test -- scoreRisk.test.ts
npm test -- categorize.test.ts
npm test -- composeAnalysis.test.ts
```

### Test Coverage

The test suite includes:
- **Unit tests** for each scoring function
- **Integration tests** for complete analysis pipeline
- **Validation tests** for data integrity
- **Edge case tests** for boundary conditions

**Coverage Goals:**
- ✅ Core functions: >90% coverage
- ✅ Edge cases handled
- ✅ Invalid input validation
- ✅ Three sample cases (Normal, Moderate, Critical)

---

## ⚛️ Integration with React UI

### Example: Using in React Component

```typescript
// components/AnalysisDisplay.tsx
import { useState } from 'react';
import { composeAnalysis, validateMetrics } from '@/lib/triage-engine/composeAnalysis';
import { HeartMetrics, HeartAnalysis } from '@/lib/triage-engine/types';

export function AnalysisDisplay() {
  const [analysis, setAnalysis] = useState<HeartAnalysis | null>(null);

  const handleAnalyze = (metrics: HeartMetrics) => {
    // Validate first
    const validation = validateMetrics(metrics);
    if (!validation.isValid) {
      console.error('Validation errors:', validation.errors);
      return;
    }

    // Run analysis
    const result = composeAnalysis(metrics);
    setAnalysis(result);
  };

  if (!analysis) return <div>No analysis yet</div>;

  return (
    <div>
      <div className={`risk-${analysis.category.toLowerCase()}`}>
        <h2>Risk Category: {analysis.category}</h2>
        <p>Risk Score: {analysis.normalizedRiskPercent}%</p>
        <p>Confidence: {(analysis.confidence * 100).toFixed(0)}%</p>
      </div>

      <div className="triage">
        <h3>Triage Recommendation</h3>
        <p>{analysis.triage}</p>
      </div>

      <div className="recommendations">
        <h3>Recommendations</h3>
        <ul>
          {analysis.recommendations.slice(0, 5).map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ul>
      </div>

      <div className="reasons">
        <h3>Risk Factors Identified</h3>
        <ul>
          {analysis.reasons.map((reason, i) => (
            <li key={i}>{reason}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

### Styling Categories

```css
.risk-high {
  border-left: 4px solid #DC2626;
  background-color: #FEE2E2;
}

.risk-moderate {
  border-left: 4px solid #F59E0B;
  background-color: #FEF3C7;
}

.risk-low {
  border-left: 4px solid #3B82F6;
  background-color: #DBEAFE;
}

.risk-normal {
  border-left: 4px solid #10B981;
  background-color: #D1FAE5;
}
```

---

## 🔒 Privacy & Security

### Client-Side Processing

**All analysis occurs in the browser.**
- ✅ No API calls to external servers
- ✅ No patient data transmission
- ✅ No data persistence (unless user explicitly saves)
- ✅ HIPAA-compliant design principles

### Data Handling

```typescript
// ❌ NEVER do this (sends data to server)
fetch('/api/analyze', { method: 'POST', body: JSON.stringify(metrics) });

// ✅ DO this (processes locally)
const analysis = composeAnalysis(metrics);
```

### Security Best Practices

1. **No Persistent Storage:** Data exists only in memory during analysis
2. **Local Processing:** All computation in browser JavaScript engine
3. **No Logging:** Patient data never logged to console or analytics
4. **Isolated Execution:** No external dependencies for core logic

---

## ⚕️ Medical Disclaimer

### IMPORTANT NOTICE

**This system is for informational and educational purposes only.**

❗ **NOT A MEDICAL DEVICE:** This software has not been approved by FDA or any regulatory body as a medical device.

❗ **NOT MEDICAL ADVICE:** Output does not constitute medical diagnosis, treatment, or professional advice.

❗ **NOT A SUBSTITUTE:** Does not replace consultation with qualified healthcare professionals.

❗ **AUTOMATED ANALYSIS:** Results are generated by algorithms and may contain errors.

❗ **EMERGENCY:** In medical emergencies, call 911 or go to nearest emergency department. Do not rely solely on this analysis.

### Intended Use

- Educational tool for understanding cardiac risk factors
- Preliminary screening to identify parameters needing medical evaluation
- Supplement to (not replacement for) professional medical assessment

### User Responsibility

Users must:
1. Consult qualified healthcare providers for medical decisions
2. Verify all extracted metrics with original medical reports
3. Report symptoms or concerns to medical professionals promptly
4. Not alter prescribed treatments based solely on this analysis

### Liability Limitation

The creators, contributors, and distributors of this software:
- Disclaim all warranties, express or implied
- Accept no liability for medical outcomes
- Make no guarantees of accuracy or completeness
- Are not responsible for decisions made using this output

### Professional Use

Healthcare professionals using this tool must:
- Apply clinical judgment
- Verify all findings independently
- Follow established medical protocols
- Document decision-making processes

---

## 📖 Additional Resources

### Clinical Guidelines

- [AHA Cardiovascular Risk Assessment](https://www.heart.org/)
- [ESC Guidelines on Cardiovascular Disease Prevention](https://www.escardio.org/)
- [ACC/AHA Blood Pressure Guidelines](https://www.acc.org/)

### Cardiac Risk Calculators (Validation References)

- Framingham Risk Score
- ASCVD Risk Calculator
- Seattle Heart Failure Model
- QRISK3 Calculator

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional clinical guidelines integration
- Expanded test coverage
- Optimization for edge cases
- Internationalization (multi-language support)
- Accessibility enhancements

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

For technical issues or questions:
- Open GitHub issue
- Review test files for usage examples
- Check API documentation above

**For medical questions: Consult your healthcare provider.**

---

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Maintainer:** CardioScan Pro Team

---

*"Empowering informed healthcare decisions through transparent, evidence-based analysis."*
