import type { ReactNode } from "react";
import { Button } from "react-aria-components";

export function TornButton({
  children,
  quiet,
  onPress,
  isDisabled,
}: {
  children: ReactNode;
  quiet?: boolean;
  onPress?: () => void;
  isDisabled?: boolean;
}) {
  return (
    <Button className={quiet ? "btn quiet" : "btn"} onPress={onPress} isDisabled={isDisabled}>
      <span className="flood" aria-hidden="true">
        <span className="label">{children}</span>
      </span>
      <span className="label">{children}</span>
    </Button>
  );
}
