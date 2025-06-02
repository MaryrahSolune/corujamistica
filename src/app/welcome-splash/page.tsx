
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
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
        /* animate-pulse_slow and related styles are no longer needed here if elements are removed */
        /* Keeping keyframes in case other elements use them, or they are added back */
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
