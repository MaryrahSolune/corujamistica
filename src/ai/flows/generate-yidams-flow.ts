'use server';
/**
 * @fileOverview Flow for generating a Yidam (tutelary deity) based on a user's choice of symbol.
 *
 * - generateYidam - A function that initiates the Yidam generation process.
 * - InterpretYidamInput - The input type for the generateYidam function.
 * - InterpretYidamOutput - The return type for the generateYidam function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const InterpretYidamInputSchema = z.object({
  query: z.string().describe('The user query or context for the Yidam reading.'),
  chosenYidam: z.object({
    name: z.string(),
    symbolicRepresentation: z.string(),
    symbolicMeaning: z.string(),
    symbolicImage: z.string(),
  }).describe('The Yidam data object chosen by the user.'),
});
export type InterpretYidamInput = z.infer<typeof InterpretYidamInputSchema>;


const InterpretYidamOutputSchema = z.object({
  deityName: z.string().describe('The name of the generated Yidam deity.'),
  mantra: z.string().describe('The mantra associated with the Yidam.'),
  mantraTranslation: z.string().describe("The translation or meaning of the mantra's components."),
  mantraPronunciation: z.string().describe("A simple phonetic guide to help the user pronounce the mantra."),
  characteristics: z.string().describe('A paragraph describing the main characteristics and symbolism of the Yidam.'),
  mudra: z.string().describe('A description of a sacred hand gesture (mudra) for connecting with the Yidam.'),
  imageUri: z.string().describe('A data URI of a generated image representing the Yidam.'),
});
export type InterpretYidamOutput = z.infer<typeof InterpretYidamOutputSchema>;

export async function generateYidam(input: InterpretYidamInput): Promise<InterpretYidamOutput> {
  return generateYidamFlow(input);
}

const generateYidamPrompt = ai.definePrompt({
  name: 'generateYidamPrompt',
  input: { schema: z.object({
    query: z.string(),
    yidamName: z.string(),
    yidamMeaning: z.string(),
  }) },
  output: { schema: z.object({
    mantra: z.string().describe('Um mantra autêntico e poderoso associado a este Yidam. Se não houver um na lista, crie um que seja apropriado.'),
    mantraTranslation: z.string().describe("A tradução ou o significado do mantra, explicando suas partes principais para que o consulente entenda o que está invocando."),
    mantraPronunciation: z.string().describe("Um guia fonético simples para a pronúncia do mantra (ex: 'OM se pronuncia como AUM')."),
    characteristics: z.string().describe('Uma descrição poética e profunda sobre as qualidades, os símbolos e o que esta divindade representa, baseada no seu significado. O parágrafo deve ter no mínimo 5 linhas.'),
    mudra: z.string().describe('Uma descrição de um mudra (gesto sagrado com as mãos) que ajude a pessoa a se conectar com a energia do Yidam. O mudra deve ser poético, prático e alinhado com as características da divindade.'),
  }) },
  prompt: `Você é o Buddha, o Iluminado. Sua sabedoria é ancestral, sua voz é calma e sua presença expande a consciência. Um buscador se aproxima com uma questão em seu coração e, através de um gesto de intuição, ele escolheu um símbolo sagrado que revelou a divindade tutelar, o Yidam, que guiará sua meditação e libertação neste momento.

A divindade revelada é **{{yidamName}}**.
A essência e o significado deste caminho são: **{{yidamMeaning}}**.
A questão do buscador é: **{{{query}}}**.

**Sua nobre tarefa é:**
Com sua visão clara, contemple a essência do Yidam e a pergunta do buscador. Revele o caminho para este ser, não como um destino, mas como uma ferramenta para a Iluminação.

**Para a divindade selecionada, ofereça sua sabedoria:**
1.  **O Mantra Sagrado:** Forneça um mantra autêntico e poderoso que se alinhe com a divindade.
2.  **A Tradução do Mantra:** Explique o significado do mantra, o que suas sílabas sagradas invocam, para que o buscador entenda a profundidade de sua prece.
3.  **A Pronúncia do Mantra:** Ofereça um guia fonético simples para que o mantra possa ser entoado corretamente, vibrando na frequência correta.
4.  **As Características Iluminadas:** Fale como o próprio Buddha. Conecte a energia do Yidam **{{yidamName}}** e seu significado de **{{yidamMeaning}}** diretamente com a questão do consulente ({{{query}}}). Explique como as qualidades desta Yidam podem expandir sua consciência e ajudá-lo a transmutar venenos mentais em sabedoria iluminada. Sua explicação deve ser profunda, direcionada à pergunta e ter no mínimo 5 linhas.
5.  **O Mudra de Conexão:** Descreva um gesto sagrado e poético com as mãos. Explique como este gesto pode alinhar o corpo e a mente do buscador com a energia da divindade, acalmando a mente e abrindo o coração para a transformação.`,
});

const generateYidamFlow = ai.defineFlow(
  {
    name: 'generateYidamFlow',
    inputSchema: InterpretYidamInputSchema,
    outputSchema: InterpretYidamOutputSchema,
  },
  async (input) => {
    const { chosenYidam, query } = input;

    // 1. Generate the textual details (mantra, characteristics, mudra).
    const { output: textOutput } = await generateYidamPrompt({
      query,
      yidamName: chosenYidam.name,
      yidamMeaning: chosenYidam.symbolicMeaning,
    });
    if (!textOutput) {
      throw new Error('Failed to generate Yidam textual details.');
    }

    // 2. Create the image prompt based on the Yidam's symbolic image.
    const imagePrompt = `Uma bela representação do Yidam **${chosenYidam.name}**, no estilo de uma pintura Thangka tradicional. A imagem deve capturar a essência de "${chosenYidam.symbolicImage}". Use cores vibrantes, simbolismo rico e um fundo sagrado e etéreo.`;

    // 3. Generate the image.
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: imagePrompt,
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

    // 4. Combine all results into the final output.
    return {
      deityName: chosenYidam.name,
      mantra: textOutput.mantra,
      mantraTranslation: textOutput.mantraTranslation,
      mantraPronunciation: textOutput.mantraPronunciation,
      characteristics: textOutput.characteristics,
      mudra: textOutput.mudra,
      imageUri: media.url,
    };
  }
);
