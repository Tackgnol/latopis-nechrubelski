import type { VerseProps } from "./Verse.models";
import "./Verse.styles.css";

export function Verse({ psalmNum, verseNum, text, playing }: VerseProps) {
  return (
    <li className="verse" data-playing={playing}>
      <span className="vn">
        {psalmNum}:{verseNum}
      </span>{" "}
      <span className="vt">{text}</span>
    </li>
  );
}
