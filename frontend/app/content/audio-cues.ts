export interface AudioCue {
  verse: string;
  start: number;
}

/** Narration audio + its cue file live at these paths once recorded; absent until then. */
export function audioSrc(locale: string, num: number): string {
  return `/audio/${locale}/psalm-${num}.mp3`;
}

export function cuesSrc(locale: string, num: number): string {
  return `/audio/${locale}/psalm-${num}.json`;
}

/** The verse of the last cue at or before `time`, per ticket 01: timeupdate-driven, not <track>/cuechange. */
export function findCurrentVerse(cues: readonly AudioCue[], time: number): string | null {
  let current: string | null = null;
  for (const cue of cues) {
    if (cue.start > time) break;
    current = cue.verse;
  }
  return current;
}
