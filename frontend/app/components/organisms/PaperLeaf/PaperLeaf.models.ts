import type { Ref } from "react";
import type { Locale } from "~/content";
import type { FillerFaceSpec, NumeralFaceSpec, PsalmFaceSpec } from "~/components/models";

export interface PaperLeafProps {
  ref?: Ref<HTMLDivElement>;
  folio: number;
  locale: Locale;
  flipped: boolean;
  zIndex: number;
  front: PsalmFaceSpec | FillerFaceSpec;
  back: NumeralFaceSpec | FillerFaceSpec;
  highlightOn: boolean;
  playingVerse: string | null;
  onVerseChange: (verse: string | null) => void;
}
