export interface CampaignResetDialogProps {
  isOpen: boolean;
  isBusy: boolean;
  error: string | null;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
}
