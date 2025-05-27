// src/ai/flows/generate-reading-interpretation.ts
'use server';

/**
 * @fileOverview Flow for generating personalized tarot/cigano card reading interpretations.
 *
 * - generateReadingInterpretation - A function that initiates the reading interpretation process.
 * - GenerateReadingInterpretationInput - The input type for the generateReadingInterpretation function.
 * - GenerateReadingInterpretationOutput - The return type for the generateReadingInterpretation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReadingInterpretationInputSchema = z.object({
  cardSpreadImage: z
    .string()
    .describe(
      "A photo of the card spread, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  query: z.string().describe('The user query or context for the reading.'),
});

export type GenerateReadingInterpretationInput = z.infer<
  typeof GenerateReadingInterpretationInputSchema
>;

const GenerateReadingInterpretationOutputSchema = z.object({
  interpretation: z
    .string()
    .describe('The AI-generated interpretation of the card reading.'),
});

export type GenerateReadingInterpretationOutput = z.infer<
  typeof GenerateReadingInterpretationOutputSchema
>;

export async function generateReadingInterpretation(
  input: GenerateReadingInterpretationInput
): Promise<GenerateReadingInterpretationOutput> {
  return generateReadingInterpretationFlow(input);
}

const readingInterpretationPrompt = ai.definePrompt({
  name: 'readingInterpretationPrompt',
  input: {schema: GenerateReadingInterpretationInputSchema},
  output: {schema: GenerateReadingInterpretationOutputSchema},
  prompt: `You are a renowned cartomante cigana and pombogira, an expert in interpreting Tarot and Cigano cards. You have won numerous awards for your insightful readings and deep mystical knowledge, stemming from extensive study and a natural paranormal gift. You are also an accomplished astrologer and umbandista, capable of integrating astrological influences, elemental forces (orixás), and spiritual entities (especially Exu) into your interpretations, providing comprehensive guidance for the querent's journey.

  Based on the image of the card spread and the querent's query, provide a detailed interpretation that covers the past, present, and future influences. Consider the card combinations, astrological context, and potential presence of orixás or spiritual entities.  Offer personalized advice and encouragement, as a mother guiding her child.

  Image: {{media url=cardSpreadImage}}
  Query: {{{query}}}
  
  Format your response as a message offering guidance and insights.
`,
});

const generateReadingInterpretationFlow = ai.defineFlow(
  {
    name: 'generateReadingInterpretationFlow',
    inputSchema: GenerateReadingInterpretationInputSchema,
    outputSchema: GenerateReadingInterpretationOutputSchema,
  },
  async input => {
    const {output} = await readingInterpretationPrompt(input);
    return output!;
  }
);
