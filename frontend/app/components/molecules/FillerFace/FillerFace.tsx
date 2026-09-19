import type { FillerFaceProps } from "./FillerFace.models";
import { renderFiller } from "./FillerFace.utils";
import "./FillerFace.styles.css";

export function FillerFace({ folio, side, coverTitle }: FillerFaceProps) {
  const f = renderFiller(folio, side);

  return (
    <div className="filler" aria-hidden="true">
      <h2 className="filler-heading">{f.heading}</h2>
      <p className="filler-rubric">{f.rubric}</p>
      <div className="filler-script">
        {f.paragraphs.map((p, idx) => (
          <p className="filler-paragraph" key={idx}>
            {p}
          </p>
        ))}
      </div>
      <p className="filler-note">{f.note}</p>
      <div className="filler-blot" />
      <div className="filler-folio">
        <span>{f.folioLabel}</span>
        <span>{coverTitle}</span>
      </div>
    </div>
  );
}
