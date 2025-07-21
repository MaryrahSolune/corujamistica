
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
Antes de qualquer outra ação, você DEVE examinar a imagem com a máxima atenção para determinar as 36 cartas na ordem exata em que aparecem, da esquerda para a direita, linha por linha (linha 1: cartas 1-8; linha 2: cartas 9-16; linha 3: cartas 17-24; linha 4: cartas 25-32; linha 5: cartas 33-36 no centro). A precisão nesta etapa é o alicerce de toda a leitura.

**Passo 2: Interpretação Estruturada por Casas (Ações Pós-Identificação)**
A sua interpretação DEVE seguir a análise de cada uma das 36 casas abaixo, uma por uma, da Casa 1 à Casa 36. Para cada casa, você deve:
a. Declarar o número e o significado da casa (ex: "**Casa 1 (O Cavaleiro) - O Mensageiro:**").
b. Identificar a carta que caiu nessa posição, com base na sua análise visual do Passo 1.
c. **Fundir os significados:** Interpretar o que a energia da **carta que caiu** significa DENTRO do contexto da **casa onde ela caiu**. Use a sua base de conhecimento de combinações de cartas para enriquecer essa fusão. Explique como essas duas energias se combinam.
    *   **Exemplo de Raciocínio Obrigatório:** "Na Casa 2, a casa do Trevo (que representa a sorte e pequenos obstáculos), caiu a carta da Lua (carta 32). A combinação 'Trevo + Lua' sugere que a sorte virá através do mérito e do brilho pessoal, mas que também podem surgir pequenas instabilidades emocionais ou dúvidas que precisam ser superadas para que a oportunidade se concretize. A energia de Iemanjá, regente da Lua, traz uma bênção maternal sobre as oportunidades, mas pede atenção às marés emocionais."
d. Repita este processo de fusão de significados para TODAS as 36 casas.

**Passo 3: Integração Espiritual OBRIGATÓRIA**
Em sua análise, você DEVE, de forma consistente, fazer referência às correspondências espirituais das cartas (Orixás, entidades, etc.) listadas em seu conhecimento. Explique como a energia dessas entidades influencia a mensagem das cartas na casa correspondente.

**Passo 4: Conclusão Geral**
Após a análise detalhada das 36 casas, teça um parágrafo de conclusão, observando a posição da carta do consulente (Homem/Mulher) e as cartas nos cantos, para dar um resumo geral da energia da tiragem.

---
**Guia Estrutural da Mesa Real (Siga esta ordem):**
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
**Base de Conhecimento Específica:**
(Toda a base de conhecimento de cartas, correspondências espirituais e combinações permanece a mesma)

---
Interprete a seguinte tiragem de cartas, seguindo RIGOROSAMENTE todas as instruções e usando sua análise visual como a verdade absoluta para esta leitura:

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
