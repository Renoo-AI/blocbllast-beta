import { type Shape } from '../constants';
import { DraggablePiece } from './DraggablePiece';

interface PieceSelectorProps {
  pieces: (Shape | null)[];
  onDrop: (index: number, row: number, col: number) => boolean;
  onDrag: (preview: { shape: Shape; row: number; col: number } | null) => void;
  boardRef: React.RefObject<HTMLDivElement>;
  gridSize: number;
}

export const PieceSelector: React.FC<PieceSelectorProps> = ({ pieces, onDrop, onDrag, boardRef, gridSize }) => {
  return (
    <div className="flex justify-center items-center gap-4 mt-8 min-h-[140px] w-full max-w-[500px] px-4">
      {pieces.map((piece, index) => (
        <div
          key={index}
          className="flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl p-2 shadow-lg w-full aspect-square max-w-[120px]"
        >
          {piece ? (
            <DraggablePiece
              shape={piece}
              index={index}
              onDrop={onDrop}
              onDrag={onDrag}
              boardRef={boardRef}
              gridSize={gridSize}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
};
