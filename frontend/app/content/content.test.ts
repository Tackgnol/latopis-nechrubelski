import { describe, expect, it } from "vitest";
import { psalmsByLocale } from "./index";
import { toRomanNumeral } from "./roman-numerals";

describe("toRomanNumeral", () => {
  it("maps 1-7 to I-VII", () => {
    expect(toRomanNumeral(1)).toBe("I");
    expect(toRomanNumeral(4)).toBe("IV");
    expect(toRomanNumeral(7)).toBe("VII");
  });

  it("throws outside 1-7", () => {
    expect(() => toRomanNumeral(0)).toThrow();
    expect(() => toRomanNumeral(8)).toThrow();
  });
});

describe("psalms.pl content shape", () => {
  const { psalms } = psalmsByLocale.pl;

  it("psalms I-VI each have verses 1-6", () => {
    for (const num of [1, 2, 3, 4, 5, 6]) {
      expect(Object.keys(psalms[num].verses).sort()).toEqual(["1", "2", "3", "4", "5", "6"]);
    }
  });

  it("psalm VII has only verse 7, matching its `7:7` numbering", () => {
    expect(Object.keys(psalms[7].verses)).toEqual(["7"]);
  });
});
