import { useState } from "react";
import { HeartUpload } from "@/components/heart/HeartUpload";
import { Stage1Output } from "@/components/heart/Stage1Output";
import { HeartAnalysis } from "@/lib/heart-analyzer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HeartPulse, ShieldCheck, Brain, Camera, FileText, Stethoscope, Shield, Activity, Droplets, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Index() {
  const [result, setResult] = useState<HeartAnalysis | null>(null);
  const [fileName, setFileName] = useState<string | undefined>();
  const [uploadedFile, setUploadedFile] = useState<File | undefined>();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-neutral-950 dark:to-neutral-900">
      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-10">
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            AI-Powered Cardiac Risk Assessment Platform
          </p>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-6 leading-relaxed">
            Professional cardiac risk analysis using advanced OCR, machine learning, and evidence-based guidelines (WHO/ACC/AHA). 
            Upload echocardiograms, ECG reports, or lab results for comprehensive Stage-1 risk assessment with explainable AI.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-5 py-2.5 text-sm font-medium text-emerald-700 shadow-sm">
              <ShieldCheck className="h-4 w-4" /> Privacy First - No Data Stored
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-5 py-2.5 text-sm font-medium text-blue-700 shadow-sm">
              <Brain className="h-4 w-4" /> Explainable AI Engine
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 border border-purple-200 px-5 py-2.5 text-sm font-medium text-purple-700 shadow-sm">
              <FileText className="h-4 w-4" /> Clinical Guidelines Based
            </div>
          </div>
        </div>



        {/* Upload Section */}
        <div className="max-w-4xl mx-auto">
          <HeartUpload
            onAnalyzed={(r, f) => {
              setResult(r);
              setFileName(f.name);
              setUploadedFile(f);
              setTimeout(() => {
                const el = document.getElementById("analysis");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 150);
            }}
          />
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-12" id="analysis">
            <Stage1Output result={result} fileName={fileName} />
          </div>
        )}
        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto mt-16">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-md">
                <Camera className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-blue-900 mb-2 text-lg">Advanced OCR Engine</h3>
              <p className="text-sm text-blue-800 leading-relaxed">Medical-grade optical character recognition extracts cardiac parameters from images and PDFs with 99%+ accuracy using Tesseract.js</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 shadow-md">
                <Stethoscope className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-green-900 mb-2 text-lg">Explainable AI Engine</h3>
              <p className="text-sm text-green-800 leading-relaxed">Evidence-based risk scoring with transparent breakdown. Every factor contributing to your cardiac risk is clearly explained with clinical reasoning</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 shadow-md">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-purple-900 mb-2 text-lg">Clinical Guidelines</h3>
              <p className="text-sm text-purple-800 leading-relaxed">Recommendations based on WHO, ACC/AHA guidelines with personalized BMI analysis, lifestyle modifications, and triage recommendations</p>
            </CardContent>
          </Card>
        </div>

        {/* Professional Info Section */}
        <div className="max-w-5xl mx-auto mt-16">
          <Card className="border-2 border-gray-200 shadow-md">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Supported Medical Reports</h2>
                <p className="text-gray-600">Upload any of these cardiac diagnostic reports for comprehensive analysis</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="mt-1 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Echocardiogram Reports</h4>
                    <p className="text-xs text-blue-700">EF, PASP, TR velocity, chamber dimensions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-100">
                  <div className="mt-1 text-green-600">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">ECG/EKG Results</h4>
                    <p className="text-xs text-green-700">Heart rate, rhythm, abnormalities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-50 border border-purple-100">
                  <div className="mt-1 text-purple-600">
                    <Droplets className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-1">Lab Results</h4>
                    <p className="text-xs text-purple-700">Lipid panel, blood sugar, cholesterol</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50 border border-orange-100">
                  <div className="mt-1 text-orange-600">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-1">Images & Scans</h4>
                    <p className="text-xs text-orange-700">JPG, PNG - OCR extracted</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Disclaimer & Footer */}
        <div className="max-w-5xl mx-auto mt-12">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-sm text-amber-800 leading-relaxed">
              <strong className="font-semibold">Medical Disclaimer:</strong> CardioScan Pro is a research and educational tool for cardiac risk assessment. 
              It does not constitute medical advice, diagnosis, or treatment. This system provides Stage-1 screening analysis and should not replace 
              professional medical consultation. Always seek advice from qualified healthcare professionals for medical decisions.
            </AlertDescription>
          </Alert>
        </div>

        {/* Professional Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-sm text-gray-600">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-red-600" />
                  CardioScan Pro
                </h3>
                <p className="text-xs leading-relaxed">
                  Advanced AI-powered cardiac risk assessment platform using evidence-based guidelines 
                  and explainable machine learning for transparent health analysis.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Technology</h3>
                <ul className="space-y-2 text-xs">
                  <li>• Tesseract.js OCR Engine</li>
                  <li>• React + TypeScript</li>
                  <li>• Evidence-Based Algorithms</li>
                  <li>• WHO/ACC/AHA Guidelines</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Privacy & Security</h3>
                <ul className="space-y-2 text-xs">
                  <li>• No data stored on servers</li>
                  <li>• Client-side processing only</li>
                  <li>• Privacy-first architecture</li>
                  <li>• HIPAA-compliant design</li>
                </ul>
              </div>
            </div>
   
          </div>
        </footer>
      </section>
    </div>
  );
}
