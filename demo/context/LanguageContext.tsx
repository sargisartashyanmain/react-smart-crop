/**
 * React Context for managing application language (English/Russian).
 * Persists language preference to localStorage.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Language } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRussian: boolean;
  isEnglish: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('app-language');
    if (saved === 'ru' || saved === 'en') return saved;
    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'ru' ? 'ru' : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage, 
        isRussian: language === 'ru',
        isEnglish: language === 'en'
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
