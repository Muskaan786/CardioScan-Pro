import { useState } from "react";
import { HeartUpload } from "@/components/heart/HeartUpload";
import { SimplifiedRiskResult } from "@/components/heart/SimplifiedRiskResult";
import { HeartAnalysis } from "@/lib/heart-analyzer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HeartPulse, ShieldCheck, Brain, Camera, FileText, Stethoscope } from "lucide-react";

export default function Index() {
  const [result, setResult] = useState<HeartAnalysis | null>(null);
  const [fileName, setFileName] = useState<string | undefined>();
  const [uploadedFile, setUploadedFile] = useState<File | undefined>();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg">
            <HeartPulse className="h-10 w-10" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              CardioScan Pro
            </span>
          </h1>
          <p className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            AI-Powered Heart Disease Analysis System
          </p>
          {/* <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-6">
            Upload your cardiac reports (Echocardiogram, ECG, Lab Results) and get instant risk assessment with personalized medical recommendations using advanced OCR and AI technology.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700">
              <ShieldCheck className="h-4 w-4" /> HIPAA Compliant - No Data Stored
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700">
              <Brain className="h-4 w-4" /> Advanced AI Analysis
            </div>
          </div> */}
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
            <SimplifiedRiskResult result={result} fileName={fileName} />
          </div>
        )}
        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          <Card className="bg-blue-50 border border-blue-100">
            <CardContent className="p-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Camera className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">OCR Technology</h3>
              <p className="text-sm text-blue-700">Extract text from images with 99%+ accuracy using Tesseract.js</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border border-green-100">
            <CardContent className="p-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <Stethoscope className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900 mb-2">Medical AI</h3>
              <p className="text-sm text-green-700">Analyze cardiac parameters and provide risk stratification</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border border-purple-100">
            <CardContent className="p-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-purple-900 mb-2">Clinical Reports</h3>
              <p className="text-sm text-purple-700">Support for Echo, ECG, and lab report analysis</p>
            </CardContent>
          </Card>
        </div>
        {/* Info Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">What reports work best?</h2>
              <ul className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Text-based PDFs exported from your lab or clinic</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Plain text files with readings (e.g. "Age: 58, BP: 150/95")</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>CSV or JSON with cardiac parameters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Images (JPG, PNG) - analyzed using OCR</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8 text-xs text-gray-500">
          This tool is not a medical device and does not provide medical advice. Always consult a healthcare professional.
        </div>
      </section>
    </div>
  );
}
