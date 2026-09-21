import { describe, expect, it } from "vitest";
import { createNarrator, previewTrack, psalmTracks, warmSources, type Narration, type Sound, type SoundEvent, type Track } from "./narration";

class FakeSound implements Sound {
  plays = 0;
  stops = 0;
  unloaded = false;
  private handlers = new Map<SoundEvent, (() => void)[]>();

  constructor(readonly src: string) {}

  play() {
    this.plays++;
  }
  stop() {
    this.stops++;
  }
  unload() {
    this.unloaded = true;
  }
  once(event: SoundEvent, fn: () => void) {
    this.handlers.set(event, [...(this.handlers.get(event) ?? []), fn]);
  }
  emit(event: SoundEvent) {
    const fns = this.handlers.get(event) ?? [];
    this.handlers.delete(event);
    fns.forEach((fn) => fn());
  }
}

function setup() {
  const sounds: FakeSound[] = [];
  const states: Narration[] = [];
  const narrator = createNarrator(
    (src) => {
      const s = new FakeSound(src);
      sounds.push(s);
      return s;
    },
    (state) => states.push(state),
  );
  const latest = (src: string) => sounds.filter((s) => s.src === src).at(-1)!;
  return { narrator, sounds, states, latest, last: () => states.at(-1) };
}

const psalm2: Track[] = ["1", "2", "3"].map((verse) => ({ src: `/audio/A/2-${verse}.m4a`, psalm: 2, verse }));

describe("createNarrator", () => {
  it("reads the verses in order and falls silent after the last", () => {
    const { narrator, latest, last } = setup();
    narrator.play("narration", psalm2);

    expect(last()).toEqual({ mode: "narration", psalm: 2, verse: null });
    latest("/audio/A/2-1.m4a").emit("play");
    expect(last()).toEqual({ mode: "narration", psalm: 2, verse: "1" });

    latest("/audio/A/2-1.m4a").emit("end");
    expect(latest("/audio/A/2-2.m4a").plays).toBe(1);
    latest("/audio/A/2-2.m4a").emit("play");
    expect(last()).toEqual({ mode: "narration", psalm: 2, verse: "2" });

    latest("/audio/A/2-2.m4a").emit("end");
    latest("/audio/A/2-3.m4a").emit("play");
    latest("/audio/A/2-3.m4a").emit("end");
    expect(last()).toBeNull();
  });

  it("stops the narration when a preview starts, and ignores the old voice's events", () => {
    const { narrator, latest, last } = setup();
    narrator.play("narration", psalm2);
    const verse1 = latest("/audio/A/2-1.m4a");
    verse1.emit("play");

    narrator.play("preview", [{ src: "/audio/C/5-4.m4a", psalm: 5, verse: "4" }]);
    expect(verse1.stops).toBe(1);
    expect(last()).toEqual({ mode: "preview", psalm: 5, verse: null });

    verse1.emit("end");
    expect(latest("/audio/A/2-2.m4a")?.plays ?? 0).toBe(0);
    expect(last()).toEqual({ mode: "preview", psalm: 5, verse: null });
  });

  it("skips a verse whose file is missing and reads on", () => {
    const { narrator, latest, last } = setup();
    narrator.play("narration", psalm2);
    latest("/audio/A/2-1.m4a").emit("loaderror");

    latest("/audio/A/2-2.m4a").emit("play");
    expect(last()).toEqual({ mode: "narration", psalm: 2, verse: "2" });
  });

  it("falls silent when the browser refuses to play", () => {
    const { narrator, latest, last } = setup();
    narrator.play("narration", psalm2);
    latest("/audio/A/2-1.m4a").emit("playerror");

    expect(last()).toBeNull();
    expect(latest("/audio/A/2-2.m4a")?.plays ?? 0).toBe(0);
  });

  it("fetches the next verse while one plays, and lets go of a verse once it has been read", () => {
    const { narrator, sounds, latest } = setup();
    narrator.play("narration", psalm2);
    expect(sounds.map((s) => s.src)).toEqual(["/audio/A/2-1.m4a", "/audio/A/2-2.m4a"]);

    const verse1 = latest("/audio/A/2-1.m4a");
    verse1.emit("play");
    verse1.emit("end");
    expect(verse1.unloaded).toBe(true);
    expect(sounds.filter((s) => s.src === "/audio/A/2-2.m4a")).toHaveLength(1);
    expect(latest("/audio/A/2-2.m4a").plays).toBe(1);
  });

  it("plays a warmed verse from the one already loaded, and warms each file once", () => {
    const { narrator, sounds } = setup();
    narrator.warm(["/audio/A/2-1.m4a", "/audio/A/3-1.m4a"]);
    narrator.warm(["/audio/A/2-1.m4a"]);
    narrator.play("narration", psalm2);

    expect(sounds.filter((s) => s.src === "/audio/A/2-1.m4a")).toHaveLength(1);
    expect(sounds[0].plays).toBe(1);
  });

  it("fetches a file again after it failed to load", () => {
    const { narrator, sounds, latest } = setup();
    narrator.warm(["/audio/A/2-1.m4a"]);
    latest("/audio/A/2-1.m4a").emit("loaderror");
    narrator.play("narration", psalm2);

    expect(sounds.filter((s) => s.src === "/audio/A/2-1.m4a")).toHaveLength(2);
    expect(latest("/audio/A/2-1.m4a").plays).toBe(1);
  });

  it("lets go of the verse it was reading and the one fetched ahead when stopped", () => {
    const { narrator, latest } = setup();
    narrator.play("narration", psalm2);
    narrator.stop();

    expect(latest("/audio/A/2-1.m4a").unloaded).toBe(true);
    expect(latest("/audio/A/2-2.m4a").unloaded).toBe(true);
  });

  it("lets go of warmed files the new warm-up no longer wants, but not one being read", () => {
    const { narrator, latest } = setup();
    narrator.warm(["/audio/A/2-1.m4a", "/audio/A/3-1.m4a"]);
    narrator.play("narration", psalm2);
    narrator.warm(["/audio/C/3-1.m4a"]);

    expect(latest("/audio/A/3-1.m4a").unloaded).toBe(true);
    expect(latest("/audio/A/2-1.m4a").unloaded).toBe(false);
  });

  it("falls silent on stop", () => {
    const { narrator, latest, last } = setup();
    narrator.play("narration", psalm2);
    latest("/audio/A/2-1.m4a").emit("play");

    narrator.stop();
    expect(latest("/audio/A/2-1.m4a").stops).toBe(1);
    expect(last()).toBeNull();
  });
});

