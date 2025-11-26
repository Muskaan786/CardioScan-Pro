import { BMICalculator } from '@/components/obesity/BMICalculator';
import { ObesityCVDEducation } from '@/components/obesity/ObesityCVDEducation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function ObesityPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Obesity & Cardiovascular Health</h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              Understanding the connection between body weight and heart disease
            </p>
          </div>

          {/* Info Alert */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-gray-700">
              <strong>Did you know?</strong> High BMI now accounts for nearly 1 in 10 CVD deaths globally 
              (1.9 million annually). Even modest weight loss of 5-10% can significantly improve cardiovascular health.
            </AlertDescription>
          </Alert>

          {/* BMI Calculator */}
          <BMICalculator />

          {/* Educational Content */}
          <ObesityCVDEducation />

          {/* About Section */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white dark:bg-neutral-900">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">About This Tool</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              This calculator and educational resource is based on the <strong>World Heart Report 2025</strong> 
              and WHO guidelines. It helps you understand the relationship between obesity and cardiovascular 
              disease, providing personalized recommendations based on current medical evidence. 
              <br /><br />
              <strong>Sources:</strong> World Heart Federation, WHO Acceleration Plan to Stop Obesity, 
              Global Action Plan for NCDs, and peer-reviewed cardiovascular research.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
