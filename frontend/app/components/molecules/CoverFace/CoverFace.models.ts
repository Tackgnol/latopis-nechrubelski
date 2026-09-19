import type { PsalmsResource } from "~/content";

export interface CoverFaceProps {
  side: "front" | "back";
  cover: PsalmsResource["cover"];
}
