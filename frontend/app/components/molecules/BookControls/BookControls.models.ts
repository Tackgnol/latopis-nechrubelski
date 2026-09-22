export interface BookControlsProps {
  isOpen: boolean;
  canRoll: boolean;
  isBusy: boolean;
  onRoll: () => void;
  onClose: () => void;
  onReset: () => void;
  shared: boolean;
}
