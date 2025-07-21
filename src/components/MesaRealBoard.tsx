
// src/components/MesaRealBoard.tsx
'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { oghamLetters } from '@/lib/ogham-data'; // Reusing ogham data for card info for now
import { Button } from '@/components/ui/button';
import { Loader2, Camera } from 'lucide-react';
import html2canvas from 'html2canvas';

// Using a subset of Ogham data as placeholder for Cigano cards
const baralhoCigano = oghamLetters.slice(0, 36).map((card, index) => ({
  id: index + 1,
  name: card.letter, // Placeholder name
  image: `https://placehold.co/100x150?text=${index + 1}`, // Placeholder image
}));


export function MesaRealBoard({ onInterpretationReady }: { onInterpretationReady: (screenshotDataUrl: string) => void }) {
  const [shuffledDeck, setShuffledDeck] = useState<typeof baralhoCigano>([]);
  const [isDealing, setIsDealing] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Shuffle the deck once on mount
    setShuffledDeck([...baralhoCigano].sort(() => Math.random() - 0.5));
    
    // End dealing animation after a set time
    const timer = setTimeout(() => {
      setIsDealing(false);
    }, 36 * 100 + 1000); // card count * delay + extra buffer

    return () => clearTimeout(timer);
  }, []);

  const handleCaptureAndInterpret = async () => {
    if (!boardRef.current) return;
    setIsCapturing(true);

    try {
      const canvas = await html2canvas(boardRef.current, {
        backgroundColor: '#111', // A background color to avoid transparency issues
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onInterpretationReady(dataUrl);
    } catch (error) {
      console.error('Error capturing board:', error);
      setIsCapturing(false);
    }
    // isLoading state will be managed by the parent page
  };


  return (
    <div className="flex flex-col items-center gap-6">
      <div
        ref={boardRef}
        className="relative grid grid-cols-9 grid-rows-4 gap-2 p-4 rounded-lg bg-black/20"
        style={{ width: '100%', maxWidth: '900px' }}
      >
        <AnimatePresence>
          {shuffledDeck.map((card, index) => (
            <motion.div
              key={card.id}
              className="aspect-[2/3] rounded-md overflow-hidden shadow-lg"
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: 'easeOut' }}
            >
              <img
                src={card.image}
                alt={`Carta ${card.name}`}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {!isDealing && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
        >
            <Button onClick={handleCaptureAndInterpret} disabled={isCapturing} size="lg" className="text-lg">
                {isCapturing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Camera className="mr-2 h-5 w-5" />}
                {isCapturing ? 'Analisando...' : 'Interpretar Mesa Real'}
            </Button>
        </motion.div>
      )}
    </div>
  );
}

