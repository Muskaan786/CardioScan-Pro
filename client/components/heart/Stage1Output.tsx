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
  ChevronRight,
  Info,
  Target,
  FileText,
  Zap,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

export type Stage1OutputProps = {
  result: HeartAnalysis | null;
  fileName?: string;
};

export function Stage1Output({ result, fileName }: Stage1OutputProps) {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [showPersonalizedPlan, setShowPersonalizedPlan] = useState(false);

  if (!result) return null;

  const metrics = result.metrics;
  const bmi = height && weight ? (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1) : null;

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { label: "Underweight", color: "text-blue-600", risk: "Low CVD risk" };
    if (bmiValue < 25) return { label: "Normal", color: "text-green-600", risk: "Optimal range" };
    if (bmiValue < 30) return { label: "Overweight", color: "text-yellow-600", risk: "Increased CVD risk" };
    if (bmiValue < 35) return { label: "Obese Class I", color: "text-orange-600", risk: "High CVD risk" };
    return { label: "Obese Class II+", color: "text-red-700", risk: "Very high CVD risk" };
  };

  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

  // Urgency Level
  const getUrgencyLevel = () => {
    const riskPercent = result.normalizedRiskPercent;
    const priority = result.triage?.priority;
    
    if (priority === 'IMMEDIATE' || riskPercent >= 80) {
      return { level: 'Emergency Warning', bg: 'bg-red-600', text: 'text-white', icon: '🚨', pulse: true };
    }
    if (priority === 'URGENT' || riskPercent >= 60) {
      return { level: 'Urgent Review', bg: 'bg-orange-600', text: 'text-white', icon: '⚠️', pulse: true };
    }
    if (priority === 'SEMI-URGENT' || riskPercent >= 35) {
      return { level: 'Priority Review', bg: 'bg-yellow-500', text: 'text-gray-900', icon: '📋', pulse: false };
    }
    return { level: 'Routine Care', bg: 'bg-green-600', text: 'text-white', icon: '✓', pulse: false };
  };

  const urgency = getUrgencyLevel();

  // Risk Score Breakdown (Explainable AI)
  const getRiskBreakdown = () => {
    const breakdown: { factor: string; score: number; max: number; impact: string; color: string }[] = [];
    
    // EF Score
    if (metrics.ejectionFraction) {
      const ef = metrics.ejectionFraction;
      let score = 0;
      let impact = "";
      if (ef >= 55) { score = 0; impact = "Normal"; }
      else if (ef >= 45) { score = 5; impact = "Mildly reduced"; }
      else if (ef >= 35) { score = 15; impact = "Moderately reduced"; }
      else { score = 25; impact = "Severely reduced"; }
      breakdown.push({ factor: "Ejection Fraction", score, max: 25, impact, color: score > 15 ? "text-red-600" : score > 5 ? "text-yellow-600" : "text-green-600" });
    }

    // Blood Pressure
    if (metrics.systolic && metrics.diastolic) {
      let score = 0;
      let impact = "";
      if (metrics.systolic < 120 && metrics.diastolic < 80) { score = 0; impact = "Normal"; }
      else if (metrics.systolic < 130 && metrics.diastolic < 80) { score = 3; impact = "Elevated"; }
      else if (metrics.systolic < 140 || metrics.diastolic < 90) { score = 8; impact = "Stage 1 HTN"; }
      else { score = 15; impact = "Stage 2 HTN"; }
      breakdown.push({ factor: "Blood Pressure", score, max: 15, impact, color: score > 10 ? "text-red-600" : score > 5 ? "text-yellow-600" : "text-green-600" });
    }

    // Lipid Profile
    if (metrics.cholesterol) {
      let score = 0;
      let impact = "";
      if (metrics.cholesterol < 200) { score = 0; impact = "Desirable"; }
      else if (metrics.cholesterol < 240) { score = 5; impact = "Borderline high"; }
      else { score = 12; impact = "High"; }
      breakdown.push({ factor: "Cholesterol", score, max: 12, impact, color: score > 8 ? "text-red-600" : score > 3 ? "text-yellow-600" : "text-green-600" });
    }

    // BMI
    if (metrics.bmi) {
      let score = 0;
      let impact = "";
      if (metrics.bmi < 25) { score = 0; impact = "Normal"; }
      else if (metrics.bmi < 30) { score = 5; impact = "Overweight"; }
      else if (metrics.bmi < 35) { score = 10; impact = "Obese I"; }
      else { score = 15; impact = "Obese II+"; }
      breakdown.push({ factor: "BMI / Obesity", score, max: 15, impact, color: score > 10 ? "text-red-600" : score > 5 ? "text-yellow-600" : "text-green-600" });
    }

    // Diabetes
    if (metrics.diabetes) {
      breakdown.push({ factor: "Diabetes", score: 12, max: 12, impact: "Present", color: "text-red-600" });
    } else {
      breakdown.push({ factor: "Diabetes", score: 0, max: 12, impact: "Not detected", color: "text-green-600" });
    }

    // Smoking
    if (metrics.smoker) {
      breakdown.push({ factor: "Smoking Status", score: 10, max: 10, impact: "Current smoker", color: "text-red-600" });
    } else {
      breakdown.push({ factor: "Smoking Status", score: 0, max: 10, impact: "Non-smoker", color: "text-green-600" });
    }

    const totalScore = breakdown.reduce((sum, item) => sum + item.score, 0);
    const maxScore = breakdown.reduce((sum, item) => sum + item.max, 0);

    return { breakdown, totalScore, maxScore };
  };

  const riskBreakdown = getRiskBreakdown();

  // High-risk flag
  const isHighRisk = result.category === "High";

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* RED ALERT BANNER FOR HIGH RISK */}
      {isHighRisk && (
        <Alert className="border-2 border-red-600 bg-red-50 shadow-lg">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <div>
                <p className="text-base font-bold text-red-900">HIGH RISK — Immediate Medical Attention Recommended</p>
                <p className="text-xs text-red-800 mt-0.5">Your cardiac risk assessment indicates urgent medical review is required. Please contact your healthcare provider within 24-48 hours or visit urgent care if experiencing symptoms.</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* HEADER: Stage-1 Output */}
      <Card className={cn("border", isHighRisk ? "border-red-300 bg-gradient-to-r from-red-50 to-orange-50" : "border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50")}>
        <CardHeader className="pb-2 pt-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg", isHighRisk ? "bg-gradient-to-br from-red-600 to-orange-600" : "bg-gradient-to-br from-purple-600 to-blue-600")}>
              <FileText className="h-4 w-4 text-white" />
            </div>
            CardioScan Pro - Stage 1 Analysis Report
            {isHighRisk && <Badge className="bg-red-600 text-white text-sm px-3 py-0.5">🚨 URGENT</Badge>}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Comprehensive cardiac risk assessment based on {fileName || "uploaded medical report"}
          </p>
        </CardHeader>
      </Card>

      {/* 1. HEART HEALTH SUMMARY */}
      <Card className="border shadow-md">
        <div className={cn("h-1", urgency.bg)} />
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-600" />
            1. Heart Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Risk Category</p>
              <Badge className={cn("text-sm px-3 py-0.5", 
                result.category === 'High' ? 'bg-red-600' :
                result.category === 'Moderate' ? 'bg-yellow-600' :
                result.category === 'Low' ? 'bg-blue-600' : 'bg-green-600'
              )}>
                {result.category} Risk
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 mb-1">Risk Score</p>
              <p className="text-2xl font-bold">{result.normalizedRiskPercent}%</p>
            </div>
          </div>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Plain Language Interpretation:</strong>
              <p className="mt-1">
                {result.categoryMeta?.description || 
                  `Your cardiovascular risk assessment shows a ${result.category.toLowerCase()} risk level. ${
                    result.category === 'High' ? 'Immediate medical attention is recommended.' :
                    result.category === 'Moderate' ? 'Regular monitoring and lifestyle modifications are advised.' :
                    result.category === 'Low' ? 'Continue maintaining healthy habits with routine check-ups.' :
                    'Your heart health appears normal. Maintain current lifestyle.'
                  }`
                }
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* FOR HIGH RISK: SHOW URGENCY/TRIAGE IMMEDIATELY AFTER SUMMARY */}
      {isHighRisk && (
        <>
          {/* URGENCY / TRIAGE LEVEL (Priority Position for High Risk) */}
          <Card className={cn("border-2 shadow-lg border-red-500", urgency.pulse && "animate-pulse")}>
            <div className="h-2 bg-gradient-to-r from-red-600 to-orange-600" />
            <CardHeader className="pb-2 bg-red-50">
              <CardTitle className="text-base flex items-center gap-2 text-red-900">
                <Clock className="h-4 w-4 text-red-600" />
                ⚠️ URGENT TRIAGE LEVEL
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className={cn("rounded-lg p-4 shadow-md", urgency.bg, urgency.text)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{urgency.icon}</span>
                    <div>
                      <p className="text-xl font-bold mb-1">{urgency.level}</p>
                      <p className="text-sm opacity-95 font-medium">
                        {result.triage?.action || 'Immediate medical review required'}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-white/30 border border-white text-inherit px-4 py-2 text-base font-bold shadow-md">
                    {result.triage?.timeWindow || 'Within 24-48 hours'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* EMERGENCY WARNING SECTION (Priority Position for High Risk) */}
          {result.triage?.warningSigns && result.triage.warningSigns.length > 0 && (
            <Card className="border-2 border-red-600 bg-red-50 shadow-lg">
              <div className="h-2 bg-red-700" />
              <CardHeader className="pb-2 bg-red-100">
                <CardTitle className="text-red-900 flex items-center gap-2 text-base">
                  <AlertTriangle className="h-5 w-5" />
                  🚨 EMERGENCY WARNING SECTION
                </CardTitle>
                <p className="text-red-900 font-bold text-xs mt-2 bg-red-200 p-2 rounded-md border border-red-400">
                  ⚠️ Call emergency services IMMEDIATELY (India: 112 | USA: 911 | UK: 999) if you experience ANY of these symptoms:
                </p>
              </CardHeader>
              <CardContent className="bg-white">
                <div className="space-y-2">
                  {result.triage.warningSigns.map((sign, i) => (
                    <div key={i} className="flex gap-2 items-start p-2 bg-red-50 rounded-md border-l-3 border-red-700 shadow-sm">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <p className="text-xs text-red-900 font-semibold flex-1 pt-0.5">{sign}</p>
                    </div>
                  ))}
                </div>
                <Alert className="mt-3 bg-red-100 border border-red-400">
                  <AlertTriangle className="h-4 w-4 text-red-700" />
                  <AlertDescription className="text-xs text-red-900 font-medium">
                    <strong className="text-xs">⏰ TIME IS CRITICAL:</strong> Cardiac emergencies require immediate medical attention within minutes. 
                    Do not wait, do not drive yourself. Call emergency services immediately. Early treatment can save lives and prevent permanent heart damage.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* 2. CARDIAC FEATURE EXTRACTION TABLE */}
      <Card className="border shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            2. Cardiac Feature Extraction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left font-semibold">Parameter</th>
                  <th className="p-2 text-center font-semibold">Value</th>
                  <th className="p-2 text-center font-semibold">Unit</th>
                  <th className="p-2 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {metrics.ejectionFraction && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-2">Ejection Fraction (EF)</td>
                    <td className="p-2 text-center font-medium">{metrics.ejectionFraction}</td>
                    <td className="p-2 text-center">%</td>
                    <td className="p-2 text-center">
                      <Badge variant={metrics.ejectionFraction >= 55 ? "default" : "destructive"}>
                        {metrics.ejectionFraction >= 55 ? "Normal" : "Reduced"}
                      </Badge>
                    </td>
                  </tr>
                )}
                {metrics.systolic && metrics.diastolic && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-2">Blood Pressure</td>
                    <td className="p-2 text-center font-medium">{metrics.systolic}/{metrics.diastolic}</td>
                    <td className="p-2 text-center">mmHg</td>
                    <td className="p-2 text-center">
                      <Badge variant={metrics.systolic < 120 && metrics.diastolic < 80 ? "default" : "destructive"}>
                        {metrics.systolic < 120 && metrics.diastolic < 80 ? "Normal" : "Elevated"}
                      </Badge>
                    </td>
                  </tr>
                )}
                {metrics.heartRate && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-2">Heart Rate</td>
                    <td className="p-2 text-center font-medium">{metrics.heartRate}</td>
                    <td className="p-2 text-center">bpm</td>
                    <td className="p-2 text-center">
                      <Badge variant={metrics.heartRate >= 60 && metrics.heartRate <= 100 ? "default" : "destructive"}>
                        {metrics.heartRate >= 60 && metrics.heartRate <= 100 ? "Normal" : "Abnormal"}
                      </Badge>
                    </td>
                  </tr>
                )}
                {metrics.pasp && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-2">PASP (Pulmonary Artery Systolic Pressure)</td>
                    <td className="p-2 text-center font-medium">{metrics.pasp}</td>
                    <td className="p-2 text-center">mmHg</td>
                    <td className="p-2 text-center">
                      <Badge variant={metrics.pasp < 35 ? "default" : "destructive"}>
                        {metrics.pasp < 35 ? "Normal" : "Elevated"}
                      </Badge>
                    </td>
                  </tr>
                )}
                {metrics.trVelocity && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-2">TR Velocity (Tricuspid Regurgitation)</td>
                    <td className="p-2 text-center font-medium">{metrics.trVelocity.toFixed(2)}</td>
                    <td className="p-2 text-center">m/s</td>
                    <td className="p-2 text-center">
                      <Badge variant={metrics.trVelocity < 2.8 ? "default" : "destructive"}>
                        {metrics.trVelocity < 2.8 ? "Normal" : "Elevated"}
                      </Badge>
                    </td>
                  </tr>
                )}
                {metrics.ldl && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-2">LDL Cholesterol (Bad)</td>
                    <td className="p-2 text-center font-medium">{metrics.ldl}</td>
                    <td className="p-2 text-center">mg/dL</td>
                    <td className="p-2 text-center">
                      <Badge variant={metrics.ldl < 100 ? "default" : metrics.ldl < 130 ? "secondary" : "destructive"}>
                        {metrics.ldl < 100 ? "Optimal" : metrics.ldl < 130 ? "Near Optimal" : "High"}
                      </Badge>
                    </td>
                  </tr>
                )}
                {metrics.hdl && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-2">HDL Cholesterol (Good)</td>
                    <td className="p-2 text-center font-medium">{metrics.hdl}</td>
                    <td className="p-2 text-center">mg/dL</td>
                    <td className="p-2 text-center">
                      <Badge variant={metrics.hdl >= 60 ? "default" : metrics.hdl >= 40 ? "secondary" : "destructive"}>
                        {metrics.hdl >= 60 ? "Protective" : metrics.hdl >= 40 ? "Acceptable" : "Low"}
                      </Badge>
                    </td>
                  </tr>
                )}
                {metrics.cholesterol && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-2">Total Cholesterol</td>
                    <td className="p-2 text-center font-medium">{metrics.cholesterol}</td>
                    <td className="p-2 text-center">mg/dL</td>
                    <td className="p-2 text-center">
                      <Badge variant={metrics.cholesterol < 200 ? "default" : "destructive"}>
                        {metrics.cholesterol < 200 ? "Desirable" : "High"}
                      </Badge>
                    </td>
                  </tr>
                )}
                {metrics.fastingBloodSugar && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-2">Fasting Blood Sugar</td>
                    <td className="p-2 text-center font-medium">{metrics.fastingBloodSugar}</td>
                    <td className="p-2 text-center">mg/dL</td>
                    <td className="p-2 text-center">
                      <Badge variant={metrics.fastingBloodSugar < 100 ? "default" : metrics.fastingBloodSugar < 126 ? "secondary" : "destructive"}>
                        {metrics.fastingBloodSugar < 100 ? "Normal" : metrics.fastingBloodSugar < 126 ? "Prediabetes" : "Diabetes"}
                      </Badge>
                    </td>
                  </tr>
                )}
                {metrics.bmi && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-2">Body Mass Index (BMI)</td>
                    <td className="p-2 text-center font-medium">{metrics.bmi.toFixed(1)}</td>
                    <td className="p-2 text-center">kg/m²</td>
                    <td className="p-2 text-center">
                      <Badge variant={metrics.bmi < 25 ? "default" : "destructive"}>
                        {metrics.bmi < 25 ? "Normal" : "Overweight"}
                      </Badge>
                    </td>
                  </tr>
                )}
                <tr className="hover:bg-gray-50">
                  <td className="p-2">Diabetes Status</td>
                  <td className="p-2 text-center font-medium">{metrics.diabetes ? "Yes" : "No"}</td>
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center">
                    <Badge variant={metrics.diabetes ? "destructive" : "default"}>
                      {metrics.diabetes ? "Present" : "Not Detected"}
                    </Badge>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-2">Smoking Status</td>
                  <td className="p-2 text-center font-medium">{metrics.smoker ? "Yes" : "No"}</td>
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center">
                    <Badge variant={metrics.smoker ? "destructive" : "default"}>
                      {metrics.smoker ? "Current Smoker" : "Non-Smoker"}
                    </Badge>
                  </td>
                </tr>
                {metrics.age && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-2">Age</td>
                    <td className="p-2 text-center font-medium">{metrics.age}</td>
                    <td className="p-2 text-center">years</td>
                    <td className="p-2 text-center">
                      <Badge variant={metrics.age < 45 ? "default" : "secondary"}>
                        {metrics.age < 45 ? "Lower Risk" : "Increased Risk"}
                      </Badge>
                    </td>
                  </tr>
                )}
                {metrics.sex && (
                  <tr className="hover:bg-gray-50">
                    <td className="p-2">Gender</td>
                    <td className="p-2 text-center font-medium capitalize">{metrics.sex}</td>
                    <td className="p-2 text-center">-</td>
                    <td className="p-2 text-center">
                      <Badge variant="outline">Identified</Badge>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 3. RISK SCORE BREAKDOWN (Explainable AI) */}
      <Card className="border shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-600" />
            3. Risk Score Breakdown (Explainable AI)
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Transparent scoring showing how each factor contributes to your overall risk
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {riskBreakdown.breakdown.map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.factor}</span>
                <span className={cn("font-bold", item.color)}>
                  {item.score} / {item.max} points
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={cn("h-2 rounded-full", 
                      item.score > item.max * 0.6 ? "bg-red-500" :
                      item.score > item.max * 0.3 ? "bg-yellow-500" : "bg-green-500"
                    )}
                    style={{ width: `${(item.score / item.max) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-24 text-right">{item.impact}</span>
              </div>
            </div>
          ))}
          <Separator className="my-3" />
          <div className="bg-gray-100 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="font-bold">Total Risk Score</span>
              <span className="text-2xl font-bold">
                {riskBreakdown.totalScore} / {riskBreakdown.maxScore}
              </span>
            </div>
            <div className="mt-2">
              <div className="bg-gray-300 rounded-full h-3">
                <div 
                  className={cn("h-3 rounded-full",
                    (riskBreakdown.totalScore / riskBreakdown.maxScore) > 0.6 ? "bg-red-600" :
                    (riskBreakdown.totalScore / riskBreakdown.maxScore) > 0.3 ? "bg-yellow-500" : "bg-green-600"
                  )}
                  style={{ width: `${(riskBreakdown.totalScore / riskBreakdown.maxScore) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-center mt-2 font-medium">
              Final Category: <Badge className={cn(
                result.category === 'High' ? 'bg-red-600' :
                result.category === 'Moderate' ? 'bg-yellow-600' :
                result.category === 'Low' ? 'bg-blue-600' : 'bg-green-600'
              )}>{result.category} Risk</Badge>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 4. CONFIDENCE SCORE */}
      <Card className="border shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-600" />
            4. Confidence Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Overall Confidence</span>
              <p className="text-xs text-gray-500 mt-0.5">Weighted score with data quality adjustments</p>
            </div>
            <span className="text-2xl font-bold text-purple-600">{Math.round((result.confidence || 0) * 100)}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-3">
            <div 
              className="bg-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(result.confidence || 0) * 100}%` }}
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <p className="text-xs font-semibold text-blue-800 mb-2">Confidence Breakdown:</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Data (40%)</p>
                <p className="text-lg font-bold text-blue-600">
                  {Math.round((result.confidenceMeta?.breakdown?.dataCompleteness || 0) * 100)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Markers (40%)</p>
                <p className="text-lg font-bold text-green-600">
                  {Math.round((result.confidenceMeta?.breakdown?.keyMarkerQuality || 0) * 100)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Context (20%)</p>
                <p className="text-lg font-bold text-purple-600">
                  {Math.round((result.confidenceMeta?.breakdown?.clinicalContext || 0) * 100)}%
                </p>
              </div>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Understanding Your Confidence Score:</strong>
              <ul className="mt-2 ml-4 space-y-1.5">
                <li>
                  <strong>Data Completeness ({Math.round((result.confidenceMeta?.breakdown?.dataCompleteness || 0) * 100)}%):</strong> How many important health parameters were extracted from your report. We found {Object.keys(metrics).filter(k => metrics[k as keyof typeof metrics] !== undefined).length} out of 13 key parameters.
                </li>
                <li>
                  <strong>Marker Quality ({Math.round((result.confidenceMeta?.breakdown?.keyMarkerQuality || 0) * 100)}%):</strong> Presence of critical cardiac markers like Ejection Fraction (EF), Blood Pressure, and Cholesterol levels. {metrics.ejectionFraction ? '✓ EF detected' : '✗ EF missing'}, {metrics.systolic ? '✓ BP detected' : '✗ BP missing'}, {(metrics.cholesterol || metrics.hdl || metrics.ldl) ? '✓ Lipids detected' : '✗ Lipids missing'}.
                </li>
                <li>
                  <strong>Clinical Context ({Math.round((result.confidenceMeta?.breakdown?.clinicalContext || 0) * 100)}%):</strong> Assessment reliability based on your risk score ({result.score}/20) and severity of findings. {result.score && result.score > 10 ? 'High risk detected - confidence boosted' : result.score && result.score > 6 ? 'Moderate risk detected' : 'Low risk detected'}.
                </li>
                <li className="mt-2 pt-2 border-t">
                  <strong>Final Score Calculation:</strong> We use a weighted formula (Data: 40%, Markers: 40%, Context: 20%) with adjustments for missing critical data. {result.confidence && result.confidence < 0.5 ? '⚠️ Lower confidence suggests uploading a clearer image or complete report for better accuracy.' : '✓ Good confidence level for preliminary assessment.'}
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* 5. PERSONALIZED PLAN */}
      <Card className="border shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-green-600" />
            5. Personalized Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="height" className="text-xs flex items-center gap-1">
                <Ruler className="h-3 w-3" />Height (cm)
              </Label>
              <Input id="height" type="number" placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)} className="h-8" />
            </div>
            <div>
              <Label htmlFor="weight" className="text-xs flex items-center gap-1">
                <Scale className="h-3 w-3" />Weight (kg)
              </Label>
              <Input id="weight" type="number" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-8" />
            </div>
          </div>

          {bmi && (
            <>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border-2">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-600">Your BMI</p>
                    <p className="text-3xl font-bold">{bmi}</p>
                  </div>
                  <Badge className={cn("px-3 py-1", bmiCategory?.color)}>{bmiCategory?.label}</Badge>
                </div>
                <p className="text-sm font-medium">{bmiCategory?.risk}</p>
              </div>

              <Alert className={cn(
                parseFloat(bmi) >= 30 ? "bg-red-50 border-red-300" :
                parseFloat(bmi) >= 25 ? "bg-orange-50 border-orange-300" :
                "bg-green-50 border-green-300"
              )}>
                <Heart className="h-4 w-4" />
                <AlertDescription>
                  <strong>Your Obesity-CVD Risk Assessment:</strong>
                  <p className="text-xs mt-1">
                    {parseFloat(bmi) >= 35 ? 
                      `Class II/III Obesity (BMI ${bmi}): CRITICAL - Your cardiovascular risk is 2-3x higher than normal weight. Immediate medical weight loss intervention recommended (medication, bariatric surgery evaluation).` :
                      parseFloat(bmi) >= 30 ? 
                      `Class I Obesity (BMI ${bmi}): Your CVD risk is increased by 40-70%. Weight loss of ${(parseFloat(weight) * 0.1).toFixed(1)}kg would significantly reduce heart disease risk. Each 1kg lost improves blood pressure and cholesterol.` :
                      parseFloat(bmi) >= 27 && ((result.metrics as any).diabetes || (result.metrics as any).systolic >= 140) ?
                      `Overweight with risk factors (BMI ${bmi}): Your combination of excess weight + ${(result.metrics as any).diabetes ? 'diabetes' : 'hypertension'} significantly increases CVD risk. Medical weight loss recommended.` :
                      parseFloat(bmi) >= 25 ?
                      `Overweight (BMI ${bmi}): CVD risk is moderately increased. Losing ${(parseFloat(weight) * 0.07).toFixed(1)}kg (7% body weight) reduces risk by 30-50%. Focus on diet + exercise.` :
                      parseFloat(bmi) >= 18.5 ?
                      `Healthy Weight (BMI ${bmi}): Excellent! Your weight is protective against CVD. Maintain current habits with balanced diet and regular exercise.` :
                      `Underweight (BMI ${bmi}): May indicate nutritional deficiency. Ensure adequate protein and nutrient intake. Consider medical evaluation.`}
                  </p>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h5 className="font-semibold text-sm">Personalized Lifestyle Plan (Priority Order):</h5>
                <div className="space-y-1.5 text-xs">
                  {/* PRIORITY 1: Smoking cessation - ALWAYS FIRST if smoker */}
                  {(result.metrics as any).smoker && (
                    <div className="flex gap-2 p-2 bg-red-50 rounded border-l-4 border-red-600 shadow-md animate-pulse">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <span><strong className="text-red-700">🚨 #1 URGENT - Quit Smoking:</strong> <span className="text-red-900">HIGHEST PRIORITY!</span> Smoking with your risk profile dramatically increases heart attack/stroke risk by 2-4x. Use nicotine replacement, medications (varenicline/Chantix, bupropion/Zyban), or behavioral therapy. Call quitline: 1-800-QUIT-NOW (free counseling).</span>
                    </div>
                  )}

                  {/* PRIORITY 2: Critical weight if BMI ≥30 */}
                  {parseFloat(bmi) >= 30 && (
                    <div className="flex gap-2 p-2 bg-red-50 rounded border-l-4 border-red-500">
                      <Scale className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <span><strong className="text-red-700">⚠️ CRITICAL Weight Goal:</strong> Your BMI {bmi} indicates obesity (CVD risk +40-70%). <strong>Target:</strong> Lose 5-10% ({(parseFloat(weight) * 0.05).toFixed(1)}-{(parseFloat(weight) * 0.10).toFixed(1)} kg) in 3-6 months. Consider medical weight loss program with doctor supervision.</span>
                    </div>
                  )}

                  {/* PRIORITY 3: Strict diet if critical values */}
                  {((result.metrics as any).ldl >= 160 || (result.metrics as any).systolic >= 140 || (result.metrics as any).diabetes) && (
                    <div className="flex gap-2 p-2 bg-red-50 rounded border-l-4 border-red-500">
                      <Heart className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <span><strong className="text-red-700">Diet (Strict - Required):</strong> {
                        (result.metrics as any).ldl >= 160 ? 'Low-cholesterol diet (<200mg/day cholesterol, <7% saturated fat). ' : ''
                      }{
                        (result.metrics as any).systolic >= 140 ? 'DASH diet with sodium <1,500mg/day (avoid processed foods, canned soups). ' : ''
                      }{
                        (result.metrics as any).diabetes ? 'Low-glycemic index foods, count carbs (45-60g per meal), avoid refined sugars, monitor blood glucose.' : ''
                      }</span>
                    </div>
                  )}

                  {/* PRIORITY 4: BP Monitoring if elevated */}
                  {(result.metrics as any).systolic >= 140 && (
                    <div className="flex gap-2 p-2 bg-red-50 rounded border-l-4 border-red-500">
                      <Activity className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <span><strong className="text-red-700">BP Monitoring (Daily):</strong> Your BP {(result.metrics as any).systolic}/{(result.metrics as any).diastolic || '?'} mmHg is HIGH. Check blood pressure twice daily (morning & evening) at same time. Log readings. Target: &lt;130/80 mmHg. Contact doctor if consistently &gt;140/90.</span>
                    </div>
                  )}

                  {/* PRIORITY 5: Medication adherence - high/moderate risk */}
                  {(result.category === "High" || result.category === "Moderate") && (
                    <div className="flex gap-2 p-2 bg-amber-50 rounded border-l-4 border-amber-500">
                      <Heart className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <span><strong className="text-amber-700">Medications (Critical):</strong> Take ALL prescribed medications exactly as directed. Don't skip doses even if feeling better. Use pill organizer with alarm reminders. Report side effects to doctor immediately - NEVER stop cardiac medications without consulting them first (can cause rebound effects).</span>
                    </div>
                  )}

                  {/* PRIORITY 6: Exercise - based on risk and EF */}
                  {result.category === "High" || (result.metrics as any).ejectionFraction < 45 ? (
                    <div className="flex gap-2 p-2 bg-amber-50 rounded border-l-4 border-amber-500">
                      <Activity className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <span><strong className="text-amber-700">Exercise (Supervised Only):</strong> Start with light activity (5-10min slow walking). <strong>MUST get doctor clearance</strong> before increasing intensity. Consider cardiac rehabilitation program (supervised exercise with heart monitoring).</span>
                    </div>
                  ) : result.category === "Moderate" ? (
                    <div className="flex gap-2 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                      <Activity className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span><strong>Exercise (Moderate):</strong> 30min daily moderate activity (brisk walking, cycling). Build up gradually over 4-6 weeks. Monitor heart rate (target: 50-70% max). Stop if chest pain/dizziness occurs.</span>
                    </div>
                  ) : (
                    <div className="flex gap-2 p-2 bg-green-50 rounded border-l-4 border-green-500">
                      <Activity className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span><strong>Exercise (Recommended):</strong> 150min moderate activity/week (30min x 5 days: brisk walk, swim, cycling) PLUS 2 days strength training. Maintains cardiovascular health.</span>
                    </div>
                  )}

                  {/* PRIORITY 7: Moderate diet if needed */}
                  {!((result.metrics as any).ldl >= 160 || (result.metrics as any).systolic >= 140 || (result.metrics as any).diabetes) && 
                   ((result.metrics as any).ldl >= 130 || (result.metrics as any).systolic >= 130) && (
                    <div className="flex gap-2 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                      <Heart className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span><strong>Diet (Heart-Healthy):</strong> Mediterranean diet - increase fiber (25-30g/day from oats, beans, vegetables), omega-3 (fatty fish 2x/week), nuts, olive oil. Limit sodium &lt;2,300mg/day, reduce saturated fats.</span>
                    </div>
                  )}

                  {/* PRIORITY 8: Moderate weight loss if overweight but not obese */}
                  {parseFloat(bmi) >= 25 && parseFloat(bmi) < 30 && (
                    <div className="flex gap-2 p-2 bg-orange-50 rounded border-l-4 border-orange-500">
                      <Scale className="h-5 w-5 text-orange-600 flex-shrink-0" />
                      <span><strong>Weight Goal:</strong> Lose 5-10% ({(parseFloat(weight) * 0.05).toFixed(1)}-{(parseFloat(weight) * 0.10).toFixed(1)} kg) gradually (0.5-1kg/week) for significant CVD risk reduction. Create 500 calorie/day deficit (diet + exercise).</span>
                    </div>
                  )}

                  {/* PRIORITY 9: BP monitoring if elevated but not high */}
                  {(result.metrics as any).systolic >= 130 && (result.metrics as any).systolic < 140 && (
                    <div className="flex gap-2 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                      <Activity className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span><strong>BP Monitoring:</strong> Check blood pressure 3x/week at same time. Your current BP: {(result.metrics as any).systolic}/{(result.metrics as any).diastolic || '?'} mmHg (elevated). Target: &lt;130/80 mmHg through lifestyle changes.</span>
                    </div>
                  )}

                  {/* PRIORITY 10: General healthy diet if no issues */}
                  {!((result.metrics as any).ldl >= 130 || (result.metrics as any).systolic >= 130 || (result.metrics as any).diabetes) && (
                    <div className="flex gap-2 p-2 bg-green-50 rounded border-l-4 border-green-500">
                      <Heart className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span><strong>Diet (Maintain):</strong> Continue balanced Mediterranean diet with fruits, vegetables, whole grains, lean proteins, healthy fats. Keep up good eating habits!</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 6. ACTION PLAN (WHO/ACC/AHA Evidence-Based) */}
      <Card className="border shadow-md border-green-200">
        <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            6. Action Plan (Evidence-Based Guidelines)
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Based on WHO, ACC/AHA, and ESC clinical practice guidelines
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {result.recommendations?.items.slice(0, 6).map((rec, i) => {
              const colors = {
                urgent: 'border-l-red-500 bg-red-50',
                high: 'border-l-orange-500 bg-orange-50',
                medium: 'border-l-blue-500 bg-blue-50',
                low: 'border-l-green-500 bg-green-50'
              };
              return (
                <div key={i} className={cn("flex gap-3 p-3 rounded-lg border-l-4", colors[rec.priority] || colors.medium)}>
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-600 text-white text-sm flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-1 text-xs">{rec.category}</Badge>
                    <p className="text-sm font-medium">{rec.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* FOR NORMAL/LOW/MODERATE RISK: SHOW URGENCY/TRIAGE IN ORIGINAL POSITION */}
      {!isHighRisk && (
        <>
          {/* 7. URGENCY / TRIAGE LEVEL */}
          <Card className={cn("border shadow-md", urgency.pulse && "animate-pulse")}>
            <div className={cn("h-1", urgency.bg)} />
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                7. Urgency / Triage Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("rounded-lg p-3", urgency.bg, urgency.text)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{urgency.icon}</span>
                    <div>
                      <p className="text-lg font-bold">{urgency.level}</p>
                      <p className="text-xs opacity-90 mt-0.5">
                        {result.triage?.action || 'Continue routine monitoring'}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-white/20 border-0 text-inherit px-3 py-1 text-sm font-bold">
                    {result.triage?.timeWindow || 'As scheduled'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 8. EMERGENCY WARNING SECTION */}
          {result.triage?.warningSigns && result.triage.warningSigns.length > 0 && (
            <Card className="border-2 border-red-300 bg-red-50 shadow-lg">
              <div className="h-2 bg-red-600" />
              <CardHeader className="pb-3">
                <CardTitle className="text-red-900 flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6" />
                  8. Emergency Warning Section
                </CardTitle>
                <p className="text-red-800 font-bold text-sm mt-2">
                  🚨 Call emergency services immediately (India: 112 | USA: 911) if you experience:
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.triage.warningSigns.map((sign, i) => (
                    <div key={i} className="flex gap-3 items-start p-3 bg-white rounded-lg border-l-4 border-red-600 shadow-sm">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-600 text-white text-sm flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <p className="text-sm text-red-900 font-medium flex-1 pt-1">{sign}</p>
                    </div>
                  ))}
                </div>
                <Alert className="mt-4 bg-white border-red-300">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-xs text-red-900">
                    <strong>Do not delay:</strong> Cardiac emergencies require immediate medical attention. 
                    Time is critical - early treatment can save lives and prevent heart damage.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* 9. HEALTH NUMBERS */}
      <Card className="border shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            9. Health Numbers Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {metrics.age && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center border border-purple-200">
                <Calendar className="h-5 w-5 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">{metrics.age}</p>
                <p className="text-xs text-purple-700 font-medium">Years Old</p>
              </div>
            )}
            {metrics.sex && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200">
                <User className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900 capitalize">{metrics.sex}</p>
                <p className="text-xs text-blue-700 font-medium">Gender</p>
              </div>
            )}
            {metrics.bmi && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center border border-green-200">
                <Scale className="h-5 w-5 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">{metrics.bmi.toFixed(1)}</p>
                <p className="text-xs text-green-700 font-medium">BMI</p>
              </div>
            )}
            {bmi && (
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center border border-orange-200">
                <Activity className="h-5 w-5 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-900">{bmiCategory?.label}</p>
                <p className="text-xs text-orange-700 font-medium">BMI Class</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* DISCLAIMER */}
      <Alert className="border-2">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Medical Disclaimer:</strong> This Stage-1 analysis is for informational and educational purposes only. 
          It does not constitute medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals 
          for personalized medical guidance. Data is processed locally and not stored on any servers.
        </AlertDescription>
      </Alert>
    </div>
  );
}

