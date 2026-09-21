import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/outline";
import type { IconName, IconProps } from "./Icon.models";
import "./Icon.styles.css";

const ICONS: Record<IconName, typeof SpeakerWaveIcon> = {
  speaker: SpeakerWaveIcon,
  "speaker-muted": SpeakerXMarkIcon,
};

/** The app's one icon set (HeroIcons outline) lives behind this atom, so swapping it is a one-file change. */
export function Icon({ name }: IconProps) {
  const Svg = ICONS[name];
  return <Svg className="icon" aria-hidden="true" />;
}
