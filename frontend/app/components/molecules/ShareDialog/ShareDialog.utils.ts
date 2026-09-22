import type { Locale } from "~/content";

/** Builds the public, session-free URL for one psalm. */
export function sharedPsalmUrl(
  origin: string,
  locale: Locale,
  num: number,
): string {
  const url = new URL(`/${locale}/psalm/${num}`, origin);
  url.searchParams.set("origin", "share");
  return url.href;
}
