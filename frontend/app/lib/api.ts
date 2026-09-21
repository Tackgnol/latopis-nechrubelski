import { z } from "zod";

export const rollResultSchema = z.object({ psalm: z.number(), verse: z.number(), reveal: z.number() });
export type RollResult = z.infer<typeof rollResultSchema>;

const currentUserSchema = z.object({
  authenticated: z.boolean(),
  user: z.object({ login: z.string(), isAnonymous: z.boolean() }).nullable(),
});
export type CurrentUser = z.infer<typeof currentUserSchema>;

const csrfSchema = z.object({ token: z.string() });
const resetSchema = z.object({ monitorToken: z.string() });
const readingSessionSchema = z.object({ revealed: z.array(z.object({ psalm: z.number() })) });

async function readJson(res: Response): Promise<unknown> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export async function csrfToken(): Promise<string> {
  return csrfSchema.parse(await readJson(await fetch("/api/csrf-token"))).token;
}

async function apiPost<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const token = await csrfToken();
  return schema.parse(await readJson(await fetch(path, { method: "POST", headers: { "csrf-token": token } })));
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  return currentUserSchema.parse(await readJson(await fetch("/api/me")));
}

/** Rolls the next psalm, falling back to the fixed final reveal once all of I-VI are out. */
export async function rollPsalm(): Promise<RollResult> {
  try {
    return await apiPost("/api/sessions/roll", rollResultSchema);
  } catch (err) {
    if (!(err instanceof Error) || err.message !== "all-revealed") throw err;
    return apiPost("/api/sessions/reveal-end", rollResultSchema);
  }
}

/** Psalms already revealed in this reader's session; empty before the first roll. */
export async function fetchRevealedPsalms(): Promise<number[]> {
  const { revealed } = readingSessionSchema.parse(await readJson(await fetch("/api/sessions/me")));
  return revealed.map((r) => r.psalm);
}

export async function resetSession(): Promise<void> {
  await apiPost("/api/sessions/reset", resetSchema);
}
