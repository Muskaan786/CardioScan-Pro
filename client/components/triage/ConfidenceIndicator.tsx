import { HeartAnalysis } from "@/lib/triage-engine/types";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ConfidenceIndicatorProps {
  analysis: HeartAnalysis;
  className?: string;
  showDetails?: boolean;
}

export function ConfidenceIndicator({ 
  analysis, 
  className, 
  showDetails = true 
}: ConfidenceIndicatorProps) {
  const { confidence, confidenceMeta } = analysis;

  if (confidence === undefined || !confidenceMeta) {
    return null;
  }

  const confidencePercent = Math.round(confidence * 100);

  const getConfidenceLevel = () => {
    if (confidence >= 0.7) return { label: "High", color: "text-green-600", bg: "bg-green-50", border: "border-green-500" };
    if (confidence >= 0.4) return { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-500" };
    return { label: "Low", color: "text-red-600", bg: "bg-red-50", border: "border-red-500" };
  };

  const level = getConfidenceLevel();

  const getIcon = () => {
    if (confidence >= 0.7) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (confidence >= 0.4) return <Info className="h-5 w-5 text-yellow-600" />;
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <Card className={cn("border-2", level.border, level.bg, className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span>Assessment Confidence</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{confidencePercent}%</div>
            <div className={cn("text-xs font-medium", level.color)}>{level.label}</div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Confidence Progress Bar */}
        <div className="space-y-2">
          <Progress value={confidencePercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low (0-39%)</span>
            <span>Medium (40-69%)</span>
            <span>High (70-100%)</span>
          </div>
        </div>

        {/* Confidence Description */}
        {confidenceMeta.description && (
          <p className="text-sm text-muted-foreground">
            {confidenceMeta.description}
          </p>
        )}

        {/* Breakdown Factors */}
        {showDetails && confidenceMeta.breakdown && (
          <div className="space-y-3 pt-2 border-t">
            <h4 className="text-sm font-semibold">Confidence Factors</h4>
            
            {/* Data Completeness */}
            {confidenceMeta.breakdown.dataCompleteness !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Data Completeness</span>
                  <span className="font-medium">
                    {Math.round(confidenceMeta.breakdown.dataCompleteness * 100)}%
                  </span>
                </div>
                <Progress 
                  value={confidenceMeta.breakdown.dataCompleteness * 100} 
                  className="h-1.5"
                />
              </div>
            )}

            {/* Key Marker Quality */}
            {confidenceMeta.breakdown.keyMarkerQuality !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Key Marker Quality</span>
                  <span className="font-medium">
                    {Math.round(confidenceMeta.breakdown.keyMarkerQuality * 100)}%
                  </span>
                </div>
                <Progress 
                  value={confidenceMeta.breakdown.keyMarkerQuality * 100} 
                  className="h-1.5"
                />
              </div>
            )}

            {/* Clinical Context */}
            {confidenceMeta.breakdown.clinicalContext !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Clinical Context</span>
                  <span className="font-medium">
                    {Math.round(confidenceMeta.breakdown.clinicalContext * 100)}%
                  </span>
                </div>
                <Progress 
                  value={confidenceMeta.breakdown.clinicalContext * 100} 
                  className="h-1.5"
                />
              </div>
            )}
          </div>
        )}

        {/* Improvement Suggestions */}
        {showDetails && confidenceMeta.suggestions && confidenceMeta.suggestions.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle className="text-sm">Ways to Improve Confidence</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1 text-xs">
                {confidenceMeta.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-current flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Missing Parameters */}
        {showDetails && confidenceMeta.missingParameters && confidenceMeta.missingParameters.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Missing Data Points</h4>
            <div className="flex flex-wrap gap-1.5">
              {confidenceMeta.missingParameters.map((param, idx) => (
                <span 
                  key={idx}
                  className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  {param}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
