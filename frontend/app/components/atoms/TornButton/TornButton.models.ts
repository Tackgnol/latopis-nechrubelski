import type { ReactNode } from "react";

export interface TornButtonProps {
  children: ReactNode;
  quiet?: boolean;
  onPress?: () => void;
  isDisabled?: boolean;
}
