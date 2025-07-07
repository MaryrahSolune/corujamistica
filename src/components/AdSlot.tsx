// src/components/AdSlot.tsx
'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// This is a placeholder component for an ad slot.
// In a real application, you would integrate this with an ad network SDK.
export function AdSlot({
  className,
  id,
}: {
  className?: string;
  id: string;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // In a real scenario, you might initialize an ad here.
    // e.g., adNetwork.loadAd(id);
  }, [id]);

  if (!isClient) {
    return (
      <Skeleton
        className={cn(
          'h-32 w-full',
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex h-32 items-center justify-center rounded-md border border-dashed bg-muted/50 text-sm text-muted-foreground',
        className
      )}
    >
      {/* Using a simple string as a placeholder. */}
      <span>Espaço Publicitário</span>
    </div>
  );
}
