import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Info, Heart } from 'lucide-react';

export function BMICalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [result, setResult] = useState<{
    bmi: number;
    category: string;
    cvdRisk: string;
    color: string;
    recommendations: string[];
  } | null>(null);

  const calculateBMI = () => {
    const heightM = parseFloat(height) / 100; // Convert cm to m
    const weightKg = parseFloat(weight);
    const waistCm = parseFloat(waist);
    
    if (!heightM || !weightKg) return;
    
    const bmi = weightKg / (heightM * heightM);
    
    let category = '';
    let cvdRisk = '';
    let color = '';
    let recommendations: string[] = [];
    
    // BMI Categories based on WHO standards
    if (bmi < 18.5) {
      category = 'Underweight';
      cvdRisk = 'Low-Moderate';
      color = 'blue';
      recommendations = [
        'Consult healthcare provider about healthy weight gain',
        'Ensure adequate nutrition',
        'Monitor for nutritional deficiencies'
      ];
    } else if (bmi < 25) {
      category = 'Normal Weight';
      cvdRisk = 'Low';
      color = 'green';
      recommendations = [
        'Maintain current healthy weight',
        'Continue balanced diet and regular exercise',
        'Regular cardiovascular health checkups'
      ];
    } else if (bmi < 30) {
      category = 'Overweight';
      cvdRisk = 'Moderate';
      color = 'yellow';
      recommendations = [
        '5-10% weight loss can significantly reduce CVD risk',
        'Increase physical activity to 150 min/week',
        'Adopt Mediterranean or DASH diet',
        'Monitor blood pressure and cholesterol regularly'
      ];
    } else if (bmi < 35) {
      category = 'Obesity Class I';
      cvdRisk = 'High';
      color = 'orange';
      recommendations = [
        'Medical consultation recommended for weight management',
        'Consider lifestyle intervention programs',
        'Screen for diabetes, hypertension, dyslipidemia',
        'Discuss medication options with healthcare provider',
        'Target 10-15% weight reduction'
      ];
    } else if (bmi < 40) {
      category = 'Obesity Class II';
      cvdRisk = 'Very High';
      color = 'red';
      recommendations = [
        'Immediate medical consultation required',
        'Comprehensive cardiovascular assessment needed',
        'Consider GLP-1RA medications (e.g., semaglutide)',
        'Evaluate for bariatric surgery eligibility',
        'Screen for obesity-related complications'
      ];
    } else {
      category = 'Obesity Class III';
      cvdRisk = 'Extremely High';
      color = 'red';
      recommendations = [
        'Urgent medical intervention required',
        'Multidisciplinary obesity management team',
        'Strong consideration for bariatric surgery',
        'Intensive lifestyle and pharmacological therapy',
        'Monitor for heart failure, sleep apnea, diabetes'
      ];
    }
    
    // Adjust risk based on waist circumference
    if (waistCm > 102 || waistCm > 88) { // Men > 102cm, Women > 88cm
      cvdRisk = cvdRisk === 'Low' ? 'Moderate' : cvdRisk;
      recommendations.unshift('⚠️ High waist circumference indicates abdominal obesity - higher CVD risk');
    }
    
    setResult({
      bmi: parseFloat(bmi.toFixed(1)),
      category,
      cvdRisk,
      color,
      recommendations
    });
  };

  const getBadgeColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800'
    };
    return colors[color] || '';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          BMI & Cardiovascular Risk Calculator
        </CardTitle>
        <CardDescription>
          Calculate your Body Mass Index and assess obesity-related cardiovascular disease risk
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> BMI has limitations. It doesn't differentiate between muscle and fat, 
            or account for fat distribution. Waist circumference provides additional context for CVD risk.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder="170"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="waist">Waist Circumference (cm) - Optional</Label>
            <Input
              id="waist"
              type="number"
              placeholder="85"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={calculateBMI} className="w-full">
          Calculate
        </Button>

        {result && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Your BMI</p>
                <p className="text-3xl font-bold">{result.bmi}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <Badge className={getBadgeColor(result.color)}>
                  {result.category}
                </Badge>
              </div>
            </div>

            <Alert className="border-orange-200 bg-orange-50">
              <Heart className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <strong>CVD Risk Level:</strong> {result.cvdRisk}
                <p className="text-sm mt-2">
                  {result.bmi >= 30 && (
                    "High BMI increases risk by 40% for heart failure, doubles CVD mortality risk, " +
                    "and significantly raises risk for hypertension, diabetes, and atrial fibrillation."
                  )}
                  {result.bmi >= 25 && result.bmi < 30 && (
                    "5-10% weight loss can reduce blood pressure, improve lipid profiles, and lower CVD risk."
                  )}
                </p>
              </AlertDescription>
            </Alert>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Personalized Recommendations
              </h4>
              <ul className="space-y-2">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Evidence-based fact:</strong> According to WHO data, obesity more than 
                doubled globally from 1990-2022. High BMI now accounts for nearly 1 in 10 CVD deaths 
                (1.9 million annually). Even modest weight loss of 5-10% provides significant cardiovascular benefits.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
