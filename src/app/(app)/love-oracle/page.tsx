
'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { consultLoveOracle, type LoveOracleInput, type LoveOracleOutput } from '@/ai/flows/love-oracle-flow';
import { Loader2, HeartHandshake, BookHeart, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { deductCredit } from '@/services/creditService';
import { saveReading, type LoveOracleReadingData } from '@/services/readingService'; // Adjust type import
import type { ProcessedStorySegment } from '@/ai/flows/interpret-dream-flow'; // Reusing this type

export default function LoveOraclePage() {
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [adviceSegments, setAdviceSegments] = useState<ProcessedStorySegment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currentUser, userCredits, refreshCredits } = useAuth();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!currentUser) {
      toast({ title: t('authErrorTitle'), description: t('mustBeLoggedInToConsultOracle'), variant: 'destructive' });
      return;
    }
    if (!userCredits || userCredits.balance < 1) {
      toast({ title: t('insufficientCreditsTitle'), description: t('insufficientCreditsForOracleDescription'), variant: 'destructive' });
      return;
    }
    if (problemDescription.trim().length < 20) {
      toast({ title: t('errorGenericTitle'), description: t('loveProblemTooShortError'), variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setAdviceSegments([]);
    setError(null);

    try {
      const deductResult = await deductCredit(currentUser.uid);
      if (!deductResult.success) {
        throw new Error(deductResult.message || t('creditDeductionFailedError'));
      }
      refreshCredits();

      const input: LoveOracleInput = { problemDescription };
      const result = await consultLoveOracle(input);
      setAdviceSegments(result || []);

      if (result && result.length > 0) {
        const adviceToSave: Omit<LoveOracleReadingData, 'interpretationTimestamp'> = {
          type: 'loveOracle',
          problemDescription: problemDescription,
          adviceSegments: result,
        };
        await saveReading(currentUser.uid, adviceToSave);
      }
      
      toast({ title: t('loveOracleReadyTitle'), description: t('loveOracleReadyDescription') });
    } catch (err: any) {
      console.error('Erro ao consultar Oráculo do Amor:', err);
      const errorMessage = err.message || t('errorGeneratingLoveAdviceDescription');
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
              {t('loveOracleTitle')}
            </CardTitle>
            <CardDescription>
              {t('loveOracleDescription')} {userCredits && t('creditsAvailable', {count: userCredits.balance})}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="problem-description" className="text-lg">{t('yourLoveProblemLabel')}</Label>
                <Textarea
                  id="problem-description"
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder={t('loveProblemPlaceholder')}
                  rows={7}
                  className="resize-none"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full text-lg py-6" 
                disabled={
                  isLoading || 
                  problemDescription.trim().length < 20 ||
                  (userCredits && userCredits.balance < 1)
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('consultingOracleButton')}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    {t('getLoveAdviceButton')}
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {error && (
         <div className="max-w-2xl mx-auto mt-8 animated-aurora-background rounded-lg">
          <Card className="relative z-10 bg-destructive/80 dark:bg-destructive/70 backdrop-blur-sm shadow-lg border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive-foreground font-serif">{t('errorOccurredCardTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {adviceSegments.length > 0 && !isLoading && (
        <div className="max-w-2xl mx-auto mt-8 animated-aurora-background rounded-lg">
          <Card className="shadow-2xl bg-gradient-to-br from-pink-500/20 via-transparent to-red-500/20 dark:from-pink-400/30 dark:to-red-400/30 backdrop-blur-md relative z-10">
            <CardHeader>
              <CardTitle className="text-2xl font-serif flex items-center">
                <BookHeart className="h-7 w-7 mr-3 text-red-500 dark:text-red-400" />
                {t('loveOracleAdviceTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {adviceSegments.map((segment, index) => (
                <div key={index}>
                  {segment.type === 'text' && segment.content && (
                    <p className="prose-base lg:prose-lg dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed text-justify">
                      {segment.content}
                    </p>
                  )}
                  {segment.type === 'image' && segment.dataUri && (
                    <div className="my-4 rounded-lg overflow-hidden shadow-lg animated-aurora-background">
                      <Image
                        src={segment.dataUri}
                        alt={t('loveOracleImageAlt', { number: index + 1 }) + `: ${segment.alt || 'Visualização do conselho'}`}
                        width={500} 
                        height={300}
                        className="w-full h-auto object-contain relative z-10 bg-black/10"
                        data-ai-hint="love advice symbolic"
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
