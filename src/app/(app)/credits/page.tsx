
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, ShieldCheck, Zap, Gift, Loader2 } from 'lucide-react'; // Gift icon added, Loader2
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { claimFreeCredit } from '@/services/creditService'; // Import claimFreeCredit
import { useState } from 'react';


const USD_TO_BRL_RATE = 5.0; // Fixed conversion rate: 1 USD = 5 BRL

const creditPackagesData = (t: Function) => [
  { id: 4, name: t('freeTrialPack'), credits: 1, priceUSD: 0, description: t('freeTrialPackDescription'), popular: false, icon: <Gift className="h-5 w-5 text-green-500" /> },
  { id: 1, name: t('seekersPack'), credits: 50, priceUSD: 5, description: t('seekersPackDescription'), popular: false, icon: <Zap className="h-5 w-5 text-yellow-500" /> },
  { id: 2, name: t('oraclesBundle'), credits: 120, priceUSD: 10, description: t('oraclesBundleDescription'), popular: true, icon: <Zap className="h-5 w-5 text-orange-500" /> },
  { id: 3, name: t('mysticsTrove'), credits: 250, priceUSD: 20, description: t('mysticsTroveDescription'), popular: false, icon: <Zap className="h-5 w-5 text-purple-500" /> },
];

export default function CreditsPage() {
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const { currentUser, userCredits, refreshCredits } = useAuth(); // Get currentUser and userCredits
  const creditPackages = creditPackagesData(t);
  const [claimingFreeCredit, setClaimingFreeCredit] = useState(false);
  const [purchasingPackageId, setPurchasingPackageId] = useState<number | null>(null);
  const [redirecting, setRedirecting] = useState(false);


  const handlePurchase = async (pkgId: number, isFree: boolean, creditsAmount: number) => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    if (isFree) {
      if (userCredits?.freeCreditClaimed) {
        toast({
          title: t('mysticInsights'),
          description: t('freeCreditAlreadyClaimedToast'), // Add this translation key
          variant: 'default'
        });
        return;
      }
      setClaimingFreeCredit(true);
      const result = await claimFreeCredit(currentUser.uid);
      if (result.success) {
        toast({
          title: t('mysticInsights'),
          description: t('freeCreditClaimedToast', { count: String(creditsAmount) })
        });
        refreshCredits(); // Refresh credits in AuthContext
      } else {
        toast({
          title: t('errorGenericTitle'),
          description: result.message || t('freeCreditClaimFailedToast'), // Add this translation key
          variant: 'destructive'
        });
      }
      setClaimingFreeCredit(false);
    } else {
      // TODO: Implement actual payment gateway integration here.
      // In a real app, you'd typically call a backend function to create a payment intent/checkout session,
      // then redirect the user to the payment provider's hosted page.
      // The link below is for demonstration purposes using a test Stripe link.
      setRedirecting(true);
      let redirectUrl = 'https://buy.stripe.com/test_28E7sLbgO0VobAg4XO6Na00'; // Default for package 1 (Seeker's Pack)
      if (pkgId === 2) {
        redirectUrl = 'https://buy.stripe.com/test_bJecN54Sq7jM8o4cqg6Na01'; // Link for package 2 (Oracle's Bundle)
      }
      if (pkgId === 3) {
        redirectUrl = 'https://buy.stripe.com/test_00w14n98G6fI47O75W6Na02'; // Link for package 3 (Mystic's Trove)
      }
      window.location.href = redirectUrl;
      // Note: The actual addition of credits should happen via a webhook after a successful payment.
      // if (currentUser) {
      //   await addCredits(currentUser.uid, creditsAmount);
      //   refreshCredits();
      // }
      setPurchasingPackageId(null);
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
    <div className="bg-black">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-12">
          <CreditCard className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold font-serif mb-2 text-white">{t('purchaseCreditsTitle')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('purchaseCreditsDescription')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {creditPackages.map((pkg) => (
            <div key={pkg.id} className="relative">
              <div className={`animated-aurora-background rounded-lg ${pkg.popular ? 'p-0.5' : ''}`}>
                <Card className={`shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col z-10 bg-card/80 dark:bg-card/75 backdrop-blur-md h-full ${pkg.popular ? 'border-transparent ring-2 ring-primary/70' : ''}`}>
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
                    <p className={`text-center text-3xl font-semibold ${pkg.priceUSD === 0 ? 'text-green-600 dark:text-green-500' : ''}`}>
                      {getDisplayPrice(pkg.priceUSD)}
                    </p>
                  </CardContent>
                  <CardFooter className="mt-auto">
                    <Button
                      onClick={() => handlePurchase(pkg.id, pkg.priceUSD === 0, pkg.credits)}
                      className="w-full text-lg py-3"
                      variant={'default'}
                      disabled={
                        redirecting || // Disable while redirecting
                        (pkg.priceUSD === 0 && (claimingFreeCredit || !!userCredits?.freeCreditClaimed)) ||
                        (pkg.priceUSD !== 0 && claimingFreeCredit)
                      }
                    >
                      {pkg.priceUSD === 0 && claimingFreeCredit && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                      {(pkg.priceUSD !== 0 && redirecting) && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}

                      {pkg.priceUSD === 0 ? (userCredits?.freeCreditClaimed ? t('freeCreditAlreadyClaimedButton') : t('getItNowButton')) : t('purchaseNowButton')}
                    </Button>
                  </CardFooter>
                  {pkg.id === 1 && ( // Add this condition to only show the Pix button for Pacote do Buscador (id: 1)
                    <CardFooter className="mt-2">
                      <Button
                        onClick={() => { /* Add Pix payment logic here */ }}
                        className="w-full text-lg py-3 animated-aurora-background" // Added animated-aurora-background class
                        variant={'outline'} // Use outline variant for secondary action
                        disabled={claimingFreeCredit || redirecting} // Disable when loading or redirecting
                      >
                        Pagar com Pix
                      </Button>
                    </CardFooter>
                  )}
                  {(pkg.id === 2 || pkg.id === 3) && ( // Add this condition to show the Pix button for Combo do Oráculo (id: 2) and Tesouro do Místico (id: 3)
                    <CardFooter className="mt-2">
                      <Button
                        onClick={() => { /* Add Pix payment logic here */ }}
                        className="w-full text-lg py-3 animated-aurora-background" // Apply same styling as other buttons
                        variant={'outline'} // Use outline variant
                        disabled={claimingFreeCredit || redirecting} // Disable when loading or redirecting
                      >
                        Pagar com Pix

                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </div>
              {pkg.popular && (
                <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-full shadow-lg z-20 transform rotate-12">
                  {t('popularBadge')}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <ShieldCheck className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-serif mb-2 text-white">{t('securePaymentsTitle')}</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Suas transações são protegidas com os mais altos padrões de segurança. Aceitamos pagamentos via Mercado Pago (Pix) e Stripe (Cartões).
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <Image src="/img/download (3).png" alt="Mercado Pago (Pix)" width={100} height={40} className="opacity-90" data-ai-hint="mercado pago pix logo" />
            <Image src="/img/download (4).png" alt="Stripe (Cartões)" width={100} height={40} className="opacity-90" data-ai-hint="stripe cards logo" />
          </div>
          <Image src="/img/download.jpeg" alt="Payment Security Logos" width={300} height={100} className="mx-auto mt-4" data-ai-hint="payment security logos" />
        </div>
        <div className="mt-16 text-center">
          <img src="/img/gato copy.gif" alt="Mystic Cat" className="mx-auto" />
        </div>
      </div>
    </div>
  );
}
