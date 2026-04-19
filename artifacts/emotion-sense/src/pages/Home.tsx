import { FaceDetection } from "@/components/FaceDetection";
import { VoiceDetection } from "@/components/VoiceDetection";
import { useGetEmotionLogs, useGetEmotionStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmotionDisplay } from "@/lib/emotions";
import { format } from "date-fns";
import { History, ActivitySquare, Brain } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: logs } = useGetEmotionLogs({ limit: 5 });
  const { data: stats } = useGetEmotionStats();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-mono tracking-tight text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              SYSTEM_DASHBOARD
            </h1>
            <p className="text-muted-foreground font-mono text-sm">REAL_TIME_EMOTIONAL_TELEMETRY</p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <FaceDetection />
            <VoiceDetection />
          </div>
        </div>
        
        <div className="w-full md:w-80 flex flex-col gap-6">
          <Card className="border-border bg-black/40 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <ActivitySquare className="w-4 h-4 text-muted-foreground" />
                SESSION_STATS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <div className="text-[10px] font-mono text-muted-foreground mb-1">TOTAL_SCANS</div>
                <div className="text-2xl font-mono text-white">{stats?.totalDetections || 0}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground mb-1">DOMINANT_VISUAL</div>
                  <div className="text-sm font-mono text-primary flex items-center gap-2">
                    {stats?.mostCommonFaceEmotion ? (
                      <>
                        <span>{getEmotionDisplay(stats.mostCommonFaceEmotion).emoji}</span>
                        {stats.mostCommonFaceEmotion.toUpperCase()}
                      </>
                    ) : 'NONE'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground mb-1">DOMINANT_VOCAL</div>
                  <div className="text-sm font-mono text-accent flex items-center gap-2">
                    {stats?.mostCommonVoiceEmotion ? (
                      <>
                        <span>{getEmotionDisplay(stats.mostCommonVoiceEmotion).emoji}</span>
                        {stats.mostCommonVoiceEmotion.toUpperCase()}
                      </>
                    ) : 'NONE'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-black/40 backdrop-blur-sm flex-1">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                RECENT_LOGS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {logs?.length === 0 ? (
                  <div className="p-4 text-xs font-mono text-muted-foreground text-center">NO_DATA_AVAILABLE</div>
                ) : (
                  logs?.map((log) => (
                    <motion.div 
                      initial={{ opacity: 0, backgroundColor: "rgba(0,0,0,0)" }}
                      animate={{ opacity: 1, backgroundColor: "rgba(0,0,0,0)" }}
                      key={log.id} 
                      className="p-3 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {format(new Date(log.createdAt), "HH:mm:ss.SSS")}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground opacity-50">ID:{log.id}</span>
                      </div>
                      <div className="flex gap-4">
                        {log.faceEmotion && (
                          <div className="flex items-center gap-1.5 text-xs font-mono text-primary">
                            <span>{getEmotionDisplay(log.faceEmotion).emoji}</span>
                            <span>{log.faceEmotion.toUpperCase()}</span>
                            <span className="text-[9px] opacity-60">
                              {Math.round((log.faceConfidence || 0) * 100)}%
                            </span>
                          </div>
                        )}
                        {log.voiceEmotion && (
                          <div className="flex items-center gap-1.5 text-xs font-mono text-accent">
                            <span>{getEmotionDisplay(log.voiceEmotion).emoji}</span>
                            <span>{log.voiceEmotion.toUpperCase()}</span>
                            <span className="text-[9px] opacity-60">
                              {Math.round((log.voiceConfidence || 0) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
