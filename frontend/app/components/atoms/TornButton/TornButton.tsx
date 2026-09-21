import { Button } from "react-aria-components";
import { TEAR_PATH } from "../atoms.utils";
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
          <path d={TEAR_PATH} />
        </svg>
      )}
      <span className="label">{children}</span>
    </Button>
  );
}
