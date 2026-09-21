import type { Ref } from "react";
import type { Locale } from "~/content";
import type { FillerFaceSpec, NumeralFaceSpec, PsalmFaceSpec } from "~/components/models";
import type { Narration } from "~/lib/narration";

export interface PaperLeafProps {
  ref?: Ref<HTMLDivElement>;
  folio: number;
  locale: Locale;
  flipped: boolean;
  zIndex: number;
  front: PsalmFaceSpec | FillerFaceSpec;
  back: NumeralFaceSpec | FillerFaceSpec;
  narration: Narration;
  onToggleReading: (num: number) => void;
}
