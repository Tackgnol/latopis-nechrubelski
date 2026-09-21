import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Howl, Howler } from "howler";
import { fetchRevealedPsalms, resetSession, rollPsalm } from "~/lib/api";
import {
  createNarrator,
  parseVariant,
  parseVolume,
  previewTrack,
  psalmTracks,
  warmSources,
  type Narration,
  type Variant,
} from "~/lib/narration";
import { readStored, useStored, writeStored } from "~/lib/stored";
import { psalmsByLocale, type PsalmsResource } from "~/content";
import { BookControls } from "~/components/molecules/BookControls/BookControls";
import { CoverFace } from "~/components/molecules/CoverFace/CoverFace";
import { Leaf } from "~/components/molecules/Leaf/Leaf";
import { VariantTabs } from "~/components/molecules/VariantTabs/VariantTabs";
import { VolumeControl } from "~/components/molecules/VolumeControl/VolumeControl";
import { UserIndicator } from "~/components/organisms/UserIndicator/UserIndicator";
import { PaperLeaf } from "~/components/organisms/PaperLeaf/PaperLeaf";
import { BookTemplate } from "~/components/templates/BookTemplate/BookTemplate";
import type { AudioNavigator, BookPageProps, Spread } from "./BookPage.models";
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
  tabsZIndex,
} from "./BookPage.utils";

const VARIANT_KEY = "narration-variant";
const VOLUME_KEY = "narration-volume";
const LAST_VOLUME_KEY = "narration-last-volume";

/**
 * The page's one voice: narration and previews through Howler, the reader's variant and volume,
 * and the idle warm-up of each unrevealed psalm's first verse.
 */
function useNarration(psalms: PsalmsResource["psalms"]) {
  const variant = useStored(VARIANT_KEY, parseVariant);
  const volume = useStored(VOLUME_KEY, parseVolume);
  const [narration, setNarration] = useState<Narration>(null);
  const [narrator] = useState(() => createNarrator((src) => new Howl({ src: [src] }), setNarration));
  const { data: revealed } = useQuery({ queryKey: ["revealed-psalms"], queryFn: fetchRevealedPsalms, retry: false });

  useEffect(() => {
    const nav = navigator as AudioNavigator;
    // Web Audio obeys the iOS silent switch unless the session is declared as playback (Safari 16.4+).
    if (nav.audioSession) nav.audioSession.type = "playback";
    return narrator.dispose;
  }, [narrator]);

  useEffect(() => {
    Howler.volume(volume);
  }, [volume]);

  const revealedKey = revealed?.join(",");
  useEffect(() => {
    if (revealedKey === undefined || (navigator as AudioNavigator).connection?.saveData) return;
    const sources = warmSources(variant, revealedKey ? revealedKey.split(",").map(Number) : []);
    // Safari has no requestIdleCallback.
    if (!window.requestIdleCallback) {
      const id = window.setTimeout(() => narrator.warm(sources), 1000);
      return () => window.clearTimeout(id);
    }
    const id = window.requestIdleCallback(() => narrator.warm(sources));
    return () => window.cancelIdleCallback(id);
  }, [narrator, variant, revealedKey]);

  function setVolume(v: number) {
    writeStored(VOLUME_KEY, String(v));
    if (v > 0) writeStored(LAST_VOLUME_KEY, String(v));
    // A muted voice must not keep moving the yellow.
    else narrator.stop();
  }

  // These read the store, not `variant`/`volume`: autoplay runs from the roll's closure, after the flip awaits.

  /** An explicit play brings a muted reader back to their last audible level. */
  function unmute() {
    if (readStored(VOLUME_KEY, parseVolume) === 0) setVolume(readStored(LAST_VOLUME_KEY, parseVolume) || 1);
  }

  function read(num: number) {
    unmute();
    narrator.play("narration", psalmTracks(readStored(VARIANT_KEY, parseVariant), num, psalms[num].verses));
  }

  /** Narrates a fresh reveal, unless the reader has muted. */
  function autoplay(num: number) {
    if (readStored(VOLUME_KEY, parseVolume) > 0) read(num);
  }

  function toggle(num: number) {
    if (narration?.mode === "narration") narrator.stop();
    else read(num);
  }

  function choose(v: Variant) {
    writeStored(VARIANT_KEY, v);
    unmute();
    narrator.play("preview", [previewTrack(v)]);
  }

  return { narration, variant, volume, setVolume, choose, toggle, autoplay, stop: narrator.stop };
}

