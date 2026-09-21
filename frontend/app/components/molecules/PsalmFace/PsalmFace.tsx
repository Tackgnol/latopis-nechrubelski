import { useEffect, useRef } from "react";
import { toRomanNumeral } from "~/content/roman-numerals";
import { useTranslation } from "react-i18next";
import { ReadAloudButton } from "~/components/atoms/ReadAloudButton/ReadAloudButton";
import { Verse } from "~/components/atoms/Verse/Verse";
import type { PsalmFaceProps } from "./PsalmFace.models";
import { fitFontSize } from "./PsalmFace.utils";
import "./PsalmFace.styles.css";

export function PsalmFace({ num, psalm, reading, readingVerse, onToggleReading }: PsalmFaceProps) {
  const { t } = useTranslation();
  const versesRef = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    const verses = versesRef.current;
    if (!verses) return;

    let frame = 0;
    const fit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => fitFontSize(verses));
    };

    const observer = new ResizeObserver(fit);
    observer.observe(verses);
    void document.fonts.ready.then(fit);
    fit();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [psalm]);

  return (
    <div className="psalm">
      <h1 className="psalm-title">Psalm {toRomanNumeral(num)}</h1>
      {num === 7 && <p className="psalm-label">KOŃCZĄCY</p>}
      <ReadAloudButton playing={reading} label={reading ? t("silence") : t("read")} onPress={onToggleReading} />
      <ol ref={versesRef} className="verses">
        {Object.entries(psalm.verses).map(([vn, text]) => (
          <Verse
            key={vn}
            psalmNum={num}
            verseNum={vn}
            text={text}
            playing={readingVerse === vn}
          />
        ))}
      </ol>
    </div>
  );
}
