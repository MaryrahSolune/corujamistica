import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-card-reading.ts';
import '@/ai/flows/generate-reading-interpretation.ts';
import '@/ai/flows/interpret-dream-flow.ts';
import '@/ai/flows/interpret-ogham-reading.ts';
import '@/ai/flows/generate-yidams-flow.ts';
