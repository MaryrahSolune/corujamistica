
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
    // Executado apenas na montagem inicial do lado do cliente ou no SSR.
    if (typeof window !== "undefined") {
      const storedLocale = localStorage.getItem('app-locale') as Locale | null;
      if (storedLocale && (storedLocale === 'en' || storedLocale === 'pt-BR')) {
        return storedLocale;
      }
    }
    return 'pt-BR'; // Padrão se nada for encontrado ou no SSR
  });

  // Efeito para definir o lang do HTML na montagem inicial do cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, []); // Executa apenas uma vez no cliente após a montagem inicial

  const updateLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem('app-locale', newLocale);
      document.documentElement.lang = newLocale;
    }
  };
  
  const t = (key: TranslationKey): string => {
    // Se a tradução para o locale atual não existir, usa inglês como fallback,
    // e se não existir em inglês, usa a própria chave.
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
