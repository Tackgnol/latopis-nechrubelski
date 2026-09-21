import type { Variant } from "~/lib/narration";

export interface VariantTabsProps {
  selected: Variant;
  zIndex: number;
  onChoose: (variant: Variant) => void;
}
