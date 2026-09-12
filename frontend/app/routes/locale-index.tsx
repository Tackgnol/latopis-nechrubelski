import { Link, redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { psalmsByLocale, type Locale } from "~/content";
import { toRomanNumeral } from "~/content/roman-numerals";

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

export default function LocaleIndex() {
  const { locale, cover, psalmNumbers } = useLoaderData<typeof loader>();
  return (
    <main>
      <h1>{cover.title}</h1>
      <p>{cover.subtitle}</p>
      <p>{cover.author}</p>
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
