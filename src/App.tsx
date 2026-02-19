import { useRef, useState, useCallback, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { Board } from './components/Board';
import { PieceSelector } from './components/PieceSelector';
import { GRID_SIZE, type Shape } from './constants';
import { Trophy, RotateCcw, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Home } from './components/Home';
import { FruitMergeGame } from './components/FruitMergeGame';
import { Merge2048 } from './components/Merge2048';
import { EmojiMatch } from './components/EmojiMatch';

type View = 'home' | 'block-puzzle' | 'fruit-merge' | 'merge-2048' | 'emoji-match';

function App() {
  const [view, setView] = useState<View>('home');
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('game_soundEnabled');
    return saved !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('game_soundEnabled', soundEnabled.toString());
  }, [soundEnabled]);

  const handleClear = useCallback((count: number) => {
    if (count >= 1) {
      confetti({
        particleCount: count * 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
        disableForReducedMotion: true
      });
    }
  }, []);

  const {
    grid,
    currentPieces,
    score,
    highScore,
    gameOver,
    combo,
    placePiece,
    resetGame
  } = useGameState(handleClear);

  const boardRef = useRef<HTMLDivElement>(null);
  const [activePreview, setActivePreview] = useState<{ shape: Shape; row: number; col: number } | null>(null);
  const [floatingScores, setFloatingScores] = useState<{ id: number; value: number }[]>([]);
  const lastScore = useRef(score);

  useEffect(() => {
    if (score > lastScore.current) {
      const diff = score - lastScore.current;
      const id = Date.now();
      setFloatingScores(prev => [...prev, { id, value: diff }]);
      setTimeout(() => {
        setFloatingScores(prev => prev.filter(f => f.id !== id));
      }, 1000);
    }
    lastScore.current = score;
  }, [score]);

  const handleDrop = (index: number, row: number, col: number) => {
    const success = placePiece(index, row, col);
    if (success) {
      setActivePreview(null);
    }
    return success;
  };

  if (view === 'home') {
    return <Home onSelectGame={setView} />;
  }

  if (view === 'fruit-merge') {
    return (
      <FruitMergeGame
        onBack={() => setView('home')}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />
    );
  }

  if (view === 'merge-2048') {
    return (
      <Merge2048
        onBack={() => setView('home')}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />
    );
  }

  if (view === 'emoji-match') {
    return (
      <EmojiMatch
        onBack={() => setView('home')}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#e2e8f0] flex flex-col items-center py-6 px-4 overflow-hidden select-none font-sans text-slate-900">
      {/* Header */}
      <div className="w-full max-w-[450px] flex justify-between items-center mb-4">
        <button
          onClick={() => setView('home')}
          className="p-2 bg-white rounded-xl shadow-lg border-b-4 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:translate-y-1 active:border-b-0"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="relative">
          <motion.div
            key={score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="bg-white px-5 py-2 rounded-2xl shadow-lg border-b-4 border-slate-200"
          >
            <span className="text-3xl font-black">{score}</span>
          </motion.div>

          <AnimatePresence>
            {floatingScores.map(fs => (
              <motion.div
                key={fs.id}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -50 }}
                exit={{ opacity: 0 }}
                className="absolute top-0 right-0 text-blue-600 font-black text-2xl pointer-events-none"
              >
                +{fs.value}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex gap-2">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-lg border-b-4 border-slate-200 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="font-black text-slate-600">{highScore}</span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-white rounded-xl shadow-lg border-b-4 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:translate-y-1 active:border-b-0"
          >
            {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
          <button
            onClick={resetGame}
            className="p-2 bg-white rounded-xl shadow-lg border-b-4 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:translate-y-1 active:border-b-0"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Combo Indicator */}
      <div className="h-12 mb-2 flex items-center justify-center">
        <AnimatePresence>
          {combo > 1 && (
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: [1.2, 1], rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-6 py-1.5 rounded-full font-black italic shadow-xl text-xl border-b-4 border-orange-700"
            >
              {combo}X COMBO!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Board */}
      <div className="relative">
        <Board grid={grid} boardRef={boardRef as React.RefObject<HTMLDivElement>} preview={activePreview} />
      </div>

      {/* Piece Selector */}
      <PieceSelector
        pieces={currentPieces}
        onDrop={handleDrop}
        onDrag={setActivePreview}
        boardRef={boardRef as React.RefObject<HTMLDivElement>}
        gridSize={GRID_SIZE}
      />

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-b-8 border-slate-200"
            >
              <h2 className="text-5xl font-black text-slate-800 mb-2 leading-tight">GAME<br/>OVER</h2>
              <div className="my-6">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Final Score</p>
                <p className="text-6xl font-black text-blue-600">{score}</p>
              </div>

              <button
                onClick={resetGame}
                className="w-full bg-blue-600 text-white text-2xl font-black py-5 rounded-3xl shadow-[0_8px_0_0_#1e40af] hover:bg-blue-700 transition-all active:translate-y-1 active:shadow-none flex items-center justify-center gap-3"
              >
                <RotateCcw className="w-8 h-8" />
                RESTART
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto text-slate-400 font-bold text-sm uppercase tracking-widest">
        Block Puzzle 2.3D
      </div>
    </div>
  );
}

export default App;
