import { HeartAnalysis } from "@/lib/triage-engine/types";
import { Activity, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface RiskScoreProps {
  analysis: HeartAnalysis;
  className?: string;
  showDetails?: boolean;
}

export function RiskScore({ analysis, className, showDetails = true }: RiskScoreProps) {
  const { normalizedRiskPercent, category, scoring, categoryMeta } = analysis;

  const getCategoryIcon = () => {
    switch (category) {
      case "High":
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case "Moderate":
        return <Info className="h-6 w-6 text-yellow-600" />;
      case "Low":
        return <Activity className="h-6 w-6 text-blue-600" />;
      case "Normal":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case "High":
        return "border-red-500 bg-red-50";
      case "Moderate":
        return "border-yellow-500 bg-yellow-50";
      case "Low":
        return "border-blue-500 bg-blue-50";
      case "Normal":
        return "border-green-500 bg-green-50";
    }
  };

  const getProgressColor = () => {
    switch (category) {
      case "High":
        return "bg-red-500";
      case "Moderate":
        return "bg-yellow-500";
      case "Low":
        return "bg-blue-500";
      case "Normal":
        return "bg-green-500";
    }
  };

  return (
    <Card className={cn("border-2", getCategoryColor(), className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getCategoryIcon()}
            <span className="text-xl">Risk Assessment</span>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{normalizedRiskPercent}%</div>
            <div className="text-sm font-medium text-muted-foreground">{category} Risk</div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Risk Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Risk Level</span>
            <span>{normalizedRiskPercent}%</span>
          </div>
          <div className="relative h-3 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", getProgressColor())}
              style={{ width: `${normalizedRiskPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-medium">
            <span className="text-green-600">0%</span>
            <span className="text-yellow-600">50%</span>
            <span className="text-red-600">100%</span>
          </div>
        </div>

        {/* Category Description */}
        {categoryMeta?.description && (
          <div className="p-3 rounded-lg bg-background/50">
            <p className="text-sm text-muted-foreground">{categoryMeta.description}</p>
          </div>
        )}

        {/* Action Timeline */}
        {categoryMeta?.actionTimeline && showDetails && (
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold">Recommended Timeline</h4>
            <p className="text-sm text-muted-foreground pl-4 border-l-2 border-current">
              {categoryMeta.actionTimeline}
            </p>
          </div>
        )}

        {/* Risk Factors */}
        {showDetails && scoring?.reasons && scoring.reasons.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Contributing Risk Factors</h4>
            <div className="space-y-1.5">
              {scoring.reasons.slice(0, 5).map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-current flex-shrink-0" />
                  <span className="text-muted-foreground">{reason}</span>
                </div>
              ))}
              {scoring.reasons.length > 5 && (
                <p className="text-xs text-muted-foreground pl-4">
                  +{scoring.reasons.length - 5} more factors
                </p>
              )}
            </div>
          </div>
        )}

        {/* Raw Score (for healthcare professionals) */}
        {showDetails && scoring?.score !== undefined && (
          <div className="pt-3 border-t text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Clinical Score</span>
              <span className="font-mono">{scoring.score.toFixed(1)} / {scoring.maxPossibleScore}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
