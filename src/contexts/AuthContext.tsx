
'use client';

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, rtdb } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { ref, onValue, off } from 'firebase/database';
import type { UserCreditsData } from '@/services/creditService';
import { getUserProfile, type UserProfileData } from '@/services/userService'; // Import
import type { Locale } from './LanguageContext'; // Assuming Locale might be needed if profile has lang pref

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfileData | null; // Added userProfile
  userCredits: UserCreditsData | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshCredits: () => void;
  refreshUserProfile: () => void; // Added
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null); // Added
  const [userCredits, setUserCredits] = useState<UserCreditsData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserData = useCallback(async (uid: string) => {
    // Fetch Profile
    try {
      const profile = await getUserProfile(uid);
      setUserProfile(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
    }

    // Fetch Credits (and setup listener)
    const creditsRef = ref(rtdb, `users/${uid}/credits`);
    const creditsListener = onValue(creditsRef, (snapshot) => {
      const data = snapshot.val();
      setUserCredits(data as UserCreditsData);
    }, (error) => {
      console.error("Error fetching user credits:", error);
      setUserCredits(null);
    });
    return () => off(creditsRef, 'value', creditsListener); // Return cleanup for credits listener
  }, []);


  useEffect(() => {
    setLoading(true);
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      let creditsCleanup: (() => void) | null = null;
      if (user) {
        creditsCleanup = await fetchUserData(user.uid);
      } else {
        setUserProfile(null);
        setUserCredits(null);
      }
      setLoading(false);
      
      // Return a cleanup function that also cleans up credits listener
      return () => {
        if (creditsCleanup) {
          creditsCleanup();
        }
      };
    });

    return () => {
      unsubscribeAuth();
      // The cleanup for credits listener is handled inside unsubscribeAuth's return
    };
  }, [fetchUserData]);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      // router.push('/login'); // Redirect is now handled by AppLayout or AuthGuard based on currentUser
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshCredits = useCallback(() => {
    if (currentUser) {
      const creditsRef = ref(rtdb, `users/${currentUser.uid}/credits`);
       get(creditsRef).then(snapshot => {
         setUserCredits(snapshot.val() as UserCreditsData);
       }).catch(error => console.error("Error refreshing credits manually:", error));
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
    userProfile, // Added
    userCredits,
    loading,
    logout,
    refreshCredits,
    refreshUserProfile, // Added
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
