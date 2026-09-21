import { useId } from "react";
import { useTranslation } from "react-i18next";
import { VariantTab } from "~/components/atoms/VariantTab/VariantTab";
import { VARIANTS } from "~/lib/narration";
import type { VariantTabsProps } from "./VariantTabs.models";
import "./VariantTabs.styles.css";

export function VariantTabs({ ref, selected, zIndex, onChoose }: VariantTabsProps) {
  const { t } = useTranslation();
  const labelId = useId();

  return (
    <div ref={ref} className="variant-tabs" role="group" aria-labelledby={labelId} style={{ zIndex }}>
      <span id={labelId} className="variant-tabs-label">
        {t("variants")}
      </span>
      {VARIANTS.map((v) => (
        <VariantTab key={v} variant={v} selected={v === selected} onPress={() => onChoose(v)} />
      ))}
    </div>
  );
}
