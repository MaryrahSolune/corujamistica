
"use client"; // Added to make this a Client Component

import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { LanguageSwitcher } from '@/components/AppHeader';
import { useLanguage } from '@/contexts/LanguageContext'; // Import useLanguage

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useLanguage(); // Get the t function

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 relative overflow-hidden">
      
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <LanguageSwitcher />
      </div>

      <div className="flex flex-col items-center text-center z-10 mb-8">
        <Sparkles className="h-16 w-16 sm:h-20 sm:w-20 text-primary mb-4 animate-subtle-pulse" />
        <h1 className="text-4xl sm:text-5xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
          {t('mysticInsights')}
        </h1>
        <p className="text-muted-foreground mt-2 text-md sm:text-lg">
          {t('authLayoutSubtitle')}
        </p>
      </div>

      <div className="w-full max-w-md z-10">
        {children}
      </div>
      
      <style jsx global>{`
        /* Keyframes for animations like subtle-pulse are in globals.css or Tailwind config */
        /* No local keyframes needed here if they are globally defined and used via Tailwind classes */
      `}</style>
    </div>
  );
}
