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

/** Moves the tabs' stacking order in step with a leaf turning, instead of waiting for React to catch up. */
export function setTabsZIndex(tabs: HTMLElement | null, flippedCount: number) {
  if (tabs) tabs.style.zIndex = String(tabsZIndex(flippedCount));
}

/** `onFlip` gets the number of flipped leaves right after each leaf is turned. */
export async function flipForward(leaves: LeafElements, from: number, to: number, onFlip?: (flippedCount: number) => void) {
  for (let i = from; i < to; i++) {
    setLeafFlipped(leaves, i, true);
    onFlip?.(i + 1);
    await delay(STAGGER);
  }
  await delay(Math.max(0, LEAF_MS - STAGGER));
}

export async function flipBackward(
  leaves: LeafElements,
  from: number,
  stagger = STAGGER,
  onFlip?: (flippedCount: number) => void,
) {
  for (let i = from - 1; i >= 0; i--) {
    setLeafFlipped(leaves, i, false);
    onFlip?.(i);
    await delay(stagger);
  }
  await delay(Math.max(0, LEAF_MS - stagger));
}

const NEAR_BEHIND = 3;
const NEAR_AHEAD = 5;

/**
 * Hides the leaves far from the page turn. Same-size leaves lie fully covered by their neighbours,
 * but each still holds two GPU layers and a filtered, masked paint, which stutters the flip on mobile Chrome.
 * The cover stays: its board shows around the paper leaves.
 */
export function cullLeaves(leaves: LeafElements, flippedCount: number) {
  leaves.forEach((el, i) => {
    if (!el) return;
    const near = i === 0 || (i >= flippedCount - NEAR_BEHIND && i <= flippedCount + NEAR_AHEAD);
    el.style.visibility = near ? "" : "hidden";
  });
}

/** Brings back every leaf a turn between `from` and `to` (in either direction) will pass or uncover. */
export function revealLeaves(leaves: LeafElements, from: number, to: number) {
  const low = Math.min(from, to) - NEAR_BEHIND;
  const high = Math.max(from, to) + NEAR_AHEAD;
  leaves.forEach((el, i) => {
    if (el && i >= low && i <= high) el.style.visibility = "";
  });
}

/**
 * Shakes the stage during a riffle. Uses the individual `translate`/`rotate` properties rather than custom
 * properties: a custom property set on the stage restyles every descendant on each tick.
 */
export function startJitter(stageEl: HTMLDivElement) {
  return window.setInterval(() => {
    stageEl.style.translate = `${(Math.random() - 0.5) * 6}px ${(Math.random() - 0.5) * 4}px`;
    stageEl.style.rotate = `${(Math.random() - 0.5) * 1.2}deg`;
  }, 90);
}

export function settleJitter(stageEl: HTMLDivElement, intervalId: number) {
  clearInterval(intervalId);
  stageEl.classList.add("settle");
  stageEl.style.translate = "0px 0px";
  stageEl.style.rotate = "0deg";
  setTimeout(() => stageEl.classList.remove("settle"), 700);
}

/** Touch readers are told to tap, mouse readers to click. */
export function hintCopyKey(): "tapHint" | "clickHint" {
  return window.matchMedia("(pointer: coarse)").matches ? "tapHint" : "clickHint";
}

/**
 * Scales the stage to the viewport; returns whether the single-page layout applies.
 * A phone on its side (short landscape, matching the CSS media query) parks the controls beside the
 * book instead of under it, so the reserve moves from height to width and the book keeps its size.
 */
export function fitStage(stageEl: HTMLDivElement): boolean {
  const { innerWidth: vw, innerHeight: vh } = window;
  const landscape = vh <= 500 && vw > vh;
  const single = landscape || vw < 640;
  const width = single ? PW : PW * 2;
  const reserveX = landscape ? 2 * 196 : 24;
  const reserveY = landscape ? 60 : single ? 170 : 150;
  const scale = Math.min(1, (vw - reserveX) / (width + 44), (vh - reserveY) / (PH + 44));
  stageEl.style.setProperty("--s", String(scale));
  return single;
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
