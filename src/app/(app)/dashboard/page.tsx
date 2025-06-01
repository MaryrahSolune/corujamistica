
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, BookOpen, Lightbulb, PlusCircle, BookMarked, Gift, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { getUserReadings, type ReadingData } from '@/services/readingService';
import { claimDailyGift } from '@/services/creditService';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow, formatDuration, intervalToDuration } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const GIFT_COOLDOWN_MILLISECONDS = 24 * 60 * 60 * 1000;
const DAILY_GIFT_AMOUNT = 1;

export default function DashboardPage() {
  const { currentUser, userCredits, refreshCredits } = useAuth();
  const { t, locale } = useLanguage();
  const { toast } = useToast();

  const [recentReadings, setRecentReadings] = useState<(ReadingData & { id: string })[]>([]);
  const [loadingReadings, setLoadingReadings] = useState(true);

  const [dailyGiftStatus, setDailyGiftStatus] = useState<{
    claimable: boolean;
    timeRemaining: string | null;
    cooldownEndTime: number | null;
  }>({ claimable: false, timeRemaining: null, cooldownEndTime: null });
  const [isClaimingGift, setIsClaimingGift] = useState(false);

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || t('defaultSeekerName');
  const getDateFnsLocale = () => (locale === 'pt-BR' ? ptBR : enUS);

  const updateDailyGiftStatus = useCallback(() => {
    if (userCredits) {
      const lastClaimTimestamp = userCredits.lastDailyGiftClaimTimestamp ? Number(userCredits.lastDailyGiftClaimTimestamp) : 0;
      const now = Date.now();
      
      if (!lastClaimTimestamp || (now - lastClaimTimestamp >= GIFT_COOLDOWN_MILLISECONDS)) {
        setDailyGiftStatus({ claimable: true, timeRemaining: null, cooldownEndTime: null });
      } else {
        const endTime = lastClaimTimestamp + GIFT_COOLDOWN_MILLISECONDS;
        const duration = intervalToDuration({ start: now, end: endTime });
        const formattedTime = formatDuration(duration, { 
          locale: getDateFnsLocale(),
          format: ['hours', 'minutes', 'seconds'] 
        });
        setDailyGiftStatus({ claimable: false, timeRemaining: formattedTime, cooldownEndTime: endTime });
      }
    }
  }, [userCredits, locale]);

  useEffect(() => {
    if (currentUser?.uid) {
      setLoadingReadings(true);
      getUserReadings(currentUser.uid, 3)
        .then(readings => setRecentReadings(readings))
        .catch(error => console.error("Error fetching recent readings:", error))
        .finally(() => setLoadingReadings(false));
    } else {
      setLoadingReadings(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    updateDailyGiftStatus();
    // Set up an interval to update the countdown timer
    const intervalId = setInterval(() => {
      if (dailyGiftStatus.cooldownEndTime && Date.now() < dailyGiftStatus.cooldownEndTime) {
        updateDailyGiftStatus();
      } else if (dailyGiftStatus.cooldownEndTime && Date.now() >= dailyGiftStatus.cooldownEndTime) {
        // Cooldown finished, make it claimable
        setDailyGiftStatus({ claimable: true, timeRemaining: null, cooldownEndTime: null });
      }
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [userCredits, updateDailyGiftStatus, dailyGiftStatus.cooldownEndTime]);


  const handleClaimDailyGift = async () => {
    if (!currentUser?.uid || !dailyGiftStatus.claimable) return;
    setIsClaimingGift(true);
    try {
      const result = await claimDailyGift(currentUser.uid);
      if (result.success) {
        toast({ title: t('dailyGiftSuccessToastTitle'), description: t('dailyGiftSuccessToastDescription', { count: String(DAILY_GIFT_AMOUNT) }) });
        refreshCredits(); // This will trigger userCredits update and then updateDailyGiftStatus
      } else {
        toast({ 
          title: t('dailyGiftErrorToastTitle'), 
          description: result.message === "Daily gift is still on cooldown." && result.cooldownEndTime ? 
                       t('dailyGiftCooldownError', { time: formatDuration(intervalToDuration({ start: Date.now(), end: result.cooldownEndTime }), { locale: getDateFnsLocale(), format: ['hours', 'minutes']}) }) :
                       t('dailyGiftGenericError'), 
          variant: 'destructive' 
        });
        // If claim failed due to cooldown, ensure status is updated
        if (result.message === "Daily gift is still on cooldown." && result.cooldownEndTime) {
            const now = Date.now();
            const duration = intervalToDuration({ start: now, end: result.cooldownEndTime });
            const formattedTime = formatDuration(duration, { locale: getDateFnsLocale(), format: ['hours', 'minutes', 'seconds'] });
            setDailyGiftStatus({ claimable: false, timeRemaining: formattedTime, cooldownEndTime: result.cooldownEndTime });
        }
      }
    } catch (error) {
      toast({ title: t('dailyGiftErrorToastTitle'), description: t('dailyGiftGenericError'), variant: 'destructive' });
      console.error("Error claiming daily gift:", error);
    } finally {
      setIsClaimingGift(false);
    }
  };

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
        {/* New Reading Card */}
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
        
        {/* Credits Card */}
        <div className="rounded-lg animated-aurora-background">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-serif">{t('yourCreditsCardTitle')}</CardTitle>
              <CreditCard className="h-6 w-6 text-accent" />
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-4xl font-bold text-primary">
                {userCredits !== null ? userCredits.balance : <Skeleton className="h-10 w-16 inline-block" />}
              </div>
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

        {/* Daily Gift Card - NEW */}
        <div className="rounded-lg animated-aurora-background">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-serif">{t('dailyGiftTitle')}</CardTitle>
              <Gift className="h-6 w-6 text-green-500" />
            </CardHeader>
            <CardContent className="flex-grow text-center">
              {userCredits === null ? (
                <Skeleton className="h-8 w-3/4 mx-auto my-4" />
              ) : dailyGiftStatus.claimable ? (
                <p className="text-muted-foreground my-4">{t('claimYourDailyGift', { count: String(DAILY_GIFT_AMOUNT) })}</p>
              ) : dailyGiftStatus.timeRemaining ? (
                <>
                  <p className="text-muted-foreground mt-2 mb-1">{t('dailyGiftClaimed')}</p>
                  <p className="text-sm text-primary font-semibold">{t('nextGiftIn')} {dailyGiftStatus.timeRemaining}</p>
                </>
              ) : (
                 <p className="text-muted-foreground my-4">{t('dailyGiftClaimed')} {t('comeBackTomorrow')}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleClaimDailyGift} 
                className="w-full"
                disabled={!dailyGiftStatus.claimable || isClaimingGift || userCredits === null}
              >
                {isClaimingGift ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('claimingButton')}
                  </>
                ) : (
                  t('claimNowButton')
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Recent Readings Section */}
      <div>
        <h2 className="text-2xl font-bold font-serif mb-4">{t('recentReadingsTitle')}</h2>
        <div className="rounded-lg animated-aurora-background">
          <Card className="shadow-lg relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md">
            <CardContent className="pt-6">
              {loadingReadings ? (
                <div className="space-y-4 py-8">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="border-b border-border/50 pb-4 last:border-b-0 last:pb-0">
                      <Skeleton className="h-5 w-3/5 mb-1" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  ))}
                </div>
              ) : recentReadings.length > 0 ? (
                <ul className="space-y-4">
                  {recentReadings.map(reading => (
                    <li key={reading.id} className="border-b border-border/50 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-primary flex items-center">
                          <BookMarked className="h-5 w-5 mr-2" />
                          {reading.type === 'tarot' ? (reading.query.substring(0, 50) + (reading.query.length > 50 ? '...' : '')) : (reading.dreamDescription.substring(0,50) + (reading.dreamDescription.length > 50 ? '...' : ''))}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {typeof reading.interpretationTimestamp === 'number' ? formatDistanceToNow(new Date(reading.interpretationTimestamp), { addSuffix: true, locale: getDateFnsLocale() }) : 'Recent'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {reading.type === 'tarot' ? t('tarotReadingType') : t('dreamInterpretationType')}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Discover Your Path Image Section */}
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
