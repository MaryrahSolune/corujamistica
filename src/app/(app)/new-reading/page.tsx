
'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateReadingInterpretation, type GenerateReadingInterpretationInput } from '@/ai/flows/generate-reading-interpretation';
import Image from 'next/image';
import { Loader2, UploadCloud, Wand2, VenetianMask } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NewReadingPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
      setInterpretation(null); 
      setError(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!imageDataUri) {
      toast({ title: t('noImageErrorTitle'), description: t('noImageErrorDescription'), variant: 'destructive' });
      return;
    }
    if (!query.trim()) {
      toast({ title: t('noQueryErrorTitle'), description: t('noQueryErrorDescription'), variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setInterpretation(null);
    setError(null);

    try {
      const input: GenerateReadingInterpretationInput = {
        cardSpreadImage: imageDataUri,
        query: query,
      };
      const result = await generateReadingInterpretation(input);
      setInterpretation(result.interpretation);
      toast({ title: t('interpretationReadyTitle'), description: t('interpretationReadyDescription') });
    } catch (err: any) {
      console.error('Error generating interpretation:', err);
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
              <Wand2 className="h-8 w-8 mr-3 text-primary" />
              {t('newCardReadingTitle')}
            </CardTitle>
            <CardDescription>
              {t('newCardReadingDescription')}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="card-image" className="text-lg">{t('uploadCardSpreadImageLabel')}</Label>
                <Input
                  id="card-image"
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  disabled={isLoading}
                />
                {imagePreview && (
                  <div className="mt-4 border rounded-lg p-2 bg-muted/50 flex justify-center">
                    <Image
                      src={imagePreview}
                      alt={t('cardSpreadPreviewAlt')} 
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
              <Button type="submit" className="w-full text-lg py-6" disabled={isLoading || !imageDataUri || !query.trim()}>
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

      {interpretation && (
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
                {interpretation}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
