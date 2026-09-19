import { useTranslation } from "react-i18next";
import { toRomanNumeral } from "~/content/roman-numerals";
import type { NumeralFaceProps } from "./NumeralFace.models";
import "./NumeralFace.styles.css";

export function NumeralFace({ num, reveal }: NumeralFaceProps) {
  const { t } = useTranslation();

  return (
    <div className="num-page">
      <div className="blot" aria-hidden="true" />
      <div className="numeral">{toRomanNumeral(num)}</div>
      <p className="misery">
        {t("misery")} <b>{reveal}:7</b>
      </p>
    </div>
  );
}
