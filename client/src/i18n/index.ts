import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import th from './locales/th.json';
import en from './locales/en.json';

const resources = {
  th: { translation: th },
  en: { translation: en },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'th',
    defaultNS: 'translation',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'kodlaewlong_language',
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
