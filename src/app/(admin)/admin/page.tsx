
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllUserProfiles, deleteUserRtdbData, type UserProfileData } from '@/services/userService';
import { adminAddCredits, getUserCredits, type UserCreditsData } from '@/services/creditService';
import { getRewardCycle, setRewardForDay, type DailyReward } from '@/services/rewardService';
import { getPromptContent, updatePromptContent, type PromptName } from '@/services/promptManagementService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, UserPlus, Trash2, Coins, Edit, MessageSquareQuote, Gift } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserWithCredits extends UserProfileData {
  credits?: UserCreditsData | null;
}

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

  const fetchUsersAndCredits = async () => {
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
  };

  const fetchAllPrompts = async () => {
    setIsLoadingPrompts(true);
    try {
      const [cardPrompt, dreamPrompt] = await Promise.all([
        getPromptContent('analyzeCardReading'),
        getPromptContent('interpretDream')
      ]);
      setCardReadingPrompt(cardPrompt);
      setDreamInterpretationPrompt(dreamPrompt);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      toast({ title: t('errorGenericTitle'), description: t('promptLoadError'), variant: 'destructive' });
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  const fetchRewardCycle = async () => {
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
  };

  useEffect(() => {
    if (adminProfile?.role === 'admin') {
      fetchUsersAndCredits();
      fetchAllPrompts();
      fetchRewardCycle();
    }
  }, [adminProfile]);


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
        fetchUsersAndCredits(); // Refresh users list
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
      fetchUsersAndCredits(); // Refresh users list
    } catch (error: any) {
      toast({ title: t('errorGenericTitle'), description: error.message || t('deleteUserErrorToast', { email: email || 'User' }), variant: 'destructive' });
    }
  };

  const handleSavePrompt = async (promptName: PromptName, content: string) => {
    if (promptName === 'analyzeCardReading') setIsSavingCardPrompt(true);
    if (promptName === 'interpretDream') setIsSavingDreamPrompt(true);

    try {
      const result = await updatePromptContent(promptName, content);
      if (result.success) {
        toast({ title: t('mysticInsights'), description: t('promptSaveSuccess') });
      } else {
        toast({ title: t('errorGenericTitle'), description: result.message || t('promptSaveError'), variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: t('errorGenericTitle'), description: error.message || t('promptSaveError'), variant: 'destructive' });
    } finally {
      if (promptName === 'analyzeCardReading') setIsSavingCardPrompt(false);
      if (promptName === 'interpretDream') setIsSavingDreamPrompt(false);
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
        fetchRewardCycle(); // Refresh the list
        setEditingReward(null); // Close the dialog
      } else {
        toast({ title: t('errorGenericTitle'), description: result.message || t('rewardUpdateError'), variant: 'destructive' });
      }
    } catch (error: any) {
       toast({ title: t('errorGenericTitle'), description: error.message || t('rewardUpdateError'), variant: 'destructive' });
    } finally {
      setIsSavingReward(false);
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
          <CardHeader>
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
                {/* Mobile View: List of Cards */}
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
                          {/* Add Credits Dialog Trigger for Mobile */}
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
                          {/* Delete User Alert Trigger for Mobile */}
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

                {/* Desktop View: Table */}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 30 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
              </div>
            ) : (
               <Dialog onOpenChange={(open) => !open && setEditingReward(null)}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                           <Image 
                              src={reward.imageUrl || 'https://placehold.co/100x100.png'} 
                              alt={reward.title} 
                              width={40} height={40} 
                              className="rounded-md mb-2 object-cover"
                              data-ai-hint="reward icon"
                           />
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
                          <Label htmlFor="reward-image">{t('rewardImageUrlLabel')}</Label>
                          <Input id="reward-image" value={editingReward.imageUrl} onChange={(e) => setEditingReward({...editingReward, imageUrl: e.target.value})} placeholder={t('rewardImageUrlPlaceholder')}/>
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

      {/* AI Prompt Management Section */}
      <Card className="shadow-xl animated-aurora-background">
        <div className="relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-serif flex items-center">
              <MessageSquareQuote className="h-7 w-7 mr-3 text-primary" />
              {t('promptManagementTitle')}
            </CardTitle>
            <CardDescription>{t('promptEditingDisclaimer')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingPrompts ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-8 w-1/3 mt-4" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-24" />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="card-reading-prompt" className="text-lg font-semibold">{t('cardReadingPromptLabel')}</Label>
                  <Textarea id="card-reading-prompt" value={cardReadingPrompt} onChange={(e) => setCardReadingPrompt(e.target.value)} rows={15} className="mt-2 mb-3 font-mono text-xs" disabled={isSavingCardPrompt} />
                  <Button onClick={() => handleSavePrompt('analyzeCardReading', cardReadingPrompt)} disabled={isSavingCardPrompt}>
                    {isSavingCardPrompt && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('savePromptButton')}
                  </Button>
                </div>
                <div>
                  <Label htmlFor="dream-interpretation-prompt" className="text-lg font-semibold">{t('dreamInterpretationPromptLabel')}</Label>
                  <Textarea id="dream-interpretation-prompt" value={dreamInterpretationPrompt} onChange={(e) => setDreamInterpretationPrompt(e.target.value)} rows={15} className="mt-2 mb-3 font-mono text-xs" disabled={isSavingDreamPrompt} />
                  <Button onClick={() => handleSavePrompt('interpretDream', dreamInterpretationPrompt)} disabled={isSavingDreamPrompt}>
                    {isSavingDreamPrompt && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('savePromptButton')}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
