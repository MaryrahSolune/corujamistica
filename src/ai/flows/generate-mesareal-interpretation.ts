
'use server';

/**
 * @fileOverview Flow for generating a detailed Baralho Cigano Mesa Real (Grand Tableau) reading.
 *
 * - generateMesaRealInterpretation - A function that initiates the reading interpretation process.
 * - GenerateMesaRealInterpretationInput - The input type for the function.
 * - GenerateMesaRealInterpretationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateMesaRealInterpretationInputSchema = z.object({
  cardSpreadImage: z
    .string()
    .describe(
      "A photo of the 36-card Mesa Real (Grand Tableau) spread, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  query: z.string().describe('The user query or context for the reading.'),
});
export type GenerateMesaRealInterpretationInput = z.infer<
  typeof GenerateMesaRealInterpretationInputSchema
>;

const GenerateMesaRealInterpretationOutputSchema = z.object({
  interpretation: z
    .string()
    .describe('The AI-generated interpretation of the Mesa Real reading.'),
  mandalaImageUri: z
    .string()
    .optional()
    .describe('A data URI of a generated healing mandala image.'),
});
export type GenerateMesaRealInterpretationOutput = z.infer<
  typeof GenerateMesaRealInterpretationOutputSchema
>;

export async function generateMesaRealInterpretation(
  input: GenerateMesaRealInterpretationInput
): Promise<GenerateMesaRealInterpretationOutput> {
  return generateMesaRealInterpretationFlow(input);
}

const mesaRealInterpretationPrompt = ai.definePrompt({
  name: 'mesaRealInterpretationPrompt',
  input: {schema: GenerateMesaRealInterpretationInputSchema},
  output: {schema: z.object({
    interpretation: z.string().describe("A interpretação detalhada e poética da Mesa Real, seguindo a análise de cada uma das 36 casas."),
    mandalaPrompt: z.string().describe("Um prompt conciso e poderoso para gerar uma mandala de cura. O prompt deve capturar a essência da leitura (ex: amor, cura, proteção, novos começos) e descrever elementos visuais no estilo de uma mandala cósmica, vibrante, com geometria sagrada e elementos da natureza."),
  })},
  prompt: `Você é um consulente das estrelas, um cartomante especialista na sagrada Mesa Real (Grand Tableau). Sua sabedoria é vasta e reconhecida, baseada em um profundo conhecimento do misticismo e das tradições do Baralho Cigano. Você possui uma empatia paranormal, sendo um guia que aconselha seus consulentes, encorajando-os em sua jornada universal. Você também é astrólogo e umbandista, e analisará o momento da tiragem em relação aos astros e às entidades espirituais presentes.

Sua tarefa é analisar a imagem da Mesa Real (36 cartas) fornecida pelo consulente e oferecer uma interpretação profunda, seguindo a estrutura posicional das 36 casas.

**METODOLOGIA DE ANÁLISE RIGOROSA E OBRIGATÓRIA:**

**Passo 1: Identificação Explícita e Precisa das Cartas (Ação Inicial)**
Antes de qualquer outra ação, você DEVE examinar a imagem com a máxima atenção e listar TODAS as 36 cartas na ordem exata em que aparecem, da esquerda para a direita, linha por linha. A precisão nesta etapa é o alicerce de toda a leitura. Não prossiga sem listar as cartas corretamente. A seguir, a lista de cartas para a interpretação atual:
- Linha 1: A Montanha, A Lua, A Criança, O Cavaleiro, O Homem, As Nuvens, A Estrela, O Buquê.
- Linha 2: O Anel, A Cruz, Os Peixes, Os Pássaros, O Navio, A Casa, A Chave, A Carta.
- Linha 3: A Âncora, A Serpente, O Trevo, Os Ratos, A Foice, O Coração, A Raposa, Os Caminhos.
- Linha 4: A Árvore, O Chicote, O Sol, Os Livros, A Torre, O Urso, Os Lírios, A Cegonha.
- Linha 5: O Caixão, O Jardim, O Cachorro, A Mulher.
Esta listagem acima é a VERDADE ABSOLUTA para esta leitura. Sua interpretação DEVE seguir esta ordem.

**Passo 2: Interpretação Estruturada por Casas (Ações Pós-Identificação)**
A sua interpretação DEVE seguir a análise de cada uma das 36 casas abaixo, uma por uma, da Casa 1 à Casa 36. Para cada casa, você deve:
a. Declarar o número e o significado da casa (ex: "**Casa 1 (O Cavaleiro) - O Mensageiro:**").
b. Identificar a carta que caiu nessa posição, baseando-se na lista do Passo 1.
c. **Fundir os significados:** Interpretar o que a energia da **carta que caiu** significa DENTRO do contexto da **casa onde ela caiu**. Use a sua base de conhecimento de combinações de cartas para enriquecer essa fusão. Explique como essas duas energias se combinam.
    *   **Exemplo de Raciocínio Obrigatório (para a Casa 2 da tiragem atual):** "Na Casa 2, a casa do Trevo (que representa a sorte e pequenos obstáculos), caiu a carta da Lua (carta 32). A Lua nesta casa indica que a sorte e as oportunidades do consulente estão ligadas à sua intuição, ao seu mundo emocional e ao reconhecimento que busca. A combinação 'Trevo + Lua' sugere que a sorte virá através do mérito e do brilho pessoal, mas que também podem surgir pequenas instabilidades emocionais ou dúvidas que precisam ser superadas para que a oportunidade se concretize. A energia de Iemanjá, regente da Lua, traz uma bênção maternal sobre as oportunidades, mas pede atenção às marés emocionais."
d. Repita este processo de fusão de significados para TODAS as 36 casas, seguindo a ordem da lista de cartas fornecida.

**Passo 3: Integração Espiritual OBRIGATÓRIA**
Em sua análise, você DEVE, de forma consistente, fazer referência às correspondências espirituais das cartas (Orixás, entidades, etc.) listadas em seu conhecimento. Explique como a energia dessas entidades influencia a mensagem das cartas na casa correspondente.

**Passo 4: Conclusão Geral**
Após a análise detalhada das 36 casas, teça um parágrafo de conclusão, observando a posição da carta do consulente (Homem/Mulher) e as cartas nos cantos, para dar um resumo geral da energia da tiragem.

---
**Guia Estrutural da Mesa Real (Siga esta ordem):**
(A lista de casas de 1 a 36 permanece a mesma)

---
**Base de Conhecimento Específica:**
(Toda a base de conhecimento de cartas, correspondências espirituais e combinações permanece a mesma)

---
Interprete a seguinte tiragem de cartas, seguindo RIGOROSAMENTE todas as instruções e usando a lista de cartas identificadas como a verdade absoluta para esta leitura:

{{media url=cardSpreadImage}}

Ao final de sua interpretação, inclua uma saudação respeitosa a Exu, como por exemplo: "Laroyê Exu! Salve o Guardião desta página e de toda a humanidade!"
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

const generateMesaRealInterpretationFlow = ai.defineFlow(
  {
    name: 'generateMesaRealInterpretationFlow',
    inputSchema: GenerateMesaRealInterpretationInputSchema,
    outputSchema: GenerateMesaRealInterpretationOutputSchema,
  },
  async (input) => {
    // 1. Generate the text interpretation and the mandala prompt with retry logic.
    let promptOutput;
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const { output } = await mesaRealInterpretationPrompt(input);
        promptOutput = output;
        break; // Success, exit loop
      } catch (error: any) {
        attempt++;
        if (attempt >= maxRetries || !String(error.message || '').includes('503')) {
          console.error(`Failed to generate Mesa Real text after ${attempt} attempts.`, error);
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
    let mandalaImageUri: string | undefined = undefined;
    try {
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
        mandalaImageUri = media?.url;
    } catch(e) {
        console.error("Mandala image generation failed, proceeding without it.", e);
        // Do not throw an error, just proceed without the mandala image.
    }
    
    // 3. Combine results and return.
    return {
      interpretation: promptOutput.interpretation,
      mandalaImageUri: mandalaImageUri,
    };
  }
);
