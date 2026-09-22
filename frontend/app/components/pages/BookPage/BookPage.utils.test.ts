import { describe, expect, it } from "vitest";
import type { Spread } from "./BookPage.models";
import { cullLeaves, leafFacesFor, leafZIndex, NLEAVES, revealLeaves, tabsZIndex, uiScale } from "./BookPage.utils";

const spread = (target: number, num: number): Spread => ({ target, num, reveal: num });

describe("leafFacesFor", () => {
  it("shows filler on both faces when no spread is active", () => {
    expect(leafFacesFor(5, null, null)).toEqual({ front: { kind: "filler" }, back: { kind: "filler" } });
  });

  it("puts the psalm on the target leaf's front and its numeral on the previous leaf's back", () => {
    const s = spread(6, 2);
    expect(leafFacesFor(6, s, null).front).toEqual({ kind: "psalm", num: 2 });
    expect(leafFacesFor(5, s, null).back).toEqual({ kind: "numeral", num: 2, reveal: 2 });
    expect(leafFacesFor(7, s, null)).toEqual({ front: { kind: "filler" }, back: { kind: "filler" } });
  });

  it("keeps the previous spread on its leaves while a new spread is set", () => {
    const prev = spread(4, 1);
    const next = spread(4, 5);
    expect(leafFacesFor(4, next, prev).front).toMatchObject({ num: 1 });
    expect(leafFacesFor(9, spread(9, 5), prev).front).toMatchObject({ num: 5 });
  });
});

describe("leafZIndex", () => {
  it("stacks unflipped leaves front-to-back and flipped leaves above them", () => {
    expect(leafZIndex(0, 0)).toBe(NLEAVES);
    expect(leafZIndex(3, 5)).toBe(103);
    expect(leafZIndex(10, 5)).toBe(NLEAVES - 10);
  });
});

describe("cullLeaves and revealLeaves", () => {
  const leaves = () => Array.from({ length: NLEAVES }, () => ({ style: { visibility: "" } }) as HTMLDivElement);
  const hidden = (ls: HTMLDivElement[]) => ls.flatMap((l, i) => (l.style.visibility === "hidden" ? [i] : []));

  it("keeps the cover and the leaves around the fold, and hides the rest", () => {
    const ls = leaves();
    cullLeaves(ls, 10);
    expect(hidden(ls)).not.toContain(0);
    expect(hidden(ls)).not.toContain(7);
    expect(hidden(ls)).not.toContain(15);
    expect(hidden(ls)).toContain(1);
    expect(hidden(ls)).toContain(16);
  });

  it("shows every leaf a turn between two folds passes or uncovers", () => {
    const ls = leaves();
    cullLeaves(ls, 2);
    revealLeaves(ls, 2, 6);
    [0, 1, 2, 3, 4, 5, 6, 7, 11].forEach((i) => expect(ls[i].style.visibility).toBe(""));
    expect(ls[20].style.visibility).toBe("hidden");
  });
});

describe("tabsZIndex", () => {
  it("sits under the open recto and above every leaf beneath it", () => {
    expect(tabsZIndex(4)).toBe(leafZIndex(4, 4) - 1);
    expect(tabsZIndex(4)).toBeGreaterThanOrEqual(leafZIndex(5, 4));
    expect(tabsZIndex(4)).toBeLessThan(leafZIndex(3, 4));
  });
});

describe("uiScale", () => {
  it("keeps the chrome at 1x up to a 1440x900 desktop and on phones", () => {
    expect(uiScale(1440, 900)).toBe(1);
    expect(uiScale(390, 844)).toBe(1);
  });

  it("grows with the tighter axis on big screens, capped at 2x", () => {
    expect(uiScale(2560, 1440)).toBeCloseTo(1.6);
    expect(uiScale(3440, 1440)).toBeCloseTo(1.6);
    expect(uiScale(3840, 2160)).toBe(2);
  });
});
