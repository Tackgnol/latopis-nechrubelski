import { audioCuesSchema, cuesSrc, type AudioCue } from "~/content/audio-cues";

/** Cues for a psalm's narration, or null while no recording exists (a missing file is the normal case). */
export async function fetchAudioCues(locale: string, num: number): Promise<AudioCue[] | null> {
  const res = await fetch(cuesSrc(locale, num));
  if (!res.ok) return null;
  const parsed = audioCuesSchema.safeParse(await res.json().catch(() => null));
  return parsed.success ? parsed.data : null;
}
