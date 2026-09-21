import type { FillerFaceSpec, NumeralFaceSpec, PsalmFaceSpec } from "~/components/models";
import type { Spread } from "./BookPage.models";

export const NLEAVES = 29; // 1 cover + enough leaves for seven reveals at four flips each
export const MAX_TARGET = NLEAVES - 1;
export const FIXED_OPEN_TARGET = 2; // cosmetic leaf position used when mounting already open (deep links)
export const STAGGER = 130;
export const CLOSE_STAGGER = 55;
export const LEAF_MS = 420;
export const PW = 340;
export const PH = 520;

export type LeafElements = (HTMLDivElement | null)[];

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function leafZIndex(i: number, flippedCount: number): number {
  return i < flippedCount ? 100 + i : NLEAVES - i;
}

/** The variant tabs tuck just under the open recto (the first unflipped leaf), so only their tops show. */
export function tabsZIndex(flippedCount: number): number {
  return leafZIndex(flippedCount, flippedCount) - 1;
}

/** Flips a leaf's DOM directly so the riffle animation doesn't depend on React re-renders. */
export function setLeafFlipped(leaves: LeafElements, i: number, flipped: boolean) {
  const el = leaves[i];
  if (!el) return;
  el.classList.toggle("flipped", flipped);
  el.style.zIndex = String(flipped ? 100 + i : NLEAVES - i);
}

export async function flipForward(leaves: LeafElements, from: number, to: number) {
  for (let i = from; i < to; i++) {
    setLeafFlipped(leaves, i, true);
    await delay(STAGGER);
  }
  await delay(Math.max(0, LEAF_MS - STAGGER));
}

export async function flipBackward(leaves: LeafElements, from: number, stagger = STAGGER) {
  for (let i = from - 1; i >= 0; i--) {
    setLeafFlipped(leaves, i, false);
    await delay(stagger);
  }
  await delay(Math.max(0, LEAF_MS - stagger));
}

export function startJitter(stageEl: HTMLDivElement) {
  return window.setInterval(() => {
    stageEl.style.setProperty("--jx", `${(Math.random() - 0.5) * 6}px`);
    stageEl.style.setProperty("--jy", `${(Math.random() - 0.5) * 4}px`);
    stageEl.style.setProperty("--jr", `${(Math.random() - 0.5) * 1.2}deg`);
  }, 90);
}

export function settleJitter(stageEl: HTMLDivElement, intervalId: number) {
  clearInterval(intervalId);
  stageEl.classList.add("settle");
  stageEl.style.setProperty("--jx", "0px");
  stageEl.style.setProperty("--jy", "0px");
  stageEl.style.setProperty("--jr", "0deg");
  setTimeout(() => stageEl.classList.remove("settle"), 700);
}

/** Scales the stage to the viewport; returns whether the narrow (single-page) layout applies. */
export function fitStage(stageEl: HTMLDivElement): boolean {
  const narrow = window.innerWidth < 640;
  const width = narrow ? PW : PW * 2;
  const scale = Math.min(
    1,
    (window.innerWidth - 24) / (width + 44),
    (window.innerHeight - (narrow ? 170 : 150)) / (PH + 44),
  );
  stageEl.style.setProperty("--s", String(scale));
  return narrow;
}

/**
 * What a paper leaf shows on each face. The previous spread wins so its psalm stays visible
 * underneath while the new one flips over it.
 */
export function leafFacesFor(
  i: number,
  spread: Spread | null,
  prevSpread: Spread | null,
): { front: PsalmFaceSpec | FillerFaceSpec; back: NumeralFaceSpec | FillerFaceSpec } {
  const filler: FillerFaceSpec = { kind: "filler" };
  const anchor = [prevSpread, spread].find((s) => s && (i === s.target || i === s.target - 1));
  if (!anchor) return { front: filler, back: filler };
  if (i === anchor.target) return { front: { kind: "psalm", num: anchor.num }, back: filler };
  return { front: filler, back: { kind: "numeral", num: anchor.num, reveal: anchor.reveal } };
}
