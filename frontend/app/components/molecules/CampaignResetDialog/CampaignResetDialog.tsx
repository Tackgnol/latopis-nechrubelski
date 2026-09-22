import { useTranslation } from "react-i18next";
import { PaperDialog } from "~/components/atoms/PaperDialog/PaperDialog";
import { TornButton } from "~/components/atoms/TornButton/TornButton";
import type { CampaignResetDialogProps } from "./CampaignResetDialog.models";
import "./CampaignResetDialog.styles.css";

export function CampaignResetDialog({
  isOpen,
  isBusy,
  error,
  onOpenChange,
  onConfirm,
}: CampaignResetDialogProps) {
  const { t } = useTranslation();

  return (
    <PaperDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t("resetTitle")}
      intro={t("resetConfirm")}
      closeLabel={t("cancel")}
    >
      <div className="campaign-reset-actions">
        <TornButton onPress={onConfirm} isDisabled={isBusy}>
          {isBusy ? t("resetting") : t("resetAction")}
        </TornButton>
      </div>
      {error && (
        <p className="campaign-reset-error" role="alert">
          {error}
        </p>
      )}
    </PaperDialog>
  );
}
