
'use client';

import { icons } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ComponentProps, ElementType } from 'react';

export const gradientMap: Record<string, string> = {
  aurora: 'from-primary via-accent to-secondary',
  sunset: 'from-yellow-400 via-red-500 to-pink-500',
  ocean: 'from-blue-400 via-teal-500 to-green-400',
  forest: 'from-green-400 via-emerald-500 to-teal-600',
  candy: 'from-pink-400 via-rose-400 to-fuchsia-500',
  nightsky: 'from-indigo-400 via-purple-500 to-pink-400',
};

// This list is for displaying options to the user, not for validation.
export const availableIcons = [
  'UserCircle2', 'Gem', 'Sparkles', 'Moon', 'Sun', 'Star', 'Crown', 'Feather', 'Key', 'Scroll', 'Eye', 'BrainCircuit', 'Shield', 'Pyramid', 'Infinity', 'Hexagon', 'Flower', 'Flame', 'Leaf', 'Cat', 'Bird', 'Bot', 'Cloud', 'Dna', 'Fish', 'Ghost', 'Grape', 'Zap', 'Pentagon', 'Rainbow', 'Heart', 'Swords', 'ShieldCheck', 'Skull', 'YinYang', 'Waves', 'Mountain', 'Tornado', 'TreePalm', 'Aperture', 'Atom', 'Anchor', 'Axe', 'Scale', 'Castle', 'Church', 'Clover', 'Coffee', 'Diamond', 'Dice5', 'Droplet', 'Fingerprint', 'Fox', 'Gamepad2', 'Guitar', 'Hammer', 'Headphones', 'Hourglass', 'Lamp', 'Laptop', 'Lighthouse', 'Lock', 'Magnet', 'Map', 'Mouse', 'Music', 'Paintbrush', 'Palette', 'PawPrint', 'Pizza', 'Plane', 'Puzzle', 'Quote', 'Rocket', 'Sailboat', 'Scissors', 'Shell', 'Ship', 'Snail', 'Snowflake', 'Spade', 'Speaker', 'Telescope', 'Tent', 'Ticket', 'TrainTrack', 'Umbrella', 'Wallet', 'Watch', 'Wind', 'Wine', 'Wrench'
];


interface IconAvatarProps extends ComponentProps<'div'> {
  iconName: string | null | undefined;
  gradientName: string | null | undefined;
}

export const IconAvatar = ({ iconName, gradientName, className, ...props }: IconAvatarProps) => {
  // Definitive Fix: This robust logic uses a standard logical OR fallback pattern.
  // It attempts to find the icon by the given name. If the name is falsy (null, undefined, "")
  // OR if the icon lookup results in `undefined` (because the name is invalid),
  // it immediately falls back to a known safe default ('UserCircle2').
  // This ensures `LucideIcon` is always a valid component, preventing the crash.
  const LucideIcon: ElementType = (iconName && icons[iconName as keyof typeof icons]) || icons['UserCircle2'];
    
  // A similar robust fallback for the gradient.
  const gradientClass = (gradientName && gradientMap[gradientName]) || gradientMap['aurora'];

  if (!LucideIcon) {
    // This is an absolute fallback in case the primary fallback fails,
    // which should not happen. It prevents a crash.
    const FallbackIcon = icons['UserCircle2'];
    return (
       <div
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full bg-muted',
          className
        )}
        {...props}
      >
        <div className={cn('h-2/3 w-2/3 bg-gradient-to-br bg-clip-text', gradientClass)}>
          <FallbackIcon
            className="h-full w-full text-transparent"
            strokeWidth={1.5}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted',
        className
      )}
      {...props}
    >
      <div className={cn('h-2/3 w-2/3 bg-gradient-to-br bg-clip-text', gradientClass)}>
        <LucideIcon
          className="h-full w-full text-transparent"
          strokeWidth={1.5}
        />
      </div>
    </div>
  );
};
