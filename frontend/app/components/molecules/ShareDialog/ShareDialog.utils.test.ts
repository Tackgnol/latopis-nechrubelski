import { describe, expect, it } from "vitest";
import { sharedPsalmUrl } from "./ShareDialog.utils";

describe("sharedPsalmUrl", () => {
  it("keeps the psalm but carries no campaign reveal", () => {
    expect(sharedPsalmUrl("https://latopis.example", "pl", 4)).toBe(
      "https://latopis.example/pl/psalm/4?origin=share",
    );
  });
});
