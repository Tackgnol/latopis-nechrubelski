import type { TapHintProps } from "./TapHint.models";
import "./TapHint.styles.css";

/** A torn ink note over the open recto; mounted only while it shows, so it announces itself. */
export function TapHint({ text }: TapHintProps) {
  return (
    <p className="tap-hint" role="status">
      {text}
    </p>
  );
}
