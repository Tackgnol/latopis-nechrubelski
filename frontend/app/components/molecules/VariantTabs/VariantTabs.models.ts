import type { Ref } from "react";
import type { Variant } from "~/lib/narration";

export interface VariantTabsProps {
  ref?: Ref<HTMLDivElement>;
  selected: Variant;
  zIndex: number;
  onChoose: (variant: Variant) => void;
}
