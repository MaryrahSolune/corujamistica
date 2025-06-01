
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { updateProfile as updateFirebaseAuthProfile } from 'firebase/auth';
import { updateUserProfile as updateUserProfileInRtdb, getUserProfile, type UserProfileData } from '@/services/userService';
import { Loader2, Edit3, UserCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { auth } from '@/lib/firebase'; // Direct import for auth.currentUser

export default function ProfilePage() {
  const { currentUser: authContextUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [displayName, setDisplayName] = useState('');
  // const [rtdbProfile, setRtdbProfile] = useState<UserProfileData | null>(null); // If needed for more fields
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For profile update operation
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);


  useEffect(() => {
    // Use auth.currentUser directly for initial reliable state if authContextUser might be delayed
    const user = auth.currentUser; 
    if (user) {
      setIsFetchingProfile(true);
      getUserProfile(user.uid)
        .then(profile => {
          if (profile) {
            setDisplayName(profile.displayName || user.displayName || '');
            // setRtdbProfile(profile);
          } else {
             // Fallback to auth display name if RTDB profile doesn't exist yet
            setDisplayName(user.displayName || '');
          }
        })
        .catch(error => {
          console.error("Failed to fetch RTDB profile:", error);
          // Fallback to auth display name on error
          setDisplayName(user.displayName || '');
          toast({ title: "Error", description: "Could not fetch profile details.", variant: "destructive" });
        })
        .finally(() => setIsFetchingProfile(false));
    } else if (!authLoading) { // If auth is not loading and no user, stop fetching
        setIsFetchingProfile(false);
    }
  }, [authLoading, toast]);


  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser; // Use direct auth.currentUser
    if (!user) return;

    setIsLoading(true);
    let authProfileUpdated = false;
    let rtdbProfileUpdated = false;

    try {
      // Update Firebase Auth profile if display name changed
      if (displayName !== user.displayName) {
        await updateFirebaseAuthProfile(user, { displayName });
        authProfileUpdated = true;
      }
      
      // Update RTDB profile
      await updateUserProfileInRtdb(user.uid, { displayName });
      rtdbProfileUpdated = true;
      
      toast({ title: t('profileUpdatedTitle'), description: t('profileUpdatedDescription') });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Profile update error:', error);
      let message = t('updateFailedDescription');
      if (authProfileUpdated && !rtdbProfileUpdated) {
        message = "Auth profile updated, but failed to save to database. Please try again."
      } else if (!authProfileUpdated && rtdbProfileUpdated) {
        // This case is less likely if RTDB update depends on auth name for consistency
        message = "Database updated, but failed to save to authentication system. Please try again."
      }
      toast({
        title: t('updateFailedTitle'),
        description: error.message || message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getInitials = (name?: string | null, mail?: string | null) => {
    if (name && name.trim()) return name.substring(0, 2).toUpperCase();
    if (mail) return mail.substring(0, 2).toUpperCase();
    return 'MI'; // Mystic Insights initials
  };

  if (authLoading || isFetchingProfile) {
    return (
      <div className="container mx-auto p-8 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const userForDisplay = auth.currentUser; // Use direct auth.currentUser for display

  if (!userForDisplay) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p>{t('pleaseLoginToViewProfile')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto animated-aurora-background rounded-xl">
        <Card className="relative z-10 bg-card/90 dark:bg-card/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="h-24 w-24 border-2 border-primary shadow-md">
                <AvatarImage src={userForDisplay.photoURL || undefined} alt={displayName || 'Usuário'} />
                <AvatarFallback className="text-3xl bg-accent text-accent-foreground">
                  {getInitials(displayName, userForDisplay.email)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-3xl font-serif flex items-center justify-center">
               <UserCircle2 className="h-8 w-8 mr-3 text-primary" />
              {t('yourProfileTitle')}
            </CardTitle>
            <CardDescription>{t('yourProfileDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">{t('displayNameLabel')}</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={!isEditing || isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('emailAddressLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={userForDisplay.email || ''}
                  disabled 
                  readOnly
                />
                <p className="text-xs text-muted-foreground">{t('emailChangeNotice')}</p>
              </div>
              
              {isEditing ? (
                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={isLoading || !displayName.trim()}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('saveChangesButton')}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    // Reset displayName to current auth user's display name or fetched profile name
                    setDisplayName(userForDisplay.displayName || ''); 
                  }} className="flex-1" disabled={isLoading}>
                    {t('cancelButton')}
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="w-full" variant="outline">
                  <Edit3 className="mr-2 h-4 w-4" /> {t('editProfileButton')}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
