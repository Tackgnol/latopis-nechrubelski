import { useTranslation } from "react-i18next";
import { TornButton } from "~/components/atoms/TornButton/TornButton";
import { analyticsEnabled, denyConsent, grantConsent, useConsent } from "~/lib/analytics";
import "./ConsentBanner.styles.css";

/** Asks for analytics consent until the visitor chooses; never blocks the page. */
export function ConsentBanner() {
  const { t } = useTranslation();
  const consent = useConsent();

  if (!analyticsEnabled || consent !== null) return null;

  return (
    <section className="consent-banner" aria-label={t("consentLabel")}>
      <p className="consent-text">{t("consentText")}</p>
      <div className="consent-actions">
        <TornButton onPress={grantConsent}>{t("consentAccept")}</TornButton>
        <TornButton onPress={denyConsent}>{t("consentReject")}</TornButton>
      </div>
    </section>
  );
}
