'use server';
/**
 * @fileOverview Flow for interpreting dreams in the persona of the Prophet,
 * now generating illustrative images interleaved with text and using a custom dream dictionary from the database.
 *
 * - interpretDream - Interprets a dream description and generates accompanying images.
 * - InterpretDreamInput - Input type for the interpretDream function.
 * - ProcessedStorySegment - The type for individual segments (text or image) in the final output.
 * - InterpretDreamOutput - Output type for the interpretDream function (array of ProcessedStorySegment).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getDreamDictionaryContent } from '@/services/dreamDictionaryService';

const InterpretDreamInputSchema = z.object({
  dreamDescription: z
    .string()
    .min(10, { message: 'Dream description must be at least 10 characters long.' })
    .describe('A detailed description of the dream provided by the user.'),
  // dreamDictionaryContent is now fetched from the database within the flow
});
export type InterpretDreamInput = z.infer<typeof InterpretDreamInputSchema>;

// Internal schema that includes the dictionary content for the prompt
const InternalPromptInputSchema = InterpretDreamInputSchema.extend({
    dreamDictionaryContent: z.string().optional().describe('Optional. A custom dictionary of dream symbols and their meanings to be used as the primary source for interpretation.'),
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

const interpretDreamPrompt = ai.definePrompt({
  name: 'interpretDreamPrompt',
  input: { schema: InternalPromptInputSchema },
  output: { schema: DreamInterpretationWithPlaceholdersSchema },
  prompt: `Você é o Profeta, renomado por sua sabedoria divina concedida por Deus e por sua extraordinária habilidade em interpretar sonhos e visões, como demonstrado nas sagradas escrituras. Um consulente aflito ou curioso descreveu um sonho e busca sua profunda e espiritual interpretação.

Com a iluminação que lhe foi outorgada, analise cuidadosamente os símbolos, o enredo, as emoções e o contexto presentes no sonho. Revele seu significado oculto, as mensagens divinas ou os avisos que ele pode conter.

{{#if dreamDictionaryContent}}
**Instrução Mestra:** Utilize o seguinte "Dicionário de Sonhos" como a fonte de conhecimento **primária e absoluta** para todos os símbolos. A sua interpretação DEVE se basear estritamente neste dicionário. Ignore outros conhecimentos que você possua sobre símbolos que estão definidos aqui.

**Dicionário de Sonhos (Fonte Primária):**
{{{dreamDictionaryContent}}}
---
{{/if}}

Sua interpretação deve ser profunda, sábia, espiritual, poética e, quando relevante e respeitoso, pode tocar em simbolismos, arquétipos ou narrativas bíblicas que ajudem a elucidar a mensagem do sonho, sempre com um tom de conselho e orientação espiritual.

Lembre-se de sua humildade perante o Altíssimo, reconhecendo que a verdadeira interpretação vem Dele.

Apresente a interpretação em parágrafos. Após alguns parágrafos, se sentir que uma imagem pode enriquecer a narrativa, insira um placeholder especial no seguinte formato:
[GENERATE_IMAGE_HERE: "Um prompt conciso e vívido para uma imagem que ilustre o parágrafo ou conceito anterior."]
Use este placeholder de 1 a 2 vezes no máximo durante toda a interpretação. O prompt dentro do placeholder deve ser claro para um modelo de geração de imagem.

Considere os seguintes aspectos ao formular sua interpretação:
- **Símbolos Principais:** Quais são os objetos, pessoas, animais ou lugares mais marcantes no sonho? Qual o seu significado tradicional ou simbólico (baseado no dicionário fornecido, se houver), e como se aplicam ao contexto do sonhador?
- **Narrativa do Sonho:** Qual a sequência de eventos? Houve um conflito, uma jornada, uma revelação?
- **Emoções Sentidas:** Quais emoções o sonhador experimentou durante o sonho e ao acordar? (Alegria, medo, ansiedade, paz, etc.)
- **Contexto do Sonhador:** Embora não tenhamos o contexto de vida do sonhador, a interpretação deve ser apresentada de forma que ele possa refletir e aplicar à sua própria situação.
- **Mensagem ou Lição:** Qual a principal mensagem, aviso ou lição que o sonho parece transmitir?

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
    // 1. Fetch the dream dictionary content from the database
    const dreamDictionaryContent = await getDreamDictionaryContent();

    // 2. Generate the textual interpretation with image placeholders
    const { output: mainOutput } = await interpretDreamPrompt({
        ...input,
        dreamDictionaryContent: dreamDictionaryContent
    });
    if (!mainOutput?.interpretationWithPlaceholders) {
      throw new Error('Failed to generate dream interpretation text.');
    }
    const interpretationWithPlaceholders = mainOutput.interpretationWithPlaceholders;

    const processedSegments: ProcessedStorySegment[] = [];
    const placeholderRegex = /\[GENERATE_IMAGE_HERE: \"(.*?)\"\]/g;
    
    let lastIndex = 0;
    let match;

    const imageGenerationPromises: Promise<void>[] = [];
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
