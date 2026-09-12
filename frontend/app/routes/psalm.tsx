import { data, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "react-aria-components";
import { psalmsByLocale, type Locale } from "~/content";
import { toRomanNumeral } from "~/content/roman-numerals";
import { useState } from "react";

export function loader({ params }: LoaderFunctionArgs) {
  const locale = params.locale as Locale;
  const num = Number(params.num);
  const psalm = psalmsByLocale[locale].psalms[num];
  if (!psalm) throw data("Psalm not found", { status: 404 });
  return { num, psalm };
}

export default function PsalmPage() {
  const { num, psalm } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const [revealedVerse, setRevealedVerse] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRoll() {
    setRolling(true);
    setError(null);
    try {
      const res = await fetch("/api/sessions/roll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ psalm: num }),
      });
      if (!res.ok) throw new Error(await res.text());
      const roll = (await res.json()) as { verse: number };
      setRevealedVerse(String(roll.verse));
    } catch {
      setError("Roll failed — is the backend running?");
    } finally {
      setRolling(false);
    }
  }

  return (
    <main>
      <h1>
        Psalm {toRomanNumeral(num)} — {psalm.label}
      </h1>
      <ol>
        {Object.entries(psalm.verses).map(([verseNum, text]) => (
          <li
            key={verseNum}
            id={`verse-${verseNum}`}
            aria-current={revealedVerse === verseNum ? "true" : undefined}
            data-revealed={revealedVerse === verseNum}
          >
            {text}
          </li>
        ))}
      </ol>
      <Button onPress={handleRoll} isDisabled={rolling}>
        {t("roll")}
      </Button>
      {error && <p role="alert">{error}</p>}
    </main>
  );
}
