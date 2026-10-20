import { MiseryCount } from "~/components/atoms/MiseryCount/MiseryCount";
import { toRomanNumeral } from "~/content/roman-numerals";
import type { NumeralFaceProps } from "./NumeralFace.models";
import "./NumeralFace.styles.css";

export function NumeralFace({ num, reveal }: NumeralFaceProps) {
  return (
    <div className="num-page">
      <div className="blot" aria-hidden="true" />
      <div className="numeral">{toRomanNumeral(num)}</div>
      <MiseryCount className="misery" reveal={reveal} />
    </div>
  );
}
