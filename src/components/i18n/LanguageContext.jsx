import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LANGUAGES = {
  EN: { code: 'EN', name: 'English', locale: 'en' },
  ES: { code: 'ES', name: 'Español', locale: 'es' },
  FR: { code: 'FR', name: 'Français', locale: 'fr' },
  ZH: { code: '中', name: '中文', locale: 'zh' },
  KO: { code: '한', name: '한국어', locale: 'ko' }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('schoolace_language');
    return saved || 'EN';
  });

  useEffect(() => {
    localStorage.setItem('schoolace_language', language);
  }, [language]);

  const value = {
    language,
    setLanguage,
    locale: LANGUAGES[language]?.locale || 'en',
    languageInfo: LANGUAGES[language] || LANGUAGES.EN
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;