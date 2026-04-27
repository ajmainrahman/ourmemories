export const MOODS = [
  "joyful",
  "peaceful",
  "silly",
  "romantic",
  "adventurous",
  "nostalgic",
  "grateful",
  "bittersweet",
] as const;

export type Mood = (typeof MOODS)[number];

export const MOOD_COLORS: Record<string, string> = {
  joyful: "hsl(40 80% 55%)",
  peaceful: "hsl(195 35% 55%)",
  silly: "hsl(320 55% 60%)",
  romantic: "hsl(8 65% 55%)",
  adventurous: "hsl(15 70% 50%)",
  nostalgic: "hsl(280 30% 55%)",
  grateful: "hsl(165 35% 45%)",
  bittersweet: "hsl(220 20% 50%)",
};

export const AUTHOR_LABELS: Record<string, string> = {
  self: "Ajmain",
  partner: "Khusmita",
  both: "Ours",
};

export function moodColor(mood?: string | null): string {
  if (!mood) return "hsl(var(--muted-foreground))";
  return MOOD_COLORS[mood] ?? "hsl(var(--accent))";
}
