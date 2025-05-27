

import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { ThemeToggle, LanguageSwitcher } from '@/components/AppHeader';
import { LanguageProviderClientComponent } from './language-provider-client';


export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProviderClientComponent>
      {({ t }) => (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          <div className="mb-8 flex flex-col items-center pt-12 sm:pt-0">
            <Sparkles className="h-12 w-12 text-primary mb-4" />
            <h1 className="text-4xl font-bold text-primary font-serif">{t('mysticInsights')}</h1>
            <p className="text-muted-foreground mt-2">{t('authLayoutSubtitle')}</p>
          </div>
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      )}
    </LanguageProviderClientComponent>
  );
}

