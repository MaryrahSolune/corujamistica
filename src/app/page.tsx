'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, LogIn, UserPlus, Loader2 } from 'lucide-react';

export default function HomePage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      router.replace('/dashboard');
    }
  }, [currentUser, loading, router]);

  if (loading || (!loading && currentUser)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading your mystical space...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="py-6">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-serif text-primary">Mystic Insights</span>
          </div>
          <nav className="space-x-2 sm:space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">
                <LogIn className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Login</span>
              </Link>
            </Button>
            <Button asChild>
              <Link href="/signup">
                <UserPlus className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Sign Up</span>
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-3xl">
          <Sparkles className="h-20 w-20 text-primary mx-auto mb-6 animate-pulse" />
          <h1 className="text-5xl md:text-6xl font-bold font-serif mb-6">
            Unlock the Wisdom of the Cards
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10">
            Mystic Insights offers AI-powered interpretations for your Tarot and Cigano card readings, guiding you on your spiritual journey with clarity and depth.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link href="/signup">
                Begin Your Journey <UserPlus className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="mt-16 w-full max-w-4xl">
          <Image 
            src="https://placehold.co/1200x600.png" 
            alt="Mystical collage of tarot cards and celestial imagery" 
            data-ai-hint="tarot cards celestial"
            width={1200} 
            height={600} 
            className="rounded-xl shadow-2xl object-cover"
            priority
          />
        </div>
      </main>

      <footer className="py-8 text-center">
        <p className="text-muted-foreground">
          © {new Date().getFullYear()} Mystic Insights. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
