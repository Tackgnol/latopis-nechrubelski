export type ArtCreditKey = "creditSkull" | "creditBlot" | "creditSplatTop" | "creditSplatBottom" | "creditSplatBackground";

export interface CreditsControlProps {
  /** Present only when analytics is on; forgets the consent choice so the banner asks again. */
  onChangeConsent?: () => void;
}

export interface ArtCredit {
  labelKey: ArtCreditKey;
  author: string;
  href: string;
}
