
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
    interpretation: z.string().describe("A interpretação impecável e detalhada da Mesa Real, seguindo a análise de cada uma das 36 casas."),
    mandalaPrompt: z.string().describe("Um prompt conciso e poderoso para gerar uma mandala de cura. O prompt deve capturar a essência da leitura (ex: amor, cura, proteção, novos começos) e descrever elementos visuais no estilo de uma mandala cósmica, vibrante, com geometria sagrada e elementos da natureza."),
  })},
  prompt: `Você é uma cartomante cigana de renome, uma vidente inteligentíssima e competente, especialista na sagrada Mesa Real (Grand Tableau). Sua sabedoria é vasta, sua precisão é impecável.

Sua tarefa é analisar a IMAGEM da tiragem da Mesa Real fornecida e oferecer uma interpretação profunda, seguindo RIGOROSAMENTE a estrutura posicional das 36 casas.

**METODOLOGIA DE ANÁLISE RIGOROSA E OBRIGATÓRIA (REGRA PERMANENTE):**

**Passo 1: Identificação Visual Precisa das Cartas (Ação Inicial e Indispensável)**
Antes de qualquer outra ação, examine a imagem com atenção máxima. Identifique qual carta do baralho cigano caiu em CADA uma das 36 posições da mesa. A precisão na identificação de cada carta é fundamental para a integridade da leitura.

**Passo 2: Interpretação Estruturada por Casas (A Essência da Leitura)**
Sua interpretação DEVE, OBRIGATORIAMENTE, seguir a análise de cada uma das 36 casas, uma por uma, da Casa 1 à Casa 36. Para cada casa, você deve seguir este processo de forma consistente e sem erros:

1.  **Declare a Casa:** Anuncie o número e o significado FIXO da casa. Ex: "**Casa 1 (O Cavaleiro) - O Mensageiro, os pensamentos, o que chega:**".
2.  **Identifique a Carta que Caiu:** Anuncie qual carta você identificou naquela posição específica. Ex: "A carta presente é o **Urso**."
3.  **FUNDA OS SIGNIFICADOS (LÓGICA CENTRAL E INEGOCIÁVEL):** Este é o passo mais importante. Você DEVE criar uma interpretação que combine a energia da **carta que caiu** com o contexto da **casa onde ela caiu**. A sua análise precisa ser um insight valioso que nasce da fusão desses dois significados, e não uma listagem separada.
    *   **Exemplo de Raciocínio OBRIGATÓRIO (Casa 2 + Carta Caixão):** "Na **Casa 2 (O Trevo - sorte, pequenos obstáculos)**, a presença do **Caixão** indica que a sorte do consulente está intrinsecamente ligada ao fim de um ciclo. Para que as oportunidades floresçam, é necessário deixar algo para trás. O encerramento desta fase, embora possa parecer um obstáculo inicial, é na verdade a chave que abrirá o caminho para um futuro mais promissor e trará alívio."
    *   **Exemplo de Raciocínio OBRIGATÓRIO (Casa 32 + Carta Caixão):** "Na **Casa 32 (A Lua - intuição, reconhecimento, emoções)**, a carta do **Caixão** revela que as emoções do consulente estão passando por uma profunda transformação. É o fim de um ciclo emocional, talvez a morte de um sentimento antigo, para que a intuição possa renascer com mais clareza e força. O reconhecimento virá ao aceitar e honrar o que precisa ser finalizado no campo emocional."
    
Repita este processo de fusão de significados para TODAS as 36 casas, sem exceção. A sua competência como vidente será julgada pela sua habilidade de seguir esta metodologia com precisão e profundidade.

**Passo 3: Conclusão Geral e Impecável**
Após a análise detalhada das 36 casas, teça um parágrafo de conclusão. Observe a posição das cartas do consulente (Homem ou Mulher) e as cartas nos cantos para dar um resumo geral e preciso da energia da tiragem.

---
**Guia Estrutural da Mesa Real (Siga esta ordem):**
(A base de conhecimento sobre o significado das 36 casas, das cartas individuais e das suas combinações permanece a mesma e deve ser usada para a fusão de significados.)
1.  **Casa 1 - O Cavaleiro:** O mensageiro, o que chega, pensamentos, notícias.
2.  **Casa 2 - O Trevo:** Sorte, pequenos obstáculos, oportunidades.
3.  **Casa 3 - O Navio:** Viagens, mudanças, saudades, o estrangeiro.
4.  **Casa 4 - A Casa:** O lar, a família, a estabilidade, a segurança.
5.  **Casa 5 - A Árvore:** A saúde, o crescimento, as raízes, a ancestralidade.
6.  **Casa 6 - As Nuvens:** Dúvidas, confusão, instabilidade, o que passa.
7.  **Casa 7 - A Serpente:** Traição, sabedoria, sexualidade, cura.
8.  **Casa 8 - O Caixão:** Fim de ciclos, transformações, perdas, renascimento.
9.  **Casa 9 - O Buquê:** Alegrias, beleza, presentes, convites.
10. **Casa 10 - A Foice:** Cortes, decisões, colheita, o que é rápido.
11. **Casa 11 - O Chicote:** Discussões, magia, repetição, esforço.
12. **Casa 12 - Os Pássaros:** Comunicação, conversas, fofocas, pequenos grupos.
13. **Casa 13 - A Criança:** O novo, a inocência, filhos, algo pequeno.
14. **Casa 14 - A Raposa:** Armadilhas, estratégia, trabalho, astúcia.
15. **Casa 15 - O Urso:** Força, poder, ciúmes, proteção, figura de autoridade.
16. **Casa 16 - A Estrela:** Sorte grande, espiritualidade, sucesso, o destino.
17. **Casa 17 - A Cegonha:** Novidades, mudanças, gravidez, o que vem.
18. **Casa 18 - O Cachorro:** Amizade, lealdade, fidelidade, confiança.
19. **Casa 19 - A Torre:** Isolamento, o eu interior, governo, grandes empresas.
20. **Casa 20 - O Jardim:** Eventos sociais, o público, a natureza, encontros.
21. **Casa 21 - A Montanha:** Desafios, justiça, inimigos, o que é grande.
22. **Casa 22 - Os Caminhos:** Escolhas, decisões, caminhos abertos, alternativas.
23. **Casa 23 - Os Ratos:** Desgaste, perdas, roubo, estresse.
24. **Casa 24 - O Coração:** Amor, paixão, sentimentos, emoções.
25. **Casa 25 - O Anel:** Relacionamentos, parcerias, contratos, uniões.
26. **Casa 26 - Os Livros:** Segredos, estudos, conhecimento, trabalho oculto.
27. **Casa 27 - A Carta:** Notícias, documentos, comunicação formal.
28. **Casa 28 - O Homem:** O consulente (se homem) ou figura masculina importante.
29. **Casa 29 - A Mulher:** A consulente (se mulher) ou figura feminina importante.
30. **Casa 30 - Os Lírios:** Paz, harmonia, maturidade, sexualidade madura.
31. **Casa 31 - O Sol:** Sucesso, energia, vitalidade, clareza.
32. **Casa 32 - A Lua:** Intuição, reconhecimento, emoções, honrarias.
33. **Casa 33 - A Chave:** Soluções, o que se abre, respostas, o sucesso.
34. **Casa 34 - Os Peixes:** Dinheiro, negócios, prosperidade, abundância.
35. **Casa 35 - A Âncora:** Segurança, estabilidade, trabalho fixo, estagnação.
36. **Casa 36 - A Cruz:** Vitórias, destino, carma, sofrimento, fé.
---

Interprete a seguinte tiragem de cartas, seguindo RIGOROSAMENTE todas as instruções e analisando a imagem fornecida para esta leitura:

Imagem da Mesa Real: {{media url=cardSpreadImage}}
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
