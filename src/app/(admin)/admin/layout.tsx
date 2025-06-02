
'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader'; 

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { userProfile, loading: authLoading, currentUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.push('/login'); 
      } else if (userProfile && userProfile.role !== 'admin') {
        router.push('/dashboard'); 
      }
    }
  }, [currentUser, userProfile, authLoading, router]);

  if (authLoading || (currentUser && !userProfile)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">{t('loadingMysticalSpace')}</p>
      </div>
    );
  }

  if (!currentUser || (userProfile && userProfile.role !== 'admin')) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader /> 
      <main className="flex-1">
        {children}
      </main>
      <footer className="py-6 md:px-8 md:py-0 bg-background border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-20 md:flex-row"> {/* Centered footer text */}
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
            {t('footerText', { year: new Date().getFullYear() })} - {t('adminPanel')}
          </p>
        </div>
      </footer>
    </div>
  );
}
