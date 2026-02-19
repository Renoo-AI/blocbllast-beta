import { useState, useCallback } from 'react';
import { SHAPES, type Shape, GRID_SIZE } from '../constants';

type Grid = (string | null)[][];

export const useGameState = (onClearLines?: (count: number) => void) => {
  const [grid, setGrid] = useState<Grid>(() =>
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
  );

  const [shapeBag, setShapeBag] = useState<number[]>([]);

  const getNextShapeIndex = useCallback((currentBag: number[]) => {
    let bag = [...currentBag];
    if (bag.length === 0) {
      bag = SHAPES.map((_, i) => i).sort(() => Math.random() - 0.5);
    }
    const index = bag.pop()!;
    return { index, newBag: bag };
  }, []);

  const [currentPieces, setCurrentPieces] = useState<Shape[]>(() => {
    // Initially the board is empty, so any piece is placeable.
    // Standard shapes always fit in an 8x8 empty grid.
    const bag: number[] = SHAPES.map((_, i) => i).sort(() => Math.random() - 0.5);
    const p1 = SHAPES[bag.pop()!];
    const p2 = SHAPES[bag.pop()!];
    const p3 = SHAPES[bag.pop()!];
    return [p1, p2, p3];
  });

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('blockPuzzle_highScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [lastMoveCleared, setLastMoveCleared] = useState(false);

  const checkGameOver = useCallback((pieces: Shape[], currentGrid: Grid) => {
    if (pieces.length === 0) return false;

    for (const piece of pieces) {
      for (let r = 0; r <= GRID_SIZE - piece.matrix.length; r++) {
        for (let c = 0; c <= GRID_SIZE - piece.matrix[0].length; c++) {
          let canPlace = true;
          for (let pr = 0; pr < piece.matrix.length; pr++) {
            for (let pc = 0; pc < piece.matrix[0].length; pc++) {
              if (piece.matrix[pr][pc] && currentGrid[r + pr][c + pc] !== null) {
                canPlace = false;
                break;
              }
            }
            if (!canPlace) break;
          }
          if (canPlace) return false;
        }
      }
    }
    return true;
  }, []);

  const placePiece = useCallback((pieceIndex: number, row: number, col: number) => {
    const piece = currentPieces[pieceIndex];
    if (!piece) return false;

    // Validate placement
    for (let r = 0; r < piece.matrix.length; r++) {
      for (let c = 0; c < piece.matrix[0].length; c++) {
        if (piece.matrix[r][c]) {
          const targetR = row + r;
          const targetC = col + c;
          if (
            targetR < 0 || targetR >= GRID_SIZE ||
            targetC < 0 || targetC >= GRID_SIZE ||
            grid[targetR][targetC] !== null
          ) {
            return false;
          }
        }
      }
    }

    // Apply placement
    const newGrid = grid.map(r => [...r]);
    let cellsPlaced = 0;
    for (let r = 0; r < piece.matrix.length; r++) {
      for (let c = 0; c < piece.matrix[0].length; c++) {
        if (piece.matrix[r][c]) {
          newGrid[row + r][col + c] = piece.color;
          cellsPlaced++;
        }
      }
    }

    // Check for full lines
    const rowsToClear: number[] = [];
    const colsToClear: number[] = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      if (newGrid[r].every(cell => cell !== null)) rowsToClear.push(r);
    }
    for (let c = 0; c < GRID_SIZE; c++) {
      let full = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        if (newGrid[r][c] === null) {
          full = false;
          break;
        }
      }
      if (full) colsToClear.push(c);
    }

    const clearedCount = rowsToClear.length + colsToClear.length;

    // Clear lines
    rowsToClear.forEach(r => {
      for (let c = 0; c < GRID_SIZE; c++) newGrid[r][c] = null;
    });
    colsToClear.forEach(c => {
      for (let r = 0; r < GRID_SIZE; r++) newGrid[r][c] = null;
    });

    // Update pieces
    const nextPieces = [...currentPieces];
    nextPieces.splice(pieceIndex, 1);

    let finalPieces = nextPieces;
    let newBag = shapeBag;

    if (nextPieces.length === 0) {
      let attempts = 0;
      let validSet = false;
      let tempPieces: Shape[] = [];
      let tempBag = newBag;

      while (!validSet && attempts < 10) {
        const p1 = getNextShapeIndex(tempBag);
        const p2 = getNextShapeIndex(p1.newBag);
        const p3 = getNextShapeIndex(p2.newBag);
        tempPieces = [SHAPES[p1.index], SHAPES[p2.index], SHAPES[p3.index]];

        if (!checkGameOver(tempPieces, newGrid)) {
          validSet = true;
          newBag = p3.newBag;
          finalPieces = tempPieces;
        } else {
          attempts++;
          // If we can't find a valid set after a few tries, just take whatever and let the game end naturally
          // but we try to shuffle the bag more to find something if it exists
          tempBag = [...tempBag].sort(() => Math.random() - 0.5);
        }
      }

      if (!validSet) {
          // Final attempt with fresh bag
          const p1 = getNextShapeIndex(newBag);
          const p2 = getNextShapeIndex(p1.newBag);
          const p3 = getNextShapeIndex(p2.newBag);
          finalPieces = [SHAPES[p1.index], SHAPES[p2.index], SHAPES[p3.index]];
          newBag = p3.newBag;
      }
    }

    // Scoring
    let moveScore = cellsPlaced;
    if (clearedCount > 0) {
      const currentCombo = lastMoveCleared ? combo + 1 : 1;
      const bonus = (clearedCount * 10) * clearedCount * currentCombo;
      moveScore += bonus;
      setCombo(currentCombo);
      setLastMoveCleared(true);
      if (onClearLines) onClearLines(clearedCount);
    } else {
      setLastMoveCleared(false);
      setCombo(0);
    }

    setGrid(newGrid);
    setScore(prev => {
        const next = prev + moveScore;
        setHighScore(current => {
            if (next > current) {
                localStorage.setItem('blockPuzzle_highScore', next.toString());
                return next;
            }
            return current;
        });
        return next;
    });
    setCurrentPieces(finalPieces);
    setShapeBag(newBag);

    if (checkGameOver(finalPieces, newGrid)) {
      setGameOver(true);
    }

    return true;
  }, [grid, currentPieces, shapeBag, lastMoveCleared, combo, getNextShapeIndex, checkGameOver, onClearLines]);

  const resetGame = useCallback(() => {
    const emptyGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    setGrid(emptyGrid);
    setScore(0);
    setGameOver(false);
    setCombo(0);
    setLastMoveCleared(false);

    const bag: number[] = SHAPES.map((_, i) => i).sort(() => Math.random() - 0.5);
    const p1 = SHAPES[bag.pop()!];
    const p2 = SHAPES[bag.pop()!];
    const p3 = SHAPES[bag.pop()!];
    setCurrentPieces([p1, p2, p3]);
    setShapeBag(bag);
  }, []);

  return {
    grid,
    currentPieces,
    score,
    highScore,
    gameOver,
    combo,
    placePiece,
    resetGame
  };
};
