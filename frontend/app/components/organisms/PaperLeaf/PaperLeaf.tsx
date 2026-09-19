import { skipToken, useQuery } from "@tanstack/react-query";
import { psalmsByLocale, type Locale } from "~/content";
import { audioSrc } from "~/content/audio-cues";
import { FillerFace } from "~/components/molecules/FillerFace/FillerFace";
import { Leaf } from "~/components/molecules/Leaf/Leaf";
import { NumeralFace } from "~/components/molecules/NumeralFace/NumeralFace";
import { PsalmFace } from "~/components/molecules/PsalmFace/PsalmFace";
import type { PaperLeafProps } from "./PaperLeaf.models";
import { fetchAudioCues } from "./PaperLeaf.utils";

function useAudioCues(locale: Locale, num: number | null) {
  const { data } = useQuery({
    queryKey: ["audio-cues", locale, num],
    queryFn: num === null ? skipToken : () => fetchAudioCues(locale, num),
    staleTime: Infinity,
    retry: false,
  });
  return data ?? null;
}

export function PaperLeaf({
  ref,
  folio,
  locale,
  flipped,
  zIndex,
  front,
  back,
  highlightOn,
  playingVerse,
  onVerseChange,
}: PaperLeafProps) {
  const { cover, psalms } = psalmsByLocale[locale];
  const cues = useAudioCues(locale, front.kind === "psalm" ? front.num : null);

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
            verse={front.verse}
            highlightOn={highlightOn}
            playingVerse={playingVerse}
            audio={cues && { src: audioSrc(locale, front.num), cues }}
            onVerseChange={onVerseChange}
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
