'use client';

import type { ReactNode } from 'react'; // Removido Dispatch e SetStateAction
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

export type Locale = 'en' | 'pt-BR';

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

interface LanguageContextType {
  locale: Locale;
  setLocale: (newLocale: Locale) => void; // Simplificado para aceitar apenas Locale
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>('pt-BR'); // Estado interno

  useEffect(() => {
    const storedLocale = localStorage.getItem('app-locale') as Locale | null;
    let initialLocale: Locale = 'pt-BR'; // Default

    if (storedLocale && (storedLocale === 'en' || storedLocale === 'pt-BR')) {
      initialLocale = storedLocale;
    }
    
    setLocaleState(initialLocale);
    document.documentElement.lang = initialLocale;
    
    // Se não havia nada ou era inválido, e quisermos persistir o default no localStorage:
    if (!storedLocale || (storedLocale !== 'en' && storedLocale !== 'pt-BR')) {
       localStorage.setItem('app-locale', initialLocale);
    }

  }, []); // Roda apenas no mount, no lado do cliente

  const updateLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('app-locale', newLocale);
    document.documentElement.lang = newLocale;
  };
  
  const t = useMemo(() => (key: TranslationKey): string => {
    return translations[locale]?.[key] || translations.en[key] || key;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale: updateLocale, t }}>
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
