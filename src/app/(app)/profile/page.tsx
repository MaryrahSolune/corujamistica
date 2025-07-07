
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile as updateUserProfileInRtdb, getUserProfile } from '@/services/userService';
import { Loader2, Edit3, UserCircle2, Palette, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { auth } from '@/lib/firebase';
import { IconAvatar, availableIcons, gradientMap } from '@/components/IconAvatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { icons } from 'lucide-react';

export default function ProfilePage() {
  const { userProfile, loading: authLoading, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [displayName, setDisplayName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('UserCircle2');
  const [selectedGradient, setSelectedGradient] = useState('aurora');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);
  
  // Temporary state for the dialog
  const [tempIcon, setTempIcon] = useState(selectedIcon);
  const [tempGradient, setTempGradient] = useState(selectedGradient);

  useEffect(() => {
    const user = auth.currentUser; 
    if (user) {
      setIsFetchingProfile(true);
      getUserProfile(user.uid)
        .then(profile => {
          if (profile) {
            setDisplayName(profile.displayName || user.displayName || '');
            if (profile.avatar) {
              setSelectedIcon(profile.avatar.iconName);
              setSelectedGradient(profile.avatar.gradient);
              setTempIcon(profile.avatar.iconName);
              setTempGradient(profile.avatar.gradient);
            }
          } else {
            setDisplayName(user.displayName || '');
          }
        })
        .catch(error => {
          console.error("Failed to fetch RTDB profile:", error);
          if(user) {
            setDisplayName(user.displayName || '');
          }
          toast({ title: "Error", description: "Could not fetch profile details.", variant: "destructive" });
        })
        .finally(() => setIsFetchingProfile(false));
    } else if (!authLoading) {
        setIsFetchingProfile(false);
    }
  }, [authLoading, toast]);


  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const nameChanged = displayName !== (userProfile?.displayName || '');
    const iconChanged = selectedIcon !== (userProfile?.avatar?.iconName || 'UserCircle2');
    const gradientChanged = selectedGradient !== (userProfile?.avatar?.gradient || 'aurora');

    if (!nameChanged && !iconChanged && !gradientChanged) {
        setIsEditing(false);
        return;
    }

    setIsLoading(true);

    try {
      const rtdbUpdates: { displayName?: string; avatar?: { iconName: string; gradient: string } } = {};

      if (nameChanged) {
        rtdbUpdates.displayName = displayName;
      }
      if (iconChanged || gradientChanged) {
        rtdbUpdates.avatar = { iconName: selectedIcon, gradient: selectedGradient };
      }

      await updateUserProfileInRtdb(user.uid, rtdbUpdates);
      
      refreshUserProfile();
      
      toast({ title: t('profileUpdatedTitle'), description: t('profileUpdatedDescription') });
      setIsEditing(false);
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

  const hasChanges = displayName !== (userProfile?.displayName || '') || 
                     selectedIcon !== (userProfile?.avatar?.iconName || 'UserCircle2') ||
                     selectedGradient !== (userProfile?.avatar?.gradient || 'aurora');
  
  const currentAvatar = userProfile?.avatar;
  const currentPhotoUrl = userProfile?.photoURL;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto animated-aurora-background rounded-xl">
        <Card className="relative z-10 bg-card/90 dark:bg-card/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 relative">
                <Avatar className="h-24 w-24 border-2 border-primary shadow-md">
                    {isEditing ? (
                        <IconAvatar iconName={selectedIcon} gradientName={selectedGradient} className="h-full w-full" />
                    ) : currentAvatar ? (
                        <IconAvatar iconName={currentAvatar.iconName} gradientName={currentAvatar.gradient} className="h-full w-full" />
                    ) : currentPhotoUrl ? (
                        <AvatarImage src={currentPhotoUrl} alt={displayName || 'Usuário'} />
                    ) : (
                        <AvatarFallback className="text-3xl bg-accent text-accent-foreground">
                            {getInitials(displayName, userForDisplay.email)}
                        </AvatarFallback>
                    )}
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
              
              {isEditing && (
                <Dialog open={isIconSelectorOpen} onOpenChange={setIsIconSelectorOpen}>
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline" className="w-full">
                            <Palette className="mr-2 h-4 w-4" /> Alterar Ícone e Cores
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Personalize seu Avatar</DialogTitle>
                            <DialogDescription>
                                Escolha um ícone e um gradiente de cores para seu perfil.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label className="mb-2 block">Gradiente</Label>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(gradientMap).map(([name, gradientClass]) => (
                                    <button
                                        key={name}
                                        type="button"
                                        onClick={() => setTempGradient(name)}
                                        className={cn(
                                            'h-10 w-10 rounded-full border-2 transition-all',
                                            tempGradient === name ? 'border-ring ring-2 ring-ring' : 'border-transparent'
                                        )}
                                    >
                                        <div className={cn('h-full w-full rounded-full bg-gradient-to-br', gradientClass)} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="py-4">
                            <Label className="mb-2 block">Ícone</Label>
                            <ScrollArea className="h-64 border rounded-md p-2">
                                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                                    {availableIcons.map(iconName => {
                                        const LucideIcon = icons[iconName as keyof typeof icons];
                                        return (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => setTempIcon(iconName)}
                                                className={cn(
                                                    'flex items-center justify-center p-2 rounded-md border-2 aspect-square transition-all',
                                                    tempIcon === iconName ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted'
                                                )}
                                            >
                                                <LucideIcon className="h-6 w-6 text-foreground" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="ghost">Cancelar</Button>
                            </DialogClose>
                            <Button type="button" onClick={() => {
                                setSelectedIcon(tempIcon);
                                setSelectedGradient(tempGradient);
                                setIsIconSelectorOpen(false);
                            }}>
                                <Check className="mr-2 h-4 w-4" /> Confirmar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              )}

              {isEditing ? (
                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={isLoading || !hasChanges}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('saveChangesButton')}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsEditing(false);
                    setDisplayName(userProfile?.displayName || '');
                    setSelectedIcon(userProfile?.avatar?.iconName || 'UserCircle2');
                    setSelectedGradient(userProfile?.avatar?.gradient || 'aurora');
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
