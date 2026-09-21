import { Dialog, DialogTrigger, Popover } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { TornButton } from "~/components/atoms/TornButton/TornButton";
import { ART_CREDITS, NARRATOR, PIXABAY_URL } from "./CreditsControl.utils";
import "./CreditsControl.styles.css";

export function CreditsControl() {
  const { t } = useTranslation();

  return (
    <div className="credits-control">
      <DialogTrigger>
        <TornButton quiet>{t("credits")}</TornButton>
        <Popover className="credits-panel" placement="bottom start" offset={12}>
          <Dialog className="credits-dialog" aria-label={t("credits")}>
            <p className="credits-reader">
              <span className="credits-reader-by">{t("readBy")}</span> <span className="credits-reader-name">{NARRATOR}</span>
            </p>
            <p className="credits-note">{t("creditsText")}</p>
            <p className="credits-note">{t("creditsArt")}</p>
            <ul className="credits-list">
              {ART_CREDITS.map(({ labelKey, author, href }) => (
                <li key={href}>
                  {t(labelKey)} —{" "}
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {author}
                  </a>
                </li>
              ))}
            </ul>
            <p className="credits-note">
              {t("creditsAllArt")}{" "}
              <a href={PIXABAY_URL} target="_blank" rel="noopener noreferrer">
                Pixabay
              </a>
            </p>
          </Dialog>
        </Popover>
      </DialogTrigger>
    </div>
  );
}
