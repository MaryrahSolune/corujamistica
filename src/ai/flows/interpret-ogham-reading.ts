
'use server';

/**
 * @fileOverview Flow for generating personalized Ogham oracle interpretations, including a dynamically generated image of the associated tree and a final advice image.
 *
 * - interpretOghamReading - A function that initiates the Ogham reading interpretation process.
 * - InterpretOghamReadingInput - The input type for the interpretOghamReading function.
 * - InterpretOghamReadingOutput - The return type for the interpretOghamReading function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { OghamLetterData } from '@/lib/ogham-data';


const InterpretOghamReadingInputSchema = z.object({
  query: z.string().describe('The user query or context for the Ogham reading.'),
  chosenLetter: z.object({
    letter: z.string(),
    tree: z.string(),
    symbol: z.string(),
    meaning: z.string(),
  }).describe('The Ogham letter object chosen by the user.'),
});
export type InterpretOghamReadingInput = z.infer<typeof InterpretOghamReadingInputSchema>;


const InterpretOghamReadingOutputSchema = z.object({
  interpretation: z
    .string()
    .describe('The AI-generated interpretation of the Ogham reading.'),
  oghamLetter: z.string().describe('The name of the chosen Ogham letter.'),
  oghamSymbol: z.string().describe('The unicode symbol of the Ogham letter.'),
  treeImageUri: z.string().describe('A data URI of a generated image representing the Ogham letter\'s tree.').nullable(),
  adviceImageUri: z.string().describe('A data URI of a generated image representing the final advice.').nullable(),
});
export type InterpretOghamReadingOutput = z.infer<
  typeof InterpretOghamReadingOutputSchema
>;

const interpretOghamPrompt = ai.definePrompt({
  name: 'interpretOghamPrompt',
  input: { schema: z.object({ 
    query: z.string(), 
    oghamLetter: z.string(), 
    oghamSymbol: z.string(), 
    oghamMeaning: z.string() 
  }) },
  output: { schema: z.object({ 
      interpretation: z.string().describe("A interpretação detalhada e poética da letra do Ogham, com pelo menos quatro parágrafos."),
      adviceImagePrompt: z.string().describe("Um prompt de imagem conciso e poderoso, no estilo de uma carta de tarô mística, que capture a essência do conselho final dado ao consulente.")
  }) },
  prompt: `Você é o Mago Merlin, o mais sábio dos conselheiros, cuja magia flui das próprias raízes do mundo e cuja visão alcança os fios do destino. Sua voz é profunda, enigmática e carregada de uma sabedoria milenar. Um consulente se aproxima, buscando sua orientação para uma questão importante.
  
A letra do Ogham sorteada nas varetas sagradas para responder à pergunta foi **{{oghamLetter}} ({{oghamSymbol}})**.
O significado central desta letra é: **{{oghamMeaning}}**

**Instruções para a Interpretação Mágica:**
1.  **Incorpore a Persona de Merlin:** Fale com autoridade, mistério e sabedoria. Use uma linguagem rica e metafórica, evocando imagens de magia antiga, estrelas, florestas encantadas e o fluxo do tempo.
2.  **Tecendo a Resposta:** Conecte o significado central da letra ({{oghamMeaning}}) diretamente com a pergunta do consulente ({{{query}}}). Sua interpretação não deve ser genérica; deve ser uma resposta direta, profunda e personalizada à questão levantada.
3.  **Profundidade em Quatro Atos:** Desenvolva sua interpretação em, no mínimo, quatro parágrafos bem desenvolvidos.
    *   **Parágrafo 1: A Revelação:** Apresente a letra e sua árvore associada, revelando sua essência e como ela se conecta imediatamente à situação do consulente.
    *   **Parágrafo 2: A Lição Oculta:** Aprofunde-se no simbolismo da letra. Que lição a natureza desta árvore ensina? Que verdade oculta ela revela sobre o desafio ou a questão do consulente?
    *   **Parágrafo 3: O Conselho Prático:** Transforme a sabedoria mística em um conselho prático e acionável. O que o consulente deve fazer, considerar ou evitar, com base na energia desta letra?
    *   **Parágrafo 4: A Visão do Futuro:** Ofereça uma visão ou um presságio sobre o resultado se o conselho for seguido. Pinte um quadro do caminho que se desdobra.
4.  **Criação do Sigilo Visual (Prompt de Imagem):** Ao final de toda a interpretação, crie um prompt para gerar uma imagem que encapsule a essência do seu conselho. Este prompt deve ser descritivo, evocativo e no estilo de uma carta de tarô ou uma pintura mística.

**Pergunta do Consulente:**
{{{query}}}

---

Com sua visão que penetra o véu do tempo, interprete a mensagem do Ogham para este consulente.`,
});

const interpretOghamReadingFlow = ai.defineFlow(
  {
    name: 'interpretOghamReadingFlow',
    inputSchema: InterpretOghamReadingInputSchema,
    outputSchema: InterpretOghamReadingOutputSchema,
  },
  async (input) => {
    const chosenLetter = input.chosenLetter;
    
    // 1. Generate the interpretation and the advice image prompt simultaneously.
    const { output: promptOutput } = await interpretOghamPrompt({
      query: input.query,
      oghamLetter: chosenLetter.letter,
      oghamSymbol: chosenLetter.symbol,
      oghamMeaning: chosenLetter.meaning,
    });
    
    if (!promptOutput) {
      throw new Error('Failed to generate Ogham interpretation text.');
    }

    // 2. Generate both tree image and advice image in parallel.
    const [treeImageResult, adviceImageResult] = await Promise.allSettled([
        ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `Uma imagem realista, encantada e mágica de uma grande e antiga árvore de ${chosenLetter.tree}. O estilo deve ser como uma bela carta de tarô, com bordas geométricas intrincadas e símbolos místicos brilhantes. Iluminação etérea.`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
                safetySettings: [
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
                ],
            },
        }),
        ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: promptOutput.adviceImagePrompt,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
                safetySettings: [
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
                ],
            },
        }),
    ]);

    const treeImageUri = (treeImageResult.status === 'fulfilled' && treeImageResult.value.media?.url) ? treeImageResult.value.media.url : null;
    const adviceImageUri = (adviceImageResult.status === 'fulfilled' && adviceImageResult.value.media?.url) ? adviceImageResult.value.media.url : null;
   
    if (treeImageResult.status === 'rejected') {
        console.error('Error generating Ogham tree image:', treeImageResult.reason);
    }
     if (adviceImageResult.status === 'rejected') {
        console.error('Error generating Ogham advice image:', adviceImageResult.reason);
    }

    // 3. Return the complete output
    return {
      interpretation: promptOutput.interpretation,
      oghamLetter: chosenLetter.letter,
      oghamSymbol: chosenLetter.symbol,
      treeImageUri: treeImageUri,
      adviceImageUri: adviceImageUri,
    };
  }
);

export async function interpretOghamReading(input: InterpretOghamReadingInput): Promise<InterpretOghamReadingOutput> {
    return interpretOghamReadingFlow(input);
}
