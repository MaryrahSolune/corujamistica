
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { interpretOghamReading, type InterpretOghamReadingOutput } from '@/ai/flows/interpret-ogham-reading';
import { oghamLetters, type OghamLetterData } from '@/lib/ogham-data';
import { Loader2, BookOpenText, Leaf, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { deductCredit } from '@/services/creditService';
import { saveReading, type ReadingData } from '@/services/readingService';
import { OghamIcon } from '@/components/MysticIcons';
import { AdSlot } from '@/components/AdSlot';
import { cn } from '@/lib/utils';

// New component for dynamic leaf animation
const FallingLeaves = ({ count = 20 }) => {
  const [leaves, setLeaves] = useState<any[]>([]);

  useEffect(() => {
    const generateLeaves = () => {
      const newLeaves = Array.from({ length: count }).map((_, i) => ({
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          transform: `rotate(${Math.random() * 360}deg) scale(${0.5 + Math.random() * 0.5})`,
          animationDuration: `${5 + Math.random() * 5}s`,
          animationDelay: `${Math.random() * 5}s`,
        },
      }));
      setLeaves(newLeaves);
    };

    generateLeaves();
  }, [count]);

  return (
    <>
      {leaves.map(leaf => (
        <Leaf
          key={leaf.id}
          className="absolute h-6 w-6 text-green-400/80 animate-fall-and-fade pointer-events-none"
          style={{ ...leaf.style, filter: 'drop-shadow(0 0 4px #65f57a)' }}
        />
      ))}
    </>
  );
};


