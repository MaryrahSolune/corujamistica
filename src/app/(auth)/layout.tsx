
"use client"; // Added to make this a Client Component

import type { ReactNode } from 'react';
import Image from 'next/image';
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
        <Image 
          src="/img/simples.png" 
          alt="Coruja Mística Logo" 
          width={120} 
          height={120} 
          className="mb-4" 
          data-ai-hint="mystical owl logo"
        />
        <h1 className="text-4xl sm:text-5xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary bg-[length:200%_auto] animate-text-gradient-flow">
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