export function BookPage({ locale, current }: BookPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cover, psalms } = psalmsByLocale[locale];
  const voice = useNarration(psalms);
  const onSessionChanged = () => queryClient.invalidateQueries({ queryKey: ["revealed-psalms"] });
  const rollMutation = useMutation({ mutationFn: rollPsalm, onSuccess: onSessionChanged });
  const resetMutation = useMutation({ mutationFn: resetSession, onSuccess: onSessionChanged });

  const [flippedCount, setFlippedCount] = useState(() => (current ? FIXED_OPEN_TARGET : 0));
  const [spread, setSpread] = useState<Spread | null>(() =>
    current ? { target: FIXED_OPEN_TARGET, ...current } : null,
  );
  // Previous spread stays mounted during a flip so the old psalm page is covered, not blanked.
  const [prevSpread, setPrevSpread] = useState<Spread | null>(null);
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const flippedCountRef = useRef(flippedCount);
  const rollingRef = useRef(false);
  const pendingSelfNav = useRef(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const bookRef = useRef<HTMLDivElement | null>(null);
  const leafRefs = useRef<(HTMLDivElement | null)[]>([]);

  async function animateRoll(num: number, reveal: number) {
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
      setSpread({ target, num, reveal });
      await new Promise(requestAnimationFrame);
      await flipForward(leafRefs.current, from, target);
      flippedCountRef.current = target;
      setFlippedCount(target);
      setPrevSpread(null);
      // The voice and its ink bleed start together, in the frame the flip settles.
      requestAnimationFrame(() => voice.autoplay(num));
    } finally {
      settleJitter(stageEl, jitterId);
      bookRef.current?.classList.remove("flipping");
    }
  }

  async function roll() {
    if (rollingRef.current) return;
    voice.stop();
    rollingRef.current = true;
    setRolling(true);
    setError(null);
    try {
      const result = await rollMutation.mutateAsync();
      await animateRoll(result.psalm, result.reveal);
      pendingSelfNav.current = true;
      navigate(`/${locale}/psalm/${result.psalm}?r=${result.reveal}`);
    } catch {
      setError(t("rollFailed"));
    } finally {
      rollingRef.current = false;
      setRolling(false);
    }
  }

  async function closeAndGoHome() {
    if (flippedCount === 0) return;
    voice.stop();
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
    voice.stop();
    await resetMutation.mutateAsync();
  }

  // External navigation (browser back/forward, SEO nav link) snaps the book instantly instead of re-riffling.
  useEffect(() => {
    if (pendingSelfNav.current) {
      pendingSelfNav.current = false;
      return;
    }
    voice.stop();
    const target = current ? FIXED_OPEN_TARGET : 0;
    for (let i = 0; i < NLEAVES; i++) setLeafFlipped(leafRefs.current, i, i < target);
    flippedCountRef.current = target;
    setFlippedCount(target);
    setSpread(current ? { target, ...current } : null);
    // Deps track the route's selection only; `current` is a fresh object on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.num, current?.reveal]);

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
      audioControl={<VolumeControl volume={voice.volume} onChange={voice.setVolume} />}
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
      <VariantTabs selected={voice.variant} zIndex={tabsZIndex(flippedCount)} onChoose={voice.choose} />
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
            narration={voice.narration}
            onToggleReading={voice.toggle}
          />
        );
      })}
    </BookTemplate>
  );
}
