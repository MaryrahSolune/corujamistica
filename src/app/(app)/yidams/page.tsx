
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateYidam, type InterpretYidamOutput } from '@/ai/flows/generate-yidams-flow';
import { yidams, type YidamData } from '@/lib/yidams-data';
import { Loader2, Sparkles, Hand, BrainCircuit, Flower, Book, Mic2, Pyramid } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { deductCredit } from '@/services/creditService';
import { saveReading, type ReadingData } from '@/services/readingService';
import { cn } from '@/lib/utils';


export default function YidamsPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<InterpretYidamOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readingStarted, setReadingStarted] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<YidamData | null>(null);
  
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currentUser, userCredits, refreshCredits } = useAuth();

  const shuffledYidams = useMemo(() => {
    return [...yidams].sort(() => 0.5 - Math.random());
  }, []);

  const handleSymbolClick = async (symbol: YidamData) => {
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
    setSelectedSymbol(symbol);
    setResult(null);
    setError(null);

    try {
      const deductResult = await deductCredit(currentUser.uid);
      if (!deductResult.success) {
        throw new Error(deductResult.message || t('creditDeductionFailedError'));
      }
      refreshCredits();

      const yidamResult = await generateYidam({ query, chosenYidam: symbol });
      setResult(yidamResult);

      const readingToSave: Omit<ReadingData, 'interpretationTimestamp'> = {
        type: 'yidams',
        query,
        deityName: yidamResult.deityName,
        introduction: yidamResult.introduction,
        storyAndElement: yidamResult.storyAndElement,
        connectionToQuery: yidamResult.connectionToQuery,
        adviceAndMudra: yidamResult.adviceAndMudra,
        mantra: yidamResult.mantra,
        mantraTranslation: yidamResult.mantraTranslation,
        mantraPronunciation: yidamResult.mantraPronunciation,
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

  const handleReset = () => {
    setQuery('');
    setResult(null);
    setError(null);
    setReadingStarted(false);
    setSelectedSymbol(null);
  };
  
  const boardRadius = 220; // in pixels for the main circle of cards
  const numCards = shuffledYidams.length;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {!result && (
        <>
          <div className="max-w-4xl mx-auto animated-aurora-background rounded-xl mb-4">
            <Card className="relative z-10 bg-card/90 dark:bg-card/80 backdrop-blur-sm shadow-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-3xl font-serif flex items-center">
                  <Flower className="h-8 w-8 mr-3 text-primary" />
                  {t('yidamsPageTitle')}
                </CardTitle>
                <CardDescription>
                  {t('yidamsPageDescription')} {userCredits && t('creditsAvailable', { count: userCredits.balance })}
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
                  <Label className="text-lg mb-4 block text-center">Escolha um símbolo para revelar seu Yidam</Label>
                  
                  <div className="relative flex justify-center items-center w-full min-h-[500px]">
                     <div 
                        className="relative w-[480px] h-[480px] rounded-full flex items-center justify-center transition-all duration-500 ease-in-out"
                        style={{ perspective: '1000px' }}
                      >
                         <div className="absolute inset-20 rounded-full border border-dashed border-primary/20"></div>
                         
                        {shuffledYidams.map((symbol, index) => {
                          const angle = (index / numCards) * 360;
                          const x = boardRadius * Math.cos((angle - 90) * (Math.PI / 180));
                          const y = boardRadius * Math.sin((angle - 90) * (Math.PI / 180));
                          
                          const isSelected = selectedSymbol?.name === symbol.name;
                          const isRevealed = readingStarted && isSelected;

                          return (
                            <button
                              key={symbol.name}
                              onClick={() => handleSymbolClick(symbol)}
                              disabled={readingStarted || isLoading}
                              style={{
                                transform: `translate(${x}px, ${y}px) rotate(${angle}deg)`,
                                transformOrigin: 'center center',
                                WebkitBackfaceVisibility: 'hidden',
                                backfaceVisibility: 'hidden',
                              }}
                               className={cn(
                                "absolute w-[70px] h-[90px] flex items-center justify-center transition-all duration-700 ease-in-out",
                                !readingStarted && "hover:scale-110 hover:shadow-lg hover:shadow-accent/50 cursor-pointer",
                                readingStarted && !isSelected && "opacity-0 scale-90",
                                isSelected && "scale-150 shadow-lg shadow-accent/50 z-10 -translate-y-4"
                              )}
                              aria-label={`Escolher símbolo oculto ${index + 1}`}
                            >
                              <div className={cn("relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700", isRevealed && "[transform:rotateY(180deg)]")}>
                                {/* Back of the card (hidden) */}
                                <div className="absolute w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-primary via-secondary to-accent/80 shadow-md rounded-md flex items-center justify-center border-2 border-primary-foreground/20">
                                   <Sparkles className="w-6 h-6 text-primary-foreground/70" />
                                </div>
                                {/* Front of the card (revealed) */}
                                <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-background/80 to-background shadow-lg border-2 border-accent/80 rounded-md flex flex-col items-center justify-center p-1 text-center">
                                    <p className="font-sans text-[10px] leading-tight font-bold text-accent whitespace-nowrap">{symbol.symbolicRepresentation}</p>
                                </div>
                              </div>
                            </button>
                          );
                        })}

                        <div className={cn("text-center transition-opacity duration-500 w-40 h-40", readingStarted ? "opacity-0" : "opacity-100")}>
                           <img
                              src="/img/luz.gif"
                              alt="Luz mística central"
                              data-ai-hint="mystical light animation"
                              width={160}
                              height={160}
                              className="object-contain w-full h-full mix-blend-screen"
                            />
                        </div>

                      </div>
                  </div>

                  {isLoading && (
                      <div className="flex items-center justify-center text-primary mt-4">
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          <span>Revelando seu caminho...</span>
                      </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-center my-4">
              <Image 
                src="/img/delicate.gif"
                alt="Animação delicada de partículas"
                width={200}
                height={100}
                unoptimized={true}
                data-ai-hint="delicate particle animation"
              />
          </div>
        </>
      )}


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
              
              <div className="prose-base lg:prose-lg dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed text-justify space-y-4">
                <p>{result.introduction}</p>
                <p>{result.storyAndElement}</p>
                <p>{result.connectionToQuery}</p>
                <p>{result.adviceAndMudra}</p>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-xl font-bold font-serif text-accent flex items-center"><Mic2 className="mr-2 h-5 w-5"/>{t('yidamsMantraLabel')}</h3>
                <blockquote className="border-l-4 border-accent pl-4 text-foreground/90">
                  <p className="text-lg italic font-semibold">{result.mantra}</p>
                  {result.mantraPronunciation && (
                    <div className="mt-3 flex items-start text-sm text-muted-foreground">
                       <strong>Pronúncia:</strong>&nbsp;{result.mantraPronunciation}
                    </div>
                  )}
                  {result.mantraTranslation && (
                    <div className="mt-2 flex items-start text-sm text-muted-foreground">
                       <strong>Tradução:</strong>&nbsp;{result.mantraTranslation}
                    </div>
                  )}
                </blockquote>
              </div>

            </CardContent>
             <CardFooter>
                  <Button onClick={handleReset} variant="outline" className="w-full">
                      Fazer outra consulta
                  </Button>
              </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
