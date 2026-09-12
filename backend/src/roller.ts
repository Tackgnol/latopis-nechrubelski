import { SqliteRollLogStore } from "@tackgnol/rpg-tools-roller/adapters/sqlite";
import { db } from "./db.js";

export interface PsalmRevealMeta {
  psalm: number;
  /** Only set when the verse is fixed ahead of the roll (Psalm VII); otherwise the roll's own total is the verse. */
  verse?: number;
}

export interface RevealedPsalm {
  psalm: number;
  verse: number;
}

export const rollLogStore = new SqliteRollLogStore(db);
await rollLogStore.migrate();

/** The verse *is* the die's total — psalm I-VI always roll 1d6, psalm VII's roll is a fixed 1d1. */
export async function revealedPsalmVerses(rollerSessionId: string): Promise<RevealedPsalm[]> {
  const revealed = new Map<number, number>();
  for await (const entry of rollLogStore.list<PsalmRevealMeta>({
    sessionId: rollerSessionId,
    tags: ["psalm-reveal"],
  })) {
    if (entry.meta) revealed.set(entry.meta.psalm, entry.meta.verse ?? entry.total);
  }
  return [...revealed].map(([psalm, verse]) => ({ psalm, verse }));
}
