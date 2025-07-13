'use server';
/**
 * @fileOverview Flow for generating a Yidam (tutelary deity) based on a user's birth date.
 *
 * - generateYidam - A function that initiates the Yidam generation process.
 * - GenerateYidamInput - The input type for the generateYidam function.
 * - GenerateYidamOutput - The return type for the generateYidam function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateYidamInputSchema = z.object({
  birthDate: z
    .string()
    .describe('The user\'s birth date in DD/MM/YYYY format.'),
});
export type GenerateYidamInput = z.infer<typeof GenerateYidamInputSchema>;

const GenerateYidamOutputSchema = z.object({
  deityName: z.string().describe('The name of the generated Yidam deity.'),
  mantra: z.string().describe('The mantra associated with the Yidam.'),
  characteristics: z.string().describe('A paragraph describing the main characteristics and symbolism of the Yidam.'),
  imageUri: z.string().describe('A data URI of a generated image representing the Yidam.'),
});
export type GenerateYidamOutput = z.infer<typeof GenerateYidamOutputSchema>;

export async function generateYidam(input: GenerateYidamInput): Promise<GenerateYidamOutput> {
  return generateYidamFlow(input);
}

const generateYidamPrompt = ai.definePrompt({
  name: 'generateYidamPrompt',
  input: { schema: GenerateYidamInputSchema },
  output: { schema: z.object({
    deityName: z.string().describe('O nome exato do Yidam selecionado da lista.'),
    mantra: z.string().describe('Um mantra autêntico e poderoso associado a este Yidam. Se não houver um na lista, crie um que seja apropriado.'),
    characteristics: z.string().describe('Uma descrição poética e profunda sobre as qualidades, os símbolos e o que esta divindade representa, baseada nas informações da tabela. O parágrafo deve ter no mínimo 5 linhas.'),
    imagePrompt: z.string().describe('Um prompt detalhado e artístico para um gerador de imagens, baseado na coluna "Imagem simbólica" da tabela, para criar uma bela representação do Yidam no estilo de uma pintura Thangka tradicional, com cores vibrantes e um fundo sagrado.'),
  }) },
  prompt: `Você é um LAMA, um mestre do budismo tibetano, com profundo conhecimento de astrologia e das divindades tântricas (Yidams). Um discípulo informou sua data de nascimento e busca descobrir qual Yidam de uma lista específica ressoa com sua essência para guiar sua meditação e caminho espiritual.

**Sua tarefa é:**
1.  Analisar a data de nascimento do discípulo ({{{birthDate}}}).
2.  Com base em sua sabedoria astrológica, selecionar a divindade Yidam **MAIS APROPRIADA** da lista abaixo.
3.  Usar as informações da divindade selecionada na tabela para preencher os campos de saída solicitados.

**Tabela de Yidams (Fonte de Verdade Absoluta):**

| Yidam           | Forma      | Elemento   | Transmuta                   | Palavra-chave             | Imagem simbólica                                    |
|-----------------|------------|------------|-----------------------------|---------------------------|-----------------------------------------------------|
| Avalokiteshvara | Pacífica   | Água       | Sofrimento → Compaixão      | Amor Universal            | Lótus branco nas mãos, mil braços, olhos ternos     |
| Manjushri       | Pacífica   | Ar         | Ignorância → Sabedoria      | Clareza Mental            | Espada flamejante e pergaminho de sabedoria         |
| Vajrapani       | Irado      | Fogo       | Medo → Coragem              | Poder Espiritual          | Corpo azul, raios elétricos e expressão feroz       |
| Tara Verde      | Pacífica   | Vento      | Passividade → Ação Compassiva | Liberação Rápida          | Sentada em lótus, perna estendida, olhar doce       |
| Tara Branca     | Pacífica   | Luz        | Doença → Cura               | Vitalidade                | Rosto sereno, brilho prateado, três olhos         |
| Vajrayogini     | Semi-irada | Fogo       | Desejo → Sabedoria Transcendente | Êxtase Tântrico           | Corpo vermelho flamejante, dançando em caveiras     |
| Yamantaka       | Irado      | Tempo      | Medo da morte → Libertação  | Vencedor da Morte         | Cabeça de boi, coroa de crânios, olhos de fogo      |
| Cakrasamvara    | Irado      | Fogo       | Apego → Bênção              | União Mística             | União com Vajravarahi, roda de luz                  |
| Kurukulla       | Irada      | Amor/Fogo  | Carência → Poder de Atração | Magia do Amor             | Arco de flores, cor vermelha, sorriso sedutor       |
| Padmasambhava   | Semi-irado | Todos      | Confusão → Consciência Desperta | Mestre da Transformação | Cajado khatvanga, aura dourada, olhar compassivo    |


**Para a divindade selecionada, forneça:**
1.  **Nome da Divindade:** O nome EXATO como está na tabela.
2.  **Mantra:** Crie um mantra autêntico e poderoso que se alinhe com a divindade e sua 'Palavra-chave'. (Ex: Para Avalokiteshvara, "Om Mani Padme Hum").
3.  **Características:** Escreva uma descrição poética e detalhada (mínimo 5 linhas) sobre as qualidades da divindade, usando as colunas 'Forma', 'Elemento', 'Transmuta' e 'Palavra-chave' como base.
4.  **Prompt de Imagem:** Use a coluna 'Imagem simbólica' como inspiração principal para criar um prompt de imagem detalhado e artístico para um gerador de imagens. O estilo deve ser uma pintura Thangka tradicional, com cores vibrantes, simbolismo rico e um fundo sagrado.

Data de Nascimento do Discípulo: {{{birthDate}}}

Selecione o Yidam e revele a sabedoria para este discípulo.`,
});

const generateYidamFlow = ai.defineFlow(
  {
    name: 'generateYidamFlow',
    inputSchema: GenerateYidamInputSchema,
    outputSchema: GenerateYidamOutputSchema,
  },
  async (input) => {
    // 1. Generate the textual details and the image prompt based on the provided table.
    const { output: promptOutput } = await generateYidamPrompt(input);
    if (!promptOutput) {
      throw new Error('Failed to generate Yidam details.');
    }

    // 2. Generate the image based on the created prompt.
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: promptOutput.imagePrompt,
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

    if (!media?.url) {
      throw new Error('Failed to generate Yidam image.');
    }

    // 3. Combine all results into the final output.
    return {
      deityName: promptOutput.deityName,
      mantra: promptOutput.mantra,
      characteristics: promptOutput.characteristics,
      imageUri: media.url,
    };
  }
);
