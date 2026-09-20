/**
 * PROTOTYPE — throwaway, answers issue #5. Three takes on the variant chooser and the
 * narration play/stop control, mounted on the real /:locale/psalm/:num route and switched
 * with ?variant=A|B|C. No audio, no persistence: the tabs and the button only toggle
 * themselves, so the resting state of the button is the "arrived in silence" state.
 * Dies with this branch — none of this is production shape (STD-002/003/004 not honoured).
 */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import "./PrototypeNarration.styles.css";

const VARIANTS = ["A", "B", "C"] as const;
type Variant = (typeof VARIANTS)[number];

const VARIANT_NAMES: Record<Variant, string> = {
  A: "Pinned scraps",
  B: "Ledger tabs",
  C: "Control strip",
};

const LETTERS = ["A", "B", "C", "D"] as const;

function useVariant(): Variant {
  const [params] = useSearchParams();
  const value = params.get("variant") ?? "";
  return (VARIANTS as readonly string[]).includes(value) ? (value as Variant) : "A";
}

function useLetter() {
  return useState<string>("A");
}

/** Variants A and C: chooser lives in the page furniture, outside the book. */
export function PrototypeNarrationOverlay() {
  const variant = useVariant();
  const [letter, setLetter] = useLetter();

  return (
    <>
      {variant === "A" && (
        <div className="proto-scraps">
          {LETTERS.map((l, i) => (
            <button
              key={l}
              type="button"
              className={l === letter ? "proto-scrap on" : "proto-scrap"}
              style={{ "--i": i } as React.CSSProperties}
              onClick={() => setLetter(l)}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {variant === "C" && (
        <div className="proto-strip">
          {LETTERS.map((l) => (
            <button
              key={l}
              type="button"
              className={l === letter ? "proto-cell on" : "proto-cell"}
              onClick={() => setLetter(l)}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      <PrototypeSwitcher />
    </>
  );
}

/** Variant B: chooser is fixed to the book itself, so it scales and moves with it. */
export function PrototypeBookTabs() {
  const variant = useVariant();
  const [letter, setLetter] = useLetter();
  if (variant !== "B") return null;

  return (
    <div className="proto-ledger">
      {LETTERS.map((l) => (
        <button
          key={l}
          type="button"
          className={l === letter ? "proto-ledger-tab on" : "proto-ledger-tab"}
          onClick={() => setLetter(l)}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/** The play/stop control on the psalm face, replacing today's <audio controls>. */
export function PrototypePlayControl() {
  const variant = useVariant();
  const [playing, setPlaying] = useState(false);
  const toggle = () => setPlaying((p) => !p);

  if (variant === "A") {
    return (
      <button
        type="button"
        className={playing ? "proto-blot on" : "proto-blot"}
        onClick={toggle}
        aria-label={playing ? "Cisza" : "Czytaj"}
      >
        {playing ? "■" : "▶"}
      </button>
    );
  }

  if (variant === "B") {
    return (
      <button type="button" className={playing ? "proto-bar on" : "proto-bar"} onClick={toggle}>
        <svg className="proto-bar-tear" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 8 L13 1 L28 6 L47 0 L63 5 L82 0 L100 6 L98 38 L100 66 L99 96 L84 100 L62 96 L41 100 L19 95 L5 100 L1 88 L0 56 Z" />
        </svg>
        <span>{playing ? "■ Cisza" : "▶ Czytaj"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={playing ? "proto-stamp on" : "proto-stamp"}
      onClick={toggle}
      aria-label={playing ? "Cisza" : "Czytaj"}
    >
      {playing ? "■" : "▶"}
    </button>
  );
}

function PrototypeSwitcher() {
  const variant = useVariant();
  const [, setParams] = useSearchParams();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el?.ariaLive) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const step = e.key === "ArrowLeft" ? -1 : 1;
      const next = VARIANTS[(VARIANTS.indexOf(variant) + step + VARIANTS.length) % VARIANTS.length];
      setParams(
        (prev) => {
          prev.set("variant", next);
          return prev;
        },
        { replace: true, preventScrollReset: true },
      );
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant, setParams]);

  if (import.meta.env.PROD) return null;

  function go(step: number) {
    const next = VARIANTS[(VARIANTS.indexOf(variant) + step + VARIANTS.length) % VARIANTS.length];
    setParams(
      (prev) => {
        prev.set("variant", next);
        return prev;
      },
      { replace: true, preventScrollReset: true },
    );
  }

  return (
    <div className="proto-switcher">
      <button type="button" onClick={() => go(-1)} aria-label="Previous variant">
        ←
      </button>
      <span>
        {variant} — {VARIANT_NAMES[variant]}
      </span>
      <button type="button" onClick={() => go(1)} aria-label="Next variant">
        →
      </button>
    </div>
  );
}
