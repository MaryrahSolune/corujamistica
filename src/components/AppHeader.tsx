
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Button, buttonVariants } from '@/components/ui/button'; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, type Locale, type TranslationKey } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ScanLine, UserCircle2, CreditCard, LogOut, Moon, Sun, Sparkles, Globe, BrainCircuit, ShieldCheck, UserPlus, LogIn, HeartHandshake } from 'lucide-react'; // Added HeartHandshake

const navLinksRegularUser: { href: string; labelKey: TranslationKey; icon: React.ReactNode }[] = [
  { href: '/dashboard', labelKey: 'dashboard', icon: <LayoutDashboard className="mr-2 h-4 w-4" /> },
  { href: '/new-reading', labelKey: 'newReading', icon: <ScanLine className="mr-2 h-4 w-4" /> },
  { href: '/dream-interpretation', labelKey: 'dreamInterpretation', icon: <BrainCircuit className="mr-2 h-4 w-4" /> },
  { href: '/love-oracle', labelKey: 'loveOracle', icon: <HeartHandshake className="mr-2 h-4 w-4" /> },
  { href: '/credits', labelKey: 'credits', icon: <CreditCard className="mr-2 h-4 w-4" /> },
];

const navLinksAdmin: { href: string; labelKey: TranslationKey; icon: React.ReactNode }[] = [
  { href: '/admin', labelKey: 'adminPanel', icon: <ShieldCheck className="mr-2 h-4 w-4" /> },
];


export const ThemeToggle = () => {
  const { t } = useLanguage();
  const [isDark, setIsDark] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    let initialIsDark;
    if (savedTheme) {
      initialIsDark = savedTheme === 'dark';
    } else {
      initialIsDark = prefersDark;
    }
    setIsDark(initialIsDark);
    document.documentElement.classList.toggle('dark', initialIsDark);
  }, []);

  const toggleTheme = () => {
    setIsDark(prevIsDark => {
      const newIsDark = !prevIsDark;
      localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newIsDark);
      return newIsDark;
    });
  };

  if (!mounted) {
    return <Button variant="ghost" size="icon" aria-label={t('toggleTheme')} disabled><Sparkles className="h-5 w-5" /></Button>;
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={t('toggleTheme')}>
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};

export const LanguageSwitcher = () => {
  const { locale, setLocale, t } = useLanguage();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSwitch = () => {
    const newLocale = locale === 'en' ? 'pt-BR' : 'en';
    setLocale(newLocale);
  };

  if (!mounted) {
    return (
        <Button variant="ghost" aria-label={t('language')} className="p-2" disabled>
            <Globe className="h-5 w-5 mr-1" />
            <span className="text-xs">--</span>
        </Button>
    );
  }

  return (
    <Button variant="ghost" onClick={handleSwitch} aria-label={t('language')} className="p-2">
      <Globe className="h-5 w-5 mr-1" />
      <span className="text-xs">{locale.toUpperCase()}</span>
    </Button>
  );
};


export default function AppHeader() {
  const { currentUser, userProfile, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);


  const getInitials = (name?: string | null, email?: string | null) => {
    if (name && name.trim()) {
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length -1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return 'MI';
  };

  const isAdmin = userProfile?.role === 'admin';
  const currentNavLinks = isAdmin ? navLinksAdmin : navLinksRegularUser;
  const homeLink = isAdmin ? "/admin" : "/dashboard";


  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isLandingPage = pathname === '/' || pathname === '/inicio'; 

  const showAuthLinks = !currentUser && (isLandingPage || isAuthPage);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href={showAuthLinks ? "/" : homeLink} className="mr-6 flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold font-serif text-xl sm:inline-block">{t('mysticInsights')}</span>
        </Link>

        {!isAuthPage && !isLandingPage && currentUser && (
          <nav className="flex items-center gap-4 text-sm lg:gap-6 flex-grow">
            {currentNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname === link.href ? 'text-foreground font-semibold' : 'text-foreground/60'
                )}
              >
                <span className="hidden md:inline">{t(link.labelKey)}</span>
                <span className="md:hidden" title={t(link.labelKey)}>{React.cloneElement(link.icon as React.ReactElement, { className: 'h-5 w-5' })}</span>
              </Link>
            ))}
          </nav>
        )}
         {(isAuthPage || isLandingPage) && <div className="flex-grow"></div>}


        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          {isClient && currentUser && !isAuthPage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.photoURL || userProfile?.photoURL || undefined} alt={userProfile?.displayName || currentUser.email || 'User'} />
                    <AvatarFallback>{getInitials(userProfile?.displayName || currentUser.displayName, currentUser.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userProfile?.displayName || currentUser.displayName || currentUser.email?.split('@')[0]}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserCircle2 className="mr-2 h-4 w-4" />
                    <span>{t('profile')}</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && !pathname.startsWith('/admin') && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                       <span>{t('adminPanel')}</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                 {!isAdmin && pathname.startsWith('/admin') && (
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>{t('dashboard')}</span>
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {isClient && showAuthLinks && (
             <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="login-button-aura-wrapper">
                  <Button
                    asChild
                    variant="default"
                    className="login-btn-custom relative z-[1]" 
                  >
                    <Link href="/login">
                      <LogIn className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">{t('login')}</span>
                    </Link>
                  </Button>
                </div>
                <Button
                  asChild
                  variant="default"
                >
                  <Link href="/signup">
                    <UserPlus className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">{t('signUp')}</span>
                  </Link>
                </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
