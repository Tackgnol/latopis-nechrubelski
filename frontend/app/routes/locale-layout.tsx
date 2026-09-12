import { data, Outlet, useLoaderData, useMatches, type LoaderFunctionArgs } from "react-router";
import { I18nextProvider } from "react-i18next";
import { isLocale } from "~/content";
import { createI18nInstance } from "~/i18n-instance";
import { Book } from "~/components/Book";

export function loader({ params }: LoaderFunctionArgs) {
  const locale = params.locale;
  if (!locale || !isLocale(locale)) {
    throw data("Unsupported locale", { status: 404 });
  }
  return { locale };
}

export default function LocaleLayout() {
  const { locale } = useLoaderData<typeof loader>();
  const i18n = createI18nInstance(locale);
  const matches = useMatches();
  const leafData = matches.at(-1)?.loaderData as { num?: number; verse?: string } | undefined;
  const current = leafData?.num ? { num: leafData.num, verse: leafData.verse ?? "1" } : null;
  return (
    <I18nextProvider i18n={i18n}>
      <Book locale={locale} current={current} />
      <Outlet />
    </I18nextProvider>
  );
}
