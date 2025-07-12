
'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { interpretOghamReading, type InterpretOghamReadingOutput } from '@/ai/flows/interpret-ogham-reading';
import { Loader2, BookOpenText, Leaf } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { deductCredit } from '@/services/creditService';
import { saveReading, type ReadingData } from '@/services/readingService';
import { OghamIcon } from '@/components/MysticIcons';
import { AdSlot } from '@/components/AdSlot';
import { cn } from '@/lib/utils';

const LeafyBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden">
        {/* A few large, strategically placed leaves with a more visible color */}
        <Leaf className="absolute top-[10%] left-[5%] h-24 w-24 text-green-400 animate-leaf-fade" style={{ animationDelay: '0s', transform: 'rotate(-20deg)' }} />
        <Leaf className="absolute top-[20%] right-[10%] h-32 w-32 text-green-400 animate-leaf-fade" style={{ animationDelay: '2s', transform: 'rotate(15deg)' }} />
        <Leaf className="absolute bottom-[15%] left-[15%] h-28 w-28 text-green-400 animate-leaf-fade" style={{ animationDelay: '4s', transform: 'rotate(30deg)' }} />
        <Leaf className="absolute bottom-[5%] right-[20%] h-36 w-36 text-green-400 animate-leaf-fade" style={{ animationDelay: '6s', transform: 'rotate(-10deg)' }} />
        <Leaf className="absolute top-[40%] left-[45%] h-20 w-20 text-green-400 animate-leaf-fade" style={{ animationDelay: '1s' }} />
    </div>
);

const VineFrame = () => (
    <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Top-left vine */}
        <Leaf className="absolute -top-2 -left-3 h-10 w-10 text-green-400 -rotate-45" />
        <Leaf className="absolute top-8 -left-5 h-8 w-8 text-green-400 -rotate-[60deg]" />
        <Leaf className="absolute top-20 -left-2 h-10 w-10 text-green-400 -rotate-[75deg]" />

        {/* Top-right vine */}
        <Leaf className="absolute -top-3 -right-2 h-10 w-10 text-green-400 rotate-45" />
        <Leaf className="absolute top-10 -right-4 h-8 w-8 text-green-400 rotate-[60deg]" />
        
        {/* Bottom-left vine */}
        <Leaf className="absolute -bottom-2 -left-2 h-12 w-12 text-green-400 -rotate-[120deg]" />
        <Leaf className="absolute bottom-16 -left-4 h-8 w-8 text-green-400 -rotate-[100deg]" />

        {/* Bottom-right vine */}
        <Leaf className="absolute -bottom-4 -right-3 h-12 w-12 text-green-400 rotate-[120deg]" />
        <Leaf className="absolute bottom-20 -right-2 h-8 w-8 text-green-400 rotate-[100deg]" />
        <Leaf className="absolute bottom-36 -right-1 h-6 w-6 text-green-400 rotate-[80deg]" />
    </div>
);


export default function OghamPage() {
  const [query, setQuery] = useState<string>('');
  const [interpretationResult, setInterpretationResult] = useState<InterpretOghamReadingOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currentUser, userCredits, refreshCredits } = useAuth();

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
    if (!query.trim()) {
      toast({ title: t('noQueryErrorTitle'), description: t('noQueryErrorDescription'), variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setInterpretationResult(null);
    setError(null);

    try {
      const deductResult = await deductCredit(currentUser.uid);
      if (!deductResult.success) {
        throw new Error(deductResult.message || t('creditDeductionFailedError'));
      }
      refreshCredits();

      const result = await interpretOghamReading({ query });
      setInterpretationResult(result);

      if (result && result.interpretation) {
        const readingToSave: Omit<ReadingData, 'interpretationTimestamp'> = {
          type: 'ogham',
          query: query,
          interpretationText: result.interpretation,
          oghamLetter: result.oghamLetter,
          oghamSymbol: result.oghamSymbol,
          treeImageUri: result.treeImageUri,
        };
        await saveReading(currentUser.uid, readingToSave);
      }
      
      toast({ title: t('interpretationReadyTitle'), description: t('interpretationReadyDescription') });
    } catch (err: any) {
      console.error('Error interpreting Ogham reading:', err);
      const errorMessage = err.message || t('errorGeneratingInterpretationDescription');
      setError(errorMessage);
      toast({ title: t('errorGenericTitle'), description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">

        <div className="max-w-2xl mx-auto animated-aurora-background rounded-xl mb-8">
          <Card className="relative z-10 bg-card/90 dark:bg-card/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-serif flex items-center">
                <OghamIcon className="h-8 w-8 mr-3 text-primary" />
                {t('oghamOraclePageTitle')}
              </CardTitle>
              <CardDescription>
                {t('oghamOraclePageDescription')} {userCredits && t('creditsAvailable', { count: userCredits.balance })}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="query" className="text-lg">{t('yourQuestionLabel')}</Label>
                  <Textarea
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('questionPlaceholder')}
                    rows={4}
                    className="resize-none"
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit"
                  className="w-full text-lg py-6"
                  disabled={isLoading || !query.trim() || (userCredits && userCredits.balance < 1)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t('generatingOghamReadingButton')}
                    </>
                  ) : (
                    <>
                      <OghamIcon className="mr-2 h-5 w-5" />
                      {t('getYourOghamReadingButton')}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
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
        
        {interpretationResult && !isLoading && (
          <div className="max-w-2xl mx-auto mt-8 animated-aurora-background rounded-lg">
            <Card className="shadow-2xl bg-gradient-to-br from-accent/20 via-transparent to-secondary/20 backdrop-blur-md relative z-10">
              <CardHeader>
                <CardTitle className="text-2xl font-serif flex items-center">
                  <BookOpenText className="h-7 w-7 mr-3 text-accent" />
                  {t('oghamInterpretationTitle')}
                </CardTitle>
                <CardDescription className="text-lg text-accent-foreground font-semibold">
                  Sua letra sorteada: {interpretationResult.oghamLetter} ({interpretationResult.oghamSymbol})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {interpretationResult.treeImageUri && (
                  <div className="animated-aurora-background rounded-lg overflow-hidden shadow-lg">
                      <Image
                          src={interpretationResult.treeImageUri}
                          alt={`Imagem da árvore ${interpretationResult.oghamLetter}`}
                          data-ai-hint="enchanted tree tarot card"
                          width={512}
                          height={512}
                          className="w-full h-auto object-contain relative z-10 bg-black/10"
                      />
                  </div>
                )}
                <div className="prose-base lg:prose-lg dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed text-justify">
                  {interpretationResult.interpretation}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {(isLoading || interpretationResult) && (
          <div className="max-w-2xl mx-auto mt-8">
              <AdSlot id="ad-ogham-bottom" />
          </div>
        )}

        <div className="relative mt-8 mx-auto block max-w-full h-auto w-fit">
            <LeafyBackground />
            <div className="relative z-10 p-2"> 
                <img src="/img/arvore.gif" alt="Árvore mística" className="rounded-lg" />
                <VineFrame />
            </div>
        </div>
      </div>
    </div>
  );
}
