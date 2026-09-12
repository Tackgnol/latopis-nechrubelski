import { describe, expect, it } from "vitest";
import { pickFromPool, remainingPsalms } from "./psalm-pool.js";

describe("remainingPsalms", () => {
  it("excludes revealed psalms from I-VI", () => {
    expect(remainingPsalms([])).toEqual([1, 2, 3, 4, 5, 6]);
    expect(remainingPsalms([2, 4])).toEqual([1, 3, 5, 6]);
  });

  it("never includes psalm VII", () => {
    expect(remainingPsalms([1, 2, 3, 4, 5, 6, 7])).toEqual([]);
  });
});

describe("pickFromPool", () => {
  it("maps a 1-based roll onto the remaining pool", () => {
    expect(pickFromPool([1, 3, 5, 6], 1)).toBe(1);
    expect(pickFromPool([1, 3, 5, 6], 4)).toBe(6);
  });

  it("throws when the roll is out of range", () => {
    expect(() => pickFromPool([1, 3], 3)).toThrow(RangeError);
  });
});
