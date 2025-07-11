
'use client';

import { useEffect, useState, type ChangeEvent, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllUserProfiles, deleteUserRtdbData, type UserProfileData } from '@/services/userService';
import { adminAddCredits, getUserCredits, type UserCreditsData } from '@/services/creditService';
import { getRewardCycle, setRewardForDay, type DailyReward } from '@/services/rewardService';
import { getDreamDictionaryEntry, updateDreamDictionaryEntry } from '@/services/dreamDictionaryService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, UserPlus, Trash2, Coins, Edit, MessageSquareQuote, Gift, BookHeart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserWithCredits extends UserProfileData {
  credits?: UserCreditsData | null;
}

const mysticalIconNames = [
  'Gem', 'Sparkles', 'Moon', 'Sun', 'Star',
  'Crown', 'Feather', 'Key', 'Scroll', 'Eye',
  'BrainCircuit', 'Shield', 'Pyramid', 'Infinity', 'Hexagon',
  'Flower', 'Flame', 'Leaf', 'Cat', 'Bird',
  'Bot', 'Cloud', 'Dna', 'Fish', 'Ghost',
  'Grape', 'Zap', 'Pentagon', 'Rainbow', 'Heart'
];

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

export default function AdminDashboardPage() {
  const { userProfile: adminProfile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserWithCredits[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [selectedUserForCredits, setSelectedUserForCredits] = useState<UserWithCredits | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState<number>(0);
  const [isAddingCredits, setIsAddingCredits] = useState(false);

  const [cardReadingPrompt, setCardReadingPrompt] = useState('');
  const [dreamInterpretationPrompt, setDreamInterpretationPrompt] = useState('');
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [isSavingCardPrompt, setIsSavingCardPrompt] = useState(false);
  const [isSavingDreamPrompt, setIsSavingDreamPrompt] = useState(false);
  
  const [rewardCycle, setRewardCycle] = useState<DailyReward[]>([]);
  const [isLoadingRewards, setIsLoadingRewards] = useState(true);
  const [editingReward, setEditingReward] = useState<DailyReward | null>(null);
  const [isSavingReward, setIsSavingReward] = useState(false);

  const [selectedDictionaryLetter, setSelectedDictionaryLetter] = useState('A');
  const [dictionaryContent, setDictionaryContent] = useState('');
  const [isLoadingDictionary, setIsLoadingDictionary] = useState(false);
  const [isSavingDictionary, setIsSavingDictionary] = useState(false);

  const fetchUsersAndCredits = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const profiles = await getAllUserProfiles();
      const usersWithCreditsPromises = profiles.map(async (profile) => {
        const credits = await getUserCredits(profile.uid);
        return { ...profile, credits };
      });
      const usersWithCreditsData = await Promise.all(usersWithCreditsPromises);
      setUsers(usersWithCreditsData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ title: t('errorGenericTitle'), description: String(error) || t('genericErrorDescription'), variant: 'destructive' });
    } finally {
      setIsLoadingUsers(false);
    }
  }, [t, toast]);

  const fetchRewardCycle = useCallback(async () => {
    setIsLoadingRewards(true);
    try {
      const cycle = await getRewardCycle();
      setRewardCycle(cycle);
    } catch (error) {
      console.error("Error fetching reward cycle:", error);
      toast({ title: t('errorGenericTitle'), description: String(error) || t('genericErrorDescription'), variant: 'destructive' });
    } finally {
      setIsLoadingRewards(false);
    }
  }, [t, toast]);

  const fetchDictionaryEntry = useCallback(async (letter: string) => {
    setIsLoadingDictionary(true);
    try {
      let content = await getDreamDictionaryEntry(letter);
      setDictionaryContent(content);
    } catch (error) {
      toast({ title: t('errorGenericTitle'), description: t('dictionaryFetchError'), variant: 'destructive' });
    } finally {
      setIsLoadingDictionary(false);
    }
  }, [t, toast]);

  useEffect(() => {
    if (adminProfile?.role === 'admin') {
      fetchUsersAndCredits();
      fetchRewardCycle();
    }
  }, [adminProfile, fetchUsersAndCredits, fetchRewardCycle]);

  useEffect(() => {
    if (adminProfile?.role === 'admin') {
      fetchDictionaryEntry(selectedDictionaryLetter);
    }
  }, [adminProfile, fetchDictionaryEntry, selectedDictionaryLetter]);


  const handleAddCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForCredits || creditsToAdd <= 0) {
      toast({ title: t('errorGenericTitle'), description: "Invalid user or credit amount.", variant: 'destructive' });
      return;
    }
    setIsAddingCredits(true);
    try {
      const result = await adminAddCredits(selectedUserForCredits.uid, creditsToAdd);
      if (result.success) {
        toast({ title: t('mysticInsights'), description: t('addCreditsSuccessToast', { count: String(creditsToAdd), email: selectedUserForCredits.email || 'user' }) });
        await fetchUsersAndCredits();
        setSelectedUserForCredits(null);
        setCreditsToAdd(0);
      } else {
        toast({ title: t('errorGenericTitle'), description: result.message || t('addCreditsErrorToast', { email: selectedUserForCredits.email || 'user' }), variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: t('errorGenericTitle'), description: error.message || t('addCreditsErrorToast', { email: selectedUserForCredits.email || 'user' }), variant: 'destructive' });
    } finally {
      setIsAddingCredits(false);
    }
  };

  const handleDeleteUser = async (uid: string, email: string | null) => {
    try {
      await deleteUserRtdbData(uid);
      toast({ title: t('mysticInsights'), description: t('deleteUserSuccessToast', { email: email || 'User' }) });
      await fetchUsersAndCredits();
    } catch (error: any) {
      toast({ title: t('errorGenericTitle'), description: error.message || t('deleteUserErrorToast', { email: email || 'User' }), variant: 'destructive' });
    }
  };

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward) return;
    setIsSavingReward(true);
    try {
      const { day, ...rewardData } = editingReward;
      const result = await setRewardForDay(day, rewardData);
       if (result.success) {
        toast({ title: t('mysticInsights'), description: t('rewardUpdateSuccess') });
        await fetchRewardCycle();
        setEditingReward(null);
      } else {
        toast({ title: t('errorGenericTitle'), description: result.message || t('rewardUpdateError'), variant: 'destructive' });
      }
    } catch (error: any) {
       toast({ title: t('errorGenericTitle'), description: error.message || t('rewardUpdateError'), variant: 'destructive' });
    } finally {
      setIsSavingReward(false);
    }
  };

  const handleSaveDictionaryEntry = async () => {
    setIsSavingDictionary(true);
    try {
      const result = await updateDreamDictionaryEntry(selectedDictionaryLetter, dictionaryContent);
      if (result.success) {
        toast({ title: t('mysticInsights'), description: t('dictionarySaveSuccess', { letter: selectedDictionaryLetter }) });
      } else {
        toast({ title: t('errorGenericTitle'), description: result.message || t('dictionarySaveError'), variant: 'destructive' });
      }
    } catch (error: any) {
       toast({ title: t('errorGenericTitle'), description: error.message || t('dictionarySaveError'), variant: 'destructive' });
    } finally {
      setIsSavingDictionary(false);
    }
  };


  if (adminProfile?.role !== 'admin') {
    return ( 
      <div className="container mx-auto p-8 text-center">
        <p>Access Denied.</p>
      </div>
    );
  }

  const rewardTypeOptions: { value: DailyReward['type']; labelKey: 'rewardTypeCredits' | 'rewardTypeEbook' | 'rewardTypeTarotReading' }[] = [
    { value: 'credits', labelKey: 'rewardTypeCredits' },
    { value: 'ebook', labelKey: 'rewardTypeEbook' },
    { value: 'tarot_reading', labelKey: 'rewardTypeTarotReading' },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <Card className="shadow-xl animated-aurora-background">
        <div className="relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md">
          <CardHeader className="p-8 sm:p-10">
            <CardTitle className="text-3xl font-serif flex items-center">
              <ShieldCheck className="h-8 w-8 mr-3 text-primary" />
              {t('adminDashboardTitle')}
            </CardTitle>
            <CardDescription>{t('adminDashboardDescription')}</CardDescription>
          </CardHeader>
        </div>
      </Card>

      {/* User Management Section */}
      <Card className="shadow-xl animated-aurora-background">
        <div className="relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-serif">{t('usersTableTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">{t('noUsersFound')}</p>
            ) : (
              <>
                <div className="md:hidden space-y-4">
                  {users.map((user) => (
                    <Card key={user.uid} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{user.displayName || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {user.role === 'admin' ? t('roleAdmin') : t('roleUser')}
                        </span>
                      </div>
                      <div className="mt-4 pt-4 border-t flex justify-between items-center">
                        <p className="text-sm">Créditos: <span className="font-bold">{user.credits?.balance ?? t('creditsCouldNotBeFetched')}</span></p>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon" onClick={() => setSelectedUserForCredits(user)}>
                                <Coins className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                             {selectedUserForCredits?.uid === user.uid && (
                              <DialogContent>
                                <form onSubmit={handleAddCredits}>
                                  <DialogHeader>
                                    <DialogTitle>{t('addCreditsModalTitle')}</DialogTitle>
                                    <DialogDescription>
                                      {t('manageUserLabel')}: {selectedUserForCredits.email}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="credits-amount" className="text-right col-span-1">
                                        {t('creditsAmountLabel')}
                                      </Label>
                                      <Input
                                        id="credits-amount"
                                        type="number"
                                        value={creditsToAdd}
                                        onChange={(e) => setCreditsToAdd(parseInt(e.target.value, 10) || 0)}
                                        className="col-span-3"
                                        min="1"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button variant="outline" type="button">{t('cancelButton')}</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isAddingCredits || creditsToAdd <= 0}>
                                      {isAddingCredits && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                      {t('addCreditsSubmitButton')}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            )}
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('confirmDeleteUserTitle')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('confirmDeleteUserDescription', { email: user.email || 'this user' })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.uid, user.email)}>
                                  {t('deleteUserButton')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="hidden md:block">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>{t('userName')}</TableHead>
                        <TableHead>{t('userEmail')}</TableHead>
                        <TableHead className="text-center">{t('userRole')}</TableHead>
                        <TableHead className="text-center">{t('userCredits')}</TableHead>
                        <TableHead className="text-right">{t('userActions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                        <TableRow key={user.uid}>
                            <TableCell>{user.displayName || 'N/A'}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="text-center">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                {user.role === 'admin' ? t('roleAdmin') : t('roleUser')}
                            </span>
                            </TableCell>
                            <TableCell className="text-center">{user.credits?.balance ?? t('creditsCouldNotBeFetched')}</TableCell>
                            <TableCell className="text-right space-x-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedUserForCredits(user)}>
                                    <Coins className="mr-1 h-4 w-4" /> {t('addCreditsButton')}
                                </Button>
                                </DialogTrigger>
                                {selectedUserForCredits?.uid === user.uid && (
                                <DialogContent>
                                    <form onSubmit={handleAddCredits}>
                                    <DialogHeader>
                                        <DialogTitle>{t('addCreditsModalTitle')}</DialogTitle>
                                        <DialogDescription>
                                        {t('manageUserLabel')}: {selectedUserForCredits.email}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="credits-amount" className="text-right col-span-1">
                                            {t('creditsAmountLabel')}
                                        </Label>
                                        <Input
                                            id="credits-amount"
                                            type="number"
                                            value={creditsToAdd}
                                            onChange={(e) => setCreditsToAdd(parseInt(e.target.value, 10) || 0)}
                                            className="col-span-3"
                                            min="1"
                                        />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                        <Button variant="outline" type="button">{t('cancelButton')}</Button>
                                        </DialogClose>
                                        <Button type="submit" disabled={isAddingCredits || creditsToAdd <=0}>
                                        {isAddingCredits && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t('addCreditsSubmitButton')}
                                        </Button>
                                    </DialogFooter>
                                    </form>
                                </DialogContent>
                                )}
                            </Dialog>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="mr-1 h-4 w-4" /> {t('deleteUserButton')}
                                </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('confirmDeleteUserTitle')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    {t('confirmDeleteUserDescription', { email: user.email || 'this user' })}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteUser(user.uid, user.email)}>
                                    {t('deleteUserButton')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
              </>
            )}
             {isLoadingUsers && <p className="text-center text-muted-foreground py-4">{t('fetchingUsers')}</p>}
          </CardContent>
        </div>
      </Card>
      
      {/* Dream Dictionary Management Section */}
      <Card className="shadow-xl animated-aurora-background">
        <div className="relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-serif flex items-center">
              <BookHeart className="h-7 w-7 mr-3 text-primary" />
              {t('dreamDictionaryManagementTitle')}
            </CardTitle>
            <CardDescription>{t('dreamDictionaryManagementDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dictionary-letter">{t('selectLetterLabel')}</Label>
              <Select value={selectedDictionaryLetter} onValueChange={setSelectedDictionaryLetter}>
                <SelectTrigger id="dictionary-letter" className="w-[180px]">
                  <SelectValue placeholder="Selecione uma letra" />
                </SelectTrigger>
                <SelectContent>
                  {alphabet.map(letter => (
                    <SelectItem key={letter} value={letter}>Letra {letter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dictionary-content">{t('dictionaryContentLabel', { letter: selectedDictionaryLetter })}</Label>
              {isLoadingDictionary ? (
                <Skeleton className="h-64 w-full mt-2" />
              ) : (
                <Textarea
                  id="dictionary-content"
                  value={dictionaryContent}
                  onChange={(e) => setDictionaryContent(e.target.value)}
                  rows={20}
                  className="mt-2 font-mono text-xs"
                  placeholder={t('dictionaryContentPlaceholder', { letter: selectedDictionaryLetter })}
                  disabled={isSavingDictionary}
                />
              )}
            </div>
            
            <Button onClick={handleSaveDictionaryEntry} disabled={isSavingDictionary || isLoadingDictionary}>
              {isSavingDictionary ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSavingDictionary ? t('savingButton') : t('saveDictionaryButton')}
            </Button>
          </CardContent>
        </div>
      </Card>


      {/* Daily Rewards Management Section */}
      <Card className="shadow-xl animated-aurora-background">
        <div className="relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-serif flex items-center">
              <Gift className="h-7 w-7 mr-3 text-primary" />
              {t('manageDailyRewardsTitle')}
            </CardTitle>
            <CardDescription>{t('manageDailyRewardsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRewards ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {Array.from({ length: 30 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
              </div>
            ) : (
               <Dialog onOpenChange={(open) => !open && setEditingReward(null)}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {rewardCycle.map((reward) => (
                    <DialogTrigger key={reward.day} asChild>
                      <Card 
                        onClick={() => setEditingReward(reward)}
                        className="cursor-pointer hover:border-primary transition-colors flex flex-col items-center justify-center p-2 text-center"
                      >
                        <CardHeader className="p-1">
                          <CardDescription>{t('dayLabel', {day: reward.day})}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-1 flex-grow flex flex-col items-center justify-center">
                          <p className="text-sm font-semibold">{reward.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {reward.value} {t(rewardTypeOptions.find(opt => opt.value === reward.type)?.labelKey ?? 'rewardTypeCredits')}
                          </p>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                  ))}
                </div>
                {editingReward && (
                  <DialogContent>
                    <form onSubmit={handleSaveReward}>
                      <DialogHeader>
                        <DialogTitle>{t('editRewardForDay', { day: editingReward.day })}</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-1">
                          <Label htmlFor="reward-title">{t('rewardTitleLabel')}</Label>
                          <Input id="reward-title" value={editingReward.title} onChange={(e) => setEditingReward({...editingReward, title: e.target.value})} placeholder={t('rewardTitlePlaceholder')}/>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="reward-type">{t('rewardTypeLabel')}</Label>
                          <Select
                            value={editingReward.type}
                            onValueChange={(value) => setEditingReward({ ...editingReward, type: value as DailyReward['type'] })}
                          >
                            <SelectTrigger id="reward-type">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              {rewardTypeOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {t(option.labelKey)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="reward-value">{t('rewardValueLabel')}</Label>
                          <Input id="reward-value" type="number" value={editingReward.value} onChange={(e) => setEditingReward({...editingReward, value: parseInt(e.target.value, 10) || 0})} placeholder={t('rewardValuePlaceholder')}/>
                        </div>
                         <div className="space-y-1">
                          <Label htmlFor="reward-icon">{t('rewardIconLabel', { defaultValue: 'rewardIconLabel'})}</Label>
                           <Select
                            value={editingReward.iconName}
                            onValueChange={(value) => setEditingReward({ ...editingReward, iconName: value })}
                          >
                            <SelectTrigger id="reward-icon">
                              <SelectValue placeholder="Selecione um ícone" />
                            </SelectTrigger>
                            <SelectContent>
                               <ScrollArea className="h-72">
                                {mysticalIconNames.map(iconName => (
                                  <SelectItem key={iconName} value={iconName}>
                                    {iconName}
                                  </SelectItem>
                                ))}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild><Button variant="outline" type="button">{t('cancelButton')}</Button></DialogClose>
                        <Button type="submit" disabled={isSavingReward}>
                          {isSavingReward ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {isSavingReward ? t('savingButton') : t('saveRewardButton')}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                )}
               </Dialog>
            )}
          </CardContent>
        </div>
      </Card>
      
    </div>
  );
}

    