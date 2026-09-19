const MIN_FONT_PX = 5.5;
const MAX_FONT_PX = 14.5;
const FIT_ITERATIONS = 9;

/** Binary-searches the largest font size at which `verses` fits its box without overflowing. */
export function fitFontSize(verses: HTMLElement): void {
  const overflows = () => verses.scrollHeight > verses.clientHeight + 1;

  verses.style.fontSize = `${MAX_FONT_PX}px`;
  if (!overflows()) return;

  let low = MIN_FONT_PX;
  let high = MAX_FONT_PX;
  for (let i = 0; i < FIT_ITERATIONS; i++) {
    const size = (low + high) / 2;
    verses.style.fontSize = `${size}px`;
    if (overflows()) high = size;
    else low = size;
  }
  verses.style.fontSize = `${low}px`;
}
