
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';

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
  const [locale, setLocaleState] = useState<Locale>('pt-BR'); // Default para SSR, será sobrescrito no cliente

  useEffect(() => {
    // Este código roda apenas no cliente após a montagem.
    const storedLocale = localStorage.getItem('app-locale') as Locale | null;
    let effectiveLocale: Locale = 'pt-BR'; // Default

    if (storedLocale && (storedLocale === 'en' || storedLocale === 'pt-BR')) {
      effectiveLocale = storedLocale;
    }
    
    // Define o estado, o lang do documento e (re)salva no localStorage para consistência.
    setLocaleState(effectiveLocale);
    document.documentElement.lang = effectiveLocale;
    localStorage.setItem('app-locale', effectiveLocale); // Garante que o valor efetivo está salvo

  }, []); // Roda apenas uma vez no mount, no lado do cliente

  const updateLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('app-locale', newLocale);
    document.documentElement.lang = newLocale;
  }, []); // setLocaleState é estável, não precisa ser listado como dependência explícita se não usado no corpo
  
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
