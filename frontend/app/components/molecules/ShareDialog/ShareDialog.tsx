import { useRef, useState } from "react";
import { Button } from "react-aria-components";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  WhatsappIcon,
  WhatsappShareButton,
  XIcon,
  XShareButton,
} from "react-share";
import { DiscordIcon } from "~/components/atoms/DiscordIcon/DiscordIcon";
import { PaperDialog } from "~/components/atoms/PaperDialog/PaperDialog";
import type { ShareDialogProps } from "./ShareDialog.models";
import { sharedPsalmUrl } from "./ShareDialog.utils";
import "./ShareDialog.styles.css";

const ICON_SIZE = 46;

export function ShareDialog({ locale, num, title }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const resetTimer = useRef<number | null>(null);
  const shareUrl = sharedPsalmUrl(
    typeof window === "undefined" ? "http://localhost" : window.location.origin,
    locale,
    num,
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${title}\n${shareUrl}`);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopyState("idle"), 3000);
  }

  function shareToDiscord() {
    window.open(
      "https://discord.com/channels/@me",
      "_blank",
      "noopener,noreferrer",
    );
    void copyLink();
  }

  async function shareMore() {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({ title, url: shareUrl });
    } catch (error) {
      if (!(error instanceof DOMException) || error.name !== "AbortError")
        setCopyState("error");
    }
  }

  return (
    <>
      <Button className="share-open" onClick={() => setIsOpen(true)}>
        Udostępnij
      </Button>
      <PaperDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title="Podaj psalm dalej"
        intro="Podziel się tym nieszczęściem ze swoimi graczami."
        closeLabel="Zamknij"
      >
        <div className="share-destinations">
          <WhatsappShareButton
            className="share-destination"
            url={shareUrl}
            title={title}
            separator=" — "
          >
            <WhatsappIcon
              size={ICON_SIZE}
              round
              bgStyle={{ fill: "var(--black)" }}
              iconFillColor="var(--yellow)"
            />
            <span>WhatsApp</span>
          </WhatsappShareButton>
          <FacebookShareButton className="share-destination" url={shareUrl}>
            <FacebookIcon
              size={ICON_SIZE}
              round
              bgStyle={{ fill: "var(--black)" }}
              iconFillColor="var(--yellow)"
            />
            <span>Facebook</span>
          </FacebookShareButton>
          <XShareButton
            className="share-destination"
            url={shareUrl}
            title={title}
          >
            <XIcon
              size={ICON_SIZE}
              round
              bgStyle={{ fill: "var(--black)" }}
              iconFillColor="var(--yellow)"
            />
            <span>X</span>
          </XShareButton>
          <EmailShareButton
            className="share-destination"
            url={shareUrl}
            subject={title}
            body={title}
          >
            <EmailIcon
              size={ICON_SIZE}
              round
              bgStyle={{ fill: "var(--black)" }}
              iconFillColor="var(--yellow)"
            />
            <span>E-mail</span>
          </EmailShareButton>
          <Button className="share-destination" onPress={shareToDiscord}>
            <span className="share-brand-mark">
              <DiscordIcon />
            </span>
            <span>Discord</span>
          </Button>
          <Button className="share-destination" onPress={shareMore}>
            <span className="share-more-mark" aria-hidden="true">
              <svg viewBox="0 0 46 46">
                <circle cx="13" cy="23" r="3" />
                <circle cx="23" cy="23" r="3" />
                <circle cx="33" cy="23" r="3" />
              </svg>
            </span>
            <span>Więcej</span>
          </Button>
        </div>

        <div className="share-copy-row">
          <span className="share-url">{shareUrl}</span>
          <Button className="share-copy" onPress={copyLink}>
            {copyState === "copied" ? "Skopiowano" : "Kopiuj"}
          </Button>
        </div>
        <p className="share-note">
          Ten link otwiera tylko ten psalm — bez rozpoczynania sesji.
        </p>
        <p
          className={`share-status${copyState === "error" ? " error" : ""}`}
          role="status"
          aria-live="polite"
        >
          {copyState === "copied" && "Skopiowano — wybierz rozmowę i wklej."}
          {copyState === "error" &&
            "Nie udało się skopiować. Zaznacz adres powyżej."}
        </p>
      </PaperDialog>
    </>
  );
}
