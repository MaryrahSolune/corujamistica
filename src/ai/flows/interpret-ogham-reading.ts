
'use server';

/**
 * @fileOverview Flow for generating personalized Ogham oracle interpretations, including a dynamically generated image of the associated tree.
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
  output: { schema: z.object({ interpretation: z.string() }) }, // Only text interpretation from this prompt
  prompt: `Você é um Druida ancião, um guardião da sabedoria das árvores e dos mistérios do Ogham, o alfabeto sagrado dos celtas. Sua voz é calma, poética e profunda, carregada com o conhecimento de eras. Um consulente se aproxima buscando orientação para uma questão específica.
  
A letra do Ogham sorteada para responder à pergunta foi **{{oghamLetter}} ({{oghamSymbol}})**.
O significado central desta letra é: **{{oghamMeaning}}**

**Instruções para a Interpretação:**
1.  **Apresente a Letra:** Comece sua interpretação revelando o nome da letra sorteada ({{oghamLetter}}) e a árvore ou planta a ela associada.
2.  **Tecendo a Resposta:** Conecte o significado central da letra ({{oghamMeaning}}) diretamente com a pergunta do consulente ({{{query}}}). A sua interpretação não deve ser genérica; ela deve ser uma resposta direta e personalizada à questão levantada.
3.  **Use Metáforas da Natureza:** Enriqueça sua resposta com metáforas e imagens relacionadas à árvore da letra sorteada ou a elementos da natureza (raízes, galhos, estações do ano, o vento, a terra, etc.).
4.  **Tom Sábio e Orientador:** Fale como um verdadeiro Druida. Ofereça conselhos práticos e espirituais, guiando o consulente a refletir sobre como a energia daquela letra pode ser aplicada em sua vida para resolver a questão.
5.  **Estrutura:** A interpretação deve ser um texto coeso e poético, com no mínimo dois parágrafos bem desenvolvidos.

**Pergunta do Consulente:**
{{{query}}}

---

Interprete a mensagem do Ogham para este consulente.`,
});

const interpretOghamReadingFlow = ai.defineFlow(
  {
    name: 'interpretOghamReadingFlow',
    inputSchema: InterpretOghamReadingInputSchema,
    outputSchema: InterpretOghamReadingOutputSchema,
  },
  async (input) => {
    // 1. The letter is now passed in directly from the frontend
    const chosenLetter = input.chosenLetter;
    
    // 2. Generate the interpretation based on the drawn letter and the user's query
    const { output: interpretationOutput } = await interpretOghamPrompt({
      query: input.query,
      oghamLetter: chosenLetter.letter,
      oghamSymbol: chosenLetter.symbol,
      oghamMeaning: chosenLetter.meaning,
    });
    
    if (!interpretationOutput) {
      throw new Error('Failed to generate Ogham interpretation text.');
    }

    // 3. Generate the tree image in parallel
    let treeImageUri: string | null = null;
    try {
        const imagePrompt = `A realistic and enchanted, magical image of a large, ancient ${chosenLetter.tree} tree. The style should be like a beautiful tarot card, with intricate geometric borders and mystical glowing symbols. Ethereal lighting.`;
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
        treeImageUri = media?.url || null;
    } catch (e) {
        console.error('Error generating Ogham tree image:', e);
        // Fail gracefully, the text interpretation will still be returned.
        treeImageUri = null;
    }

    // 4. Return the complete output
    return {
      interpretation: interpretationOutput.interpretation,
      oghamLetter: chosenLetter.letter,
      oghamSymbol: chosenLetter.symbol,
      treeImageUri: treeImageUri,
    };
  }
);

export async function interpretOghamReading(input: InterpretOghamReadingInput): Promise<InterpretOghamReadingOutput> {
    return interpretOghamReadingFlow(input);
}
