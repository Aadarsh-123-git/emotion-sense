import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDetectFace, getGetEmotionLogsQueryKey, getGetEmotionStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, StopCircle, AlertCircle } from "lucide-react";
import { getEmotionDisplay } from "@/lib/emotions";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

export function FaceDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const detectFace = useDetectFace();
  
  const [currentResult, setCurrentResult] = useState<{ emotion: string; confidence: number } | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsActive(true);
    } catch (err) {
      setError("Camera access denied or not available.");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setCurrentResult(null);
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    let interval: number;
    if (isActive && !detectFace.isPending) {
      interval = window.setInterval(() => {
        captureAndDetect();
      }, 1500);
    }
    return () => window.clearInterval(interval);
  }, [isActive, detectFace.isPending]);

  const captureAndDetect = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);
    
    detectFace.mutate({ data: { image: base64Image } }, {
      onSuccess: (result) => {
        setCurrentResult({ emotion: result.emotion, confidence: result.confidence });
        queryClient.invalidateQueries({ queryKey: getGetEmotionLogsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetEmotionStatsQueryKey() });
      },
      onError: () => {
        // Silently fail intervals to not spam user, maybe set a small error indicator
      }
    });
  };

  const display = getEmotionDisplay(currentResult?.emotion);

  return (
    <Card className="flex flex-col border-primary/20 bg-black/40 backdrop-blur-sm relative overflow-hidden">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            VISUAL_SENSORY_ARRAY
          </div>
          {isActive && (
            <div className="flex items-center gap-2 text-xs text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              LIVE
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col gap-4">
        {error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center gap-2 text-sm font-mono border border-destructive/20">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        ) : (
          <div className="relative aspect-video bg-black rounded-md overflow-hidden border border-border">
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-mono text-xs">
                CAMERA_OFFLINE
              </div>
            )}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} 
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Overlay */}
            <AnimatePresence>
              {isActive && currentResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-3 flex items-center gap-4"
                >
                  <div className="text-3xl">{display.emoji}</div>
                  <div className="flex-1">
                    <div className="text-sm font-bold font-mono text-white mb-1">{display.label}</div>
                    <div className="flex items-center gap-2">
                      <Progress value={currentResult.confidence * 100} className="h-1" />
                      <span className="text-[10px] font-mono text-white/70 w-8 text-right">
                        {Math.round(currentResult.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        
        <div className="mt-auto pt-2">
          {!isActive ? (
            <Button onClick={startCamera} className="w-full font-mono bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50">
              <Camera className="w-4 h-4 mr-2" /> INITIALIZE_CAMERA
            </Button>
          ) : (
            <Button onClick={stopCamera} variant="destructive" className="w-full font-mono bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/50">
              <StopCircle className="w-4 h-4 mr-2" /> TERMINATE_FEED
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
