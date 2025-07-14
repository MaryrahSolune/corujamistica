
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateYidam, type InterpretYidamOutput } from '@/ai/flows/generate-yidams-flow';
import { yidams, type YidamData } from '@/lib/yidams-data';
import { Loader2, Sparkles, Hand, BrainCircuit, Flower, Book, Mic2, Pyramid, BookHeart, Wand2, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { deductCredit } from '@/services/creditService';
import { saveReading, type ReadingData } from '@/services/readingService';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


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
  
  const boardRadius = 220;
  const numCards = shuffledYidams.length;
  const totalArcDegrees = 270;
  const startAngleOffset = -135; // Centers the arc at the top

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {!result && !error && (
        <div className="max-w-4xl mx-auto animated-aurora-background rounded-xl mb-8">
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
                      className="relative w-[480px] h-[480px] flex items-center justify-center transition-all duration-500 ease-in-out"
                      style={{ perspective: '1000px' }}
                    >
                       <div className="absolute inset-20 rounded-full border border-dashed border-primary/20"></div>
                       
                      {shuffledYidams.map((symbol, index) => {
                        const angle = startAngleOffset + (index / (numCards -1)) * totalArcDegrees;
                        const x = boardRadius * Math.cos(angle * (Math.PI / 180));
                        const y = boardRadius * Math.sin(angle * (Math.PI / 180));
                        
                        const isSelected = selectedSymbol?.name === symbol.name;
                        const isRevealed = readingStarted && isSelected;

                        return (
                          <button
                            key={symbol.name}
                            onClick={() => handleSymbolClick(symbol)}
                            disabled={readingStarted || isLoading}
                            style={{
                              transform: `translate(${x}px, ${y}px) rotate(${angle + 90}deg)`,
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
            <CardFooter>
              <Button onClick={handleReset} variant="outline" className="w-full">
                Tentar novamente
              </Button>
            </CardFooter>
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
                {result.introduction && <p>{result.introduction}</p>}
                {result.storyAndElement && <p>{result.storyAndElement}</p>}
                {result.connectionToQuery && <p>{result.connectionToQuery}</p>}
                {result.adviceAndMudra && <p>{result.adviceAndMudra}</p>}
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
      
      <div className="max-w-4xl mx-auto mt-12 w-full">
        <Accordion type="single" collapsible className="w-full animated-aurora-background rounded-xl">
            <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="p-4 sm:p-6 hover:no-underline">
                  <div className='flex items-center text-lg font-serif'>
                    <BookHeart className="h-6 w-6 mr-3 text-primary" />
                    O Caminho dos Yidams: Conheça a filosofia
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 sm:p-6 pt-0 space-y-6 text-foreground/90 leading-relaxed text-justify">
                      <h3 className="text-2xl font-bold font-serif text-accent flex items-center justify-center text-center">
                        <Pyramid className="mr-2 h-6 w-6"/> O Caminho dos Yidams
                      </h3>
                      <p className='text-center italic text-muted-foreground'>Uma Jornada Sagrada com as Divindades do Despertar</p>
                      
                      <p>Na tradição mística do Budismo Tibetano, existe um portal secreto, um elo entre o visível e o invisível, entre o humano e o divino. Esse portal tem um nome sagrado: <strong>Yidam</strong>.</p>
                      <p>Yidam é mais do que uma divindade. É uma manifestação viva da mente iluminada, uma forma simbólica do seu eu desperto, um espelho sagrado onde a alma vê refletida a sua natureza búdica. Ao se conectar com um Yidam, você não cultua algo externo — você se reencontra com a sua essência mais pura.</p>
                      <p>A palavra "Yidam" vem da expressão tibetana <em>yid kyi dam tshig</em>, que significa algo como "voto da mente" ou "compromisso sagrado da consciência". Ao escolher — ou melhor, ao ser escolhido — por um Yidam, você se compromete com uma jornada espiritual profunda, onde meditação, visualização e transformação caminham lado a lado.</p>
                      
                      <h4 className="text-xl font-bold font-serif text-primary flex items-center pt-4"><Hand className="mr-2 h-5 w-5"/>Quem são os Yidams?</h4>
                      <p>São divindades do Vajrayana, a via tântrica do budismo. Podem aparecer como Budas celestiais, Bodhisattvas compassivos, figuras iradas que cortam a ignorância, ou mesmo mestres históricos iluminados. Cada Yidam encarna um aspecto específico da iluminação, como sabedoria, compaixão, coragem, verdade, cura, desapego ou destruição do ego.</p>
                      <p>Por trás de cada forma — com seus múltiplos braços, cores, símbolos, animais ou gestos — há um mapa interior, um caminho arquetípico de liberação.</p>
                      
                      <h4 className="text-xl font-bold font-serif text-primary flex items-center pt-4"><Wand2 className="mr-2 h-5 w-5"/>O que acontece na prática com o Yidam?</h4>
                      <p>A conexão com o Yidam se dá por meio de uma prática chamada <strong>Sadhana</strong> — uma liturgia meditativa em que o praticante visualiza a divindade, recita mantras e se transforma nela. Esse ritual é como um espelho mágico que dissolve as máscaras do ego e revela o Buda que sempre esteve dentro de você.</p>
                      <p>O Yidam não é um símbolo de adoração externa, mas um corpo de luz que você veste com a mente, reprogramando sua autoimagem e recriando o mundo como uma mandala de consciência desperta.</p>
                      
                      <h4 className="text-xl font-bold font-serif text-primary flex items-center pt-4"><Pyramid className="mr-2 h-5 w-5"/>Como encontrar seu Yidam?</h4>
                      <p>Não se trata de uma escolha racional. Os mestres dizem que é uma “escolha sem escolha” — o Yidam que te escolhe é aquele que te chama em sonhos, emoções, afinidades, visões. Às vezes, um mestre ou guru o revela. Outras vezes, ele emerge quando você menos espera.</p>
                      <p>Em algumas tradições, joga-se uma flor sobre uma mandala para que ela revele seu Yidam. Mas, na verdade, qualquer divindade com a qual você se sinta profundamente conectado pode ser seu Yidam do momento — pois o que importa é a transformação interna que ela inspira em você.</p>
                      
                      <h4 className="text-xl font-bold font-serif text-primary flex items-center pt-4"><Star className="mr-2 h-5 w-5"/>O Mistério do Silêncio</h4>
                      <p>Por respeito à sacralidade desse elo, muitos praticantes não revelam publicamente quem é seu Yidam. Isso evita o orgulho espiritual e preserva o poder silencioso da conexão. Afinal, o Yidam é um segredo sagrado entre você e o universo — um juramento da alma com sua origem divina.</p>
                      <p>O mestre Kalu Rinpoche, perguntado sobre seu Yidam após um retiro de três anos, simplesmente respondeu:</p>
                      <blockquote className="border-l-2 border-accent pl-4 italic text-muted-foreground">“Eu? Eu faço Mani.”</blockquote>
                      <p>Revelando que sua prática era apenas — e tão grandiosamente — o mantra da compaixão: <em>Om Mani Padme Hum</em>, ligado a Avalokiteshvara, o Buda do Amor.</p>
                      
                      <h4 className="text-xl font-bold font-serif text-primary flex items-center pt-4"><Sparkles className="mr-2 h-5 w-5"/>Aqui, no Oráculo da Coruja Mística...</h4>
                      <p>Você poderá descobrir qual Yidam está se comunicando com você neste momento. Ao escolher intuitivamente um símbolo sagrado, você acessa um aspecto oculto da sua consciência que deseja se manifestar.</p>
                      <p>Feche os olhos. Respire fundo. Deixe que sua alma escolha. Pois quem escolhe, no fundo, é o próprio despertar.</p>
                  </div>
                </AccordionContent>
            </AccordionItem>
          </Accordion>
      </div>

      <div className="flex justify-center mt-12">
        <Image
          src="/img/buda.gif"
          alt="Animação de Buda meditando"
          width={600}
          height={600}
          unoptimized={true}
          data-ai-hint="buddha meditation animation"
        />
      </div>
    </div>
  );
}
