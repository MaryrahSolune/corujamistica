
'use client';


import { useState, type FormEvent, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { interpretDream, type InterpretDreamOutput } from '@/ai/flows/interpret-dream-flow';
import { Loader2, MessageCircleQuestion, BookOpenText, BrainCircuit, Library, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { saveReading, type DreamInterpretationData } from '@/services/readingService';
import { getDreamDictionaryEntry } from '@/services/dreamDictionaryService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AdSlot } from '@/components/AdSlot';
import { Input } from '@/components/ui/input';

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

export default function DreamInterpretationPage() {
  const [dreamDescription, setDreamDescription] = useState<string>('');
  const [interpretationResult, setInterpretationResult] = useState<InterpretDreamOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  // State for manual dictionary lookup
  const [selectedLetter, setSelectedLetter] = useState('A');
  const [dictionaryContent, setDictionaryContent] = useState('');
  const [isLoadingDictionary, setIsLoadingDictionary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContent, setFilteredContent] = useState('');

  const normalizeText = (text: string) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const fetchDictionaryEntry = useCallback(async (letter: string) => {
    setIsLoadingDictionary(true);
    setSearchQuery(''); // Reset search on letter change
    try {
      const content = await getDreamDictionaryEntry(letter);
      setDictionaryContent(content);
      setFilteredContent(content);
    } catch (error) {
      toast({ title: t('errorGenericTitle'), description: t('dictionaryFetchError'), variant: 'destructive' });
      const errorMsg = t('dictionaryFetchError');
      setDictionaryContent(errorMsg);
      setFilteredContent(errorMsg);
    } finally {
      setIsLoadingDictionary(false);
    }
  }, [t, toast]);

  useEffect(() => {
    fetchDictionaryEntry(selectedLetter);
  }, [selectedLetter, fetchDictionaryEntry]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredContent(dictionaryContent);
      return;
    }

    const normalizedQuery = normalizeText(searchQuery);
    const definitions = dictionaryContent.split(/(?=[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ][a-zA-Záéíóúàâêôãõç\s-]*?\s—)/);
    
    const foundDefinitions = definitions.filter(def => {
      const match = def.trim().match(/^([a-zA-Záéíóúàâêôãõç\s-]+?)\s—/);
      if (match) {
        const term = normalizeText(match[1].trim());
        return term.includes(normalizedQuery);
      }
      return false;
    });

    if (foundDefinitions.length > 0) {
      setFilteredContent(foundDefinitions.join('\n\n'));
    } else {
      setFilteredContent(t('noResultsFoundForQuery', { query: searchQuery }));
    }
  }, [searchQuery, dictionaryContent, t]);


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!currentUser) {
      toast({ title: t('authErrorTitle'), description: t('mustBeLoggedInToInterpret'), variant: 'destructive' });
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
      // Interpret dream. The flow now returns both parts of the interpretation.
      const result = await interpretDream({ dreamDescription });
      setInterpretationResult(result);

      // Save dream interpretation to DB
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
              {t('dreamInterpretationDescription')}
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
                disabled={
                  isLoading ||
                  !dreamDescription.trim() || 
                  dreamDescription.trim().length < 10
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
          <div className='space-y-8'>
              {/* Card for the Dictionary Interpretation - Now always rendered first if content exists */}
              {interpretationResult.dictionaryInterpretation && (
                <div className="max-w-2xl mx-auto animated-aurora-background rounded-lg">
                  <Card className="shadow-lg bg-gradient-to-br from-primary/20 via-transparent to-accent/20 backdrop-blur-md relative z-10">
                      <CardHeader>
                          <CardTitle className="text-2xl font-serif flex items-center">
                              <Library className="h-7 w-7 mr-3 text-accent" />
                              {t('dreamDictionaryInterpretationTitle')}
                          </CardTitle>
                      </CardHeader>
                      <CardContent>
                          <p className="prose-base lg:prose-lg dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed text-justify">
                              {interpretationResult.dictionaryInterpretation}
                          </p>
                      </CardContent>
                  </Card>
              </div>
              )}

              {/* Card for the Prophetic Story Interpretation */}
              {interpretationResult.storySegments.length > 0 && (
                    <div className="max-w-2xl mx-auto animated-aurora-background rounded-lg">
                      <Card className="shadow-2xl bg-gradient-to-br from-accent/20 via-transparent to-secondary/20 backdrop-blur-md relative z-10">
                      <CardHeader>
                          <CardTitle className="text-2xl font-serif flex items-center">
                          <BookOpenText className="h-7 w-7 mr-3 text-accent" />
                          {t('yourPropheticInterpretationTitle')}
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                          {interpretationResult.storySegments.map((segment, index) => (
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
      )}

      {(isLoading || interpretationResult) && (
        <div className="max-w-2xl mx-auto mt-8">
            <AdSlot id="ad-dream-bottom" />
        </div>
      )}

      {/* Manual Dictionary Lookup Section */}
      <div className="max-w-2xl mx-auto mt-12 w-full">
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className='flex items-center text-lg'>
                    <Library className="h-6 w-6 mr-3 text-primary" />
                    {t('dreamDictionaryTitle')}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 rounded-b-lg bg-card/50">
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="dictionary-letter" className="text-md">{t('selectLetterLabel')}</Label>
                          <Select value={selectedLetter} onValueChange={setSelectedLetter}>
                            <SelectTrigger id="dictionary-letter" className="w-full sm:w-[180px]">
                              <SelectValue placeholder="Selecione uma letra" />
                            </SelectTrigger>
                            <SelectContent>
                              {alphabet.map(letter => (
                                <SelectItem key={letter} value={letter}>{`Letra ${letter}`}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                         <div className="flex-1 space-y-2">
                            <Label htmlFor="dictionary-search" className="text-md">{t('searchInDictionaryLabel')}</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="dictionary-search"
                                    placeholder={t('searchInDictionaryPlaceholder', { letter: selectedLetter })}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                      </div>
                      
                      <div>
                        {isLoadingDictionary ? (
                          <Skeleton className="h-72 w-full mt-2" />
                        ) : (
                          <ScrollArea className="h-72 w-full rounded-md border p-4 mt-2 bg-muted/30">
                            <div className="prose-base dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed text-justify">
                              {filteredContent || t('dictionaryContentPlaceholder', { letter: selectedLetter })}
                            </div>
                          </ScrollArea>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
            </AccordionItem>
          </Accordion>
      </div>


      <img src="/img/olho.gif" alt="Olho místico" className="mt-8 mx-auto block w-full max-w-2xl h-auto" />
    </div>
  );
}
