import type { LeafKeyEvent, LeafProps } from "./Leaf.models";
import "./Leaf.styles.css";

export function Leaf({ ref, variant, flipped, zIndex, front, back, onActivate }: LeafProps) {
  function handleKeyDown(e: LeafKeyEvent) {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    onActivate?.();
  }

  return (
    <div
      ref={ref}
      className={`leaf ${variant}${flipped ? " flipped" : ""}`}
      style={{ zIndex }}
      onClick={onActivate}
      onKeyDown={onActivate ? handleKeyDown : undefined}
      role={onActivate ? "button" : undefined}
      tabIndex={onActivate ? 0 : undefined}
    >
      <div className="face front">{front}</div>
      <div className="face back">{back}</div>
    </div>
  );
}
