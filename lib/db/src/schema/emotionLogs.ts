import { pgTable, serial, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const emotionLogsTable = pgTable("emotion_logs", {
  id: serial("id").primaryKey(),
  faceEmotion: text("face_emotion"),
  voiceEmotion: text("voice_emotion"),
  faceConfidence: real("face_confidence"),
  voiceConfidence: real("voice_confidence"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertEmotionLogSchema = createInsertSchema(emotionLogsTable).omit(
  {
    id: true,
    createdAt: true,
  },
);

export type InsertEmotionLog = z.infer<typeof insertEmotionLogSchema>;
export type EmotionLog = typeof emotionLogsTable.$inferSelect;
