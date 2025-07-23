// src/app/(app)/mesa-real/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateMesaRealInterpretation, type GenerateMesaRealInterpretationOutput } from '@/ai/flows/generate-mesareal-interpretation';
import { Loader2, Wand2, Sparkles, VenetianMask } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { saveReading, type ReadingData } from '@/services/readingService';
import { MesaRealBoard } from '@/components/MesaRealBoard';
import { AdSlot } from '@/components/AdSlot';
import { FallingPetals } from '@/components/FallingPetals';
import { cn } from '@/lib/utils';

export default function MesaRealPage() {
  const [query, setQuery] = useState<string>('');
  const [interpretationResult, setInterpretationResult] = useState<GenerateMesaRealInterpretationOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [readingStarted, setReadingStarted] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [boardScreenshot, setBoardScreenshot] = useState<string | null>(null);

  const handleStartReading = async () => {
    if (!currentUser) {
      toast({ title: t('authErrorTitle'), description: t('mustBeLoggedInToRead'), variant: 'destructive' });
      return;
    }
    if (!query.trim()) {
      toast({ title: t('noQueryErrorTitle'), description: t('noQueryErrorDescription'), variant: 'destructive' });
      return;
    }
    setReadingStarted(true);
  };
  
  const handleInterpretation = async (screenshotDataUrl: string) => {
    if (!currentUser) {
      toast({ title: t('authErrorTitle'), description: t('mustBeLoggedInToRead'), variant: 'destructive' });
      return;
    }
    
    setBoardScreenshot(screenshotDataUrl);
    setIsLoading(true);
    setInterpretationResult(null);
    setError(null);
    
    try {
        const result = await generateMesaRealInterpretation({ cardSpreadImage: screenshotDataUrl, query });
        setInterpretationResult(result);
        
        if (result.interpretation) {
            const readingToSave: Omit<ReadingData, 'interpretationTimestamp'> = {
              type: 'tarot', // Mesa Real is a type of tarot/cigano reading
              query: query,
              cardSpreadImageUri: screenshotDataUrl,
              interpretationText: result.interpretation,
              mandalaImageUri: result.mandalaImageUri,
            };
            await saveReading(currentUser.uid, readingToSave);
        }
        
        toast({ title: t('interpretationReadyTitle'), description: t('interpretationReadyDescription') });

    } catch (err: any) {
        console.error('Error interpreting Mesa Real:', err);
        const errorMessage = err.message || t('errorGeneratingInterpretationDescription');
        setError(errorMessage);
        toast({ title: t('errorGenericTitle'), description: errorMessage, variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleReset = () => {
      setQuery('');
      setInterpretationResult(null);
      setError(null);
      setReadingStarted(false);
      setBoardScreenshot(null);
      setIsLoading(false);
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto animated-aurora-background rounded-xl mb-8">
        <Card className="relative z-10 bg-card/90 dark:bg-card/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-serif flex items-center">
              <VenetianMask className="h-8 w-8 mr-3 text-primary" />
              Mesa Real Cigana
            </CardTitle>
            <CardDescription>
              Concentre-se em sua questão e deixe as 36 cartas revelarem o panorama completo da sua vida.
            </CardDescription>
          </CardHeader>
           {!readingStarted && (
                <form onSubmit={(e) => { e.preventDefault(); handleStartReading(); }}>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="query" className="text-lg">{t('yourQuestionLabel')}</Label>
                            <Textarea
                                id="query"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Qual a mensagem da Mesa Real para o meu momento de vida?"
                                rows={3}
                                className="resize-none"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full text-lg py-6" disabled={!query.trim()}>
                            <Wand2 className="mr-2 h-5 w-5" />
                            Iniciar Leitura da Mesa Real
                        </Button>
                    </CardFooter>
                </form>
            )}
        </Card>
      </div>
      
      {!readingStarted && (
          <div className="relative flex justify-center -mt-8">
              <div className="relative w-full max-w-xl h-auto">
                <img src="/img/rosa.gif" alt="Rosa Mística" className={cn("w-full h-auto", "transform scale-80")} />
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <FallingPetals />
                </div>
              </div>
          </div>
      )}


       {readingStarted && (
        <div className="mb-8 flex flex-col items-center">
            <MesaRealBoard onInterpretationReady={handleInterpretation} />
        </div>
       )}

      {isLoading && (
         <div className="flex flex-col items-center justify-center text-primary mt-8">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <span className="text-lg font-semibold">{t('generatingInterpretationButton')}</span>
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto mt-8 animated-aurora-background rounded-lg">
          <Card className="relative z-10 bg-destructive/80 dark:bg-destructive/70 backdrop-blur-md shadow-lg border-destructive">
            <CardHeader><CardTitle className="text-destructive-foreground font-serif">{t('errorOccurredCardTitle')}</CardTitle></CardHeader>
            <CardContent><p className="text-destructive-foreground">{error}</p></CardContent>
          </Card>
        </div>
      )}

      {interpretationResult && !isLoading && (
        <div className="space-y-8 mt-8">
            <div className="max-w-2xl mx-auto animated-aurora-background rounded-lg">
                <Card className="shadow-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 backdrop-blur-md relative z-10">
                    <CardHeader>
                    <CardTitle className="text-2xl font-serif flex items-center">
                        <VenetianMask className="h-7 w-7 mr-3 text-accent" />
                        Sua Leitura da Mesa Real
                    </CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="prose-base lg:prose-lg dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed text-justify">
                        {interpretationResult.interpretation}
                    </div>
                    </CardContent>
                </Card>
            </div>

            {interpretationResult.mandalaImageUri && (
                 <div className="max-w-2xl mx-auto mt-8 animated-aurora-background rounded-lg">
                    <Card className="shadow-2xl bg-gradient-to-br from-accent/20 via-transparent to-secondary/20 backdrop-blur-md relative z-10">
                        <CardHeader>
                        <CardTitle className="text-2xl font-serif flex items-center">
                            <Sparkles className="h-7 w-7 mr-3 text-primary" /> 
                            Sua Mandala de Cura
                        </CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                        <Image
                            src={interpretationResult.mandalaImageUri}
                            alt={t('summaryImageAlt')}
                            data-ai-hint="healing energy mandala"
                            width={512}
                            height={512}
                            className="rounded-lg shadow-lg object-contain"
                        />
                        </CardContent>
                    </Card>
                 </div>
            )}
        </div>
      )}

      {(isLoading || interpretationResult) && (
        <div className="text-center mt-8">
            <Button onClick={handleReset} variant="outline" size="lg">Fazer Nova Consulta</Button>
            <div className="max-w-2xl mx-auto mt-8">
                <AdSlot id="ad-mesa-real-bottom" />
            </div>
        </div>
      )}

    </div>
  );
}
