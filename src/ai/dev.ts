
import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-card-reading.ts';
import '@/ai/flows/interpret-dream-flow.ts';
import '@/ai/flows/interpret-ogham-reading.ts';
import '@/ai/flows/generate-yidams-flow.ts';
import '@/ai/flows/generate-audio-flow.ts';
// Import new flows
import '@/ai/flows/generate-tarot-interpretation.ts';
import '@/ai/flows/generate-cigano-interpretation.ts';
import '@/ai/flows/generate-mesareal-interpretation.ts';
