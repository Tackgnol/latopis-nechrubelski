import { Dialog, DialogTrigger, Popover } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { Icon } from "~/components/atoms/Icon/Icon";
import { TornButton } from "~/components/atoms/TornButton/TornButton";
import { VolumeSlider } from "~/components/atoms/VolumeSlider/VolumeSlider";
import type { VolumeControlProps } from "./VolumeControl.models";
import "./VolumeControl.styles.css";

export function VolumeControl({ volume, onChange }: VolumeControlProps) {
  const { t } = useTranslation();

  return (
    <div className="volume-control">
      <DialogTrigger>
        <TornButton quiet ariaLabel={t("volume")}>
          <Icon name={volume === 0 ? "speaker-muted" : "speaker"} />
        </TornButton>
        <Popover className="volume-panel" placement="top end" offset={12}>
          <Dialog className="volume-dialog" aria-label={t("volume")}>
            <VolumeSlider label={t("volume")} value={volume} onChange={onChange} />
          </Dialog>
        </Popover>
      </DialogTrigger>
    </div>
  );
}
