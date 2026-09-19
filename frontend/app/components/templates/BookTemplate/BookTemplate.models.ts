import type { ReactNode, Ref } from "react";

export interface BookTemplateProps {
  stageRef: Ref<HTMLDivElement>;
  bookRef: Ref<HTMLDivElement>;
  closed: boolean;
  controls: ReactNode;
  error: string | null;
  children: ReactNode;
}
