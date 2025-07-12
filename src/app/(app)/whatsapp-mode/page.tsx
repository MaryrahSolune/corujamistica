// src/app/(app)/whatsapp-mode/page.tsx
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Zap, MessageCircle, Settings, Save } from 'lucide-react';
import { updateUserWhatsappPreferences, type UserWhatsappPreferences } from '@/services/userService';

export default function WhatsappModePage() {
  const { userProfile, refreshUserProfile, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [isEnabled, setIsEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile?.whatsapp) {
      setIsEnabled(userProfile.whatsapp.isEnabled || false);
      setPhoneNumber(userProfile.whatsapp.phoneNumber || '');
      setFrequency(userProfile.whatsapp.frequency || 'daily');
    }
  }, [userProfile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    // Basic validation for phone number
    if (isEnabled && (!phoneNumber || phoneNumber.length < 10)) {
        toast({
            title: t('errorGenericTitle'),
            description: t('whatsappInvalidPhoneNumber'),
            variant: 'destructive',
        });
        return;
    }

    setIsSaving(true);
    try {
      const preferences: UserWhatsappPreferences = {
        isEnabled,
        phoneNumber,
        frequency,
      };
      await updateUserWhatsappPreferences(userProfile.uid, preferences);
      await refreshUserProfile(); // Refresh context to get the latest data
      toast({
        title: t('whatsappSettingsSavedTitle'),
        description: t('whatsappSettingsSavedDescription'),
      });
    } catch (error: any) {
      console.error('Failed to save WhatsApp preferences:', error);
      toast({
        title: t('errorGenericTitle'),
        description: error.message || t('genericErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = isEnabled !== (userProfile?.whatsapp?.isEnabled ?? false) ||
                     phoneNumber !== (userProfile?.whatsapp?.phoneNumber ?? '') ||
                     frequency !== (userProfile?.whatsapp?.frequency ?? 'daily');

  if (authLoading) {
    return (
        <div className="container mx-auto p-8 flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto animated-aurora-background rounded-xl">
        <Card className="relative z-10 bg-card/90 dark:bg-card/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-serif flex items-center">
              <MessageCircle className="h-8 w-8 mr-3 text-primary" />
              {t('whatsappModeTitle')}
            </CardTitle>
            <CardDescription>{t('whatsappModeDescription')}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-8">
              <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-muted/50">
                <Label htmlFor="whatsapp-enable" className="flex flex-col space-y-1">
                  <span className="font-semibold text-lg">{t('whatsappEnableLabel')}</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    {t('whatsappEnableDescription')}
                  </span>
                </Label>
                <Switch
                  id="whatsapp-enable"
                  checked={isEnabled}
                  onCheckedChange={setIsEnabled}
                  aria-label="Ativar Modo WhatsApp"
                />
              </div>

              {isEnabled && (
                <div className="space-y-6 animate-fade-in">
                    <div className="space-y-2">
                        <Label htmlFor="phone-number" className="text-lg">{t('whatsappPhoneNumberLabel')}</Label>
                        <p className="text-sm text-muted-foreground">{t('whatsappPhoneNumberDescription')}</p>
                        <Input
                            id="phone-number"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+55 (XX) XXXXX-XXXX"
                            disabled={isSaving}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="frequency" className="text-lg">{t('whatsappFrequencyLabel')}</Label>
                        <p className="text-sm text-muted-foreground">{t('whatsappFrequencyDescription')}</p>
                        <Select value={frequency} onValueChange={setFrequency} disabled={isSaving}>
                            <SelectTrigger id="frequency">
                                <SelectValue placeholder="Selecione a frequência" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3h">{t('whatsappFrequency3h')}</SelectItem>
                                <SelectItem value="6h">{t('whatsappFrequency6h')}</SelectItem>
                                <SelectItem value="9h">{t('whatsappFrequency9h')}</SelectItem>
                                <SelectItem value="daily">{t('whatsappFrequencyDaily')}</SelectItem>
                                <SelectItem value="weekly">{t('whatsappFrequencyWeekly')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Card className="bg-primary/10 border-primary/30">
                        <CardHeader>
                            <CardTitle className="text-primary flex items-center"><Zap className="h-5 w-5 mr-2"/>{t('whatsappCreditUsageTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{t('whatsappCreditUsageDescription')}</p>
                        </CardContent>
                    </Card>
                </div>
              )}

              <Button type="submit" className="w-full text-lg py-6" disabled={isSaving || !hasChanges}>
                  {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                  {isSaving ? t('savingButton') : t('saveChangesButton')}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
