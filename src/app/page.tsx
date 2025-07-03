
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link'; // Keep this import
import Image from 'next/image';
import { Sparkles, LogIn, UserPlus, UploadCloud, Search, Brain, Users, Star, Palette, Film, Plus } from 'lucide-react';
import { ThemeToggle, LanguageSwitcher } from '@/components/AppHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { onValue, ref } from 'firebase/database';
import { rtdb } from '@/lib/firebase';

// Custom Separator Component
const CustomSeparator = () => (
  <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
);

export default function HomePage() {
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [showPlusOne, setShowPlusOne] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const countRef = ref(rtdb, 'metadata/userCount');

    const unsubscribe = onValue(countRef, (snapshot) => {
        const newCount = snapshot.val();
        if (newCount) {
            setUserCount((prevCount) => {
                if (prevCount !== null && newCount > prevCount) {
                    setShowPlusOne(true);
                    setTimeout(() => setShowPlusOne(false), 1500); // Animation duration
                }
                return newCount;
            });
        } else {
            setUserCount(150);
        }
    });

    return () => unsubscribe();
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

  const howItWorksDreamSteps = [
    {
      icon: <Film className="h-10 w-10 text-primary" />,
      title: "Sabedoria por IA",
      description: "Utilizando IA avançada treinada por místicos experientes para fornecer interpretações profundas.",
    },
    {
      icon: <Brain className="h-10 w-10 text-primary" />,
      title: "Verdadeiramente Pessoal",
      description: "Interpretações adaptadas à sua imagem de cartas e pergunta específica.",
    },
    {
      icon: <Sparkles className="h-10 w-10 text-primary" />,
      title: "Orientação Espiritual",
      description: "Obtenha clareza e direção para o caminho da sua vida, relacionamentos e decisões.",
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
      quoteKey: "testimonial1Quote",
      nameKey: "testimonial1Name",
      roleKey: "testimonial1Role",
      imageSrc: '/img/rosto-mulher.jpg',
    },
    {
      quoteKey: "testimonial2Quote",
      nameKey: "testimonial2Name",
      roleKey: "testimonial2Role",
      imageSrc: '/img/rosto-homem.jpg',
    }
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
        <section className="py-20 sm:py-28 text-center bg-cover bg-center relative overflow-hidden" style={{
 backgroundImage: 'url(\'/img/4Q46.gif\')',
 backgroundSize: '40% auto', // Keep the size
 backgroundPosition: 'center', // Keep the position
 backgroundRepeat: 'no-repeat', // Add no-repeat

 }}>
           <div className="absolute inset-0 -z-10 animated-aurora-background opacity-90"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="inline-block bg-black/40 p-6 rounded-xl backdrop-blur-sm mb-10">
                <h1 className="text-5xl md:text-7xl font-bold font-serif mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary animate-fade-in" style={{animationDelay: '0.2s'}}>
                  {t('landingTitle')}
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground font-semibold max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.4s'}}>
                  {t('landingSubtitle')}
                </p>
            </div>

            <div className="space-x-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link href="/signup">
                  {t('landingButton')} <UserPlus className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Nossos Oráculos Section */}
        <section className="py-16 sm:py-24 bg-background relative overflow-hidden">
          <div className="absolute inset-0 -z-10 animated-aurora-background opacity-50"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-6 animate-subtle-pulse" />
            <h2 className="text-3xl sm:text-4xl font-bold font-serif mb-4">{t('ourOraclesTitle')}</h2>
            <p className="text-lg font-bold text-muted-foreground mb-12 max-w-2xl mx-auto">{t('ourOraclesSubtitle')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group animated-aurora-background rounded-xl p-6 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 flex flex-col items-center text-center">
                <Brain className="h-10 w-10 text-accent mb-4 transition-transform duration-300 group-hover:rotate-12" />
                <h3 className="text-xl font-bold mb-3">Seu TARÔ</h3>
                <p className="text-lg font-bold text-foreground/80">Carregue sua tiragem de Tarô para obter a Interpretação Mística.</p>
              </div>
              <div className="group animated-aurora-background rounded-xl p-6 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 flex flex-col items-center text-center">
                <Star className="h-10 w-10 text-accent mb-4 transition-transform duration-300 group-hover:rotate-12" />
                <h3 className="text-xl font-bold mb-3">Interpretação de SONHOS</h3>
                <p className="text-lg font-bold text-foreground/80">Descreva seu sonho detalhado para obter Interpretação Profética</p>
              </div>
              <div className="group animated-aurora-background rounded-xl p-6 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 flex flex-col items-center text-center">
                <Users className="h-10 w-10 text-accent mb-4 transition-transform duration-300 group-hover:-translate-y-1" />
                <h3 className="text-xl font-bold mb-3">Símbolos Sagrados</h3>
                <p className="text-lg font-bold text-foreground/80">Desvende diariamente a sabedoria dos símbolos sagrados.</p>
              </div>
            </div>
          </div>
        </section>

        <CustomSeparator />

        {/* Testimonials Section */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 animate-fade-in relative" style={{animationDelay: '0.1s'}}>
              <Users className="h-12 w-12 text-accent mx-auto mb-3" />
               <div className="relative inline-block">
                 <p className="text-4xl font-bold text-primary">
                    {userCount !== null ? `+${userCount.toLocaleString('pt-BR')}` : <Skeleton className="h-10 w-32 inline-block" />}
                 </p>
                 {showPlusOne && (
                    <div className="absolute -top-5 -right-8 text-green-400 font-bold text-3xl animate-float-up pointer-events-none">
                        +
                    </div>
                 )}
               </div>
              <p className="text-lg text-muted-foreground mt-1 font-semibold">
                {t('satisfiedClientsLabel')}
              </p>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-center mb-4 animate-fade-in" style={{animationDelay: '0.2s'}}>{t('testimonialsTitle')}</h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto font-semibold animate-fade-in" style={{animationDelay: '0.3s'}}>{t('testimonialsSubtitle')}</p>
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
                        <AvatarImage src={testimonial.imageSrc} data-ai-hint="person portrait" alt={t(testimonial.nameKey as any)} />
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                          {t(testimonial.nameKey as any).split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Star className="h-6 w-6 text-yellow-400 mx-auto mb-3" />
                      <p className="text-lg italic text-foreground/90 mb-4 font-semibold">"{t(testimonial.quoteKey as any)}"</p>
                      <p className="font-bold text-primary">{t(testimonial.nameKey as any)}</p>
                      <p className="text-sm text-muted-foreground font-medium">{t(testimonial.roleKey as any)}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CustomSeparator />

      {/* Ad Spaces - Placeholders */}
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-200 dark:bg-gray-700 h-32 flex items-center justify-center text-gray-500 dark:text-gray-400 rounded-md font-bold">Ad Space 1</div>
        <div className="bg-gray-200 dark:bg-gray-700 h-32 flex items-center justify-center text-gray-500 dark:text-gray-400 rounded-md font-bold">Ad Space 2</div>
        <div className="bg-gray-200 dark:bg-gray-700 h-32 flex items-center justify-center text-gray-500 dark:text-gray-400 rounded-md font-bold">Ad Space 3</div>
        <div className="bg-gray-200 dark:bg-gray-700 h-32 flex items-center justify-center text-gray-500 dark:text-gray-400 rounded-md font-bold">Ad Space 4</div>
      </div>
      {/* End Ad Spaces */}


      {/* Added the Woman Smoke GIF at the end */}
      <section className="py-16 text-center">
        <img
          src="/img/shiva copy.gif"
          alt="Mystic Smoke Woman GIF"
          className="mx-auto mt-8"
        />
        </section>

        {/* Moved CustomSeparator below the GIF section */}
        <CustomSeparator /> 

        {/* Final CTA Section */}
        <section className="py-20 sm:py-28 text-center bg-primary/10 relative overflow-hidden">
           <div className="absolute inset-0 -z-10 animated-aurora-background opacity-70"></div>
          <div className="container mx-auto px-4 relative z-10">
            <Sparkles className="h-16 w-16 text-accent mx-auto mb-6 animate-subtle-pulse" style={{animationDelay: '0.2s'}}/>
            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
              {t('finalCTATitle')}
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-semibold animate-fade-in" style={{animationDelay: '0.6s'}}>
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
        <p className="text-muted-foreground font-semibold relative z-10">
          {t('footerText', { year: new Date().getFullYear() })}
        </p>
      </footer>
    </div>
  );
}
