
'use client';

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, rtdb } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { ref, onValue, off, get } from 'firebase/database'; // Added get
import type { UserCreditsData } from '@/services/creditService';
import { getUserProfile, type UserProfileData } from '@/services/userService';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfileData | null;
  userCredits: UserCreditsData | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshCredits: () => void;
  refreshUserProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [userCredits, setUserCredits] = useState<UserCreditsData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserData = useCallback(async (uid: string) => {
    let profileData: UserProfileData | null = null;
    try {
      profileData = await getUserProfile(uid);
      setUserProfile(profileData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
    }

    const creditsRef = ref(rtdb, `users/${uid}/credits`);
    const creditsListener = onValue(creditsRef, (snapshot) => {
      setUserCredits(snapshot.val() as UserCreditsData);
    }, (error) => {
      console.error("Error fetching user credits:", error);
      setUserCredits(null);
    });
    return () => off(creditsRef, 'value', creditsListener);
  }, []);


  useEffect(() => {
    setLoading(true);
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      let creditsCleanup: (() => void) | null = null;
      if (user) {
        creditsCleanup = await fetchUserData(user.uid);
      } else {
        setUserProfile(null); // Explicitly clear profile on logout
        setUserCredits(null); // Explicitly clear credits on logout
      }
      setLoading(false);
      
      return () => {
        if (creditsCleanup) {
          creditsCleanup();
        }
      };
    });

    return () => {
      unsubscribeAuth();
    };
  }, [fetchUserData]);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUserProfile(null); // Clear profile immediately on logout action
      setUserCredits(null); // Clear credits immediately on logout action
      // router.push('/login'); // Handled by AuthGuard or layout effects
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshCredits = useCallback(async () => {
    if (currentUser) {
      const creditsRef = ref(rtdb, `users/${currentUser.uid}/credits`);
       try {
          const snapshot = await get(creditsRef);
          setUserCredits(snapshot.val() as UserCreditsData);
       } catch (error) {
          console.error("Error refreshing credits manually:", error);
       }
    }
  }, [currentUser]);

  const refreshUserProfile = useCallback(async () => {
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error("Error refreshing user profile:", error);
      }
    }
  }, [currentUser]);
  
  const value = {
    currentUser,
    userProfile,
    userCredits,
    loading,
    logout,
    refreshCredits,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
