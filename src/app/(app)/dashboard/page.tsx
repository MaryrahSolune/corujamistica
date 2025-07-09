
'use client';

import { useEffect, useState, useCallback, type ComponentType } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, BookOpen, Lightbulb, PlusCircle, BookMarked, Gift, Loader2, Eye, BrainCircuit, LogOut, CheckCircle2, Lock } from 'lucide-react';
import { 
  Gem, Sparkles, Moon, Sun, Star, Crown, Feather, Key, Scroll, 
  BrainCircuit as BrainIcon, Shield, Pyramid, Infinity as InfinityIcon, Hexagon, Flower, Flame, Leaf, 
  Cat, Bird, Bot, Cloud, Dna, Fish, Ghost, Grape, Zap, Pentagon, Rainbow, Heart 
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage, type TranslationKey } from '@/contexts/LanguageContext';
import { getUserReadings, type ReadingData } from '@/services/readingService';
import { claimDailyReward } from '@/services/creditService';
import { getRewardCycle, type DailyReward } from '@/services/rewardService';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow, formatDuration, intervalToDuration } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const GIFT_COOLDOWN_MILLISECONDS = 24 * 60 * 60 * 1000;

const iconMap: { [key: string]: ComponentType<{ className?: string }> } = {
  Gem, Sparkles, Moon, Sun, Star, Crown, Feather, Key, Scroll, Eye, 
  BrainCircuit: BrainIcon, Shield, Pyramid, Infinity: InfinityIcon, Hexagon, Flower, Flame, Leaf, 
  Cat, Bird, Bot, Cloud, Dna, Fish, Ghost, Grape, Zap, Pentagon, Rainbow, Heart, Gift
};

