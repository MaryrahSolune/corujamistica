'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateYidam, type GenerateYidamOutput } from '@/ai/flows/generate-yidams-flow';
import { Loader2, HeartHandshake, Sparkles, Hand } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { deductCredit } from '@/services/creditService';
import { saveReading, type ReadingData } from '@/services/readingService';

export default function YidamsPage() {
  const [birthDate, setBirthDate] = useState('');
  const [result, setResult] = useState<GenerateYidamOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currentUser, userCredits, refreshCredits } = useAuth();

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
    if (value.length > 8) {
      value = value.slice(0, 8); // Limit to 8 digits (DDMMYYYY)
    }

    if (value.length > 4) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    } else if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setBirthDate(value);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!currentUser) {
      toast({ title: t('authErrorTitle'), description: t('mustBeLoggedInToRead'), variant: 'destructive' });
      return;
    }
    if (!userCredits || userCredits.balance < 1) {
      toast({ title: t('insufficientCreditsTitle'), description: t('insufficientCreditsDescription'), variant: 'destructive' });
      return;
    }
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate)) {
      toast({ title: t('errorGenericTitle'), description: t('yidamsErrorDate'), variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const deductResult = await deductCredit(currentUser.uid);
      if (!deductResult.success) {
        throw new Error(deductResult.message || t('creditDeductionFailedError'));
      }
      refreshCredits();

      const yidamResult = await generateYidam({ birthDate });
      setResult(yidamResult);

      const readingToSave: Omit<ReadingData, 'interpretationTimestamp'> = {
        type: 'yidams',
        query: `Yidam for ${birthDate}`,
        deityName: yidamResult.deityName,
        mantra: yidamResult.mantra,
        characteristics: yidamResult.characteristics,
        mudra: yidamResult.mudra,
        yidamImageUri: yidamResult.imageUri,
      };
      await saveReading(currentUser.uid, readingToSave);
      
      toast({ title: t('yidamsSuccessToast') });
    } catch (err: any) {
      console.error('Error generating Yidam:', err);
      const errorMessage = err.message || t('yidamsErrorGenerating');
      setError(errorMessage);
      toast({ title: t('errorGenericTitle'), description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto animated-aurora-background rounded-xl mb-8">
        <Card className="relative z-10 bg-card/90 dark:bg-card/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-serif flex items-center">
              <HeartHandshake className="h-8 w-8 mr-3 text-primary" />
              {t('yidamsPageTitle')}
            </CardTitle>
            <CardDescription>
              {t('yidamsPageDescription')} {userCredits && t('creditsAvailable', { count: userCredits.balance })}
            </CardDescription>
          </CardHeader>
          {!result && (
            <form onSubmit={handleSubmit}>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="birth-date" className="text-lg">{t('yidamsBirthDateLabel')}</Label>
                  <Input
                    id="birth-date"
                    value={birthDate}
                    onChange={handleDateChange}
                    placeholder={t('yidamsBirthDatePlaceholder')}
                    disabled={isLoading}
                    maxLength={10}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full text-lg py-6" 
                  disabled={isLoading || !birthDate || !/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate) || (userCredits && userCredits.balance < 1)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t('yidamsRevealingButton')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      {t('yidamsRevealButton')}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mt-8 animated-aurora-background rounded-lg">
          <Card className="relative z-10 bg-destructive/80 dark:bg-destructive/70 backdrop-blur-md shadow-lg border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive-foreground font-serif">{t('errorOccurredCardTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {result && !isLoading && (
        <div className="max-w-2xl mx-auto mt-8 animated-aurora-background rounded-lg">
          <Card className="shadow-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 backdrop-blur-md relative z-10">
            <CardHeader>
              <CardTitle className="text-2xl font-serif flex items-center">
                <Sparkles className="h-7 w-7 mr-3 text-accent" />
                {t('yidamsResultTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground">{t('yidamsYourDeityIs')}</p>
                <p className="text-3xl font-bold text-primary font-serif">{result.deityName}</p>
              </div>

              {result.imageUri && (
                <div className="animated-aurora-background rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={result.imageUri}
                    alt={t('yidamsImageAlt', { name: result.deityName })}
                    data-ai-hint="deity thangka painting"
                    width={512}
                    height={512}
                    className="w-full h-auto object-contain relative z-10 bg-black/10"
                  />
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-bold font-serif mb-2 text-accent">{t('yidamsMantraLabel')}</h3>
                <blockquote className="border-l-4 border-accent pl-4 italic text-foreground/80 text-lg">
                  {result.mantra}
                </blockquote>
              </div>
              
              <div>
                <h3 className="text-xl font-bold font-serif mb-2 text-accent">{t('yidamsCharacteristicsLabel')}</h3>
                <p className="prose-base lg:prose-lg dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed text-justify">
                  {result.characteristics}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold font-serif mb-2 text-accent flex items-center">
                  <Hand className="mr-2 h-5 w-5" /> Mudra de Conexão
                </h3>
                <p className="prose-base lg:prose-lg dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed text-justify">
                  {result.mudra}
                </p>
              </div>

            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
