
'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { interpretDream, type InterpretDreamInput, type ProcessedStorySegment } from '@/ai/flows/interpret-dream-flow';
import { Loader2, MessageCircleQuestion, BookOpenText, BrainCircuit } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { deductCredit } from '@/services/creditService';
import { saveReading, type DreamInterpretationData } from '@/services/readingService';

export default function DreamInterpretationPage() {
  const [dreamDescription, setDreamDescription] = useState<string>('');
  const [storySegments, setStorySegments] = useState<ProcessedStorySegment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currentUser, userCredits, refreshCredits } = useAuth();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!currentUser) {
      toast({ title: t('authErrorTitle'), description: t('mustBeLoggedInToInterpret'), variant: 'destructive' }); // Add these translations
      return;
    }
    if (!userCredits || userCredits.balance < 1) {
      toast({ title: t('insufficientCreditsTitle'), description: t('insufficientCreditsForDreamDescription'), variant: 'destructive' }); // Add these translations
      return;
    }
    if (!dreamDescription.trim()) {
      toast({ title: t('noDreamErrorTitle'), description: t('noDreamErrorDescription'), variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setStorySegments([]);
    setError(null);

    try {
      // 1. Deduct credit
      const deductResult = await deductCredit(currentUser.uid);
      if (!deductResult.success) {
        throw new Error(deductResult.message || t('creditDeductionFailedError'));
      }
      refreshCredits();

      // 2. Interpret dream
      const input: InterpretDreamInput = { dreamDescription };
      const result = await interpretDream(input);
      setStorySegments(result || []);

      // 3. Save dream interpretation
      if (result && result.length > 0) {
        const dreamToSave: Omit<DreamInterpretationData, 'interpretationTimestamp'> = {
          type: 'dream',
          dreamDescription: dreamDescription,
          interpretationSegments: result,
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto animated-aurora-background rounded-xl mb-8">
        <Card className="relative z-10 bg-card/90 dark:bg-card/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-serif flex items-center">
              <MessageCircleQuestion className="h-8 w-8 mr-3 text-primary" />
              {t('dreamInterpretationTitle')}
            </CardTitle>
            <CardDescription>
              {t('dreamInterpretationDescription')} {userCredits && t('creditsAvailable', {count: userCredits.balance})}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="dream-description" className="text-lg">{t('yourDreamLabel')}</Label>
                <Textarea
                  id="dream-description"
                  value={dreamDescription}
                  onChange={(e) => setDreamDescription(e.target.value)}
                  placeholder={t('dreamPlaceholder')}
                  rows={6}
                  className="resize-none"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full text-lg py-6" 
                disabled={isLoading || !dreamDescription.trim() || (userCredits && userCredits.balance < 1)}
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

      {storySegments.length > 0 && !isLoading && (
        <div className="max-w-2xl mx-auto mt-8 animated-aurora-background rounded-lg">
          <Card className="shadow-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 backdrop-blur-md relative z-10">
            <CardHeader>
              <CardTitle className="text-2xl font-serif flex items-center">
                <BookOpenText className="h-7 w-7 mr-3 text-accent" />
                {t('yourPropheticInterpretationTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {storySegments.map((segment, index) => (
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
  );
}
