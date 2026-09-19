import { useTranslation } from "react-i18next";
import type { WelcomeTagProps } from "./WelcomeTag.models";
import "./WelcomeTag.styles.css";

export function WelcomeTag({ nickname }: WelcomeTagProps) {
  const { t } = useTranslation();

  return (
    <p className="welcome-tag">
      <span className="welcome-greeting">{t("welcome")},</span>
      <span className="welcome-nick" title={nickname}>
        {nickname}
      </span>
    </p>
  );
}
