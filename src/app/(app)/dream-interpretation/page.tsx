'use client';


import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { interpretDream, type InterpretDreamOutput, type ProcessedStorySegment } from '@/ai/flows/interpret-dream-flow';
import { Loader2, MessageCircleQuestion, BookOpenText, BrainCircuit, Library } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { deductCredit } from '@/services/creditService';
import { saveReading, type DreamInterpretationData } from '@/services/readingService';

export default function DreamInterpretationPage() {
  const [dreamDescription, setDreamDescription] = useState<string>('');
  const [interpretationResult, setInterpretationResult] = useState<InterpretDreamOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currentUser, userCredits, refreshCredits } = useAuth();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!currentUser) {
      toast({ title: t('authErrorTitle'), description: t('mustBeLoggedInToInterpret'), variant: 'destructive' });
      return;
    }
    if (!userCredits || userCredits.balance < 1) {
      toast({ title: t('insufficientCreditsTitle'), description: t('insufficientCreditsForDreamDescription'), variant: 'destructive' });
      return;
    }
    if (!dreamDescription.trim()) {
      toast({ title: t('noDreamErrorTitle'), description: t('noDreamErrorDescription'), variant: 'destructive' });
      return;
    }
    if (dreamDescription.trim().length < 10) {
      toast({ title: t('errorGenericTitle'), description: t('dreamDescriptionTooShortError'), variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setInterpretationResult(null);
    setError(null);

    try {
      // 1. Deduct credit
      const deductResult = await deductCredit(currentUser.uid);
      if (!deductResult.success) {
        throw new Error(deductResult.message || t('creditDeductionFailedError'));
      }
      refreshCredits();

      // 2. Interpret dream. The flow now returns both parts of the interpretation.
      const result = await interpretDream({ dreamDescription });
      setInterpretationResult(result);

      // 3. Save dream interpretation to DB
      if (result && (result.storySegments.length > 0 || result.dictionaryInterpretation)) {
        const dreamToSave: Omit<DreamInterpretationData, 'interpretationTimestamp'> = {
          type: 'dream',
          dreamDescription: dreamDescription,
          interpretationSegments: result.storySegments,
          dictionaryInterpretation: result.dictionaryInterpretation,
        };
        await saveReading(currentUser.uid, dreamToSave);
      }
      
      toast({ title: t('dreamInterpretationReadyTitle'), description: t('dreamInterpretationReadyDescription') });
    } catch (err: any) {
      console.error('Error interpreting dream:', err);
      const errorMessage = err.message || t('errorGeneratingInterpretationDescription');
      setError(errorMessage);
      toast({ title: t('errorGenericTitle'), description: errorMessage, variant: 'destructive' });
      // TODO: Consider refunding credit if interpretation fails after deduction.
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/img/mulher fumaça.gif')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 relative z-0">
        <div className="max-w-2xl mx-auto animated-aurora-background rounded-xl mb-8">
          <Card className="relative z-10 bg-black/30 dark:bg-black/50 backdrop-blur-md shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-serif flex items-center text-primary-foreground dark:text-primary-foreground">
                <MessageCircleQuestion className="h-8 w-8 mr-3 text-primary" />
                {t('dreamInterpretationTitle')}
              </CardTitle>
              <CardDescription className="text-muted-foreground dark:text-slate-300">
                {t('dreamInterpretationDescription')} {userCredits && t('creditsAvailable', { count: userCredits.balance })}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="dream-description" className="text-lg text-primary-foreground dark:text-primary-foreground">{t('yourDreamLabel')}</Label>
                  <Textarea
                    id="dream-description"
                    value={dreamDescription}
                    onChange={(e) => setDreamDescription(e.target.value)}
                    placeholder={t('dreamPlaceholder')}
                    rows={6}
                    className="resize-none bg-background/80 dark:bg-background/70"
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
                    !dreamDescription.trim() || 
                    dreamDescription.trim().length < 10 || 
                    (userCredits && userCredits.balance < 1)
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t('generatingDreamInterpretationButton')}
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="mr-2 h-5 w-5" />
                      {t('getDreamInterpretationButton')}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mt-8 animated-aurora-background rounded-lg">
            <Card className="relative z-10 bg-destructive/90 dark:bg-destructive/85 backdrop-blur-md shadow-lg border-destructive">
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
            <div className='space-y-8'>
                {interpretationResult.dictionaryInterpretation && (
                     <div className="max-w-2xl mx-auto animated-aurora-background rounded-lg">
                        <Card className="shadow-lg bg-black/30 dark:bg-black/50 backdrop-blur-md relative z-10">
                            <CardHeader>
                                <CardTitle className="text-2xl font-serif flex items-center text-primary-foreground dark:text-primary-foreground">
                                    <Library className="h-7 w-7 mr-3 text-accent" />
                                    {t('dreamDictionaryInterpretationTitle')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="prose-base lg:prose-lg dark:prose-invert max-w-none whitespace-pre-wrap text-gray-200 dark:text-gray-100 leading-relaxed text-justify">
                                    {interpretationResult.dictionaryInterpretation}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {interpretationResult.storySegments.length > 0 && (
                     <div className="max-w-2xl mx-auto animated-aurora-background rounded-lg">
                        <Card className="shadow-2xl bg-black/30 dark:bg-black/50 backdrop-blur-md relative z-10">
                        <CardHeader>
                            <CardTitle className="text-2xl font-serif flex items-center text-primary-foreground dark:text-primary-foreground">
                            <BookOpenText className="h-7 w-7 mr-3 text-accent" />
                            {t('yourPropheticInterpretationTitle')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {interpretationResult.storySegments.map((segment, index) => (
                            <div key={index}>
                                {segment.type === 'text' && segment.content && (
                                <p className="prose-base lg:prose-lg dark:prose-invert max-w-none whitespace-pre-wrap text-gray-200 dark:text-gray-100 leading-relaxed text-justify">
                                    {segment.content}
                                </p>
                                )}
                                {segment.type === 'image' && segment.dataUri && (
                                <div className="my-4 rounded-lg overflow-hidden shadow-lg animated-aurora-background">
                                    <Image
                                    src={segment.dataUri}
                                    alt={t('dreamIllustrationAlt', { number: index + 1 })+`: ${segment.alt || 'Dream illustration'}`}
                                    width={500} 
                                    height={300}
                                    className="w-full h-auto object-contain relative z-10 bg-black/10"
                                    data-ai-hint="dream scene abstract"
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
        )}
      </div>
      <img src="/img/olho.gif" alt="Olho místico" className="mt-8 mx-auto block max-w-full h-auto" />
    </div>
  );
}
