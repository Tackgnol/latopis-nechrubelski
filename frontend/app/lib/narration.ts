export const VARIANTS = ["A", "B", "C", "D"] as const;
export type Variant = (typeof VARIANTS)[number];

export function parseVariant(raw: string | null): Variant {
  return VARIANTS.find((v) => v === raw) ?? "A";
}

/** A stored volume in 0..1; full volume when unset or unreadable. */
export function parseVolume(raw: string | null): number {
  const n = raw === null ? NaN : Number(raw);
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 1;
}

const RANDOM_PSALMS = [1, 2, 3, 4, 5, 6];
const VERSES_PER_PSALM = 6;
export const FINALE_PSALM = 7;
const FINALE_VERSE = "7";

function audioSrc(variant: Variant, psalm: number, verse: string): string {
  return `/audio/${variant}/${psalm}-${verse}.m4a`;
}

function track(variant: Variant, psalm: number, verse: string): Track {
  return { src: audioSrc(variant, psalm, verse), psalm, verse };
}

/** A psalm's narration: one track per verse, in verse order. */
export function psalmTracks(variant: Variant, psalm: number, verses: Record<string, string>): Track[] {
  return Object.keys(verses).map((verse) => track(variant, psalm, verse));
}

/** Verse 1 of every unrevealed psalm I-VI, or the finale once all six are out, so the next roll speaks at once. */
export function warmSources(variant: Variant, revealed: readonly number[]): string[] {
  const unrevealed = RANDOM_PSALMS.filter((p) => !revealed.includes(p));
  if (unrevealed.length > 0) return unrevealed.map((p) => audioSrc(variant, p, "1"));
  return revealed.includes(FINALE_PSALM) ? [] : [audioSrc(variant, FINALE_PSALM, FINALE_VERSE)];
}

/** A random verse of psalms I-VI to demonstrate a variant's intonation; never the finale. */
export function previewTrack(variant: Variant, random: () => number = Math.random): Track {
  const n = Math.floor(random() * RANDOM_PSALMS.length * VERSES_PER_PSALM);
  return track(variant, RANDOM_PSALMS[Math.floor(n / VERSES_PER_PSALM)], String((n % VERSES_PER_PSALM) + 1));
}

export type SoundEvent = "play" | "end" | "loaderror" | "playerror";

/** The slice of a Howl the narrator drives; tests swap in a fake. */
export interface Sound {
  play(): void;
  stop(): void;
  unload(): void;
  once(event: SoundEvent, fn: () => void): void;
}

export interface Track {
  src: string;
  psalm: number;
  verse: string;
}

export type NarrationMode = "narration" | "preview";

/** What is sounding: `verse` is null until the voice actually starts. Null when silent. */
export type Narration = { mode: NarrationMode; psalm: number; verse: string | null } | null;

/** One voice at a time: plays a queue of tracks in order and reports the verse being read. */
export function createNarrator(createSound: (src: string) => Sound, onChange: (state: Narration) => void) {
  let run = 0;
  // The verse being read and the one fetched ahead of it: both are freed when the voice stops.
  let reading: string[] = [];
  let warmed = new Set<string>();
  const loaded = new Map<string, Sound>();

  function load(src: string): Sound {
    const cached = loaded.get(src);
    if (cached) return cached;
    const sound = createSound(src);
    loaded.set(src, sound);
    sound.once("loaderror", () => release(src, sound));
    return sound;
  }

  function release(src: string, sound: Sound | undefined = loaded.get(src)) {
    if (!sound) return;
    if (loaded.get(src) === sound) loaded.delete(src);
    sound.unload();
  }

  function silence() {
    run++;
    loaded.get(reading[0])?.stop();
    reading.forEach((src) => release(src));
    reading = [];
  }

  function stop() {
    silence();
    onChange(null);
  }

  function play(mode: NarrationMode, tracks: readonly Track[]) {
    silence();
    const id = run;
    onChange({ mode, psalm: tracks[0].psalm, verse: null });

    const step = (i: number) => {
      if (id !== run) return;
      const track = tracks[i];
      if (!track) {
        reading = [];
        onChange(null);
        return;
      }
      const sound = load(track.src);
      const next = tracks[i + 1];
      if (next) load(next.src);
      reading = next ? [track.src, next.src] : [track.src];
      sound.once("play", () => {
        if (id === run) onChange({ mode, psalm: track.psalm, verse: track.verse });
      });
      sound.once("end", () => {
        if (id !== run) return;
        release(track.src, sound);
        step(i + 1);
      });
      sound.once("loaderror", () => {
        if (id === run) step(i + 1);
      });
      sound.once("playerror", () => {
        if (id === run) stop();
      });
      sound.play();
    };
    step(0);
  }

  /** Loads files ahead of need, and frees earlier warm-ups this list drops unless they are being read. */
  function warm(srcs: readonly string[]) {
    const keep = new Set([...srcs, ...reading]);
    warmed.forEach((src) => {
      if (!keep.has(src)) release(src);
    });
    warmed = new Set(srcs);
    srcs.forEach(load);
  }

  /** Stops and frees every loaded file. */
  function dispose() {
    stop();
    loaded.forEach((sound) => sound.unload());
    loaded.clear();
  }

  return { play, stop, warm, dispose };
}
