import { describe, expect, it } from "vitest";
import { revealNumber } from "./reveal";

describe("revealNumber", () => {
  it("uses the URL ordinal instead of the prerendered psalm number", () => {
    expect(revealNumber(5, "?r=1")).toBe(1);
    expect(revealNumber(2, "?r=6")).toBe(6);
    expect(revealNumber(7, "?r=7")).toBe(7);
  });

  it.each(["", "?origin=share", "?r=", "?r=0", "?r=8", "?r=1.5", "?r=text", "?r=Infinity"])(
    "keeps static-reading behavior for missing or invalid ordinals (%s)",
    (search) => expect(revealNumber(5, search)).toBe(5),
  );
});
