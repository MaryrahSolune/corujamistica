
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext'; 

const SPLASH_DURATION = 1500; // 1.5 seconds, adjust as needed for your GIF's length

export default function WelcomeSplashPage() {
  const router = useRouter();
  const { t } = useLanguage(); 

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/dashboard'); 
    }, SPLASH_DURATION);

    return () => clearTimeout(timer); 
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative overflow-hidden animated-aurora-background">
      {/* Central background elements removed */}
      
      <div className="z-10 text-center">
        <Image
          src="/img/gato.gif" 
          alt={t('mysticInsights') + " - Loading"} 
          data-ai-hint="mystical loading animation cat" 
          width={400} 
          height={300} 
          unoptimized={true} 
          priority 
        />
        <p className="mt-4 text-lg text-primary animate-pulse">{t('loadingMysticalSpace')}</p>
      </div>
      
      <style jsx global>{`
        /* Keyframes for animations like animate-pulse are in globals.css or Tailwind config */
        /* No local keyframes needed here if they are globally defined and used via Tailwind classes */
      `}</style>
    </div>
  );
}

