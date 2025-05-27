'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, ShieldCheck, Zap } from 'lucide-react';
import Image from 'next/image';

const creditPackages = [
  { id: 1, name: 'Seeker\'s Pack', credits: 10, price: 5, description: 'Perfect for trying out.', popular: false, icon: <Zap className="h-5 w-5 text-yellow-500" /> },
  { id: 2, name: 'Oracle\'s Bundle', credits: 50, price: 20, description: 'Best value for regular users.', popular: true, icon: <Zap className="h-5 w-5 text-orange-500" /> },
  { id: 3, name: 'Mystic\'s Trove', credits: 120, price: 40, description: 'For the dedicated spiritual explorer.', popular: false, icon: <Zap className="h-5 w-5 text-purple-500" /> },
];

export default function CreditsPage() {
  const handlePurchase = (packageId: number) => {
    // Placeholder for payment gateway integration
    alert(`Purchase initiated for package ID: ${packageId}. Payment integration TBD.`);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-12">
        <CreditCard className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold font-serif mb-2">Purchase Credits</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Unlock deeper insights with more readings. Choose a credit package that suits your journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {creditPackages.map((pkg) => (
          <Card key={pkg.id} className={`shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col ${pkg.popular ? 'border-2 border-primary ring-2 ring-primary/50' : ''}`}>
            {pkg.popular && (
              <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
                Popular
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
                <span className="text-muted-foreground"> credits</span>
              </div>
              <p className="text-center text-3xl font-semibold text-accent">
                ${pkg.price.toFixed(2)}
              </p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button onClick={() => handlePurchase(pkg.id)} className="w-full text-lg py-3">
                Purchase Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <ShieldCheck className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold font-serif mb-2">Secure Payments</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          All transactions are securely processed. Your financial information is protected.
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
