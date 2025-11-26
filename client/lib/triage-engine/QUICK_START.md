# 🚀 Quick Start Guide - CardioScan Pro Triage Engine

## 30-Second Setup

### 1. Import the Engine
```typescript
import { composeAnalysis } from '@/lib/triage-engine';
import type { HeartMetrics } from '@/lib/triage-engine';
```

### 2. Prepare Your Data
```typescript
const patientMetrics: HeartMetrics = {
  age: 60,
  sex: 'male',
  systolic: 145,
  diastolic: 92,
  ldl: 165,
  ejectionFraction: 48,
  diabetes: true,
  smoker: false
};
```

### 3. Run Analysis
```typescript
const analysis = composeAnalysis(patientMetrics);
```

### 4. Use Results
```typescript
console.log(`Risk: ${analysis.category}`);
console.log(`Score: ${analysis.normalizedRiskPercent}%`);
console.log(`Urgency: ${analysis.triage}`);
console.log(`Recommendations:`, analysis.recommendations.slice(0, 3));
```

---

## 📱 React Component Example

```typescript
import { useState } from 'react';
import { composeAnalysis, validateMetrics } from '@/lib/triage-engine';
import type { HeartMetrics, HeartAnalysis } from '@/lib/triage-engine';

export function CardiacAnalysis() {
  const [analysis, setAnalysis] = useState<HeartAnalysis | null>(null);

  const handleAnalyze = (metrics: HeartMetrics) => {
    // Validate first
    const validation = validateMetrics(metrics);
    if (!validation.isValid) {
      alert(`Invalid data: ${validation.errors.join(', ')}`);
      return;
    }

    // Analyze
    const result = composeAnalysis(metrics);
    setAnalysis(result);
  };

  if (!analysis) return <div>Upload medical report to begin...</div>;

  return (
    <div className="space-y-6">
      {/* Risk Badge */}
      <div className={`p-4 rounded-lg bg-${analysis.category.toLowerCase()}`}>
        <h2 className="text-2xl font-bold">{analysis.category} Risk</h2>
        <p className="text-lg">{analysis.normalizedRiskPercent}% Risk Score</p>
        <p className="text-sm">Confidence: {(analysis.confidence * 100).toFixed(0)}%</p>
      </div>

      {/* Triage */}
      <div className="border-l-4 border-red-500 pl-4">
        <h3 className="font-semibold">Action Required:</h3>
        <p>{analysis.triage}</p>
      </div>

      {/* Top Recommendations */}
      <div>
        <h3 className="font-semibold mb-2">Top Recommendations:</h3>
        <ul className="space-y-2">
          {analysis.recommendations.slice(0, 5).map((rec, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Risk Factors */}
      <div>
        <h3 className="font-semibold mb-2">Risk Factors Detected:</h3>
        <ul className="space-y-1">
          {analysis.reasons.filter(r => r.includes('⚠️')).map((reason, i) => (
            <li key={i} className="text-sm text-gray-700">{reason}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

---

## 🎨 Styling (Tailwind CSS)

```css
/* Add to your global CSS */
.bg-high {
  @apply bg-red-100 border-red-500 text-red-900;
}

.bg-moderate {
  @apply bg-amber-100 border-amber-500 text-amber-900;
}

.bg-low {
  @apply bg-blue-100 border-blue-500 text-blue-900;
}

.bg-normal {
  @apply bg-green-100 border-green-500 text-green-900;
}
```

---

## 🧪 Test It

```bash
# Run the example demonstration
npx ts-node lib/triage-engine/exampleRun.ts

# Run all tests
npm test lib/triage-engine

