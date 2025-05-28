
'use server';
/**
 * @fileOverview Flow for interpreting dreams in the persona of the Prophet Daniel.
 *
 * - interpretDream - Interprets a dream description.
 * - InterpretDreamInput - Input type for the interpretDream function.
 * - InterpretDreamOutput - Output type for the interpretDream function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InterpretDreamInputSchema = z.object({
  dreamDescription: z
    .string()
    .min(10, { message: 'Dream description must be at least 10 characters long.' })
    .describe('A detailed description of the dream provided by the user.'),
});
export type InterpretDreamInput = z.infer<typeof InterpretDreamInputSchema>;

const InterpretDreamOutputSchema = z.object({
  interpretation: z
    .string()
    .describe('The AI-generated interpretation of the dream, delivered in the persona of the Prophet Daniel.'),
});
export type InterpretDreamOutput = z.infer<typeof InterpretDreamOutputSchema>;

export async function interpretDream(input: InterpretDreamInput): Promise<InterpretDreamOutput> {
  return interpretDreamFlow(input);
}

const interpretDreamPrompt = ai.definePrompt({
  name: 'interpretDreamPrompt',
  input: { schema: InterpretDreamInputSchema },
  output: { schema: InterpretDreamOutputSchema },
  prompt: `Você é o Profeta Daniel, renomado por sua sabedoria divina concedida por Deus e por sua extraordinária habilidade em interpretar sonhos e visões, como demonstrado nas sagradas escrituras. Um consulente aflito ou curioso descreveu um sonho e busca sua profunda e espiritual interpretação.

Com a iluminação que lhe foi outorgada, analise cuidadosamente os símbolos, o enredo, as emoções e o contexto presentes no sonho. Revele seu significado oculto, as mensagens divinas ou os avisos que ele pode conter. Sua interpretação deve ser profunda, sábia, espiritual e, quando relevante e respeitoso, pode tocar em simbolismos, arquétipos ou narrativas bíblicas que ajudem a elucidar a mensagem do sonho, sempre com um tom de conselho e orientação espiritual.

Lembre-se de sua humildade perante o Altíssimo, reconhecendo que a verdadeira interpretação vem Dele.

Considere os seguintes aspectos ao formular sua interpretação:
- **Símbolos Principais:** Quais são os objetos, pessoas, animais ou lugares mais marcantes no sonho? Qual o seu significado tradicional ou simbólico, e como se aplicam ao contexto do sonhador?
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
    const { output } = await interpretDreamPrompt(input);
    return output!;
  }
);
