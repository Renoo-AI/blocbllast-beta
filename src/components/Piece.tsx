import { type Shape } from '../constants';
import { Block } from './Block';

interface PieceProps {
  shape: Shape;
  blockSize?: number;
  gap?: number;
  className?: string;
}

export const Piece: React.FC<PieceProps> = ({ shape, blockSize = 30, gap = 2, className = '' }) => {
  return (
    <div
      className={`inline-grid ${className}`}
      style={{
        gridTemplateRows: `repeat(${shape.matrix.length}, ${blockSize}px)`,
        gridTemplateColumns: `repeat(${shape.matrix[0].length}, ${blockSize}px)`,
        gap: `${gap}px`
      }}
    >
      {shape.matrix.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          cell === 1 ? (
            <Block
              key={`${rowIndex}-${colIndex}`}
              color={shape.color}
              size={blockSize}
            />
          ) : (
            <div key={`${rowIndex}-${colIndex}`} style={{ width: blockSize, height: blockSize }} />
          )
        ))
      )}
    </div>
  );
};
