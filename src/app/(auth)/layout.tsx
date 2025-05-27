
"use client"; // Added to make this a Client Component

import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { ThemeToggle, LanguageSwitcher } from '@/components/AppHeader';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Subtle background elements for neon feel - optional */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-primary/50 rounded-full filter blur-3xl animate-pulse_slow"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-accent/50 rounded-full filter blur-3xl animate-pulse_slow animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-1/4 h-1/4 bg-secondary/40 rounded-full filter blur-3xl animate-pulse_slow animation-delay-4000 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="flex flex-col items-center text-center z-10 mb-8">
        <Sparkles className="h-16 w-16 sm:h-20 sm:w-20 text-primary mb-4 animate-subtle-pulse" />
        <h1 className="text-4xl sm:text-5xl font-bold text-primary font-serif">Mystic Insights</h1>
        <p className="text-muted-foreground mt-2 text-md sm:text-lg">Desvende os segredos do seu caminho.</p>
      </div>

      <div className="w-full max-w-md z-10">
        {children}
      </div>
      
      {/* Add Tailwind animation classes if not already present */}
      <style jsx global>{`
        .animate-pulse_slow {
          animation: pulse_slow 6s infinite ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes pulse_slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
