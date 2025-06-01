
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, ShieldCheck, Zap, Gift } from 'lucide-react'; // Gift icon added
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

const USD_TO_BRL_RATE = 5.0; // Fixed conversion rate: 1 USD = 5 BRL

const creditPackagesData = (t: Function) => [ 
  { id: 4, name: t('freeTrialPack'), credits: 7, priceUSD: 0, description: t('freeTrialPackDescription'), popular: false, icon: <Gift className="h-5 w-5 text-green-500" /> },
  { id: 1, name: t('seekersPack'), credits: 10, priceUSD: 5, description: t('seekersPackDescription'), popular: false, icon: <Zap className="h-5 w-5 text-yellow-500" /> },
  { id: 2, name: t('oraclesBundle'), credits: 50, priceUSD: 20, description: t('oraclesBundleDescription'), popular: true, icon: <Zap className="h-5 w-5 text-orange-500" /> },
  { id: 3, name: t('mysticsTrove'), credits: 120, priceUSD: 40, description: t('mysticsTroveDescription'), popular: false, icon: <Zap className="h-5 w-5 text-purple-500" /> },
];

export default function CreditsPage() {
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const creditPackages = creditPackagesData(t);

  const handlePurchase = (pkgId: number, isFree: boolean) => {
    if (isFree) {
      toast({
        title: t('mysticInsights'),
        description: t('freeCreditsClaimedToast') 
      });
    } else {
      toast({
          title: t('mysticInsights'), 
          description: t('purchaseInitiatedToast', { packageId: String(pkgId) }) 
      });
    }
  };

  const getDisplayPrice = (priceUSD: number) => {
    if (priceUSD === 0) {
      return locale === 'pt-BR' ? 'GRÁTIS' : 'FREE';
    }
    if (locale === 'pt-BR') {
      const priceBRL = priceUSD * USD_TO_BRL_RATE;
      return `R$ ${priceBRL.toFixed(2).replace('.', ',')}`;
    }
    return `$${priceUSD.toFixed(2)}`;
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-12">
        <CreditCard className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold font-serif mb-2">{t('purchaseCreditsTitle')}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('purchaseCreditsDescription')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"> {/* Adjusted for 4 items */}
        {creditPackages.map((pkg) => (
          <div key={pkg.id} className={`animated-aurora-background rounded-lg ${pkg.popular ? 'p-0.5' : ''}`}>
            <Card className={`shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col relative z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md h-full ${pkg.popular ? 'border-transparent ring-2 ring-primary/70' : ''}`}>
              {pkg.popular && (
                <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full shadow-lg z-20">
                  {t('popularBadge')}
                </div>
              )}
              <CardHeader className="text-center">
                <div className="mx-auto mb-3 p-3 bg-accent/10 rounded-full w-fit">
                   {pkg.icon}
                </div>
                <CardTitle className="text-2xl font-serif">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-center mb-4">
                  <span className="text-5xl font-bold text-primary">{pkg.credits}</span>
                  <span className="text-muted-foreground"> {t('creditsUnit')}</span>
                </div>
                <p className={`text-center text-3xl font-semibold ${pkg.priceUSD === 0 ? 'text-green-600 dark:text-green-500' : 'text-accent'}`}>
                  {getDisplayPrice(pkg.priceUSD)}
                </p>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button onClick={() => handlePurchase(pkg.id, pkg.priceUSD === 0)} className="w-full text-lg py-3">
                  {pkg.priceUSD === 0 ? t('getItNowButton') : t('purchaseNowButton')}
                </Button>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <ShieldCheck className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold font-serif mb-2">{t('securePaymentsTitle')}</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('securePaymentsDescription')}
        </p>
        <div className="flex justify-center space-x-4 mt-4">
          <Image src="https://placehold.co/60x40.png" data-ai-hint="visa logo" alt="Visa" width={60} height={40} className="opacity-70" />
          <Image src="https://placehold.co/60x40.png" data-ai-hint="mastercard logo" alt="Mastercard" width={60} height={40} className="opacity-70" />
          <Image src="https://placehold.co/60x40.png" data-ai-hint="paypal logo" alt="PayPal" width={60} height={40} className="opacity-70" />
        </div>
      </div>
    </div>
  );
}