# Test specific module
npm test -- scoreRisk.test.ts
```

---

## 📊 Sample Output

```json
{
  "score": 12.4,
  "normalizedRiskPercent": 53.2,
  "category": "Moderate",
  "confidence": 0.75,
  "triage": "MODERATE - Within 1-2 Weeks: Schedule follow-up...",
  "reasons": [
    "⚠️ Ejection Fraction = 48% (Mildly reduced) → +1.0 risk",
    "⚠️ Blood Pressure = 145/92 mmHg (Stage 1 hypertension) → +1.5 risk",
    "⚠️ LDL Cholesterol = 165 mg/dL (High) → +1.9 risk",
    "ℹ️ Age = 60 years (Moderate age-related risk) → +1.8 risk",
    "⚠️ Diabetes present → +3.0 risk"
  ],
  "recommendations": [
    "📊 Monitor blood pressure twice daily...",
    "🔬 Request lipid panel testing every 3-6 months...",
    "🏃 Aim for 150 minutes of moderate aerobic activity weekly...",
    "🍎 Follow Mediterranean or DASH diet pattern...",
    "💊 Take all prescribed medications as directed..."
  ]
}
```

---

## 🔧 Common Use Cases

### Use Case 1: File Upload Handler
```typescript
async function handleFileUpload(file: File) {
  // Extract metrics from file (using your existing OCR/PDF parser)
  const extractedText = await extractTextFromPDF(file);
  const metrics = parseMetricsFromText(extractedText);
  
  // Analyze
  const analysis = composeAnalysis(metrics, extractedText.substring(0, 500));
  
  // Display results
  displayResults(analysis);
}
```

### Use Case 2: Real-time Form Validation
```typescript
function handleFormChange(formData: Partial<HeartMetrics>) {
  // Validate as user types
  const validation = validateMetrics(formData as HeartMetrics);
  
  if (validation.warnings.length > 0) {
    showWarnings(validation.warnings);
  }
}
```

### Use Case 3: Progress Tracking
```typescript
function trackProgress(patientId: string) {
  const baseline = getBaselineAnalysis(patientId);
  const current = getCurrentAnalysis(patientId);
  
  const comparison = compareAnalyses(baseline, current);
  
  console.log(`Score changed by: ${comparison.scoreChange}`);
  console.log('Improvements:', comparison.improvements);
  console.log('Areas to address:', comparison.deteriorations);
}
```

---

## 🔒 Privacy Reminder

✅ All processing happens in the browser  
✅ No data sent to servers  
✅ No storage or tracking  
✅ HIPAA-compliant design  

```typescript
// ✅ GOOD - Client-side only
const analysis = composeAnalysis(metrics);

// ❌ BAD - Never do this
fetch('/api/analyze', { body: JSON.stringify(metrics) });
```

---

## ⚕️ Important Notice

**This tool is for educational and screening purposes only.**

- ❌ Not FDA-approved medical device
- ❌ Not a substitute for professional advice
- ❌ Not for emergency use without medical guidance
- ✅ Always consult healthcare professionals

---

## 📚 Next Steps

1. **Read Full Documentation:** `lib/triage-engine/README.md`
2. **Review Examples:** `lib/triage-engine/exampleRun.ts`
3. **Check Tests:** `lib/triage-engine/__tests__/`
4. **See Changelog:** `lib/triage-engine/CHANGELOG.md`

---

## 💡 Pro Tips

### Tip 1: Check Confidence
```typescript
if (analysis.confidence < 0.5) {
  console.log('Low confidence - recommend additional testing');
  console.log(getConfidenceImprovementSuggestions(metrics));
}
```

### Tip 2: Use Quick Assessment for Dashboards
```typescript
// Lighter version for list views
const quick = quickRiskAssessment(metrics);
console.log(`${quick.category} (${quick.normalizedRiskPercent}%)`);
```

### Tip 3: Generate Provider Summary
```typescript
// Create shareable summary for doctors
const summary = generateProviderSummary(analysis);
// Copy to clipboard or download as PDF
```

---

## 🆘 Troubleshooting

### Issue: TypeScript Errors
```bash
# Ensure tsconfig.json has strict mode
"strict": true
```

### Issue: Test Failures
```bash
# Install test dependencies
npm install -D vitest @vitest/ui
```

### Issue: Import Errors
```typescript
// Use correct path alias
import { composeAnalysis } from '@/lib/triage-engine';
// NOT from './triage-engine' (relative paths work too)
```

---

## 📞 Need Help?

- 📖 Full Docs: `README.md`
- 🧪 Test Examples: `__tests__/` directory
- 💻 Code Examples: `exampleRun.ts`
- ❓ Issues: Open GitHub issue

**For Medical Questions:** Consult your healthcare provider!

---

**You're all set! Start analyzing cardiac risk with confidence.** 🎉

```typescript
// Your first analysis in 3 lines:
import { composeAnalysis } from '@/lib/triage-engine';
const analysis = composeAnalysis({ age: 60, systolic: 140, ldl: 160 });
console.log(analysis.category); // "Moderate"
```

**Happy Coding! 🚀**
