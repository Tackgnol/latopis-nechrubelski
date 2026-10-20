import { useTranslation } from "react-i18next";
import type { MiseryCountProps } from "./MiseryCount.models";
import "./MiseryCount.styles.css";

export function MiseryCount({ reveal, className = "" }: MiseryCountProps) {
  const { t } = useTranslation();

  return (
    <p className={`misery-count ${className}`}>
      {t("misery")} <b>{reveal}:7</b>
    </p>
  );
}
