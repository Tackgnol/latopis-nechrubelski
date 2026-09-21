import type { Psalm } from "~/content";

export interface PsalmFaceProps {
  num: number;
  psalm: Psalm;
  /** This psalm is being narrated; the bar reads CISZA. */
  reading: boolean;
  /** The verse the voice is on, the only one inked yellow. */
  readingVerse: string | null;
  onToggleReading: () => void;
}
