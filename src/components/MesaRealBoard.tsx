// src/components/MesaRealBoard.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, Wand2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Replace with actual card images later
const placeholderCards = Array.from({ length: 36 }, (_, i) => ({
  id: i + 1,
  image: `https://placehold.co/100x150/1a1a1a/f0e6ff?text=${i + 1}`,
}));

export function MesaRealBoard({ onInterpretationReady }: { onInterpretationReady: (screenshotDataUrl: string) => void }) {
  const [deck, setDeck] = useState<typeof placeholderCards>([]);
  const [placedCards, setPlacedCards] = useState<(typeof placeholderCards[0])[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Shuffle the deck once on mount
    setDeck([...placeholderCards].sort(() => Math.random() - 0.5));
  }, []);

  const handlePlaceCard = () => {
    if (deck.length > 0) {
      const nextCard = deck[0];
      setPlacedCards(prev => [...prev, nextCard]);
      setDeck(prev => prev.slice(1));
    }
  };

  const handleCaptureAndInterpret = async () => {
    if (!boardRef.current) return;
    setIsCapturing(true);

    try {
      // Temporarily hide the 'Interpret' button for the screenshot
      const buttonElement = boardRef.current.querySelector('button');
      if (buttonElement) buttonElement.style.visibility = 'hidden';

      const canvas = await html2canvas(boardRef.current, {
        backgroundColor: '#000000', // Black background to match the theme
        useCORS: true,
        scale: 2, // Increase resolution for better quality
      });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      onInterpretationReady(dataUrl);

      // Show the button again
      if (buttonElement) buttonElement.style.visibility = 'visible';

    } catch (error) {
      console.error('Error capturing board:', error);
    } finally {
        setIsCapturing(false);
    }
  };

  const allCardsPlaced = placedCards.length === 36;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
      <div ref={boardRef} className="relative w-full bg-mesa-real-bg bg-cover bg-center rounded-lg p-4 sm:p-6 shadow-2xl">
        {/* Main 4x8 Grid */}
        <div className="grid grid-cols-8 gap-1 sm:gap-2 w-full mb-1 sm:mb-2">
          {Array.from({ length: 32 }).map((_, index) => {
            const card = placedCards[index];
            const isPlaced = !!card;
            
            return (
              <div key={`slot-${index + 1}`} className="aspect-[2/3] border border-primary/20 rounded-md flex items-center justify-center relative">
                <AnimatePresence>
                {isPlaced && (
                  <motion.div
                    className="absolute w-full h-full"
                    initial={{ opacity: 0, scale: 0.5, y: -200 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    <Image
                      src={card.image}
                      alt={`Carta ${card.id}`}
                      width={100}
                      height={150}
                      className="w-full h-full object-cover rounded-md"
                      crossOrigin="anonymous"
                      unoptimized
                    />
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        
        {/* Bottom 4 cards, centered */}
        <div className="grid grid-cols-8 gap-1 sm:gap-2 w-full">
            <div className="col-span-2"></div> {/* Spacer */}
            {Array.from({ length: 4 }).map((_, index) => {
                 const cardIndex = 32 + index;
                 const card = placedCards[cardIndex];
                 const isPlaced = !!card;
                 return (
                    <div key={`slot-${cardIndex + 1}`} className="aspect-[2/3] border border-primary/20 rounded-md flex items-center justify-center relative">
                       <AnimatePresence>
                        {isPlaced && (
                        <motion.div
                            className="absolute w-full h-full"
                            initial={{ opacity: 0, scale: 0.5, y: -200 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        >
                            <Image
                            src={card.image}
                            alt={`Carta ${card.id}`}
                            width={100}
                            height={150}
                            className="w-full h-full object-cover rounded-md"
                            crossOrigin="anonymous"
                            unoptimized
                            />
                        </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                 )
            })}
             <div className="col-span-2"></div> {/* Spacer */}
        </div>
      </div>
      
      {!allCardsPlaced ? (
        <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Button onClick={handlePlaceCard} disabled={deck.length === 0} size="lg" className="text-lg">
             <Wand2 className="mr-2 h-5 w-5" />
             Colocar Carta ({deck.length} restantes)
          </Button>
          <p className="text-sm text-muted-foreground">Clique para posicionar as cartas no tabuleiro.</p>
        </motion.div>
      ) : (
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