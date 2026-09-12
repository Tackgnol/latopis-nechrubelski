import { useEffect, useState } from "react";
import { data, Link, useLoaderData, useLocation, type LoaderFunctionArgs } from "react-router";
import { useTranslation } from "react-i18next";
import { psalmsByLocale, type Locale } from "~/content";
import { toRomanNumeral } from "~/content/roman-numerals";
import { audioSrc, cuesSrc, findCurrentVerse, type AudioCue } from "~/content/audio-cues";

export function loader({ params }: LoaderFunctionArgs) {
  const locale = params.locale as Locale;
  const num = Number(params.num);
  const psalm = psalmsByLocale[locale].psalms[num];
  if (!psalm) throw data("Psalm not found", { status: 404 });
  return { locale, num, psalm };
}

/** Renders nothing until narration + cues exist for this psalm/locale (see ticket 01). */
function PsalmAudio({
  locale,
  num,
  onVerseChange,
}: {
  locale: Locale;
  num: number;
  onVerseChange: (verse: string | null) => void;
}) {
  const [cues, setCues] = useState<AudioCue[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(cuesSrc(locale, num))
      .then((res) => (res.ok ? (res.json() as Promise<AudioCue[]>) : null))
      .then((loaded) => !cancelled && setCues(loaded))
      .catch(() => !cancelled && setCues(null));
    return () => {
      cancelled = true;
    };
  }, [locale, num]);

  if (!cues) return null;
  return (
    <audio
      controls
      src={audioSrc(locale, num)}
      onTimeUpdate={(e) => onVerseChange(findCurrentVerse(cues, e.currentTarget.currentTime))}
    />
  );
}

export default function PsalmPage() {
  const { locale, num, psalm } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const revealedVerse = useLocation().hash.replace(/^#verse-/, "") || null;
  const [playingVerse, setPlayingVerse] = useState<string | null>(null);

  return (
    <main>
      <h1>
        Psalm {toRomanNumeral(num)} — {psalm.label}
      </h1>
      <PsalmAudio locale={locale} num={num} onVerseChange={setPlayingVerse} />
      <ol>
        {Object.entries(psalm.verses).map(([verseNum, text]) => (
          <li
            key={verseNum}
            id={`verse-${verseNum}`}
            aria-current={revealedVerse === verseNum ? "true" : undefined}
            data-revealed={revealedVerse === verseNum}
            data-playing={playingVerse === verseNum}
          >
            {text}
          </li>
        ))}
      </ol>
      <Link to={`/${locale}`}>{t("backToCover")}</Link>
    </main>
  );
}
