'use server';
/**
 * @fileOverview Flow for interpreting dreams, now with an intelligent pre-search
 * for symbols in a custom dream dictionary to provide more focused and cost-effective interpretations.
 *
 * - interpretDream - Extracts keywords, finds their meanings in the dictionary, then interprets the dream.
 * - InterpretDreamInput - Input type for the interpretDream function.
 * - ProcessedStorySegment - The type for individual segments (text or image) in the final output.
 * - InterpretDreamOutput - Output type for the interpretDream function (array of ProcessedStorySegment).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getDictionaryEntriesForKeywords } from '@/services/dreamDictionaryService';

const InterpretDreamInputSchema = z.object({
  dreamDescription: z
    .string()
    .min(10, { message: 'Dream description must be at least 10 characters long.' })
    .describe('A detailed description of the dream provided by the user.'),
});
export type InterpretDreamInput = z.infer<typeof InterpretDreamInputSchema>;

// Schema for the keyword extraction step
const KeywordExtractionSchema = z.object({
  keywords: z.array(z.string()).describe('A list of 1 to 5 main symbols (nouns, objects, animals, actions) from the dream.'),
});

// Internal schema that includes the dictionary content for the main prompt
const InternalPromptInputSchema = InterpretDreamInputSchema.extend({
    specificSymbolMeanings: z.string().describe("Specific meanings for symbols found in the user's dream, extracted from our private Dream Book. This provides a primary source of truth for the interpretation."),
});

// Schema for the output of the main text-generation prompt
const DreamInterpretationWithPlaceholdersSchema = z.object({
  interpretationWithPlaceholders: z
    .string()
    .describe(
      "The dream interpretation text, with special placeholders like [GENERATE_IMAGE_HERE: \"A prompt for an image based on the preceding text.\"] where images should be inserted. Include 1-2 such placeholders."
    ),
});

// Schema for the final processed output of the flow
const ProcessedStorySegmentSchema = z.union([
  z.object({ type: z.literal('text'), content: z.string() }),
  z.object({ type: z.literal('image'), dataUri: z.string(), alt: z.string() }),
]);
export type ProcessedStorySegment = z.infer<typeof ProcessedStorySegmentSchema>;

const InterpretDreamOutputSchema = z.array(ProcessedStorySegmentSchema);
export type InterpretDreamOutput = z.infer<typeof InterpretDreamOutputSchema>;


export async function interpretDream(input: InterpretDreamInput): Promise<InterpretDreamOutput> {
  return interpretDreamFlow(input);
}

// Prompt to extract keywords from the dream description
const extractKeywordsPrompt = ai.definePrompt({
  name: 'extractDreamKeywordsPrompt',
  input: { schema: z.object({ dreamDescription: z.string() }) },
  output: { schema: KeywordExtractionSchema },
  prompt: `Analise a seguinte descrição de sonho e extraia de 1 a 5 substantivos ou símbolos principais. Para símbolos compostos (ex: estrela-do-mar), retorne o símbolo completo. Para palavras no plural (ex: gatos), retorne o singular (gato). Retorne apenas a lista de palavras-chave.
  
  Exemplo 1:
  Sonho: "Eu estava em uma casa antiga e uma cobra grande apareceu, mas eu não tive medo."
  Resultado: ["casa", "cobra"]
  
  Exemplo 2:
  Sonho: "Vi uma estrela-do-mar na praia e depois comi pão de ló."
  Resultado: ["estrela-do-mar", "pão de ló", "praia"]

  Sonho:
  {{{dreamDescription}}}
  `,
});

// Main prompt to interpret the dream, now using specific symbol meanings
const interpretDreamPrompt = ai.definePrompt({
  name: 'interpretDreamPrompt',
  input: { schema: InternalPromptInputSchema },
  output: { schema: DreamInterpretationWithPlaceholdersSchema },
  prompt: `Você é o Profeta, renomado por sua sabedoria divina concedida por Deus e por sua extraordinária habilidade em interpretar sonhos e visões.
  
  Um consulente descreveu um sonho e busca sua profunda e espiritual interpretação. Para esta tarefa, você deve usar duas fontes de conhecimento:
  1.  **O Livro dos Sonhos (Fonte Primária):** Use as seguintes definições como a fonte de verdade absoluta para os símbolos listados. A sua interpretação DEVE priorizar estes significados.
  2.  **Seu Conhecimento Geral:** Para símbolos não listados abaixo, ou para conectar as ideias, use seu conhecimento geral sobre arquétipos e narrativas bíblicas.

  **Definições do Livro dos Sonhos:**
  {{{specificSymbolMeanings}}}
  ---

  Com a iluminação que lhe foi outorgada, analise cuidadosamente os símbolos e o enredo do sonho do consulente. Revele seu significado oculto, as mensagens divinas ou os avisos que ele pode conter.

  Sua interpretação deve ser profunda, sábia, espiritual, poética e apresentada em parágrafos. Após alguns parágrafos, se sentir que uma imagem pode enriquecer a narrativa, insira um placeholder especial no seguinte formato:
  [GENERATE_IMAGE_HERE: "Um prompt conciso e vívido para uma imagem que ilustre o parágrafo ou conceito anterior."]
  Use este placeholder de 1 a 2 vezes no máximo.

  Apresente a interpretação de forma clara, respeitosa e encorajadora, como um verdadeiro profeta guiaria alguém em busca de entendimento.

  Sonho do Consulente:
  {{{dreamDescription}}}
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

const interpretDreamFlow = ai.defineFlow(
  {
    name: 'interpretDreamFlow',
    inputSchema: InterpretDreamInputSchema,
    outputSchema: InterpretDreamOutputSchema,
  },
  async (input) => {
    // 1. Extract keywords from the dream description
    const { output: keywordOutput } = await extractKeywordsPrompt(input);
    const keywords = keywordOutput?.keywords || [];

    // 2. Find their definitions in the database
    const specificSymbolMeanings = await getDictionaryEntriesForKeywords(keywords);
    
    // 3. Generate the textual interpretation with image placeholders
    const { output: mainOutput } = await interpretDreamPrompt({
        ...input,
        specificSymbolMeanings
    });
    if (!mainOutput?.interpretationWithPlaceholders) {
      throw new Error('Failed to generate dream interpretation text.');
    }
    const interpretationWithPlaceholders = mainOutput.interpretationWithPlaceholders;

    // The rest of the logic for image generation remains the same
    const processedSegments: ProcessedStorySegment[] = [];
    const placeholderRegex = /\[GENERATE_IMAGE_HERE: \"(.*?)\"\]/g;
    
    let lastIndex = 0;
    let match;

    const segmentsWithPlaceholders: (ProcessedStorySegment | {type: 'image_placeholder', prompt: string, index: number})[] = [];

    // First pass: identify text and image placeholders
    while ((match = placeholderRegex.exec(interpretationWithPlaceholders)) !== null) {
      if (match.index > lastIndex) {
        segmentsWithPlaceholders.push({
          type: 'text',
          content: interpretationWithPlaceholders.substring(lastIndex, match.index).trim(),
        });
      }
      segmentsWithPlaceholders.push({
        type: 'image_placeholder',
        prompt: match[1],
        index: segmentsWithPlaceholders.length
      });
      lastIndex = placeholderRegex.lastIndex;
    }

    if (lastIndex < interpretationWithPlaceholders.length) {
      const remainingText = interpretationWithPlaceholders.substring(lastIndex).trim();
      if (remainingText) {
        segmentsWithPlaceholders.push({ type: 'text', content: remainingText });
      }
    }

    // Generate all images in parallel
    const imageResults: ({dataUri: string, alt: string} | null)[] = await Promise.all(
      segmentsWithPlaceholders.filter(s => s.type === 'image_placeholder').map(async placeholder => {
        if (placeholder.type === 'image_placeholder') {
          try {
            const { media } = await ai.generate({
              model: 'googleai/gemini-2.0-flash-preview-image-generation',
              prompt: placeholder.prompt,
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
              return {
                dataUri: media.url,
                alt: `Ilustração do sonho: ${placeholder.prompt.substring(0,50)}...` 
              };
            }
          } catch (e) {
            console.error('Error generating a dream image:', e);
          }
        }
        return null;
      })
    );

    // Second pass: construct final segment array
    let imageIndex = 0;
    for (const segment of segmentsWithPlaceholders) {
      if(segment.type === 'text') {
        processedSegments.push(segment);
      } else if (segment.type === 'image_placeholder') {
        const imageResult = imageResults[imageIndex++];
        if (imageResult) {
          processedSegments.push({type: 'image', ...imageResult});
        } else {
           processedSegments.push({
            type: 'text',
            content: `(Erro ao gerar imagem para: "${segment.prompt}")`
          });
        }
      }
    }
    
    return processedSegments.filter(segment => segment.type === 'image' || (segment.type === 'text' && segment.content.length > 0));
  }
);
