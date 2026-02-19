import { GRID_SIZE, type Shape } from '../constants';
import { Block } from './Block';
import { motion, AnimatePresence } from 'framer-motion';

interface BoardProps {
  grid: (string | null)[][];
  boardRef: React.RefObject<HTMLDivElement>;
  preview?: { shape: Shape; row: number; col: number } | null;
}

export const Board: React.FC<BoardProps> = ({ grid, boardRef, preview }) => {
  return (
    <div
      ref={boardRef}
      className="bg-slate-800 p-3 rounded-2xl shadow-2xl relative"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        gap: '6px',
        width: 'min(95vw, 450px)',
        aspectRatio: '1/1',
        perspective: '1000px',
        transform: 'rotateX(5deg)', // Subtle 2.3D perspective
      }}
    >
      {/* Background Slots */}
      {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
        <div
          key={`slot-${i}`}
          className="bg-slate-700/50 rounded-lg shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)]"
          style={{ width: '100%', height: '100%' }}
        />
      ))}

      {/* Actual Blocks */}
      <div
        className="absolute inset-0 p-3 grid"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          gap: '6px',
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence>
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              let previewColor: string | null = null;
              if (preview) {
                const { shape, row: pRow, col: pCol } = preview;
                const rInShape = rowIndex - pRow;
                const cInShape = colIndex - pCol;
                if (
                  rInShape >= 0 && rInShape < shape.matrix.length &&
                  cInShape >= 0 && cInShape < shape.matrix[0].length &&
                  shape.matrix[rInShape][cInShape] === 1
                ) {
                  previewColor = shape.color;
                }
              }

              if (cell) {
                return (
                  <motion.div
                    key={`cell-${rowIndex}-${colIndex}-${cell}`}
                    initial={{ scale: 0, rotateY: 90 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                  >
                    <Block
                      color={cell}
                      className="w-full h-full"
                    />
                  </motion.div>
                );
              } else if (previewColor) {
                return (
                  <div key={`preview-${rowIndex}-${colIndex}`}>
                    <Block
                      color={previewColor}
                      className="w-full h-full"
                      opacity={0.3}
                    />
                  </div>
                );
              } else {
                return <div key={`empty-${rowIndex}-${colIndex}`} />;
              }
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
