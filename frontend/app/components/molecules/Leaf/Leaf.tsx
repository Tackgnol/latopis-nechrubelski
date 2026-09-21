import type { LeafKeyEvent, LeafPointerEvent, LeafProps } from "./Leaf.models";
import "./Leaf.styles.css";

export function Leaf({ ref, variant, flipped, zIndex, front, back, onActivate, onTap, onDoubleTap }: LeafProps) {
  function handleKeyDown(e: LeafKeyEvent) {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    onActivate?.();
  }

  /** The page's own buttons (read aloud) keep their taps. */
  function onPaper(e: LeafPointerEvent) {
    return !(e.target as Element).closest("button");
  }

  function handleClick(e: LeafPointerEvent) {
    if (!onPaper(e)) return;
    onActivate?.();
    onTap?.();
  }

  function handleDoubleClick(e: LeafPointerEvent) {
    if (onPaper(e)) onDoubleTap?.();
  }

  return (
    <div
      ref={ref}
      className={`leaf ${variant}${flipped ? " flipped" : ""}`}
      style={{ zIndex }}
      onClick={onActivate || onTap ? handleClick : undefined}
      onDoubleClick={onDoubleTap ? handleDoubleClick : undefined}
      onKeyDown={onActivate ? handleKeyDown : undefined}
      role={onActivate ? "button" : undefined}
      tabIndex={onActivate ? 0 : undefined}
    >
      <div className="face front">{front}</div>
      <div className="face back">{back}</div>
    </div>
  );
}
