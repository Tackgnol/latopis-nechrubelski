export const REVEALABLE_PSALMS = [1, 2, 3, 4, 5, 6] as const;
export const FINAL_PSALM = 7;

export function remainingPsalms(revealed: readonly number[]): number[] {
  const revealedSet = new Set(revealed);
  return REVEALABLE_PSALMS.filter((n) => !revealedSet.has(n));
}

/** Maps a 1-based die roll (1..remaining.length) onto the remaining pool. */
export function pickFromPool(remaining: readonly number[], roll: number): number {
  const psalm = remaining[roll - 1];
  if (psalm === undefined) throw new RangeError(`roll ${roll} out of range for pool size ${remaining.length}`);
  return psalm;
}
