import { redirect, useLoaderData, type LoaderFunctionArgs, type MetaFunction } from "react-router";
import { psalmsByLocale, type Locale } from "~/content";
import { PsalmIndexNav } from "~/components/molecules/PsalmIndexNav/PsalmIndexNav";

export function loader({ params, request }: LoaderFunctionArgs) {
  const locale = params.locale as Locale;
  const url = new URL(request.url);
  const psalmParam = url.searchParams.get("psalm");
  if (psalmParam !== null) {
    // Old links may carry a verse (`?psalm=4:3`); only the psalm is kept.
    const num = Number(psalmParam.split(":")[0]);
    if (Number.isInteger(num) && psalmsByLocale[locale].psalms[num]) return redirect(`/${locale}/psalm/${num}`);
  }
  const { cover, psalms } = psalmsByLocale[locale];
  return { locale, psalmNumbers: Object.keys(psalms).map(Number).sort((a, b) => a - b), title: cover.title };
}

export const meta: MetaFunction<typeof loader> = ({ loaderData }) => [{ title: loaderData?.title }];

export default function LocaleIndex() {
  const { locale, psalmNumbers } = useLoaderData<typeof loader>();

  return <PsalmIndexNav locale={locale} psalmNumbers={psalmNumbers} />;
}
