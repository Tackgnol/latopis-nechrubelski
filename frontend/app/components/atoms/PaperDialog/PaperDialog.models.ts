import type { ReactNode } from "react";

export interface PaperDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  intro: string;
  closeLabel: string;
  children: ReactNode;
}
