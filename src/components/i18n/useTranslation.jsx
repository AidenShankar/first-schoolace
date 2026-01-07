import { useLanguage } from './LanguageContext';
import { t } from './translations';

export function useTranslation() {
  const { language, locale } = useLanguage();

  const translate = (key) => {
    return t(key, language);
  };

  return {
    t: translate,
    language,
    locale
  };
}

export default useTranslation;