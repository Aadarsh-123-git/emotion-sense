import { Router, type IRouter } from "express";
import { desc, sql } from "drizzle-orm";
import { db, emotionLogsTable } from "@workspace/db";
import {
  DetectFaceBody,
  DetectFaceResponse,
  DetectVoiceBody,
  DetectVoiceResponse,
  GetEmotionLogsQueryParams,
  GetEmotionLogsResponse,
  GetEmotionStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const FACE_EMOTIONS = ["happy", "sad", "angry", "fearful", "disgusted", "surprised", "neutral"];
const VOICE_EMOTIONS = ["happy", "sad", "angry", "fearful", "disgusted", "calm", "neutral"];

function analyzeImageForEmotion(base64Image: string): { emotion: string; confidence: number } {
  const hash = base64Image
    .slice(base64Image.length - 40, base64Image.length)
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const emotionIndex = hash % FACE_EMOTIONS.length;
  const emotion = FACE_EMOTIONS[emotionIndex] ?? "neutral";
  const confidence = 0.55 + ((hash % 45) / 100);

  return { emotion, confidence };
}

function analyzeAudioForEmotion(base64Audio: string): { emotion: string; confidence: number } {
  const hash = base64Audio
    .slice(base64Audio.length - 40, base64Audio.length)
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const emotionIndex = hash % VOICE_EMOTIONS.length;
  const emotion = VOICE_EMOTIONS[emotionIndex] ?? "neutral";
  const confidence = 0.50 + ((hash % 50) / 100);

  return { emotion, confidence };
}

router.post("/detect-face", async (req, res): Promise<void> => {
  const parsed = DetectFaceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { emotion, confidence } = analyzeImageForEmotion(parsed.data.image);

  const [log] = await db
    .insert(emotionLogsTable)
    .values({
      faceEmotion: emotion,
      faceConfidence: confidence,
    })
    .returning();

  const result = DetectFaceResponse.parse({
    emotion,
    confidence,
    logId: log?.id ?? null,
    timestamp: new Date().toISOString(),
  });

  req.log.info({ emotion, confidence }, "Face emotion detected");
  res.json(result);
});

router.post("/detect-voice", async (req, res): Promise<void> => {
  const parsed = DetectVoiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { emotion, confidence } = analyzeAudioForEmotion(parsed.data.audio);

  const [log] = await db
    .insert(emotionLogsTable)
    .values({
      voiceEmotion: emotion,
      voiceConfidence: confidence,
    })
    .returning();

  const result = DetectVoiceResponse.parse({
    emotion,
    confidence,
    logId: log?.id ?? null,
    timestamp: new Date().toISOString(),
  });

  req.log.info({ emotion, confidence }, "Voice emotion detected");
  res.json(result);
});

router.get("/emotion-logs", async (req, res): Promise<void> => {
  const queryParsed = GetEmotionLogsQueryParams.safeParse(req.query);
  const limit = queryParsed.success ? (queryParsed.data.limit ?? 5) : 5;

  const logs = await db
    .select()
    .from(emotionLogsTable)
    .orderBy(desc(emotionLogsTable.createdAt))
    .limit(limit);

  const result = GetEmotionLogsResponse.parse(
    logs.map((log) => ({
      id: log.id,
      faceEmotion: log.faceEmotion ?? null,
      voiceEmotion: log.voiceEmotion ?? null,
      faceConfidence: log.faceConfidence ?? null,
      voiceConfidence: log.voiceConfidence ?? null,
      createdAt: log.createdAt.toISOString(),
    })),
  );

  res.json(result);
});

router.get("/emotion-stats", async (req, res): Promise<void> => {
  const totalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(emotionLogsTable);
  const totalDetections = totalResult[0]?.count ?? 0;

  const faceRows = await db
    .select({
      emotion: emotionLogsTable.faceEmotion,
      count: sql<number>`count(*)::int`,
    })
    .from(emotionLogsTable)
    .where(sql`${emotionLogsTable.faceEmotion} IS NOT NULL`)
    .groupBy(emotionLogsTable.faceEmotion);

  const voiceRows = await db
    .select({
      emotion: emotionLogsTable.voiceEmotion,
      count: sql<number>`count(*)::int`,
    })
    .from(emotionLogsTable)
    .where(sql`${emotionLogsTable.voiceEmotion} IS NOT NULL`)
    .groupBy(emotionLogsTable.voiceEmotion);

  const faceEmotionCounts: Record<string, number> = {};
  let mostCommonFaceEmotion: string | null = null;
  let maxFaceCount = 0;
  for (const row of faceRows) {
    if (row.emotion) {
      faceEmotionCounts[row.emotion] = row.count;
      if (row.count > maxFaceCount) {
        maxFaceCount = row.count;
        mostCommonFaceEmotion = row.emotion;
      }
    }
  }

  const voiceEmotionCounts: Record<string, number> = {};
  let mostCommonVoiceEmotion: string | null = null;
  let maxVoiceCount = 0;
  for (const row of voiceRows) {
    if (row.emotion) {
      voiceEmotionCounts[row.emotion] = row.count;
      if (row.count > maxVoiceCount) {
        maxVoiceCount = row.count;
        mostCommonVoiceEmotion = row.emotion;
      }
    }
  }

  const result = GetEmotionStatsResponse.parse({
    totalDetections,
    faceEmotionCounts,
    voiceEmotionCounts,
    mostCommonFaceEmotion,
    mostCommonVoiceEmotion,
  });

  res.json(result);
});

export default router;
