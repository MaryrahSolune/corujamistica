
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod'; // Keep existing import
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { signInWithPopup } from 'firebase/auth'; // Import signInWithPopup
import { googleProvider } from '@/lib/firebase'; // Import googleProvider


const loginSchema = z.object({
  email: z.string().email({ message: 'Endereço de e-mail inválido' }), 
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false); // Loading state for Google login
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
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
      await signInWithPopup(auth, googleProvider);
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
    <Card className="w-full">
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
          <div className="login-button-aura-wrapper">
            <Button 
              type="submit" 
              className="w-full login-btn-custom relative z-[1]" 
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('loginButton')}
            </Button>
          </div>
        </form>

        {/* OU Separator */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400">{t('orSeparator')}</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        {/* Google Login Button */}
        {/* You might want to add a Google icon here */}
        <Button onClick={handleGoogleLogin} className="w-full relative z-[1]" disabled={loading || loadingGoogle}>
           {loadingGoogle ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Entrar com Google {/* Consider translating this text */}
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
  );
}

// Adicionando o GIF da cobra abaixo da caixa de login
// Note: Use Next.js Image component for optimized images,
// but for a simple GIF display, a standard <img> tag is sufficient.
export function CobraGif() {
  return <img src="/img/mulher fumaça.gif" alt="Mystic Smoke Woman GIF" className="mx-auto mt-8" />;
}
