import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ArrowLeft, Trophy, Volume2, VolumeX } from 'lucide-react';
import { playPopSound } from '../utils/soundUtils';

interface Merge2048Props {
  onBack: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

type Tile = {
  id: number;
  value: number;
  row: number;
  col: number;
  mergedFrom?: Tile[];
};

const GRID_SIZE = 4;

export const Merge2048: React.FC<Merge2048Props> = ({ onBack, soundEnabled, onToggleSound }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('merge2048_highScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(false);

  const getEmptyCells = useCallback((currentTiles: Tile[]) => {
    const cells: { row: number; col: number }[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!currentTiles.some(t => t.row === r && t.col === c)) {
          cells.push({ row: r, col: c });
        }
      }
    }
    return cells;
  }, []);

  const spawnTile = useCallback((currentTiles: Tile[]) => {
    const emptyCells = getEmptyCells(currentTiles);
    if (emptyCells.length === 0) return currentTiles;

    const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newValue = Math.random() < 0.9 ? 2 : 4;

    const newTile: Tile = {
      id: Date.now() + Math.random(), // Using random to ensure unique IDs
      value: newValue,
      row: cell.row,
      col: cell.col,
    };

    return [...currentTiles, newTile];
  }, [getEmptyCells]);

  const initGame = useCallback(() => {
    let newTiles: Tile[] = [];
    newTiles = spawnTile(newTiles);
    newTiles = spawnTile(newTiles);
    setTiles(newTiles);
    setScore(0);
    setGameOver(false);
  }, [spawnTile]);

