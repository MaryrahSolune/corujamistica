
import { rtdb } from '@/lib/firebase';
import { ref, set, get, update, runTransaction, serverTimestamp } from 'firebase/database';

export interface UserCreditsData {
  balance: number;
  freeCreditClaimed: boolean;
  lastFreeCreditClaimTimestamp?: number | object | null; // For the initial one-time claim
  lastDailyGiftClaimTimestamp?: number | object | null; // New for daily gift
}

const FREE_CREDITS_ON_CLAIM = 1;
const INITIAL_CREDITS = 0;
const DAILY_GIFT_AMOUNT = 1;
const GIFT_COOLDOWN_MILLISECONDS = 24 * 60 * 60 * 1000; // 24 hours

export async function initializeUserCredits(uid: string): Promise<void> {
  const creditsRef = ref(rtdb, `users/${uid}/credits`);
  const initialData: UserCreditsData = {
    balance: INITIAL_CREDITS,
    freeCreditClaimed: false,
    lastDailyGiftClaimTimestamp: null, // Initialize as null or 0
  };
  try {
    const snapshot = await get(creditsRef);
    if (!snapshot.exists()) {
      await set(creditsRef, initialData);
    } else {
      // If credits node exists but lastDailyGiftClaimTimestamp doesn't, add it.
      const currentData = snapshot.val() as UserCreditsData;
      if (currentData.lastDailyGiftClaimTimestamp === undefined) {
        await update(creditsRef, { lastDailyGiftClaimTimestamp: null });
      }
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
    return { balance: 0, freeCreditClaimed: false, lastDailyGiftClaimTimestamp: null };
  }
}

export async function claimFreeCredit(uid: string): Promise<{ success: boolean, message: string, newBalance?: number }> {
  const creditsRef = ref(rtdb, `users/${uid}/credits`);
  try {
    const result = await runTransaction(creditsRef, (currentData: UserCreditsData | null) => {
      if (currentData === null) {
        return { balance: FREE_CREDITS_ON_CLAIM, freeCreditClaimed: true, lastFreeCreditClaimTimestamp: serverTimestamp(), lastDailyGiftClaimTimestamp: currentData?.lastDailyGiftClaimTimestamp === undefined ? null : currentData.lastDailyGiftClaimTimestamp };
      }
      if (currentData.freeCreditClaimed) {
        return;
      }
      currentData.balance = (currentData.balance || 0) + FREE_CREDITS_ON_CLAIM;
      currentData.freeCreditClaimed = true;
      currentData.lastFreeCreditClaimTimestamp = serverTimestamp();
      if (currentData.lastDailyGiftClaimTimestamp === undefined) {
        currentData.lastDailyGiftClaimTimestamp = null;
      }
      return currentData;
    });

    if (result.committed && result.snapshot.exists()) {
      return { success: true, message: "Free credit claimed successfully!", newBalance: result.snapshot.val().balance };
    } else if (!result.committed && result.snapshot?.val()?.freeCreditClaimed) {
        return { success: false, message: "Free credit already claimed." };
    } else {
      return { success: false, message: "Failed to claim free credit. Credits data might be missing or an error occurred." };
    }
  } catch (error: any) {
    console.error("Error claiming free credit:", error);
    return { success: false, message: error.message || "An error occurred while claiming free credit." };
  }
}

export async function claimDailyGift(uid: string): Promise<{ success: boolean, message: string, newBalance?: number, cooldownEndTime?: number }> {
  const creditsRef = ref(rtdb, `users/${uid}/credits`);
  try {
    const result = await runTransaction(creditsRef, (currentData: UserCreditsData | null) => {
      if (currentData === null) {
        // Should not happen if initializeUserCredits was called, but as a fallback:
        return { 
          balance: DAILY_GIFT_AMOUNT, 
          freeCreditClaimed: currentData?.freeCreditClaimed || false, // Preserve if exists
          lastDailyGiftClaimTimestamp: serverTimestamp(),
          lastFreeCreditClaimTimestamp: currentData?.lastFreeCreditClaimTimestamp === undefined ? null : currentData.lastFreeCreditClaimTimestamp
        };
      }

      const now = Date.now();
      const lastClaim = currentData.lastDailyGiftClaimTimestamp ? Number(currentData.lastDailyGiftClaimTimestamp) : 0;
      
      if (lastClaim && (now - lastClaim < GIFT_COOLDOWN_MILLISECONDS)) {
        // Abort transaction: still in cooldown
        return; 
      }

      currentData.balance = (currentData.balance || 0) + DAILY_GIFT_AMOUNT;
      currentData.lastDailyGiftClaimTimestamp = serverTimestamp();
      if (currentData.freeCreditClaimed === undefined) currentData.freeCreditClaimed = false;
      if (currentData.lastFreeCreditClaimTimestamp === undefined) currentData.lastFreeCreditClaimTimestamp = null;

      return currentData;
    });

    if (result.committed && result.snapshot.exists()) {
      return { success: true, message: "Daily gift claimed successfully!", newBalance: result.snapshot.val().balance };
    } else {
      // Transaction aborted, likely due to cooldown
      const currentSnapshot = await get(creditsRef);
      const lastClaimTime = currentSnapshot.val()?.lastDailyGiftClaimTimestamp;
      const cooldownEndTime = lastClaimTime ? Number(lastClaimTime) + GIFT_COOLDOWN_MILLISECONDS : Date.now() + GIFT_COOLDOWN_MILLISECONDS;
      return { success: false, message: "Daily gift is still on cooldown.", cooldownEndTime };
    }
  } catch (error: any) {
    console.error("Error claiming daily gift:", error);
    return { success: false, message: error.message || "An error occurred while claiming daily gift." };
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
        return { balance: amount, freeCreditClaimed: false, lastDailyGiftClaimTimestamp: null };
      }
      currentData.balance = (currentData.balance || 0) + amount;
      if (currentData.lastDailyGiftClaimTimestamp === undefined) {
        currentData.lastDailyGiftClaimTimestamp = null;
      }
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
