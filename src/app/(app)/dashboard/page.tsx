'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, BookOpen, Lightbulb, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardPage() {
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">
          Welcome, {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Seeker'}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Your mystical journey continues here. Explore your insights and discover new paths.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-serif">New Reading</CardTitle>
            <PlusCircle className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Ready for new insights? Upload your card spread.</p>
            <Button asChild className="w-full">
              <Link href="/new-reading">Start a New Reading</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-serif">Your Credits</CardTitle>
            <CreditCard className="h-6 w-6 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">10</div> {/* Placeholder */}
            <p className="text-xs text-muted-foreground mb-4">
              credits remaining
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/credits">Purchase More Credits</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-serif">Helpful Tips</CardTitle>
            <Lightbulb className="h-6 w-6 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>Focus your intent before a reading.</li>
              <li>Cleanse your space and cards regularly.</li>
              <li>Journal your readings for reflection.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold font-serif mb-4">Recent Readings</h2>
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-8">
              <BookOpen className="h-12 w-12 mb-4" />
              <p className="text-lg">You have no recent readings.</p>
              <p>Start a <Link href="/new-reading" className="text-primary hover:underline">new reading</Link> to see your history here.</p>
            </div>
            {/* Placeholder for actual recent readings list */}
            {/* Example of a reading item (to be populated dynamically later)
            <div className="border-b py-4 last:border-b-0">
              <h3 className="font-semibold">Love Reading - July 20, 2024</h3>
              <p className="text-sm text-muted-foreground truncate">The Lovers, Two of Cups, Ten of Pentacles...</p>
              <Button variant="link" className="p-0 h-auto mt-1">View Details</Button>
            </div>
            */}
          </CardContent>
        </Card>
      </div>

       <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold font-serif mb-4">Discover Your Path</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Mystic Insights uses advanced AI to interpret your Tarot and Cigano card spreads, offering personalized guidance based on ancient wisdom and astrological alignments.
          </p>
          <Image 
            src="https://placehold.co/800x400.png" 
            alt="Mystical Tarot Spread"
            data-ai-hint="tarot cards mystical" 
            width={800} 
            height={400} 
            className="rounded-lg shadow-xl mx-auto"
          />
        </div>
    </div>
  );
}
