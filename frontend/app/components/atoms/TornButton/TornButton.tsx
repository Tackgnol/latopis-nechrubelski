import { Button } from "react-aria-components";
import type { TornButtonProps } from "./TornButton.models";
import "./TornButton.styles.css";

export function TornButton({ children, quiet, onPress, isDisabled, ariaLabel }: TornButtonProps) {
  return (
    <Button className={quiet ? "btn quiet" : "btn"} onPress={onPress} isDisabled={isDisabled} aria-label={ariaLabel}>
      <span className="flood" aria-hidden="true">
        <span className="label">{children}</span>
      </span>
      {quiet && (
        <svg className="tearline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 8 L13 1 L28 6 L47 0 L63 5 L82 0 L100 6 L98 38 L100 66 L99 96 L84 100 L62 96 L41 100 L19 95 L5 100 L1 88 L0 56 Z" />
        </svg>
      )}
      <span className="label">{children}</span>
    </Button>
  );
}
