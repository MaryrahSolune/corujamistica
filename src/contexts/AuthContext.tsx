
'use client';

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, rtdb } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { ref, onValue, off, get } from 'firebase/database'; // Added get
import type { UserCreditsData } from '@/services/creditService';
import { getUserProfile, type UserProfileData } from '@/services/userService';

// Flag to enable/disable login requirement
const AUTH_ENABLED = false;

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfileData | null;
  userCredits: UserCreditsData | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshCredits: () => void;
  refreshUserProfile: () => void;
}

// Create a mock user for testing when auth is disabled
const mockUser: User = {
  uid: 'test-user-123',
  email: 'mestra@corujamistica.com',
  displayName: 'Mestra',
  photoURL: null,
  emailVerified: true,
  isAnonymous: true,
  tenantId: null,
  providerData: [],
  metadata: {},
  providerId: 'password',
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({ token: 'mock-token', claims: {}, authTime: '', issuedAtTime: '', signInProvider: null, signInSecondFactor: null, expirationTime: '' }),
  reload: async () => {},
  toJSON: () => ({}),
};

const mockUserProfile: UserProfileData = {
    uid: 'test-user-123',
    displayName: 'Mestra',
    email: 'mestra@corujamistica.com',
    createdAt: Date.now(),
    role: 'admin', // Give admin role for full access
    dailyRewardStreak: 10,
    lastClaimTimestamp: null,
};

const mockUserCredits: UserCreditsData = {
    balance: 999, // Ample credits for testing
    freeCreditClaimed: true,
};


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
    if (AUTH_ENABLED) {
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
          
          return () => {
            if (creditsCleanup) {
              creditsCleanup();
            }
          };
        });

        return () => {
          unsubscribeAuth();
        };
    } else {
        // Use mock data if auth is disabled
        setCurrentUser(mockUser);
        setUserProfile(mockUserProfile);
        setUserCredits(mockUserCredits);
        setLoading(false);
    }
  }, [fetchUserData]);

  const logout = async () => {
    if (AUTH_ENABLED) {
        try {
          await firebaseSignOut(auth);
          setUserProfile(null); 
          setUserCredits(null); 
          router.push('/login');
        } catch (error) {
          console.error('Error signing out:', error);
        }
    } else {
        // In mocked auth, logout just goes to login page
        router.push('/login');
    }
  };

  const refreshCredits = useCallback(async () => {
     if (AUTH_ENABLED && currentUser) {
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
    if (AUTH_ENABLED && currentUser) {
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
