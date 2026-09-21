/**
 * PROTOTYPE — throwaway, answers issue #6: how the narrating verse looks against the roll's
 * ink mark. Four treatments on the real /:locale/psalm/:num route, switched with ?nv=A|B|C|D
 * (the controls are pinned to #5's winner, D). No audio: CZYTAJ runs a fake clock that hands
 * the narrating verse down the page, each verse lasting roughly as long as its text would take
 * to read, then clears. Dies with this branch.
 */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import "./PrototypeNarratingVerse.styles.css";

const NV = ["A", "B", "C", "D", "E"] as const;
type Nv = (typeof NV)[number];

const NV_NAMES: Record<Nv, string> = {
  A: "Ink pointer in the margin",
  B: "Line written under the verse",
  C: "Reading lamp (the rest dims)",
  D: "Stamped verse number",
  E: "One yellow, on the verse being read",
};

export function useNv(): Nv {
  const [params] = useSearchParams();
  const value = params.get("nv") ?? "";
  return (NV as readonly string[]).includes(value) ? (value as Nv) : "A";
}

/** Fake narration: ms a verse "takes", so B's underline and the hand-over pace feel real. */
function verseMs(text: string) {
  return 1200 + text.length * 38;
}

/** Drives onVerseChange through the verses in order while `playing`, then clears and calls onEnd. */
export function useFakeNarration(
  playing: boolean,
  verses: Record<string, string>,
  onVerseChange: (vn: string | null) => void,
  onEnd: () => void,
) {
  useEffect(() => {
    if (!playing) {
      onVerseChange(null);
      return;
    }
    const keys = Object.keys(verses);
    let i = 0;
    let timer = 0;
    const step = () => {
      if (i >= keys.length) {
        onVerseChange(null);
        onEnd();
        return;
      }
      const vn = keys[i++];
      document.body.style.setProperty("--nv-dur", `${verseMs(verses[vn])}ms`);
      onVerseChange(vn);
      timer = window.setTimeout(step, verseMs(verses[vn]));
    };
    step();
    return () => {
      window.clearTimeout(timer);
      onVerseChange(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);
}

export function PrototypeNvSwitcher({ playingVerse }: { playingVerse: string | null }) {
  const nv = useNv();
  const [, setParams] = useSearchParams();

  useEffect(() => {
    document.body.dataset.nv = nv;
  }, [nv]);

  function go(step: number) {
    const next = NV[(NV.indexOf(nv) + step + NV.length) % NV.length];
    setParams(
      (prev) => {
        prev.set("nv", next);
        return prev;
      },
      { replace: true, preventScrollReset: true },
    );
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (import.meta.env.PROD) return null;

  return (
    <div className="proto-switcher">
      <button type="button" onClick={() => go(-1)} aria-label="Previous variant">
        ←
      </button>
      <span>
        {nv} — {NV_NAMES[nv]} · {playingVerse ? `narrating v${playingVerse}` : "silent"}
      </span>
      <button type="button" onClick={() => go(1)} aria-label="Next variant">
        →
      </button>
    </div>
  );
}
