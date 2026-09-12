import { describe, expect, it } from "vitest";
import { findCurrentVerse, type AudioCue } from "./audio-cues";

const cues: AudioCue[] = [
  { verse: "1", start: 0 },
  { verse: "2", start: 12.5 },
  { verse: "3", start: 30 },
];

describe("findCurrentVerse", () => {
  it("returns null before the first cue", () => {
    expect(findCurrentVerse(cues, -1)).toBeNull();
  });

  it("returns the verse whose cue has started", () => {
    expect(findCurrentVerse(cues, 0)).toBe("1");
    expect(findCurrentVerse(cues, 10)).toBe("1");
    expect(findCurrentVerse(cues, 12.5)).toBe("2");
    expect(findCurrentVerse(cues, 100)).toBe("3");
  });

  it("returns null for an empty cue list", () => {
    expect(findCurrentVerse([], 5)).toBeNull();
  });
});
