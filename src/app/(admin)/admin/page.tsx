
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllUserProfiles, deleteUserRtdbData, type UserProfileData } from '@/services/userService';
import { adminAddCredits, getUserCredits, type UserCreditsData } from '@/services/creditService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, UserPlus, Trash2, Coins, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface UserWithCredits extends UserProfileData {
  credits?: UserCreditsData | null;
}

export default function AdminDashboardPage() {
  const { userProfile: adminProfile, refreshUserProfile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserWithCredits[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [selectedUserForCredits, setSelectedUserForCredits] = useState<UserWithCredits | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState<number>(0);
  const [isAddingCredits, setIsAddingCredits] = useState(false);

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

  useEffect(() => {
    if (adminProfile?.role === 'admin') {
      fetchUsersAndCredits();
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
  
  if (adminProfile?.role !== 'admin') {
    return ( // Should be handled by AdminLayout, but good for safety
      <div className="container mx-auto p-8 text-center">
        <p>Access Denied.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="mb-8 shadow-xl animated-aurora-background">
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
            )}
             {isLoadingUsers && <p className="text-center text-muted-foreground py-4">{t('fetchingUsers')}</p>}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
