'use server';

import { rtdb } from '@/lib/firebase';
import { ref, set, get, child } from 'firebase/database';

/**
 * Fetches the entire dream dictionary from the database, concatenates all entries
 * into a single string, formatted for the AI prompt.
 * @returns A promise that resolves to the full dictionary content as a string.
 */
export async function getDreamDictionaryContent(): Promise<string> {
  const dictionaryRef = ref(rtdb, 'dreamDictionary');
  try {
    const snapshot = await get(dictionaryRef);
    if (!snapshot.exists()) {
      return ''; // Return empty string if the dictionary is not yet created
    }

    const dictionaryData = snapshot.val();
    // Sort keys alphabetically (A, B, C...) before joining
    const sortedKeys = Object.keys(dictionaryData).sort();
    
    const contentString = sortedKeys
      .map(key => `--- Letra ${key} ---\n${dictionaryData[key]}`)
      .join('\n\n');
      
    return contentString;
  } catch (error) {
    console.error("Error fetching dream dictionary from RTDB:", error);
    // In case of error, return an empty string to not break the interpretation flow
    return '';
  }
}

/**
 * Fetches the content for a single letter from the dream dictionary.
 * @param letter The letter to fetch (e.g., 'A').
 * @returns A promise that resolves to the content string or an empty string if not found.
 */
export async function getDreamDictionaryEntry(letter: string): Promise<string> {
  const letterRegex = /^[A-Z]$/;
  if (!letterRegex.test(letter)) {
    console.error('Invalid letter requested from dream dictionary.');
    return '';
  }
  const entryRef = ref(rtdb, `dreamDictionary/${letter}`);
  try {
    const snapshot = await get(entryRef);
    return snapshot.exists() ? snapshot.val() : '';
  } catch (error) {
    console.error(`Error fetching dream dictionary entry for '${letter}':`, error);
    return '';
  }
}

/**
 * Admin function to add or update the content for a specific letter in the dream dictionary.
 * The letter must be a single uppercase character.
 * @param letter The letter to update (e.g., 'A', 'B').
 * @param content The full text content for that letter's entry.
 * @returns An object indicating success or failure.
 */
export async function updateDreamDictionaryEntry(letter: string, content: string): Promise<{ success: boolean, message: string }> {
  const letterRegex = /^[A-Z]$/;
  if (!letterRegex.test(letter)) {
    return { success: false, message: 'Invalid letter. Must be a single uppercase character.' };
  }

  const entryRef = ref(rtdb, `dreamDictionary/${letter}`);
  try {
    await set(entryRef, content);
    return { success: true, message: `Dream dictionary entry for letter '${letter}' updated successfully.` };
  } catch (error: any) {
    console.error(`Error updating dictionary entry for letter '${letter}':`, error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}
