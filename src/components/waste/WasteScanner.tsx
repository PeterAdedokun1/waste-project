import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2, RotateCcw, Scan } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WasteScannerProps {
  onClassified: (wasteType: string) => void;
  onImageCaptured?: (imageUrl: string) => void;
}

const wasteTypeLabels: Record<string, string> = {
  plastic: "Plastic",
  paper: "Paper & Cardboard",
  metal: "Metal & Alloys",
  electronics: "E-Waste",
  organic: "Organic",
  textile: "Textile",
  glass: "Glass",
  rubber: "Rubber",
  wood: "Wood",
  other: "Other",
};

const WasteScanner = ({ onClassified, onImageCaptured }: WasteScannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState<{
    wasteType: string;
    confidence: number;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsOpen(true);
    } catch (error) {
      console.error("Camera access error:", error);
      toast.error("Could not access camera. Please check permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsOpen(false);
    setCapturedImage(null);
    setClassificationResult(null);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedImage(imageData);
      
      // Stop the video stream after capture
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
  }, [stream]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setClassificationResult(null);
    startCamera();
  }, [startCamera]);

  const classifyWaste = useCallback(async () => {
    if (!capturedImage) return;

    setIsClassifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("classify-waste", {
        body: { imageBase64: capturedImage },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setClassificationResult(data);
      toast.success(`Detected: ${wasteTypeLabels[data.wasteType] || data.wasteType}`);
    } catch (error) {
      console.error("Classification error:", error);
      toast.error("Failed to classify waste. Please try again.");
    } finally {
      setIsClassifying(false);
    }
  }, [capturedImage]);

  const confirmClassification = useCallback(() => {
    if (classificationResult) {
      onClassified(classificationResult.wasteType);
      if (onImageCaptured && capturedImage) {
        onImageCaptured(capturedImage);
      }
      stopCamera();
      toast.success("Waste type set successfully!");
    }
  }, [classificationResult, onClassified, onImageCaptured, capturedImage, stopCamera]);

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={startCamera}
        className="gap-2"
      >
        <Camera className="w-4 h-4" />
        Scan Waste
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <h2 className="text-lg font-semibold">Scan Waste Material</h2>
        <Button variant="ghost" size="icon" onClick={stopCamera} className="text-white hover:bg-white/20">
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Camera/Preview */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured waste"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="max-w-full max-h-full object-contain"
          />
        )}
        
        {/* Scanning overlay */}
        {!capturedImage && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-2 border-white/50 rounded-2xl">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
            </div>
          </div>
        )}

        {/* Classification result overlay */}
        {classificationResult && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="text-center text-white">
              <p className="text-sm text-white/70 mb-1">Detected Waste Type</p>
              <p className="text-2xl font-bold mb-1">
                {wasteTypeLabels[classificationResult.wasteType] || classificationResult.wasteType}
              </p>
              <p className="text-sm text-white/70">
                Confidence: {Math.round(classificationResult.confidence * 100)}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="p-6 bg-black/50">
        {!capturedImage ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors"
            >
              <div className="w-16 h-16 rounded-full border-4 border-black/20" />
            </button>
          </div>
        ) : !classificationResult ? (
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={retakePhoto} className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <RotateCcw className="w-4 h-4" />
              Retake
            </Button>
            <Button
              variant="hero"
              onClick={classifyWaste}
              disabled={isClassifying}
              className="gap-2"
            >
              {isClassifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  Classify Waste
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={retakePhoto} className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <RotateCcw className="w-4 h-4" />
              Retake
            </Button>
            <Button variant="hero" onClick={confirmClassification} className="gap-2">
              Use This Type
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WasteScanner;
