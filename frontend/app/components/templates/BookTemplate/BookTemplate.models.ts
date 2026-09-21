import type { ReactNode, Ref } from "react";

export interface BookTemplateProps {
  stageRef: Ref<HTMLDivElement>;
  bookRef: Ref<HTMLDivElement>;
  closed: boolean;
  controls: ReactNode;
  userIndicator?: ReactNode;
  audioControl?: ReactNode;
  creditsControl?: ReactNode;
  error: string | null;
  /** Lies on the open recto, above the leaves. */
  hint?: ReactNode;
  children: ReactNode;
}
