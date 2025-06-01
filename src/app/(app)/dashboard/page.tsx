
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, BookOpen, Lightbulb, PlusCircle, BookMarked, Gift, Loader2, Eye, BrainCircuit, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { getUserReadings, type ReadingData } from '@/services/readingService';
import { claimDailyGift } from '@/services/creditService';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow, formatDuration, intervalToDuration } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const GIFT_COOLDOWN_MILLISECONDS = 24 * 60 * 60 * 1000;
const DAILY_GIFT_AMOUNT = 1;

export default function DashboardPage() {
  const { currentUser, userCredits, refreshCredits, logout } = useAuth();
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();

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
  }, [userCredits, locale]); // Added locale to dependencies

  useEffect(() => {
    if (currentUser?.uid) {
      setLoadingReadings(true);
      getUserReadings(currentUser.uid, 3) // Fetch 3 most recent readings
        .then(readings => setRecentReadings(readings))
        .catch(error => console.error("Error fetching recent readings:", error))
        .finally(() => setLoadingReadings(false));
    } else {
      setLoadingReadings(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    updateDailyGiftStatus();
    const intervalId = setInterval(() => {
      if (dailyGiftStatus.cooldownEndTime && Date.now() < dailyGiftStatus.cooldownEndTime) {
        updateDailyGiftStatus();
      } else if (dailyGiftStatus.cooldownEndTime && Date.now() >= dailyGiftStatus.cooldownEndTime) {
        setDailyGiftStatus({ claimable: true, timeRemaining: null, cooldownEndTime: null });
      }
    }, 1000); 

    return () => clearInterval(intervalId); 
  }, [userCredits, updateDailyGiftStatus, dailyGiftStatus.cooldownEndTime]);


  const handleClaimDailyGift = async () => {
    if (!currentUser?.uid || !dailyGiftStatus.claimable) return;
    setIsClaimingGift(true);
    try {
      const result = await claimDailyGift(currentUser.uid);
      if (result.success) {
        toast({ title: t('dailyGiftSuccessToastTitle'), description: t('dailyGiftSuccessToastDescription', { count: String(DAILY_GIFT_AMOUNT) }) });
        refreshCredits(); 
      } else {
        toast({ 
          title: t('dailyGiftErrorToastTitle'), 
          description: result.message === "Daily gift is still on cooldown." && result.cooldownEndTime ? 
                       t('dailyGiftCooldownError', { time: formatDuration(intervalToDuration({ start: Date.now(), end: result.cooldownEndTime }), { locale: getDateFnsLocale(), format: ['hours', 'minutes']}) }) :
                       t('dailyGiftGenericError'), 
          variant: 'destructive' 
        });
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

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  const getReadingTitle = (reading: ReadingData) => {
    const maxLength = 40;
    let title = '';
    if (reading.type === 'tarot') title = reading.query;
    else if (reading.type === 'dream') title = reading.dreamDescription;
    
    return title.substring(0, maxLength) + (title.length > maxLength ? '...' : '');
  };

  const getReadingTypeTranslation = (type: ReadingData['type']) => {
    if (type === 'tarot') return t('tarotReadingType');
    if (type === 'dream') return t('dreamInterpretationType');
    return 'Leitura';
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">
          <span>{t('welcomeMessage', { name: displayName })}</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('dashboardSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
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
                <Link href="/new-reading"><span>{t('startNewReadingButton')}</span></Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="rounded-lg animated-aurora-background">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-serif">{t('dreamInterpretation')}</CardTitle>
              <BrainCircuit className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground mb-4">{t('dreamInterpretationCardDescription')}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/dream-interpretation"><span>{t('interpretDreamButton')}</span></Link>
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
              <div className="text-4xl font-bold text-primary">
                {userCredits !== null ? userCredits.balance : <Skeleton className="h-10 w-16 inline-block" />}
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                {t('creditsRemaining')}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/credits"><span>{t('purchaseMoreCreditsButton')}</span></Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="rounded-lg animated-aurora-background md:col-span-2 lg:col-span-1">
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
                  <span className="inline-flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('claimingButton')}
                  </span>
                ) : (
                  <span>{t('claimNowButton')}</span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold font-serif mb-4">{t('recentReadingsTitle')}</h2>
        <div className="rounded-lg animated-aurora-background">
          <Card className="shadow-lg relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md">
            <CardContent className="pt-6">
              {loadingReadings ? (
                <div className="space-y-6 py-8">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="border-b border-border/50 pb-4 last:border-b-0 last:pb-0 animate-pulse">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-3/5 mb-1" />
                            <Skeleton className="h-4 w-1/6" />
                        </div>
                        <Skeleton className="h-4 w-1/4 mt-1" />
                        <Skeleton className="h-8 w-24 mt-3 ml-auto" />
                    </div>
                  ))}
                </div>
              ) : recentReadings.length > 0 ? (
                <ul className="space-y-6">
                  {recentReadings.map(reading => (
                    <li key={reading.id} className="border-b border-border/50 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div className="flex-grow mb-2 sm:mb-0">
                            <h3 className="text-lg font-semibold text-primary flex items-center">
                            <BookMarked className="h-5 w-5 mr-2 flex-shrink-0" />
                            <span className="truncate">
                                {getReadingTitle(reading)}
                            </span>
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 ml-7">
                              {getReadingTypeTranslation(reading.type)}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
                            <span className="text-xs text-muted-foreground whitespace-nowrap self-end sm:self-center">
                                {typeof reading.interpretationTimestamp === 'number' ? formatDistanceToNow(new Date(reading.interpretationTimestamp), { addSuffix: true, locale: getDateFnsLocale() }) : 'Recent'}
                            </span>
                            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                                <Link href={`/reading/${reading.id}`}>
                                    <span>
                                        <Eye className="mr-2 h-4 w-4" /> {t('viewReadingButton')}
                                    </span>
                                </Link>
                            </Button>
                        </div>
                      </div>
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

       <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold font-serif mb-4">{t('discoverYourPathTitle')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            {t('discoverYourPathDescription')}
          </p>
          <div className="animated-aurora-background rounded-xl inline-block">
            <Image 
              src="/img/shiva.gif" 
              alt={t('discoverYourPathTitle')}
              data-ai-hint="shiva animation meditation" 
              width={800} 
              height={400} 
              className="rounded-lg shadow-xl mx-auto relative z-10"
              unoptimized={true}
            />
          </div>
        </div>
      
      <div className="mt-16 mb-8 text-center">
        <Button variant="outline" onClick={handleLogout} size="lg">
          <LogOut className="mr-2 h-5 w-5" />
          <span>{t('logout')}</span>
        </Button>
      </div>
    </div>
  );
}
