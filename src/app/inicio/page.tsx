'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, LogIn, UserPlus, UploadCloud, Search, Brain, Users, Star, Palette, Film } from 'lucide-react';
import { ThemeToggle, LanguageSwitcher } from '@/components/AppHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Custom Separator Component
const CustomSeparator = () => (
  <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
);

export default function InicioPage() {
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const howItWorksSteps = [
    {
      icon: <UploadCloud className="h-10 w-10 text-primary" />,
      titleKey: "howItWorksUploadTitle",
      descriptionKey: "howItWorksUploadDescription",
    },
    {
      icon: <Brain className="h-10 w-10 text-primary" />,
      titleKey: "howItWorksQueryTitle",
      descriptionKey: "howItWorksQueryDescription",
    },
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      titleKey: "howItWorksRevealTitle",
      descriptionKey: "howItWorksRevealDescription",
    },
  ];

  const benefits = [
    {
      icon: <Sparkles className="h-10 w-10 text-accent" />,
      titleKey: "benefitAITitle",
      descriptionKey: "benefitAIDescription",
    },
    {
      icon: <Palette className="h-10 w-10 text-accent" />,
      titleKey: "benefitPersonalizationTitle",
      descriptionKey: "benefitPersonalizationDescription",
    },
    {
      icon: <Users className="h-10 w-10 text-accent" />,
      titleKey: "benefitGuidanceTitle",
      descriptionKey: "benefitGuidanceDescription",
    },
  ];

  const testimonials = [
    {
      quoteKey: "testimonial1Quote", // This line was not causing the issue
      nameKey: "testimonial1Name",
      roleKey: "testimonial1Role",
    },
    {
      quoteKey: "testimonial2Quote",
      nameKey: "testimonial2Name",
      roleKey: "testimonial2Role",
    },
  ];

  const gifPlaceholders = [
    { src: "/gifs/mystic_aura.gif", hint: "mystical animation space", altKey: "gifPlaceholderAlt" },
    { src: "/gifs/sacred_symbols_animated.gif", hint: "spiritual symbol sequence", altKey: "gifPlaceholderAlt" },
    { src: "/gifs/cosmic_energy.gif", hint: "energy flow visualization", altKey: "gifPlaceholderAlt" },
  ];

  if (!isClient) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="py-6 sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex justify-between items-center px-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto p-4">
          <section className="py-20 sm:py-28 text-center">
            <Skeleton className="h-20 w-20 rounded-full mx-auto mb-6" />
            <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
            <Skeleton className="h-8 w-1/2 mx-auto mb-10" />
            <Skeleton className="h-12 w-48 mx-auto" />
          </section>
          <CustomSeparator />
          <section className="py-16 sm:py-24">
            <Skeleton className="h-10 w-1/2 mx-auto mb-4" />
            <Skeleton className="h-6 w-3/4 mx-auto mb-12" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1,2,3].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
          </section>
        </main>
        <footer className="py-8 text-center border-t border-border/20 bg-background/80">
          <Skeleton className="h-5 w-1/3 mx-auto" />
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="py-6 sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-serif text-primary">{t('mysticInsights')}</span>
          </div>
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <Button variant="ghost" asChild>
              <Link href="/login">
                <LogIn className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">{t('login')}</span>
              </Link>
            </Button>
            <Button asChild>
              <Link href="/signup">
                <UserPlus className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">{t('signUp')}</span>
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section Corrigida */}
        <section className="py-20 sm:py-28 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <Image
              src="/img/mulher fumaça.gif"
              alt={t('landingImageAlt')}
              data-ai-hint="woman with smoke animation"
              fill
              style={{ objectFit: 'cover' }}
              priority
              unoptimized={true}
            />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="mb-8">
              <Sparkles className="h-20 w-20 text-primary mx-auto animate-subtle-pulse" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-serif mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary animate-fade-in" style={{animationDelay: '0.2s'}}>
              {t('landingTitle')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.4s'}}>
              {t('landingSubtitle')}
            </p>
            <div className="space-x-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link href="/signup">
                  {t('landingButton')} <UserPlus className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-center mb-4 animate-fade-in" style={{animationDelay: '0.1s'}}>{t('howItWorksTitle')}</h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>{t('howItWorksSubtitle')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {howItWorksSteps.map((step, index) => (
                <div
                  key={index}
                  className="animated-aurora-background rounded-xl overflow-hidden animate-slide-in-up transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:shadow-primary/30"
                  style={{animationDuration: '0.5s', animationDelay: `${0.3 + index * 0.2}s`}}
                >
                  <Card className="h-full text-center shadow-xl relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md p-6">
                    <CardHeader className="items-center pb-4">
                      <div className="p-4 bg-primary/10 rounded-full mb-4 w-fit">
                        {step.icon}
                      </div>
                      <CardTitle className="text-2xl font-serif">{t(step.titleKey as any)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">{t(step.descriptionKey as any)}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CustomSeparator />

        {/* Discover the Magic Section (Benefits) */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-center mb-4 animate-fade-in" style={{animationDelay: '0.1s'}}>{t('discoverMagicTitle')}</h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>{t('discoverMagicSubtitle')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                 <div
                  key={index}
                  className="animated-aurora-background rounded-xl overflow-hidden animate-slide-in-up transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:shadow-accent/30"
                  style={{animationDuration: '0.5s', animationDelay: `${0.3 + index * 0.2}s`}}
                >
                  <Card className="h-full text-center shadow-xl relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md p-6">
                    <CardHeader className="items-center pb-4">
                       <div className="p-4 bg-accent/10 rounded-full mb-4 w-fit">
                        {benefit.icon}
                      </div>
                      <CardTitle className="text-2xl font-serif">{t(benefit.titleKey as any)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">{t(benefit.descriptionKey as any)}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CustomSeparator />

        {/* Testimonials Section */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <Users className="h-12 w-12 text-accent mx-auto mb-3" />
              <p className="text-4xl font-bold text-primary">
                +20.000
              </p>
              <p className="text-lg text-muted-foreground mt-1">
                {t('satisfiedClientsLabel')}
              </p>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-center mb-4 animate-fade-in" style={{animationDelay: '0.2s'}}>{t('testimonialsTitle')}</h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.3s'}}>{t('testimonialsSubtitle')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="animated-aurora-background rounded-xl overflow-hidden animate-slide-in-up transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:shadow-accent/30"
                  style={{animationDuration: '0.5s', animationDelay: `${0.4 + index * 0.2}s`}}
>
                  <Card className="shadow-lg relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md p-6 min-h-[200px] flex flex-col justify-center group">
                    <CardContent className="text-center">
                       <Avatar className="w-20 h-20 mx-auto mb-4 border-2 border-primary shadow-lg transition-transform duration-300 group-hover:scale-110">
                        <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="person portrait" alt={t(testimonial.nameKey as any)} />
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                          {t(testimonial.nameKey as any).split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Star className="h-6 w-6 text-yellow-400 mx-auto mb-3" />
                      <p className="text-lg italic text-foreground/90 mb-4">"{t(testimonial.quoteKey as any)}"</p>
                      <p className="font-semibold text-primary">{t(testimonial.nameKey as any)}</p>
                      <p className="text-sm text-muted-foreground">{t(testimonial.roleKey as any)}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CustomSeparator />

        {/* Mystical Animated Gallery Section */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <Film className="h-12 w-12 text-primary mx-auto mb-3" />
              <h2 className="text-3xl sm:text-4xl font-bold font-serif mb-2">{t('mysticalGalleryTitle')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('mysticalGallerySubtitle')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gifPlaceholders.map((gif, index) => (
                <div
                  key={index}
                  className="animated-aurora-background rounded-xl overflow-hidden animate-slide-in-up transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:shadow-secondary/30"
                  style={{animationDuration: '0.5s', animationDelay: `${0.2 + index * 0.15}s`}}
                >
                  <div className="aspect-w-4 aspect-h-3 relative z-10 bg-black/30 backdrop-blur-sm">
                    <Image
                      src={gif.src}
                      alt={t(gif.altKey as any)}
                      fill
                      style={{ objectFit: 'contain' }}
                      className="rounded-lg"
                      data-ai-hint={gif.hint}
                      unoptimized={true} // Important for GIFs
                    />
                  </div>
                </div>
              ))}
            </div>
             <p className="text-center text-muted-foreground mt-8 text-sm animate-fade-in" style={{animationDelay: '0.5s'}}>
              (Em breve: mais animações e símbolos sagrados para sua inspiração!)
            </p>
          </div>
        </section>

        <CustomSeparator />

        {/* Final CTA Section */}
        <section className="py-20 sm:py-28 text-center bg-primary/10 relative overflow-hidden">
           <div className="absolute inset-0 -z-10 animated-aurora-background opacity-70"></div>
          <div className="container mx-auto px-4 relative z-10">
            <Sparkles className="h-16 w-16 text-accent mx-auto mb-6 animate-subtle-pulse" style={{animationDelay: '0.2s'}}/>
            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
              {t('finalCTATitle')}
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.6s'}}>
              {t('finalCTASubtitle')}
            </p>
            <Button size="lg" asChild className="text-lg px-10 py-7 animate-fade-in" style={{animationDelay: '0.8s'}}>
              <Link href="/signup">
                {t('finalCTAButton')} <UserPlus className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center border-t border-border/20 bg-background/80 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 animated-aurora-background opacity-40"></div>
        <p className="text-muted-foreground relative z-10">
          {t('footerText', { year: new Date().getFullYear() })}
        </p>
      </footer>
    </div>
  );
}