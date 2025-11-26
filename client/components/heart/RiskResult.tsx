import { HeartAnalysis } from "@/lib/heart-analyzer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Activity, MinusCircle } from "lucide-react";
import { TriageDisplay } from "@/components/triage/TriageDisplay";
import { RiskScore } from "@/components/triage/RiskScore";
import { RecommendationsList } from "@/components/triage/RecommendationsList";
import { ConfidenceIndicator } from "@/components/triage/ConfidenceIndicator";
import { ObesityRiskPanel } from "@/components/heart/ObesityRiskPanel";
import {
  ChartContainer,
} from "@/components/ui/chart";
import {
  RadialBarChart,
  PolarAngleAxis,
  RadialBar,
  Label,
} from "recharts";

export type RiskResultProps = {
  result: HeartAnalysis | null;
  fileName?: string;
  file?: File;
};

const colorFor = (category: HeartAnalysis["category"]) => {
  switch (category) {
    case "High":
      return { bg: "bg-red-500/10", text: "text-red-600", dot: "bg-red-500", badge: "bg-red-600 text-white" };
    case "Moderate":
      return { bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500", badge: "bg-amber-600 text-white" };
    case "Low":
      return { bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500", badge: "bg-emerald-600 text-white" };
    case "Normal":
    default:
      return { bg: "bg-blue-500/10", text: "text-blue-600", dot: "bg-blue-500", badge: "bg-blue-600 text-white font-medium" };
  }
};

const iconFor = (category: HeartAnalysis["category"]) => {
  switch (category) {
    case "High":
      return AlertTriangle;
    case "Moderate":
      return Activity;
    case "Low":
      return CheckCircle2;
    case "Normal":
    default:
      return MinusCircle;
  }
};

export function RiskResult({ result, fileName, file }: RiskResultProps) {
  if (!result) return null;
  const colors = colorFor(result.category);
  const Icon = iconFor(result.category);

  const chartData = [{ name: "risk", value: Math.max(5, result.normalizedRiskPercent), fill: "hsl(var(--primary))" }];

  // Check if the uploaded file is an image
  const isImageFile = file && file.type.startsWith('image/');
  const imageUrl = isImageFile ? URL.createObjectURL(file) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-full", colors.bg)}>
            <Icon className={cn("h-5 w-5", colors.text)} />
          </span>
          Heart Disease Risk Assessment
        </CardTitle>
        <CardDescription>
          {fileName ? <>Analysed report: <span className="font-medium text-foreground">{fileName}</span></> : "Analysis complete"}
          {(result.metrics as any).patientName && (
            <div className="mt-1 text-sm">
              Patient: <span className="font-medium text-foreground">{(result.metrics as any).patientName}</span>
            </div>
          )}
          {result.parsedTextPreview && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                View extracted text (debug)
              </summary>
              <pre className="mt-1 max-h-32 overflow-y-auto rounded bg-muted p-2 text-xs">
                {result.parsedTextPreview}
              </pre>
            </details>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New Triage Components Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <RiskScore analysis={result} showDetails={true} />
          {result.triage && <TriageDisplay analysis={result} />}
        </div>
        
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left side - Report Image or Chart */}
          <div className="lg:col-span-2 space-y-4">
            {isImageFile && imageUrl ? (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Uploaded Report</h3>
                <div className="relative rounded-lg border bg-muted/30 p-2">
                  <img 
                    src={imageUrl} 
                    alt="Medical Report" 
                    className="w-full h-auto max-h-96 object-contain rounded-md"
                    onLoad={() => {
                      // Clean up the object URL when image loads
                      if (imageUrl) URL.revokeObjectURL(imageUrl);
                    }}
                  />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/80 backdrop-blur-sm rounded-md px-3 py-2 text-white text-xs">
                      📄 {fileName}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Risk Assessment</h3>
                <div className="flex flex-col items-center justify-center">
                  <ChartContainer
                    config={{ risk: { label: "Risk", color: "hsl(var(--primary))" } }}
                    className="mx-auto aspect-square max-w-[200px]"
                  >
                    <RadialBarChart
                      data={chartData}
                      startAngle={90}
                      endAngle={-270}
                      innerRadius={60}
                      outerRadius={90}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar dataKey="value" cornerRadius={10} background />
                      <Label
                        position="center"
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                <tspan className="fill-foreground text-3xl font-bold">{result.normalizedRiskPercent}%</tspan>
                                <tspan className={cn("fill-muted-foreground text-sm", "block")}>overall risk</tspan>
                              </text>
                            );
                          }
                          return null;
                        }}
                      />
                    </RadialBarChart>
                  </ChartContainer>
                  <div className="mt-3">
                    <Badge className={cn(colors.badge, "px-3 py-1")}>{result.category}</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right side - Analysis Results */}
          <div className="lg:col-span-3 space-y-5">
            {/* Show chart here if image is displayed on left */}
            {isImageFile && (
              <div className="flex items-center justify-center space-x-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{result.normalizedRiskPercent}%</div>
                  <div className="text-sm text-muted-foreground">Risk Score</div>
                </div>
                <div className="h-8 w-px bg-border"></div>
                <div className="text-center">
                  <Badge className={cn(colors.badge, "text-lg px-4 py-2")}>{result.category}</Badge>
                  <div className="text-sm text-muted-foreground mt-1">Risk Level</div>
                </div>
              </div>
            )}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Confidence</span>
              <span className="text-sm font-medium">{Math.round(result.confidence * 100)}%</span>
            </div>
            <Progress value={Math.round(result.confidence * 100)} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Key factors</p>
            <ul className="grid list-disc gap-2 pl-5">
              {result.reasons.length ? result.reasons.map((r, i) => (
                <li key={i} className="text-sm text-foreground/90">{r}</li>
              )) : <li className="text-sm text-foreground/90">No notable risk factors detected in the provided text.</li>}
            </ul>
          </div>
          
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-green-50 p-4 dark:from-blue-950/20 dark:to-green-950/20">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Medical Recommendations
              </h3>
              <div className="mt-3 space-y-2">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="text-sm text-blue-800 dark:text-blue-200">
                    {rec.startsWith('🚨') ? (
                      <div className="font-semibold text-red-700 dark:text-red-300">{rec}</div>
                    ) : rec.startsWith('⚠️') ? (
                      <div className="font-medium text-amber-700 dark:text-amber-300">{rec}</div>
                    ) : rec.startsWith('✅') ? (
                      <div className="font-medium text-green-700 dark:text-green-300">{rec}</div>
                    ) : rec.startsWith('🏥') ? (
                      <div className="font-medium text-blue-700 dark:text-blue-300 mt-3">{rec}</div>
                    ) : rec.startsWith('•') ? (
                      <div className="ml-4 text-gray-700 dark:text-gray-300">{rec}</div>
                    ) : (
                      <div>{rec}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <MetricsGrid result={result} />
          {(result.metrics as any).cardiacRecommendations && (
            <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950/20">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Cardiac Assessment Summary
              </h3>
              <ul className="mt-2 space-y-1">
                {(result.metrics as any).cardiacRecommendations.map((rec: string, i: number) => (
                  <li key={i} className="text-sm text-blue-800 dark:text-blue-200">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <CardiacGuidance result={result} />
          </div>
        </div>
        
        {/* Obesity Risk Assessment */}
        <ObesityRiskPanel analysis={result} />

        {/* Advanced Triage Recommendations */}
        {result.recommendations && (
          <RecommendationsList analysis={result} priorityOnly={false} />
        )}
        
        {/* Confidence Indicator */}
        <ConfidenceIndicator analysis={result} showDetails={true} />
        
        <p className="text-xs text-muted-foreground">
          This assessment is for information only and not a medical diagnosis. Consult a licensed clinician for personalized guidance.
        </p>
      </CardContent>
    </Card>
  );
}

function CardiacGuidance({ result }: { result: HeartAnalysis }) {
  const ejectionFraction = (result.metrics as any).ejectionFraction;
  const cardiacAbnormalities = (result.metrics as any).cardiacAbnormalities || [];
  
  // Determine overall cardiac status
  const hasNormalEF = ejectionFraction && ejectionFraction >= 55;
  const hasSevereFindings = cardiacAbnormalities.some((a: string) => a.toLowerCase().includes("severe"));
  const hasMultipleFindings = cardiacAbnormalities.length > 2;
  
  let status = "Normal";
  let alertType = "success";
  let recommendations = [];
  
  if (hasSevereFindings) {
    status = "Attention Required";
    alertType = "error";
    recommendations = [
      "Schedule follow-up with cardiologist within 2-4 weeks",
      "Continue prescribed medications as directed",
      "Monitor symptoms (chest pain, shortness of breath, fatigue)",
      "Avoid strenuous activities until cleared by doctor"
    ];
  } else if (hasMultipleFindings && !hasNormalEF) {
    status = "Monitoring Needed";
    alertType = "warning";
    recommendations = [
      "Regular cardiology follow-up recommended",
      "Maintain heart-healthy lifestyle",
      "Monitor blood pressure and weight",
      "Take medications as prescribed"
    ];
  } else if (hasNormalEF && cardiacAbnormalities.length <= 2) {
    status = "Generally Good";
    alertType = "success";
    recommendations = [
      "Heart function appears normal",
      "Continue healthy lifestyle habits",
      "Regular check-ups as scheduled",
      "Report any new symptoms to your doctor"
    ];
  }
  
  const alertStyles = {
    success: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/20 dark:text-green-200",
    warning: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-200",
    error: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/20 dark:text-red-200"
  };
  
  return (
    <div className={`rounded-lg border p-4 ${alertStyles[alertType as keyof typeof alertStyles]}`}>
      <h3 className="font-semibold flex items-center gap-2">
        {alertType === "success" && <CheckCircle2 className="h-5 w-5" />}
        {alertType === "warning" && <AlertTriangle className="h-5 w-5" />}
        {alertType === "error" && <AlertTriangle className="h-5 w-5" />}
        Cardiac Status: {status}
      </h3>
      <div className="mt-3">
        <p className="font-medium text-sm">Recommendations:</p>
        <ul className="mt-1 space-y-1">
          {recommendations.map((rec, i) => (
            <li key={i} className="text-sm">• {rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MetricsGrid({ result }: { result: HeartAnalysis }) {
  const m = result.metrics;
  
  // Helper function to determine value status and color
  const getValueStatus = (type: string, value: number | undefined) => {
    if (value === undefined) return null;
    
    switch (type) {
      case 'ejectionFraction':
        if (value >= 55) return { status: 'Normal', color: 'text-green-600 bg-green-50 dark:bg-green-950/20' };
        if (value >= 50) return { status: 'Mild', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' };
        return { status: 'Severe', color: 'text-red-600 bg-red-50 dark:bg-red-950/20' };
      
      case 'systolic':
        if (value <= 120) return { status: 'Normal', color: 'text-green-600 bg-green-50 dark:bg-green-950/20' };
        if (value <= 139) return { status: 'Elevated', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' };
        return { status: 'High', color: 'text-red-600 bg-red-50 dark:bg-red-950/20' };
      
      case 'diastolic':
        if (value <= 80) return { status: 'Normal', color: 'text-green-600 bg-green-50 dark:bg-green-950/20' };
        if (value <= 89) return { status: 'Elevated', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' };
        return { status: 'High', color: 'text-red-600 bg-red-50 dark:bg-red-950/20' };
      
      case 'cholesterol':
        if (value < 200) return { status: 'Normal', color: 'text-green-600 bg-green-50 dark:bg-green-950/20' };
        if (value <= 239) return { status: 'Borderline', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' };
        return { status: 'High', color: 'text-red-600 bg-red-50 dark:bg-red-950/20' };
      
      case 'ldl':
        if (value < 100) return { status: 'Optimal', color: 'text-green-600 bg-green-50 dark:bg-green-950/20' };
        if (value <= 159) return { status: 'Borderline', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' };
        return { status: 'High', color: 'text-red-600 bg-red-50 dark:bg-red-950/20' };
      
      case 'hdl':
        if (value >= 60) return { status: 'Good', color: 'text-green-600 bg-green-50 dark:bg-green-950/20' };
        if (value >= 40) return { status: 'Acceptable', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' };
        return { status: 'Low', color: 'text-red-600 bg-red-50 dark:bg-red-950/20' };
      
      case 'glucose':
        if (value < 100) return { status: 'Normal', color: 'text-green-600 bg-green-50 dark:bg-green-950/20' };
        if (value <= 125) return { status: 'Pre-diabetic', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' };
        return { status: 'Diabetic', color: 'text-red-600 bg-red-50 dark:bg-red-950/20' };
      
      case 'bmi':
        if (value < 18.5) return { status: 'Underweight', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' };
        if (value <= 24.9) return { status: 'Normal', color: 'text-green-600 bg-green-50 dark:bg-green-950/20' };
        if (value <= 29.9) return { status: 'Overweight', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' };
        return { status: 'Obese', color: 'text-red-600 bg-red-50 dark:bg-red-950/20' };
      
      default:
        return { status: '', color: 'text-gray-600 bg-gray-50 dark:bg-gray-950/20' };
    }
  };
  
  const Item = ({ label, value, unit, type }: { 
    label: string; 
    value: number | string | boolean; 
    unit?: string;
    type?: string;
  }) => {
    const numValue = typeof value === 'number' ? value : undefined;
    const status = type && numValue ? getValueStatus(type, numValue) : null;
    
    return (
      <div className={`rounded-lg border p-3 ${status?.color || 'bg-card'}`}>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 font-medium flex items-center justify-between">
          <span>{value}{unit}</span>
          {status && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full border">
              {status.status}
            </span>
          )}
        </div>
      </div>
    );
  };
  
  // Only show items that have values
  const items = [];
  
  if (m.age) items.push(<Item key="age" label="Age" value={m.age} unit=" years" />);
  if (m.sex) items.push(<Item key="sex" label="Sex" value={m.sex} />);
  
  if ((m as any).ejectionFraction) {
    items.push(
      <Item 
        key="ef" 
        label="Ejection Fraction" 
        value={(m as any).ejectionFraction} 
        unit="%" 
        type="ejectionFraction"
      />
    );
  }
  
  if (m.systolic) {
    items.push(
      <Item 
        key="sys" 
        label="Systolic BP" 
        value={m.systolic} 
        unit=" mmHg" 
        type="systolic"
      />
    );
  }
  
  if (m.diastolic) {
    items.push(
      <Item 
        key="dia" 
        label="Diastolic BP" 
        value={m.diastolic} 
        unit=" mmHg" 
        type="diastolic"
      />
    );
  }
  
  if (m.cholesterol) {
    items.push(
      <Item 
        key="chol" 
        label="Total Cholesterol" 
        value={m.cholesterol} 
        unit=" mg/dL" 
        type="cholesterol"
      />
    );
  }
  
  if (m.ldl) {
    items.push(
      <Item 
        key="ldl" 
        label="LDL Cholesterol" 
        value={m.ldl} 
        unit=" mg/dL" 
        type="ldl"
      />
    );
  }
  
  if (m.hdl) {
    items.push(
      <Item 
        key="hdl" 
        label="HDL Cholesterol" 
        value={m.hdl} 
        unit=" mg/dL" 
        type="hdl"
      />
    );
  }
  
  if (m.fastingBloodSugar) {
    items.push(
      <Item 
        key="glucose" 
        label="Fasting Glucose" 
        value={m.fastingBloodSugar} 
        unit=" mg/dL" 
        type="glucose"
      />
    );
  }
  
  if (m.heartRate) {
    items.push(<Item key="hr" label="Heart Rate" value={m.heartRate} unit=" bpm" />);
  }
  
  if (m.bmi) {
    items.push(
      <Item 
        key="bmi" 
        label="BMI" 
        value={m.bmi} 
        unit="" 
        type="bmi"
      />
    );
  }
  
  if (m.smoker !== undefined) {
    items.push(<Item key="smoker" label="Smoker" value={m.smoker ? "Yes" : "No"} />);
  }
  
  if (m.diabetes !== undefined) {
    items.push(<Item key="diabetes" label="Diabetes" value={m.diabetes ? "Yes" : "No"} />);
  }
  
  // Show cardiac abnormalities if present
  const cardiacAbnormalities = (m as any).cardiacAbnormalities || [];
  if (cardiacAbnormalities.length > 0) {
    items.push(
      <div key="cardiac" className="col-span-full rounded-lg border bg-red-50 dark:bg-red-950/20 p-3">
        <div className="text-xs text-muted-foreground">Cardiac Findings</div>
        <div className="mt-1 space-y-1">
          {cardiacAbnormalities.map((abnormality: string, index: number) => (
            <div key={index} className="text-sm font-medium text-red-700 dark:text-red-300">
              • {abnormality}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
        Extracted Health Metrics ({items.length} values found)
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items}
      </div>
    </div>
  );
}
