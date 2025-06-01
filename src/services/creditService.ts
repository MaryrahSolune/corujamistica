
'use server'; // Or remove if only client-side.

import { rtdb } from '@/lib/firebase';
import { ref, set, get, update, runTransaction, serverTimestamp } from 'firebase/database';

export interface UserCreditsData {
  balance: number;
  freeCreditClaimed: boolean;
  lastFreeCreditClaimTimestamp?: number | object;
  // lastClaimedIpHash?: string; // For more robust IP checking with backend
}

const FREE_CREDITS_ON_CLAIM = 1;
const INITIAL_CREDITS = 0; // Or 1 if they get one free credit upon signup automatically without explicit claim

// Initialize credits when a user profile is first created
export async function initializeUserCredits(uid: string): Promise<void> {
  const creditsRef = ref(rtdb, `users/${uid}/credits`);
  const initialData: UserCreditsData = {
    balance: INITIAL_CREDITS, // Set to 1 if one free credit is given automatically on signup
    freeCreditClaimed: false, // Set to true if one free credit is given automatically
  };
  try {
    // Check if credits node already exists to avoid overwriting
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
    // If no credits node, initialize it (could happen for older users if this logic is new)
    await initializeUserCredits(uid);
    const newSnapshot = await get(creditsRef);
    return newSnapshot.val() as UserCreditsData
  } catch (error) {
    console.error("Error fetching user credits from RTDB:", error);
    throw error;
  }
}

// Simplified claimFreeCredit - IP check is complex for client-only
export async function claimFreeCredit(uid: string): Promise<{ success: boolean, message: string, newBalance?: number }> {
  const creditsRef = ref(rtdb, `users/${uid}/credits`);
  // In a real app, also check ipFreeCreditClaims/{hashedIp} via a Cloud Function BEFORE this transaction.

  try {
    const result = await runTransaction(creditsRef, (currentData: UserCreditsData | null) => {
      if (currentData === null) {
        // Initialize if somehow not present
        return { balance: FREE_CREDITS_ON_CLAIM, freeCreditClaimed: true, lastFreeCreditClaimTimestamp: serverTimestamp() };
      }
      if (currentData.freeCreditClaimed) {
        return; // Abort transaction - already claimed
      }
      currentData.balance = (currentData.balance || 0) + FREE_CREDITS_ON_CLAIM;
      currentData.freeCreditClaimed = true;
      currentData.lastFreeCreditClaimTimestamp = serverTimestamp();
      return currentData;
    });

    if (result.committed && result.snapshot.exists()) {
      // TODO: If IP check was part of this, also write to ipFreeCreditClaims/{hashedIp} via a Cloud Function.
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
  // IMPORTANT: This operation MUST ideally be done via a Cloud Function
  // to prevent client-side manipulation of credit balance.
  // The Cloud Function would verify the user's action legitimacy before deducting.
  try {
    const result = await runTransaction(creditsRef, (currentData: UserCreditsData | null) => {
      if (currentData === null || (currentData.balance || 0) < amount) {
        return; // Abort transaction - insufficient credits or no data
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

// Function to add credits (e.g., after a purchase)
// IMPORTANT: This should ONLY be callable by a trusted server process / Cloud Function after payment verification.
export async function addCredits(uid: string, amount: number): Promise<void> {
  const creditsRef = ref(rtdb, `users/${uid}/credits`);
  try {
    await runTransaction(creditsRef, (currentData: UserCreditsData | null) => {
      if (currentData === null) {
        return { balance: amount, freeCreditClaimed: false }; // Initialize if not present
      }
      currentData.balance = (currentData.balance || 0) + amount;
      return currentData;
    });
  } catch (error) {
    console.error("Error adding credits:", error);
    throw error;
  }
}
