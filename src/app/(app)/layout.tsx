
import AuthGuard from '@/components/AuthGuard';
import AppHeader from '@/components/AppHeader';
import type { ReactNode } from 'react';
// import { LanguageProviderClientComponentApp } from './language-provider-client-app'; // Temporariamente removido

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      {/* <LanguageProviderClientComponentApp> */} {/* Temporariamente removido */}
      {/*  {({ t }) => ( */} {/* Temporariamente removido */}
          <div className="flex min-h-screen flex-col">
            <AppHeader />
            <main className="flex-1">
              {children}
            </main>
            <footer className="py-6 md:px-8 md:py-0 bg-background border-t">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
                <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                  {/* Texto anteriormente: {t('footerText', { year: new Date().getFullYear() })} */}
                  © {new Date().getFullYear()} Mystic Insights. Todos os direitos reservados.
                </p>
              </div>
            </footer>
          </div>
      {/*  )} */} {/* Temporariamente removido */}
      {/* </LanguageProviderClientComponentApp> */} {/* Temporariamente removido */}
    </AuthGuard>
  );
}
