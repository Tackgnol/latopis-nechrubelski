import { data, Outlet, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { I18nextProvider } from "react-i18next";
import { isLocale } from "~/content";
import { createI18nInstance } from "~/i18n-instance";

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
  return (
    <I18nextProvider i18n={i18n}>
      <Outlet />
    </I18nextProvider>
  );
}
