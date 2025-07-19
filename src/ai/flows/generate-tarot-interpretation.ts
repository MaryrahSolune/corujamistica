
'use server';

/**
 * @fileOverview Flow for generating personalized Traditional Tarot card reading interpretations.
 *
 * - generateTarotInterpretation - A function that initiates the reading interpretation process.
 * - GenerateTarotInterpretationInput - The input type for the function.
 * - GenerateTarotInterpretationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateTarotInterpretationInputSchema = z.object({
  cardSpreadImage: z
    .string()
    .describe(
      "A photo of the Traditional Tarot (e.g., Marseille) card spread, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  query: z.string().describe('The user query or context for the reading.'),
});
export type GenerateTarotInterpretationInput = z.infer<
  typeof GenerateTarotInterpretationInputSchema
>;

const GenerateTarotInterpretationOutputSchema = z.object({
  interpretation: z
    .string()
    .describe('The AI-generated interpretation of the card reading.'),
  mandalaImageUri: z
    .string()
    .optional()
    .describe('A data URI of a generated healing mandala image.'),
});
export type GenerateTarotInterpretationOutput = z.infer<
  typeof GenerateTarotInterpretationOutputSchema
>;

export async function generateTarotInterpretation(
  input: GenerateTarotInterpretationInput
): Promise<GenerateTarotInterpretationOutput> {
  return generateTarotInterpretationFlow(input);
}

const tarotInterpretationPrompt = ai.definePrompt({
  name: 'tarotInterpretationPrompt',
  input: {schema: GenerateTarotInterpretationInputSchema},
  output: {schema: z.object({
    interpretation: z.string().describe("A interpretação detalhada e poética da leitura das cartas, com base em todo o conhecimento fornecido."),
    mandalaPrompt: z.string().describe("Um prompt conciso e poderoso para gerar uma mandala de cura. O prompt deve capturar a essência da leitura (ex: amor, cura, proteção, novos começos) e descrever elementos visuais no estilo de uma mandala cósmica, vibrante, com geometria sagrada e elementos da natureza."),
  })},
  prompt: `Você é uma cartomante especialista em leitura de cartas de tarot tradicional (como o de Marselha) e outros oráculos com 22 arcanos maiores. Sua sabedoria é vasta e reconhecida. Você possui um conhecimento profundo do misticismo e da jornada do herói representada nos arcanos. Sua abordagem é poética, filosófica e espiritual.

Sua tarefa é analisar a imagem da tiragem de Tarot fornecida pelo consulente e a pergunta dele, oferecendo uma interpretação profunda e detalhada, focada nos arquétipos e na simbologia dos arcanos maiores.

**Instruções Fundamentais e OBRIGATÓRIAS para a Interpretação:**

1.  **Análise Visual Primordial:** Examine a imagem com extrema atenção. Identifique CADA carta visível, focando nos arcanos maiores e em como os arcanos menores (se presentes) complementam a leitura.
2.  **Identificação Precisa das Cartas:** Antes de prosseguir, é de MÁXIMA IMPORTÂNCIA que você identifique corretamente CADA carta visível. Verifique números e símbolos com extremo cuidado. A precisão na identificação é o fundamento de uma leitura correta.
3.  **Foco no Visível:** Limite-se ESTRITAMENTE às cartas e elementos que são visíveis na imagem. NÃO INFERA ou adicione cartas ou símbolos que não estão presentes.
4.  **Integração Espiritual e Arquetípica OBRIGATÓRIA:** Em sua análise, você DEVE, de forma consistente, fazer referência às correspondências espirituais e arquetípicas dos arcanos. Explique como a energia desses arquétipos (ex: O Louco como o início da jornada, A Morte como transformação) influencia a mensagem das cartas.
5.  **Interpretação Interligada e Contextual:** Sua interpretação deve ser um todo coeso, analisando a combinação e interação das cartas para revelar a mensagem preponderante. Os parágrafos devem ter, no mínimo, 5 linhas para garantir profundidade.
    *   As cartas acima representam as influências do plano astral e espiritual. As cartas abaixo indicam como essas energias se manifestam no plano material e no eu inferior.
    *   As cartas nas extremidades ("pontas") da tiragem têm maior peso na análise.

**Base de Conhecimento Específica (Use para Tarot Tradicional):**

🌟 **Arcanos Maiores do Tarot com Correspondência aos Orixás e Influência Astrológica** 🌟
0 - O Louco: Exu, Urano/Ar
I - O Mago: Ogum, Mercúrio
II - A Sacerdotisa: Iansã, Lua
III - A Imperatriz: Oxum, Vênus
IV - O Imperador: Xangô, Áries
V - O Hierofante: Oxalá, Touro
VI - Os Amantes: Oxalufã (Yemanjá), Gêmeos
VII - O Carro: Ogum, Câncer
VIII - A Justiça: Obaluaiê, Libra
IX - O Eremita: Nanã, Virgem
X - A Roda da Fortuna: Oxumaré, Júpiter
XI - A Força: Iansã, Leão
XII - O Enforcado: Oxóssi, Netuno
XIII - A Morte: Iemanjá, Escorpião
XIV - A Temperança: Oxalá, Sagitário
XV - O Diabo: Omolu/Obaluaiê, Capricórnio
XVI - A Torre: Exu, Marte
XVII - A Estrela: Oxum, Aquário
XVIII - A Lua: Iansã, Peixes
XIX - O Sol: Oxalá, Sol
XX - O Julgamento: Omolu/Obaluaiê, Plutão
XXI - O Mundo: Oxalá, Saturno

---

Considerando a imagem da tiragem de Tarot fornecida e a pergunta do consulente, ofereça sua interpretação, seguindo rigorosamente todas as instruções e integrando todos os seus conhecimentos.

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

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const generateTarotInterpretationFlow = ai.defineFlow(
  {
    name: 'generateTarotInterpretationFlow',
    inputSchema: GenerateTarotInterpretationInputSchema,
    outputSchema: GenerateTarotInterpretationOutputSchema,
  },
  async input => {
    // 1. Generate the text interpretation and the mandala prompt with retry logic.
    let promptOutput;
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const { output } = await tarotInterpretationPrompt(input);
        promptOutput = output;
        break; // Success, exit loop
      } catch (error: any) {
        attempt++;
        if (attempt >= maxRetries || !error.message?.includes('503')) {
          console.error(`Failed to generate Tarot text after ${attempt} attempts.`, error);
          throw error;
        }
        console.warn(`Attempt ${attempt} failed with 503. Retrying in ${attempt}s...`);
        await sleep(attempt * 1000); // Wait 1s, then 2s
      }
    }

    if (!promptOutput) {
      throw new Error('Failed to generate reading interpretation text after multiple retries.');
    }

    // 2. Generate the mandala image using the prompt created in the previous step.
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: promptOutput.mandalaPrompt,
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
    
    // 3. Combine results and return.
    return {
      interpretation: promptOutput.interpretation,
      mandalaImageUri: media?.url,
    };
  }
);
