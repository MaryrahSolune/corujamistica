// src/components/MesaRealBoard.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, Wand2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ciganoCards } from '@/lib/cigano-cards-data';

export function MesaRealBoard({ onInterpretationReady }: { onInterpretationReady: (screenshotDataUrl: string) => void }) {
  const [deck, setDeck] = useState<typeof ciganoCards>([]);
  const [placedCards, setPlacedCards] = useState<(typeof ciganoCards[0])[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Shuffle the deck once on mount
    setDeck([...ciganoCards].sort(() => Math.random() - 0.5));
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
      const buttonElement = document.getElementById('interpret-button');
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
      <div ref={boardRef} className={cn("relative w-full rounded-lg p-4 sm:p-6 shadow-2xl bg-card")}>
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
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-full h-full object-cover rounded-md"
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
                            <img
                              src={card.image}
                              alt={card.name}
                              className="w-full h-full object-cover rounded-md"
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
         <div className="flex flex-col items-center gap-4">
            <motion.div 
                className="relative w-24 h-36 cursor-pointer group" 
                onClick={handlePlaceCard}
                whileTap={{ scale: 0.95, x: 2, y: 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <div className="absolute w-full h-full bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg transform transition-transform duration-300 group-hover:scale-105"></div>
                <div className="absolute w-full h-full flex items-center justify-center">
                    <Wand2 className="w-8 h-8 text-primary-foreground" />
                </div>
            </motion.div>
            <p className="text-sm text-muted-foreground">Clique no baralho para posicionar as cartas ({deck.length} restantes).</p>
        </div>
      ) : (
        <motion.div
            id="interpret-button"
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
