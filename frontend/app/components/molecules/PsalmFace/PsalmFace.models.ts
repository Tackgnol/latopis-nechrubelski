import type { Psalm } from "~/content";
import type { AudioCue } from "~/content/audio-cues";

export interface PsalmFaceProps {
  num: number;
  psalm: Psalm;
  verse: string;
  highlightOn: boolean;
  playingVerse: string | null;
  audio: { src: string; cues: readonly AudioCue[] } | null;
  onVerseChange: (verse: string | null) => void;
}
