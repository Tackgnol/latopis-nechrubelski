import type { FillerContent } from "./FillerFace.models";

const HEADINGS = [
  "De Umbra Nechrubeli",
  "Lamentatio Popielna",
  "Capitulum Zapomnienia",
  "Glossa Krwawa",
  "Sermo Nocturnus",
  "Rubrica Milczenia",
  "Fragmentum Skazy",
  "Antiphona Pustki",
];

const RUBRICS = [
  "hic pagina delenda est",
  "łgarstwo mnicha nieznanego",
  "notatka na marginesie, ręką obcą",
  "przekreślone przez cenzora",
  "verba corrupta, sensus incertus",
];

const WORDS = [
  "nechrubel", "krypta", "popielisko", "silentium", "obscurum", "vermis", "ossa",
  "tenebrae", "smoła", "sarkash", "graven", "khryptonosz", "arkh", "lewiatan",
  "cinis", "mortis", "requiem", "pustka", "wóal", "daejmon", "anthelia",
  "yetsab", "verhu", "corvus", "malum", "spectrum", "ruina", "chaos", "morbus",
];

const NOTES = [
  "rkps. uszkodzony", "brak dalszego ciągu", "przekład wątpliwy", "por. folio poprzednie",
];

function lcg(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function pick<T>(arr: readonly T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)];
}

function sentence(rnd: () => number): string {
  const len = 5 + Math.floor(rnd() * 9);
  const words = Array.from({ length: len }, () => pick(WORDS, rnd));
  const text = words.join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1) + ".";
}

/** Deterministic gibberish flavour text for the blank leaves the book riffles through mid-flip. */
export function renderFiller(folio: number, side: "front" | "back"): FillerContent {
  const seed = folio * 2 + (side === "back" ? 1 : 0) + 1;
  const rnd = lcg(seed);
  const paragraphCount = 2 + Math.floor(rnd() * 2);
  const paragraphs = Array.from({ length: paragraphCount }, () => {
    const sentenceCount = 2 + Math.floor(rnd() * 3);
    return Array.from({ length: sentenceCount }, () => sentence(rnd)).join(" ");
  });
  return {
    heading: pick(HEADINGS, rnd),
    rubric: pick(RUBRICS, rnd),
    paragraphs,
    note: pick(NOTES, rnd),
    folioLabel: `Folio ${folio}${side === "back" ? "v" : "r"}`,
  };
}
