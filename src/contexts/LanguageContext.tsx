'use client';

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

export type Locale = 'en' | 'pt-BR';

interface LanguageContextType {
  locale: Locale;
  setLocale: Dispatch<SetStateAction<Locale>>;
  t: (key: TranslationKey) => string;
}

const translations = {
  en: {
    dashboard: "Dashboard",
    newReading: "New Reading",
    credits: "Credits",
    profile: "Profile",
    logout: "Log out",
    toggleTheme: "Toggle theme",
    mysticInsights: "Mystic Insights",
    language: "Language",
    english: "English",
    portuguese: "Portuguese",
  },
  'pt-BR': {
    dashboard: "Painel",
    newReading: "Nova Leitura",
    credits: "Créditos",
    profile: "Perfil",
    logout: "Sair",
    toggleTheme: "Alternar tema",
    mysticInsights: "Mystic Insights",
    language: "Idioma",
    english: "Inglês",
    portuguese: "Português",
  },
};

export type TranslationKey = keyof typeof translations.en;

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('pt-BR'); // Default to Portuguese

  useEffect(() => {
    const storedLocale = localStorage.getItem('app-locale') as Locale | null;
    if (storedLocale && (storedLocale === 'en' || storedLocale === 'pt-BR')) {
      setLocale(storedLocale);
      document.documentElement.lang = storedLocale;
    } else {
      document.documentElement.lang = 'pt-BR'; // Set initial lang if not stored
    }
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('app-locale', newLocale);
    document.documentElement.lang = newLocale;
  };
  
  const t = useMemo(() => (key: TranslationKey): string => {
    return translations[locale]?.[key] || translations.en[key] || key;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale as Dispatch<SetStateAction<Locale>>, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
