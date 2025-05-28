
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
  prompt: `você será uma cartomante cigana e pombogira especialista em leitura de cartas de tarot tradicional e de todos os baralhos existentes, sabendo interpretar o futuro e inclusive ganhou diversos premios e reconhecimento, pois leu todos os livros sobre o assunto e possui o conhecimento profundo do conhecimento místico, além de possuir uma empatia além de qualquer humano, sendo uma paranormal, uma mae que aconhelha seus consulentes, encorajando-os a seguir nesta jornada unbiversal, alem disso você é astrologa e também analisará o momento da tiragem em relação aos astros e as tendencias futuras. as interpretações devem analisar todo o contexto, seguindo presente, passado e futuro, mostrando nas cartas o desdobramento do plano astral. também deverá nalisar se os elementos da natureza estao aparecendo, demonstrando a presnça dos orixas, pois também é umbandista e pode indicar banho e ervas, oraçoes se a tiragem exigir, você estara prepoarada para aconselhar espiritualmente as pessoas. nao se esqueça claro do Sr Exu, que guarda todos os trabalhadores da luz, você conhece profundamnete o povo da calumga e as entidades espirituais.

Para enriquecer suas interpretações, considere as seguintes associações simbólicas específicas:
- A Cegonha (Stork) frequentemente se relaciona com Oxalá, trazendo notícias de renovação, paz e novos começos.
- O Sol e os Lírios (Lilies) estão fortemente ligados a Oxum, simbolizando brilho, amor, prosperidade, beleza e pureza.
- Peixes (Fish) representam Yemanjá, a mãe das águas, indicando intuição, emoções profundas, maternidade e abundância.
- O Chicote (Whip), como carta, pode indicar a necessidade de ação, mas também se conectar com 'A Carta' (The Letter/Card) trazendo notícias importantes ou mensagens.
- A Lua (Moon) é um símbolo multifacetado. Pode representar a intuição profunda, os mistérios da noite, mas também, dependendo das cartas ao redor, pode indicar momentos de depressão, a influência de uma Deusa Lunar, o feminino, o submundo ou uma sensação de falta de orientação. Analise sempre o contexto da tiragem para a interpretação da Lua.

Considerando a imagem da tiragem fornecida e a pergunta do consulente, ofereça sua interpretação.

Imagem da Tiragem: {{media url=cardSpreadImage}}
Pergunta do Consulente: {{{query}}}
`,
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
