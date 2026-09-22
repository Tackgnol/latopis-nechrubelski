import { useTranslation } from "react-i18next";
import { TornButton } from "~/components/atoms/TornButton/TornButton";
import type { BookControlsProps } from "./BookControls.models";
import "./BookControls.styles.css";

export function BookControls({
  isOpen,
  canRoll,
  isBusy,
  onRoll,
  onClose,
  onReset,
  shared,
}: BookControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="controls">
      {shared && (
        <TornButton onPress={onClose} isDisabled={isBusy}>
          {t("closeBook")}
        </TornButton>
      )}
      {!shared && canRoll && (
        <TornButton onPress={onRoll} isDisabled={isBusy}>
          {isOpen ? t("rollAgain") : t("openBook")}
        </TornButton>
      )}
      {!shared && isOpen && (
        <TornButton quiet onPress={onClose} isDisabled={isBusy}>
          {t("closeBook")}
        </TornButton>
      )}
      {!shared && !isOpen && (
        <TornButton quiet onPress={onReset} isDisabled={isBusy}>
          {t("reset")}
        </TornButton>
      )}
    </div>
  );
}
