import { Button } from "react-aria-components";
import type { ReadAloudButtonProps } from "./ReadAloudButton.models";
import "./ReadAloudButton.styles.css";

export function ReadAloudButton({ playing, label, onPress }: ReadAloudButtonProps) {
  return (
    <Button className="read-aloud" data-playing={playing} onPress={onPress}>
      <svg className="read-aloud-tear" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 8 L13 1 L28 6 L47 0 L63 5 L82 0 L100 6 L98 38 L100 66 L99 96 L84 100 L62 96 L41 100 L19 95 L5 100 L1 88 L0 56 Z" />
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