describe("psalmTracks", () => {
  it("reads a psalm's verses in verse order from the chosen variant", () => {
    expect(psalmTracks("B", 7, { "7": "…" })).toEqual([{ src: "/audio/B/7-7.m4a", psalm: 7, verse: "7" }]);
    expect(psalmTracks("A", 3, { "1": "…", "2": "…" }).map((t) => t.src)).toEqual([
      "/audio/A/3-1.m4a",
      "/audio/A/3-2.m4a",
    ]);
  });
});

describe("warmSources", () => {
  it("warms verse 1 of every psalm not yet revealed", () => {
    expect(warmSources("D", [2, 5])).toEqual([
      "/audio/D/1-1.m4a",
      "/audio/D/3-1.m4a",
      "/audio/D/4-1.m4a",
      "/audio/D/6-1.m4a",
    ]);
  });

  it("warms the finale only once all six are revealed", () => {
    expect(warmSources("A", [1, 2, 3, 4, 5, 6])).toEqual(["/audio/A/7-7.m4a"]);
    expect(warmSources("A", [1, 2, 3, 4, 5, 6, 7])).toEqual([]);
  });
});

describe("previewTrack", () => {
  it("picks any verse of psalms I-VI, never the finale", () => {
    expect(previewTrack("C", () => 0)).toEqual({ src: "/audio/C/1-1.m4a", psalm: 1, verse: "1" });
    expect(previewTrack("C", () => 0.999)).toEqual({ src: "/audio/C/6-6.m4a", psalm: 6, verse: "6" });
    expect(previewTrack("C", () => 0.5)).toEqual({ src: "/audio/C/4-1.m4a", psalm: 4, verse: "1" });
  });
});
