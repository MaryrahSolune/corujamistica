import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex flex-col items-center">
        <Sparkles className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-primary font-serif">Mystic Insights</h1>
        <p className="text-muted-foreground mt-2">Unlock the secrets of your path.</p>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
