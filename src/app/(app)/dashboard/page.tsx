
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, BookOpen, Lightbulb, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || t('defaultSeekerName');

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">
          {t('welcomeMessage', { name: displayName })}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('dashboardSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="rounded-lg animated-aurora-background">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-serif">{t('newReadingCardTitle')}</CardTitle>
              <PlusCircle className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground mb-4">{t('newReadingCardDescription')}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/new-reading">{t('startNewReadingButton')}</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="rounded-lg animated-aurora-background">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-serif">{t('yourCreditsCardTitle')}</CardTitle>
              <CreditCard className="h-6 w-6 text-accent" />
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-4xl font-bold text-primary">10</div> {/* Placeholder */}
              <p className="text-xs text-muted-foreground mb-4">
                {t('creditsRemaining')}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/credits">{t('purchaseMoreCreditsButton')}</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="rounded-lg animated-aurora-background">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-serif">{t('helpfulTipsCardTitle')}</CardTitle>
              <Lightbulb className="h-6 w-6 text-yellow-500" />
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                <li>{t('tipFocusIntent')}</li>
                <li>{t('tipCleanseSpace')}</li>
                <li>{t('tipJournalReadings')}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold font-serif mb-4">{t('recentReadingsTitle')}</h2>
        <div className="rounded-lg animated-aurora-background">
          <Card className="shadow-lg relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-8">
                <BookOpen className="h-12 w-12 mb-4" />
                <p className="text-lg">{t('noRecentReadings')}</p>
                <p>{t('noRecentReadingsPrompt_start')}{' '}
                  <Link href="/new-reading" className="text-primary hover:underline font-semibold">
                    {t('noRecentReadingsPrompt_link')}
                  </Link>{' '}
                  {t('noRecentReadingsPrompt_end')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

       <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold font-serif mb-4">{t('discoverYourPathTitle')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            {t('discoverYourPathDescription')}
          </p>
          <div className="animated-aurora-background rounded-xl inline-block">
            <Image 
              src="https://placehold.co/800x400.png" 
              alt={t('discoverYourPathTitle')}
              data-ai-hint="tarot cards mystical" 
              width={800} 
              height={400} 
              className="rounded-lg shadow-xl mx-auto relative z-10" 
            />
          </div>
        </div>
    </div>
  );
}
