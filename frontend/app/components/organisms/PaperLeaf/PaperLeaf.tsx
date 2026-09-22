import { psalmsByLocale } from "~/content";
import { toRomanNumeral } from "~/content/roman-numerals";
import { FillerFace } from "~/components/molecules/FillerFace/FillerFace";
import { Leaf } from "~/components/molecules/Leaf/Leaf";
import { NumeralFace } from "~/components/molecules/NumeralFace/NumeralFace";
import { PsalmFace } from "~/components/molecules/PsalmFace/PsalmFace";
import { ShareDialog } from "~/components/molecules/ShareDialog/ShareDialog";
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
  onTap,
  onDoubleTap,
  showShare,
}: PaperLeafProps) {
  const { cover, psalms } = psalmsByLocale[locale];
  const reading = front.kind === "psalm" && narration?.mode === "narration" && narration.psalm === front.num;

  return (
    <Leaf
      ref={ref}
      variant="paper"
      flipped={flipped}
      zIndex={zIndex}
      onTap={onTap}
      onDoubleTap={onDoubleTap}
      front={
        front.kind === "psalm" ? (
          <PsalmFace
            num={front.num}
            psalm={psalms[front.num]}
            reading={reading}
            readingVerse={reading ? (narration?.verse ?? null) : null}
            onToggleReading={() => onToggleReading(front.num)}
            action={
              showShare ? (
                <ShareDialog
                  locale={locale}
                  num={front.num}
                  title={`Psalm ${toRomanNumeral(front.num)} — ${cover.title}`}
                />
              ) : undefined
            }
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
