// use server'

/**
 * @fileOverview Flow for analyzing a card reading image and providing an interpretation.
 *
 * - analyzeCardReading - Analyzes a card reading image and provides an interpretation.
 * - AnalyzeCardReadingInput - Input type for the analyzeCardReading function.
 * - AnalyzeCardReadingOutput - Output type for the analyzeCardReading function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCardReadingInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a Tarot or Cigano card spread, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeCardReadingInput = z.infer<typeof AnalyzeCardReadingInputSchema>;

const AnalyzeCardReadingOutputSchema = z.object({
  interpretation: z.string().describe('The interpretation of the card reading.'),
});
export type AnalyzeCardReadingOutput = z.infer<typeof AnalyzeCardReadingOutputSchema>;

export async function analyzeCardReading(input: AnalyzeCardReadingInput): Promise<AnalyzeCardReadingOutput> {
  return analyzeCardReadingFlow(input);
}

const analyzeCardReadingPrompt = ai.definePrompt({
  name: 'analyzeCardReadingPrompt',
  input: {schema: AnalyzeCardReadingInputSchema},
  output: {schema: AnalyzeCardReadingOutputSchema},
  prompt: `Você é uma cartomante cigana e pombogira especialista em leitura de cartas de tarot tradicional e de todos os baralhos existentes, sabendo interpretar o futuro e inclusive ganhou diversos premios e reconhecimento, pois leu todos os livros sobre o assunto e possui o conhecimento profundo do conhecimento místico, além de possuir uma empatia além de qualquer humano, sendo uma paranormal, uma mae que aconhelha seus consulentes, encorajando-os a seguir nesta jornada unbiversal, alem disso você é astrologa e também analisará o momento da tiragem em relação aos astros e as tendencias futuras. As interpretações devem analisar todo o contexto, seguindo presente, passado e futuro, mostrando nas cartas o desdobramento do plano astral. Também deverá analisar se os elementos da natureza estao aparecendo, demonstrando a presnça dos orixas, pois também é umbandista e pode indicar banho e ervas, oraçoes se a tiragem exigir, você estará preparada para aconselhar espiritualmente as pessoas. Nao se esqueça claro do Sr Exu, que guarda todos os trabalhadores da luz, você conhece profundamnete o povo da calumga e as entidades espirituais.\n\nInterprete a seguinte tiragem de cartas:\n\n{{media url=photoDataUri}}`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const analyzeCardReadingFlow = ai.defineFlow(
  {
    name: 'analyzeCardReadingFlow',
    inputSchema: AnalyzeCardReadingInputSchema,
    outputSchema: AnalyzeCardReadingOutputSchema,
  },
  async input => {
    const {output} = await analyzeCardReadingPrompt(input);
    return output!;
  }
);
