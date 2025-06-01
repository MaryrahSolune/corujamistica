
import { rtdb } from '@/lib/firebase';
import { ref, push, set, get, serverTimestamp, query, orderByChild, limitToLast } from 'firebase/database';
import type { ProcessedStorySegment } from '@/ai/flows/interpret-dream-flow';

export interface TarotReadingData {
  type: 'tarot';
  query: string;
  cardSpreadImageUri?: string; // Could be a data URI or a GCS path
  interpretationText: string;
  summaryImageUri?: string; // Could be a data URI or a GCS path
  interpretationTimestamp: number | object;
}

export interface DreamInterpretationData {
  type: 'dream';
  dreamDescription: string;
  interpretationSegments: ProcessedStorySegment[];
  interpretationTimestamp: number | object;
}

export interface LoveOracleReadingData {
  type: 'loveOracle';
  problemDescription: string;
  adviceSegments: ProcessedStorySegment[];
  interpretationTimestamp: number | object;
}

export type ReadingData = TarotReadingData | DreamInterpretationData | LoveOracleReadingData;

export async function saveReading(uid: string, readingData: Omit<ReadingData, 'interpretationTimestamp'>): Promise<string | null> {
  const readingsRef = ref(rtdb, `users/${uid}/readings`);
  const newReadingRef = push(readingsRef); // Generates a unique ID
  
  const dataToSave: ReadingData = {
    ...readingData,
    interpretationTimestamp: serverTimestamp(),
  } as ReadingData; 

  try {
    await set(newReadingRef, dataToSave);
    return newReadingRef.key; 
  } catch (error) {
    console.error("Error saving reading to RTDB:", error);
    throw error;
  }
}

export async function getUserReadings(uid: string, limit: number = 5): Promise<Array<ReadingData & { id: string }>> {
  const readingsRef = ref(rtdb, `users/${uid}/readings`);
  const recentReadingsQuery = query(readingsRef, orderByChild('interpretationTimestamp'), limitToLast(limit));
  
  try {
    const snapshot = await get(recentReadingsQuery);
    const readings: Array<ReadingData & { id: string }> = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        readings.push({ id: childSnapshot.key!, ...childSnapshot.val() } as ReadingData & { id: string });
      });
      // Sort by timestamp descending (newest first) if serverTimestamp resolved to numbers
      // Firebase returns them in ascending order by the ordered child.
      readings.sort((a, b) => {
        const tsA = typeof a.interpretationTimestamp === 'number' ? a.interpretationTimestamp : 0;
        const tsB = typeof b.interpretationTimestamp === 'number' ? b.interpretationTimestamp : 0;
        return tsB - tsA;
      });
      return readings;
    }
    return [];
  } catch (error) {
    console.error("Error fetching user readings from RTDB:", error);
    throw error;
  }
}

export async function getReadingById(uid: string, readingId: string): Promise<(ReadingData & { id: string }) | null> {
  const readingRef = ref(rtdb, `users/${uid}/readings/${readingId}`);
  try {
    const snapshot = await get(readingRef);
    if (snapshot.exists()) {
      return { id: snapshot.key!, ...snapshot.val() } as ReadingData & { id: string };
    }
    return null;
  } catch (error) {
    console.error("Error fetching reading by ID from RTDB:", error);
    throw error;
  }
}
