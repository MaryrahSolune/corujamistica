
'use client';

import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { updateProfile as updateFirebaseAuthProfile } from 'firebase/auth';
import { updateUserProfile as updateUserProfileInRtdb, getUserProfile } from '@/services/userService';
import { Loader2, Edit3, UserCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { auth } from '@/lib/firebase';

export default function ProfilePage() {
  const { currentUser: authContextUser, loading: authLoading, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [displayName, setDisplayName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  useEffect(() => {
    const user = auth.currentUser; 
    if (user) {
      setIsFetchingProfile(true);
      getUserProfile(user.uid)
        .then(profile => {
          if (profile) {
            setDisplayName(profile.displayName || user.displayName || '');
            setImagePreview(profile.photoURL || user.photoURL || null);
          } else {
            setDisplayName(user.displayName || '');
            setImagePreview(user.photoURL || null);
          }
        })
        .catch(error => {
          console.error("Failed to fetch RTDB profile:", error);
          setDisplayName(user.displayName || '');
          setImagePreview(user.photoURL || null);
          toast({ title: "Error", description: "Could not fetch profile details.", variant: "destructive" });
        })
        .finally(() => setIsFetchingProfile(false));
    } else if (!authLoading) {
        setIsFetchingProfile(false);
    }
  }, [authLoading, toast]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: t('imageTooLargeTitle'),
          description: t('imageTooLargeDescription'),
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const nameChanged = displayName !== (user.displayName || '');
    const photoChanged = !!imageDataUri;

    if (!nameChanged && !photoChanged) {
        setIsEditing(false);
        return;
    }

    setIsLoading(true);

    try {
      const authUpdates: { displayName?: string; photoURL?: string } = {};
      const rtdbUpdates: { displayName?: string; photoURL?: string } = {};

      if (nameChanged) {
        authUpdates.displayName = displayName;
        rtdbUpdates.displayName = displayName;
      }
      if (photoChanged) {
        authUpdates.photoURL = imageDataUri;
        rtdbUpdates.photoURL = imageDataUri;
      }

      if (Object.keys(authUpdates).length > 0) {
        await updateFirebaseAuthProfile(user, authUpdates);
      }
      if (Object.keys(rtdbUpdates).length > 0) {
        await updateUserProfileInRtdb(user.uid, rtdbUpdates);
      }
      
      refreshUserProfile();
      
      toast({ title: t('profileUpdatedTitle'), description: t('profileUpdatedDescription') });
      setIsEditing(false);
      setImageDataUri(null);
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: t('updateFailedTitle'),
        description: error.message || t('updateFailedDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getInitials = (name?: string | null, mail?: string | null) => {
    if (name && name.trim()) return name.substring(0, 2).toUpperCase();
    if (mail) return mail.substring(0, 2).toUpperCase();
    return 'MI';
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  if (authLoading || isFetchingProfile) {
    return (
      <div className="container mx-auto p-8 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const userForDisplay = auth.currentUser;

  if (!userForDisplay) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p>{t('pleaseLoginToViewProfile')}</p>
      </div>
    );
  }

  const hasChanges = displayName !== (userForDisplay.displayName || '') || !!imageDataUri;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto animated-aurora-background rounded-xl">
        <Card className="relative z-10 bg-card/90 dark:bg-card/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 relative">
                <Avatar className="h-24 w-24 border-2 border-primary shadow-md">
                    <AvatarImage src={imagePreview || undefined} alt={displayName || 'Usuário'} />
                    <AvatarFallback className="text-3xl bg-accent text-accent-foreground">
                    {getInitials(displayName, userForDisplay.email)}
                    </AvatarFallback>
                </Avatar>
                {isEditing && (
                    <button
                        type="button"
                        onClick={triggerFileInput}
                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer group"
                        aria-label={t('changeProfilePictureLabel')}
                    >
                        <Edit3 className="h-8 w-8 text-white transition-transform group-hover:scale-110" />
                    </button>
                )}
            </div>
            <CardTitle className="text-3xl font-serif flex items-center justify-center">
               <UserCircle2 className="h-8 w-8 mr-3 text-primary" />
              {t('yourProfileTitle')}
            </CardTitle>
            <CardDescription>{t('yourProfileDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <Input
                  id="photo-upload"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
              />
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
                  <Button type="submit" className="flex-1" disabled={isLoading || !hasChanges}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('saveChangesButton')}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsEditing(false);
                    setDisplayName(userForDisplay.displayName || ''); 
                    setImagePreview(userForDisplay.photoURL || null);
                    setImageDataUri(null);
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
