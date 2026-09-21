import type { KeyboardEvent, MouseEvent, ReactNode, Ref } from "react";

export interface LeafProps {
  ref?: Ref<HTMLDivElement>;
  variant: "cover" | "paper";
  flipped: boolean;
  zIndex: number;
  front: ReactNode;
  back: ReactNode;
  /** Keyboard-accessible activation: the leaf becomes a button (the closed cover). */
  onActivate?: () => void;
  /** Pointer gestures on an open page; taps on the page's own buttons are not counted. */
  onTap?: () => void;
  onDoubleTap?: () => void;
}

export type LeafKeyEvent = KeyboardEvent<HTMLDivElement>;
export type LeafPointerEvent = MouseEvent<HTMLDivElement>;
