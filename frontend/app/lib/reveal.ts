/** Resolves a draw ordinal from the live URL, falling back to the psalm for static reading links. */
export function revealNumber(psalm: number, search: string): number {
  const reveal = Number(new URLSearchParams(search).get("r"));
  return Number.isInteger(reveal) && reveal >= 1 && reveal <= 7 ? reveal : psalm;
}
