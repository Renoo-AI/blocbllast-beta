import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ArrowLeft, Trophy, Volume2, VolumeX } from 'lucide-react';
import { playPopSound, playClearSound } from '../utils/soundUtils';

interface EmojiMatchProps {
  onBack: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

type Card = {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄'];
const GRID_SIZE = 4; // 4x4 = 16 cards (8 pairs)

export const EmojiMatch: React.FC<EmojiMatchProps> = ({ onBack, soundEnabled, onToggleSound }) => {
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [bestMoves, setBestMoves] = useState(() => {
    const saved = localStorage.getItem('emojiMatch_bestMoves');
    return saved ? parseInt(saved, 10) : Infinity;
  });
  const [gameOver, setGameOver] = useState(false);

  const createCards = useCallback(() => {
    const selectedEmojis = EMOJIS.slice(0, (GRID_SIZE * GRID_SIZE) / 2);
    const pairEmojis = [...selectedEmojis, ...selectedEmojis];
    const shuffled = pairEmojis.sort(() => Math.random() - 0.5);

    return shuffled.map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));
  }, []);

  const [cards, setCards] = useState<Card[]>(() => createCards());

  const initGame = useCallback(() => {
    setCards(createCards());
    setFlippedCards([]);
    setMoves(0);
    setGameOver(false);
  }, [createCards]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched || gameOver) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    if (soundEnabled) playPopSound();
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [firstId, secondId] = newFlipped;

      if (cards[firstId].emoji === cards[secondId].emoji) {
        // Match
        if (soundEnabled) playClearSound();
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[firstId].isMatched = true;
            updated[secondId].isMatched = true;

            if (updated.every(c => c.isMatched)) {
              setGameOver(true);
              if (moves + 1 < bestMoves) {
                setBestMoves(moves + 1);
                localStorage.setItem('emojiMatch_bestMoves', (moves + 1).toString());
              }
            }
            return updated;
          });
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[firstId].isFlipped = false;
            updated[secondId].isFlipped = false;
            return updated;
          });
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#e2e8f0] p-4 font-sans select-none overflow-hidden text-slate-900">
      {/* Header */}
      <div className="w-full max-w-[400px] flex justify-between items-center mb-6">
        <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-lg border-b-4 border-slate-200 text-slate-600 hover:bg-slate-50 active:translate-y-1 active:border-b-0 transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="bg-white px-6 py-2 rounded-2xl shadow-lg border-b-4 border-slate-200">
          <span className="text-2xl font-black text-slate-800">Moves: {moves}</span>
        </div>
        <div className="flex gap-2">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-lg border-b-4 border-slate-200 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-black text-slate-600">{bestMoves === Infinity ? '-' : bestMoves}</span>
            </div>
            <button
                onClick={onToggleSound}
                className="p-2 bg-white rounded-xl shadow-lg border-b-4 border-slate-200 text-slate-600 hover:bg-slate-50 active:translate-y-1 active:border-b-0 transition-all"
            >
                {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
        </div>
      </div>

      <div className="mb-4 text-center">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Emoji Match</h1>
      </div>

      {/* Game Grid */}
      <div
        className="grid gap-3 w-full max-w-[400px] aspect-square"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        }}
      >
        {cards.map((card) => (
          <div key={card.id} className="relative w-full h-full perspective-1000">
            <motion.div
              animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
              className="w-full h-full relative transform-style-3d cursor-pointer"
              onClick={() => handleCardClick(card.id)}
            >
              {/* Card Back */}
              <div
                className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-lg border-b-4 border-slate-200 flex items-center justify-center"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-dashed border-slate-200" />
              </div>

              {/* Card Front */}
              <div
                className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-lg border-b-4 border-blue-200 flex items-center justify-center text-4xl"
                style={{ transform: 'rotateY(180deg)' }}
              >
                <div className={card.isMatched ? 'opacity-40 grayscale transition-all' : ''}>
                  {card.emoji}
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl border-b-8 border-slate-200"
            >
              <h2 className="text-4xl font-black text-slate-800 mb-2">CLEARED!</h2>
              <div className="my-6">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Total Moves</p>
                <p className="text-6xl font-black text-blue-600">{moves}</p>
              </div>

              <button
                onClick={initGame}
                className="w-full bg-blue-600 text-white text-2xl font-black py-5 rounded-3xl shadow-[0_8px_0_0_#1e40af] hover:bg-blue-700 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
              >
                <RotateCcw className="w-8 h-8" />
                PLAY AGAIN
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 text-slate-400 font-bold text-xs uppercase tracking-widest text-center">
          Find all matching pairs!
      </div>
    </div>
  );
};
