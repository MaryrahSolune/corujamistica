'use server';
/**
 * @fileOverview Flow for generating a Yidam (tutelary deity) based on a user's birth date.
 *
 * - generateYidam - A function that initiates the Yidam generation process.
 * - GenerateYidamInput - The input type for the generateYidam function.
 * - GenerateYidamOutput - The return type for the generateYidam function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateYidamInputSchema = z.object({
  birthDate: z
    .string()
    .describe('The user\'s birth date in DD/MM/YYYY format.'),
});
export type GenerateYidamInput = z.infer<typeof GenerateYidamInputSchema>;

const GenerateYidamOutputSchema = z.object({
  deityName: z.string().describe('The name of the generated Yidam deity.'),
  mantra: z.string().describe('The mantra associated with the Yidam.'),
  characteristics: z.string().describe('A paragraph describing the main characteristics and symbolism of the Yidam.'),
  imageUri: z.string().describe('A data URI of a generated image representing the Yidam.'),
});
export type GenerateYidamOutput = z.infer<typeof GenerateYidamOutputSchema>;

export async function generateYidam(input: GenerateYidamInput): Promise<GenerateYidamOutput> {
  return generateYidamFlow(input);
}

const generateYidamPrompt = ai.definePrompt({
  name: 'generateYidamPrompt',
  input: { schema: GenerateYidamInputSchema },
  output: { schema: z.object({
    deityName: z.string().describe('The name of the Yidam deity.'),
    mantra: z.string().describe('A powerful and authentic mantra associated with this deity.'),
    characteristics: z.string().describe('A detailed paragraph of at least 5 lines about the deity\'s qualities, symbols, and what it represents.'),
    imagePrompt: z.string().describe('A vivid, artistic prompt for an image generator to create a beautiful, thangka-style representation of the deity.'),
  }) },
  prompt: `Você é um LAMA, um mestre do budismo tibetano, com profundo conhecimento de astrologia e das divindades tântricas (Yidams). Um discípulo informou sua data de nascimento e busca descobrir qual Yidam ressoa com sua essência para guiar sua meditação e caminho espiritual.

Baseado na data de nascimento fornecida ({{{birthDate}}}), determine astrologicamente a principal divindade Yidam para esta pessoa.

Para a divindade identificada, forneça:
1.  **Nome da Divindade:** O nome claro e correto do Yidam.
2.  **Mantra:** O mantra autêntico e poderoso associado a este Yidam.
3.  **Características:** Uma descrição poética e profunda sobre as qualidades, os símbolos (cores, elementos, objetos que carrega) e o que esta divindade representa no caminho da iluminação. O parágrafo deve ter no mínimo 5 linhas.
4.  **Prompt de Imagem:** Crie um prompt detalhado e artístico para um gerador de imagens, descrevendo uma representação do Yidam no estilo de uma pintura Thangka tradicional, com cores vibrantes, simbolismo e um fundo sagrado.

Data de Nascimento do Discípulo: {{{birthDate}}}

Revele a sabedoria dos céus e das estrelas.`,
});

const generateYidamFlow = ai.defineFlow(
  {
    name: 'generateYidamFlow',
    inputSchema: GenerateYidamInputSchema,
    outputSchema: GenerateYidamOutputSchema,
  },
  async (input) => {
    // 1. Generate the textual details and the image prompt.
    const { output: promptOutput } = await generateYidamPrompt(input);
    if (!promptOutput) {
      throw new Error('Failed to generate Yidam details.');
    }

    // 2. Generate the image based on the created prompt.
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: promptOutput.imagePrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
        ],
      },
    });

    if (!media?.url) {
      throw new Error('Failed to generate Yidam image.');
    }

    // 3. Combine all results into the final output.
    return {
      deityName: promptOutput.deityName,
      mantra: promptOutput.mantra,
      characteristics: promptOutput.characteristics,
      imageUri: media.url,
    };
  }
);
