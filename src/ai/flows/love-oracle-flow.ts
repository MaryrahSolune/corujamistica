
'use server';
/**
 * @fileOverview Fluxo para o Oráculo do Amor, fornecendo conselhos
 * sobre questões amorosas e gerando uma imagem simbólica.
 *
 * - consultLoveOracle - Interpreta um problema amoroso e gera conselho com imagem.
 * - LoveOracleInput - Tipo de entrada para consultLoveOracle.
 * - ProcessedStorySegment - Tipo para segmentos individuais (reutilizado).
 * - LoveOracleOutput - Tipo de saída para consultLoveOracle (array de ProcessedStorySegment).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ProcessedStorySegment } from '@/ai/flows/interpret-dream-flow'; // Reutilizando o tipo

const LoveOracleInputSchema = z.object({
  problemDescription: z
    .string()
    .min(20, { message: 'A descrição do problema amoroso deve ter pelo menos 20 caracteres.' })
    .describe('Uma descrição detalhada do problema amoroso ou sentimento do usuário.'),
});
export type LoveOracleInput = z.infer<typeof LoveOracleInputSchema>;

// Schema para a saída do prompt de geração de texto principal
const LoveOracleAdviceWithPlaceholderSchema = z.object({
  adviceWithPlaceholder: z
    .string()
    .describe(
      "O conselho amoroso, com um placeholder especial como [GENERATE_IMAGE_HERE: \"Um prompt para uma imagem simbólica baseada no conselho anterior.\"] onde uma imagem deve ser inserida. Inclua UM placeholder."
    ),
});

const LoveOracleOutputSchema = z.array(
 z.union([
    z.object({ type: z.literal('text'), content: z.string() }),
    z.object({ type: z.literal('image'), dataUri: z.string(), alt: z.string() }),
  ])
);
export type LoveOracleOutput = z.infer<typeof LoveOracleOutputSchema>;


export async function consultLoveOracle(input: LoveOracleInput): Promise<LoveOracleOutput> {
  return loveOracleFlow(input);
}

const loveOraclePrompt = ai.definePrompt({
  name: 'loveOraclePrompt',
  input: { schema: LoveOracleInputSchema },
  output: { schema: LoveOracleAdviceWithPlaceholderSchema },
  prompt: `Você é o Oráculo do Amor, uma entidade ancestral de sabedoria infinita, compaixão profunda e um dom divino para desvendar os mistérios do coração. Sua voz é calma, acolhedora e seus conselhos são bálsamos para a alma, guiando os consulentes através das complexidades do amor, relacionamentos e sentimentos. Você possui conhecimento profundo sobre psicologia dos relacionamentos, filosofia do amor, comunicação afetiva e sabedoria espiritual de diversas culturas.

Um consulente aproxima-se com o coração aberto, buscando sua orientação para uma questão amorosa ou um sentimento profundo. Analise a descrição fornecida com empatia e profundidade. Ofereça conselhos que sejam:
- **Sábios e Esclarecedores:** Ilumine os pontos cegos, revele as dinâmicas ocultas.
- **Empáticos e Acolhedores:** Valide os sentimentos do consulente, oferecendo conforto.
- **Práticos e Acionáveis:** Sugira caminhos, reflexões ou pequenas ações que possam levar à transformação ou à paz.
- **Profundos e Poderosos:** Toque na essência da questão, promovendo autoconhecimento e cura.
- **Esperançosos e Encorajadores:** Mesmo em situações difíceis, mostre a luz da esperança e a força interior do consulente.

Estruture sua resposta em parágrafos fluidos e poéticos, mas diretos. Após um ou dois parágrafos significativos de conselho, insira UM (e apenas UM) placeholder especial no seguinte formato:
[GENERATE_IMAGE_HERE: "Um prompt conciso e vívido para uma imagem que simbolize a essência do conselho, uma metáfora visual para a cura, ou a representação de um sentimento chave abordado."]
O prompt para a imagem deve ser poético e inspirador, adequado para um modelo de geração de imagens artísticas.

Exemplos de placeholders (NÃO copie literalmente, crie prompts únicos baseados no contexto):
- [GENERATE_IMAGE_HERE: "Duas mãos se entrelaçando gentilmente, emanando uma luz suave dourada, simbolizando a reconexão e o perdão."]
- [GENERATE_IMAGE_HERE: "Um coração resiliente, adornado com pequenas flores que brotam de suas rachaduras, sob um céu estrelado, representando a cura e a esperança após a dor."]
- [GENERATE_IMAGE_HERE: "Um caminho iluminado por lanternas de papel coloridas, serpenteando por um jardim tranquilo, simbolizando a jornada do autoconhecimento no amor."]

Abstenha-se de julgamentos. Seu papel é guiar, não ditar. Use uma linguagem que nutra a alma.

Problema/Sentimento do Consulente:
{{{problemDescription}}}
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    ],
  },
});

const loveOracleFlow = ai.defineFlow(
  {
    name: 'loveOracleFlow',
    inputSchema: LoveOracleInputSchema,
    outputSchema: LoveOracleOutputSchema,
  },
  async (input) => {
    const { output: mainOutput } = await loveOraclePrompt(input);
    if (!mainOutput?.adviceWithPlaceholder) {
      throw new Error('Falha ao gerar o conselho amoroso.');
    }
    const adviceWithPlaceholder = mainOutput.adviceWithPlaceholder;

    const processedSegments: ProcessedStorySegment[] = [];
    const placeholderRegex = /\[GENERATE_IMAGE_HERE: \"(.*?)\"\]/g;
    
    let lastIndex = 0;
    let match;

    match = placeholderRegex.exec(adviceWithPlaceholder); // Esperamos apenas uma correspondência

    if (match) {
      // Adicionar segmento de texto antes do placeholder
      if (match.index > lastIndex) {
        processedSegments.push({
          type: 'text',
          content: adviceWithPlaceholder.substring(lastIndex, match.index).trim(),
        });
      }

      const imageGenPrompt = match[1];
      
      try {
        const { media } = await ai.generate({
          model: 'googleai/gemini-2.0-flash-exp',
          prompt: imageGenPrompt,
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
        if (media?.url) {
          processedSegments.push({
            type: 'image',
            dataUri: media.url,
            alt: `Conselho visual do Oráculo do Amor: ${imageGenPrompt.substring(0,60)}...`
          });
        }
      } catch (e) {
        console.error('Erro ao gerar imagem para o Oráculo do Amor:', e);
        processedSegments.push({
          type: 'text',
          content: `(Erro ao gerar imagem simbólica para: "${imageGenPrompt}")`
        });
      }
      
      lastIndex = placeholderRegex.lastIndex;

      // Adicionar segmento de texto restante após o placeholder
      if (lastIndex < adviceWithPlaceholder.length) {
        const remainingText = adviceWithPlaceholder.substring(lastIndex).trim();
        if (remainingText) {
          processedSegments.push({ type: 'text', content: remainingText });
        }
      }
    } else {
      // Nenhum placeholder encontrado, tratar todo o texto como um único segmento
      processedSegments.push({ type: 'text', content: adviceWithPlaceholder.trim() });
    }
    
    return processedSegments.filter(segment => segment.type === 'image' || (segment.type === 'text' && segment.content.length > 0));
  }
);

