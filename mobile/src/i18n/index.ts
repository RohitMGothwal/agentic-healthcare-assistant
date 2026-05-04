import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../assets/i18n/en.json';
import hi from '../../assets/i18n/hi.json';
import bn from '../../assets/i18n/bn.json';
import mr from '../../assets/i18n/mr.json';
import te from '../../assets/i18n/te.json';
import ta from '../../assets/i18n/ta.json';
import gu from '../../assets/i18n/gu.json';
import ur from '../../assets/i18n/ur.json';
import kn from '../../assets/i18n/kn.json';
import or from '../../assets/i18n/or.json';
import ml from '../../assets/i18n/ml.json';
import zh from '../../assets/i18n/zh.json';
import es from '../../assets/i18n/es.json';
import tl from '../../assets/i18n/tl.json';
import ar from '../../assets/i18n/ar.json';
import fr from '../../assets/i18n/fr.json';
import de from '../../assets/i18n/de.json';
import it from '../../assets/i18n/it.json';
import ja from '../../assets/i18n/ja.json';
import ko from '../../assets/i18n/ko.json';
import pt from '../../assets/i18n/pt.json';
import ru from '../../assets/i18n/ru.json';
import tr from '../../assets/i18n/tr.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    bn: { translation: bn },
    mr: { translation: mr },
    te: { translation: te },
    ta: { translation: ta },
    gu: { translation: gu },
    ur: { translation: ur },
    kn: { translation: kn },
    or: { translation: or },
    ml: { translation: ml },
    zh: { translation: zh },
    es: { translation: es },
    tl: { translation: tl },
    ar: { translation: ar },
    fr: { translation: fr },
    de: { translation: de },
    it: { translation: it },
    ja: { translation: ja },
    ko: { translation: ko },
    pt: { translation: pt },
    ru: { translation: ru },
    tr: { translation: tr },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
