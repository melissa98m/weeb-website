import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() =>
    localStorage.getItem('language') || 'fr'
  );

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.className = language;
  }, [language]);

  const toggleLanguage = () =>
    setLanguage((prev) => (prev === 'en' ? 'fr' : 'en'));

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

const useLanguage = () => useContext(LanguageContext);


export { LanguageProvider, useLanguage };
