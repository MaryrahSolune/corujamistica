
'use server';

import { rtdb } from '@/lib/firebase';
import { ref, set, get, child } from 'firebase/database';

export interface DailyReward {
  day: number;
  title: string;
  imageUrl: string;
  type: 'credits' | 'ebook' | 'tarot_reading'; // Extensible for future reward types
  value: number;
}

const REWARD_CYCLE_LENGTH = 30;

// Helper to create a default reward if none is set
const createDefaultReward = (day: number): DailyReward => ({
  day,
  title: `Recompensa do Dia ${day}`,
  imageUrl: `https://placehold.co/100x100.png`,
  type: 'credits',
  value: 1,
});

/**
 * Fetches the entire 30-day reward cycle from the database.
 * If a reward for a specific day is not set, it returns a default reward.
 */
export async function getRewardCycle(): Promise<DailyReward[]> {
  const cycleRef = ref(rtdb, 'dailyRewards/cycle');
  const rewards: DailyReward[] = [];
  try {
    const snapshot = await get(cycleRef);
    const cycleData = snapshot.val() || {};
    for (let i = 1; i <= REWARD_CYCLE_LENGTH; i++) {
      if (cycleData[i]) {
        rewards.push({ day: i, ...cycleData[i] });
      } else {
        rewards.push(createDefaultReward(i));
      }
    }
    return rewards;
  } catch (error) {
    console.error("Error fetching reward cycle:", error);
    // Return a full default cycle on error
    return Array.from({ length: REWARD_CYCLE_LENGTH }, (_, i) => createDefaultReward(i + 1));
  }
}

/**
 * Fetches the reward for a specific day in the cycle.
 * Returns a default reward if not configured.
 * @param day The day number (1-30) in the reward cycle.
 */
export async function getRewardForDay(day: number): Promise<DailyReward> {
  if (day < 1 || day > REWARD_CYCLE_LENGTH) {
    throw new Error(`Day ${day} is outside the valid reward cycle range (1-30).`);
  }
  const dayRef = ref(rtdb, `dailyRewards/cycle/${day}`);
  try {
    const snapshot = await get(dayRef);
    if (snapshot.exists()) {
      return { day, ...snapshot.val() };
    }
    return createDefaultReward(day);
  } catch (error) {
    console.error(`Error fetching reward for day ${day}:`, error);
    return createDefaultReward(day);
  }
}

/**
 * Admin function to set or update the reward for a specific day in the cycle.
 * @param day The day number (1-30) to update.
 * @param rewardData The data for the reward.
 */
export async function setRewardForDay(day: number, rewardData: Omit<DailyReward, 'day'>): Promise<{ success: boolean, message: string }> {
  if (day < 1 || day > REWARD_CYCLE_LENGTH) {
    return { success: false, message: `Day ${day} is outside the valid reward cycle range (1-30).` };
  }
  const dayRef = ref(rtdb, `dailyRewards/cycle/${day}`);
  try {
    // Ensure value is a number
    const dataToSave = {
      ...rewardData,
      value: Number(rewardData.value) || 0,
    };
    await set(dayRef, dataToSave);
    return { success: true, message: `Reward for day ${day} updated successfully.` };
  } catch (error: any) {
    console.error(`Error setting reward for day ${day}:`, error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}
