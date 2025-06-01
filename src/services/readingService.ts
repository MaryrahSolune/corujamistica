
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

export type ReadingData = TarotReadingData | DreamInterpretationData;

export async function saveReading(uid: string, readingData: Omit<ReadingData, 'interpretationTimestamp'>): Promise<string | null> {
  const readingsRef = ref(rtdb, `users/${uid}/readings`);
  const newReadingRef = push(readingsRef); // Generates a unique ID
  
  const dataToSave: ReadingData = {
    ...readingData,
    interpretationTimestamp: serverTimestamp(),
  } as ReadingData; // Type assertion needed because of Omit

  try {
    await set(newReadingRef, dataToSave);
    return newReadingRef.key; // Return the ID of the saved reading
  } catch (error) {
    console.error("Error saving reading to RTDB:", error);
    throw error;
  }
}

export async function getUserReadings(uid: string, limit: number = 5): Promise<Array<ReadingData & { id: string }>> {
  const readingsRef = ref(rtdb, `users/${uid}/readings`);
  // Order by timestamp and get the last 'limit' readings
  // Note: RTDB requires an index on 'interpretationTimestamp' for this query to work efficiently.
  // You'll need to add this to your RTDB rules: ".indexOn": ["interpretationTimestamp"] for the 'readings' node.
  const recentReadingsQuery = query(readingsRef, orderByChild('interpretationTimestamp'), limitToLast(limit));
  
  try {
    const snapshot = await get(recentReadingsQuery);
    const readings: Array<ReadingData & { id: string }> = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        readings.push({ id: childSnapshot.key!, ...childSnapshot.val() } as ReadingData & { id: string });
      });
      return readings.reverse(); // To show newest first
    }
    return [];
  } catch (error) {
    console.error("Error fetching user readings from RTDB:", error);
    throw error;
  }
}
