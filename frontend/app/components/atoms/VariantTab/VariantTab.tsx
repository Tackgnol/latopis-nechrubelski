import { ToggleButton } from "react-aria-components";
import type { VariantTabProps } from "./VariantTab.models";
import "./VariantTab.styles.css";

/** A torn ink stub on the recto's top edge; the selected variant is the one that turns to paper. */
export function VariantTab({ variant, selected, onPress }: VariantTabProps) {
  return (
    <ToggleButton className="variant-tab" isSelected={selected} onPress={onPress}>
      {variant}
    </ToggleButton>
  );
}
