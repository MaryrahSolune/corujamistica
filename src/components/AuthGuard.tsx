
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext'; // Import useLanguage

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage(); // Get the t function

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  if (loading) {
    // Skeleton text can also be translated if needed, but for a loading state,
    // it might be acceptable to keep it minimal or not explicitly translate the placeholder shapes.
    // If actual text was here, it would be t('loadingMessage') for example.
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Skeleton className="h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-4 w-[250px] mb-2" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    );
  }

  if (!currentUser) {
    // This part is usually not rendered as the useEffect redirects.
    // If it were, this message should also be translated.
    // For now, relying on redirect. If a message is to be shown, it would be:
    // <p>{t('pleaseLoginToContinue')}</p> 
    return null; 
  }

  return <>{children}</>;
}

