
'use server';

import { rtdb } from '@/lib/firebase';
import { ref, push, set, get, serverTimestamp, query, orderByChild, limitToLast } from 'firebase/database';
import type { ProcessedStorySegment } from '@/ai/flows/interpret-dream-flow';

export interface TarotReadingData {
  type: 'tarot';
  query: string;
  cardSpreadImageUri?: string; // Could be a data URI or a GCS path
  interpretationText: string;
  mandalaImageUri?: string; // Could be a data URI or a GCS path
  interpretationTimestamp: number | object;
}

export interface DreamInterpretationData {
  type: 'dream';
  dreamDescription: string;
  interpretationSegments: ProcessedStorySegment[];
  dictionaryInterpretation: string; // The text from the dictionary search
  interpretationTimestamp: number | object;
}

export interface OghamReadingData {
  type: 'ogham';
  query: string;
  interpretationText: string;
  oghamLetter: string;
  oghamSymbol: string;
  treeImageUri?: string | null; // Image of the corresponding tree
  adviceImageUri?: string | null; // Image representing Merlin's advice
  interpretationTimestamp: number | object;
}

export interface YidamsReadingData {
  type: 'yidams';
  query: string;
  deityName: string;
  introduction: string;
  storyAndElement: string;
  connectionToQuery: string;
  adviceAndMudra: string;
  mantra: string;
  mantraTranslation: string;
  mantraPronunciation: string;
  yidamImageUri: string;
  mandalaCouncil: string;
  mandalaImageUri?: string;
  interpretationTimestamp: number | object;
}


export type ReadingData = TarotReadingData | DreamInterpretationData | OghamReadingData | YidamsReadingData;

export async function saveReading(uid: string, readingData: Omit<ReadingData, 'interpretationTimestamp'>): Promise<string | null> {
  const readingsRef = ref(rtdb, `users/${uid}/readings`);
  const newReadingRef = push(readingsRef); // Generates a unique ID
  
  const dataWithTimestamp = {
    ...readingData,
    interpretationTimestamp: serverTimestamp(),
  };

  // Create a clean object to save, explicitly removing any undefined properties.
  // This helps prevent validation errors in Firebase for fields that are truly optional.
  const dataToSave = Object.fromEntries(
    Object.entries(dataWithTimestamp).filter(([_, v]) => v !== undefined)
  );


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
      // Reverse sort to get the most recent first
      return readings.reverse();
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
