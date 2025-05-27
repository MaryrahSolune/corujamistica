// src/components/MysticIcons.tsx
'use client';

import type { SVGProps } from 'react';

export const SunIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
    <circle cx="50" cy="50" r="18" />
    {[...Array(12)].map((_, i) => (
      <line
        key={`sun-ray-${i}`}
        x1="50"
        y1="50"
        x2="50"
        y2="12"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        transform={`rotate(${i * 30} 50 50)`}
      />
    ))}
  </svg>
);

export const MoonIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
    <path d="M 50 10 A 40 40 0 1 0 50 90 A 30 30 0 1 1 50 10 Z" />
  </svg>
);
