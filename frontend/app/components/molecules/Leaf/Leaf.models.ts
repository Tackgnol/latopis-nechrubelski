import type { KeyboardEvent, ReactNode, Ref } from "react";

export interface LeafProps {
  ref?: Ref<HTMLDivElement>;
  variant: "cover" | "paper";
  flipped: boolean;
  zIndex: number;
  front: ReactNode;
  back: ReactNode;
  onActivate?: () => void;
}

export type LeafKeyEvent = KeyboardEvent<HTMLDivElement>;
