import { Label, Slider, SliderThumb, SliderTrack } from "react-aria-components";
import type { VolumeSliderProps } from "./VolumeSlider.models";
import "./VolumeSlider.styles.css";

export function VolumeSlider({ label, value, onChange }: VolumeSliderProps) {
  return (
    <Slider className="volume-slider" minValue={0} maxValue={1} step={0.05} value={value} onChange={onChange}>
      <Label className="volume-slider-label">{label}</Label>
      <SliderTrack className="volume-slider-track">
        {({ state }) => (
          <>
            <div className="volume-slider-fill" style={{ width: `${state.getThumbPercent(0) * 100}%` }} />
            <SliderThumb className="volume-slider-thumb" />
          </>
        )}
      </SliderTrack>
    </Slider>
  );
}
