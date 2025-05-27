
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';
import { Loader2, Edit3, UserCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProfilePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
    }
  }, [currentUser]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsLoading(true);

    try {
      if (displayName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName });
      }
      
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
    if (name) return name.substring(0, 2).toUpperCase();
    if (mail) return mail.substring(0, 2).toUpperCase();
    return 'MI'; // Mystic Insights initials
  };

  if (authLoading) {
    return (
      <div className="container mx-auto p-8 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
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
                <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || 'Usuário'} />
                <AvatarFallback className="text-3xl bg-accent text-accent-foreground">
                  {getInitials(currentUser.displayName, currentUser.email)}
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
                  value={currentUser.email || ''}
                  disabled 
                  readOnly
                />
                <p className="text-xs text-muted-foreground">{t('emailChangeNotice')}</p>
              </div>
              
              {isEditing ? (
                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('saveChangesButton')}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setDisplayName(currentUser.displayName || ''); 
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
