'use server';

import { rtdb } from '@/lib/firebase';
import { ref, set, get } from 'firebase/database';

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
 * Searches the dream dictionary for specific keywords and returns their definitions.
 * @param keywords An array of keywords to look for.
 * @returns A formatted string containing the definitions of found keywords.
 */
export async function getDictionaryEntriesForKeywords(keywords: string[]): Promise<string> {
  if (!keywords || keywords.length === 0) {
    return '';
  }

  // 1. Determine which letters we need to fetch from the DB
  const uniqueLetters = [...new Set(
    keywords
      .map(k => k.trim().charAt(0).toUpperCase())
      .filter(l => /^[A-Z]$/.test(l))
  )];

  if (uniqueLetters.length === 0) {
    return '';
  }

  // 2. Fetch all required letter entries in parallel
  const letterPromises = uniqueLetters.map(letter => getDreamDictionaryEntry(letter));
  const letterContents = await Promise.all(letterPromises);
  
  const fullDictionaryText = letterContents.join('\n');
  const foundDefinitions = new Set<string>();

  const dictionaryLines = fullDictionaryText.split('\n').map(l => l.trim()).filter(Boolean);

  // 3. Search for the keywords in the fetched content
  for (const keyword of keywords) {
      // Create a regex that looks for the keyword at the start of a line, followed by a hyphen.
      // This is more robust than just checking if a line includes the keyword.
      // Example: `new RegExp('^' + 'CASA' + '\\s*-\\s*(.+)', 'i')`
      const regex = new RegExp(`^${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*-\\s*(.+)`, 'i');
      for (const line of dictionaryLines) {
          if (regex.test(line)) {
              foundDefinitions.add(line);
              // Don't break here, in case a keyword appears multiple times with different meanings (though unlikely with current structure)
          }
      }
  }

  if (foundDefinitions.size === 0) {
    return "Nenhum símbolo específico foi encontrado no Livro dos Sonhos para esta análise.";
  }

  return `Considerando os símbolos do seu sonho, aqui estão os significados encontrados no Livro dos Sonhos para sua referência:\n\n${Array.from(foundDefinitions).join('\n')}`;
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
