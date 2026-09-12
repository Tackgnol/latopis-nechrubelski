import i18next, { type i18n } from "i18next";
import { initReactI18next } from "react-i18next";
import { defaultNS, resources } from "./i18n";
import type { Locale } from "./content";

export function createI18nInstance(locale: Locale): i18n {
  const instance = i18next.createInstance();
  instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: "pl",
    defaultNS,
    resources,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
  return instance;
}
