import { useState, useEffect, useCallback } from 'react';
import { GRID_SIZE, SHAPES, type Shape, SCORING } from '../constants';

type Grid = (string | null)[][];

const createEmptyGrid = (): Grid =>
  Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

// Shape bag system
class ShapeBag {
  private bag: Shape[] = [];

  constructor() {
    this.refill();
  }

  private refill() {
    this.bag = [...SHAPES].sort(() => Math.random() - 0.5);
  }

  draw(): Shape {
    if (this.bag.length === 0) {
      this.refill();
    }
    return this.bag.pop()!;
  }
}

const shapeBag = new ShapeBag();

export const useGameState = (onClear?: (count: number) => void) => {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [currentPieces, setCurrentPieces] = useState<(Shape | null)[]>(() => [
    shapeBag.draw(),
    shapeBag.draw(),
    shapeBag.draw(),
  ]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('blockPuzzle_highScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [lastMoveCleared, setLastMoveCleared] = useState(false);

  const generateNewPieces = useCallback(() => {
    const newPieces: Shape[] = [shapeBag.draw(), shapeBag.draw(), shapeBag.draw()];
    setCurrentPieces(newPieces);
    return newPieces;
  }, []);

  const resetGame = useCallback(() => {
    setGrid(createEmptyGrid());
    setScore(0);
    setCombo(0);
    setGameOver(false);
    setLastMoveCleared(false);
    const newPieces = [shapeBag.draw(), shapeBag.draw(), shapeBag.draw()];
    setCurrentPieces(newPieces);
  }, []);

  // Sync high score to localStorage
  useEffect(() => {
    localStorage.setItem('blockPuzzle_highScore', highScore.toString());
  }, [highScore]);

  const canPlacePiece = (matrix: number[][], startRow: number, startCol: number, currentGrid: Grid): boolean => {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] === 1) {
          const targetRow = startRow + r;
          const targetCol = startCol + c;

          if (
            targetRow < 0 || targetRow >= GRID_SIZE ||
            targetCol < 0 || targetCol >= GRID_SIZE ||
            currentGrid[targetRow][targetCol] !== null
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const checkGameOver = useCallback((pieces: (Shape | null)[], currentGrid: Grid) => {
    const remainingPieces = pieces.filter((p): p is Shape => p !== null);
    if (remainingPieces.length === 0) return false;

    for (const piece of remainingPieces) {
      for (let r = 0; r <= GRID_SIZE - piece.matrix.length; r++) {
        for (let c = 0; c <= GRID_SIZE - piece.matrix[0].length; c++) {
          if (canPlacePiece(piece.matrix, r, c, currentGrid)) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const placePiece = (pieceIndex: number, row: number, col: number) => {
    const piece = currentPieces[pieceIndex];
    if (!piece || gameOver) return false;

    if (!canPlacePiece(piece.matrix, row, col, grid)) {
      return false;
    }

    const newGrid = grid.map(r => [...r]);
    let blocksPlaced = 0;

    for (let r = 0; r < piece.matrix.length; r++) {
      for (let c = 0; c < piece.matrix[r].length; c++) {
        if (piece.matrix[r][c] === 1) {
          newGrid[row + r][col + c] = piece.color;
          blocksPlaced++;
        }
      }
    }

    const moveScore = blocksPlaced * SCORING.PLACE_BLOCK;

    const rowsToClear: number[] = [];
    const colsToClear: number[] = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      if (newGrid[r].every(cell => cell !== null)) {
        rowsToClear.push(r);
      }
    }

    for (let c = 0; c < GRID_SIZE; c++) {
      let full = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        if (newGrid[r][c] === null) {
          full = false;
          break;
        }
      }
      if (full) {
        colsToClear.push(c);
      }
    }

    const linesCleared = rowsToClear.length + colsToClear.length;
    let finalMoveScore = moveScore;

    if (linesCleared > 0) {
      rowsToClear.forEach(r => {
        for (let c = 0; c < GRID_SIZE; c++) newGrid[r][c] = null;
      });
      colsToClear.forEach(c => {
        for (let r = 0; r < GRID_SIZE; r++) newGrid[r][c] = null;
      });

      const newCombo = lastMoveCleared ? combo + 1 : 1;
      const lineScore = linesCleared * SCORING.CLEAR_LINE;
      finalMoveScore = Math.floor((moveScore + lineScore) * (1 + (newCombo - 1) * (SCORING.COMBO_MULTIPLIER - 1)));

      setScore(prev => {
        const next = prev + finalMoveScore;
        if (next > highScore) setHighScore(next);
        return next;
      });
      setCombo(newCombo);
      setLastMoveCleared(true);
      if (onClear) onClear(linesCleared);
    } else {
      setScore(prev => {
        const next = prev + moveScore;
        if (next > highScore) setHighScore(next);
        return next;
      });
      setCombo(0);
      setLastMoveCleared(false);
    }

    setGrid(newGrid);

    const newPieces = [...currentPieces];
    newPieces[pieceIndex] = null;

    if (newPieces.every(p => p === null)) {
      const generated = generateNewPieces();
      if (checkGameOver(generated, newGrid)) {
        setGameOver(true);
      }
    } else {
      setCurrentPieces(newPieces);
      if (checkGameOver(newPieces, newGrid)) {
        setGameOver(true);
      }
    }

    return true;
  };

  return {
    grid,
    currentPieces,
    score,
    highScore,
    gameOver,
    combo,
    placePiece,
    resetGame,
  };
};
