export type ArtCreditKey = "creditSkull" | "creditBlot" | "creditSplatTop" | "creditSplatBottom" | "creditSplatBackground";

export interface ArtCredit {
  labelKey: ArtCreditKey;
  author: string;
  href: string;
}
