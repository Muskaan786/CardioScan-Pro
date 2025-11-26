import { HeartAnalysis } from "@/lib/heart-analyzer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Scale, TrendingUp, AlertTriangle, Info, Heart } from "lucide-react";

type ObesityRiskPanelProps = {
  analysis: HeartAnalysis;
};

export function ObesityRiskPanel({ analysis }: ObesityRiskPanelProps) {
  const { metrics } = analysis;
  
  // Calculate BMI if height and weight are available
  let bmi = metrics.bmi;
  if (!bmi && metrics.height && metrics.weight) {
    const heightM = metrics.height / 100;
    bmi = metrics.weight / (heightM * heightM);
  }

  // If no BMI data available, don't show the panel
  if (!bmi && !metrics.weight && !metrics.height) {
    return null;
  }

  // BMI Categories and CVD Risk
  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) {
      return { 
        category: 'Underweight', 
        cvdRisk: 'Low-Moderate',
        color: 'blue',
        bgColor: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-700',
        badgeColor: 'bg-blue-100 text-blue-800'
      };
    } else if (bmiValue < 25) {
      return { 
        category: 'Normal Weight', 
        cvdRisk: 'Low',
        color: 'green',
        bgColor: 'bg-green-50 border-green-200',
        textColor: 'text-green-700',
        badgeColor: 'bg-green-100 text-green-800'
      };
    } else if (bmiValue < 30) {
      return { 
        category: 'Overweight', 
        cvdRisk: 'Moderate',
        color: 'yellow',
        bgColor: 'bg-yellow-50 border-yellow-200',
        textColor: 'text-yellow-700',
        badgeColor: 'bg-yellow-100 text-yellow-800'
      };
    } else if (bmiValue < 35) {
      return { 
        category: 'Obesity Class I', 
        cvdRisk: 'High',
        color: 'orange',
        bgColor: 'bg-orange-50 border-orange-200',
        textColor: 'text-orange-700',
        badgeColor: 'bg-orange-100 text-orange-800'
      };
    } else if (bmiValue < 40) {
      return { 
        category: 'Obesity Class II', 
        cvdRisk: 'Very High',
        color: 'red',
        bgColor: 'bg-red-50 border-red-200',
        textColor: 'text-red-700',
        badgeColor: 'bg-red-100 text-red-800'
      };
    } else {
      return { 
        category: 'Obesity Class III', 
        cvdRisk: 'Extremely High',
        color: 'red',
        bgColor: 'bg-red-50 border-red-200',
        textColor: 'text-red-700',
        badgeColor: 'bg-red-100 text-red-800'
      };
    }
  };

  // Check waist circumference risk
  const getWaistRisk = () => {
    if (!metrics.waist) return null;
    
    const isMale = metrics.sex === 'male';
    const threshold = isMale ? 102 : 88; // cm
    
    if (metrics.waist > threshold) {
      return {
        isHighRisk: true,
        message: `High waist circumference (${metrics.waist}cm > ${threshold}cm) indicates abdominal obesity - significantly increases CVD risk`
      };
    }
    return {
      isHighRisk: false,
      message: `Waist circumference (${metrics.waist}cm) is within healthy range`
    };
  };

  const bmiData = bmi ? getBMICategory(bmi) : null;
  const waistRisk = getWaistRisk();
  
  // Calculate progress bar value (0-100)
  const progressValue = bmi ? Math.min((bmi / 40) * 100, 100) : 0;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Obesity & Cardiovascular Risk
        </CardTitle>
        <CardDescription>
          Body composition analysis and obesity-related CVD risk factors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* BMI Display */}
        {bmi && bmiData && (
          <div className={`border rounded-lg p-4 ${bmiData.bgColor}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Body Mass Index</p>
                <p className="text-4xl font-bold">{bmi.toFixed(1)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={bmiData.badgeColor}>
                    {bmiData.category}
                  </Badge>
                  <span className={`text-sm font-medium ${bmiData.textColor}`}>
                    CVD Risk: {bmiData.cvdRisk}
                  </span>
                </div>
              </div>
              <TrendingUp className={`h-8 w-8 ${bmiData.textColor}`} />
            </div>
            
            <Progress value={progressValue} className="h-2 mt-2" />
            
            {/* Metrics breakdown */}
            <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
              {metrics.height && (
                <div>
                  <p className="text-muted-foreground">Height</p>
                  <p className="font-semibold">{metrics.height} cm</p>
                </div>
              )}
              {metrics.weight && (
                <div>
                  <p className="text-muted-foreground">Weight</p>
                  <p className="font-semibold">{metrics.weight} kg</p>
                </div>
              )}
              {metrics.waist && (
                <div>
                  <p className="text-muted-foreground">Waist</p>
                  <p className="font-semibold">{metrics.waist} cm</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Waist circumference alert */}
        {waistRisk && waistRisk.isHighRisk && (
          <Alert className="bg-orange-50 border-orange-200">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-sm">
              <strong>Abdominal Obesity Detected:</strong> {waistRisk.message}
            </AlertDescription>
          </Alert>
        )}

        {/* CVD Impact Information */}
        {bmi && bmi >= 25 && (
          <Alert>
            <Heart className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-sm space-y-2">
              <p className="font-semibold">Impact on Cardiovascular Health:</p>
              <ul className="space-y-1 ml-4 text-xs">
                {bmi >= 30 && (
                  <>
                    <li>• <strong>40% higher risk</strong> of developing CVD in midlife</li>
                    <li>• Increased risk of heart failure, especially HFpEF</li>
                    <li>• Higher likelihood of atrial fibrillation</li>
                    <li>• Elevated risk of coronary artery disease</li>
                  </>
                )}
                {bmi >= 25 && bmi < 30 && (
                  <>
                    <li>• Moderate increase in CVD risk factors</li>
                    <li>• Higher risk of hypertension and diabetes</li>
                    <li>• 5-10% weight loss can significantly reduce risk</li>
                  </>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Recommendations based on BMI */}
        {bmi && (
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              Weight Management Recommendations
            </h4>
            <ul className="space-y-2 text-sm">
              {bmi < 18.5 && (
                <>
                  <li>• Consult healthcare provider about healthy weight gain</li>
                  <li>• Ensure adequate nutrition and caloric intake</li>
                  <li>• Screen for underlying medical conditions</li>
                </>
              )}
              {bmi >= 18.5 && bmi < 25 && (
                <>
                  <li>• Maintain current healthy weight through balanced diet</li>
                  <li>• Continue 150 minutes/week of physical activity</li>
                  <li>• Regular cardiovascular health monitoring</li>
                </>
              )}
              {bmi >= 25 && bmi < 30 && (
                <>
                  <li>• Target <strong>5-10% weight loss</strong> for significant CVD risk reduction</li>
                  <li>• Adopt Mediterranean or DASH diet</li>
                  <li>• Increase physical activity to 150-300 min/week</li>
                  <li>• Monitor blood pressure and cholesterol regularly</li>
                </>
              )}
              {bmi >= 30 && bmi < 35 && (
                <>
                  <li>• <strong>Medical consultation recommended</strong> for weight management</li>
                  <li>• Target 10-15% weight loss with structured program</li>
                  <li>• Screen for diabetes, hypertension, sleep apnea</li>
                  <li>• Consider lifestyle intervention programs</li>
                  <li>• Discuss medication options (e.g., GLP-1RAs) with doctor</li>
                </>
              )}
              {bmi >= 35 && (
                <>
                  <li>• <strong>Immediate medical consultation required</strong></li>
                  <li>• Comprehensive cardiovascular assessment needed</li>
                  <li>• Strong consideration for GLP-1RA medications or bariatric surgery</li>
                  <li>• Multidisciplinary obesity management team recommended</li>
                  <li>• Monitor for heart failure, arrhythmias, sleep apnea</li>
                </>
              )}
            </ul>
          </div>
        )}

        {/* Evidence note */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Evidence-based data:</strong> High BMI accounts for 9.8% of all CVD deaths globally (1.9M annually). 
            Even modest weight loss of 5-10% improves blood pressure, lipid profiles, and reduces cardiovascular events. 
            Source: World Heart Report 2025.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
