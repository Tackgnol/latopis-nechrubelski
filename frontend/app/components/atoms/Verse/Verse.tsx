import type { VerseProps } from "./Verse.models";
import "./Verse.styles.css";

export function Verse({ psalmNum, verseNum, text, marked, highlightOn, playing }: VerseProps) {
  return (
    <li className={marked ? `verse marked${highlightOn ? " on" : ""}` : "verse"} data-playing={playing}>
      <span className="vn">
        {psalmNum}:{verseNum}
      </span>{" "}
      <span className="vt">{text}</span>
    </li>
  );
}
