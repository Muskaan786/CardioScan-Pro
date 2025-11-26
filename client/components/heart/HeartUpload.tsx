import { useCallback, useRef, useState } from "react";
import { analyzeFile, HeartAnalysis } from "@/lib/heart-analyzer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Upload, FileText, Loader2, Camera } from "lucide-react";

export type HeartUploadProps = {
  onAnalyzed: (result: HeartAnalysis, file: File) => void;
};

export function HeartUpload({ onAnalyzed }: HeartUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (!f) return;
      await handleFile(f);
    },
    [],
  );

  const handleFile = useCallback(async (file: File) => {
    console.log('🔥 handleFile called with:', file.name, file.type, file.size);
    setLoading(true);
    setFileName(file.name);
    
    // Show appropriate processing status
    const isImage = file.type.startsWith("image/") || 
                   /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name);
    const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf');
    
    if (isImage) {
      setProcessingStatus("Extracting text from image...");
    } else if (isPDF) {
      setProcessingStatus("Processing PDF document...");
    } else {
      setProcessingStatus("Analyzing report...");
    }
    
    try {
      console.log('🔍 About to call analyzeFile...');
      const result = await analyzeFile(file);
      console.log('✅ analyzeFile completed:', result);
      onAnalyzed(result, file);
    } catch (error) {
      console.error('❌ Error in handleFile:', error);
      setProcessingStatus("Error processing file");
    } finally {
      setLoading(false);
      setProcessingStatus("");
    }
  }, [onAnalyzed]);

  const onChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    await handleFile(f);
  }, [handleFile]);

  return (
    <Card className="border-2 border-dashed border-gray-300 hover:border-primary transition-colors bg-white shadow-sm">
      <CardContent className="p-8 sm:p-12">
        <div
          className={cn(
            "relative flex flex-col items-center justify-center gap-6 text-center transition-all",
            dragOver && "scale-105",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          {/* Upload Icon */}
          <div className={cn(
            "flex h-20 w-20 items-center justify-center rounded-2xl transition-colors",
            dragOver ? "bg-primary text-white" : "bg-blue-50 text-blue-600"
          )}>
            {loading ? (
              processingStatus.includes("image") ? (
                <div className="relative">
                  <Camera className="h-10 w-10" />
                  <Loader2 className="absolute -top-1 -right-1 h-5 w-5 animate-spin" />
                </div>
              ) : (
                <Loader2 className="h-10 w-10 animate-spin" />
              )
            ) : (
              <Upload className="h-10 w-10" />
            )}
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-900">
              {dragOver ? "Drop your file here" : "Drag and drop your heart report"}
            </p>
            <p className="text-sm text-gray-500">
              PDF, TXT, CSV, JSON, or Images (PNG, JPG). Max 10MB.
            </p>
          </div>

          {/* File Name Display */}
          {fileName && !loading && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">
              <FileText className="h-4 w-4" />
              <span className="font-medium">{fileName}</span>
            </div>
          )}

          {/* Processing Status */}
          {processingStatus && loading && (
            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
              <Loader2 className="h-4 w-4 animate-spin" />
              {processingStatus}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.txt,.csv,.json,.html,.md,.xml,.png,.jpg,.jpeg,.gif,.bmp,.webp"
            onChange={onChange}
          />

          {/* Upload Button */}
          <Button
            size="lg"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="mt-2 px-8"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Choose file
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
