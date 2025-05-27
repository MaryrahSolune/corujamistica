
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  setLocale: (newLocale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Esta função é executada apenas na montagem inicial do lado do cliente
    // ou no servidor (onde window é undefined).
    if (typeof window !== "undefined") {
      const storedLocale = localStorage.getItem('app-locale') as Locale | null;
      if (storedLocale && (storedLocale === 'en' || storedLocale === 'pt-BR')) {
        return storedLocale;
      }
    }
    return 'pt-BR'; // Padrão se nada for encontrado ou no SSR
  });

  // Este useEffect sincroniza o localStorage e o atributo lang do HTML
  // sempre que o estado 'locale' mudar.
  // Ele também define o idioma inicial no HTML na primeira renderização do cliente.
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem('app-locale', locale);
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const updateLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };
  
  const t = (key: TranslationKey): string => {
    return translations[locale]?.[key] || translations.en[key] || key;
  };

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
