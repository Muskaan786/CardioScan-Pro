import { useState } from "react";
import { HeartAnalysis } from "@/lib/heart-analyzer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

  const bmi = height && weight 
    ? (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)
    : null;

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { label: "Underweight", color: "text-blue-600", risk: "Low CVD risk" };
    if (bmiValue < 25) return { label: "Normal", color: "text-green-600", risk: "Optimal range" };
    if (bmiValue < 30) return { label: "Overweight", color: "text-yellow-600", risk: "Increased CVD risk" };
    if (bmiValue < 35) return { label: "Obese I", color: "text-orange-600", risk: "High CVD risk" };
    return { label: "Obese II+", color: "text-red-700", risk: "Very high risk" };
  };

  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

  const getRiskColor = () => {
    if (result.normalizedRiskPercent >= 70) return {
      bg: "bg-red-50 border-red-200", text: "text-red-700", badge: "bg-red-600", icon: AlertTriangle
    };
    if (result.normalizedRiskPercent >= 40) return {
      bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", badge: "bg-yellow-600", icon: Activity
    };
    return {
      bg: "bg-green-50 border-green-200", text: "text-green-700", badge: "bg-green-600", icon: CheckCircle
    };
  };

  const riskStyle = getRiskColor();
  const RiskIcon = riskStyle.icon;

  const metrics = result.metrics;
  const age = metrics.age;
  const sex = metrics.sex;
  const bloodPressure = metrics.systolic && metrics.diastolic ? `${metrics.systolic}/${metrics.diastolic}` : null;
  const cholesterol = metrics.cholesterol;
  const hasExtractedBMI = metrics.bmi;

  const primaryAction = result.triage?.action || "Continue regular check-ups";
  const timeFrame = result.triage?.timeWindow || "As scheduled";

  const getUrgencyLevel = () => {
    const riskPercent = result.normalizedRiskPercent;
    const priority = result.triage?.priority;
    
    if (priority === 'IMMEDIATE' || riskPercent >= 80) {
      return {
        level: 'EMERGENCY', bg: 'bg-red-600', text: 'text-white',
        message: '🚨 EMERGENCY CARE NOW', description: 'Call 112/911 immediately',pulse: true
      };
    }
    if (priority === 'URGENT' || riskPercent >= 60) {
      return {
        level: 'URGENT', bg: 'bg-orange-600', text: 'text-white',
        message: '⚠️ SEE DOCTOR URGENTLY', description: 'Within 24-48 hours', pulse: true
      };
    }
    if (priority === 'SEMI-URGENT' || riskPercent >= 35) {
      return {
        level: 'MODERATE', bg: 'bg-yellow-500', text: 'text-gray-900',
        message: '📋 SCHEDULE VISIT', description: 'Within 1-2 weeks', pulse: false
      };
    }
    return {
      level: 'ROUTINE', bg: 'bg-green-600', text: 'text-white',
      message: '✓ ROUTINE CARE', description: 'Regular check-ups', pulse: false
    };
  };

  const urgency = getUrgencyLevel();

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* URGENT BANNER */}
      <div className={cn("rounded-lg p-3 shadow-lg border-2", urgency.bg, urgency.text, urgency.pulse && "animate-pulse")}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <h2 className="text-base md:text-lg font-bold">{urgency.message}</h2>
              <p className="text-xs md:text-sm opacity-90">{urgency.description}</p>
            </div>
          </div>
          <Badge className="bg-white/20 backdrop-blur border-0 text-inherit px-3 py-1 text-lg font-bold">
            {result.normalizedRiskPercent}%
          </Badge>
        </div>
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* LEFT: Risk & Metrics */}
        <div className="space-y-4">
          <Card className="border shadow-md">
            <div className={cn("h-1", urgency.bg)} />
            <CardHeader className="pb-2 pt-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-pink-600">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Heart Health</CardTitle>
                    <p className="text-xs text-muted-foreground">{fileName || "Report"}</p>
                  </div>
                </div>
                <Badge className={cn(riskStyle.badge, "text-white px-2 py-0.5 text-sm")}>{result.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className={cn("rounded-lg p-3 border", riskStyle.bg)}>
                <div className="flex items-start gap-2">
                  <RiskIcon className={cn("h-5 w-5 flex-shrink-0", riskStyle.text)} />
                  <div>
                    <h3 className={cn("text-sm font-bold mb-1", riskStyle.text)}>{result.category} Risk</h3>
                    <p className="text-xs leading-relaxed">{result.categoryMeta?.description || `${result.category} cardiovascular risk`}</p>
                  </div>
                </div>
              </div>

              <div className={cn("rounded-lg p-3 border", urgency.level === 'EMERGENCY' ? "bg-red-50 border-red-200" : urgency.level === 'URGENT' ? "bg-orange-50 border-orange-200" : urgency.level === 'MODERATE' ? "bg-yellow-50 border-yellow-200" : "bg-blue-50 border-blue-200")}>
                <div className="flex items-start gap-2">
                  <Clock className={cn("h-5 w-5 flex-shrink-0", urgency.level === 'EMERGENCY' ? "text-red-600" : urgency.level === 'URGENT' ? "text-orange-600" : urgency.level === 'MODERATE' ? "text-yellow-600" : "text-blue-600")} />
                  <div>
                    <h3 className="text-sm font-bold mb-1">Action Required</h3>
                    <p className="text-xs font-medium mb-1">{primaryAction}</p>
                    <Badge variant="outline" className="text-xs">⏰ {timeFrame}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {(age || sex || bloodPressure || cholesterol || hasExtractedBMI) && (
            <Card className="border shadow-md">
              <CardHeader className="pb-3 pt-3 px-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />Health Numbers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-2">
                  {age && (
                    <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
                      <Calendar className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                      <p className="text-xl font-bold text-purple-900">{age}</p>
                      <p className="text-xs text-purple-700">Years</p>
                    </div>
                  )}
                  {sex && (
                    <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                      <User className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                      <p className="text-xl font-bold text-blue-900 capitalize">{sex}</p>
                      <p className="text-xs text-blue-700">Gender</p>
                    </div>
                  )}
                  {bloodPressure && (
                    <div className="bg-red-50 rounded-lg p-3 text-center border border-red-200">
                      <Activity className="h-4 w-4 text-red-600 mx-auto mb-1" />
                      <p className="text-xl font-bold text-red-900">{bloodPressure}</p>
                      <p className="text-xs text-red-700">BP</p>
                    </div>
                  )}
                  {cholesterol && (
                    <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                      <Droplets className="h-4 w-4 text-orange-600 mx-auto mb-1" />
                      <p className="text-xl font-bold text-orange-900">{cholesterol}</p>
                      <p className="text-xs text-orange-700">Chol.</p>
                    </div>
                  )}
                  {hasExtractedBMI && (
                    <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200 col-span-2">
                      <Scale className="h-4 w-4 text-green-600 mx-auto mb-1" />
                      <p className="text-xl font-bold text-green-900">{hasExtractedBMI.toFixed(1)}</p>
                      <p className="text-xs text-green-700">BMI</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: BMI & Recommendations */}
        <div className="space-y-4">
          <Card className="border shadow-md">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            <CardHeader className="pb-3 pt-3 px-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Scale className="h-5 w-5 text-purple-600" />Personalized Plan
              </CardTitle>
              <p className="text-xs text-muted-foreground">Add height & weight for custom plan</p>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="height" className="text-xs flex items-center gap-1">
                    <Ruler className="h-3 w-3" />Height (cm)
                  </Label>
                  <Input id="height" type="number" placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)} className="h-8 text-sm" />
                </div>
                <div>
                  <Label htmlFor="weight" className="text-xs flex items-center gap-1">
                    <Scale className="h-3 w-3" />Weight (kg)
                  </Label>
                  <Input id="weight" type="number" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-8 text-sm" />
                </div>
              </div>

              {bmi && (
                <>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-xs text-gray-600">BMI</p>
                        <p className="text-2xl font-bold">{bmi}</p>
                      </div>
                      <Badge className={cn("px-2 py-0.5 text-xs", bmiCategory?.color)}>{bmiCategory?.label}</Badge>
                    </div>
                    <p className="text-xs text-gray-700">{bmiCategory?.risk}</p>
                  </div>
                  <Button onClick={() => setShowPersonalizedPlan(!showPersonalizedPlan)} className="w-full h-8 text-xs" size="sm">
                    {showPersonalizedPlan ? "Hide" : "Show"} Plan <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </>
              )}

              {showPersonalizedPlan && bmi && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
                  <h4 className="font-semibold text-sm">Your Plan</h4>
                  <Alert className="p-2">
                    <Heart className="h-3 w-3" />
                    <AlertDescription className="text-xs">
                      <strong>Risk:</strong> {result.normalizedRiskPercent}% cardiac + BMI {bmi}
                      {parseFloat(bmi) >= 25 && " (↑40-70% CVD risk)"}
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    {parseFloat(bmi) >= 30 && (
                      <div className="flex gap-2 p-2 bg-red-50 rounded text-xs border-l-2 border-red-500">
                        <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <div><strong>Priority:</strong> Lose {(parseFloat(weight) * 0.05).toFixed(1)}-{(parseFloat(weight) * 0.10).toFixed(1)} kg</div>
                      </div>
                    )}
                    <div className="flex gap-2 p-2 bg-blue-50 rounded text-xs border-l-2 border-blue-500">
                      <Activity className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <div><strong>Exercise:</strong> 150min/week</div>
                    </div>
                    <div className="flex gap-2 p-2 bg-green-50 rounded text-xs border-l-2 border-green-500">
                      <Heart className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <div><strong>Diet:</strong> Mediterranean (↓30% risk)</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {result.recommendations && result.recommendations.items.length > 0 && (
            <Card className="border shadow-md">
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
              <CardHeader className="pb-3 pt-3 px-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {result.recommendations.items.slice(0, 5).map((rec, i) => {
                    const colors = {urgent: 'border-l-red-500 bg-red-50', high: 'border-l-orange-500 bg-orange-50', medium: 'border-l-blue-500 bg-blue-50', low: 'border-l-green-500 bg-green-50'};
                    return (
                      <div key={i} className={cn("flex gap-2 p-2 rounded border-l-2 text-xs", colors[rec.priority] || colors.medium)}>
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
                        <p className="flex-1">{rec.text}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Warning Signs */}
      {result.triage?.warningSigns && result.triage.warningSigns.length > 0 && (
        <Card className="border-2 border-red-300 bg-red-50 shadow-md">
          <div className="h-1 bg-red-600" />
          <CardHeader className="pb-3 pt-3 px-4">
            <CardTitle className="text-red-900 flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5" />⚠️ Emergency Warnings
            </CardTitle>
            <p className="text-red-800 font-medium text-xs">Call 112 (India) / 911 (USA) if you have:</p>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              {result.triage.warningSigns.map((sign, i) => (
                <div key={i} className="flex gap-2 items-start p-2 bg-white rounded border-l-2 border-red-600">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
                  <p className="text-xs text-red-900 font-medium flex-1">{sign}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert className="border">
        <AlertDescription className="text-xs text-muted-foreground">
          ⚠️ Informational only. Consult healthcare professionals. Data not stored.
        </AlertDescription>
      </Alert>
    </div>
  );
}
