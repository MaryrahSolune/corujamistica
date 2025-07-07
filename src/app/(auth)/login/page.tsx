
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod'; // Keep existing import
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { createUserProfile } from '@/services/userService';
import { initializeUserCredits } from '@/services/creditService';


const loginSchema = z.object({
  email: z.string().email({ message: 'Endereço de e-mail inválido' }), 
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-.97 2.56-2.05 3.35v2.79h3.58c2.08-1.92 3.28-4.74 3.28-8.15z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.58-2.79c-.98.66-2.23 1.06-3.7 1.06-2.83 0-5.22-1.9-6.08-4.44H2.34v2.88C4.13 20.98 7.79 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.92 14.41c-.15-.45-.24-.92-.24-1.41s.09-.96.24-1.41V8.71H2.34c-.77 1.52-1.24 3.24-1.24 5.17s.47 3.65 1.24 5.17l3.58-2.88z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.79 1 4.13 3.02 2.34 5.83l3.58 2.88c.86-2.54 3.25-4.44 6.08-4.44z"
      fill="#EA4335"
    />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
);


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false); // Loading state for Google login
  const [rememberMe, setRememberMe] = useState(false);
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    setIsClient(true);
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setValue('email', rememberedEmail);
      setRememberMe(true);
    }
  }, [setValue]);


  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', data.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      toast({ title: t('loginSuccessTitle'), description: t('loginSuccessDescription') });
      router.push('/dashboard'); // Redirect directly to dashboard
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: t('loginFailedTitle'),
        description: error.message || t('genericErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      
      // On first login with Google, create user profile and initialize credits
      await createUserProfile(userCredential.user);
      await initializeUserCredits(userCredential.user.uid);
      
      toast({ title: t('loginSuccessTitle'), description: t('loginSuccessDescription') });
      router.push('/dashboard'); // Redirect directly to dashboard
    } catch (error: any) {
      console.error('Google login error:', error);
      toast({
        title: t('loginFailedTitle'),
        description: error.message || t('genericErrorDescription'), // Use a generic error message if none provided
        variant: 'destructive',
      });
    } finally {
      setLoadingGoogle(false);
    }
  };

  if (!isClient) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-7 w-20 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <Skeleton className="h-5 w-56" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full bg-card/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-2xl font-serif">{t('loginTitle')}</CardTitle>
          <CardDescription>{t('loginDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checkedState) => {
                  setRememberMe(checkedState === true);
                }}
              />
              <Label htmlFor="remember-me">
                {t('rememberMeLabel')}
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('loginButton')}
            </Button>
          </form>

          {/* OU Separator */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400">{t('orSeparator')}</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          <Button variant="outline" onClick={handleGoogleLogin} className="w-full" disabled={loading || loadingGoogle}>
             {loadingGoogle ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
            Entrar com Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {t('dontHaveAccount')}{' '}
            <Link 
              href="/signup" 
              className={cn(buttonVariants({ variant: 'link' }), "p-0 h-auto text-sm")}
            >
              {t('signUpLink')}
            </Link>
          </p>
        </CardFooter>
      </Card>
      <img src="/img/mulher fumaça.gif" alt="Mystic Smoke Woman GIF" className="mx-auto mt-8" />
    </>
  );
}
