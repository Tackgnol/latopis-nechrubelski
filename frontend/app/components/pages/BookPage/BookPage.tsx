import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { resetSession, rollPsalm } from "~/lib/api";
import { psalmsByLocale } from "~/content";
import { BookControls } from "~/components/molecules/BookControls/BookControls";
import { CoverFace } from "~/components/molecules/CoverFace/CoverFace";
import { Leaf } from "~/components/molecules/Leaf/Leaf";
import { UserIndicator } from "~/components/organisms/UserIndicator/UserIndicator";
import { PaperLeaf } from "~/components/organisms/PaperLeaf/PaperLeaf";
import { BookTemplate } from "~/components/templates/BookTemplate/BookTemplate";
import type { BookPageProps, Spread } from "./BookPage.models";
import {
  CLOSE_STAGGER,
  FIXED_OPEN_TARGET,
  MAX_TARGET,
  NLEAVES,
  fitStage,
  flipBackward,
  flipForward,
  leafFacesFor,
  leafZIndex,
  setLeafFlipped,
  settleJitter,
  startJitter,
} from "./BookPage.utils";

export function BookPage({ locale, current }: BookPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cover } = psalmsByLocale[locale];
  const rollMutation = useMutation({ mutationFn: rollPsalm });
  const resetMutation = useMutation({ mutationFn: resetSession });

  const [flippedCount, setFlippedCount] = useState(() => (current ? FIXED_OPEN_TARGET : 0));
  const [spread, setSpread] = useState<Spread | null>(() =>
    current ? { target: FIXED_OPEN_TARGET, ...current } : null,
  );
  // Previous spread stays mounted during a flip so the old psalm page is covered, not blanked.
  const [prevSpread, setPrevSpread] = useState<Spread | null>(null);
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

  async function animateRoll(num: number, verse: string, reveal: number) {
    const stageEl = stageRef.current;
    if (!stageEl) return;
    bookRef.current?.classList.remove("closed");
    bookRef.current?.classList.add("flipping");
    const jitterId = startJitter(stageEl);
    try {
      let from = flippedCountRef.current;
      const k = 2 + Math.floor(Math.random() * 3);
      let target = from + k;
      if (target > MAX_TARGET) {
        await flipBackward(leafRefs.current, from, CLOSE_STAGGER);
        flippedCountRef.current = 0;
        from = 0;
        target = Math.min(k, MAX_TARGET);
      }
      setPrevSpread(spread);
      setSpread({ target, num, verse, reveal });
      await new Promise(requestAnimationFrame);
      await flipForward(leafRefs.current, from, target);
      flippedCountRef.current = target;
      setFlippedCount(target);
      setPrevSpread(null);
      setHighlightOn(false);
      requestAnimationFrame(() => setHighlightOn(true));
    } finally {
      settleJitter(stageEl, jitterId);
      bookRef.current?.classList.remove("flipping");
    }
  }

  async function roll() {
    if (rollingRef.current) return;
    rollingRef.current = true;
    setRolling(true);
    setError(null);
    try {
      const result = await rollMutation.mutateAsync();
      const verse = String(result.verse);
      await animateRoll(result.psalm, verse, result.reveal);
      pendingSelfNav.current = true;
      navigate(`/${locale}/psalm/${result.psalm}?v=${verse}&r=${result.reveal}`);
    } catch {
      setError(t("rollFailed"));
    } finally {
      rollingRef.current = false;
      setRolling(false);
    }
  }

  async function closeAndGoHome() {
    if (flippedCount === 0) return;
    bookRef.current?.classList.add("closed", "flipping");
    const stageEl = stageRef.current;
    if (stageEl) {
      const jitterId = startJitter(stageEl);
      await flipBackward(leafRefs.current, flippedCount, CLOSE_STAGGER);
      settleJitter(stageEl, jitterId);
    }
    bookRef.current?.classList.remove("flipping");
    flippedCountRef.current = 0;
    setFlippedCount(0);
    setSpread(null);
    pendingSelfNav.current = true;
    navigate(`/${locale}`);
  }

  async function handleReset() {
    if (!window.confirm(t("resetConfirm"))) return;
    await resetMutation.mutateAsync();
  }

  // External navigation (browser back/forward, SEO nav link) snaps the book instantly instead of re-riffling.
  useEffect(() => {
    if (pendingSelfNav.current) {
      pendingSelfNav.current = false;
      return;
    }
    const target = current ? FIXED_OPEN_TARGET : 0;
    for (let i = 0; i < NLEAVES; i++) setLeafFlipped(leafRefs.current, i, i < target);
    flippedCountRef.current = target;
    setFlippedCount(target);
    setSpread(current ? { target, ...current } : null);
    setHighlightOn(true);
    // Deps track the route's selection only; `current` is a fresh object on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.num, current?.verse, current?.reveal]);

  useEffect(() => {
    function layout() {
      const stageEl = stageRef.current;
      if (stageEl) document.body.classList.toggle("single", fitStage(stageEl));
    }
    layout();
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, []);

  return (
    <BookTemplate
      stageRef={stageRef}
      bookRef={bookRef}
      closed={flippedCount === 0}
      error={error}
      userIndicator={<UserIndicator />}
      controls={
        <BookControls
          isOpen={flippedCount > 0}
          canRoll={current?.num !== 7}
          isBusy={rolling}
          onRoll={roll}
          onClose={closeAndGoHome}
          onReset={handleReset}
        />
      }
    >
      <Leaf
        ref={(el) => {
          leafRefs.current[0] = el;
        }}
        variant="cover"
        flipped={flippedCount > 0}
        zIndex={leafZIndex(0, flippedCount)}
        onActivate={flippedCount === 0 && !rolling ? roll : undefined}
        front={<CoverFace side="front" cover={cover} />}
        back={<CoverFace side="back" cover={cover} />}
      />
      {Array.from({ length: NLEAVES - 1 }, (_, k) => k + 1).map((i) => {
        const { front, back } = leafFacesFor(i, spread, prevSpread);
        return (
          <PaperLeaf
            key={i}
            ref={(el) => {
              leafRefs.current[i] = el;
            }}
            folio={i}
            locale={locale}
            flipped={i < flippedCount}
            zIndex={leafZIndex(i, flippedCount)}
            front={front}
            back={back}
            highlightOn={highlightOn}
            playingVerse={playingVerse}
            onVerseChange={setPlayingVerse}
          />
        );
      })}
    </BookTemplate>
  );
}
