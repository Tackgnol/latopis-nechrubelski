const MIN_FONT_PX = 5.5;
const MAX_FONT_PX = 14.5;
const FIT_ITERATIONS = 9;

/**
 * Binary-searches the largest font size at which `verses` fits its box without overflowing.
 * The page renders inside a stage scaled by `--s` (inherited), so the cap grows as the stage shrinks:
 * on a phone the verses stay as large on screen as on desktop whenever the page has room.
 */
export function fitFontSize(verses: HTMLElement): void {
  const overflows = () => verses.scrollHeight > verses.clientHeight + 1;
  const stageScale = parseFloat(getComputedStyle(verses).getPropertyValue("--s")) || 1;
  const max = MAX_FONT_PX / Math.min(1, stageScale);

  verses.style.fontSize = `${max}px`;
  if (!overflows()) return;

  let low = MIN_FONT_PX;
  let high = max;
  for (let i = 0; i < FIT_ITERATIONS; i++) {
    const size = (low + high) / 2;
    verses.style.fontSize = `${size}px`;
    if (overflows()) high = size;
    else low = size;
  }
  verses.style.fontSize = `${low}px`;
}
