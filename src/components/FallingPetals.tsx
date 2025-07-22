// src/components/FallingPetals.tsx
'use client';

import { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';

// New component for dynamic leaf animation
export const FallingPetals = ({ count = 30 }) => {
  const [petals, setPetals] = useState<any[]>([]);

  useEffect(() => {
    const generatePetals = () => {
      const newPetals = Array.from({ length: count }).map((_, i) => ({
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${-10 - (Math.random() * 20)}%`, // Start above the container
          transform: `rotate(${Math.random() * 360}deg) scale(${0.7 + Math.random() * 0.5})`,
          animationDuration: `${8 + Math.random() * 7}s`,
          animationDelay: `${Math.random() * 15}s`,
        },
      }));
      setPetals(newPetals);
    };

    generatePetals();
  }, [count]);

  return (
    <>
      {petals.map(petal => (
        <Leaf
          key={petal.id}
          className="absolute text-pink-400/80 animate-fall-and-fade-petal pointer-events-none"
          style={{ ...petal.style, filter: 'drop-shadow(0 0 5px #ff007f)' }}
        />
      ))}
    </>
  );
};
