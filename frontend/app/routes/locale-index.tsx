import { useState } from "react";
import { Link, redirect, useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router";
import { useTranslation } from "react-i18next";
import { psalmsByLocale, type Locale } from "~/content";
import { toRomanNumeral } from "~/content/roman-numerals";
import { apiPost } from "~/lib/api";
import { TornButton } from "~/components/TornButton";

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
    <div className="page-shell">
      <main className="cover">
        <h1 className="cover-title">{cover.title}</h1>
        <p className="cover-sub">{cover.subtitle}</p>
        <p className="cover-by">{cover.author}</p>

        <div className="cover-controls">
          <TornButton onPress={handleRoll} isDisabled={rolling}>
            {t("roll")}
          </TornButton>
          <TornButton quiet onPress={handleRevealEnd} isDisabled={rolling}>
            {t("revealEnd")}
          </TornButton>
          <TornButton quiet onPress={handleReset} isDisabled={rolling}>
            {t("reset")}
          </TornButton>
        </div>
        {error && (
          <p className="cover-error" role="alert">
            {error}
          </p>
        )}

        <nav className="cover-nav" aria-label="Psalms">
          <ul>
            {psalmNumbers.map((n) => (
              <li key={n}>
                <Link to={`/${locale}/psalm/${n}`}>Psalm {toRomanNumeral(n)}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  );
}
