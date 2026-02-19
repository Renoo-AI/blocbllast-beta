import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { type Shape } from '../constants';
import { Piece } from './Piece';

interface DraggablePieceProps {
  shape: Shape;
  index: number;
  onDrop: (index: number, row: number, col: number) => boolean;
  onDrag: (preview: { shape: Shape; row: number; col: number } | null) => void;
  boardRef: React.RefObject<HTMLDivElement>;
  gridSize: number;
}

export const DraggablePiece: React.FC<DraggablePieceProps> = ({
  shape,
  index,
  onDrop,
  onDrag,
  boardRef,
  gridSize
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [previewPos, setPreviewPos] = useState<{ row: number; col: number } | null>(null);

  const pieceRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!pieceRef.current) return;

    setIsDragging(true);

    // Calculate size of piece in preview
    const blockSize = 35; // The size in motion.div
    const width = shape.matrix[0].length * blockSize;
    const height = shape.matrix.length * blockSize;

    // Center the piece under the finger/cursor
    setOffset({ x: width / 2, y: height / 2 + 50 });
    setPosition({ x: e.clientX, y: e.clientY });

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    setPosition({ x: e.clientX, y: e.clientY });

    if (!boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const cellSize = boardRect.width / gridSize;

    const pieceX = e.clientX - offset.x;
    const pieceY = e.clientY - offset.y;

    const relX = pieceX - boardRect.left;
    const relY = pieceY - boardRect.top;

    const col = Math.round(relX / cellSize);
    const row = Math.round(relY / cellSize);

    if (
      row >= 0 && row <= gridSize - shape.matrix.length &&
      col >= 0 && col <= gridSize - shape.matrix[0].length
    ) {
      setPreviewPos({ row, col });
      onDrag({ shape, row, col });
    } else {
      setPreviewPos(null);
      onDrag(null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;

    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    if (previewPos) {
      onDrop(index, previewPos.row, previewPos.col);
    }

    setPreviewPos(null);
    onDrag(null);
  };

  return (
    <div className="relative w-full aspect-square flex items-center justify-center">
      <div
        ref={pieceRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="cursor-grab active:cursor-grabbing touch-none z-10 transition-transform hover:scale-110"
      >
        <Piece shape={shape} blockSize={20} />
      </div>

      {isDragging && createPortal(
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ scale: 1, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                left: position.x - offset.x,
                top: position.y - offset.y,
              }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="fixed pointer-events-none z-[999]"
              transition={{ type: 'spring', damping: 25, stiffness: 400, mass: 0.5 }}
            >
              <Piece shape={shape} blockSize={35} />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
