
'use server'; // Or remove if only client-side.

import { rtdb } from '@/lib/firebase';
import { ref, set, get, update, runTransaction, serverTimestamp } from 'firebase/database';

export interface UserCreditsData {
  balance: number;
  freeCreditClaimed: boolean;
  lastFreeCreditClaimTimestamp?: number | object;
}

const FREE_CREDITS_ON_CLAIM = 1;
const INITIAL_CREDITS = 0; 

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
    // Return a default structure if fetching fails or user has no credits yet
    return { balance: 0, freeCreditClaimed: false };
  }
}

export async function claimFreeCredit(uid: string): Promise<{ success: boolean, message: string, newBalance?: number }> {
  const creditsRef = ref(rtdb, `users/${uid}/credits`);
  try {
    const result = await runTransaction(creditsRef, (currentData: UserCreditsData | null) => {
      if (currentData === null) {
        return { balance: FREE_CREDITS_ON_CLAIM, freeCreditClaimed: true, lastFreeCreditClaimTimestamp: serverTimestamp() };
      }
      if (currentData.freeCreditClaimed) {
        return; 
      }
      currentData.balance = (currentData.balance || 0) + FREE_CREDITS_ON_CLAIM;
      currentData.freeCreditClaimed = true;
      currentData.lastFreeCreditClaimTimestamp = serverTimestamp();
      return currentData;
    });

    if (result.committed && result.snapshot.exists()) {
      return { success: true, message: "Free credit claimed successfully!", newBalance: result.snapshot.val().balance };
    } else if (!result.committed && result.snapshot.val()?.freeCreditClaimed) {
        return { success: false, message: "Free credit already claimed." };
    } else {
      return { success: false, message: "Failed to claim free credit. Credits data might be missing or an error occurred." };
    }
  } catch (error: any) {
    console.error("Error claiming free credit:", error);
    return { success: false, message: error.message || "An error occurred while claiming free credit." };
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

// Admin function to add credits
export async function adminAddCredits(uid: string, amount: number): Promise<{ success: boolean, message: string, newBalance?: number }> {
  if (amount <= 0) {
    return { success: false, message: "Credit amount must be positive." };
  }
  const creditsRef = ref(rtdb, `users/${uid}/credits`);
  try {
    const result = await runTransaction(creditsRef, (currentData: UserCreditsData | null) => {
      if (currentData === null) {
        // If user has no credits node, initialize it
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