export default function DashboardPage() {
  const { currentUser, userProfile, userCredits, refreshCredits, logout, refreshUserProfile } = useAuth();
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();

  const [recentReadings, setRecentReadings] = useState<(ReadingData & { id: string })[]>([]);
  const [loadingReadings, setLoadingReadings] = useState(true);

  const [rewardCycle, setRewardCycle] = useState<DailyReward[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(true);
  
  const [dailyRewardStatus, setDailyRewardStatus] = useState<{
    claimable: boolean;
    timeRemaining: string | null;
    cooldownEndTime: number | null;
  }>({ claimable: false, timeRemaining: null, cooldownEndTime: null });
  const [isClaimingReward, setIsClaimingReward] = useState(false);

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || t('defaultSeekerName');
  const dateFnsLocale = locale === 'pt-BR' ? ptBR : enUS;

  const updateDailyRewardStatus = useCallback(() => {
    if (userProfile) {
      const lastClaimTimestamp = userProfile.lastClaimTimestamp || 0;
      const now = Date.now();
      
      if (!lastClaimTimestamp || (now - lastClaimTimestamp >= GIFT_COOLDOWN_MILLISECONDS)) {
        setDailyRewardStatus({ claimable: true, timeRemaining: null, cooldownEndTime: null });
      } else {
        const endTime = lastClaimTimestamp + GIFT_COOLDOWN_MILLISECONDS;
        const duration = intervalToDuration({ start: now, end: endTime });
        const formattedTime = formatDuration(duration, { 
          locale: dateFnsLocale,
          format: ['hours', 'minutes', 'seconds'] 
        });
        setDailyRewardStatus({ claimable: false, timeRemaining: formattedTime, cooldownEndTime: endTime });
      }
    }
  }, [userProfile, dateFnsLocale]);

  useEffect(() => {
    if (currentUser?.uid) {
      setLoadingReadings(true);
      getUserReadings(currentUser.uid, 3)
        .then(readings => setRecentReadings(readings))
        .catch(error => console.error("Error fetching recent readings:", error))
        .finally(() => setLoadingReadings(false));
      
      setLoadingRewards(true);
      getRewardCycle()
        .then(cycle => setRewardCycle(cycle))
        .catch(error => console.error("Error fetching reward cycle:", error))
        .finally(() => setLoadingRewards(false));
    } else {
      setLoadingReadings(false);
      setLoadingRewards(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    updateDailyRewardStatus();
    const intervalId = setInterval(() => {
      if (dailyRewardStatus.cooldownEndTime && Date.now() < dailyRewardStatus.cooldownEndTime) {
        updateDailyRewardStatus();
      } else if (dailyRewardStatus.cooldownEndTime && Date.now() >= dailyRewardStatus.cooldownEndTime) {
        setDailyRewardStatus({ claimable: true, timeRemaining: null, cooldownEndTime: null });
      }
    }, 1000); 

    return () => clearInterval(intervalId); 
  }, [userProfile, updateDailyRewardStatus, dailyRewardStatus.cooldownEndTime]);


  const handleClaimDailyReward = async () => {
    if (!currentUser?.uid || !dailyRewardStatus.claimable) return;
    setIsClaimingReward(true);
    try {
      const result = await claimDailyReward(currentUser.uid);
      if (result.success && result.reward) {
        const rewardText = `${result.reward.value} ${t(result.reward.type as TranslationKey)}`;
        toast({ title: t('rewardClaimedSuccessTitle'), description: t('rewardClaimedSuccessDescription', { reward: rewardText }) });
        refreshCredits(); 
        refreshUserProfile();
      } else {
        toast({ 
          title: t('rewardClaimErrorTitle'), 
          description: result.cooldownEndTime ? t('rewardClaimErrorCooldown') : t('rewardClaimErrorGeneric'), 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ title: t('rewardClaimErrorTitle'), description: t('rewardClaimErrorGeneric'), variant: 'destructive' });
      console.error("Error claiming daily reward:", error);
    } finally {
      setIsClaimingReward(false);
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

  const currentStreak = userProfile?.dailyRewardStreak || 0;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">
          <span>{t('welcomeMessage', { name: displayName })}</span>
        </h1>
        <p className="text-lg text-muted-foreground font-semibold">
          {t('dashboardSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column for Actions */}
        <div className="lg:col-span-1 space-y-6">
            <div className="rounded-lg animated-aurora-background">
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-serif">{t('newReadingCardTitle')}</CardTitle>
                  <PlusCircle className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground mb-4 font-medium">{t('newReadingCardDescription')}</p>
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
                  <p className="text-muted-foreground mb-4 font-medium">{t('dreamInterpretationCardDescription')}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/dream-interpretation"><span>{t('interpretDreamButton')}</span></Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
        </div>

        {/* Right Column for Credits and Rewards */}
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <p className="text-xs text-muted-foreground mb-4 font-medium">
                        {t('creditsRemaining')}
                    </p>
                    </CardContent>
                    <CardFooter>
                    <Button variant="mystic-glow" asChild className="w-full">
                        <Link href="/credits"><span>{t('purchaseMoreCreditsButton')}</span></Link>
                    </Button>
                    </CardFooter>
                </Card>
                </div>
            </div>
            
            {/* Reward Calendar */}
            <div className="rounded-lg animated-aurora-background">
                <Card className="shadow-lg relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-xl font-serif flex items-center"><Gift className="mr-2 h-6 w-6 text-primary"/>{t('dailyRewardsTitle')}</CardTitle>
                        <CardDescription>{t('dailyRewardsSubtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingRewards || !userProfile ? (
                            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                                {Array.from({length: 30}).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-md" />)}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                                {rewardCycle.map((reward, index) => {
                                    const isClaimed = index < currentStreak;
                                    const isClaimable = index === currentStreak && dailyRewardStatus.claimable;
                                    const isLocked = index > currentStreak;
                                    const IconComponent = iconMap[reward.iconName] || Gift;
                                    const isUpgradePreviewDay = [7, 14, 21].includes(reward.day);

                                    return (
                                        <div 
                                          key={reward.day} 
                                          className={cn("relative p-2 border rounded-md flex flex-col items-center justify-center aspect-square transition-all",
                                            isClaimed && "bg-primary/20 border-primary/30",
                                            isClaimable && "border-primary border-2 shadow-lg shadow-primary/50",
                                            isLocked && "bg-muted/50 border-border/50 opacity-60",
                                            isClaimable && !isClaimingReward && "cursor-pointer hover:scale-105 hover:shadow-accent/50",
                                            isClaimable && isClaimingReward && "cursor-wait"
                                          )}
                                          onClick={isClaimable && !isClaimingReward ? handleClaimDailyReward : undefined}
                                        >
                                            {isUpgradePreviewDay && !isClaimed && (
                                                <div className="absolute -top-2.5 -right-2.5 bg-accent text-accent-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg z-10 transform rotate-12 animate-subtle-pulse">
                                                    +VALOR
                                                </div>
                                            )}
                                            {isClaimingReward && isClaimable && (
                                              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-md">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                              </div>
                                            )}
                                            <p className="text-xs font-bold text-center absolute top-1 right-1">{reward.day}</p>
                                            <div className="flex-grow flex items-center justify-center">
                                                <IconComponent className={cn("h-8 w-8", isLocked ? "opacity-50" : "animate-icon-flow", isClaimable && "animate-subtle-pulse")} />
                                            </div>
                                            {isClaimed && <CheckCircle2 className="absolute bottom-1 right-1 h-4 w-4 text-green-500"/>}
                                            {isLocked && <Lock className="absolute bottom-1 right-1 h-3 w-3 text-muted-foreground"/>}
                                        </div>
                                    )
                                })}
                                </div>
                                <div className='text-center text-sm text-muted-foreground font-semibold h-5'>
                                  {dailyRewardStatus.claimable ? (
                                        `${t('claimRewardButton')} - ${t('dayLabel', {day: currentStreak + 1})}`
                                    ) : (
                                        `${t('comeBackIn', {time: dailyRewardStatus.timeRemaining || '...'})}`
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

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
                            <h3 className="text-lg font-bold text-primary flex items-center">
                            <BookMarked className="h-5 w-5 mr-2 flex-shrink-0" />
                            <span className="truncate">
                                {getReadingTitle(reading)}
                            </span>
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 ml-7 font-medium">
                              {getReadingTypeTranslation(reading.type)}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
                            <span className="text-xs text-muted-foreground whitespace-nowrap self-end sm:self-center">
                                {typeof reading.interpretationTimestamp === 'number' ? formatDistanceToNow(new Date(reading.interpretationTimestamp), { addSuffix: true, locale: dateFnsLocale }) : 'Recent'}
                            </span>
                            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                                <Link href={`/reading/${reading.id}`}>
                                    <span className="inline-flex items-center">
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
                  <p className="text-lg font-semibold">{t('noRecentReadings')}</p>
                  <p className="font-medium">{t('noRecentReadingsPrompt_start')}{' '}
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
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6 font-semibold">
            {t('discoverYourPathDescription')}
          </p>
          <div className="animated-aurora-background rounded-xl inline-block">
            <Image 
              src="/img/cartas.gif" 
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
