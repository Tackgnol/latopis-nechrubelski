import { Link, redirect, useLoaderData, type LoaderFunctionArgs, type MetaFunction } from "react-router";
import { psalmsByLocale, type Locale } from "~/content";
import { toRomanNumeral } from "~/content/roman-numerals";

export function loader({ params, request }: LoaderFunctionArgs) {
  const locale = params.locale as Locale;
  const url = new URL(request.url);
  const psalmParam = url.searchParams.get("psalm");
  if (psalmParam !== null) {
    const [numPart, versePart] = psalmParam.split(":");
    const num = Number(numPart);
    const psalm = psalmsByLocale[locale].psalms[num];
    if (Number.isInteger(num) && psalm) {
      const verse = versePart && psalm.verses[versePart] ? versePart : Object.keys(psalm.verses)[0];
      return redirect(`/${locale}/psalm/${num}?v=${verse}`);
    }
  }
  const { cover, psalms } = psalmsByLocale[locale];
  return { locale, psalmNumbers: Object.keys(psalms).map(Number).sort((a, b) => a - b), title: cover.title };
}

export const meta: MetaFunction<typeof loader> = ({ loaderData }) => [{ title: loaderData?.title }];

export default function LocaleIndex() {
  const { locale, psalmNumbers } = useLoaderData<typeof loader>();

  return (
    <nav className="seo-index" aria-label="Psalms">
      <ul>
        {psalmNumbers.map((n) => (
          <li key={n}>
            <Link to={`/${locale}/psalm/${n}`}>Psalm {toRomanNumeral(n)}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
