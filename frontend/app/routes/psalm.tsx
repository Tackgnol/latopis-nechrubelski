import { data, Link, useLoaderData, useLocation, type LoaderFunctionArgs } from "react-router";
import { useTranslation } from "react-i18next";
import { psalmsByLocale, type Locale } from "~/content";
import { toRomanNumeral } from "~/content/roman-numerals";

export function loader({ params }: LoaderFunctionArgs) {
  const locale = params.locale as Locale;
  const num = Number(params.num);
  const psalm = psalmsByLocale[locale].psalms[num];
  if (!psalm) throw data("Psalm not found", { status: 404 });
  return { locale, num, psalm };
}

export default function PsalmPage() {
  const { locale, num, psalm } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const revealedVerse = useLocation().hash.replace(/^#verse-/, "") || null;

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
      <Link to={`/${locale}`}>{t("backToCover")}</Link>
    </main>
  );
}
