
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

// Ogham letters data (Aicme A, B, C, D, and Forfeda)
// This is now also used by the frontend to display the sticks
export const oghamLetters = [
    // Aicme Beithe (Birch Group)
    { letter: "Beith", tree: "Birch", symbol: "ᚁ", meaning: "Birch, Beginnings, New starts, Purification, Renewal" },
    { letter: "Luis", tree: "Rowan", symbol: "ᚂ", meaning: "Rowan, Protection, Insight, Vision, Control" },
    { letter: "Fearn", tree: "Alder", symbol: "ᚃ", meaning: "Alder, Shield, Foundation, Strength, Release" },
    { letter: "Saille", tree: "Willow", symbol: "ᚄ", meaning: "Willow, Intuition, The Unconscious, Flexibility, The Moon" },
    { letter: "Nuin", tree: "Ash", symbol: "ᚅ", meaning: "Ash, Connection, The World Tree, Links, Weaving" },
    // Aicme hÚatha (Hawthorn Group)
    { letter: "Huathe", tree: "Hawthorn", symbol: "ᚆ", meaning: "Hawthorn, Consequence, Cleansing, Trial, Restraint" },
    { letter: "Dair", tree: "Oak", symbol: "ᚇ", meaning: "Oak, Strength, Endurance, Sovereignty, Protection" },
    { letter: "Tinne", tree: "Holly", symbol: "ᚈ", meaning: "Holly, Challenge, Action, Defence, The Warrior" },
    { letter: "Coll", tree: "Hazel", symbol: "ᚉ", meaning: "Hazel, Wisdom, Knowledge, Divination, Inspiration" },
    { letter: "Quert", tree: "Apple", symbol: "ᚊ", meaning: "Apple, Choice, Healing, Beauty, Love" },
    // Aicme Muine (Vine Group)
    { letter: "Muin", tree: "Vine", symbol: "ᚋ", meaning: "Vine, Harvest, Introspection, Prophecy, The Inward Journey" },
    { letter: "Gort", tree: "Ivy", symbol: "ᚌ", meaning: "Ivy, Growth, Tenacity, Development, The Wild Self" },
    { letter: "Ngetal", tree: "Reed", symbol: "ᚍ", meaning: "Reed, Direct Action, Purpose, Health, Order" },
    { letter: "Straif", tree: "Blackthorn", symbol: "ᚎ", meaning: "Blackthorn, Strife, The Inevitable, Fate, Overcoming obstacles" },
    { letter: "Ruis", tree: "Elder", symbol: "ᚏ", meaning: "Elder, Endings and Beginnings, Transition, The Crone, Maturity" },
    // Aicme Ailme (Pine Group)
    { letter: "Ailm", tree: "Pine", symbol: "ᚐ", meaning: "Pine/Fir, Perspective, Foresight, The Long View, Objectivity" },
    { letter: "Onn", tree: "Gorse", symbol: "ᚑ", meaning: "Gorse, Gathering, Sustained effort, Long-term goals, The Sun" },
    { letter: "Ur", tree: "Heather", symbol: "ᚒ", meaning: "Heather, Passion, Healing, The Earth, Sensuality" },
    { letter: "Eadhadh", tree: "Aspen", symbol: "ᚓ", meaning: "Aspen, Endurance, Overcoming, Courage, Resilience" },
    { letter: "Idho", tree: "Yew", symbol: "ᚔ", meaning: "Yew, Death and Rebirth, Ancestors, The Past, Immortality" },
    // Forfeda (The 'Extra' Letters)
    { letter: "Eabhadh", tree: "Aspen", symbol: "ᚕ", meaning: "Groove/Aspen, Adaptability, Twin aspects, Duality" },
    { letter: "Or", tree: "Spindle", symbol: "ᚖ", meaning: "Spindle/Gold, Inheritance, Legacy, The Hearth, Community" },
    { letter: "Uilleann", tree: "Honeysuckle", symbol: "ᚗ", meaning: "Honeysuckle/Elbow, Connection, Seeking, The Soul's desire" },
    { letter: "Ifin", tree: "Pine", symbol: "ᚘ", meaning: "Pine, Sweetness, The 'in-between' places, Unexpected gifts" },
    { letter: "Aamhancholl", tree: "Witch Hazel", symbol: "ᚙ", meaning: "Witch Hazel, Duality, Protection, Hidden knowledge" },
];

export type OghamLetterData = (typeof oghamLetters)[0];

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
