import type { AudioCue } from "~/content/audio-cues";

export interface AudioPlayerProps {
  src: string;
  cues: readonly AudioCue[];
  onVerseChange: (verse: string | null) => void;
}
