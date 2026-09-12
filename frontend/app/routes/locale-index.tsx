import { useState } from "react";
import { Link, redirect, useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "react-aria-components";
import { psalmsByLocale, type Locale } from "~/content";
import { toRomanNumeral } from "~/content/roman-numerals";
import { apiPost } from "~/lib/api";

export function loader({ params, request }: LoaderFunctionArgs) {
  const locale = params.locale as Locale;
  const url = new URL(request.url);
  const psalmParam = url.searchParams.get("psalm");
  if (psalmParam !== null) {
    const num = Number(psalmParam);
    if (Number.isInteger(num) && psalmsByLocale[locale].psalms[num]) {
      return redirect(`/${locale}/psalm/${num}`);
    }
  }
  const { cover, psalms } = psalmsByLocale[locale];
  return { locale, cover, psalmNumbers: Object.keys(psalms).map(Number).sort((a, b) => a - b) };
}

interface RollResult {
  psalm: number;
  verse: number;
}

export default function LocaleIndex() {
  const { locale, cover, psalmNumbers } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function goToResult(result: RollResult) {
    navigate(`/${locale}/psalm/${result.psalm}#verse-${result.verse}`);
  }

  async function handleRoll() {
    setRolling(true);
    setError(null);
    try {
      await goToResult(await apiPost<RollResult>("/api/sessions/roll"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("rollFailed"));
    } finally {
      setRolling(false);
    }
  }

  async function handleRevealEnd() {
    setRolling(true);
    setError(null);
    try {
      await goToResult(await apiPost<RollResult>("/api/sessions/reveal-end"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("rollFailed"));
    } finally {
      setRolling(false);
    }
  }

  async function handleReset() {
    if (!window.confirm(t("resetConfirm"))) return;
    await apiPost("/api/sessions/reset");
  }

  return (
    <main>
      <h1>{cover.title}</h1>
      <p>{cover.subtitle}</p>
      <p>{cover.author}</p>

      <Button onPress={handleRoll} isDisabled={rolling}>
        {t("roll")}
      </Button>
      <Button onPress={handleRevealEnd} isDisabled={rolling}>
        {t("revealEnd")}
      </Button>
      <Button onPress={handleReset} isDisabled={rolling}>
        {t("reset")}
      </Button>
      {error && <p role="alert">{error}</p>}

      <nav aria-label="Psalms">
        <ul>
          {psalmNumbers.map((n) => (
            <li key={n}>
              <Link to={`/${locale}/psalm/${n}`}>Psalm {toRomanNumeral(n)}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
