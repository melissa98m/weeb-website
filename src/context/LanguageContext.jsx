import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const LanguageContext = createContext(null);

const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() =>
    localStorage.getItem('language') || 'fr'
  );

  useEffect(() => {
    localStorage.setItem('language', language);
    const root = document.documentElement;
    root.setAttribute('lang', language);
    root.dataset.lang = language;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'fr' : 'en'));
  }, []);

  const value = useMemo(
    () => ({ language, toggleLanguage }),
    [language, toggleLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within <LanguageProvider>');
  return ctx;
};


export { LanguageProvider, useLanguage };
