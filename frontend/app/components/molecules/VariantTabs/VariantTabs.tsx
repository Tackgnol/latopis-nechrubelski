import { useTranslation } from "react-i18next";
import { VariantTab } from "~/components/atoms/VariantTab/VariantTab";
import { VARIANTS } from "~/lib/narration";
import type { VariantTabsProps } from "./VariantTabs.models";
import "./VariantTabs.styles.css";

export function VariantTabs({ selected, zIndex, onChoose }: VariantTabsProps) {
  const { t } = useTranslation();

  return (
    <div className="variant-tabs" role="group" aria-label={t("voice")} style={{ zIndex }}>
      {VARIANTS.map((v) => (
        <VariantTab key={v} variant={v} selected={v === selected} onPress={() => onChoose(v)} />
      ))}
    </div>
  );
}
