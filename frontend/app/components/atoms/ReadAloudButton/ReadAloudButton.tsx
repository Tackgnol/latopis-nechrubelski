import { Button } from "react-aria-components";
import { TEAR_PATH } from "../atoms.utils";
import type { ReadAloudButtonProps } from "./ReadAloudButton.models";
import "./ReadAloudButton.styles.css";

export function ReadAloudButton({ playing, label, onPress }: ReadAloudButtonProps) {
  return (
    <Button className="read-aloud" data-playing={playing} onPress={onPress}>
      <svg className="read-aloud-tear" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d={TEAR_PATH} />
      </svg>
      <span className="read-aloud-label">
        <svg className="read-aloud-mark" viewBox="0 0 12 12" aria-hidden="true">
          <path d={playing ? "M1.4 1.1 L10.6 1.9 L10.1 10.8 L1.1 10.2 Z" : "M2.1 0.9 L11.2 6.2 L2.4 11.1 L1.8 6.1 Z"} />
        </svg>
        {label}
      </span>
    </Button>
  );
}
