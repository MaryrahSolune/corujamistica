
'use client';

import { useState, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateReadingInterpretation, type GenerateReadingInterpretationInput, type GenerateReadingInterpretationOutput } from '@/ai/flows/generate-reading-interpretation';
import Image from 'next/image';
import { Loader2, UploadCloud, Wand2, VenetianMask, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { deductCredit } from '@/services/creditService';
import { saveReading, type TarotReadingData } from '@/services/readingService';
import { cn } from '@/lib/utils';
import { AdSlot } from '@/components/AdSlot';

interface ExtendedGenerateReadingOutput extends GenerateReadingInterpretationOutput {
  summaryImageUri?: string;
}

export default function NewReadingPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [interpretationResult, setInterpretationResult] = useState<ExtendedGenerateReadingOutput | null>(null);
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
    if (!imageDataUri) {
      toast({ title: t('noImageErrorTitle'), description: t('noImageErrorDescription'), variant: 'destructive' });
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
      // 1. Deduct credit first
      const deductResult = await deductCredit(currentUser.uid);
      if (!deductResult.success) {
        throw new Error(deductResult.message || t('creditDeductionFailedError')); 
      }
      refreshCredits(); 

      // 2. Generate interpretation
      const input: GenerateReadingInterpretationInput = {
        cardSpreadImage: imageDataUri,
        query: query,
      };
      const result = await generateReadingInterpretation(input) as ExtendedGenerateReadingOutput; // Cast to include potential summaryImageUri
      setInterpretationResult(result);

      // 3. Save reading to RTDB
      if (result.interpretation) {
        const readingToSave: Partial<Omit<TarotReadingData, 'interpretationTimestamp'>> & Pick<TarotReadingData, 'type' | 'query' | 'interpretationText'> = {
          type: 'tarot',
          query: query,
          interpretationText: result.interpretation,
        };
        if (imageDataUri) {
          readingToSave.cardSpreadImageUri = imageDataUri;
        }
        if (result.summaryImageUri && typeof result.summaryImageUri === 'string' && result.summaryImageUri.trim() !== '') {
          readingToSave.summaryImageUri = result.summaryImageUri;
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

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
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
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
      setInterpretationResult(null); 
      setError(null);
    } else {
      setFileName(null);
      setImagePreview(null);
      setImageDataUri(null);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto animated-aurora-background rounded-xl mb-8">
        <Card className="relative z-10 bg-card/90 dark:bg-card/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-serif flex items-center">
              <Wand2 className="h-8 w-8 mr-3 text-primary animate-icon-flow" />
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent bg-[length:200%_auto] animate-text-gradient-flow">
                {t('newCardReadingTitle')}
              </span>
            </CardTitle>
            <CardDescription>
              {t('newCardReadingDescription')} {userCredits && t('creditsAvailable', {count: userCredits.balance})}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-lg">{t('uploadCardSpreadImageLabel')}</Label>
                <div className="flex items-center gap-4">
                    <Input
                      id="card-image"
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="card-image"
                      className={cn(
                          buttonVariants({ variant: 'outline' }),
                          'cursor-pointer',
                          isLoading && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      <UploadCloud className="mr-2 h-4 w-4" />
                      {t('chooseFileButton')}
                    </Label>
                    <span className="text-sm text-muted-foreground truncate">
                      {fileName || t('noFileChosenText')}
                    </span>
                </div>
                {imagePreview && (
                  <div className="mt-4 border rounded-lg p-2 bg-muted/50 flex justify-center">
                    <Image
                      src={imagePreview}
                      alt={t('cardSpreadPreviewAlt')} 
                      data-ai-hint="tarot card spread user upload"
                      width={400}
                      height={300}
                      className="rounded-md object-contain max-h-[300px]"
                    />
                  </div>
                )}
              </div>

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
                disabled={isLoading || !imageDataUri || !query.trim() || (userCredits && userCredits.balance < 1)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('generatingInterpretationButton')}
                  </>
                ) : (
                  <>
                    <UploadCloud className="mr-2 h-5 w-5" />
                    {t('getYourReadingButton')}
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

      {interpretationResult && interpretationResult.summaryImageUri && (
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
                src={interpretationResult.summaryImageUri}
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
          width={300}
          height={200}
          unoptimized={true}
          className="rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
}
