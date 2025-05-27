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

export default function NewReadingPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          title: "Image too large",
          description: "Please upload an image smaller than 4MB.",
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
      setInterpretation(null); // Clear previous interpretation
      setError(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!imageDataUri) {
      toast({ title: 'No Image', description: 'Please upload an image of your card spread.', variant: 'destructive' });
      return;
    }
    if (!query.trim()) {
      toast({ title: 'No Query', description: 'Please enter your question or context for the reading.', variant: 'destructive' });
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
      toast({ title: 'Interpretation Ready!', description: 'Your reading has been generated.' });
    } catch (err: any) {
      console.error('Error generating interpretation:', err);
      setError(err.message || 'Failed to generate interpretation. Please try again.');
      toast({ title: 'Error', description: err.message || 'Failed to generate interpretation.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-serif flex items-center">
            <Wand2 className="h-8 w-8 mr-3 text-primary" />
            New Card Reading
          </CardTitle>
          <CardDescription>
            Upload an image of your Tarot or Cigano card spread and enter your query to receive an AI-powered interpretation.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="card-image" className="text-lg">Upload Card Spread Image</Label>
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
                    alt="Card spread preview"
                    width={400}
                    height={300}
                    className="rounded-md object-contain max-h-[300px]"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="query" className="text-lg">Your Question or Context</Label>
              <Textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="E.g., 'What should I focus on in my career right now?' or 'General reading for the upcoming month.'"
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
                  Generating Interpretation...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-5 w-5" />
                  Get Your Reading
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <Card className="max-w-2xl mx-auto mt-8 border-destructive bg-destructive/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-destructive font-serif">An Error Occurred</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {interpretation && (
        <Card className="max-w-2xl mx-auto mt-8 shadow-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <CardHeader>
            <CardTitle className="text-2xl font-serif flex items-center">
              <VenetianMask className="h-7 w-7 mr-3 text-accent" />
              Your Mystical Interpretation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed">
              {interpretation}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
