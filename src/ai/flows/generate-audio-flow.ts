
'use server';
/**
 * @fileOverview A Genkit flow to convert text to speech using Google's TTS model.
 *
 * - generateAudio - A function that handles the text-to-speech process.
 * - GenerateAudioInput - The input type for the generateAudio function.
 * - GenerateAudioOutput - The return type for the generateAudio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

export const GenerateAudioInputSchema = z.object({
  textToNarrate: z.string().min(1).describe('The text to be converted to speech.'),
});
export type GenerateAudioInput = z.infer<typeof GenerateAudioInputSchema>;

export const GenerateAudioOutputSchema = z.object({
  audioDataUri: z.string().describe("A data URI of the generated audio in WAV format. Format: 'data:audio/wav;base64,<encoded_data>'."),
});
export type GenerateAudioOutput = z.infer<typeof GenerateAudioOutputSchema>;

/**
 * Converts a buffer of raw PCM audio data to a Base64-encoded WAV string.
 * @param pcmData The raw PCM audio data buffer.
 * @param channels The number of audio channels.
 * @param rate The sample rate.
 * @param sampleWidth The sample width in bytes.
 * @returns A promise that resolves to the Base64-encoded WAV string.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const generateAudioFlow = ai.defineFlow(
  {
    name: 'generateAudioFlow',
    inputSchema: GenerateAudioInputSchema,
    outputSchema: GenerateAudioOutputSchema,
  },
  async ({ textToNarrate }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: textToNarrate,
    });

    if (!media || !media.url) {
      throw new Error('No audio media was returned from the TTS model.');
    }

    // The data URI from Gemini is raw PCM data, which needs to be converted to a playable format like WAV.
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);

export async function generateAudio(input: GenerateAudioInput): Promise<GenerateAudioOutput> {
  return generateAudioFlow(input);
}
