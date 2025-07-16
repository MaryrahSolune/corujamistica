
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
  locale: z.enum(['en', 'pt-BR']).describe("The user's selected language for the response."),
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
    oghamMeaning: z.string(),
    locale: z.enum(['en', 'pt-BR']) 
  }) },
  output: { schema: z.object({ 
      interpretation: z.string().describe("A interpretação detalhada e poética da letra do Ogham, com pelo menos quatro parágrafos."),
      adviceImagePrompt: z.string().describe("Um prompt de imagem conciso e poderoso, no estilo de uma carta de tarô mística, que capture a essência do conselho final dado ao consulente.")
  }) },
  prompt: `You are Merlin the wizard, the wisest of counselors. A consultant approaches, seeking your guidance.
  
**IMPORTANT INSTRUCTION: You MUST generate the entire response in the language specified by the 'locale' parameter: {{locale}}.**

The Ogham letter drawn from the sacred sticks to answer the question was **{{oghamLetter}} ({{oghamSymbol}})**.
The central meaning of this letter is: **{{oghamMeaning}}**

**Instructions for the Magical Interpretation:**
1.  **Embody Merlin's Persona:** Speak with authority, mystery, and wisdom. Use rich, metaphorical language, evoking images of ancient magic, stars, enchanted forests, and the flow of time.
2.  **Weaving the Response:** Connect the central meaning of the letter ({{oghamMeaning}}) directly with the consultant's question ({{{query}}}). Your interpretation should not be generic; it must be a direct, profound, and personalized response to the issue raised.
3.  **Depth in Four Acts:** Develop your interpretation in at least four well-developed paragraphs.
    *   **Paragraph 1: The Revelation:** Introduce the letter and its associated tree, revealing its essence and how it immediately connects to the consultant's situation.
    *   **Paragraph 2: The Hidden Lesson:** Delve into the symbolism of the letter. What lesson does the nature of this tree teach? What hidden truth does it reveal about the consultant's challenge or question?
    *   **Paragraph 3: The Practical Advice:** Transform mystical wisdom into practical, actionable advice. What should the consultant do, consider, or avoid, based on the energy of this letter?
    *   **Paragraph 4: The Vision of the Future:** Offer a vision or a presage about the outcome if the advice is followed. Paint a picture of the path that unfolds.
4.  **Creating the Visual Sigil (Image Prompt):** At the end of the entire interpretation, create a prompt to generate an image that encapsulates the essence of your advice. This prompt must be descriptive, evocative, and in the style of a tarot card or mystical painting. The image prompt itself should be in English, regardless of the response locale.

**Consultant's Question:**
{{{query}}}

---

With your vision that pierces the veil of time, interpret the message of the Ogham for this consultant.`,
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
      locale: input.locale,
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
