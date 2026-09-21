import type { Locale } from "~/content";
import type { PsalmSelection } from "~/components/models";

export interface BookPageProps {
  locale: Locale;
  current: PsalmSelection | null;
}

export interface Spread extends PsalmSelection {
  target: number;
}

/** Browser audio hints not yet in TypeScript's DOM lib. */
export type AudioNavigator = Navigator & {
  audioSession?: { type: string };
  connection?: { saveData?: boolean };
};
