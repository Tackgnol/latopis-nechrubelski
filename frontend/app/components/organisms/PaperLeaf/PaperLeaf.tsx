import { psalmsByLocale } from "~/content";
import { FillerFace } from "~/components/molecules/FillerFace/FillerFace";
import { Leaf } from "~/components/molecules/Leaf/Leaf";
import { NumeralFace } from "~/components/molecules/NumeralFace/NumeralFace";
import { PsalmFace } from "~/components/molecules/PsalmFace/PsalmFace";
import type { PaperLeafProps } from "./PaperLeaf.models";

export function PaperLeaf({
  ref,
  folio,
  locale,
  flipped,
  zIndex,
  front,
  back,
  narration,
  onToggleReading,
}: PaperLeafProps) {
  const { cover, psalms } = psalmsByLocale[locale];
  const reading = front.kind === "psalm" && narration?.mode === "narration" && narration.psalm === front.num;

  return (
    <Leaf
      ref={ref}
      variant="paper"
      flipped={flipped}
      zIndex={zIndex}
      front={
        front.kind === "psalm" ? (
          <PsalmFace
            num={front.num}
            psalm={psalms[front.num]}
            reading={reading}
            readingVerse={reading ? (narration?.verse ?? null) : null}
            onToggleReading={() => onToggleReading(front.num)}
          />
        ) : (
          <FillerFace folio={folio} side="front" coverTitle={cover.title} />
        )
      }
      back={
        back.kind === "numeral" ? (
          <NumeralFace num={back.num} reveal={back.reveal} />
        ) : (
          <FillerFace folio={folio} side="back" coverTitle={cover.title} />
        )
      }
    />
  );
}
