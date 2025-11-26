import { HeartAnalysis } from "@/lib/triage-engine/types";
import { AlertCircle, Clock, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface TriageDisplayProps {
  analysis: HeartAnalysis;
  className?: string;
}

export function TriageDisplay({ analysis, className }: TriageDisplayProps) {
  const { triage, category, confidence } = analysis;

  if (!triage) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "immediate":
        return "bg-red-100 border-red-500 text-red-900";
      case "urgent":
        return "bg-orange-100 border-orange-500 text-orange-900";
      case "semi-urgent":
        return "bg-yellow-100 border-yellow-500 text-yellow-900";
      case "non-urgent":
        return "bg-blue-100 border-blue-500 text-blue-900";
      default:
        return "bg-gray-100 border-gray-500 text-gray-900";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "immediate":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "urgent":
        return <Clock className="h-5 w-5 text-orange-600" />;
      case "semi-urgent":
        return <Activity className="h-5 w-5 text-yellow-600" />;
      default:
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <Card className={cn("border-2", getPriorityColor(triage.priority), className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPriorityIcon(triage.priority)}
            <CardTitle className="text-lg">{triage.level}</CardTitle>
          </div>
          <Badge variant={triage.priority === "IMMEDIATE" ? "destructive" : "default"}>
            {triage.priority}
          </Badge>
        </div>
        <CardDescription className="text-sm font-medium">
          {triage.timeWindow}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary Reason Alert */}
        <Alert variant={triage.priority === "IMMEDIATE" ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Primary Concern</AlertTitle>
          <AlertDescription>{triage.reason}</AlertDescription>
        </Alert>

        {/* Action Required */}
        {triage.action && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recommended Action
            </h4>
            <p className="text-sm text-muted-foreground pl-6">{triage.action}</p>
          </div>
        )}

        {/* Warning Signs */}
        {triage.warningSigns && triage.warningSigns.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Warning Signs to Monitor
            </h4>
            <ul className="text-sm space-y-1 pl-6 list-disc text-muted-foreground">
              {triage.warningSigns.map((sign, idx) => (
                <li key={idx}>{sign}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Steps Checklist */}
        {triage.nextStepsChecklist && triage.nextStepsChecklist.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Next Steps Checklist
            </h4>
            <div className="space-y-1.5 pl-6">
              {triage.nextStepsChecklist.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="mt-1 h-4 w-4 rounded-sm border border-input bg-background" />
                  <span className="text-sm text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confidence Indicator */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Assessment Confidence</span>
            <span className="font-medium">{Math.round(confidence * 100)}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                confidence >= 0.7 ? "bg-green-500" : confidence >= 0.4 ? "bg-yellow-500" : "bg-red-500"
              )}
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
