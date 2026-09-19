import type { CoverFaceProps } from "./CoverFace.models";
import "./CoverFace.styles.css";

export function CoverFace({ side, cover }: CoverFaceProps) {
  if (side === "back") {
    return (
      <div className="cover-back">
        <div className="cover-mark" aria-hidden="true" />
      </div>
    );
  }
  return (
    <div className="cover-front">
      <h1 className="cover-title">{cover.title}</h1>
      <p className="cover-sub">{cover.subtitle}</p>
      <div className="cover-skull" aria-hidden="true" />
      <p className="cover-by">{cover.author}</p>
    </div>
  );
}
