import { HeartAnalysis } from "@/lib/triage-engine/types";
import { 
  AlertCircle, Heart, Activity, Utensils, Cigarette, 
  Stethoscope, Users, Brain, Phone 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface RecommendationsListProps {
  analysis: HeartAnalysis;
  className?: string;
  priorityOnly?: boolean;
}

export function RecommendationsList({ 
  analysis, 
  className, 
  priorityOnly = false 
}: RecommendationsListProps) {
  const { recommendations } = analysis;

  if (!recommendations || recommendations.items.length === 0) {
    return null;
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "immediate care":
        return <AlertCircle className="h-4 w-4" />;
      case "monitoring":
        return <Activity className="h-4 w-4" />;
      case "lifestyle":
        return <Utensils className="h-4 w-4" />;
      case "risk management":
        return <Heart className="h-4 w-4" />;
      case "medications":
        return <Stethoscope className="h-4 w-4" />;
      case "preventive care":
        return <Activity className="h-4 w-4" />;
      case "family":
        return <Users className="h-4 w-4" />;
      case "mental health":
        return <Brain className="h-4 w-4" />;
      case "emergency preparedness":
        return <Phone className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  // Get priority recommendations
  const priorityRecs = recommendations.items.filter(
    r => r.priority === "urgent" || r.priority === "high"
  );

  // Group recommendations by category
  const groupedRecs = recommendations.items.reduce((acc, rec) => {
    if (!acc[rec.category]) {
      acc[rec.category] = [];
    }
    acc[rec.category].push(rec);
    return acc;
  }, {} as Record<string, typeof recommendations.items>);

  if (priorityOnly) {
    return (
      <Card className={cn("border-l-4 border-l-red-500", className)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Priority Recommendations
          </CardTitle>
          <CardDescription>
            Immediate actions you should take
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {priorityRecs.map((rec, idx) => (
              <Alert key={idx} variant={rec.priority === "urgent" ? "destructive" : "default"}>
                <div className="flex items-start justify-between gap-3">
                  <AlertDescription className="flex-1">{rec.text}</AlertDescription>
                  {getPriorityBadge(rec.priority)}
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Medical Recommendations</CardTitle>
        <CardDescription>
          Personalized guidance based on your cardiac assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Medical Disclaimer */}
        {recommendations.disclaimer && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {recommendations.disclaimer}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue={Object.keys(groupedRecs)[0]} className="w-full">
          <TabsList className="w-full flex-wrap h-auto justify-start">
            {Object.keys(groupedRecs).map((category) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="flex items-center gap-1.5 text-xs"
              >
                {getCategoryIcon(category)}
                <span>{category}</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {groupedRecs[category].length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(groupedRecs).map(([category, recs]) => (
            <TabsContent key={category} value={category} className="space-y-3 mt-4">
              {recs.map((rec, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="mt-1">
                    {getCategoryIcon(category)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{rec.text}</p>
                    {rec.rationale && (
                      <p className="text-xs text-muted-foreground italic">
                        {rec.rationale}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {getPriorityBadge(rec.priority)}
                  </div>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-semibold text-red-600">
              {priorityRecs.length}
            </div>
            <div className="text-xs text-muted-foreground">Priority Actions</div>
          </div>
          <div>
            <div className="font-semibold">
              {Object.keys(groupedRecs).length}
            </div>
            <div className="text-xs text-muted-foreground">Categories</div>
          </div>
          <div>
            <div className="font-semibold">
              {recommendations.items.length}
            </div>
            <div className="text-xs text-muted-foreground">Total Recommendations</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
