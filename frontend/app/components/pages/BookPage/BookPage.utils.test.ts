import { describe, expect, it } from "vitest";
import type { Spread } from "./BookPage.models";
import { leafFacesFor, leafZIndex, NLEAVES, tabsZIndex } from "./BookPage.utils";

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

describe("tabsZIndex", () => {
  it("sits under the open recto and above every leaf beneath it", () => {
    expect(tabsZIndex(4)).toBe(leafZIndex(4, 4) - 1);
    expect(tabsZIndex(4)).toBeGreaterThanOrEqual(leafZIndex(5, 4));
    expect(tabsZIndex(4)).toBeLessThan(leafZIndex(3, 4));
  });
});
