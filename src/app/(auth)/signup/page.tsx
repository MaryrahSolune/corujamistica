
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, updateProfile as updateFirebaseAuthProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { createUserProfile } from '@/services/userService';
import { initializeUserCredits } from '@/services/creditService';
import { cn } from '@/lib/utils';

const signupSchema = z.object({
  displayName: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres' }).max(50),
  email: z.string().email({ message: 'Endereço de e-mail inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
});

type SignupFormInputs = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormInputs>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit: SubmitHandler<SignupFormInputs> = async (data) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateFirebaseAuthProfile(userCredential.user, { displayName: data.displayName });
      
      // Create user profile and initialize credits in RTDB
      await createUserProfile(userCredential.user);
      await initializeUserCredits(userCredential.user.uid);
      
      toast({ title: t('signupSuccessTitle'), description: t('signupSuccessDescription') });
      router.push('/dashboard');
    } catch (error) {
      let toastDescription = t('genericErrorDescription');
      let logErrorToConsole = true;

      if (typeof error === 'object' && error !== null && 'code' in error && typeof (error as any).code === 'string') {
        const firebaseError = error as { code: string; message: string };
        if (firebaseError.code === 'auth/email-already-in-use') {
          toastDescription = t('emailAlreadyInUseErrorDescription');
          logErrorToConsole = false; 
        }
      } else if (error instanceof Error) {
        // toastDescription = error.message || t('genericErrorDescription');
      }

      if (logErrorToConsole) {
        console.error('Signup error:', error);
      }

      toast({
        title: t('signupFailedTitle'),
        description: toastDescription,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-serif">{t('createAccountTitle')}</CardTitle>
        <CardDescription>{t('createAccountDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">{t('fullNameLabel')}</Label>
            <Input id="displayName" type="text" {...register('displayName')} placeholder={t('yourNamePlaceholder')} />
            {errors.displayName && <p className="text-sm text-destructive">{errors.displayName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('emailLabel')}</Label>
            <Input id="email" type="email" {...register('email')} placeholder="email@exemplo.com" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('passwordLabel')}</Label>
            <Input id="password" type="password" {...register('password')} placeholder="••••••••" />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t('signUpButton')}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {t('alreadyHaveAccount')}{' '}
          <Link 
            href="/login" 
            className={cn(buttonVariants({ variant: 'link' }), "p-0 h-auto text-sm")}
          >
            {t('loginLink')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
