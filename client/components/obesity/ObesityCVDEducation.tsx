import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Heart, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Scale,
  Utensils,
  Droplet,
  Zap
} from 'lucide-react';

export function ObesityCVDEducation() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Understanding Obesity & Cardiovascular Disease</CardTitle>
        <CardDescription>
          Learn how excess body weight affects heart health and what you can do about it
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="mechanisms">Mechanisms</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="interventions">Solutions</TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="space-y-4">
            <Alert>
              <Heart className="h-4 w-4" />
              <AlertTitle>The Obesity-CVD Link</AlertTitle>
              <AlertDescription>
                Obesity is a major risk factor for cardiovascular disease. Children with high BMI 
                are <strong>40% more likely</strong> to suffer from CVD in midlife compared to those with normal BMI.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Key Risk Factors Affected by Obesity
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Hypertension:</strong> Systolic BP decreases ~1 mmHg per kg of weight lost</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Type 2 Diabetes:</strong> Weight loss {'>'} 10% can lead to remission in up to 50% of cases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Dyslipidemia:</strong> Improves triglycerides, HDL, and LDL particle profiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Sleep Apnea:</strong> Weight loss reduces apnea-hypopnea index by 26-32% per 10% weight loss</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Heart Failure:</strong> Particularly impacts HFpEF (preserved ejection fraction)</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mechanisms" className="space-y-4">
            <h4 className="font-semibold">How Obesity Impacts the Heart</h4>
            
            <div className="grid gap-4">
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <Droplet className="h-4 w-4 text-blue-500" />
                  Adipose Tissue Dysfunction
                </div>
                <p className="text-sm text-muted-foreground">
                  Excess fat causes systemic inflammation, endothelial dysfunction, and insulin resistance, 
                  all contributing to atherosclerosis and increased CVD risk.
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <Activity className="h-4 w-4 text-red-500" />
                  Increased Cardiac Workload
                </div>
                <p className="text-sm text-muted-foreground">
                  High cardiac workload and hemodynamic changes lead to left ventricular hypertrophy, 
                  diastolic dysfunction, and increased risk of dilated cardiomyopathy.
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Prothrombotic State
                </div>
                <p className="text-sm text-muted-foreground">
                  Enhanced coagulation and impaired fibrinolysis increase risk of deep vein thrombosis 
                  and pulmonary embolism.
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <Heart className="h-4 w-4 text-pink-500" />
                  Arrhythmias
                </div>
                <p className="text-sm text-muted-foreground">
                  Obesity increases risk of atrial fibrillation and ventricular arrhythmias through 
                  structural and electrical remodeling of the heart.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            <Alert className="bg-orange-50 border-orange-200">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <AlertTitle>Global Obesity Crisis</AlertTitle>
              <AlertDescription>
                In 2022, <strong>878 million adults</strong> lived with obesity worldwide—more than 
                4× the 194 million in 1990. By 2050, nearly <strong>2 in 3 adults</strong> could have 
                overweight or obesity.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">CVD Deaths Attributable to High BMI</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Annual CVD deaths from high BMI (2021):</span>
                    <strong>1.9 million</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Percentage of all CVD deaths:</span>
                    <strong>9.8%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Increase since 1990:</span>
                    <strong>2× (doubled)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Women's CVD deaths from high BMI:</span>
                    <strong>10.8%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Men's CVD deaths from high BMI:</span>
                    <strong>8.9%</strong>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Economic Impact</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Global economic cost (2019):</span>
                    <strong>US$2 trillion/year</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Percentage of global GDP:</span>
                    <strong>2.2%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Projected cost by 2060:</span>
                    <strong>3% of GDP annually</strong>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="interventions" className="space-y-4">
            <h4 className="font-semibold mb-3">Evidence-Based Solutions</h4>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 font-medium mb-2">
                  <Scale className="h-4 w-4 text-green-500" />
                  Weight Loss Benefits
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>5-10% weight loss:</strong> Significantly reduces blood pressure, improves glucose control, 
                    and enhances lipid profiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>10-15% weight loss:</strong> Reduces MACE, stroke, and heart failure hospitalizations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Sustained loss:</strong> Long-term cardiovascular mortality reduction</span>
                  </li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 font-medium mb-2">
                  <Utensils className="h-4 w-4 text-blue-500" />
                  Lifestyle Interventions
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• Mediterranean or DASH diet</li>
                  <li>• 150 minutes/week of moderate physical activity</li>
                  <li>• Behavioral modification programs</li>
                  <li>• Sleep optimization (7-9 hours)</li>
                  <li>• Stress management</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 font-medium mb-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Medical Interventions
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>GLP-1RA medications</strong> (e.g., semaglutide, tirzepatide): 14% reduction in 
                    MACE, 20% reduction in non-fatal MI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Bariatric surgery:</strong> 15-40% sustained weight loss, improved cardiometabolic outcomes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Cardiac rehabilitation:</strong> Structured programs with diet, exercise, and counseling</span>
                  </li>
                </ul>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Important:</strong> Always consult healthcare providers before starting any weight loss program. 
                  This information is educational and not a substitute for medical advice.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
