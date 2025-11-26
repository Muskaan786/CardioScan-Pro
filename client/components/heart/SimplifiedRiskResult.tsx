import { useState } from "react";
import { HeartAnalysis } from "@/lib/heart-analyzer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  User,
  Calendar,
  Droplets,
  Scale,
  Ruler,
  Clock,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SimplifiedRiskResultProps = {
  result: HeartAnalysis | null;
  fileName?: string;
};

export function SimplifiedRiskResult({ result, fileName }: SimplifiedRiskResultProps) {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [showPersonalizedPlan, setShowPersonalizedPlan] = useState(false);

  if (!result) return null;

  // Calculate BMI if user provides height and weight
  const bmi = height && weight 
    ? (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)
    : null;

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { label: "Underweight", color: "text-blue-600", risk: "Low CVD risk from weight" };
    if (bmiValue < 25) return { label: "Normal Weight", color: "text-green-600", risk: "Optimal weight range" };
    if (bmiValue < 30) return { label: "Overweight", color: "text-yellow-600", risk: "Increased CVD risk" };
    if (bmiValue < 35) return { label: "Obese Class I", color: "text-orange-600", risk: "High CVD risk" };
    if (bmiValue < 40) return { label: "Obese Class II", color: "text-red-600", risk: "Very high CVD risk" };
    return { label: "Obese Class III", color: "text-red-700", risk: "Extremely high CVD risk" };
  };

  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

  // Risk level colors
  const getRiskColor = () => {
    if (result.normalizedRiskPercent >= 70) return {
      bg: "bg-red-50 border-red-200",
      text: "text-red-700",
      badge: "bg-red-600",
      icon: AlertTriangle
    };
    if (result.normalizedRiskPercent >= 40) return {
      bg: "bg-yellow-50 border-yellow-200",
      text: "text-yellow-700",
      badge: "bg-yellow-600",
      icon: Activity
    };
    return {
      bg: "bg-green-50 border-green-200",
      text: "text-green-700",
      badge: "bg-green-600",
      icon: CheckCircle
    };
  };

  const riskStyle = getRiskColor();
  const RiskIcon = riskStyle.icon;

  // Extract key metrics (avoid duplicates)
  const metrics = result.metrics;
  const age = metrics.age;
  const sex = metrics.sex;
  const bloodPressure = metrics.systolicBP && metrics.diastolicBP 
    ? `${metrics.systolicBP}/${metrics.diastolicBP}` 
    : null;
  const cholesterol = metrics.totalCholesterol || metrics.ldlCholesterol;
  const hasExtractedBMI = metrics.bmi;

  // Get primary action from triage
  const primaryAction = result.triage?.action || "Continue regular check-ups";
  const timeFrame = result.triage?.timeWindow || "As scheduled";

  // Determine urgency level
  const getUrgencyLevel = () => {
    const riskPercent = result.normalizedRiskPercent;
    const priority = result.triage?.priority;
    
    if (priority === 'IMMEDIATE' || riskPercent >= 80) {
      return {
        level: 'EMERGENCY',
        color: 'red',
        bg: 'bg-red-600',
        text: 'text-white',
        border: 'border-red-600',
        message: '🚨 SEEK EMERGENCY CARE NOW',
        description: 'Call 112 (India) / 911 (USA) or go to the nearest emergency room immediately',
        pulse: true
      };
    }
    if (priority === 'URGENT' || riskPercent >= 60) {
      return {
        level: 'URGENT',
        color: 'orange',
        bg: 'bg-orange-600',
        text: 'text-white',
        border: 'border-orange-600',
        message: '⚠️ SEE A DOCTOR URGENTLY',
        description: 'Schedule an appointment with a cardiologist within 24-48 hours',
        pulse: true
      };
    }
    if (priority === 'SEMI-URGENT' || riskPercent >= 35) {
      return {
        level: 'MODERATE',
        color: 'yellow',
        bg: 'bg-yellow-500',
        text: 'text-gray-900',
        border: 'border-yellow-500',
        message: '📋 SCHEDULE DOCTOR VISIT',
        description: 'Book an appointment with your doctor within 1-2 weeks',
        pulse: false
      };
    }
    return {
      level: 'ROUTINE',
      color: 'green',
      bg: 'bg-green-600',
      text: 'text-white',
      border: 'border-green-600',
      message: '✓ CONTINUE ROUTINE CARE',
      description: 'Maintain regular check-ups and healthy lifestyle habits',
      pulse: false
    };
  };

  const urgency = getUrgencyLevel();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* URGENT BANNER - Prominent at top */}
      <div className={cn(
        "rounded-xl p-6 shadow-lg border-2",
        urgency.bg,
        urgency.text,
        urgency.pulse && "animate-pulse"
      )}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur rounded-full p-3">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{urgency.message}</h2>
              <p className="text-lg opacity-90">{urgency.description}</p>
            </div>
          </div>
          <Badge className="bg-white/20 backdrop-blur border-0 text-inherit px-6 py-3 text-2xl font-bold whitespace-nowrap">
            {result.normalizedRiskPercent}%
          </Badge>
        </div>
      </div>

      {/* Main Risk Card - Enhanced Professional Design */}
      <Card className="border-2 shadow-lg overflow-hidden">
        <div className={cn("h-2", urgency.bg)} />
        <CardHeader className="pb-4 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 shadow-lg">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl mb-2">Heart Health Assessment</CardTitle>
                <p className="text-base text-muted-foreground">
                  Analysis of {fileName || "your medical report"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-2">Risk Category</p>
              <Badge className={cn(riskStyle.badge, "text-white px-6 py-2 text-xl font-bold")}>
                {result.category}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Risk Level Explanation - Enhanced */}
          <div className={cn("rounded-xl p-6 border-2", riskStyle.bg, urgency.border)}>
            <div className="flex items-start gap-4">
              <RiskIcon className={cn("h-8 w-8 flex-shrink-0", riskStyle.text)} />
              <div className="flex-1">
                <h3 className={cn("text-xl font-bold mb-2", riskStyle.text)}>
                  {result.category} Cardiovascular Risk
                </h3>
                <p className="text-base leading-relaxed text-gray-700">
                  {result.categoryMeta?.description || `Your cardiovascular risk assessment indicates a ${result.category.toLowerCase()} risk level based on the analyzed health metrics.`}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline & Action - More Prominent */}
          <div className={cn(
            "rounded-xl p-6 border-2",
            urgency.level === 'EMERGENCY' ? "bg-red-50 border-red-300" :
            urgency.level === 'URGENT' ? "bg-orange-50 border-orange-300" :
            urgency.level === 'MODERATE' ? "bg-yellow-50 border-yellow-300" :
            "bg-blue-50 border-blue-300"
          )}>
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-xl",
                urgency.level === 'EMERGENCY' ? "bg-red-100" :
                urgency.level === 'URGENT' ? "bg-orange-100" :
                urgency.level === 'MODERATE' ? "bg-yellow-100" :
                "bg-blue-100"
              )}>
                <Clock className={cn(
                  "h-7 w-7",
                  urgency.level === 'EMERGENCY' ? "text-red-600" :
                  urgency.level === 'URGENT' ? "text-orange-600" :
                  urgency.level === 'MODERATE' ? "text-yellow-600" :
                  "text-blue-600"
                )} />
              </div>
              <div className="flex-1">
                <h3 className={cn(
                  "text-xl font-bold mb-3",
                  urgency.level === 'EMERGENCY' ? "text-red-900" :
                  urgency.level === 'URGENT' ? "text-orange-900" :
                  urgency.level === 'MODERATE' ? "text-yellow-900" :
                  "text-blue-900"
                )}>
                  Recommended Action
                </h3>
                <p className={cn(
                  "text-lg font-semibold mb-2",
                  urgency.level === 'EMERGENCY' ? "text-red-800" :
                  urgency.level === 'URGENT' ? "text-orange-800" :
                  urgency.level === 'MODERATE' ? "text-yellow-800" :
                  "text-blue-800"
                )}>
                  {primaryAction}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="font-medium">
                    ⏰ {timeFrame}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Your Health Numbers - Enhanced Grid */}
          {(age || sex || bloodPressure || cholesterol || hasExtractedBMI) && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="font-bold text-2xl mb-6 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  Your Key Health Metrics
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {age && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 text-center border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-purple-200 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <Calendar className="h-6 w-6 text-purple-700" />
                      </div>
                      <p className="text-3xl font-bold text-purple-900 mb-1">{age}</p>
                      <p className="text-sm text-purple-700 font-medium">Years Old</p>
                    </div>
                  )}
                  {sex && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 text-center border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-blue-200 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <User className="h-6 w-6 text-blue-700" />
                      </div>
                      <p className="text-3xl font-bold text-blue-900 mb-1 capitalize">{sex}</p>
                      <p className="text-sm text-blue-700 font-medium">Gender</p>
                    </div>
                  )}
                  {bloodPressure && (
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 text-center border border-red-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-red-200 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <Activity className="h-6 w-6 text-red-700" />
                      </div>
                      <p className="text-3xl font-bold text-red-900 mb-1">{bloodPressure}</p>
                      <p className="text-sm text-red-700 font-medium">Blood Pressure (mmHg)</p>
                    </div>
                  )}
                  {cholesterol && (
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 text-center border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-orange-200 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <Droplets className="h-6 w-6 text-orange-700" />
                      </div>
                      <p className="text-3xl font-bold text-orange-900 mb-1">{cholesterol}</p>
                      <p className="text-sm text-orange-700 font-medium">Cholesterol (mg/dL)</p>
                    </div>
                  )}
                  {hasExtractedBMI && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 text-center border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-green-200 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <Scale className="h-6 w-6 text-green-700" />
                      </div>
                      <p className="text-3xl font-bold text-green-900 mb-1">{hasExtractedBMI.toFixed(1)}</p>
                      <p className="text-sm text-green-700 font-medium">BMI</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* BMI Calculator for Personalized Plan */}
      <Card className="border-2 shadow-lg">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
        <CardHeader className="bg-gradient-to-br from-blue-50 to-purple-50">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <Scale className="h-7 w-7 text-white" />
            </div>
            Get Your Personalized Health Plan
          </CardTitle>
          <p className="text-base text-muted-foreground mt-2">
            Add your height and weight to receive a customized plan based on your body composition and cardiac risk
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height" className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Height (cm)
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="e.g., 170"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                placeholder="e.g., 70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {bmi && (
            <>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Your BMI</p>
                    <p className="text-4xl font-bold text-gray-900">{bmi}</p>
                  </div>
                  <Badge className={cn("px-4 py-2", bmiCategory?.color)}>
                    {bmiCategory?.label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700">{bmiCategory?.risk}</p>
              </div>

              <Button 
                onClick={() => setShowPersonalizedPlan(!showPersonalizedPlan)}
                className="w-full"
                size="lg"
              >
                {showPersonalizedPlan ? "Hide" : "Show"} Personalized Health Plan
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          )}

          {showPersonalizedPlan && bmi && (
            <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-lg">Your Personalized Plan</h4>
              
              {/* Cardiac Risk from BMI */}
              <Alert>
                <Heart className="h-4 w-4" />
                <AlertDescription>
                  <strong>Combined Heart Risk Assessment:</strong>
                  <p className="mt-1">
                    Your cardiac risk score is {result.normalizedRiskPercent}% and your BMI is {bmi}. 
                    {parseFloat(bmi) >= 25 && " Being overweight increases your cardiovascular disease risk by 40-70%."}
                    {parseFloat(bmi) < 25 && " Your weight is in a healthy range, which is good for your heart!"}
                  </p>
                </AlertDescription>
              </Alert>

              {/* Personalized Recommendations */}
              <div className="space-y-3">
                <h5 className="font-medium text-sm text-gray-900">Recommended Actions for You:</h5>
                
                {parseFloat(bmi) >= 30 && (
                  <div className="flex gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <strong className="text-red-900">Weight Loss Priority:</strong>
                      <p className="text-red-800 mt-1">Losing 5-10% of body weight ({(parseFloat(weight) * 0.05).toFixed(1)}-{(parseFloat(weight) * 0.10).toFixed(1)} kg) can significantly reduce your heart disease risk.</p>
                    </div>
                  </div>
                )}

                {parseFloat(bmi) >= 25 && parseFloat(bmi) < 30 && (
                  <div className="flex gap-3 p-3 bg-yellow-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <strong className="text-yellow-900">Weight Management:</strong>
                      <p className="text-yellow-800 mt-1">Maintain or reduce weight to prevent progression to obesity. Target: {((parseFloat(height) / 100) ** 2 * 24.9).toFixed(1)} kg or less.</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 p-3 bg-blue-50 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <strong className="text-blue-900">Exercise Goal:</strong>
                    <p className="text-blue-800 mt-1">Aim for 150 minutes of moderate activity per week (30 minutes, 5 days). Walking, swimming, or cycling are excellent choices.</p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 bg-green-50 rounded-lg">
                  <Heart className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <strong className="text-green-900">Diet Focus:</strong>
                    <p className="text-green-800 mt-1">Mediterranean diet reduces CVD risk by 30%. Focus on vegetables, whole grains, lean protein, and healthy fats.</p>
                  </div>
                </div>

                {result.normalizedRiskPercent >= 40 && (
                  <div className="flex gap-3 p-3 bg-purple-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <strong className="text-purple-900">Medical Follow-up:</strong>
                      <p className="text-purple-800 mt-1">Given your cardiac risk, schedule a consultation with a cardiologist to discuss medication and monitoring options.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warning Signs - Enhanced Alert */}
      {result.triage?.warningSigns && result.triage.warningSigns.length > 0 && (
        <Card className="border-2 border-red-300 bg-red-50 shadow-lg">
          <div className="h-2 bg-red-600" />
          <CardHeader className="bg-gradient-to-br from-red-50 to-red-100">
            <CardTitle className="text-red-900 flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-xl bg-red-600">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
              ⚠️ Emergency Warning Signs
            </CardTitle>
            <p className="text-red-800 font-medium mt-2">
              Call emergency services immediately (🚨 India: 112 | USA: 911) if you experience any of these symptoms:
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {result.triage.warningSigns.map((sign, i) => (
                <div key={i} className="flex gap-3 items-start p-4 bg-white rounded-lg border-l-4 border-red-600 shadow-sm">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 text-white text-lg flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <p className="text-base text-red-900 font-medium flex-1 pt-1">{sign}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Recommendations */}
      {result.recommendations && result.recommendations.items.length > 0 && (
        <Card className="border-2 shadow-lg">
          <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
          <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              Your Action Plan for Better Heart Health
            </CardTitle>
            <p className="text-base text-muted-foreground mt-2">
              Follow these evidence-based recommendations to improve your cardiovascular health
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {result.recommendations.items.slice(0, 6).map((rec, i) => {
                const priorityColors = {
                  urgent: 'bg-red-500 border-red-200',
                  high: 'bg-orange-500 border-orange-200',
                  medium: 'bg-blue-500 border-blue-200',
                  low: 'bg-green-500 border-green-200'
                };
                const bgColors = {
                  urgent: 'bg-red-50 border-l-red-500',
                  high: 'bg-orange-50 border-l-orange-500',
                  medium: 'bg-blue-50 border-l-blue-500',
                  low: 'bg-green-50 border-l-green-500'
                };
                const badgeColor = priorityColors[rec.priority] || priorityColors.medium;
                const cardBg = bgColors[rec.priority] || bgColors.medium;
                
                return (
                  <div key={i} className={cn("flex gap-4 items-start p-4 rounded-lg border-l-4 hover:shadow-md transition-shadow", cardBg)}>
                    <span className={cn("flex-shrink-0 w-8 h-8 rounded-full text-white text-base flex items-center justify-center font-bold shadow-md", badgeColor)}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2 text-xs">
                        {rec.category}
                      </Badge>
                      <p className="text-base text-gray-900 font-medium">{rec.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Alert>
        <AlertDescription className="text-xs text-muted-foreground">
          ⚠️ This analysis is for informational purposes only and does not constitute medical advice. 
          Always consult with qualified healthcare professionals for diagnosis and treatment decisions. 
          Your data is processed locally and not stored anywhere.
        </AlertDescription>
      </Alert>
    </div>
  );
}
