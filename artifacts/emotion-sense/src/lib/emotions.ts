export const EMOTION_MAP: Record<string, { emoji: string; color: string; label: string }> = {
  Happy: { emoji: "😊", color: "bg-green-500", label: "Happy" },
  Sad: { emoji: "😢", color: "bg-blue-500", label: "Sad" },
  Angry: { emoji: "😠", color: "bg-red-500", label: "Angry" },
  Fear: { emoji: "😨", color: "bg-purple-500", label: "Fear" },
  Surprise: { emoji: "😲", color: "bg-yellow-500", label: "Surprise" },
  Disgust: { emoji: "🤢", color: "bg-orange-500", label: "Disgust" },
  Neutral: { emoji: "😐", color: "bg-gray-500", label: "Neutral" },
};

export function getEmotionDisplay(emotion: string | null | undefined) {
  if (!emotion) return { emoji: "❓", color: "bg-gray-700", label: "Unknown" };
  // Find a match ignoring case
  const key = Object.keys(EMOTION_MAP).find(k => k.toLowerCase() === emotion.toLowerCase());
  return key ? EMOTION_MAP[key] : { emoji: "🧠", color: "bg-primary", label: emotion };
}