export default function OghamPage() {
  const [query, setQuery] = useState<string>('');
  const [interpretationResult, setInterpretationResult] = useState<InterpretOghamReadingOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currentUser, userCredits, refreshCredits } = useAuth();
  
  const [readingStarted, setReadingStarted] = useState(false);
  const [selectedStick, setSelectedStick] = useState<OghamLetterData | null>(null);

  const shuffledOghams = useMemo(() => {
    return [...oghamLetters].sort(() => 0.5 - Math.random());
  }, []);

  const handleStickClick = async (stick: OghamLetterData) => {
    if (isLoading || readingStarted) return;

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
    setReadingStarted(true);
    setSelectedStick(stick);
    setInterpretationResult(null);
    setError(null);

    try {
      const deductResult = await deductCredit(currentUser.uid);
      if (!deductResult.success) {
        throw new Error(deductResult.message || t('creditDeductionFailedError'));
      }
      refreshCredits();

      const result = await interpretOghamReading({ query, chosenLetter: stick });
      setInterpretationResult(result);

      if (result && result.interpretation) {
        const readingToSave: Omit<ReadingData, 'interpretationTimestamp'> = {
          type: 'ogham',
          query: query,
          interpretationText: result.interpretation,
          oghamLetter: result.oghamLetter,
          oghamSymbol: result.oghamSymbol,
          treeImageUri: result.treeImageUri,
          adviceImageUri: result.adviceImageUri,
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
  
  const handleReset = () => {
    setQuery('');
    setInterpretationResult(null);
    setError(null);
    setReadingStarted(false);
    setSelectedStick(null);
  };

  const boardRadius = 200; // in pixels

  return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">

        <div className="max-w-4xl mx-auto animated-aurora-background rounded-xl mb-8">
          <Card className="relative z-10 bg-card/90 dark:bg-card/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-serif flex items-center">
                <OghamIcon className="h-8 w-8 mr-3 text-primary" />
                {t('oghamOraclePageTitle')}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {t('oghamOraclePageDescription')} {userCredits && t('creditsAvailable', { count: userCredits.balance })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="query" className="text-lg">{t('yourQuestionLabel')}</Label>
                <Textarea
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('questionPlaceholder')}
                  rows={3}
                  className="resize-none"
                  disabled={readingStarted}
                />
              </div>

              <div>
                <Label className="text-lg mb-4 block text-center">{t('chooseOghamStickLabel')}</Label>
                
                <div className="relative flex justify-center items-center w-full min-h-[450px]">
                  {/* The circular board */}
                  <div 
                    className="relative w-[400px] h-[400px] sm:w-[450px] sm:h-[450px] rounded-full flex items-center justify-center bg-gradient-to-br from-amber-900/20 via-amber-800/10 to-transparent border-2 border-amber-800/30 shadow-inner"
                  >
                     <div className="absolute inset-4 rounded-full border border-dashed border-amber-800/30"></div>
                     <div className="absolute inset-16 rounded-full border border-dashed border-amber-800/30"></div>
                     
                    {shuffledOghams.map((stick, index) => {
                      const angle = (index / shuffledOghams.length) * 360;
                      const x = boardRadius * Math.cos((angle - 90) * (Math.PI / 180));
                      const y = boardRadius * Math.sin((angle - 90) * (Math.PI / 180));
                      
                      const isSelected = selectedStick?.letter === stick.letter;
                      const isRevealed = readingStarted && isSelected;

                      return (
                        <button
                          key={stick.letter}
                          onClick={() => handleStickClick(stick)}
                          disabled={readingStarted || isLoading}
                          style={{
                            transform: `translate(${x}px, ${y}px) rotate(${angle}deg)`,
                            transformOrigin: 'center center',
                          }}
                           className={cn(
                            "absolute w-[70px] h-9 flex items-center justify-center rounded-md transition-all duration-500 ease-in-out",
                            !readingStarted && "hover:scale-110 hover:shadow-lg hover:shadow-accent/50 cursor-pointer",
                            readingStarted && !isSelected && "opacity-20 blur-sm scale-90",
                            isSelected && "scale-125 shadow-lg shadow-accent/50 z-10"
                          )}
                          aria-label={`Escolher Ogham oculto ${index + 1}`}
                        >
                          <div className={cn("relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700", isRevealed && "[transform:rotateY(180deg)]")}>
                            {/* Back of the card (hidden) */}
                            <div className="absolute w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-amber-700 via-amber-900 to-black shadow-md border-t-2 border-amber-500/50 rounded-md flex items-center justify-center">
                               <OghamIcon className="w-5 h-5 text-amber-300/50" />
                            </div>
                            {/* Front of the card (revealed) */}
                            <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-amber-600 via-amber-800 to-amber-950 shadow-lg border-2 border-amber-400/80 rounded-md flex flex-col items-center justify-center p-1">
                                <span className="font-sans text-xl font-black text-amber-100">{stick.symbol}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    <div className={cn("text-center transition-opacity duration-500 w-40 h-40", readingStarted ? "opacity-0" : "opacity-100")}>
                       <img
                          src="/img/coruja giratoria.gif"
                          alt="Coruja mística giratória"
                          data-ai-hint="mystical owl animation"
                          width={160}
                          height={160}
                          className="object-contain w-full h-full"
                          unoptimized={true}
                        />
                    </div>

                  </div>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center text-primary mt-4">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <span>{t('oghamConsultingTrees')}</span>
                    </div>
                )}
              </div>
            </CardContent>
            {readingStarted && !isLoading && (
                <CardFooter>
                    <Button onClick={handleReset} variant="outline" className="w-full">
                        {t('oghamDoAnotherReading')}
                    </Button>
                </CardFooter>
            )}
          </Card>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mt-8 animated-aurora-background rounded-lg">
            <Card className="relative z-10 bg-destructive/80 dark:bg-destructive/70 backdrop-blur-md shadow-lg border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive-foreground">{t('errorOccurredCardTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-destructive-foreground">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        {interpretationResult && !isLoading && (
          <div className="max-w-4xl mx-auto mt-8 animated-aurora-background rounded-lg">
            <Card className="shadow-2xl bg-gradient-to-br from-accent/20 via-transparent to-secondary/20 backdrop-blur-md relative z-10">
              <CardHeader>
                <CardTitle className="text-2xl font-serif flex items-center">
                  <BookOpenText className="h-7 w-7 mr-3 text-primary" />
                  {t('oghamInterpretationTitle')}
                </CardTitle>
                 <div className="flex flex-col items-center justify-center my-4">
                    <p className="text-lg mb-2 text-muted-foreground">{t('oghamYourChosenLetter', { letter: '', symbol: '' })}</p>
                    <div className="relative w-28 h-28 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-amber-900 rounded-full shadow-inner"></div>
                        <div className="absolute inset-1 bg-gradient-to-br from-amber-500 to-amber-800 rounded-full"></div>
                        <div className="relative z-10 text-center text-amber-100">
                            <div className="text-xl font-bold">{interpretationResult.oghamLetter}</div>
                            <div className="font-sans text-4xl font-black">{interpretationResult.oghamSymbol}</div>
                        </div>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {interpretationResult.treeImageUri && (
                  <div className="animated-aurora-background rounded-lg overflow-hidden shadow-lg">
                      <Image
                          src={interpretationResult.treeImageUri}
                          alt={t('oghamTreeImageAlt', { letter: interpretationResult.oghamLetter })}
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
                 {interpretationResult.adviceImageUri && (
                    <div className="space-y-4 pt-4">
                        <h3 className="text-xl font-bold font-serif text-primary flex items-center justify-center">
                            <Sparkles className="h-6 w-6 mr-2" />
                            {t('oghamAdviceVisual')}
                        </h3>
                        <div className="animated-aurora-background rounded-lg overflow-hidden shadow-lg">
                            <Image
                                src={interpretationResult.adviceImageUri}
                                alt={t('oghamAdviceImageAlt')}
                                data-ai-hint="mystical advice tarot card"
                                width={512}
                                height={512}
                                className="w-full h-auto object-contain relative z-10 bg-black/10"
                            />
                        </div>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {(isLoading || interpretationResult) && (
          <div className="max-w-4xl mx-auto mt-8">
              <AdSlot id="ad-ogham-bottom" />
          </div>
        )}
        <div className="relative mt-8 flex justify-center">
          <div className="relative z-10 p-2 group w-full max-w-md h-auto">
            <img src="/img/arvore.gif" alt={t('oghamMysticalTreeAlt')} className="rounded-lg w-full h-auto" />
             {/* Dynamic falling leaves container */}
            <div className="absolute inset-0 pointer-events-none">
              <FallingLeaves />
            </div>
          </div>
        </div>

      </div>
  );
}
