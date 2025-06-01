
import AuthGuard from '@/components/AuthGuard';
import AppHeader from '@/components/AppHeader';
import type { ReactNode } from 'react';
import { LanguageProviderClientComponentApp } from './language-provider-client-app';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <LanguageProviderClientComponentApp>
        {({ t }) => (
          <div className="flex min-h-screen flex-col">
            <AppHeader />
            <main className="flex-1">
              {children}
            </main>
            <footer className="py-6 md:px-8 md:py-0 bg-background border-t">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
                <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                  {t('footerText', { year: new Date().getFullYear() })}
                </p>
              </div>
            </footer>
          </div>
        )}
      </LanguageProviderClientComponentApp>
    </AuthGuard>
  );
}