  useEffect(() => {
    if (tiles.length === 0) {
      initGame();
    }
  }, [tiles.length, initGame]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('merge2048_highScore', score.toString());
    }
  }, [score, highScore]);

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    let moved = false;
    let newScore = score;
    const newTiles: Tile[] = [];
    const mergedIds = new Set<number>();

    // Sort tiles based on direction
    const sortedTiles = [...tiles].sort((a, b) => {
      if (direction === 'up') return a.row - b.row;
      if (direction === 'down') return b.row - a.row;
      if (direction === 'left') return a.col - b.col;
      return b.col - a.col;
    });

    const tempGrid: (Tile | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    tiles.forEach(t => { tempGrid[t.row][t.col] = t; });

    sortedTiles.forEach(tile => {
      let r = tile.row;
      let c = tile.col;
      let nextR = r;
      let nextC = c;

      // Move loop
      while (true) {
        if (direction === 'up') nextR--;
        else if (direction === 'down') nextR++;
        else if (direction === 'left') nextC--;
        else nextC++;

        if (nextR < 0 || nextR >= GRID_SIZE || nextC < 0 || nextC >= GRID_SIZE) break;

        const target = tempGrid[nextR][nextC];
        if (target) {
          if (target.value === tile.value && !mergedIds.has(target.id)) {
            // Merge
            moved = true;
            if (soundEnabled) playPopSound();
            const newTile = { ...tile, row: nextR, col: nextC, value: tile.value * 2 };
            newScore += newTile.value;
            tempGrid[r][c] = null;
            tempGrid[nextR][nextC] = newTile;
            mergedIds.add(newTile.id);
            newTiles.push(newTile);
            return;
          }
          break;
        } else {
          // Slide
          tempGrid[r][c] = null;
          tempGrid[nextR][nextC] = tile;
          r = nextR;
          c = nextC;
          moved = true;
        }
      }
      newTiles.push({ ...tile, row: r, col: c });
    });

    if (moved) {
      const spawedTiles = spawnTile(newTiles);
      setTiles(spawedTiles);
      setScore(newScore);

      // Check game over
      if (getEmptyCells(spawedTiles).length === 0) {
        // No empty cells, check if any merges possible
        let possible = false;
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            const val = spawedTiles.find(t => t.row === r && t.col === c)?.value;
            const neighbors = [
              spawedTiles.find(t => t.row === r - 1 && t.col === c),
              spawedTiles.find(t => t.row === r + 1 && t.col === c),
              spawedTiles.find(t => t.row === r && t.col === c - 1),
              spawedTiles.find(t => t.row === r && t.col === c + 1),
            ];
            if (neighbors.some(n => n && n.value === val)) {
              possible = true;
              break;
            }
          }
          if (possible) break;
        }
        if (!possible) setGameOver(true);
      }
    }
  }, [tiles, score, gameOver, spawnTile, getEmptyCells]);

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') move('up');
      else if (e.key === 'ArrowDown') move('down');
      else if (e.key === 'ArrowLeft') move('left');
      else if (e.key === 'ArrowRight') move('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  // Handle Touch Swipes
  const touchStart = useRef<{ x: number, y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (Math.max(absX, absY) > 30) {
      if (absX > absY) move(dx > 0 ? 'right' : 'left');
      else move(dy > 0 ? 'down' : 'up');
    }
    touchStart.current = null;
  };

  const getTileColor = (value: number) => {
    const colors: Record<number, string> = {
      2: '#3b82f6',
      4: '#10b981',
      8: '#f59e0b',
      16: '#f97316',
      32: '#ef4444',
      64: '#ec4899',
      128: '#8b5cf6',
      256: '#06b6d4',
      512: '#14b8a6',
      1024: '#6366f1',
      2048: '#000000',
    };
    return colors[value] || '#1e293b';
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-[#e2e8f0] p-4 font-sans select-none overflow-hidden text-slate-900"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="w-full max-w-[400px] flex justify-between items-center mb-6">
        <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-lg border-b-4 border-slate-200 text-slate-600 hover:bg-slate-50 active:translate-y-1 active:border-b-0 transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <motion.div
            key={score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="bg-white px-6 py-2 rounded-2xl shadow-lg border-b-4 border-slate-200"
        >
          <span className="text-3xl font-black">{score}</span>
        </motion.div>
        <div className="flex gap-2">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-lg border-b-4 border-slate-200 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-black text-slate-600">{highScore}</span>
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
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Merge 2048</h1>
      </div>

      {/* Game Grid */}
      <div
        className="relative bg-slate-800 p-3 rounded-[32px] shadow-2xl border-b-8 border-slate-900 overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          gap: '12px',
          width: 'min(90vw, 400px)',
          aspectRatio: '1/1',
        }}
      >
        {/* Background cells */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
          <div key={i} className="bg-slate-700/50 rounded-2xl shadow-inner shadow-black/20" />
        ))}

        {/* Foreground tiles */}
        <AnimatePresence>
          {tiles.map((tile) => (
            <motion.div
              key={tile.id}
              layoutId={tile.id.toString()}
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                x: (tile.col * (100 / GRID_SIZE)) + '%',
                y: (tile.row * (100 / GRID_SIZE)) + '%',
              }}
              style={{
                position: 'absolute',
                width: `calc(${100 / GRID_SIZE}% - 12px)`,
                height: `calc(${100 / GRID_SIZE}% - 12px)`,
                margin: '12px 0 0 12px',
                top: 0,
                left: 0,
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <div
                className="w-full h-full rounded-2xl flex items-center justify-center text-white font-black text-2xl"
                style={{
                  backgroundColor: getTileColor(tile.value),
                  boxShadow: `
                    inset 0 3px 0 0 rgba(255, 255, 255, 0.4),
                    inset 0 -6px 0 0 rgba(0, 0, 0, 0.25),
                    0 6px 12px rgba(0, 0, 0, 0.2)
                  `,
                  transform: 'translateY(-2px)'
                }}
              >
                {tile.value}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Game Over Overlay */}
        <AnimatePresence>
            {gameOver && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center"
                >
                    <h2 className="text-5xl font-black text-white mb-4 leading-tight">GRID<br/>LOCKED!</h2>
                    <p className="text-white/80 font-bold mb-8">Score: {score}</p>
                    <button
                        onClick={initGame}
                        className="w-full bg-blue-600 text-white text-2xl font-black py-5 rounded-3xl shadow-[0_8px_0_0_#1e40af] hover:bg-blue-700 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
                    >
                        <RotateCcw className="w-8 h-8" />
                        RETRY
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <div className="mt-8">
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest text-center">
            Swipe to merge blocks!
        </p>
      </div>
    </div>
  );
};
