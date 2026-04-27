import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../assets/i18n/en.json';
import hi from '../../assets/i18n/hi.json';
import es from '../../assets/i18n/es.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    es: { translation: es },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
