
'use client';

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, rtdb } from '@/lib/firebase'; // Import rtdb
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation'; // Using next/navigation for App Router
import { ref, onValue, off } from 'firebase/database'; // Import RTDB functions
import type { UserCreditsData } from '@/services/creditService'; // Assuming this type will be defined

interface AuthContextType {
  currentUser: User | null;
  userCredits: UserCreditsData | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshCredits: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userCredits, setUserCredits] = useState<UserCreditsData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserCredits = useCallback((uid: string) => {
    const creditsRef = ref(rtdb, `users/${uid}/credits`);
    onValue(creditsRef, (snapshot) => {
      const data = snapshot.val();
      setUserCredits(data as UserCreditsData);
    }, (error) => {
      console.error("Error fetching user credits:", error);
      setUserCredits(null); // Reset or handle error appropriately
    });
    return () => off(creditsRef); // Cleanup listener
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const unsubscribeCredits = fetchUserCredits(user.uid);
        // Store unsubscribe function for cleanup
        (unsubscribeAuth as any).cleanupCredits = unsubscribeCredits;
      } else {
        setUserCredits(null); // Clear credits if no user
        if ((unsubscribeAuth as any).cleanupCredits) {
          (unsubscribeAuth as any).cleanupCredits(); // Cleanup previous listener if user logs out
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if ((unsubscribeAuth as any).cleanupCredits) {
        (unsubscribeAuth as any).cleanupCredits(); // Ensure cleanup on component unmount
      }
    };
  }, [fetchUserCredits]);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/login'); // Redirect to login after logout
    } catch (error) {
      console.error('Error signing out:', error);
      // Optionally, show a toast notification for logout error
    }
  };

  const refreshCredits = useCallback(() => {
    if (currentUser) {
      fetchUserCredits(currentUser.uid);
    }
  }, [currentUser, fetchUserCredits]);
  
  const value = {
    currentUser,
    userCredits,
    loading,
    logout,
    refreshCredits,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
