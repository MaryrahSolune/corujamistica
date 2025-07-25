
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getReadingById, type ReadingData } from '@/services/readingService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, BookOpenText, VenetianMask, BrainCircuit, ArrowLeft, Sparkles, Image as ImageIcon, Library, Flower, Hand, Book, Mic2, Pyramid, PlayCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { AdSlot } from '@/components/AdSlot';
import { OghamIcon } from '@/components/MysticIcons';
import { generateAudio, type GenerateAudioInput } from '@/ai/flows/generate-audio-flow';

type ReadingWithId = ReadingData & { id: string };

export default function ViewReadingPage() {
  const params = useParams();
  const readingId = params.readingId as string;
  const { currentUser } = useAuth();
  const { t, locale } = useLanguage();

  const [reading, setReading] = useState<ReadingWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const getDateFnsLocale = () => (locale === 'pt-BR' ? ptBR : enUS);

  useEffect(() => {
    if (currentUser?.uid && readingId) {
      setLoading(true);
      getReadingById(currentUser.uid, readingId)
        .then((data) => {
          if (data) {
            setReading(data);
          } else {
            setError(t('readingNotFoundError'));
          }
        })
        .catch((err) => {
          console.error("Error fetching reading:", err);
          setError(t('errorFetchingReading'));
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (!currentUser) {
        setLoading(false);
        setError(t('mustBeLoggedInToViewReading'));
    }
  }, [currentUser, readingId, t, locale]);
  
  const handleGenerateAudio = async () => {
    if (!reading) return;
    setIsGeneratingAudio(true);
    setAudioUrl(null);
    setAudioError(null);

    let textToNarrate = '';

    switch (reading.type) {
        case 'tarot':
            textToNarrate = reading.interpretationText;
            break;
        case 'dream':
            textToNarrate = reading.interpretationSegments.filter(s => s.type === 'text').map(s => s.content).join('\n\n');
            break;
        case 'ogham':
            textToNarrate = reading.interpretationText;
            break;
        case 'yidams':
            textToNarrate = [
                reading.introduction,
                reading.storyAndElement,
                reading.connectionToQuery,
                reading.adviceAndMudra
            ].join('\n\n');
            break;
    }
    
    if (!textToNarrate.trim()) {
        setAudioError("Não há texto para narrar.");
        setIsGeneratingAudio(false);
        return;
    }
    
    try {
        const input: GenerateAudioInput = { textToNarrate };
        const result = await generateAudio(input);
        if(result.audioDataUri){
            setAudioUrl(result.audioDataUri);
        } else {
            throw new Error("A narração não foi gerada corretamente.");
        }
    } catch (err) {
        console.error("Error generating audio:", err);
        setAudioError("Falha ao gerar o áudio. Tente novamente.");
    } finally {
        setIsGeneratingAudio(false);
    }
  };


  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-3xl">
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-3xl text-center">
        <Card className="mt-8 shadow-lg animated-aurora-background">
            <div className="relative z-10 bg-destructive/80 dark:bg-destructive/70 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-destructive-foreground">{t('errorOccurredCardTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive-foreground font-semibold">{error}</p>
                    <Button asChild variant="secondary" className="mt-6">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" /> {t('backToDashboardButton')}
                    </Link>
                    </Button>
                </CardContent>
            </div>
        </Card>
      </div>
    );
  }

  if (!reading) {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-3xl text-center">
             <p className="font-semibold">{t('readingNotFound')}</p>
             <Button asChild variant="link" className="mt-4">
                <Link href="/dashboard"><span>{t('backToDashboardButton')}</span></Link>
            </Button>
        </div>
    );
  }

  const formatTimestamp = (timestamp: number | object) => {
    // Firebase server timestamp is initially an object, then a number.
    if (typeof timestamp !== 'number') return t('timestampProcessing');
    // The timestamp might be in milliseconds from the server.
    return format(new Date(timestamp), 'PPP p', { locale: getDateFnsLocale() });
  };
  
  let pageTitle = '';
  let PageIcon = BookOpenText;

  if (reading.type === 'tarot') {
    pageTitle = t('tarotReadingDetailsTitle');
    PageIcon = VenetianMask;
  } else if (reading.type === 'dream') {
    pageTitle = t('dreamInterpretationDetailsTitle');
    PageIcon = BrainCircuit;
  } else if (reading.type === 'ogham') {
    pageTitle = t('oghamReadingType');
    PageIcon = OghamIcon;
  } else if (reading.type === 'yidams') {
    pageTitle = t('yidamsPathTitle');
    PageIcon = Flower;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-3xl">
        <Button asChild variant="outline" size="sm" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> <span>{t('backToDashboardButton')}</span>
          </Link>
        </Button>

      <div className="animated-aurora-background rounded-xl">
        <Card className="shadow-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 backdrop-blur-md relative z-10">
          <CardHeader>
            <div className="flex items-center mb-2">
                <PageIcon className="h-8 w-8 mr-3 text-primary" />
                <CardTitle className="text-3xl font-serif">{pageTitle}</CardTitle>
            </div>
            {reading.interpretationTimestamp && (
              <CardDescription className="text-sm">
                {t('readingPerformedOn', { date: formatTimestamp(reading.interpretationTimestamp) })}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-8">

            <div className="space-y-4">
                <Button onClick={handleGenerateAudio} disabled={isGeneratingAudio} className="w-full sm:w-auto">
                    {isGeneratingAudio ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                    {isGeneratingAudio ? "Gerando narração..." : "Ouvir Leitura"}
                </Button>
                {audioUrl && (
                    <div className="mt-4">
                        <audio controls src={audioUrl} className="w-full">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                )}
                {audioError && <p className="text-destructive text-sm mt-2">{audioError}</p>}
            </div>


            {reading.type === 'tarot' && (
              <>
                <div>
                  <h3 className="text-xl font-bold font-serif mb-2 text-accent">{t('yourQuestionLabel')}</h3>
                  <blockquote className="mt-2 border-l-4 border-accent pl-4 italic text-foreground/80 whitespace-pre-wrap">
                    {reading.query}
                  </blockquote>
                </div>

                {reading.cardSpreadImageUri && (
                  <div className="my-4">
                    <h3 className="text-xl font-bold font-serif mb-3 text-accent flex items-center">
                        <ImageIcon className="mr-2 h-5 w-5"/> {t('cardSpreadImageTitle')}
                    </h3>
                    <div className="animated-aurora-background rounded-lg overflow-hidden shadow-lg">
                        <Image
                        src={reading.cardSpreadImageUri}
                        alt={t('cardSpreadPreviewAlt')}
                        data-ai-hint="tarot card spread user upload"
                        width={500}
                        height={350}
                        className="w-full h-auto object-contain relative z-10 bg-black/10"
                        />
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold font-serif mb-2 text-accent flex items-center">
                    <BookOpenText className="mr-2 h-5 w-5"/> {t('interpretationTitle')}
                  </h3>
                  <div className="prose-base lg:prose-lg dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed text-justify font-medium">
                    {reading.interpretationText}
                  </div>
                </div>

                {reading.mandalaImageUri && (
                    <div className="my-6">
                        <h3 className="text-xl font-bold font-serif mb-3 text-accent flex items-center">
                            <Sparkles className="mr-2 h-5 w-5"/> {t('yourVisualBlessingTitle')}
                        </h3>
                        <div className="animated-aurora-background rounded-lg overflow-hidden shadow-lg">
                            <Image
                            src={reading.mandalaImageUri}
                            alt={t('summaryImageAlt')}
                            data-ai-hint="spiritual guidance orixa blessing"
                            width={512}
                            height={512}
                            className="w-full h-auto object-contain relative z-10 bg-black/10"
                            />
                        </div>
                    </div>
                )}
              </>
            )}

            {reading.type === 'dream' && (
              <>
                <div>
                  <h3 className="text-xl font-bold font-serif mb-2 text-accent">{t('yourDreamLabel')}</h3>
                  <blockquote className="mt-2 border-l-4 border-accent pl-4 italic text-foreground/80 whitespace-pre-wrap">
                    {reading.dreamDescription}
                  </blockquote>
                </div>

                {reading.dictionaryInterpretation && (
                  <div>
                    <h3 className="text-xl font-bold font-serif mb-4 text-accent flex items-center">
                      <Library className="mr-2 h-5 w-5"/> {t('dreamDictionaryInterpretationTitle')}
                    </h3>
                    <div className="prose-base lg:prose-lg dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed text-justify font-medium">
                      {reading.dictionaryInterpretation}
                    </div>
                  </div>
                )}
                
                {reading.interpretationSegments && reading.interpretationSegments.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold font-serif mb-4 text-accent flex items-center">
                      <BookOpenText className="mr-2 h-5 w-5"/> {t('interpretationTitle')}
                    </h3>
                    <div className="space-y-4">
                      {reading.interpretationSegments.map((segment, index) => (
                        <div key={index}>
                          {segment.type === 'text' && segment.content && (
                            <p className="prose-base lg:prose-lg dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed text-justify font-medium">
                              {segment.content}
                            </p>
                          )}
                          {segment.type === 'image' && segment.dataUri && (
                              <div className="my-4 animated-aurora-background rounded-lg overflow-hidden shadow-lg">
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
                    </div>
                  </div>
                )}
              </>
            )}

            {reading.type === 'ogham' && (
              <>
                <div>
                  <h3 className="text-xl font-bold font-serif mb-2 text-accent">{t('yourQuestionLabel')}</h3>
                  <blockquote className="mt-2 border-l-4 border-accent pl-4 italic text-foreground/80 whitespace-pre-wrap">
                    {reading.query}
                  </blockquote>
                </div>
                 {reading.treeImageUri && (
                  <div className="my-4">
                    <h3 className="text-xl font-bold font-serif mb-3 text-accent flex items-center">
                        <ImageIcon className="mr-2 h-5 w-5"/> Imagem da Árvore
                    </h3>
                    <div className="animated-aurora-background rounded-lg overflow-hidden shadow-lg">
                        <Image
                            src={reading.treeImageUri}
                            alt={`Imagem da árvore ${reading.oghamLetter}`}
                            data-ai-hint="enchanted tree tarot card"
                            width={512}
                            height={512}
                            className="w-full h-auto object-contain relative z-10 bg-black/10"
                        />
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold font-serif mb-2 text-accent flex items-center">
                    <BookOpenText className="mr-2 h-5 w-5"/> {t('interpretationTitle')}
                  </h3>
                   <p className="mb-4 text-lg text-foreground font-semibold">
                    Letra Sorteada: {reading.oghamLetter} ({reading.oghamSymbol})
                  </p>
                  <div className="prose-base lg:prose-lg dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed text-justify font-medium">
                    {reading.interpretationText}
                  </div>
                </div>
                 {reading.adviceImageUri && (
                    <div className="my-6">
                        <h3 className="text-xl font-bold font-serif mb-3 text-accent flex items-center">
                            <Sparkles className="mr-2 h-5 w-5"/> O Conselho de Merlin
                        </h3>
                        <div className="animated-aurora-background rounded-lg overflow-hidden shadow-lg">
                            <Image
                            src={reading.adviceImageUri}
                            alt="Imagem representando o conselho de Merlin"
                            data-ai-hint="mystical advice tarot card"
                            width={512}
                            height={512}
                            className="w-full h-auto object-contain relative z-10 bg-black/10"
                            />
                        </div>
                    </div>
                )}
              </>
            )}
             {reading.type === 'yidams' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold font-serif mb-2 text-accent">{t('yourQuestionLabel')}</h3>
                  <blockquote className="mt-2 border-l-4 border-accent pl-4 italic text-foreground/80 whitespace-pre-wrap">
                    {reading.query}
                  </blockquote>
                </div>

                <div className="text-center">
                  <p className="text-muted-foreground">{t('yidamsYourDeityIs')}</p>
                  <p className="text-3xl font-bold text-primary font-serif">{reading.deityName}</p>
                </div>

                {reading.yidamImageUri && (
                  <div className="animated-aurora-background rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src={reading.yidamImageUri}
                      alt={t('yidamsImageAlt', { name: reading.deityName })}
                      data-ai-hint="deity thangka painting"
                      width={512}
                      height={512}
                      className="w-full h-auto object-contain relative z-10 bg-black/10"
                    />
                  </div>
                )}
                
                 <div className="prose-base lg:prose-lg dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed text-justify space-y-4">
                    {reading.introduction && <p>{reading.introduction}</p>}
                    {reading.storyAndElement && <p>{reading.storyAndElement}</p>}
                    {reading.connectionToQuery && <p>{reading.connectionToQuery}</p>}
                    {reading.adviceAndMudra && <p>{reading.adviceAndMudra}</p>}
                </div>

                {reading.mandalaImageUri && (
                  <div className="my-6">
                      <h3 className="text-xl font-bold font-serif mb-3 text-accent flex items-center justify-center">
                          <Sparkles className="mr-2 h-5 w-5"/> Mandala de Cura
                      </h3>
                      {reading.mandalaCouncil && (
                         <blockquote className="text-center italic text-muted-foreground border-none p-4 mb-4">
                          "{reading.mandalaCouncil}"
                        </blockquote>
                      )}
                      <div className="animated-aurora-background rounded-lg overflow-hidden shadow-lg">
                          <Image
                          src={reading.mandalaImageUri}
                          alt="Mandala de cura gerada para a leitura"
                          data-ai-hint="healing energy mandala"
                          width={512}
                          height={512}
                          className="w-full h-auto object-contain relative z-10 bg-black/10"
                          />
                      </div>
                  </div>
                )}

                <div className="space-y-4 pt-4">
                    <h3 className="text-xl font-bold font-serif text-accent flex items-center"><Mic2 className="mr-2 h-5 w-5"/>{t('yidamsMantraLabel')}</h3>
                    <blockquote className="border-l-4 border-accent pl-4 text-foreground/90">
                    <p className="text-lg italic font-semibold">{reading.mantra}</p>
                    {reading.mantraPronunciation && (
                        <div className="mt-3 flex items-start text-sm text-muted-foreground">
                        <strong>Pronúncia:</strong>&nbsp;{reading.mantraPronunciation}
                        </div>
                    )}
                    {reading.mantraTranslation && (
                        <div className="mt-2 flex items-start text-sm text-muted-foreground">
                        <strong>Tradução:</strong>&nbsp;{reading.mantraTranslation}
                        </div>
                    )}
                    </blockquote>
                </div>
              </div>
            )}
            
             <div className="pt-8">
                <AdSlot id="ad-reading-bottom" />
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
