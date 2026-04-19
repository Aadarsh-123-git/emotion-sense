import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDetectVoice, getGetEmotionLogsQueryKey, getGetEmotionStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Mic, MicOff, AlertCircle, Loader2 } from "lucide-react";
import { getEmotionDisplay } from "@/lib/emotions";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

export function VoiceDetection() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  
  const queryClient = useQueryClient();
  const detectVoice = useDetectVoice();
  
  const [currentResult, setCurrentResult] = useState<{ emotion: string; confidence: number } | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
      setCurrentResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          detectVoice.mutate({ data: { audio: base64Audio } }, {
            onSuccess: (result) => {
              setCurrentResult({ emotion: result.emotion, confidence: result.confidence });
              queryClient.invalidateQueries({ queryKey: getGetEmotionLogsQueryKey() });
              queryClient.invalidateQueries({ queryKey: getGetEmotionStatsQueryKey() });
            },
            onError: () => {
              setError("Analysis failed. Please try again.");
            }
          });
        };
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto stop after 3 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 3000);
      
    } catch (err) {
      setError("Microphone access denied or not available.");
    }
  };

  const display = getEmotionDisplay(currentResult?.emotion);

  return (
    <Card className="flex flex-col border-accent/20 bg-black/40 backdrop-blur-sm relative overflow-hidden">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-accent" />
            VOCAL_ANALYSIS_MOD
          </div>
          {isRecording && (
            <div className="flex items-center gap-2 text-xs text-accent">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              RECORDING
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col gap-4">
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center gap-2 text-sm font-mono border border-destructive/20">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
        
        <div className="flex-1 flex flex-col items-center justify-center min-h-[160px] border border-dashed border-border rounded-md bg-black/50 p-6 relative">
          
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div 
                key="recording"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center justify-center gap-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
                  <div className="w-16 h-16 rounded-full border border-accent flex items-center justify-center bg-accent/10 z-10 relative">
                    <Mic className="w-8 h-8 text-accent animate-pulse" />
                  </div>
                </div>
                <div className="text-xs font-mono text-accent">ANALYZING_FREQUENCIES...</div>
              </motion.div>
            ) : detectVoice.isPending ? (
              <motion.div 
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-4"
              >
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <div className="text-xs font-mono text-muted-foreground">DECODING_VOCAL_PATTERNS...</div>
              </motion.div>
            ) : currentResult ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex flex-col gap-4"
              >
                <div className="flex items-center justify-center gap-4 mb-2">
                  <div className="text-5xl">{display.emoji}</div>
                  <div>
                    <div className="text-xl font-bold font-mono text-white tracking-widest uppercase">{display.label}</div>
                    <div className="text-xs font-mono text-muted-foreground">VOCAL_SIGNATURE_MATCH</div>
                  </div>
                </div>
                <div className="w-full px-4">
                  <div className="flex justify-between text-[10px] font-mono text-white/50 mb-1">
                    <span>CONFIDENCE</span>
                    <span>{Math.round(currentResult.confidence * 100)}%</span>
                  </div>
                  <Progress value={currentResult.confidence * 100} className="h-1 bg-white/5 [&>div]:bg-accent" />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center gap-2 text-muted-foreground"
              >
                <MicOff className="w-8 h-8 opacity-50 mb-2" />
                <div className="text-xs font-mono">AWAITING_VOCAL_INPUT</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="mt-auto pt-2">
          <Button 
            onClick={startRecording} 
            disabled={isRecording || detectVoice.isPending}
            className="w-full font-mono bg-accent/20 hover:bg-accent/30 text-accent border border-accent/50 disabled:opacity-50"
          >
            {isRecording ? "RECORDING (3s)..." : detectVoice.isPending ? "PROCESSING..." : "INITIATE_VOCAL_SCAN"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
