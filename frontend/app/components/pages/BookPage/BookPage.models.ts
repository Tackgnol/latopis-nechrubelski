import type { Locale } from "~/content";
import type { PsalmSelection } from "~/components/models";

export interface BookPageProps {
  locale: Locale;
  current: PsalmSelection | null;
}

export interface Spread extends PsalmSelection {
  target: number;
}
