
'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, LogOut } from 'lucide-react';
import AppHeader from '@/components/AppHeader'; // Assuming you want the same header
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { userProfile, loading: authLoading, currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.push('/login'); // Not logged in, redirect to login
      } else if (userProfile && userProfile.role !== 'admin') {
        router.push('/dashboard'); // Logged in but not admin, redirect to regular dashboard
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
    // This case should ideally be caught by useEffect redirect,
    // but as a fallback, don't render children.
    // Or show an "Access Denied" message, but redirect is cleaner.
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login'); // Redirect to login after logout
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader /> {/* You might want a specific AdminHeader later */}
      <main className="flex-1">
        {children}
      </main>
      <footer className="py-6 md:px-8 md:py-0 bg-background border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            {t('footerText', { year: new Date().getFullYear() })} - {t('adminPanel')}
          </p>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            {t('logout')}
          </Button>
        </div>
      </footer>
    </div>
  );
}
