
'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateTarotInterpretation, type GenerateTarotInterpretationInput, type GenerateTarotInterpretationOutput } from '@/ai/flows/generate-tarot-interpretation';
import { generateCiganoInterpretation, type GenerateCiganoInterpretationInput, type GenerateCiganoInterpretationOutput } from '@/ai/flows/generate-cigano-interpretation';
import { generateMesaRealInterpretation, type GenerateMesaRealInterpretationInput, type GenerateMesaRealInterpretationOutput } from '@/ai/flows/generate-mesareal-interpretation';
import Image from 'next/image';
import { Loader2, UploadCloud, Wand2, VenetianMask, Sparkles, BookHeart, Grid3x3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { saveReading, type TarotReadingData } from '@/services/readingService';
import { cn } from '@/lib/utils';
import { AdSlot } from '@/components/AdSlot';

type ReadingType = 'tarot' | 'cigano' | 'mesaReal';
type InterpretationResult = GenerateTarotInterpretationOutput | GenerateCiganoInterpretationOutput | GenerateMesaRealInterpretationOutput;

export default function NewReadingPage() {
  // State for Tarot form
  const [tarotImagePreview, setTarotImagePreview] = useState<string | null>(null);
  const [tarotImageDataUri, setTarotImageDataUri] = useState<string | null>(null);
  const [tarotFileName, setTarotFileName] = useState<string | null>(null);
  const [tarotQuery, setTarotQuery] = useState<string>('');

  // State for Cigano (Free) form
  const [ciganoImagePreview, setCiganoImagePreview] = useState<string | null>(null);
  const [ciganoImageDataUri, setCiganoImageDataUri] = useState<string | null>(null);
  const [ciganoFileName, setCiganoFileName] = useState<string | null>(null);
  const [ciganoQuery, setCiganoQuery] = useState<string>('');
  
  // State for Mesa Real form
  const [mesaRealImagePreview, setMesaRealImagePreview] = useState<string | null>(null);
  const [mesaRealImageDataUri, setMesaRealImageDataUri] = useState<string | null>(null);
  const [mesaRealFileName, setMesaRealFileName] = useState<string | null>(null);
  const [mesaRealQuery, setMesaRealQuery] = useState<string>('');

  const [interpretationResult, setInterpretationResult] = useState<InterpretationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  const handleSubmit = async (event: FormEvent, readingType: ReadingType) => {
    event.preventDefault();

    if (!currentUser) {
      toast({ title: t('authErrorTitle'), description: t('mustBeLoggedInToRead'), variant: 'destructive' }); 
      return;
    }
    
    let currentImageDataUri: string | null = null;
    let currentQuery: string = '';
    let apiCall: (input: any) => Promise<any>;

    switch (readingType) {
        case 'tarot':
            currentImageDataUri = tarotImageDataUri;
            currentQuery = tarotQuery;
            apiCall = generateTarotInterpretation;
            break;
        case 'cigano':
            currentImageDataUri = ciganoImageDataUri;
            currentQuery = ciganoQuery;
            apiCall = generateCiganoInterpretation;
            break;
        case 'mesaReal':
            currentImageDataUri = mesaRealImageDataUri;
            currentQuery = mesaRealQuery;
            apiCall = generateMesaRealInterpretation;
            break;
    }

    if (!currentImageDataUri) {
      toast({ title: t('noImageErrorTitle'), description: t('noImageErrorDescription'), variant: 'destructive' });
      return;
    }
    if (!currentQuery.trim()) {
      toast({ title: t('noQueryErrorTitle'), description: t('noQueryErrorDescription'), variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setInterpretationResult(null);
    setError(null);

    try {
      const input = {
        cardSpreadImage: currentImageDataUri,
        query: currentQuery,
      };
      const result = await apiCall(input);
      setInterpretationResult(result);

      if (result.interpretation) {
        const readingToSave: Partial<Omit<TarotReadingData, 'interpretationTimestamp'>> & Pick<TarotReadingData, 'type' | 'query' | 'interpretationText'> = {
          type: 'tarot', // Using a generic type for saving for now
          query: currentQuery,
          interpretationText: result.interpretation,
        };
        if (currentImageDataUri) {
          readingToSave.cardSpreadImageUri = currentImageDataUri;
        }
        if (result.mandalaImageUri) {
          readingToSave.mandalaImageUri = result.mandalaImageUri;
        }
        
        await saveReading(currentUser.uid, readingToSave as Omit<TarotReadingData, 'interpretationTimestamp'>);
      }

      toast({ title: t('interpretationReadyTitle'), description: t('interpretationReadyDescription') });
    } catch (err: any) {
      console.error('Error in reading process:', err);
      const errorMessage = err.message || t('errorGeneratingInterpretationDescription');
      setError(errorMessage);
      toast({ title: t('errorGenericTitle'), description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>, readingType: ReadingType) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          title: t('imageTooLargeTitle'),
          description: t('imageTooLargeDescription'),
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        switch (readingType) {
            case 'tarot':
                setTarotFileName(file.name);
                setTarotImagePreview(dataUri);
                setTarotImageDataUri(dataUri);
                break;
            case 'cigano':
                setCiganoFileName(file.name);
                setCiganoImagePreview(dataUri);
                setCiganoImageDataUri(dataUri);
                break;
            case 'mesaReal':
                setMesaRealFileName(file.name);
                setMesaRealImagePreview(dataUri);
                setMesaRealImageDataUri(dataUri);
                break;
        }
      };
      reader.readAsDataURL(file);
      setInterpretationResult(null); 
      setError(null);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-12">
      {/* Tarot Section */}
      <div className="max-w-2xl mx-auto animated-aurora-background rounded-xl">
        <Card className="relative z-10 bg-card/90 dark:bg-card/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-serif flex items-center">
              <Wand2 className="h-8 w-8 mr-3 text-primary animate-icon-flow" />
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent bg-[length:200%_auto] animate-text-gradient-flow">
                Tarô Tradicional & Oráculos
              </span>
            </CardTitle>
            <CardDescription>
              Para leituras com Tarô de Marselha e outros oráculos de 22 arcanos maiores.
            </CardDescription>
          </CardHeader>
          <form onSubmit={(e) => handleSubmit(e, 'tarot')}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-lg">{t('uploadCardSpreadImageLabel')}</Label>
                <div className="flex items-center gap-4">
                    <Input
                      id="tarot-image"
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={(e) => handleImageChange(e, 'tarot')}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="tarot-image"
                      className={cn(buttonVariants({ variant: 'outline' }), 'cursor-pointer', isLoading && 'cursor-not-allowed opacity-50')}
                    >
                      <UploadCloud className="mr-2 h-4 w-4" />
                      {t('chooseFileButton')}
                    </Label>
                    <span className="text-sm text-muted-foreground truncate">
                      {tarotFileName || t('noFileChosenText')}
                    </span>
                </div>
                {tarotImagePreview && (
                  <div className="mt-4 border rounded-lg p-2 bg-muted/50 flex justify-center">
                    <Image
                      src={tarotImagePreview} alt={t('cardSpreadPreviewAlt')} data-ai-hint="tarot card spread user upload"
                      width={400} height={300} className="rounded-md object-contain max-h-[300px]"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tarot-query" className="text-lg">{t('yourQuestionLabel')}</Label>
                <Textarea
                  id="tarot-query" value={tarotQuery} onChange={(e) => setTarotQuery(e.target.value)}
                  placeholder={t('questionPlaceholder')} rows={4} className="resize-none" disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full text-lg py-6" disabled={isLoading || !tarotImageDataUri || !tarotQuery.trim()}>
                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t('generatingInterpretationButton')}</> : <><BookHeart className="mr-2 h-5 w-5" />{t('getYourReadingButton')}</>}
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

      {interpretationResult && interpretationResult.interpretation && (
        <div className="max-w-2xl mx-auto mt-8 animated-aurora-background rounded-lg">
          <Card className="shadow-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 backdrop-blur-md relative z-10">
            <CardHeader>
              <CardTitle className="text-2xl font-serif flex items-center">
                <VenetianMask className="h-7 w-7 mr-3 text-accent" />
                {t('yourMysticalInterpretationTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose-base lg:prose-lg dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed text-justify">
                {interpretationResult.interpretation}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {interpretationResult && (interpretationResult as any).mandalaImageUri && (
        <div className="max-w-2xl mx-auto mt-8 animated-aurora-background rounded-lg">
          <Card className="shadow-2xl bg-gradient-to-br from-accent/20 via-transparent to-secondary/20 backdrop-blur-md relative z-10">
            <CardHeader>
              <CardTitle className="text-2xl font-serif flex items-center">
                <Sparkles className="h-7 w-7 mr-3 text-primary" /> 
                {t('yourVisualBlessingTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Image
                src={(interpretationResult as any).mandalaImageUri}
                alt={t('summaryImageAlt')}
                data-ai-hint="spiritual guidance orixa blessing"
                width={512}
                height={512}
                className="rounded-lg shadow-lg object-contain"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {(isLoading || interpretationResult) && (
        <div className="max-w-2xl mx-auto mt-8">
            <AdSlot id="ad-new-reading-bottom" />
        </div>
      )}

      <div className="mt-12 flex justify-center">
        <Image
          src="/img/coruja.gif"
          alt="Animação Mística Decorativa de Fogueira"
          data-ai-hint="mystical animation bonfire"
          width={420}
          height={280}
          unoptimized={true}
          className="rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
}
