
import { rtdb } from '@/lib/firebase';
import { ref, set, get, update, runTransaction, serverTimestamp } from 'firebase/database';
import { getRewardForDay, type DailyReward } from './rewardService';
import type { UserProfileData } from './userService';

export interface UserCreditsData {
  balance: number;
  freeCreditClaimed: boolean;
  lastFreeCreditClaimTimestamp?: number | object | null;
}

const FREE_CREDITS_ON_CLAIM = 1;
const INITIAL_CREDITS = 0;
const GIFT_COOLDOWN_MILLISECONDS = 24 * 60 * 60 * 1000; // 24 hours

export async function initializeUserCredits(uid: string): Promise<void> {
  const creditsRef = ref(rtdb, `users/${uid}/credits`);
  const initialData: UserCreditsData = {
    balance: INITIAL_CREDITS,
    freeCreditClaimed: false,
  };
  try {
    const snapshot = await get(creditsRef);
    if (!snapshot.exists()) {
      await set(creditsRef, initialData);
    }
  } catch (error) {
    console.error("Error initializing user credits in RTDB:", error);
    throw error;
  }
}

export async function getUserCredits(uid: string): Promise<UserCreditsData | null> {
  const creditsRef = ref(rtdb, `users/${uid}/credits`);
  try {
    const snapshot = await get(creditsRef);
    if (snapshot.exists()) {
      return snapshot.val() as UserCreditsData;
    }
    await initializeUserCredits(uid);
    const newSnapshot = await get(creditsRef);
    return newSnapshot.val() as UserCreditsData
  } catch (error) {
    console.error("Error fetching user credits from RTDB:", error);
    return { balance: 0, freeCreditClaimed: false };
  }
}

export async function claimFreeCredit(uid: string): Promise<{ success: boolean; message: string; newBalance?: number }> {
    const creditsRef = ref(rtdb, `users/${uid}/credits`);
    try {
      const result = await runTransaction(creditsRef, (currentData: UserCreditsData | null) => {
        if (currentData === null) {
          return { balance: FREE_CREDITS_ON_CLAIM, freeCreditClaimed: true, lastFreeCreditClaimTimestamp: serverTimestamp() };
        }
  
        if (currentData.freeCreditClaimed) {
          return; // Aborts the transaction
        }
  
        currentData.balance = (currentData.balance || 0) + FREE_CREDITS_ON_CLAIM;
        currentData.freeCreditClaimed = true;
        currentData.lastFreeCreditClaimTimestamp = serverTimestamp();
        return currentData;
      });
  
      if (result.committed && result.snapshot.exists()) {
        return { success: true, message: "Free credit claimed successfully.", newBalance: result.snapshot.val().balance };
      } else {
        return { success: false, message: "Free credit already claimed or transaction failed." };
      }
    } catch (error: any) {
      console.error("Error claiming free credit:", error);
      return { success: false, message: error.message || "An error occurred while claiming free credit." };
    }
}

export async function claimDailyReward(uid: string): Promise<{ success: boolean; message: string; reward?: DailyReward; cooldownEndTime?: number; }> {
  const profileRef = ref(rtdb, `users/${uid}/profile`);
  const creditsRef = ref(rtdb, `users/${uid}/credits`);

  try {
    const profileSnapshot = await get(profileRef);
    if (!profileSnapshot.exists()) {
      return { success: false, message: "User profile not found." };
    }
    const userProfile: UserProfileData = profileSnapshot.val();

    const now = Date.now();
    const lastClaim = userProfile.lastClaimTimestamp || 0;

    if (now - lastClaim < GIFT_COOLDOWN_MILLISECONDS) {
      const cooldownEndTime = lastClaim + GIFT_COOLDOWN_MILLISECONDS;
      return { success: false, message: "Daily reward is still on cooldown.", cooldownEndTime };
    }

    const currentStreak = userProfile.dailyRewardStreak || 0;
    const nextStreakDay = (currentStreak % 30) + 1; // Cycle through 1-30
    const reward = await getRewardForDay(nextStreakDay);

    if (!reward) {
      return { success: false, message: `Reward for day ${nextStreakDay} is not configured.` };
    }
    
    // Only process credit transactions for now. Other types will be handled in the future.
    if (reward.type === 'credits') {
      const transactionResult = await runTransaction(creditsRef, (currentCredits: UserCreditsData | null) => {
          if (currentCredits) {
              currentCredits.balance = (currentCredits.balance || 0) + reward.value;
          } else {
            // This case should ideally not happen for an existing user
            return { balance: reward.value, freeCreditClaimed: false };
          }
          return currentCredits;
      });

      if (!transactionResult.committed) {
          throw new Error("Failed to commit credit transaction.");
      }
    }
    
    // For other reward types (ebook, tarot_reading), we don't grant a specific item yet,
    // but we still update the user's streak to keep them on the reward track.

    // After successfully handling the reward type, update the profile streak and timestamp.
    await update(profileRef, {
      dailyRewardStreak: currentStreak + 1,
      lastClaimTimestamp: serverTimestamp(),
    });

    return { success: true, message: "Reward claimed!", reward };

  } catch (error: any) {
    console.error("Error claiming daily reward:", error);
    return { success: false, message: error.message || "An error occurred while claiming the reward." };
  }
}

export async function deductCredit(uid: string, amount: number = 1): Promise<{ success: boolean, message: string, newBalance?: number }> {
  const creditsRef = ref(rtdb, `users/${uid}/credits`);
  try {
    const result = await runTransaction(creditsRef, (currentData: UserCreditsData | null) => {
      if (currentData === null || (currentData.balance || 0) < amount) {
        return; 
      }
      currentData.balance = currentData.balance - amount;
      return currentData;
    });

    if (result.committed && result.snapshot.exists()) {
      return { success: true, message: "Credit deducted successfully.", newBalance: result.snapshot.val().balance };
    } else {
      return { success: false, message: "Insufficient credits or failed to deduct." };
    }
  } catch (error: any) {
    console.error("Error deducting credit:", error);
    return { success: false, message: error.message || "An error occurred while deducting credit." };
  }
}

export async function adminAddCredits(uid: string, amount: number): Promise<{ success: boolean, message: string, newBalance?: number }> {
  if (amount <= 0) {
    return { success: false, message: "Credit amount must be positive." };
  }
  const creditsRef = ref(rtdb, `users/${uid}/credits`);
  try {
    const result = await runTransaction(creditsRef, (currentData: UserCreditsData | null) => {
      if (currentData === null) {
        return { balance: amount, freeCreditClaimed: false };
      }
      currentData.balance = (currentData.balance || 0) + amount;
      return currentData;
    });

     if (result.committed && result.snapshot.exists()) {
      return { success: true, message: `${amount} credits added successfully.`, newBalance: result.snapshot.val().balance };
    } else {
      return { success: false, message: "Failed to add credits." };
    }
  } catch (error: any) {
    console.error("Error adding credits (admin):", error);
    return { success: false, message: error.message || "An error occurred while adding credits." };
  }
}
