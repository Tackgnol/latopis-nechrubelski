import { findCurrentVerse } from "~/content/audio-cues";
import type { AudioPlayerProps } from "./AudioPlayer.models";
import "./AudioPlayer.styles.css";

export function AudioPlayer({ src, cues, onVerseChange }: AudioPlayerProps) {
  return (
    <audio
      className="audio-player"
      controls
      src={src}
      onTimeUpdate={(e) => onVerseChange(findCurrentVerse(cues, e.currentTarget.currentTime))}
    />
  );
}
