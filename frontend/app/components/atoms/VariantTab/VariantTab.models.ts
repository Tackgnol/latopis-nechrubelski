import type { Variant } from "~/lib/narration";

export interface VariantTabProps {
  variant: Variant;
  selected: boolean;
  onPress: () => void;
}
