import { useLanguage } from "./LanguageContext";
import en from "./locales/en";
import vi from "./locales/vi";
export { LanguageProvider, useLanguage } from "./LanguageContext";
export type { Lang } from "./LanguageContext";

const translations = { en, vi };

export type Translations = typeof en;

export const useTranslation = () => {
  const { lang } = useLanguage();
  return translations[lang];
};
