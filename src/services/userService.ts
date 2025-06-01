
'use server'; // Can be 'use server' if called from Server Actions, or remove if only client-side.
              // For direct RTDB calls from client components, this directive isn't strictly needed here.

import { rtdb } from '@/lib/firebase';
import { ref, set, get, serverTimestamp, update } from 'firebase/database';
import type { User } from 'firebase/auth';

export interface UserProfileData {
  displayName: string | null;
  email: string | null;
  createdAt: number | object; // Using object for serverTimestamp
  photoURL?: string | null;
}

export async function createUserProfile(user: User): Promise<void> {
  const userProfileRef = ref(rtdb, `users/${user.uid}/profile`);
  const profileData: UserProfileData = {
    displayName: user.displayName,
    email: user.email,
    createdAt: serverTimestamp(), // Use server timestamp for consistency
  };
  if (user.photoURL) {
    profileData.photoURL = user.photoURL;
  }
  try {
    await set(userProfileRef, profileData);
  } catch (error) {
    console.error("Error creating user profile in RTDB:", error);
    throw error; // Re-throw to handle it in the calling function
  }
}

export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  const userProfileRef = ref(rtdb, `users/${uid}/profile`);
  try {
    const snapshot = await get(userProfileRef);
    if (snapshot.exists()) {
      return snapshot.val() as UserProfileData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile from RTDB:", error);
    throw error;
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfileData>): Promise<void> {
  const userProfileRef = ref(rtdb, `users/${uid}/profile`);
  try {
    await update(userProfileRef, data);
  } catch (error) {
    console.error("Error updating user profile in RTDB:", error);
    throw error;
  }
}
