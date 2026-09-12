import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { apiPost } from "~/lib/api";
import { renderFiller } from "~/lib/filler-text";
import { psalmsByLocale, type Locale } from "~/content";
import { toRomanNumeral } from "~/content/roman-numerals";
import { audioSrc, cuesSrc, findCurrentVerse, type AudioCue } from "~/content/audio-cues";
import { TornButton } from "./TornButton";

const NLEAVES = 29; // 1 cover + enough leaves for seven reveals at four flips each
const MAX_TARGET = NLEAVES - 1;
const FIXED_OPEN_TARGET = 2; // arbitrary/cosmetic leaf position used when mounting already-open (deep links)
const STAGGER = 130;
const CLOSE_STAGGER = 55; // PoC-improved.html closes faster/snappier than it opens
const LEAF_MS = 420;
const PW = 340;
const PH = 520;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface CurrentPsalm {
  num: number;
  verse: string;
}

interface Spread {
  target: number;
  num: number;
  verse: string;
}

export function Book({ locale, current }: { locale: Locale; current: CurrentPsalm | null }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cover, psalms } = psalmsByLocale[locale];

  const [flippedCount, setFlippedCount] = useState(() => (current ? FIXED_OPEN_TARGET : 0));
  const [spread, setSpread] = useState<Spread | null>(() =>
    current ? { target: FIXED_OPEN_TARGET, num: current.num, verse: current.verse } : null,
  );
  const [highlightOn, setHighlightOn] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingVerse, setPlayingVerse] = useState<string | null>(null);

  const flippedCountRef = useRef(flippedCount);
  const rollingRef = useRef(false);
  const pendingSelfNav = useRef(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const bookRef = useRef<HTMLDivElement | null>(null);
  const leafRefs = useRef<(HTMLDivElement | null)[]>([]);

  function setLeafFlipped(i: number, flipped: boolean) {
    const el = leafRefs.current[i];
    if (!el) return;
    el.classList.toggle("flipped", flipped);
    el.style.zIndex = String(flipped ? 100 + i : NLEAVES - i);
  }

  function startJitter(stageEl: HTMLDivElement) {
    return window.setInterval(() => {
      stageEl.style.setProperty("--jx", `${(Math.random() - 0.5) * 6}px`);
      stageEl.style.setProperty("--jy", `${(Math.random() - 0.5) * 4}px`);
      stageEl.style.setProperty("--jr", `${(Math.random() - 0.5) * 1.2}deg`);
    }, 90);
  }

  function settleJitter(stageEl: HTMLDivElement, intervalId: number) {
    clearInterval(intervalId);
    stageEl.classList.add("settle");
    stageEl.style.setProperty("--jx", "0px");
    stageEl.style.setProperty("--jy", "0px");
    stageEl.style.setProperty("--jr", "0deg");
    setTimeout(() => stageEl.classList.remove("settle"), 700);
  }

  async function flipForward(from: number, to: number) {
    for (let i = from; i < to; i++) {
      setLeafFlipped(i, true);
      await delay(STAGGER);
    }
    await delay(Math.max(0, LEAF_MS - STAGGER));
  }

  async function flipBackward(from: number, stagger = STAGGER) {
    for (let i = from - 1; i >= 0; i--) {
      setLeafFlipped(i, false);
      await delay(stagger);
    }
    await delay(Math.max(0, LEAF_MS - stagger));
  }

  async function animateRoll(num: number, verse: string) {
    const stageEl = stageRef.current;
    if (!stageEl) return;
    bookRef.current?.classList.remove("closed");
    const jitterId = startJitter(stageEl);
    try {
      let from = flippedCountRef.current;
      const k = 2 + Math.floor(Math.random() * 3);
      let target = from + k;
      if (target > MAX_TARGET) {
        await flipBackward(from, CLOSE_STAGGER);
        flippedCountRef.current = 0;
        from = 0;
        target = Math.min(k, MAX_TARGET);
      }
      setSpread({ target, num, verse });
      await new Promise(requestAnimationFrame);
      await flipForward(from, target);
      flippedCountRef.current = target;
      setFlippedCount(target);
      setHighlightOn(false);
      requestAnimationFrame(() => setHighlightOn(true));
    } finally {
      settleJitter(stageEl, jitterId);
    }
  }

  async function roll() {
    if (rollingRef.current) return;
    rollingRef.current = true;
    setRolling(true);
    setError(null);
    try {
      let result: { psalm: number; verse: number };
      try {
        result = await apiPost<{ psalm: number; verse: number }>("/api/sessions/roll");
      } catch (err) {
        if (!(err instanceof Error) || err.message !== "all-revealed") throw err;
        result = await apiPost<{ psalm: number; verse: number }>("/api/sessions/reveal-end");
      }
      const verse = String(result.verse);
      await animateRoll(result.psalm, verse);
      pendingSelfNav.current = true;
      navigate(`/${locale}/psalm/${result.psalm}?v=${verse}`);
    } catch {
      setError(t("rollFailed"));
    } finally {
      rollingRef.current = false;
      setRolling(false);
    }
  }

  async function closeAndGoHome() {
    if (flippedCount === 0) return;
    bookRef.current?.classList.add("closed");
    const stageEl = stageRef.current;
    if (stageEl) {
      const jitterId = startJitter(stageEl);
      await flipBackward(flippedCount, CLOSE_STAGGER);
      settleJitter(stageEl, jitterId);
    }
    flippedCountRef.current = 0;
    setFlippedCount(0);
    setSpread(null);
    pendingSelfNav.current = true;
    navigate(`/${locale}`);
  }

  async function handleReset() {
    if (!window.confirm(t("resetConfirm"))) return;
    await apiPost("/api/sessions/reset");
  }

  // External navigation (browser back/forward, SEO nav link) snaps the book instantly instead of re-riffling.
  useEffect(() => {
    if (pendingSelfNav.current) {
      pendingSelfNav.current = false;
      return;
    }
    const target = current ? FIXED_OPEN_TARGET : 0;
    for (let i = 0; i < NLEAVES; i++) setLeafFlipped(i, i < target);
    flippedCountRef.current = target;
    setFlippedCount(target);
    setSpread(current ? { target, num: current.num, verse: current.verse } : null);
    setHighlightOn(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.num, current?.verse]);

  useEffect(() => {
    const verses = bookRef.current?.querySelector<HTMLElement>(".psalm .verses");
    if (!verses) return;
    let size = 14.5;
    verses.style.fontSize = size + "px";
    while (verses.scrollHeight > verses.clientHeight + 1 && size > 9.5) {
      size -= 0.5;
      verses.style.fontSize = size + "px";
    }
  }, [spread]);

  useEffect(() => {
    function layout() {
      const stageEl = stageRef.current;
      if (!stageEl) return;
      const narrow = window.innerWidth < 640;
      const width = narrow ? PW : PW * 2;
      const scale = Math.min(1, (window.innerWidth - 24) / (width + 44), (window.innerHeight - (narrow ? 170 : 150)) / (PH + 44));
      stageEl.style.setProperty("--s", String(scale));
      document.body.classList.toggle("single", narrow);
    }
    layout();
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, []);

  function leafClassName(i: number) {
    const flipped = i < flippedCount;
    return `leaf ${i === 0 ? "cover" : "paper"}${flipped ? " flipped" : ""}`;
  }

  function leafZIndex(i: number) {
    const flipped = i < flippedCount;
    return flipped ? 100 + i : NLEAVES - i;
  }

  function paperFaces(i: number) {
    const isFront = spread && i === spread.target;
    const isBack = spread && i === spread.target - 1;
    if (isFront && spread) {
      const psalm = psalms[spread.num];
      return {
        front: (
          <div className="psalm">
            <h1 className="psalm-title">Psalm {toRomanNumeral(spread.num)}</h1>
            {spread.num === 7 && <p className="psalm-label">KOŃCZĄCY</p>}
            <PsalmAudio locale={locale} num={spread.num} onVerseChange={setPlayingVerse} />
            <ol className="verses">
              {Object.entries(psalm.verses).map(([vn, text]) => (
                <li
                  key={vn}
                  className={vn === spread.verse ? `verse marked${highlightOn ? " on" : ""}` : "verse"}
                  data-playing={playingVerse === vn}
                >
                  <span className="vn">
                    {spread.num}:{vn}
                  </span>{" "}
                  <span className="vt">{text}</span>
                </li>
              ))}
            </ol>
          </div>
        ),
        back: <FillerFace folio={i} side="back" cover={cover} />,
      };
    }
    if (isBack && spread) {
      return {
        front: <FillerFace folio={i} side="front" cover={cover} />,
        back: (
          <div className="num-page">
            <div className="blot" aria-hidden="true" />
            <div className="numeral">{toRomanNumeral(spread.num)}</div>
            <p className="misery">
              {t("misery")}{" "}
              <b>
                {spread.num}:{spread.verse}
              </b>
            </p>
          </div>
        ),
      };
    }
    return {
      front: <FillerFace folio={i} side="front" cover={cover} />,
      back: <FillerFace folio={i} side="back" cover={cover} />,
    };
  }

  return (
    <div className="viewport">
      <div className="stage" ref={stageRef}>
        <div className={`book${flippedCount === 0 ? " closed" : ""}`} ref={bookRef}>
          <div className="shadow" aria-hidden="true" />
          <div className="board" aria-hidden="true" />
          <div className="spine" aria-hidden="true" />
          {Array.from({ length: NLEAVES }, (_, i) => {
            const faces = i === 0 ? null : paperFaces(i);
            return (
              <div
                key={i}
                ref={(el) => {
                  leafRefs.current[i] = el;
                }}
                className={leafClassName(i)}
                style={{ zIndex: leafZIndex(i) }}
                onClick={i === 0 && flippedCount === 0 && !rolling ? () => roll() : undefined}
                role={i === 0 && flippedCount === 0 ? "button" : undefined}
                tabIndex={i === 0 && flippedCount === 0 ? 0 : undefined}
              >
                {i === 0 ? (
                  <>
                    <div className="face front">
                      <div className="cover-front">
                        <h1 className="cover-title">{cover.title}</h1>
                        <p className="cover-sub">{cover.subtitle}</p>
                        <div className="cover-skull" aria-hidden="true" />
                        <p className="cover-by">{cover.author}</p>
                      </div>
                    </div>
                    <div className="face back">
                      <div className="cover-back">
                        <div className="cover-mark" aria-hidden="true" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="face front">{faces!.front}</div>
                    <div className="face back">{faces!.back}</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="controls">
        {current?.num !== 7 && (
          <TornButton onPress={() => roll()} isDisabled={rolling}>
            {flippedCount === 0 ? t("openBook") : t("rollAgain")}
          </TornButton>
        )}
        {flippedCount > 0 && (
          <TornButton quiet onPress={closeAndGoHome} isDisabled={rolling}>
            {t("closeBook")}
          </TornButton>
        )}
        {flippedCount === 0 && (
          <TornButton quiet onPress={handleReset} isDisabled={rolling}>
            {t("reset")}
          </TornButton>
        )}
      </div>

      {error && (
        <p className="cover-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
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

function FillerFace({
  folio,
  side,
  cover,
}: {
  folio: number;
  side: "front" | "back";
  cover: { title: string };
}) {
  const f = renderFiller(folio, side);
  return (
    <div className="filler" aria-hidden="true">
      <h2 className="filler-heading">{f.heading}</h2>
      <p className="filler-rubric">{f.rubric}</p>
      <div className="filler-script">
        {f.paragraphs.map((p, idx) => (
          <p className="filler-paragraph" key={idx}>
            {p}
          </p>
        ))}
      </div>
      <p className="filler-note">{f.note}</p>
      <div className="filler-blot" />
      <div className="filler-folio">
        <span>{f.folioLabel}</span>
        <span>{cover.title}</span>
      </div>
    </div>
  );
}
