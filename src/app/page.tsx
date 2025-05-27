
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { ThemeToggle, LanguageSwitcher } from '@/components/AppHeader';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HomePage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && currentUser) {
      router.replace('/dashboard');
    }
  }, [currentUser, loading, router]);

  if (loading || (!loading && currentUser)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">{t('loadingMysticalSpace')}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="py-6">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-serif text-primary">{t('mysticInsights')}</span>
          </div>
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <Button variant="ghost" asChild>
              <Link href="/login">
                <LogIn className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">{t('login')}</span>
              </Link>
            </Button>
            <Button asChild>
              <Link href="/signup">
                <UserPlus className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">{t('signUp')}</span>
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-3xl">
          <Sparkles className="h-20 w-20 text-primary mx-auto mb-6 animate-subtle-pulse" />
          <h1 className="text-5xl md:text-6xl font-bold font-serif mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
            {t('landingTitle')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10">
            {t('landingSubtitle')}
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link href="/signup">
                {t('landingButton')} <UserPlus className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="mt-16 w-full max-w-4xl animated-aurora-background rounded-xl">
          <Image 
            src="https://placehold.co/1200x600.png" 
            alt={t('landingImageAlt')} 
            data-ai-hint="tarot cards celestial"
            width={1200} 
            height={600} 
            className="rounded-xl shadow-2xl object-cover relative z-10 opacity-95"
            priority
          />
        </div>
      </main>

      <footer className="py-8 text-center">
        <p className="text-muted-foreground">
          {t('footerText', { year: new Date().getFullYear() })}
        </p>
      </footer>
    </div>
  );
}
