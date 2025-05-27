
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
  const [locale, setLocaleState] = useState<Locale>('pt-BR'); // Default para SSR, será sobrescrito no cliente

  useEffect(() => {
    // Este código roda apenas no cliente após a montagem.
    const storedLocale = localStorage.getItem('app-locale') as Locale | null;
    let effectiveLocale: Locale = 'pt-BR'; // Default

    if (storedLocale && (storedLocale === 'en' || storedLocale === 'pt-BR')) {
      effectiveLocale = storedLocale;
    }
    
    setLocaleState(effectiveLocale);
    document.documentElement.lang = effectiveLocale;
    // Garante que o localStorage seja definido/atualizado com o locale efetivo na inicialização do cliente
    localStorage.setItem('app-locale', effectiveLocale); 

  }, []); // Roda apenas uma vez no mount, no lado do cliente

  const updateLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('app-locale', newLocale);
    document.documentElement.lang = newLocale;
  };
  
  const t = (key: TranslationKey): string => {
    // Acessa o 'locale' mais recente diretamente do estado na renderização.
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
