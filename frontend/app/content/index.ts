import { pl, type PsalmsResource } from "./psalms.pl";

export type { Psalm, PsalmsResource } from "./psalms.pl";

export const SUPPORTED_LOCALES = ["pl"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const psalmsByLocale: Record<Locale, PsalmsResource> = { pl };

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
