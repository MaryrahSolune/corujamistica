
import { rtdb } from '@/lib/firebase';
import { ref, set, get, serverTimestamp, update, remove, runTransaction } from 'firebase/database';
import type { User } from 'firebase/auth';

export interface UserProfileData {
  uid: string;
  displayName: string | null;
  email: string | null;
  createdAt: number | object;
  photoURL?: string | null;
  role: 'user' | 'admin';
  dailyRewardStreak: number; // User's current position in the 30-day cycle
  lastClaimTimestamp: number | null; // Timestamp of the last claim, for the 24h cooldown
}

export async function createUserProfile(user: User): Promise<void> {
  const userProfileRef = ref(rtdb, `users/${user.uid}/profile`);
  
  // Increment total user count in a transaction
  const userCountRef = ref(rtdb, 'metadata/userCount');
  runTransaction(userCountRef, (currentCount) => {
    return (currentCount || 0) + 1;
  });

  const snapshot = await get(userProfileRef);
  if (snapshot.exists()) {
    // Profile exists, update specific fields but preserve role and reward progress
    const existingProfile = snapshot.val() as UserProfileData;
    const updates: Partial<UserProfileData> = {
        displayName: user.displayName || existingProfile.displayName,
        email: user.email || existingProfile.email,
        photoURL: user.photoURL || existingProfile.photoURL,
    };
    if (existingProfile.dailyRewardStreak === undefined) {
      updates.dailyRewardStreak = 0;
    }
    if (existingProfile.lastClaimTimestamp === undefined) {
      updates.lastClaimTimestamp = null;
    }
    await update(userProfileRef, updates);
    return;
  }

  // Create new profile
  const profileData: UserProfileData = {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    createdAt: serverTimestamp(),
    role: 'user', // Default role is 'user'
    dailyRewardStreak: 0,
    lastClaimTimestamp: null,
  };
  if (user.photoURL) {
    profileData.photoURL = user.photoURL;
  }
  try {
    await set(userProfileRef, profileData);
  } catch (error) {
    console.error("Error creating user profile in RTDB:", error);
    throw error;
  }
}

export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  const userProfileRef = ref(rtdb, `users/${uid}/profile`);
  try {
    const snapshot = await get(userProfileRef);
    if (snapshot.exists()) {
      return { uid, ...snapshot.val() } as UserProfileData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile from RTDB:", error);
    throw error;
  }
}

export async function updateUserProfile(uid: string, data: Partial<Omit<UserProfileData, 'uid' | 'email' | 'createdAt'>>): Promise<void> {
  const userProfileRef = ref(rtdb, `users/${uid}/profile`);
  try {
    const updates = { ...data };
    if (data.role && !['user', 'admin'].includes(data.role)) {
        delete updates.role;
    }
    await update(userProfileRef, updates);
  } catch (error) {
    console.error("Error updating user profile in RTDB:", error);
    throw error;
  }
}

// Admin function to get all user profiles
export async function getAllUserProfiles(): Promise<Array<UserProfileData>> {
  const usersRef = ref(rtdb, 'users');
  try {
    const snapshot = await get(usersRef);
    const profiles: UserProfileData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const profileData = childSnapshot.child('profile').val();
        if (profileData) {
          profiles.push({ uid: childSnapshot.key!, ...profileData } as UserProfileData);
        }
      });
    }
    return profiles;
  } catch (error) {
    console.error("Error fetching all user profiles:", error);
    throw error;
  }
}

// Admin function to delete a user's RTDB data
export async function deleteUserRtdbData(uid: string): Promise<void> {
  const userRef = ref(rtdb, `users/${uid}`);
  try {
    await remove(userRef);
  } catch (error) {
    console.error("Error deleting user RTDB data:", error);
    throw error;
  }
}
