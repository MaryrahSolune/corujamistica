
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
import { LayoutDashboard, ScanLine, UserCircle2, CreditCard, LogOut, Sparkles, Globe, BrainCircuit, ShieldCheck, UserPlus, LogIn, MessageCircle, TreeDeciduous, Flower } from 'lucide-react';
import { IconAvatar } from './IconAvatar';
import Image from 'next/image';

const navLinksRegularUser: { href: string; labelKey: TranslationKey; icon: React.ReactNode }[] = [
  { href: '/dashboard', labelKey: 'dashboard', icon: <LayoutDashboard className="mr-2 h-4 w-4" /> },
  { href: '/new-reading', labelKey: 'newReading', icon: <ScanLine className="mr-2 h-4 w-4" /> },
  { href: '/dream-interpretation', labelKey: 'dreamInterpretation', icon: <BrainCircuit className="mr-2 h-4 w-4" /> },
  { href: '/ogham', labelKey: 'oghamOracle', icon: <TreeDeciduous className="mr-2 h-4 w-4" /> },
  { href: '/yidams', labelKey: 'yidamsPath', icon: <Flower className="mr-2 h-4 w-4" /> },
  { href: '/credits', labelKey: 'credits', icon: <CreditCard className="mr-2 h-4 w-4" /> },
  { href: '/whatsapp-mode', labelKey: 'whatsappMode', icon: <MessageCircle className="mr-2 h-4 w-4" /> },
];

const navLinksAdmin: { href: string; labelKey: TranslationKey; icon: React.ReactNode }[] = [
  { href: '/admin', labelKey: 'adminPanel', icon: <ShieldCheck className="mr-2 h-4 w-4" /> },
];

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

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isLandingPage = pathname === '/';

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
  const logoLink = isLandingPage || isAuthPage ? "/" : (isAdmin ? "/admin" : "/dashboard");
 
  const showAuthLinks = !currentUser && (isLandingPage || isAuthPage);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-32 max-w-screen-2xl items-center">
        <Link href={logoLink} className="mr-6 flex items-center space-x-2">
          <Image src="/img/simples.png" alt="Coruja Mística Logo" width={100} height={100} />
          <span className="hidden sm:inline-block text-2xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary bg-[length:200%_auto] animate-text-gradient-flow">
            {t('mysticInsights')}
          </span>
        </Link>

        {!isAuthPage && !isLandingPage && currentUser && (
          <nav className="flex items-center gap-4 text-sm lg:gap-6 flex-grow">
            {currentNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors duration-300',
                  'hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-accent hover:via-primary-foreground hover:to-accent hover:bg-[length:200%_auto] hover:animate-text-gradient-flow',
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
          <LanguageSwitcher />
          {isClient && currentUser && !isAuthPage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {userProfile?.avatar ? (
                       <IconAvatar iconName={userProfile.avatar.iconName} gradientName={userProfile.avatar.gradient} className="h-full w-full" />
                    ) : (
                      <>
                        <AvatarImage src={currentUser.photoURL || userProfile?.photoURL || undefined} alt={userProfile?.displayName || currentUser.email || 'User'} />
                        <AvatarFallback>{getInitials(userProfile?.displayName || currentUser.displayName, currentUser.email)}</AvatarFallback>
                      </>
                    )}
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
                    variant="ghost" 
                    className="login-btn-custom relative z-[1]" 
                  >
                    <Link href="/login">
                      <LogIn className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">{t('login')}</span>
                    </Link>
                  </Button>
                </div>
                <div className="login-button-aura-wrapper">
                  <Button
                    asChild
                    variant="ghost" 
                    className="login-btn-custom relative z-[1]"
                  >
                    <Link href="/signup">
                      <UserPlus className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">{t('signUp')}</span>
                    </Link>
                  </Button>
                </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
