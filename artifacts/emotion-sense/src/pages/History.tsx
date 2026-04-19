import { useGetEmotionLogs } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmotionDisplay } from "@/lib/emotions";
import { format } from "date-fns";
import { History as HistoryIcon, Database } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function History() {
  // Pass higher limit for full history page
  const { data: logs, isLoading } = useGetEmotionLogs({ limit: 50 });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-mono tracking-tight text-white flex items-center gap-3">
          <Database className="w-8 h-8 text-primary" />
          TELEMETRY_ARCHIVE
        </h1>
        <p className="text-muted-foreground font-mono text-sm">HISTORICAL_EMOTIONAL_DATA_RECORDS</p>
      </div>

      <Card className="border-border bg-black/40 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <HistoryIcon className="w-4 h-4 text-muted-foreground" />
            FULL_LOG_TABLE
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5 hover:bg-white/5">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-xs text-muted-foreground w-40">TIMESTAMP</TableHead>
                <TableHead className="font-mono text-xs text-primary">VISUAL_ANALYSIS</TableHead>
                <TableHead className="font-mono text-xs text-accent">VOCAL_ANALYSIS</TableHead>
                <TableHead className="font-mono text-xs text-muted-foreground text-right">RECORD_ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell><Skeleton className="h-4 w-24 bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 bg-primary/20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 bg-accent/20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto bg-white/10" /></TableCell>
                  </TableRow>
                ))
              ) : logs?.length === 0 ? (
                <TableRow className="border-border hover:bg-transparent">
                  <TableCell colSpan={4} className="text-center p-8 text-muted-foreground font-mono text-sm">
                    NO_RECORDS_FOUND
                  </TableCell>
                </TableRow>
              ) : (
                logs?.map((log) => (
                  <TableRow key={log.id} className="border-border hover:bg-white/5 transition-colors group">
                    <TableCell className="font-mono text-xs text-muted-foreground group-hover:text-white transition-colors">
                      {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      {log.faceEmotion ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono bg-primary/10 text-primary border-primary/20 rounded-sm">
                            <span className="mr-1">{getEmotionDisplay(log.faceEmotion).emoji}</span>
                            {log.faceEmotion.toUpperCase()}
                          </Badge>
                          <span className="text-[10px] font-mono text-primary/60">
                            {Math.round((log.faceConfidence || 0) * 100)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50 font-mono text-xs">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.voiceEmotion ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono bg-accent/10 text-accent border-accent/20 rounded-sm">
                            <span className="mr-1">{getEmotionDisplay(log.voiceEmotion).emoji}</span>
                            {log.voiceEmotion.toUpperCase()}
                          </Badge>
                          <span className="text-[10px] font-mono text-accent/60">
                            {Math.round((log.voiceConfidence || 0) * 100)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50 font-mono text-xs">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground/50">
                      #{log.id.toString().padStart(4, '0')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
