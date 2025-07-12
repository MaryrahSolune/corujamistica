
'use server';

/**
 * @fileOverview Flow for generating personalized Ogham oracle interpretations.
 *
 * - interpretOghamReading - A function that initiates the Ogham reading interpretation process.
 * - InterpretOghamReadingInput - The input type for the interpretOghamReading function.
 * - InterpretOghamReadingOutput - The return type for the interpretOghamReading function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretOghamReadingInputSchema = z.object({
  query: z.string().describe('The user query or context for the Ogham reading.'),
});

export type InterpretOghamReadingInput = z.infer<typeof InterpretOghamReadingInputSchema>;

const InterpretOghamReadingOutputSchema = z.object({
  interpretation: z
    .string()
    .describe('The AI-generated interpretation of the Ogham reading.'),
  oghamLetter: z.string().describe('The name of the randomly chosen Ogham letter.'),
  oghamSymbol: z.string().describe('The unicode symbol of the Ogham letter.'),
});

export type InterpretOghamReadingOutput = z.infer<
  typeof InterpretOghamReadingOutputSchema
>;

// Ogham letters data (Aicme A, B, C, D, and Forfeda)
const oghamLetters = [
    // Aicme Beithe (Birch Group)
    { letter: "Beith", symbol: "ᚁ", meaning: "Birch, Beginnings, New starts, Purification, Renewal" },
    { letter: "Luis", symbol: "ᚂ", meaning: "Rowan, Protection, Insight, Vision, Control" },
    { letter: "Fearn", symbol: "ᚃ", meaning: "Alder, Shield, Foundation, Strength, Release" },
    { letter: "Saille", symbol: "ᚄ", meaning: "Willow, Intuition, The Unconscious, Flexibility, The Moon" },
    { letter: "Nuin", symbol: "ᚅ", meaning: "Ash, Connection, The World Tree, Links, Weaving" },
    // Aicme hÚatha (Hawthorn Group)
    { letter: "Huathe", symbol: "ᚆ", meaning: "Hawthorn, Consequence, Cleansing, Trial, Restraint" },
    { letter: "Dair", symbol: "ᚇ", meaning: "Oak, Strength, Endurance, Sovereignty, Protection" },
    { letter: "Tinne", symbol: "ᚈ", meaning: "Holly, Challenge, Action, Defence, The Warrior" },
    { letter: "Coll", symbol: "ᚉ", meaning: "Hazel, Wisdom, Knowledge, Divination, Inspiration" },
    { letter: "Quert", symbol: "ᚊ", meaning: "Apple, Choice, Healing, Beauty, Love" },
    // Aicme Muine (Vine Group)
    { letter: "Muin", symbol: "ᚋ", meaning: "Vine, Harvest, Introspection, Prophecy, The Inward Journey" },
    { letter: "Gort", symbol: "ᚌ", meaning: "Ivy, Growth, Tenacity, Development, The Wild Self" },
    { letter: "Ngetal", symbol: "ᚍ", meaning: "Reed, Direct Action, Purpose, Health, Order" },
    { letter: "Straif", symbol: "ᚎ", meaning: "Blackthorn, Strife, The Inevitable, Fate, Overcoming obstacles" },
    { letter: "Ruis", symbol: "ᚏ", meaning: "Elder, Endings and Beginnings, Transition, The Crone, Maturity" },
    // Aicme Ailme (Pine Group)
    { letter: "Ailm", symbol: "ᚐ", meaning: "Pine/Fir, Perspective, Foresight, The Long View, Objectivity" },
    { letter: "Onn", symbol: "ᚑ", meaning: "Gorse, Gathering, Sustained effort, Long-term goals, The Sun" },
    { letter: "Ur", symbol: "ᚒ", meaning: "Heather, Passion, Healing, The Earth, Sensuality" },
    { letter: "Eadhadh", symbol: "ᚓ", meaning: "Aspen, Endurance, Overcoming, Courage, Resilience" },
    { letter: "Idho", symbol: "ᚔ", meaning: "Yew, Death and Rebirth, Ancestors, The Past, Immortality" },
    // Forfeda (The 'Extra' Letters)
    { letter: "Eabhadh", symbol: "ᚕ", meaning: "Groove/Aspen, Adaptability, Twin aspects, Duality" },
    { letter: "Or", symbol: "ᚖ", meaning: "Spindle/Gold, Inheritance, Legacy, The Hearth, Community" },
    { letter: "Uilleann", symbol: "ᚗ", meaning: "Honeysuckle/Elbow, Connection, Seeking, The Soul's desire" },
    { letter: "Ifin", symbol: "ᚘ", meaning: "Pine, Sweetness, The 'in-between' places, Unexpected gifts" },
    { letter: "Aamhancholl", symbol: "ᚙ", meaning: "Witch Hazel, Duality, Protection, Hidden knowledge" },
];


const interpretOghamPrompt = ai.definePrompt({
  name: 'interpretOghamPrompt',
  input: { schema: z.object({ 
    query: z.string(), 
    oghamLetter: z.string(), 
    oghamSymbol: z.string(), 
    oghamMeaning: z.string() 
  }) },
  output: { schema: InterpretOghamReadingOutputSchema },
  prompt: `Você é um Druida ancião, um guardião da sabedoria das árvores e dos mistérios do Ogham, o alfabeto sagrado dos celtas. Sua voz é calma, poética e profunda, carregada com o conhecimento de eras. Um consulente se aproxima buscando orientação para uma questão específica.
  
Uma única letra do Ogham foi sorteada para responder à pergunta. Sua tarefa é interpretar a mensagem da letra sorteada no contexto da pergunta do consulente.

A letra sorteada é: **{{oghamLetter}} ({{oghamSymbol}})**
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

Interprete a mensagem do Ogham para este consulente, lembrando-se de retornar não apenas a interpretação, mas também o nome da letra e seu símbolo no objeto de saída.`,
});

const interpretOghamReadingFlow = ai.defineFlow(
  {
    name: 'interpretOghamReadingFlow',
    inputSchema: InterpretOghamReadingInputSchema,
    outputSchema: InterpretOghamReadingOutputSchema,
  },
  async (input) => {
    // 1. "Draw" a random Ogham letter
    const randomIndex = Math.floor(Math.random() * oghamLetters.length);
    const chosenLetter = oghamLetters[randomIndex];
    
    // 2. Generate the interpretation based on the drawn letter and the user's query
    const { output } = await interpretOghamPrompt({
      query: input.query,
      oghamLetter: chosenLetter.letter,
      oghamSymbol: chosenLetter.symbol,
      oghamMeaning: chosenLetter.meaning,
    });
    
    // 3. Ensure the output object is correctly formed
    if (!output) {
      throw new Error('Failed to generate Ogham interpretation.');
    }

    return {
      interpretation: output.interpretation,
      oghamLetter: chosenLetter.letter,
      oghamSymbol: chosenLetter.symbol,
    };
  }
);

export async function interpretOghamReading(input: InterpretOghamReadingInput): Promise<InterpretOghamReadingOutput> {
    return interpretOghamReadingFlow(input);
}
