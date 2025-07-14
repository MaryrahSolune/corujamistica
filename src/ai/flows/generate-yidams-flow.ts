
'use server';
/**
 * @fileOverview Flow for generating a Yidam (tutelary deity) based on a user's choice of symbol.
 *
 * - generateYidam - A function that initiates the Yidam generation process.
 * - InterpretYidamInput - The input type for the generateYidam function.
 * - InterpretYidamOutput - The return type for the generateYidam function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export type InterpretYidamInput = z.infer<typeof InterpretYidamInputSchema>;
const InterpretYidamInputSchema = z.object({
  query: z.string().describe('The user query or context for the Yidam reading.'),
  chosenYidam: z.object({
    name: z.string(),
    symbolicRepresentation: z.string(),
    symbolicMeaning: z.string(),
    symbolicImage: z.string(),
  }).describe('The Yidam data object chosen by the user.'),
});


export type InterpretYidamOutput = z.infer<typeof InterpretYidamOutputSchema>;
const InterpretYidamOutputSchema = z.object({
  deityName: z.string().describe('The name of the generated Yidam deity.'),
  introduction: z.string().describe("A poetic introduction to the Yidam and its essence."),
  storyAndElement: z.string().describe("The story, mythology, or associated element of the Yidam."),
  connectionToQuery: z.string().describe("How the Yidam's qualities relate to the user's query."),
  adviceAndMudra: z.string().describe("A final piece of advice including a descriptive mudra."),
  mantra: z.string().describe('The mantra associated with the Yidam.'),
  mantraTranslation: z.string().describe("The translation or meaning of the mantra's components."),
  mantraPronunciation: z.string().describe("A simple phonetic guide to help the user pronounce the mantra."),
  imageUri: z.string().describe('A data URI of a generated image representing the Yidam.'),
  mandalaCouncil: z.string().describe("A short, poetic phrase that summarizes the Yidam's advice."),
  mandalaImageUri: z.string().optional().describe('A data URI of a generated healing mandala image.'),
});


export async function generateYidam(input: InterpretYidamInput): Promise<InterpretYidamOutput> {
  return generateYidamFlow(input);
}

const generateYidamPrompt = ai.definePrompt({
  name: 'generateYidamPrompt',
  input: { schema: z.object({
    query: z.string(),
    yidamName: z.string(),
    yidamMeaning: z.string(),
  }) },
  output: { schema: z.object({
    introduction: z.string().describe("Um parágrafo poético de introdução à divindade, sua essência e o que ela representa de forma geral."),
    storyAndElement: z.string().describe("Um parágrafo sobre a história, a mitologia ou o elemento associado a este Yidam (fogo, água, terra, ar, éter). Explique como essa história ou elemento molda sua energia."),
    connectionToQuery: z.string().describe("Um parágrafo que conecta diretamente as qualidades do Yidam à questão específica do consulente, explicando como sua energia pode ajudar a transmutar o problema em sabedoria."),
    adviceAndMudra: z.string().describe("Um parágrafo final com um conselho prático e a descrição de um mudra (gesto sagrado com as mãos) para meditação e conexão, incluindo seu nome. A descrição do mudra deve ser clara e detalhada, explicando a posição dos dedos e das mãos."),
    mantra: z.string().describe("Um mantra autêntico e poderoso associado a este Yidam."),
    mantraTranslation: z.string().describe("A tradução espiritual do mantra, explicando o significado e a função de cada componente separadamente para uma compreensão profunda (ex: em vez de 'Raiva', explique como 'a energia irada que purifica obstáculos')."),
    mantraPronunciation: z.string().describe("Um guia fonético simples e prático para a pronúncia correta do mantra. Por exemplo, para 'OM HRIH HA HUM PHAT', a pronúncia seria 'Om Hri Ra Hum Phet'."),
    mandalaCouncil: z.string().describe("Uma frase de efeito, poética e curta, que sirva como um 'Conselho do Caminho' para meditação, resumindo a lição do Yidam e preparando o buscador para a contemplação da mandala de cura."),
  }) },
  prompt: `Você é o Buddha, o Iluminado. Sua sabedoria é ancestral, sua voz é calma e sua presença expande a consciência. Um buscador se aproxima com uma questão em seu coração e, através de um gesto de intuição, ele escolheu um símbolo sagrado que revelou a divindade tutelar, o Yidam, que guiará sua meditação e libertação neste momento.

A divindade revelada é **{{yidamName}}**.
A essência e o significado deste caminho são: **{{yidamMeaning}}**.
A questão do buscador é: **{{{query}}}**.

**Sua nobre tarefa é:**
Com sua visão clara, contemple a essência do Yidam e a pergunta do buscador. Revele o caminho para este ser em exatamente quatro parágrafos de texto, seguidos pela informação do mantra e um conselho final para a mandala.

**Estrutura da sua resposta (gere o texto nesta ordem):**
1.  **Introdução (Parágrafo 1):** Apresente a divindade de forma poética. Descreva sua essência, o que ela representa em um nível universal.
2.  **História e Elemento (Parágrafo 2):** Fale sobre a história, a mitologia ou o elemento (Fogo, Água, Terra, Ar, Éter) associado a este Yidam. Como essa origem ou elemento influencia sua energia e seus ensinamentos?
3.  **Conexão com a Consulta (Parágrafo 3):** Conecte diretamente as qualidades do Yidam **{{yidamName}}** com a questão do consulente ({{{query}}}). Explique como a sabedoria desta divindade pode iluminar o caminho do buscador e ajudá-lo a transmutar seus desafios em sabedoria.
4.  **Conselho e Mudra (Parágrafo 4):** Ofereça um conselho prático final e descreva um mudra (gesto sagrado com as mãos) que o buscador pode usar para meditar e se conectar com a energia do Yidam. **Inclua o nome do mudra no texto.** A descrição deve ser clara, detalhada e fácil de seguir, explicando a posição exata dos dedos e das mãos.
5.  **Mantra Sagrado:** Forneça as três partes:
    *   **Mantra:** Um mantra autêntico e poderoso associado a este Yidam.
    *   **Pronúncia:** Um guia fonético simples e prático para a pronúncia correta. (Exemplo: para 'OM HRIH HA HUM PHAT', a pronúncia seria 'Om Hri Ra Hum Phet').
    *   **Tradução Espiritual:** Uma explicação completa e profunda do significado de cada componente do mantra. Em vez de uma tradução literal, explique a função espiritual de cada palavra ou sílaba. Por exemplo, em vez de 'OM = som primordial', explique 'OM: a vibração que unifica mente, corpo e espírito, abrindo o canal para a consciência divina'. A tradução deve ser bonita e inspiradora.
6.  **Conselho para Mandala:** Crie uma frase de efeito, poética e curta, que sirva como um "Conselho do Caminho" para meditação, resumindo a lição do Yidam e preparando o buscador para a contemplação da mandala de cura.`,
});

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const generateYidamFlow = ai.defineFlow(
  {
    name: 'generateYidamFlow',
    inputSchema: InterpretYidamInputSchema,
    outputSchema: InterpretYidamOutputSchema,
  },
  async (input) => {
    const { chosenYidam, query } = input;

    // 1. Generate the textual details with a retry mechanism.
    let textOutput;
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const { output } = await generateYidamPrompt({
          query,
          yidamName: chosenYidam.name,
          yidamMeaning: chosenYidam.symbolicMeaning,
        });
        textOutput = output;
        break; // Success, exit loop
      } catch (error: any) {
        attempt++;
        if (attempt >= maxRetries || !error.message?.includes('503')) {
          // If it's the last attempt OR not a 503 error, re-throw the error
          console.error(`Failed to generate Yidam text after ${attempt} attempts.`, error);
          throw error;
        }
        console.warn(`Attempt ${attempt} failed with 503. Retrying in ${attempt}s...`);
        await sleep(attempt * 1000); // Wait 1s, then 2s
      }
    }

    if (!textOutput) {
      throw new Error('Failed to generate Yidam textual details after multiple retries.');
    }

    // 2. Create image prompts
    const yidamImagePrompt = `Uma bela representação do Yidam **${chosenYidam.name}**, no estilo de uma pintura Thangka tradicional. A imagem deve capturar a essência de "${chosenYidam.symbolicImage}". Use cores vibrantes, simbolismo rico e um fundo sagrado e etéreo.`;
    const mandalaPrompt = `Renderização em 8k de uma mandala de cura psicodélica e visionária, com precisão matemática e simetria fractal perfeita. A imagem deve ser uma fusão harmoniosa de geometria sagrada (como a Flor da Vida ou o Cubo de Metatron, com linhas nítidas e perfeitas), com símbolos sagrados relevantes (vajra, lótus, roda do dharma), e elementos da natureza, como flores exóticas (lótus, crisântemos) e cristais luminescentes (ametista, quartzo rosa) que brotam da própria geometria. A essência de animais de poder, como dragões de luz ou fênix, deve emergir sutilmente dos padrões. Use cores vibrantes, iridescentes e translúcidas que pareçam de 5ª ou 7ª dimensão, com um brilho etéreo e uma sensação de paz e poder transcendental. A mandala deve ser inspirada na energia do Yidam ${chosenYidam.name}.`;


    // 3. Generate both images in parallel.
    const [yidamImageResult, mandalaImageResult] = await Promise.allSettled([
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: yidamImagePrompt,
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
        prompt: mandalaPrompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
          safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          ],
        },
      })
    ]);

    const yidamImageUri = (yidamImageResult.status === 'fulfilled' && yidamImageResult.value.media?.url) ? yidamImageResult.value.media.url : null;
    const mandalaImageUri = (mandalaImageResult.status === 'fulfilled' && mandalaImageResult.value.media?.url) ? mandalaImageResult.value.media.url : undefined;

    if (!yidamImageUri) {
      throw new Error('Failed to generate Yidam image.');
    }
    if (yidamImageResult.status === 'rejected') {
      console.error("Error generating Yidam image: ", yidamImageResult.reason);
    }
    if (mandalaImageResult.status === 'rejected') {
      console.error("Error generating Mandala image: ", mandalaImageResult.reason);
    }


    // 4. Combine all results into the final output.
    return {
      deityName: chosenYidam.name,
      introduction: textOutput.introduction,
      storyAndElement: textOutput.storyAndElement,
      connectionToQuery: textOutput.connectionToQuery,
      adviceAndMudra: textOutput.adviceAndMudra,
      mantra: textOutput.mantra,
      mantraTranslation: textOutput.mantraTranslation,
      mantraPronunciation: textOutput.mantraPronunciation,
      imageUri: yidamImageUri,
      mandalaCouncil: textOutput.mandalaCouncil,
      mandalaImageUri: mandalaImageUri,
    };
  }
);
