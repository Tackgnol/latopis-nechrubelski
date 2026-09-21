import type { BookTemplateProps } from "./BookTemplate.models";
import "./BookTemplate.styles.css";

export function BookTemplate({ stageRef, bookRef, closed, controls, userIndicator, audioControl, error, children }: BookTemplateProps) {
  return (
    <div className="viewport">
      <div className="stage" ref={stageRef}>
        <div className={`book${closed ? " closed" : ""}`} ref={bookRef}>
          <div className="shadow" aria-hidden="true" />
          <div className="board" aria-hidden="true" />
          <div className="spine" aria-hidden="true" />
          {children}
        </div>
      </div>

      {controls}

      {userIndicator}

      {audioControl}

      {error && (
        <p className="cover-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
